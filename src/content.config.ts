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
    category: z.string(),
    link: z.url(),
    coverImage: z.string(),
    rssItemLimit: z.number().int().positive().default(50),
    homeItemsPerPage: z.number().int().positive().default(10),
    appLanguage: z.enum(['es', 'en']).default('es'),
  }),
});

// ---------------------------------------------------------------------------
// Schema condicional para el origen del audio
// ---------------------------------------------------------------------------
const audioSourceSchema = z.discriminatedUnion('discriminant', [
  z.object({
    discriminant: z.literal('local'),
    value: z.object({
      file: z.string(),
    }),
  }),
  z.object({
    discriminant: z.literal('s3'),
    value: z.object({
      url: z.url(),
    }),
  }),
]);

// ---------------------------------------------------------------------------
// Colección: Episodios
// ---------------------------------------------------------------------------
const episodes = defineCollection({
  loader: glob({ base: 'src/content/episodes', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
    shortDescription: z.string(),
    imageUrl: z.string(),
    fileSize: z.number().int().nonnegative(),
    duration: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Formato esperado: HH:MM:SS'),
    audioSource: audioSourceSchema,
  }),
});

// ---------------------------------------------------------------------------
// Exportar colecciones
// ---------------------------------------------------------------------------
export const collections = { podcast, episodes };
