import { del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).send('Method not allowed');
  const day = Number(req.query.day);
  if (!Number.isInteger(day) || day < 0 || day > 40) return res.status(400).send('Invalid day');
  try {
    await del(`photos/day-${day}.webp`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Blob delete failed:', error);
    return res.status(500).send('Cloud delete failed');
  }
}
