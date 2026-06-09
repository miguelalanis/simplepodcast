import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ---------------------------------------------------------------------------
// Singleton: Configuración global del podcast
// ---------------------------------------------------------------------------
const podcast = defineCollection({
  loader: glob({ base: 'src/content/podcast', pattern: '*.json' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    category: z.enum([
      'Arts',
      'Books',
      'Business',
      'Comedy',
      'Education',
      'Fiction',
      'Government',
      'Health & Fitness',
      'History',
      'Kids & Family',
      'Leisure',
      'Music',
      'News',
      'Religion & Spirituality',
      'Science',
      'Society & Culture',
      'Sports',
      'Technology',
      'True Crime',
      'TV & Film',
    ]),
    link: z.url(),
    coverImage: z.string(),
    rssItemLimit: z.number().int().positive().default(50),
    homeItemsPerPage: z.number().int().positive().default(10),
    appLanguage: z.enum(['es', 'en']).default('es'),
    explicit: z.enum(['true', 'false']).default('false'),
    applePodcastId: z.string().optional(),
    spotifyShowId: z.string().optional(),
    youtubeHandle: z.string().optional(),
  }),
});

// ---------------------------------------------------------------------------
// Colección: Episodios
// ---------------------------------------------------------------------------
const episodes = defineCollection({
  loader: glob({ base: 'src/content/episodes', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
    explicit: z.enum(['true', 'false']).default('false'),
    shortDescription: z.string(),
    imageUrl: z.string().optional(),
    fileSize: z.number().int().nonnegative(),
    duration: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Formato esperado: HH:MM:SS'),
    audioSource: z.object({
      url: z.url(),
    }),
  }),
});

// ---------------------------------------------------------------------------
// Exportar colecciones
// ---------------------------------------------------------------------------
export const collections = { podcast, episodes };
