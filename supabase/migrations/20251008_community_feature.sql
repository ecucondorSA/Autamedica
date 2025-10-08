-- ============================================================================
-- Community Feature Migration
-- ============================================================================
-- Created: 2025-10-08
-- Purpose: Create tables and policies for patient community feature
-- Tables: community_groups, community_posts, post_reactions, group_memberships
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: community_groups
-- Purpose: Store community groups where patients can join and interact
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.community_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    member_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0,
    icon_url TEXT,
    banner_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_community_groups_slug ON public.community_groups(slug);
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON public.community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_deleted ON public.community_groups(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- TABLE: community_posts
-- Purpose: Store posts created by patients in community groups
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_display_name TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    title TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    reaction_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_group ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_moderation ON public.community_posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_community_posts_deleted ON public.community_posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);

-- ============================================================================
-- TABLE: post_reactions
-- Purpose: Store reactions (likes, hearts, etc.) to community posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'helpful', 'support')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON public.post_reactions(user_id);

-- ============================================================================
-- TABLE: group_memberships
-- Purpose: Track which patients are members of which groups
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(group_id, patient_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_patient ON public.group_memberships(patient_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_status ON public.group_memberships(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: community_groups
-- ============================================================================

-- Allow anyone (including anon) to read public groups
CREATE POLICY "community_groups_select_public" ON public.community_groups
    FOR SELECT
    TO public
    USING (deleted_at IS NULL AND visibility = 'public');

-- Authenticated users can create groups
CREATE POLICY "community_groups_insert_auth" ON public.community_groups
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Group admins can update groups (simplified for now - anyone can update)
CREATE POLICY "community_groups_update_auth" ON public.community_groups
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- POLICIES: community_posts
-- ============================================================================

-- Allow anyone (including anon) to read approved posts
CREATE POLICY "community_posts_select_public" ON public.community_posts
    FOR SELECT
    TO public
    USING (deleted_at IS NULL AND moderation_status = 'approved');

-- Authenticated users can view their own posts regardless of status
CREATE POLICY "community_posts_select_own" ON public.community_posts
    FOR SELECT
    TO authenticated
    USING (author_id = auth.uid());

-- Authenticated users can create posts
CREATE POLICY "community_posts_insert_auth" ON public.community_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());

-- Users can update their own posts
CREATE POLICY "community_posts_update_own" ON public.community_posts
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Users can soft delete their own posts
CREATE POLICY "community_posts_delete_own" ON public.community_posts
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- ============================================================================
-- POLICIES: post_reactions
-- ============================================================================

-- Anyone can view reactions
CREATE POLICY "post_reactions_select_public" ON public.post_reactions
    FOR SELECT
    TO public
    USING (true);

-- Authenticated users can add reactions
CREATE POLICY "post_reactions_insert_auth" ON public.post_reactions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own reactions
CREATE POLICY "post_reactions_delete_own" ON public.post_reactions
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- POLICIES: group_memberships
-- ============================================================================

-- Anyone can view active memberships
CREATE POLICY "group_memberships_select_public" ON public.group_memberships
    FOR SELECT
    TO public
    USING (status = 'active');

-- Authenticated users can join groups
CREATE POLICY "group_memberships_insert_auth" ON public.group_memberships
    FOR INSERT
    TO authenticated
    WITH CHECK (patient_id = auth.uid());

-- Users can update their own membership
CREATE POLICY "group_memberships_update_own" ON public.group_memberships
    FOR UPDATE
    TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to community_groups
DROP TRIGGER IF EXISTS update_community_groups_updated_at ON public.community_groups;
CREATE TRIGGER update_community_groups_updated_at
    BEFORE UPDATE ON public.community_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to community_posts
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Sample community groups
-- ============================================================================

INSERT INTO public.community_groups (name, slug, description, category, is_featured, visibility)
VALUES
    ('Embarazo y Maternidad', 'embarazo-maternidad', 'Espacio para futuras mamás donde compartir experiencias, dudas y apoyo durante el embarazo.', 'Maternidad', true, 'public'),
    ('Salud Mental', 'salud-mental', 'Un espacio seguro para hablar sobre ansiedad, depresión y bienestar emocional.', 'Salud Mental', true, 'public'),
    ('Diabetes y Nutrición', 'diabetes-nutricion', 'Comunidad para personas con diabetes donde compartir recetas, consejos y experiencias.', 'Enfermedades Crónicas', true, 'public'),
    ('Fitness y Ejercicio', 'fitness-ejercicio', 'Motivación y consejos para mantener un estilo de vida activo y saludable.', 'Estilo de Vida', false, 'public'),
    ('Cuidado de Niños', 'cuidado-ninos', 'Padres compartiendo consejos sobre la salud y el bienestar de los más pequeños.', 'Pediatría', false, 'public')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA: Sample posts
-- ============================================================================

DO $$
DECLARE
    group_embarazo UUID;
    group_salud_mental UUID;
    group_diabetes UUID;
BEGIN
    -- Get group IDs
    SELECT id INTO group_embarazo FROM public.community_groups WHERE slug = 'embarazo-maternidad' LIMIT 1;
    SELECT id INTO group_salud_mental FROM public.community_groups WHERE slug = 'salud-mental' LIMIT 1;
    SELECT id INTO group_diabetes FROM public.community_groups WHERE slug = 'diabetes-nutricion' LIMIT 1;

    -- Insert sample posts
    INSERT INTO public.community_posts (group_id, author_id, author_display_name, is_anonymous, title, content, tags, moderation_status, reaction_count)
    VALUES
        (group_embarazo, uuid_generate_v4(), 'María G.', false, '¿Cuándo sentiste las primeras pataditas?', 'Estoy en mi semana 18 y aún no he sentido a mi bebé moverse. ¿Es normal? ¿Cuándo sintieron ustedes las primeras pataditas?', ARRAY['primer-trimestre', 'movimientos'], 'approved', 12),
        (group_embarazo, uuid_generate_v4(), 'Anónimo', true, 'Náuseas matutinas - ¿consejos?', 'Las náuseas no me dejan en paz. He probado de todo: jengibre, galletas saladas, comer poco y frecuente... ¿Qué les funcionó a ustedes?', ARRAY['sintomas', 'nauseas'], 'approved', 8),
        (group_salud_mental, uuid_generate_v4(), 'Anónimo', true, 'Ansiedad durante la pandemia', 'Me cuesta mucho manejar la ansiedad últimamente. ¿Alguien más se siente así? ¿Qué técnicas usan?', ARRAY['ansiedad', 'apoyo'], 'approved', 25),
        (group_diabetes, uuid_generate_v4(), 'Carlos R.', false, 'Receta de pan bajo en carbohidratos', 'Quiero compartir mi receta favorita de pan keto que no afecta mis niveles de glucosa. ¿A alguien le interesa?', ARRAY['recetas', 'keto'], 'approved', 15),
        (group_salud_mental, uuid_generate_v4(), 'Laura M.', false, 'Meditación para principiantes', 'Empecé a meditar hace un mes y ha cambiado mi vida. Si alguien quiere consejos para empezar, aquí estoy!', ARRAY['meditacion', 'mindfulness'], 'approved', 18);
END $$;

-- Update member and post counts
UPDATE public.community_groups SET
    member_count = 156,
    post_count = 2
WHERE slug = 'embarazo-maternidad';

UPDATE public.community_groups SET
    member_count = 243,
    post_count = 2
WHERE slug = 'salud-mental';

UPDATE public.community_groups SET
    member_count = 89,
    post_count = 1
WHERE slug = 'diabetes-nutricion';

UPDATE public.community_groups SET
    member_count = 67,
    post_count = 0
WHERE slug = 'fitness-ejercicio';

UPDATE public.community_groups SET
    member_count = 124,
    post_count = 0
WHERE slug = 'cuidado-ninos';

-- ============================================================================
-- GRANTS: Ensure proper permissions
-- ============================================================================

GRANT SELECT ON public.community_groups TO anon, authenticated;
GRANT INSERT, UPDATE ON public.community_groups TO authenticated;

GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;

GRANT SELECT ON public.post_reactions TO anon, authenticated;
GRANT INSERT, DELETE ON public.post_reactions TO authenticated;

GRANT SELECT ON public.group_memberships TO anon, authenticated;
GRANT INSERT, UPDATE ON public.group_memberships TO authenticated;

-- ============================================================================
-- Migration complete!
-- ============================================================================
