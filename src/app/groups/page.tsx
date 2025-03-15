"use client";
import { useState } from "react";
import { Flex, Button, Text, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { Group } from "@/app/types/interfaces";

export default function GroupsPage() {''
  const [groups, setGroups] = useState<Group[]>([]);

  return (
    <Flex align="center" justify="center" direction="column" flex="1">
      <Flex direction="column" align="center" justify="center">
        {groups.length > 0 &&
          groups.map((group) => <Text key={group.id}>{group.title}</Text>)}
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
