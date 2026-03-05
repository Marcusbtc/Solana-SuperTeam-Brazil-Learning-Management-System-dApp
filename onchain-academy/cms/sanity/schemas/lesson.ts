import { defineType, defineField } from "sanity";

export const lessonType = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "lessonId",
      type: "string",
      validation: (rule) => rule.required(),
    }),
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
    defineField({ name: "module", type: "string" }),
    defineField({
      name: "lessonType",
      title: "Lesson type",
      type: "string",
      options: { list: ["content", "challenge"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Legacy kind",
      type: "string",
      options: { list: ["reading", "challenge", "video"] },
      hidden: true,
    }),
    defineField({
      name: "contentFormat",
      type: "string",
      options: { list: ["reading", "video"], layout: "radio" },
      hidden: ({ document }) => document?.lessonType !== "content",
    }),
    defineField({
      name: "videoUrl",
      type: "url",
      description:
        "YouTube, Vimeo, or Arweave embed URL (required when format = video)",
      hidden: ({ document }) =>
        document?.lessonType !== "content" ||
        document?.contentFormat !== "video",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as
            | { lessonType?: string; contentFormat?: string }
            | undefined;
          const isVideoLesson =
            doc?.lessonType === "content" && doc.contentFormat === "video";
          if (isVideoLesson && !value) {
            return "videoUrl is required for video lessons";
          }
          return true;
        }),
    }),
    defineField({
      name: "body",
      title: "Lesson content",
      type: "contentBlock",
      hidden: ({ document }) => document?.lessonType !== "content",
    }),
    defineField({
      name: "markdown",
      type: "text",
      title: "Legacy markdown",
      description:
        "Backwards-compatible fallback for renderers that still consume markdown",
    }),
    defineField({ name: "starterCode", type: "text" }),
    defineField({
      name: "language",
      type: "string",
      options: { list: ["rust", "typescript", "json"] },
    }),
    defineField({
      name: "challenge",
      type: "reference",
      to: [{ type: "challenge" }],
      hidden: ({ document }) => document?.lessonType !== "challenge",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { lessonType?: string } | undefined;
          if (doc?.lessonType === "challenge" && !value) {
            return "Challenge reference is required for challenge lessons";
          }
          return true;
        }),
    }),
    defineField({ name: "resources", type: "array", of: [{ type: "file" }] }),
  ],
});
