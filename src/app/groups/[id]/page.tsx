"use client";

import {
  Text,
  Heading,
  Flex,
  Avatar,
  HStack,
  Stack,
  Accordion,
  Span,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Participant, Expense, Group } from "@/app/types/interfaces";

import { pickPalette } from "@/components/theme";

export default function GroupExpense() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [group, setGroup] = useState<Group>();

  useEffect(() => {
    setParticipants([
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        paidExpenses: [],
        splitExpenses: [],
        balance: 0,
        paidTotal: 0,
        splitTotal: 0,
        transactions: [],
      },
      {
        id: "2",
        firstName: "Peter",
        lastName: "Lee",
        paidExpenses: [],
        splitExpenses: [],
        balance: 0,
        paidTotal: 0,
        splitTotal: 0,
        transactions: [],
      },
    ]);
  }, []);

  useEffect(() => {
    setExpenses([
      {
        id: "3",
        title: "Expense 1",
        note: "Note 1",
        paidBy: { participantId: "1", amount: 100 },
        splitBy: [
          { participantId: "1", amount: 50 },
          { participantId: "2", amount: 50 },
        ],
      },
      {
        id: "4",
        title: "Expense 2",
        note: "Note 2",
        paidBy: { participantId: "2", amount: 200 },
        splitBy: [
          { participantId: "1", amount: 100 },
          { participantId: "2", amount: 100 },
        ],
      },
    ]);
  }, []);

  return (
    <Flex align="center" direction="column" flex="1">
      <Heading py={6} as="h2" textStyle="2xl">
        Group Expense Title
      </Heading>
      <Flex direction="column" width="100%" maxW="370px" gap={10}>
        <Flex direction="column" gap={2}>
          <Heading as="h3" fontWeight="light" textStyle="md" color="lime.500">
            Note
          </Heading>
          <Text textStyle="xl">Some note</Text>
        </Flex>
        <Flex direction="column" gap={4}>
          <Heading as="h3" fontWeight="light" textStyle="md" color="lime.500">
            Participants
          </Heading>
          <Flex justify="center" rowGap={3} columnGap={1} direction="column">
            {participants.length > 0 &&
              participants.map((participant) => {
                return (
                  <HStack key={participant.id} gap="4">
                    <Avatar.Root
                      variant="subtle"
                      size="lg"
                      bg={pickPalette(participant.id)}
                    >
                      <Avatar.Fallback
                        color="black"
                        name={`${participant.firstName} ${participant.lastName}`}
                      />
                    </Avatar.Root>
                    <Stack gap="0">
                      <Text fontWeight="medium">{`${participant.firstName} ${participant.lastName}`}</Text>
                      <Text color="fg.muted" textStyle="sm">
                        Test
                      </Text>
                    </Stack>
                  </HStack>
                );
              })}
          </Flex>
        </Flex>
        <Flex direction="column" gap={2}>
          <Heading as="h3" fontWeight="light" textStyle="md" color="lime.500">
            Expenses
          </Heading>

          <Flex justify="center" rowGap={3} columnGap={1} direction="column">
            <Accordion.Root multiple defaultValue={["b"]}>
              {expenses.length > 0 &&
                expenses.map((expense) => {
                  return (
                    <Accordion.Item key={expense.id} value={expense.id}>
                      <Accordion.ItemTrigger>
                        <Span>{expense.title}</Span>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          Cost: {expense.paidBy.amount}
                          Paid by: {expense.paidBy.participantId}
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  );
                })}
            </Accordion.Root>
          </Flex>
        </Flex>
        <Flex direction="column" gap={2}>
          <Heading as="h3" fontWeight="light" textStyle="md" color="lime.500">
            Settlements
          </Heading>
        </Flex>
      </Flex>
    </Flex>
  );
}
