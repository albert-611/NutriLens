-- NutriLens Database Migration
-- 20261108000007_create_knowledge_and_vector_tables.sql
-- Creates reviewed knowledge documents and vector chunks for grounded RAG nutrition guidance.

-- Knowledge Documents (Public guidelines, literature, and dietary standards)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    source_url TEXT,
    country_code VARCHAR(2) NOT NULL DEFAULT 'BD',
    language_code VARCHAR(10) NOT NULL DEFAULT 'bn',
    population TEXT DEFAULT 'general_adult',
    published_at DATE,
    version TEXT,
    review_status TEXT NOT NULL DEFAULT 'approved' CHECK (review_status IN ('draft', 'reviewed', 'approved')),
    license_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Chunks (Text chunks with pgvector embeddings for similarity retrieval)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    section_or_page TEXT,
    embedding VECTOR(768),
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-004',
    embedding_dimension INTEGER NOT NULL DEFAULT 768,
    embedding_version TEXT NOT NULL DEFAULT 'v1',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector Cosine Similarity Index (HNSW for high-performance approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops);
