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
          {/* <Text>or</Text> */}
          {/* <ChakraLink asChild variant="underline" color="yam.500">
            <Link href="#">Log In</Link>
          </ChakraLink> */}
          <Flex m="2" direction="column" align="center" justify="center">
            {/* <Text>Have an access code for an expense group?</Text>
            <ChakraLink variant="underline" color="lime.500" asChild>
              <Link href="#" >
                Click here
              </Link>
            </ChakraLink> */}
          </Flex>
        </Flex>
      </main>
    </Flex>
  );
}
