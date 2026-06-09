import { getEntry } from 'astro:content';

export async function getPodcastCover(): Promise<string> {
  const podcast = await getEntry('podcast', 'config');
  return podcast?.data.coverImage ?? '/images/podcast/coverImage.png';
}

export async function getEpisodeImage(imageUrl?: string): Promise<string> {
  if (imageUrl && imageUrl.length > 0) return imageUrl;
  return getPodcastCover();
}
