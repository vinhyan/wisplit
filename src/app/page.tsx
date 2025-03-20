"use client";
import { Text, Link as ChakraLink, Flex } from "@chakra-ui/react";
import Link from "next/link";
import NewGroupButton from "./components/NewGroupButton";

export default function Home() {
  return (
    <Flex direction="column" align="center" justify="center" flex="1">
      <main>
        <Flex direction="column" align="center" justify="center">
          <NewGroupButton />
          <Text>or</Text>
          <ChakraLink asChild variant="underline" color="yam.500">
            <Link href="#">Log In</Link>
          </ChakraLink>
        </Flex>
      </main>
    </Flex>
  );
}
