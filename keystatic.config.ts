import { config, collection, singleton, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "SimplePodcast" },
    navigation: {
      Episodios: ["episodes"],
      Configuración: ["podcast"],
    },
  },

  singletons: {
    podcast: singleton({
      label: "Configuración del Podcast",
      path: "src/content/podcast/config",
      format: "json",
      schema: {
        title: fields.text({
          label: "Título del Podcast",
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: "Descripción",
          multiline: true,
          validation: { isRequired: true },
        }),
        author: fields.text({
          label: "Autor",
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: "Categoría iTunes",
          options: [
            { label: "Arts", value: "Arts" },
            { label: "Books", value: "Books" },
            { label: "Business", value: "Business" },
            { label: "Comedy", value: "Comedy" },
            { label: "Education", value: "Education" },
            { label: "Fiction", value: "Fiction" },
            { label: "Government", value: "Government" },
            { label: "Health & Fitness", value: "Health & Fitness" },
            { label: "History", value: "History" },
            { label: "Kids & Family", value: "Kids & Family" },
            { label: "Leisure", value: "Leisure" },
            { label: "Music", value: "Music" },
            { label: "News", value: "News" },
            { label: "Religion & Spirituality", value: "Religion & Spirituality" },
            { label: "Science", value: "Science" },
            { label: "Society & Culture", value: "Society & Culture" },
            { label: "Sports", value: "Sports" },
            { label: "Technology", value: "Technology" },
            { label: "True Crime", value: "True Crime" },
            { label: "TV & Film", value: "TV & Film" },
          ],
          defaultValue: "Technology",
        }),
        link: fields.url({
          label: "URL oficial del Podcast",
          validation: { isRequired: true },
        }),
        coverImage: fields.image({
          label: "Imagen de portada",
          directory: "public/images/podcast",
          publicPath: "/images/podcast",
          validation: { isRequired: true },
        }),
        rssItemLimit: fields.integer({
          label: "Límite de ítems en RSS",
          defaultValue: 50,
          validation: { isRequired: true, min: 1 },
        }),
        homeItemsPerPage: fields.integer({
          label: "Ítems por página en Home",
          defaultValue: 10,
          validation: { isRequired: true, min: 1 },
        }),
        appLanguage: fields.select({
          label: "Idioma de la aplicación",
          options: [
            { label: "Español", value: "es" },
            { label: "English", value: "en" },
          ],
          defaultValue: "es",
        }),
        applePodcastId: fields.text({
          label: "Apple Podcasts ID (opcional)",
          description: "Solo el ID numérico, ej. 1234567890",
        }),
        spotifyShowId: fields.text({
          label: "Spotify Show ID (opcional)",
          description: "Solo el ID alfanumérico después de /show/",
        }),
        youtubeHandle: fields.text({
          label: "YouTube @handle (opcional)",
          description: "Sin el @, ej. salsatec",
        }),
      },
    }),
  },

  collections: {
    episodes: collection({
      label: "Episodios",
      path: "src/content/episodes/*",
      slugField: "title",
      format: { contentField: "content" },
      columns: ["title", "pubDate", "status"],
      schema: {
        title: fields.slug({
          name: {
            label: "Título del Episodio",
            validation: { isRequired: true },
          },
        }),
        pubDate: fields.date({
          label: "Fecha de publicación",
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: "Estado",
          options: [
            { label: "Borrador", value: "draft" },
            { label: "Publicado", value: "published" },
            { label: "Programado", value: "scheduled" },
          ],
          defaultValue: "draft",
        }),
        shortDescription: fields.text({
          label: "Descripción corta (SEO)",
          multiline: true,
          validation: { isRequired: true },
        }),
        imageUrl: fields.image({
          label: "Imagen de carátula",
          directory: "public/images/episodes",
          publicPath: "/images/episodes",
          validation: { isRequired: false },
        }),
        fileSize: fields.integer({
          label: "Tamaño del MP3 (bytes)",
          validation: { isRequired: false, min: 0 },
          defaultValue: 0,
        }),
        duration: fields.text({
          label: "Duración (HH:MM:SS)",
          validation: { isRequired: false },
          defaultValue: "00:00:00",
        }),
        audioSource: fields.object({
          url: fields.url({
            label: "URL del MP3 (S3/CDN)",
            validation: { isRequired: true },
          }),
        }),
        content: fields.mdx({
          label: "Contenido del episodio",
        }),
      },
    }),
  },
});
