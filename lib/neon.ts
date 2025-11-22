import { Client } from '@neondatabase/serverless';

declare global {
  // allow global caching in development to avoid too many connections
  // eslint-disable-next-line no-var
  var __neonClient: Client | undefined;
  // flag when we've called connect
  // eslint-disable-next-line no-var
  var __neonConnected: boolean | undefined;
}

const connectionString = process.env.DATABASE_URL || null;

let client: Client | null = null;

if (connectionString) {
  client = global.__neonClient ?? new Client({ connectionString });
  // Attach an error handler to avoid unhandled 'error' events from the client
  // which would crash the Node process in development.
  client.on('error', (err) => {
    // prefer console.error so Next.js logs show up in terminal
    // keep this lightweight to avoid leaking secrets
    // (detailed errors still thrown where awaited)
    // eslint-disable-next-line no-console
    console.error('[neon] client error:', err?.message ?? err)
  })
  // cache client in dev to avoid creating many clients during HMR
  if (process.env.NODE_ENV !== 'production') global.__neonClient = client;
}

export async function ensureConnected() {
  if (!client) throw new Error('DATABASE_URL is not set. Please set process.env.DATABASE_URL');
  if (!global.__neonConnected) {
    try {
      await client.connect();
      global.__neonConnected = true;
    } catch (err) {
      // surface a clear error but prevent the client from emitting an uncaught exception
      // caller routes should still catch and return 500 as appropriate
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new Error(`Neon connection failed: ${String((err as any)?.message ?? err)}`)
    }
  }
}

export default client;
