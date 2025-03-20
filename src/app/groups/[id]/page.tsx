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
  SkeletonCircle, Skeleton, DataList, Table
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Participant, Expense, ExpenseGroup } from "@/app/types/interfaces";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/utils/apiFetcher";
import { getParticipantsByIds } from "@/utils/participantsApi";
import { getExpensesByIds } from "@/utils/expensesApi";
import { useParams } from 'next/navigation'

import { pickPalette } from "@/components/theme";

const defaultGroup: ExpenseGroup = {
  title: "",
  note: "",
  participants: [],
  expenses: [],
}

export default function Group() {
  const params = useParams();
  const expenseGroupId = params.id as string;
  const {
    data: expenseGroupData,
    isLoading: expenseGroupLoading,
    error: expenseGroupError,
  } = useSWR(`/api/expenseGroups/${expenseGroupId}`, apiFetcher);
  const {
    data: participantsData,
    isLoading: participantsLoading,
    error: participantsError,
  } = useSWR(`/api/participants?groupId=${expenseGroupId}`, apiFetcher);

  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
  } = useSWR(`/api/expenses?groupId=${expenseGroupId}`, apiFetcher);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [group, setGroup] = useState<ExpenseGroup>(defaultGroup);

  useEffect(() => {
    console.log("expenseGroupData", expenseGroupData);
    if (expenseGroupData) {
      const expenseGroup = expenseGroupData.data;
      setGroup(expenseGroup);
      // getParticipants(expenseGroup.participants);
      // getExpenses(expenseGroup.expenses);
      // // console.log("participantsFromDB", participantsFromDB);
      // async function getParticipants(ids: string[]) {
      //   try {
      //     const participants = await getParticipantsByIds(ids);
      //     setParticipants(participants);
      //   } catch (error) {
      //     console.error(`Error fetching participants by ids ${ids}`, error);
      //   }
      // }
      // async function getExpenses(ids: string[]) {
      //   try {
      //     const expenses = await getExpensesByIds(ids);
      //     setExpenses(expenses);
      //   } catch (error) {
      //     console.error(`Error fetching expenses by ids ${ids}`, error);
      //   }
      // }
    }
  }, [expenseGroupData]);

    useEffect(() => {
      console.log("participantsData", participantsData);
      if (participantsData) {
        setParticipants(participantsData.data);
      }
    }, [participantsData]);
  
    useEffect(() => {
      if (expensesData) {
        setExpenses(expensesData.data);
      }
    }, [expensesData]);

  const getParticipantInfo = (id: string) => {
    return participants.find((participant) => participant._id === id);
  }

  const showSettlements = () => {
    return (
      <Table.Root interactive>
        <Table.Body >{participants.map((p) => {
          if (p.transactions.length) {
            return p.transactions.map((t, idx) => {
              const recipient = getParticipantInfo(t.recipientId);
              return (
                <Table.Row key={`${recipient?._id}-${idx}`}>
                  <Table.Cell>{p.firstName} {p.lastName}</Table.Cell>
                  <Table.Cell>&#128073;</Table.Cell>
                  <Table.Cell>{recipient?.firstName} {recipient?.lastName}</Table.Cell>
                  <Table.Cell>$ {t.amount}</Table.Cell>
                </Table.Row>)
            })
          }
        })}
        </Table.Body>
      </Table.Root>
    )
  }

  if (expenseGroupError) <div>Failed loading group expense.</div>;

  return (
    <Flex align="center" direction="column" flex="1">
      <Heading py={6} as="h2" textStyle="2xl">
        {group?.title}
      </Heading>
      <Flex direction="column" width="100%" maxW="370px" gap={10}>
        {group?.note &&
          <Flex direction="column" gap={2}>
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
            {expenseGroupLoading ?
              <>
                <HStack gap="5">
                  <SkeletonCircle size="12" />
                  <Stack flex="1">
                    <Skeleton height="5" />
                    <Skeleton height="5" width="80%" />
                  </Stack>
                </HStack>
                <HStack gap="5">
                  <SkeletonCircle size="12" />
                  <Stack flex="1">
                    <Skeleton height="5" />
                    <Skeleton height="5" width="80%" />
                  </Stack>
                </HStack>
                <HStack gap="5">
                  <SkeletonCircle size="12" />
                  <Stack flex="1">
                    <Skeleton height="5" />
                    <Skeleton height="5" width="80%" />
                  </Stack>
                </HStack>
              </>
              :
              <>{
                participants.length > 0 &&
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
                          {participant.transactions.length > 0 ? "Debtor" : "Creditor"}
                        </Text>
                      </Stack>
                    </HStack>
                  );
                })
              }</>}
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
                          <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                            <DataList.Item pt="4">
                              <DataList.ItemLabel>Cost:</DataList.ItemLabel>
                              <DataList.ItemValue>$ {expense.paidBy.amount}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item pt="4">
                              <DataList.ItemLabel>Paid by:</DataList.ItemLabel>
                              <DataList.ItemValue>{paidBy?.firstName} {paidBy?.lastName}</DataList.ItemValue>
                            </DataList.Item>
                            <DataList.Item pt="4">
                              <DataList.ItemLabel>Split by:</DataList.ItemLabel>
                              <DataList.Root orientation="horizontal" divideY="1px" maxW="md">
                                {expense.splitBy.map((split) => {
                                  const participant = getParticipantInfo(split.participantId);
                                  return (
                                    <DataList.Item pt="4" key={split.participantId}>
                                      <DataList.ItemLabel>
                                        {participant?.firstName} {participant?.lastName}:
                                      </DataList.ItemLabel>
                                      <DataList.ItemValue>$ {split.amount}</DataList.ItemValue>
                                    </DataList.Item>
                                  );
                                })}
                              </DataList.Root>
                            </DataList.Item>
                          </DataList.Root>
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
