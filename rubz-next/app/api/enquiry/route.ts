const hits = new Map<string, number[]>(); // per-IP timestamps; in-memory, so per-instance only
const WINDOW_MS = 10 * 60_000;
const MAX_HITS = 5;

const s = (x: unknown, max: number) => (typeof x === 'string' ? x.trim().slice(0, max) : '');

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return Response.json({ error: 'Too many enquiries. Try again later.' }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend success.
  if (s(b.website, 200)) return Response.json({ ok: true });

  const row = {
    name: s(b.name, 80),
    organisation: s(b.organisation, 120),
    event_type: s(b.event_type, 40),
    event_date: /^\d{4}-\d{2}-\d{2}$/.test(s(b.event_date, 10)) ? s(b.event_date, 10) : null,
    city: s(b.city, 80),
    crowd: s(b.crowd, 40),
    notes: s(b.notes, 1000),
    status: 'new',
  };
  if (!row.name) return Response.json({ error: 'Please enter your name.' }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // No database configured yet: log so enquiries aren't silently lost in dev.
    console.log('[enquiry] (Supabase not configured)', row);
    return Response.json({ ok: true, stored: false });
  }

  const res = await fetch(`${url}/rest/v1/enquiries`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    console.error('[enquiry] Supabase insert failed', res.status, await res.text());
    return Response.json({ error: 'Could not save your enquiry. Please DM on Instagram.' }, { status: 502 });
  }
  // TODO: notify Rubz by email / WhatsApp once contact details are confirmed.
  return Response.json({ ok: true, stored: true });
}
