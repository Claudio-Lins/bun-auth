-- Script para dropar todas as tabelas do banco de dados
-- Execute este script antes de aplicar as novas migrations

-- Dropar todas as tabelas em ordem (respeitando foreign keys)
DROP TABLE IF EXISTS event_units CASCADE;
DROP TABLE IF EXISTS popcorn_units CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_contacts CASCADE;
DROP TABLE IF EXISTS passkeys CASCADE;
DROP TABLE IF EXISTS passkey CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Alternativa: Dropar todo o schema e recriar (mais rápido)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

