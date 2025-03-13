"use client ";

import { v4 as uuidv4 } from "uuid";
import {
  Input,
  Button,
  Field,
  Avatar,
  Flex,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
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

import { Participant, Expense, ExpenseDetail } from "@/app/types/interfaces";

interface ParticipantFormProps {
  openParticipantForm: boolean;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  setOpenParticipantForm: React.Dispatch<React.SetStateAction<boolean>>;
  participant: Participant;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  participants: Participant[];
}

export default function ParticipantForm({
  setParticipants,
  openParticipantForm,
  setOpenParticipantForm,
  participant,
  expenses,
  setExpenses,
  participants,
}: ParticipantFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Participant>({
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
        <Flex align="center" direction="column" py={4}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ width: "100%", maxWidth: "370px" }}
          >
            <Flex align="center" direction="column" rowGap={4}>
              <DrawerHeader>
                <DrawerTitle>
                  {participant.id.length > 0 ? (
                    <Avatar.Root
                      key={participant.id}
                      variant="subtle"
                      size="lg"
                    >
                      <Avatar.Fallback
                        name={`${participant.firstName} ${participant.lastName}`}
                      />
                    </Avatar.Root>
                  ) : (
                    "New Participant"
                  )}
                </DrawerTitle>
              </DrawerHeader>
              <Flex direction="column" gap={4} width="100%" maxW="370px">
                <DrawerBody>
                  <Flex direction="column" gap={6}>
                    <Field.Root invalid={!!errors.firstName}>
                      <Field.Label>First Name</Field.Label>
                      <Input
                        {...register("firstName", {
                          required: "Required",
                        })}
                      />
                      <Field.ErrorText>
                        {errors.firstName && errors.firstName.message}
                      </Field.ErrorText>
                    </Field.Root>
                    <Field.Root invalid={!!errors.lastName}>
                      <Field.Label>Last Name</Field.Label>
                      <Input
                        {...register("lastName", {
                          required: "Required",
                        })}
                      />
                      <Field.ErrorText>
                        {errors.lastName && errors.lastName.message}
                      </Field.ErrorText>
                    </Field.Root>
                  </Flex>
                </DrawerBody>
                <DrawerFooter>
                  <Flex
                    justify={
                      participant.id.length > 0 ? "space-between" : "center"
                    }
                    width="100%"
                  >
                    {participant.id.length > 0 && (
                      <Dialog.Root role="alertdialog">
                        <Dialog.Trigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            rounded="full"
                            colorPalette="red"
                          >
                            Delete
                          </Button>
                        </Dialog.Trigger>
                        <Portal>
                          <Dialog.Backdrop />
                          <Dialog.Positioner>
                            <Dialog.Content>
                              <Dialog.Header>
                                <Dialog.Title>
                                  Delete {participant.firstName}{" "}
                                  {participant.lastName}?
                                </Dialog.Title>
                              </Dialog.Header>
                              <Dialog.Body>
                                <p>
                                  Deleting participant will remove all related
                                  expenses.
                                </p>
                              </Dialog.Body>
                              <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                  <Button variant="outline" rounded="full">
                                    Cancel
                                  </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                  rounded="full"
                                  colorPalette="red"
                                  onClick={handleDeleteParticipant}
                                >
                                  Delete
                                </Button>
                              </Dialog.Footer>
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Portal>
                      </Dialog.Root>
                    )}
                    <Flex gap={2}>
                      <DrawerActionTrigger asChild>
                        <Button variant="outline" rounded="full">
                          Cancel
                        </Button>
                      </DrawerActionTrigger>
                      <Button
                        rounded="full"
                        type="submit"
                        disabled={Object.keys(errors).length > 0}
                        loading={isSubmitting}
                        loadingText="Saving..."
                        spinnerPlacement="start"
                        bgColor="lime.500"
                      >
                        Save
                      </Button>
                    </Flex>
                  </Flex>
                </DrawerFooter>
              </Flex>
              <DrawerCloseTrigger />
            </Flex>
          </form>
        </Flex>
      </DrawerContent>
    </DrawerRoot>
  );
}
