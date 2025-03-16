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
import { Participant, Expense, Transaction } from "@/app/types/interfaces";
import { pickPalette } from "@/components/theme";
import useSWR from "swr";
import { apiFetcher } from "@/utils/apiFetcher";

interface GroupInput {
  title: string;
  note: string;
  participants: number;
  expenses: number;
}

export default function ExpenseGroup() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GroupInput>();

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

  const {
    data: participantsData,
    isLoading: participantsLoading,
    error: participantsError,
  } = useSWR("/api/participants", apiFetcher);
  const {
    data: expensesData,
    isLoading: expensesLoading,
    error: expensesError,
  } = useSWR("/api/expenses", apiFetcher);

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

  const onSubmit: SubmitHandler<GroupInput> = (data) => {
    console.log("Expenses", expenses);
    console.log("Participants", participants);

    splitExpenseGroup();

    // create new group and save to DB
    reset();
    setParticipants([]);
    setExpenses([]);
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

  const splitExpenseGroup = () => {
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
    console.log("Expenses", expenses);
    console.log("Participants", participants);

    const creditors = participants
      .filter((p) => p.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const debtors = participants
      .filter((p) => p.balance < 0)
      .sort((a, b) => a.balance - b.balance);
    console.log("Creditors", creditors);
    console.log("Debtors", debtors);

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

    let balance = 0;
    let j = 0;
    for (let i = 0; i < creditors.length; i++) {
      const creditor = creditors[i];
      console.log("Creditor", creditor);
      for (; j < debtors.length; j++) {
        const debtor = debtors[j];
        console.log("Debtor", debtor);
        balance = creditor.balance + debtor.balance;

        const transaction: Transaction = {
          recipientId: creditor._id,
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
          break;
        }
        // both are settled
        else {
          debtor.balance = 0;
          creditor.balance = 0;
        }
      }
    }

    setParticipants([...debtors, ...creditors]);
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
                        handleUpdateParticipant(participant._id as string);
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
          openParticipantForm={openParticipantForm}
          setOpenParticipantForm={setOpenParticipantForm}
          participantId={selectedParticipantId}
          setExpenses={setExpenses}
          expenses={expenses}
          participants={participants}
        />
      )}
      {openExpenseForm && (
        <ExpenseForm
          setExpenses={setExpenses}
          openExpenseForm={openExpenseForm}
          setOpenExpenseForm={setOpenExpenseForm}
          expenseId={selectedExpenseId}
          participants={participants}
          setParticipants={setParticipants}
        />
      )}
    </Flex>
  );
}
