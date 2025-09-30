-- Test fixture: minimal schema for edge cases
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test table with various column types and constraints
CREATE TABLE public.test_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    required_text VARCHAR NOT NULL,
    optional_text VARCHAR,
    has_default_text VARCHAR DEFAULT 'default value',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity NUMERIC(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    tags TEXT[],
    ip_address INET,
    role VARCHAR CHECK (role IN ('admin', 'user', 'guest')) DEFAULT 'user'
);

-- Test table with composite primary key
CREATE TABLE public.test_relations (
    table_id UUID REFERENCES public.test_table(id),
    relation_id UUID NOT NULL,
    relation_type VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (table_id, relation_id)
);

-- Test enum
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');

CREATE TABLE public.test_enums (
    id SERIAL PRIMARY KEY,
    current_mood mood NOT NULL DEFAULT 'ok',
    name VARCHAR NOT NULL
);