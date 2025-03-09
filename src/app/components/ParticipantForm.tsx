"use client ";

// import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input, Button } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useForm, SubmitHandler, set } from "react-hook-form";

import { Avatar } from "@chakra-ui/react";

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
} from "@/components/ui/drawer";

import {
  Participant,
  Expense,
  SplitDetail,
  ExpenseDetail,
} from "@/app/types/interfaces";

interface ParticipantFormProps {
  openParticipantForm: boolean;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  setOpenParticipantForm: React.Dispatch<React.SetStateAction<boolean>>;
  participant: Participant;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  splitDetails: SplitDetail[];
  setSplitDetails: React.Dispatch<React.SetStateAction<SplitDetail[]>>;
  participants: Participant[];
}

export default function ParticipantForm({
  setParticipants,
  openParticipantForm,
  setOpenParticipantForm,
  participant,
  expenses,
  setExpenses,
  splitDetails,
  setSplitDetails,
  participants,
}: ParticipantFormProps) {
  const { register, handleSubmit, reset } = useForm<Participant>({
    defaultValues: {
      id: participant.id,
      firstName: participant.firstName,
      lastName: participant.lastName,
    },
  });

  const onSubmit: SubmitHandler<Participant> = (data) => {
    const { firstName, lastName } = data;
    const updatedParticipant = { ...participant, firstName, lastName };

    // update participant
    console.log("2. SUBMIT PARTICIPANT");
    if (updatedParticipant.id.length) {
      console.log("2.1. Update participant", updatedParticipant);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === updatedParticipant.id ? updatedParticipant : p
        )
      );
    } else {
      updatedParticipant.id = uuidv4();
      console.log("2.2. New participant", updatedParticipant);
      setParticipants((prev) => [...prev, updatedParticipant]);
    }

    reset();
    setOpenParticipantForm(false);
  };

  const handleDeleteParticipant = () => {
    // ** DELETE **

    // 1. Get the list of expenses this person paid (paidExpenses)
    // 2. For each paidExpense, get the list of splitBy participants
    //        For each splitBy participant, remove the correspond splitExpense
    //        Repeat until all splitBy participants are updated
    //      Repeat 2. until all paidExpenses are done
    // 3. Update Expense DB: Remove all paidExpenses from DB
    // 4. For each splitExpense, remove any splitBy that has this participant Id
    //        Recalculate split amount for all split participants: For each split participant, update their splitExpenses to reflect the new change
    //        Repeat until all split participants are updated
    //      Repeat until all splitExpenses are done
    // 5. Now the participant can be safely deleted.

    // let updatedParticipants: Participant[] = [];

    const paidExpenses = participant.paidExpenses;
    for (let i = 0; i < paidExpenses.length; i++) {
      const paidExpense = expenses.find(
        (e) => e.id === paidExpenses[i].expenseId
      );
      if (!paidExpense) {
        throw Error(`Expense ${paidExpenses[i].expenseId} cannot be found!`);
      }

      const splitParticipants = paidExpense.splitBy;
      for (let j = 0; j < splitParticipants.length; j++) {
        const splitParticipant = participants.find(
          (p) => p.id === splitParticipants[j].participantId
        );

        if (!splitParticipant)
          throw Error(
            `Split participant ${splitParticipants[i].participantId} cannot be found!`
          );

        const updatedSplitExpenses = splitParticipant.splitExpenses.filter(
          (se: ExpenseDetail) => se.expenseId !== paidExpense.id
        );

        splitParticipant.splitExpenses = updatedSplitExpenses;
        splitParticipant.splitTotal = splitParticipant.splitExpenses.reduce(
          (acc: number, curr: ExpenseDetail) => acc + curr.amount,
          0
        );
        splitParticipant.balance =
          splitParticipant.paidTotal - splitParticipant.splitTotal;

        const updatedParticipants = participants.map((p) =>
          p.id === splitParticipant.id ? splitParticipant : p
        );

        setParticipants(updatedParticipants);
      }
      setExpenses((prev) => prev.filter((e) => e.id !== paidExpense.id));
    }

    const splitExpenses = participant.splitExpenses;
    for (let i = 0; i < splitExpenses.length; i++) {
      const splitExpense = expenses.find(
        (e) => e.id === splitExpenses[i].expenseId
      );

      if (!splitExpense)
        throw Error(
          `Split expense ${splitExpenses[i].expenseId} cannot be found`
        );

      const newSplitCount = splitExpense.splitBy.length - 1;
      const newSplitAmount = splitExpense.paidBy.amount / newSplitCount;

      const updatedSplitBy = splitExpense.splitBy.filter((sb) => {
        if (sb.participantId !== participant.id) {
          sb.amount = newSplitAmount;
          return true;
        }
        return false;
      });
      splitExpense.splitBy = updatedSplitBy;

      for (let j = 0; j < splitExpense.splitBy.length; j++) {
        const splitParticipant = participants.find(
          (p) => p.id === splitExpense.splitBy[j].participantId
        );

        if (!splitParticipant)
          throw Error(
            `Split participant ${splitExpense.splitBy[j].participantId} cannot be found!`
          );

        const updatedSplitExpenses = splitParticipant.splitExpenses.map(
          (se: ExpenseDetail) => {
            if (se.expenseId === splitExpense.id) {
              se = {
                ...se,
                amount: newSplitAmount,
              };
            }
            return se;
          }
          // se.expenseId === splitExpense.id ? (se.amount = newSplitAmount) : se
        );
        splitParticipant.splitExpenses = updatedSplitExpenses;
        splitParticipant.splitTotal = splitParticipant.splitExpenses.reduce(
          (acc: number, se: ExpenseDetail) => acc + se.amount,
          0
        );
        splitParticipant.balance =
          splitParticipant.paidTotal - splitParticipant.splitTotal;

        const updatedParticipants = participants.map((p) =>
          p.id === splitParticipant.id ? splitParticipant : p
        );

        setParticipants(updatedParticipants);
      }
      setExpenses((prev) =>
        prev.map((e) => (e.id === splitExpense.id ? splitExpense : e))
      );
    }
    setParticipants((prev) => prev.filter((p) => p.id !== participant.id));

    reset();
    setOpenParticipantForm(false);
  };

  return (
    <DrawerRoot
      placement="bottom"
      open={openParticipantForm}
      onOpenChange={(e) => setOpenParticipantForm(e.open)}
      lazyMount
    >
      <DrawerBackdrop />
      <DrawerContent roundedTop="l3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerHeader>
            <DrawerTitle>
              {participant.id.length > 0 ? (
                <Avatar.Root key={participant.id} variant="subtle" size="lg">
                  <Avatar.Fallback
                    name={`${participant.firstName} ${participant.lastName}`}
                  />
                </Avatar.Root>
              ) : (
                "New Participant"
              )}
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Field label="First Name">
              <Input {...register("firstName")} />
            </Field>
            <Field label="Last Name">
              <Input {...register("lastName")} />
            </Field>
            {participant.id.length > 0 && (
              <Button
                onClick={handleDeleteParticipant}
                variant="outline"
                colorPalette="red"
              >
                Delete
              </Button>
            )}
          </DrawerBody>
          <DrawerFooter>
            <DrawerActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerActionTrigger>
            <Button type="submit">Save</Button>
          </DrawerFooter>
          <DrawerCloseTrigger />
        </form>
      </DrawerContent>
    </DrawerRoot>
  );
}
