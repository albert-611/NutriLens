-- NutriLens Database Migration
-- 20261108000001_create_extensions_and_enums.sql
-- Enables required PostgreSQL extensions and shared custom types/enums.

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enumerated types / checks will be applied either as custom types or CHECK constraints.
-- In Supabase, CHECK constraints are generally preferred for flexible schema evolution.
