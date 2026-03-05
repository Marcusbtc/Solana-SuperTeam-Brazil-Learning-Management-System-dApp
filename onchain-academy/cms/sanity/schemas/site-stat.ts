import { defineType, defineField } from "sanity";

export const siteStatType = defineType({
  name: "siteStat",
  title: "Site Stat",
  type: "document",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "order", type: "number" }),
  ],
});
