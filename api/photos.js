import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  try {
    const result = await list({ prefix: 'photos/' });
    const photos = result.blobs.map(blob => {
      const match = blob.pathname.match(/^photos\/day-(\d+)\.webp$/);
      return match ? { day: Number(match[1]), url: blob.url } : null;
    }).filter(Boolean);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({ photos });
  } catch (error) {
    console.error('Blob listing failed:', error);
    return res.status(500).json({ error: 'Could not load photos' });
  }
}
