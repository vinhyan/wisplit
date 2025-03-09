"use client";

import { useEffect, useState } from "react";

import {
  Flex,
  Heading,
  // Fieldset,
  Input,
  Textarea,
  // NativeSelect,
  // NativeSelectField,
  Button,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useForm, SubmitHandler } from "react-hook-form";

import ExpenseForm from "@/app/components/ExpenseForm";
import ParticipantForm from "@/app/components/ParticipantForm";
import SplitResult from "@/app/components/SplitResult";
import {
  Participant,
  Expense,
  SplitDetail,
  PaymentDetail,
  Transaction,
} from "@/app/types/interfaces";

interface BillFormInput {
  title: string;
  note: string;
  participants: Participant[];
  expenses: ExpenseFormInput[];
}

interface ExpenseFormInput {
  title: string;
  note: string;
  cost: number;
  paidBy: string; // participant id
  splitBy: string[];
}

const defaultParticipant: Participant = {
  id: "",
  firstName: "",
  lastName: "",
  paidExpenses: [],
  splitExpenses: [],
  balance: 0,
  paidTotal: 0,
  splitTotal: 0,
  transactions: [],
  transactionsTotal: 0,
};

const defPaymentDetail = {
  participantId: "",
  amount: 0,
};

const defaultExpense: Expense = {
  id: "",
  title: "",
  note: "",
  paidBy: defPaymentDetail,
  splitBy: [],
};

export default function BillForm() {
  const { register, control, handleSubmit, reset } = useForm<BillFormInput>();

  const [openParticipantForm, setOpenParticipantForm] = useState(false);
  const [openExpenseForm, setOpenExpenseForm] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant>(defaultParticipant);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] =
    useState<Expense>(defaultExpense);

  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);

  // const [creditors, setCreditors] = useState<Participant[]>([]);
  // const [debtors, setDebtors] = useState<Participant[]>([]);

  useEffect(() => {
    console.log("Expenses state updated!", expenses);
  }, [expenses]);

  const onSubmit: SubmitHandler<BillFormInput> = (data) => {
    console.log(data);
    // For each participant:
    //    calculate the total amount paid
    //    calculate the total amount split
    //    calculate the balance
    //       if balance > 0, add to creditors[]
    //       if balance < 0, add to debtors[]
    //       if balance = 0, do nothing
    //
    // Get sum of creditors and debtors:
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
    //          => creditor is settled (no need transaction)
    //          => update creditor.balance = 0
    //          => update debtor.balance = balance
    //          => debtor[j] stays the same, move to the next creditor[i+1]
    //       if balance = 0
    //          => creditor and debtor are settled, create transaction for debtor.balance
    //          => update creditor.balance = 0
    //          => update debtor.balance = 0
    console.log("Expenses", expenses);
    console.log("Participants", participants);
  };

  const handleNewParticipant = () => {
    setSelectedParticipant(defaultParticipant);
    console.log("New Participant", selectedParticipant);
    setOpenParticipantForm(true);
  };

  const handleUpdateParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setOpenParticipantForm(true);
  };

  const handleNewExpense = () => {
    setSelectedExpense(defaultExpense);
    setOpenExpenseForm(true);
  };

  const handleUpdateExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenExpenseForm(true);
  };

  const handleSplit = () => {
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
    // setCreditors(newCreditors);
    // setDebtors(newDebtors);

    let balance = 0;
    let j = 0;
    for (let i = 0; i < creditors.length; i++) {
      const creditor = creditors[i];
      console.log("Creditor", creditor);
      for (; j < debtors.length; j++) {
        const debtor = debtors[j];
        console.log("Debtor", debtor);
        balance = creditor.balance + debtor.balance;
        // debtor is settled
        if (balance > 0) {
          const transaction: Transaction = {
            recipientId: creditor.id,
            amount: Math.abs(debtor.balance),
          };
          debtor.transactions = [...debtor.transactions, transaction];
          debtor.balance = 0;
          creditor.balance = balance;
        } // creditor is settled
        else if (balance < 0) {
          const transaction: Transaction = {
            recipientId: creditor.id,
            amount: Math.abs(debtor.balance),
          };
          debtor.transactions = [...debtor.transactions, transaction];
          debtor.balance = balance;
          creditor.balance = 0;
          break;
        } // both are settled
        else {
          const transaction: Transaction = {
            recipientId: creditor.id,
            amount: Math.abs(debtor.balance),
          };
          debtor.transactions = [...debtor.transactions, transaction];
          debtor.balance = 0;
          creditor.balance = 0;
        }
      }
    }
  };

  return (
    <Flex align="center" justify="center" direction="column" minH={"100vh"}>
      <Heading py={6}>New Expense Group</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex align="center" direction="column" gap={6} minH={"100vh"}>
          <Field label="Title">
            <Input {...register("title")}></Input>
          </Field>
          <Field label="Note">
            <Textarea {...register("note")}></Textarea>
          </Field>
          <Field label="Participants">
            <Flex align="center" justify="center">
              <ul>
                <Flex>
                  {participants.length > 0 &&
                    participants.map((participant) => {
                      return (
                        <li key={participant.id}>
                          <Button
                            variant="plain"
                            p="0"
                            minW="auto"
                            onClick={() => {
                              handleUpdateParticipant(participant);
                            }}
                          >
                            <Avatar.Root
                              key={participant.id}
                              variant="subtle"
                              size="lg"
                            >
                              <Avatar.Fallback
                                name={`${participant.firstName} ${participant.lastName}`}
                              />
                            </Avatar.Root>
                          </Button>
                        </li>
                      );
                    })}
                </Flex>
              </ul>
              <Button
                variant="plain"
                p="0"
                minW="auto"
                onClick={() => handleNewParticipant()}
              >
                <Avatar.Root variant="solid" size="lg">
                  <Avatar.Fallback name="+" />
                </Avatar.Root>
              </Button>
            </Flex>
          </Field>
          <Field label="Expenses">
            <ul>
              <Flex justify="center" align="start" direction="column" gap={6}>
                {expenses.length > 0 &&
                  expenses.map((expense) => {
                    return (
                      <li key={expense.id}>
                        <Button
                          variant="subtle"
                          p="0"
                          size="lg"
                          onClick={() => {
                            handleUpdateExpense(expense);
                          }}
                        >
                          {expense.title}
                        </Button>
                      </li>
                    );
                  })}
                {participants.length > 0 ? (
                  <Button
                    variant="plain"
                    p="0"
                    minW="auto"
                    onClick={() => {
                      handleNewExpense();
                    }}
                  >
                    <Avatar.Root variant="solid" size="lg">
                      <Avatar.Fallback name="+" />
                    </Avatar.Root>
                  </Button>
                ) : (
                  <Text>No participants added yet</Text>
                )}
              </Flex>
            </ul>
          </Field>

          <Button type="submit" bgColor="lime.500" onClick={handleSplit}>
            Split
          </Button>
        </Flex>
      </form>
      <SplitResult />

      {openParticipantForm && (
        <ParticipantForm
          setParticipants={setParticipants}
          openParticipantForm={openParticipantForm}
          setOpenParticipantForm={setOpenParticipantForm}
          participant={selectedParticipant}
          setExpenses={setExpenses}
          splitDetails={splitDetails}
          setSplitDetails={setSplitDetails}
          expenses={expenses}
          participants={participants}
        />
      )}
      {openExpenseForm && (
        <ExpenseForm
          setExpenses={setExpenses}
          openExpenseForm={openExpenseForm}
          setOpenExpenseForm={setOpenExpenseForm}
          expense={selectedExpense}
          participants={participants}
          setSplitDetails={setSplitDetails}
          splitDetails={splitDetails}
          setParticipants={setParticipants}
        />
      )}
    </Flex>
  );
}
