"use client";

import { useState, useEffect } from "react";
import {
  Flex,
  Heading,
  Input,
  Textarea,
  Button,
  Avatar,
  Field,
  Link,
  Em,
  SkeletonCircle,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import ExpenseForm from "@/app/components/ExpenseForm";
import ParticipantForm from "@/app/components/ParticipantForm";
import { Participant, Expense, Transaction, ExpenseGroup } from "@/app/types/interfaces";
import { pickPalette } from "@/components/theme";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/utils/apiFetcher";
import { updateParticipant } from "@/utils/participantsApi";
import { createExpenseGroup } from "@/utils/expenseGroupApi";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import mongoose from "mongoose";

interface GroupFormProps {
  groupId?: string;
}

interface GroupInput {
  title: string;
  note: string;
  participants: number;
  expenses: number;
}

export default function GroupForm({ groupId }: GroupFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GroupInput>();
  const router = useRouter()

  const [openParticipantForm, setOpenParticipantForm] = useState(false);
  const [openExpenseForm, setOpenExpenseForm] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [draftId, setDraftId] = useState(() => uuidv4());

  console.log("draftId", draftId);

  const {
    data: participantsData,
    isLoading: participantsLoading,
    error: participantsError,
  } = useSWR(groupId ? `/api/participants?groupId=${groupId}` : null, apiFetcher);
  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
  } = useSWR(groupId ? `/api/expenses?groupId=${groupId}` : null, apiFetcher);

  // participants and expenses validation
  useEffect(() => {
    setValue("participants", participants.length, {
      shouldTouch: true,
    });
    setValue("expenses", expenses.length, {
      shouldTouch: true,
    });
  }, [setValue, participants, expenses, openParticipantForm, openExpenseForm]);

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

  if (participantsError) {
    return <div>Error loading participants</div>;
  }

  if (expensesError) {
    return <div>Error loading expenses</div>;
  }

  const onSubmit: SubmitHandler<GroupInput> = async (data) => {
    const { title, note } = data;

    try {
      await splitExpenseGroup();

      const newGroupData: ExpenseGroup = {
        title,
        note,
        expenses: expenses.map((expense) => expense._id as string),
        participants: participants.map((participant) => participant._id as string),
      };

      const newExpenseGroup = await createExpenseGroup(newGroupData);
      reset();
      router.push(`/groups/${newExpenseGroup._id}`);

    } catch (error) {
      console.error("Error submitting expense group", error);
    }
  };

  const handleNewParticipant = () => {
    setSelectedParticipantId(null);
    setOpenParticipantForm(true);
  };

  const handleUpdateParticipant = async (participantId: string) => {
    setSelectedParticipantId(participantId);
    setOpenParticipantForm(true);
  };

  const handleNewExpense = () => {
    setSelectedExpenseId(null);
    setOpenExpenseForm(true);
  };

  const handleUpdateExpense = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setOpenExpenseForm(true);
  };

  const splitExpenseGroup = async () => {
    // For each participant:
    //    calculate the total amount paid
    //    calculate the total amount split
    //    calculate the balance
    //       if balance > 0, add to creditors[]
    //       if balance < 0, add to debtors[]
    //       if balance = 0, do nothing
    //
    // Validate: Get sum of creditors and debtors:
    //    if sum of creditors = sum of debtors, proceed to split
    //    if sum of creditors !== sum of debtors, generate error
    //
    // Split:
    //    sort creditor[] descending, debtor[] ascending by balance
    //    loop through creditors and debtors
    //       const balance = creditor.balance - debtor.balance
    //       if balance > 0
    //          => debtor is settled, create transaction for debtor.balance
    //          => update creditor.balance = balance
    //          => update debtor.balance = 0
    //          => creditor[i] stays the same, move to the next debtor[j+1]
    //       if balance < 0
    //          => creditor is settled, create transaction for debtor.balance
    //          => update creditor.balance = 0
    //          => update debtor.balance = balance
    //          => debtor[j] stays the same, move to the next creditor[i+1]
    //       if balance = 0
    //          => creditor and debtor are settled, create transaction for debtor.balance
    //          => update creditor.balance = 0
    //          => update debtor.balance = 0

    // console.log("Expenses", expenses);
    // console.log("Participants", participants);

    const creditors = participants
      .filter((p) => p.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const debtors = participants
      .filter((p) => p.balance < 0)
      .sort((a, b) => a.balance - b.balance);

    const creditorsTotal = creditors.reduce(
      (acc: number, curr: Participant) => acc + curr.balance,
      0
    );
    const debtorsTotal = debtors.reduce(
      (acc: number, curr: Participant) => acc + curr.balance,
      0
    );

    const netBalance = creditorsTotal + debtorsTotal;

    if (netBalance !== 0) {
      throw Error("Net balance is not zero!");
    }
    try {
      let balance = 0;
      let j = 0;
      for (let i = 0; i < creditors.length; i++) {
        const creditor = creditors[i];
        for (; j < debtors.length; j++) {
          const debtor = debtors[j];
          balance = creditor.balance + debtor.balance;

          const transaction: Transaction = {
            recipientId: creditor._id as string,
            amount: Math.abs(debtor.balance),
          };
          debtor.transactions = [...debtor.transactions, transaction];

          // debtor is settled
          if (balance > 0) {
            debtor.balance = 0;
            creditor.balance = balance;
          }
          // creditor is settled
          else if (balance < 0) {
            debtor.balance = balance;
            creditor.balance = 0;
            await updateParticipant(debtor);
            await updateParticipant(creditor);
            break;
          }
          // both are settled
          else {
            debtor.balance = 0;
            creditor.balance = 0;
          }
          await updateParticipant(debtor);
          await updateParticipant(creditor);
        }
      }
    } catch (error) {
      console.error("Error splitting expenses", error);
    }
    mutate("/api/participants");
  };

  return (
    <Flex align="center" direction="column" flex="1">
      <Heading py={6} textStyle="2xl">
        New Expense Group
      </Heading>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: "100%", maxWidth: "370px" }}
      >
        <Flex align="center" direction="column" rowGap={10}>
          <Field.Root invalid={!!errors.title}>
            <Field.Label>Title</Field.Label>
            <Input
              {...register("title", {
                required: "Required",
              })}
            ></Input>
            <Field.ErrorText>
              {errors.title && errors.title.message}
            </Field.ErrorText>
          </Field.Root>
          <Field.Root>
            <Field.Label>Note</Field.Label>
            <Textarea {...register("note")}></Textarea>
          </Field.Root>
          <Field.Root invalid={!!errors.participants}>
            <Field.Label>Participants</Field.Label>
            <Flex
              align="center"
              rowGap={2}
              columnGap={1}
              flexWrap={"wrap"}
              width="full"
            >
              {participantsLoading ? (
                <>
                  <SkeletonCircle variant="pulse" size="12" />
                  <SkeletonCircle variant="pulse" size="12" />
                  <SkeletonCircle variant="pulse" size="12" />
                </>
              ) : (
                participants.length > 0 &&
                participants.map((participant) => {
                  return (
                    <Button
                      key={participant._id}
                      variant="plain"
                      p="0"
                      minW="auto"
                      onClick={() => {
                        const participantId = groupId ? participant._id : participant.localId;
                        handleUpdateParticipant(participantId as string);
                      }}
                    >
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
                    </Button>
                  );
                })
              )}
              <Button
                appearance="none"
                variant="plain"
                p="0"
                minW="auto"
                h="auto"
                w="fit-content"
                onClick={() => handleNewParticipant()}
              >
                <Avatar.Root
                  variant="solid"
                  size="lg"
                  bg="transparent"
                  border="1px solid #E2E8F0"
                >
                  <Avatar.Fallback name="+" color="#E2E8F0" />
                </Avatar.Root>
              </Button>
            </Flex>
            <input
              style={{ display: "none" }}
              // value={participants.length}
              {...register("participants", {
                min: {
                  value: 1,
                  message: "At least 1 participant is required",
                },
              })}
            />
            <Field.ErrorText>
              {errors.participants && errors.participants.message}
            </Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.expenses}>
            <Field.Label>Expenses</Field.Label>
            <Flex justify="center" direction="column" rowGap={4}>
              {participants.length > 0 ? (
                <>
                  {expenses.length > 0 &&
                    expenses.map((expense) => {
                      return (
                        <Link
                          key={expense._id}
                          color="lime.500"
                          textStyle="lg"
                          variant="underline"
                          cursor="pointer"
                          onClick={() => {
                            handleUpdateExpense(expense._id as string);
                          }}
                        >
                          {expense.title}
                        </Link>
                      );
                    })}
                  <Button
                    gap="0"
                    appearance="none"
                    variant="plain"
                    p="0"
                    minW="auto"
                    h="auto"
                    w="fit-content"
                    onClick={() => {
                      handleNewExpense();
                    }}
                  >
                    <Avatar.Root
                      variant="solid"
                      size="lg"
                      bg="transparent"
                      border="1px solid #E2E8F0"
                    >
                      <Avatar.Fallback name="+" color="#E2E8F0" />
                    </Avatar.Root>
                  </Button>
                </>
              ) : (
                <Em color="gray">Participants list is empty</Em>
              )}
            </Flex>
            <input
              style={{ display: "none" }}
              // value={expenses.length}
              {...register("expenses", {
                min: {
                  value: 1,
                  message: "At least 1 expense is required",
                },
              })}
            />
            <Field.ErrorText>
              {errors.expenses && errors.expenses.message}
            </Field.ErrorText>
          </Field.Root>
          <Button
            disabled={Object.keys(errors).length > 0}
            type="submit"
            bgColor="lime.500"
            rounded="full"
            width="100%"
            maxWidth="150px"
            loading={isSubmitting}
          >
            Split
          </Button>
        </Flex>
      </form>

      {openParticipantForm && (
        <ParticipantForm
          setParticipants={setParticipants}
          participants={participants}
          openParticipantForm={openParticipantForm}
          setOpenParticipantForm={setOpenParticipantForm}
          participantId={selectedParticipantId}
          setExpenses={setExpenses}
          expenses={expenses}
          groupId={groupId}
        />
      )}
      {openExpenseForm && (
        <ExpenseForm
          // setExpenses={setExpenses}
          openExpenseForm={openExpenseForm}
          setOpenExpenseForm={setOpenExpenseForm}
          expenseId={selectedExpenseId}
          participants={participants}
        // setParticipants={setParticipants}
        />
      )}
    </Flex>
  );
}
