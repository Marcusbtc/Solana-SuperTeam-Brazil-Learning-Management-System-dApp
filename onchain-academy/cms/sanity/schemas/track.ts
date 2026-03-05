import { defineType, defineField } from "sanity";

export const trackType = defineType({
  name: "track",
  title: "Track",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", type: "text" }),
  ],
});
