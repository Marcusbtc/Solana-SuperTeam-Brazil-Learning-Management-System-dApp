import { defineType, defineArrayMember } from "sanity";

export const contentBlockType = defineType({
  name: "contentBlock",
  title: "Content Block",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Inline code", value: "code" },
        ],
      },
    }),
    defineArrayMember({
      type: "code",
      options: {
        language: "typescript",
        languageAlternatives: [
          { title: "TypeScript", value: "typescript" },
          { title: "JavaScript", value: "javascript" },
          { title: "Rust", value: "rust" },
          { title: "JSON", value: "json" },
          { title: "Bash", value: "bash" },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        },
      ],
    }),
    defineArrayMember({
      type: "file",
      fields: [{ name: "label", title: "Label", type: "string" }],
    }),
  ],
});
