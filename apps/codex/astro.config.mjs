// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://codex.realmofdarkness.test",
  output: "static",
  integrations: [
    starlight({
      title: "Realm of Darkness Codex",
      sidebar: [
        {
          label: "5th Edition",
          items: [
            {
              label: "Vampire: The Masquerade",
              items: [
                {
                  autogenerate: {
                    directory: "../../packages/content/collections/5th/v5",
                  },
                },
              ],
            },
            {
              label: "Werewolf: The Apocalypse",
              items: [
                {
                  autogenerate: {
                    directory: "../../packages/content/collections/5th/w5",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "20th Edition",
          items: [
            {
              label: "Vampire: The Masquerade",
              items: [
                {
                  autogenerate: {
                    directory: "../../packages/content/collections/20th/v20",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Chronicles of Darkness",
          items: [
            {
              label: "Vampire: The Requiem",
              items: [{ autogenerate: { directory: "cod/vtr" } }],
            },
          ],
        },
      ],
    }),
  ],
});
