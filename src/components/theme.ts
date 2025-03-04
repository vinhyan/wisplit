import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        lime: {
          500: { value: "#B3FF24" },
        },
        yam: {
          500: { value: "#9659FF" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
