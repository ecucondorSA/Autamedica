'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Shield,
  Search,
  Plus,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { CollapsibleRightPanel } from '@/components/layout/CollapsibleRightPanel'
import { useCommunity } from '@/hooks'

type FilterType = 'all' | 'my-groups' | 'popular' | 'questions'

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Hook de comunidad conectado a Supabase
  const {
    groups,
    posts,
    loading,
    error,
    loadGroups,
    loadPosts,
    createPost: _createPost,
    addReaction: _addReaction,
  } = useCommunity();

  // Cargar datos iniciales
  useEffect(() => {
    loadGroups();
    loadPosts({ sort_by: 'recent' });
  }, []);

  // Actualizar filtros
  useEffect(() => {
    const sortBy = activeFilter === 'popular' ? 'popular' : 'recent';
    loadPosts({ sort_by: sortBy });
  }, [activeFilter]);

  // Helper function para obtener icono por categoría
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      chronic_conditions: '💉',
      mental_health: '🧠',
      pregnancy: '🤰',
      caregivers: '👥',
      lifestyle: '🏃',
      general_support: '❤️'
    };
    return icons[category] || '🏥';
  };

  // Helper function para calcular tiempo relativo
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-100">
      <CollapsibleSidebar />

      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-stone-900">💬 Comunidad</h1>
          <p className="mt-2 text-sm text-stone-600">
            Comparte experiencias y apóyate en otros pacientes
          </p>
        </div>

        {/* Búsqueda y filtros */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar en la comunidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-500 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500">
            <Plus className="h-4 w-4" />
            Nueva publicación
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            label="Todos"
          />
          <FilterButton
            active={activeFilter === 'my-groups'}
            onClick={() => setActiveFilter('my-groups')}
            label="Mis grupos"
          />
          <FilterButton
            active={activeFilter === 'popular'}
            onClick={() => setActiveFilter('popular')}
            label="Populares"
          />
          <FilterButton
            active={activeFilter === 'questions'}
            onClick={() => setActiveFilter('questions')}
            label="Preguntas"
          />
        </div>

        {/* Grupos destacados */}
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">🏷️ Grupos Recomendados</h2>

          {loading && <p className="text-stone-600">Cargando grupos...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.slice(0, 6).map((group) => (
              <GroupCard
                key={group.id}
                name={group.name}
                members={group.member_count}
                icon={getCategoryIcon(group.category)}
                description={group.description}
              />
            ))}
          </div>
        </div>

        {/* Feed de publicaciones */}
        <div className="space-y-4">
          {loading && <p className="text-stone-600">Cargando publicaciones...</p>}

          {posts.length === 0 && !loading && (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
              <p className="text-stone-600 mb-4">Aún no hay publicaciones en esta comunidad</p>
              <button className="btn-primary bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg">
                Crear la primera publicación
              </button>
            </div>
          )}

          {posts.map((post) => {
            const group = groups.find((g) => g.id === post.group_id);
            const timeAgo = getTimeAgo(post.created_at);

            return (
              <PostCard
                key={post.id}
                author={post.author_display_name}
                group={group?.name || 'Grupo desconocido'}
                groupMembers={group?.member_count || 0}
                timeAgo={timeAgo}
                content={post.content}
                type="question"
                likes={post.reaction_count}
                replies={post.comment_count}
                isVerified={false}
              />
            );
          })}
        </div>
      </main>

      <CollapsibleRightPanel context="dashboard" />
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-stone-800 text-white shadow-md'
          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-800'
      }`}
    >
      {label}
    </button>
  )
}

interface GroupCardProps {
  name: string
  members: number
  icon: string
  description: string
}

function GroupCard({ name, members, icon, description }: GroupCardProps) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-4 transition hover:bg-stone-100 hover:border-stone-800 cursor-pointer">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-stone-900">{name}</p>
          <p className="text-xs text-stone-600">
            <Shield className="mr-1 inline-block h-3 w-3" />
            {members.toLocaleString()} miembros
          </p>
        </div>
      </div>
      <p className="text-xs text-stone-600">{description}</p>
      <button className="mt-3 w-full rounded bg-amber-600 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-500">
        Unirse al grupo
      </button>
    </div>
  )
}

interface PostCardProps {
  author: string
  group: string
  groupMembers: number
  timeAgo: string
  content: string
  type: 'question' | 'experience' | 'resource'
  likes: number
  replies: number
  isVerified: boolean
  isDoctor?: boolean
}

function PostCard({
  author,
  group,
  groupMembers,
  timeAgo,
  content,
  type,
  likes,
  replies,
  isVerified,
  isDoctor = false
}: PostCardProps) {
  const typeConfig = {
    question: { icon: '❓', label: 'Pregunta', color: 'text-blue-600 bg-blue-50' },
    experience: { icon: '💪', label: 'Experiencia', color: 'text-green-600 bg-green-50' },
    resource: { icon: '📚', label: 'Recurso', color: 'text-purple-600 bg-purple-50' }
  }

  const config = typeConfig[type]

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition hover:border-stone-800">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200">
            <User className="h-5 w-5 text-stone-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-stone-900">{author}</p>
              {isDoctor && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Médico
                </span>
              )}
              {isVerified && !isDoctor && (
                <CheckCircle2 className="h-4 w-4 text-green-600" title="Usuario verificado" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-stone-600">
              <Shield className="h-3 w-3" />
              <span>{group} ({groupMembers.toLocaleString()} miembros)</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </span>
      </div>

      {/* Contenido */}
      <p className="mb-4 text-sm text-stone-900">{content}</p>

      {/* Acciones */}
      <div className="flex items-center gap-6 text-sm text-stone-600">
        <button className="flex items-center gap-2 transition hover:text-amber-600">
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-2 transition hover:text-amber-600">
          <MessageSquare className="h-4 w-4" />
          <span>{replies} respuestas</span>
        </button>
        <button className="flex items-center gap-2 transition hover:text-amber-600">
          <Bookmark className="h-4 w-4" />
          <span>Guardar</span>
        </button>
        <button className="flex items-center gap-2 transition hover:text-amber-600">
          <Share2 className="h-4 w-4" />
          <span>Compartir</span>
        </button>
      </div>
    </div>
  )
}
