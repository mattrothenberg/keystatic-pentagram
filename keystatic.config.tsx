import {
  collection,
  component,
  config,
  fields,
  LocalConfig,
  GitHubConfig,
} from "@keystatic/core";

const storage: LocalConfig["storage"] | GitHubConfig["storage"] =
  process.env.NODE_ENV === "development"
    ? { kind: "local" }
    : {
        kind: "github",
        repo: {
          owner: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER!,
          name: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG!,
        },
      };

export default config({
  storage,
  collections: {
    work: collection({
      label: "Work",
      path: "content/work/*/",
      slugField: "slug",
      schema: {
        title: fields.text({ label: "Title" }),
        description: fields.text({ label: "Description" }),
        categories: fields.multiselect({
          label: "Interests",
          options: [
            { label: "Brand Identity", value: "brand-identity" },
            { label: "Book Design", value: "book-design" },
            { label: "Editorial Design", value: "editorial-design" },
            { label: "Typography", value: "typography" },
          ],
          defaultValue: [],
        }),
        thumbnail: fields.image({
          // This will output the images in the "public" directory
          directory: "public/work/thumbs",
          publicPath: "/work/thumbs",
          label: "Thumbnail",
          validation: {
            isRequired: true,
          },
        }),
        slug: fields.text({
          label: "Slug",
          validation: { length: { min: 4 } },
        }),
        content: fields.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          layouts: [
            [1, 1],
            [1, 1, 1],
            [2, 1],
            [1, 2, 1],
          ],
          componentBlocks: {
            something: component({
              label: "Some Component",
              preview: () => null,
              schema: {},
            }),
          },
        }),
        // authors: fields.array(fields.text({ label: "Name" }), {
        //   label: "Authors",
        //   itemLabel: (props) => props.value,
        // }),
      },
    }),
  },
});
