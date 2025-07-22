# GlobalEye News

## Environment Setup

Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_KEY=your_supabase_anon_key
supabaseKey=your_supabase_anon_key
REFRESH_NEWS_TOKEN=your_secret_token
NEXT_PUBLIC_NEWS_API_KEY=...
NEXT_PUBLIC_GNEWS_API_KEY=...
NEXT_PUBLIC_GUARDIAN_KEY=...
NEXT_PUBLIC_MEDIASTACK_KEY=...
```

## News Refresh Endpoint Security
- The endpoint `/api/refresh-all-news` is protected by a token.
- To call it, use:
  - `GET /api/refresh-all-news?token=your_secret_token`
  - Or set header: `x-api-token: your_secret_token`

## System Status Endpoint
- Check `/api/system-status` for DB and environment health.

## Automatic News Update (Cron)
- Use a cron job or external service to call `/api/refresh-all-news?token=your_secret_token` every hour or as needed.

## Error Handling
- Custom 404 and 500 pages are included.
- API errors return clear JSON messages.

## Testing
- Add your own tests in `src/utils/__tests__/` for fetch and save logic.

---
