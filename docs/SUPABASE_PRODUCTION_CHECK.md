# Supabase Production Check

## Required SQL files

Run in Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/schema_phase18_audit_logs.sql`
3. `supabase/schema_phase19_25_usage.sql`

## Environment variables

```env
USE_SUPABASE="true"
ALLOW_MOCK_USER="false"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_SECRET_KEY="..."
```

## Security

- Enable Row Level Security on all user tables.
- Never expose service role key to browser.
- Use backend API routes for privileged writes.
- Test as two users to confirm data isolation.
