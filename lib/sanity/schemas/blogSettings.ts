import { defineType, defineField } from "sanity";

export const blogSettings = defineType({
  name: "blogSettings",
  title: "Blog Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      initialValue: "Area tory.",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text",
      initialValue: "The heart of Sawaflix. Discover exclusive announcements, cultural stories, and our growing community.",
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
