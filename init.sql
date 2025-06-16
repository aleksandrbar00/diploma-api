-- Create the user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'diploma_user') THEN
      CREATE USER diploma_user WITH PASSWORD 'diploma_password' LOGIN;
   END IF;
END
$do$;

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE diploma_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'diploma_db')\gexec

-- Connect to the database
\c diploma_db;

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant all privileges on the database to the postgres user
GRANT ALL PRIVILEGES ON DATABASE diploma_db TO postgres;

-- Grant all privileges on all tables in the database to the postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;

-- Grant all privileges on all sequences in the database to the postgres user
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Set the default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- Update pg_hba.conf to allow connections from the application
ALTER SYSTEM SET listen_addresses = '*';
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
ALTER SYSTEM SET max_connections = '100'; 