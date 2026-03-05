import { defineType, defineField } from "sanity";

export const instructorType = defineType({
  name: "instructor",
  title: "Instructor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "bio", type: "text" }),
    defineField({ name: "avatar", type: "image" }),
    defineField({ name: "social", type: "url" }),
  ],
});
