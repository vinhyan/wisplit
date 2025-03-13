import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "@/components/ui/provider";
import { Flex, Container } from "@chakra-ui/react";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
  title: "WiSplit",
  description: "Split expenses wisely",
  authors: [{ name: "Vinh Nhan" }],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          <Flex direction="column" minH="100vh">
            <NavBar />
            <Flex
              flex="1"
              direction="column"
              p={4}
              pt="0"
            >
              {children}
            </Flex>
          </Flex>
        </Provider>
      </body>
    </html>
  );
}
