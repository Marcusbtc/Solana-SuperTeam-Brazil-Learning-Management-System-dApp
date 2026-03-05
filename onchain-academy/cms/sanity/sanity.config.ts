import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { codeInput } from "@sanity/code-input";
import { schemaTypes } from "./schemas";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "";
const dataset =
  process.env.SANITY_STUDIO_DATASET ??
  process.env.SANITY_DATASET ??
  "production";

export default defineConfig({
  name: "default",
  title: "Superteam Academy CMS",
  projectId,
  dataset,
  plugins: [deskTool(), codeInput()],
  schema: {
    types: schemaTypes,
  },
});
