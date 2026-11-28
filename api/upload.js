import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const day = Number(req.query.day);
  if (!Number.isInteger(day) || day < 0 || day > 40) return res.status(400).send('Invalid day');
  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.startsWith('image/')) return res.status(415).send('Only images are accepted');

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8 * 1024 * 1024) return res.status(413).send('Image is too large (max 8 MB)');
    chunks.push(chunk);
  }
  if (!size) return res.status(400).send('Empty image');

  try {
    const blob = await put(`photos/day-${day}.webp`, Buffer.concat(chunks), {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res.status(200).json({ day, url: blob.url });
  } catch (error) {
    console.error('Blob upload failed:', error);
    return res.status(500).send('Cloud upload failed');
  }
}
