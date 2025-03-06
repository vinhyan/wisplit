import { useState, useMemo, useEffect } from "react";

import {
  Flex,
  // Heading,
  Text,
  Input,
  Textarea,
  Button,
  Avatar,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useForm, SubmitHandler, Controller, set } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
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
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";

import { Participant, Expense, SplitDetail } from "../types/interfaces";
import { WiDayHail } from "react-icons/wi";

interface ExpenseFormProps {
  participants: Participant[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  openExpenseForm: boolean;
  setOpenExpenseForm: React.Dispatch<React.SetStateAction<boolean>>;
  expense: Expense;
  setSplitDetails: React.Dispatch<React.SetStateAction<SplitDetail[]>>;
  splitDetails: SplitDetail[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

export default function ExpenseForm({
  participants,
  expense,
  setExpenses,
  openExpenseForm,
  setOpenExpenseForm,
  setSplitDetails,
  splitDetails,
  setParticipants,
}: ExpenseFormProps) {
  const { register, control, handleSubmit, watch, reset, setValue } =
    useForm<Expense>({
      defaultValues: expense,
    });

  useEffect(() => {
    // if updating expense, convert splitDetails to participant ids
    // to be used in the form
    if (expense.id) {
      const splitByParticipants = splitDetails.map(
        (splitDetail) => splitDetail.participant
      );
      setValue("splitDetails", splitByParticipants);
    }
  }, [expense, splitDetails, setValue]);

  // options for paidBy select
  const participantsCollection = useMemo(() => {
    return createListCollection({
      items: participants.map((participant) => ({
        id: participant.id,
        label: `${participant.firstName} ${participant.lastName}`,
        value: participant.id,
      })),
    });
  }, [participants]);

  // options for splitBy checkbox
  const splitByParticipants = useMemo(() => {
    const result = participants.map((participant) => ({
      label: `${participant.firstName} ${participant.lastName}`,
      value: participant.id,
    }));
    console.log("splitByParticipants", result);
    return result;
  }, [participants]);

  const selectedValues = watch("splitDetails", []);

  const toggleSelection = (value: string) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v: string) => v !== value)
      : [...selectedValues, value];

    setValue("splitDetails", updatedValues);
  };

  const handleDeleteExpense = () => {
    const updatedParticipants: Participant[] = [];

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      // paidBy
      if (participant.id === expense.paidBy) {
        // remove paidExpense
        const updatedPaidExpense = participant.paidExpense.filter(
          (pe) => pe !== expense.id
        );
        participant.paidExpense = updatedPaidExpense;
      }

      // remove splitBy
      const updatedSplitDetails = participant.splitDetails.filter(
        (sdId) => !expense.splitDetails.includes(sdId)
      );
      participant.splitDetails = updatedSplitDetails;
      updatedParticipants.push(participant);
    }
    // remove and update splitDetails
    setSplitDetails((prev) => prev.filter((sd) => sd.expense !== expense.id));

    // update participants
    setParticipants(updatedParticipants);

    // remove and update expense
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
  };

  const onSubmit: SubmitHandler<Expense> = (data) => {
    if (data.id.length) {
      // if updating expense
      // remove current splitDetails
      setSplitDetails((prev) => prev.filter((sd) => sd.expense !== data.id));
    } else {
      data.id = uuidv4();
    }

    // paidBy participant Id
    data.paidBy = data.paidBy[0];

    // the form uses participant ids, so we need to convert them to splitDetails
    const splitDetails: SplitDetail[] = data.splitDetails.map(
      (participantId) => {
        const participant = participants.find(
          (participant) => participant.id === participantId
        );
        if (!participant) {
          throw new Error(`Participant with id ${participantId} not found`);
        }
        return {
          id: uuidv4(),
          expense: data.id,
          participant: participant.id,
          amount: data.cost / data.splitDetails.length,
        };
      }
    );

    data.splitDetails = splitDetails.map((splitDetail) => splitDetail.id);

    let updatedParticipants = participants.map((participant) => {
      // loop through splitDetails, if participant.id === splitDetail.participant
      // add splitDetail.id to participant.splitDetails
      let matchSplitDetailId = "";

      for (let i = 0; i < splitDetails.length; i++) {
        const splitDetail = splitDetails[i];
        if (splitDetail.participant === participant.id) {
          matchSplitDetailId = splitDetail.id;
          break;
        }
      }
      console.log("participant.splitDetails", participant.splitDetails);
      // participant.splitDetails.push(matchSplitDetailId);
      return participant;
    });

    setSplitDetails((prev) => [...prev, ...splitDetails]);

    // updating expense
    if (expense.id.length) {
      setExpenses((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    }
    // new expense
    else {
      // add paidExpense to the paidBy participant
      updatedParticipants = updatedParticipants.map((participant) => {
        if (participant.id === data.paidBy) {
          participant.paidExpense.push(data.id);
        }
        return participant;
      });
      setParticipants(updatedParticipants);
      setExpenses((prev) => [...prev, data]);
    }

    reset();
    setOpenExpenseForm(false);
  };

  return (
    <DrawerRoot
      placement="bottom"
      open={openExpenseForm}
      onOpenChange={(e) => setOpenExpenseForm(e.open)}
      lazyMount
    >
      <DrawerBackdrop />
      <DrawerContent roundedTop="l3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DrawerHeader>
            <DrawerTitle>New Expense</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Field label="Title">
              <Input {...register("title")} />
            </Field>
            <Field label="Note">
              <Textarea {...register("note")} />
            </Field>
            <Field label="Cost">
              <NumberInputRoot defaultValue="">
                <NumberInputField {...register("cost")} />
              </NumberInputRoot>
            </Field>
            {/* <Field label="Paid By"> */}
            <Field label="Paid By">
              {participants.length ? (
                <Controller
                  control={control}
                  name="paidBy"
                  render={({ field }) => (
                    <SelectRoot
                      collection={participantsCollection}
                      onValueChange={({ value }) => field.onChange(value)}
                      onInteractOutside={() => field.onBlur()}
                      size="lg"
                      closeOnSelect
                      positioning={{ placement: "top", flip: false }}
                      defaultValue={[expense.paidBy]}
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Paid by" />
                      </SelectTrigger>
                      <SelectContent>
                        {participantsCollection.items.map((participant) => (
                          <SelectItem
                            item={participant}
                            key={participant.value}
                          >
                            {participant.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  )}
                />
              ) : (
                <Text>No participants</Text>
              )}
            </Field>

            <Field label="Split By">
              {participants.length ? (
                <Flex direction="column" justify="center" align="start" gap={2}>
                  {splitByParticipants.map((participant) => (
                    <Flex align="center" gap={2} key={participant.value}>
                      <Avatar.Root
                        key={participant.value}
                        variant="subtle"
                        size="lg"
                        onClick={() => toggleSelection(participant.value)}
                        style={{
                          cursor: "pointer",
                          border: selectedValues.includes(participant.value)
                            ? "2px solid lime"
                            : "2px solid transparent",
                          borderRadius: "50%",
                        }}
                      >
                        <input
                          type="checkbox"
                          id={participant.value}
                          value={participant.value}
                          {...register(`splitDetails`)}
                          style={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            borderRadius: "50%",
                            appearance: "none",
                          }}
                        />
                        <Avatar.Fallback name={participant.label} />
                      </Avatar.Root>

                      <label htmlFor={participant.label}>
                        {participant.label}
                      </label>
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <Text>No participants</Text>
              )}
            </Field>
            {expense.id.length > 0 && (
              <Button
                onClick={handleDeleteExpense}
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
