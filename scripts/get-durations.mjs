import { parseBuffer } from 'music-metadata';

const urls = [
  { file: '1-arrancando.mdx', url: 'https://podcast.miguelalanis.com/prettyjohn1-podcast-interview-intro-music-499240.mp3' },
  { file: '2-el-stack.mdx', url: 'https://podcast.miguelalanis.com/prettyjohn1-podcast-486808.mp3' },
  { file: '3-lanzamiento-de-la-beta.mdx', url: 'https://podcast.miguelalanis.com/bombinsound-podcast-interview-intro-music-490524.mp3' },
];

for (const { file, url } of urls) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`HTTP ${res.status} for ${url}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await parseBuffer(buf, { mimeType: 'audio/mpeg', size: buf.length });
  const s = Math.round(meta.format.duration ?? 0);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  console.log(`${file}: ${s}s = ${h}:${m}:${sec}`);
}
