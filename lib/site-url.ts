// Centralised, trailing-slash-safe accessor for NEXT_PUBLIC_SITE_URL.
// A trailing slash on the env var (e.g. set in Vercel as "https://example.com/")
// would otherwise double up into "//" wherever it's concatenated with a path.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
