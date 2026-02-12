// Type declarations for Deno runtime (Supabase Edge Functions)
// These allow VS Code's TypeScript server to understand Deno APIs
// without needing the Deno extension installed.

declare namespace Deno {
  function serve(handler: (req: Request) => Response | Promise<Response>): void

  namespace env {
    function get(key: string): string | undefined
  }
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export { createClient, SupabaseClient } from '@supabase/supabase-js'
}
