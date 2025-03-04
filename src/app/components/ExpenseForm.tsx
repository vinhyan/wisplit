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
import { useForm, SubmitHandler, Controller } from "react-hook-form";
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
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";

import { Participant, Expense, SplitDetail } from "../types/interfaces";

interface ExpenseFormProps {
  participants: Participant[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  openExpenseForm: boolean;
  setOpenExpenseForm: React.Dispatch<React.SetStateAction<boolean>>;
  expense: Expense;
  setSplitDetails: React.Dispatch<React.SetStateAction<SplitDetail[]>>;
  splitDetails: SplitDetail[];
}

// interface ExpenseFormInput {
//   title: string;
//   note: string;
//   cost: number;
//   paidBy: string; // participant id
//   splitDetail: string[];
// }

// const defaultExpenseValues: ExpenseFormInput = {
//   title: "",
//   note: "",
//   cost: 0,
//   paidBy: "",
//   splitDetail: [],
// };

export default function ExpenseForm({
  participants,
  expense,
  setExpenses,
  openExpenseForm,
  setOpenExpenseForm,
  setSplitDetails,
  splitDetails,
}: ExpenseFormProps) {
  const { register, control, handleSubmit, watch, reset, setValue } =
    useForm<Expense>({
      defaultValues: expense,
    });
  const [selectedSplitParticipants, setSelectedSplitParticipants] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (expense.id) {
      const splitParticipants = splitDetails.map(
        (splitDetail) => splitDetail.participant
      );
      setValue("splitDetails", splitParticipants);
    }
  }, [expense, splitDetails, setValue]);

  const participantsCollection = useMemo(() => {
    return createListCollection({
      items: participants.map((participant) => ({
        id: participant.id,
        label: `${participant.firstName} ${participant.lastName}`,
        value: participant.id,
      })),
    });
  }, [participants]);

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

  const onSubmit: SubmitHandler<Expense> = (data) => {
    // new expense
    if (data.id.length === 0) {
      data.id = uuidv4();

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
    } else {
      
    }

    setSplitDetails((prev) => [...prev, ...splitDetails]);
    setExpenses((prev) => [...prev, data]);
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
      {/* <DrawerTrigger asChild>
        <Button variant="plain" p="0" minW="auto">
          <Avatar.Root variant="solid" size="lg">
            <Avatar.Fallback name="+" />
          </Avatar.Root>
        </Button>
      </DrawerTrigger> */}
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
