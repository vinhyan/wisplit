"use client";
// import { useState } from "react";
import { Flex, Button, Text, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";

export default function GroupsPage() {
  return (
    <Flex align="center" justify="center" direction="column" flex="1">
      <Flex direction="column" align="center" justify="center">
        <Button size="lg" mx="4" rounded="full" bgColor="lime.500" asChild>
          <Link href="/groups/new">New Expense Group</Link>
        </Button>
        <Text m="2">
          Have an access code?{" "}
          <ChakraLink variant="underline" color="yam.500" asChild>
            <Link href="#" color="yam.500">
              Click here
            </Link>
          </ChakraLink>
        </Text>
      </Flex>
    </Flex>
  );
}
