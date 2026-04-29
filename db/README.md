# Database migrations (Neon / Postgres)

Starter schema for the research library platform is in `001_initial_platform.sql`. It mirrors the entity list in `logs/prd-badgerskope-research-library-platform.md` Part III §7.1.

Apply manually (for example `psql "$DATABASE_URL" -f db/001_initial_platform.sql`) until a migrate runner is added.
