import { defineType, defineField } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
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
      type: "text",
    }),
  ],
});
