// Netlify scheduled function — runs daily (see netlify.toml schedule).
// Calls the app's own archive endpoint with the CRON_SECRET so messages
// older than 7 days are moved into JSON chat history.

export default async () => {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!base) {
    console.error('[archive-chats] No site URL available.');
    return new Response('no site url', { status: 500 });
  }
  const res = await fetch(`${base}/api/messages/archive`, {
    method: 'POST',
    headers: { 'x-cron-key': process.env.CRON_SECRET || '' },
  });
  const json = await res.json().catch(() => null);
  console.log('[archive-chats]', res.status, JSON.stringify(json));
  return new Response(JSON.stringify(json), { status: res.status });
};
