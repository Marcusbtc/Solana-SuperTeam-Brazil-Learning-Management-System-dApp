import { defineType, defineField } from "sanity";

export const partnerLogoType = defineType({
  name: "partnerLogo",
  title: "Partner Logo",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      type: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "url", type: "url" }),
  ],
});
