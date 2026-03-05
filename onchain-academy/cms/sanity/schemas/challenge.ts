import { defineType, defineField } from "sanity";

export const challengeType = defineType({
  name: "challenge",
  title: "Challenge",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "prompt", type: "text" }),
    defineField({ name: "starterCode", type: "text" }),
    defineField({
      name: "language",
      type: "string",
      options: { list: ["rust", "typescript", "json"] },
    }),
    defineField({ name: "expectedOutput", type: "text" }),
  ],
});
