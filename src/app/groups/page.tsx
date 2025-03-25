"use client";
import { Flex, Text, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import NewGroupButton from "@/app/components/NewGroupButton";

export default function GroupsPage() {
  return (
    <Flex align="center" justify="center" direction="column" flex="1">
      <Flex direction="column" align="center" justify="center">
        <NewGroupButton />
        {/* <Text m="2">
          Have an access code?{" "}
          <ChakraLink variant="underline" color="yam.500" asChild>
            <Link href="#" color="yam.500">
              Click here
            </Link>
          </ChakraLink>
        </Text> */}
      </Flex>
    </Flex>
  );
}