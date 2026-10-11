import { defineType, defineField } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
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
    }),
    defineField({
      name: "color",
      title: "Color (Hex)",
      type: "string",
      description: "e.g. #E50914",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "object",
      fields: [
        { name: "en", type: "text", title: "Description (English)" },
        { name: "fr", type: "text", title: "Description (Français)" },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "slug.current",
    },
  },
});
