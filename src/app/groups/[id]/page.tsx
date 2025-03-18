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
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/utils/apiFetcher";
import { getParticipantsByIds } from "@/utils/participantsApi";
import { getExpensesByIds } from "@/utils/expensesApi";
import { useParams } from 'next/navigation'

import { pickPalette } from "@/components/theme";

export default function Group() {
  const params = useParams();
  const {
    data: expenseGroupData,
    isLoading: expenseGroupLoading,
    error: expenseGroupError,
  } = useSWR(`/api/expenseGroups/${params.id}`, apiFetcher);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [group, setGroup] = useState<Group>(null);

  useEffect(() => {
    console.log("expenseGroupData", expenseGroupData);
    if (expenseGroupData) {
      const expenseGroup = expenseGroupData.data;

      setGroup(expenseGroup);
      getParticipants(expenseGroup.participants);
      getExpenses(expenseGroup.expenses);
      // console.log("participantsFromDB", participantsFromDB);
      async function getParticipants(ids: string[]) {
        try {
          const participants = await getParticipantsByIds(ids);
          setParticipants(participants);
        } catch (error) {
          console.error(`Error fetching participants by ids ${ids}`, error);
        }
      }
      async function getExpenses(ids: string[]) {
        try {
          const expenses = await getExpensesByIds(ids);
          setExpenses(expenses);
        } catch (error) {
          console.error(`Error fetching expenses by ids ${ids}`, error);
        }
      }
    }
  }, [expenseGroupData]);

  const getParticipantInfo = (id: string) => {
    return participants.find((participant) => participant._id === id);
  }

  const showSettlements = () => {
    return <>{participants.map((p) => {
      if (p.transactions.length) {
        return p.transactions.map((t, idx) => {
          const recipient = getParticipantInfo(t.recipientId);
          return <Text key={`${recipient?._id}-${idx}`}>{p.firstName} {p.lastName} &#128073; {recipient?.firstName} {recipient?.lastName}: {t.amount}</Text>
        })
      }
    })}
    </>
  }

  if (expenseGroupError) <div>Failed loading group expense.</div>;

  return (
    <Flex align="center" direction="column" flex="1">
      <Heading py={6} as="h2" textStyle="2xl">
        {group?.title}
      </Heading>
      <Flex direction="column" width="100%" maxW="370px" gap={10}>
        {group?.note && <Flex direction="column" gap={2}>
          <Heading as="h3" fontWeight="light" textStyle="md" color="lime.500">
            Note
          </Heading>
          <Text textStyle="xl">{group?.note}</Text>
        </Flex>}
        <Flex direction="column" gap={4}>
          <Heading as="h3" fontWeight="light" textStyle="md" color="lime.500">
            Participants
          </Heading>
          <Flex justify="center" rowGap={3} columnGap={1} direction="column">
            {participants.length > 0 &&
              participants.map((participant) => {
                return (
                  <HStack key={participant._id as string} gap="4">
                    <Avatar.Root
                      variant="subtle"
                      size="lg"
                      bg={pickPalette(participant._id as string)}
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
                  const paidBy = getParticipantInfo(expense.paidBy.participantId);
                  return (
                    <Accordion.Item key={expense._id as string} value={expense._id as string}>
                      <Accordion.ItemTrigger>
                        <Span>{expense.title}</Span>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent>
                        <Accordion.ItemBody>
                          <Text>Cost: {expense.paidBy.amount}</Text>
                          <Text>Paid by: {paidBy?.firstName} {paidBy?.lastName}</Text>
                          <ul>
                            <Text>Split by:</Text>
                            {expense.splitBy.map((split) => {
                              const participant = getParticipantInfo(split.participantId);
                              return (
                                <li key={split.participantId}>
                                  {participant?.firstName} {participant?.lastName}: {split.amount}
                                </li>
                              );
                            })}
                          </ul>
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
          {showSettlements()}
        </Flex>
      </Flex>
    </Flex>
  );
}
