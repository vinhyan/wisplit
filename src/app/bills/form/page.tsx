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
import {
  useForm,
  SubmitHandler,
  useFieldArray,
  Controller,
} from "react-hook-form";

import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import ExpenseForm from "@/app/components/ExpenseForm";
import ParticipantForm from "@/app/components/ParticipantForm";
import { Participant, Expense, SplitDetail } from "@/app/types/interfaces";

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
  paidExpense: [],
  splitDetails: [],
  balance: 0,
  paidTotal: 0,
  splitTotal: 0,
  transactions: [],
  transactionsTotal: 0,
};

const defaultExpense: Expense = {
  id: "",
  title: "",
  note: "",
  cost: 0,
  paidBy: "",
  splitDetails: [],
};

// const defaultSplitDetail: SplitDetail = {
//   id: "",
//   expense: defaultExpense,
//   participant: defaultParticipant,
//   amount: 0,
// };

export default function BillForm() {
  const { register, control, handleSubmit, watch, reset } =
    useForm<BillFormInput>();
  const {
    fields: participantFields,
    append: appendParticipant,
    update: updateParticipant,
    remove: removeParticipant,
  } = useFieldArray({
    control,
    name: "participants",
  });
  const {
    fields: expenseFields,
    append: appendExpense,
    update: updateExpense,
    remove: removeExpense,
  } = useFieldArray({
    control,
    name: "expenses",
  });

  const [openParticipantForm, setOpenParticipantForm] = useState(false);
  const [openExpenseForm, setOpenExpenseForm] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant>(defaultParticipant);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] =
    useState<Expense>(defaultExpense);

  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);

  const watchParticipants = watch("participants");
  const watchExpenses = watch("expenses");

  // const handleParticipantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setParticipant({ ...participant, [name]: value });
  // };

  // if participants change (i.e. one person who's splitting is removed), update expense accordingly
  useEffect(() => {
    // all expenses that have that person will have to be updated
  }, [watchParticipants]);

  const onSubmit: SubmitHandler<BillFormInput> = (data) => {
    console.log(data);
  };

  const handleNewParticipant = () => {
    setSelectedParticipant(defaultParticipant);
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
  return (
    <Flex align="center" justify="center" direction="column">
      <Heading>New Expense Group</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
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
            <Flex>
              {expenses.length > 0 &&
                expenses.map((expense) => {
                  console.log("expense item", expense);
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
                      {/* Update Expense - Start */}
                      {/* <DrawerRoot placement="bottom">
                      <DrawerBackdrop />
                      <DrawerTrigger asChild>
                        <Button variant="subtle" p="0" size="lg">
                          {item.title}
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent roundedTop="l3">
                        <DrawerHeader>
                          <DrawerTitle>{item.title}</DrawerTitle>
                        </DrawerHeader>
                        <DrawerBody>
                          <Text>Split By:</Text>
                          {item.splitBy.map((p) => (
                            <Text key={p}>{p}</Text>
                          ))} */}
                      {/* <Field label="First Name">
                            <Input
                              {...register(`participants.${index}.firstName`, {
                                required: true,
                              })}
                            />
                          </Field> */}
                      {/* no need to use controller?  */}
                      {/* <Controller
                            render={({ field }) => (
                              <Field label="Last Name">
                                <Input {...field} />
                              </Field>
                            )}
                            name={`participants.${index}.lastName`}
                            control={control}
                          /> */}
                      {/* <Button
                            type="button"
                            onClick={() => removeExpense(index)}
                          >
                            Delete
                          </Button>
                        </DrawerBody>
                        <DrawerFooter>
                          <DrawerActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerActionTrigger>
                          <Button
                            onClick={() => {
                              console.log("updating expense item", item);
                              updateExpense(index, watchExpenses[index]);
                            }}
                          >
                            Save
                          </Button>
                        </DrawerFooter>
                        <DrawerCloseTrigger />
                      </DrawerContent>
                    </DrawerRoot> */}
                    </li>
                  );
                })}
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
            </Flex>
          </ul>
        </Field>

        <Button type="submit" bgColor="lime.500">
          Split
        </Button>
      </form>
      {openParticipantForm && (
        <ParticipantForm
          setParticipants={setParticipants}
          openParticipantForm={openParticipantForm}
          setOpenParticipantForm={setOpenParticipantForm}
          participant={selectedParticipant}
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
        />
      )}
    </Flex>
  );
}
