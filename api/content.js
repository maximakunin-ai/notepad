import { put, list } from '@vercel/blob';

const KEY = 'content/trip-calendar.json';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const result = await list({ prefix: KEY });
      const blob = result.blobs.find(item => item.pathname === KEY);
      if (!blob) return res.status(200).json({ content: null });
      const response = await fetch(blob.url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not read saved content');
      return res.status(200).json({ content: await response.json() });
    }

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Invalid content payload' });
      }
      const raw = JSON.stringify(body);
      if (Buffer.byteLength(raw, 'utf8') > 200 * 1024) {
        return res.status(413).json({ error: 'Content is too large' });
      }
      await put(KEY, raw, {
        access: 'public',
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).send('Method not allowed');
  } catch (error) {
    console.error('Trip content API error:', error);
    return res.status(500).json({ error: 'Could not sync trip content' });
  }
}
