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

const colorPalette = [
  "#FFE4D6",
  "#FDFFE4",
  "#EAD6FF",
  "#D6FFEB",
  "#EAD6FF",
  "#D6F9FF",
  "#FFF0D6",
  "#D6FFF4",
  "#FFD6EB",
  "#D6E4FF",
  "#EBFFD6",
  "#FFD6F4",
];

export const pickPalette = (id: string) => {
  const index = id.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
};

