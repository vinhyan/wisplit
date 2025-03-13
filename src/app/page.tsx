import { Button, Text, Link as ChakraLink, Flex } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Flex direction="column" align="center" justify="center" flex="1">
      <main>
        <Flex direction="column" align="center" justify="center">
          <Button bgColor="lime.500" rounded="full" minW="150px">
            <Link href="/groups/new">New Expense Group</Link>
          </Button>
          <Text>or</Text>
          <ChakraLink asChild variant="underline" color="yam.500">
            <Link href="#">Log In</Link>
          </ChakraLink>
        </Flex>
      </main>
    </Flex>
  );
}
