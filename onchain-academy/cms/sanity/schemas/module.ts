import { defineType, defineField } from "sanity";

export const moduleType = defineType({
  name: "module",
  title: "Module",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      type: "number",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "lessons",
      type: "array",
      of: [{ type: "reference", to: [{ type: "lesson" }] }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});
