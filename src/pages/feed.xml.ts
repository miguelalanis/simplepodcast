import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { getEpisodeImage } from '../lib/images';

export const prerender = true;

/** Convierte una Date a formato RFC 2822 (requerido por RSS). */
function toRssDate(date: Date): string {
  return date.toUTCString();
}

/** Escapa caracteres especiales XML. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Envuelve texto en CDATA. */
function cdata(str: string): string {
  return `<![CDATA[${str}]]>`;
}

export const GET: APIRoute = async () => {
  const podcastEntry = await getEntry('podcast', 'config');
  if (!podcastEntry) {
    return new Response('Podcast config not found', { status: 500 });
  }

  const podcast = podcastEntry.data;
  const baseUrl = podcast.link.replace(/\/$/, '');
  const selfHref = `${baseUrl}/feed.xml`;

  // Episodios publicados, ordenados por fecha desc, limitados por rssItemLimit
  const allEpisodes = await getCollection('episodes', ({ data }) => data.status === 'published');
  const sorted = allEpisodes.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  const episodes = podcast.rssItemLimit > 0
    ? sorted.slice(0, podcast.rssItemLimit)
    : sorted;

  const latestPubDate = episodes.length > 0
    ? toRssDate(episodes[0].data.pubDate)
    : toRssDate(new Date());

  const coverImageUrl = podcast.coverImage.startsWith('http')
    ? podcast.coverImage
    : `${baseUrl}${podcast.coverImage}`;

  // --- Construir XML ---
  const items = await Promise.all(episodes.map(async (episode) => {
    const { title, pubDate, shortDescription, imageUrl, fileSize, duration, audioSource } = episode.data;
    const audioUrl = audioSource.url;

    const resolvedImage = await getEpisodeImage(imageUrl);
    const episodeImageUrl = resolvedImage.startsWith('http')
      ? resolvedImage
      : `${baseUrl}${resolvedImage}`;

    const episodeLink = `${baseUrl}/episodes/${episode.id}`;
    const guid = `${baseUrl}/episodes/${episode.id}`;

    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(episodeLink)}</link>
      <guid isPermaLink="true">${escapeXml(guid)}</guid>
      <pubDate>${toRssDate(pubDate)}</pubDate>
      <description>${cdata(shortDescription)}</description>
      <itunes:summary>${cdata(shortDescription)}</itunes:summary>
      <enclosure url="${escapeXml(audioUrl)}" length="${fileSize}" type="audio/mpeg" />
      <itunes:duration>${escapeXml(duration)}</itunes:duration>
      <itunes:image href="${escapeXml(episodeImageUrl)}" />
      <itunes:explicit>no</itunes:explicit>
    </item>`;
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${cdata(podcast.description)}</description>
    <language>${podcast.appLanguage === 'es' ? 'es-ES' : 'en-US'}</language>
    <pubDate>${latestPubDate}</pubDate>
    <lastBuildDate>${toRssDate(new Date())}</lastBuildDate>
    <atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />
    <itunes:author>${escapeXml(podcast.author)}</itunes:author>
    <itunes:explicit>no</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <itunes:category text="${escapeXml(podcast.category)}" />
    <itunes:image href="${escapeXml(coverImageUrl)}" />
    <image>
      <url>${escapeXml(coverImageUrl)}</url>
      <title>${escapeXml(podcast.title)}</title>
      <link>${escapeXml(baseUrl)}</link>
    </image>
${items.join('\n')}
  </channel>
</rss>`;

  const lastModified = episodes.length > 0
    ? episodes[0].data.pubDate
    : new Date();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Vary': 'Accept-Encoding',
      'Last-Modified': lastModified.toUTCString(),
    },
  });
};
