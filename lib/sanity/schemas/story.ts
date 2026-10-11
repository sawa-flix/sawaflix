import { defineType, defineField } from "sanity";

export const story = defineType({
  name: "story",
  title: "Story",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "object",
      fields: [
        { name: "en", type: "string", title: "Title (English)" },
        { name: "fr", type: "string", title: "Titre (Français)" },
      ],
      validation: (Rule) => Rule.required().custom((value: any) => {
        if (!value?.en) return "English title is required";
        return true;
      }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "object",
      fields: [
        { name: "en", type: "text", title: "Excerpt (English)", rows: 3 },
        { name: "fr", type: "text", title: "Extrait (Français)", rows: 3 },
      ],
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "readTime",
      title: "Read Time",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "likes",
      title: "Likes",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "views",
      title: "Views",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "Optional: Add a Supabase Storage URL (Recommended) or a YouTube URL to display a video.",
    }),
    defineField({
      name: "body",
      title: "Body Content",
      type: "object",
      fields: [
        {
          name: "en",
          type: "array",
          title: "Content (English)",
          of: [{ type: "block" }, { type: "image" }],
        },
        {
          name: "fr",
          type: "array",
          title: "Contenu (Français)",
          of: [{ type: "block" }, { type: "image" }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      media: "mainImage",
      subtitle: "category.title",
    },
  },
});
