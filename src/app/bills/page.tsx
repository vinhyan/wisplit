"use client";
import { Flex, Button, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function BillsPage() {
  return (
    <Flex align="center" justify="center" direction="column" minH={"100vh"}>
      <Button size="lg" mx="4" rounded="full" bgColor="lime.500" asChild>
        <Link href="/bills/form">Create a New Bill</Link>
      </Button>
      <Text m="2">
        Have an access code?{" "}
        <Link href="#" color="yam.500">
          Click here
        </Link>
      </Text>
    </Flex>
  );
}
