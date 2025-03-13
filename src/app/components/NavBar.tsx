import { Heading, Highlight, Link as ChakraLink, Flex } from "@chakra-ui/react";
import Link from "next/link";

export default function NavBar() {
  return (
    <Flex justify="center" p={4} align="center">
      <Heading as="h1" textStyle="3xl" fontWeight="light">
        <ChakraLink
          asChild
          variant="plain"
          gap="0"
          _hover={{ textDecoration: "none" }}
        >
          <Link href="/">
            Wi
            <Highlight query="Split" styles={{ color: "lime.500" }}>
              Split
            </Highlight>
          </Link>
        </ChakraLink>
      </Heading>
    </Flex>
  );
}
