import { defineType, defineField } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "role", type: "string" }),
    defineField({
      name: "quote",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "avatar", type: "image" }),
  ],
});
