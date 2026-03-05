import { defineType, defineField } from "sanity";

export const courseType = defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    defineField({
      name: "courseId",
      type: "string",
      validation: (rule) => rule.required(),
    }),
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
    defineField({ name: "summary", type: "text" }),
    defineField({ name: "description", type: "text" }),
    defineField({
      name: "coverImage",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "difficulty",
      type: "string",
      options: { list: ["beginner", "intermediate", "advanced"] },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "durationMinutes", type: "number" }),
    defineField({ name: "xpTotal", type: "number" }),
    defineField({
      name: "track",
      type: "reference",
      to: [{ type: "track" }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "trackId", type: "string" }),
    defineField({
      name: "instructor",
      type: "reference",
      to: [{ type: "instructor" }],
    }),
    defineField({
      name: "editorialStatus",
      title: "Editorial status",
      type: "string",
      options: { list: ["draft", "published"], layout: "radio" },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      hidden: ({ document }) => document?.editorialStatus !== "published",
    }),
    defineField({
      name: "modules",
      type: "array",
      of: [{ type: "reference", to: [{ type: "module" }] }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});
