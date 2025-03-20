import { useMemo } from "react";

import {
  Flex,
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
  Field,
  Dialog,
  Portal,
  SkeletonText,
  HStack,
} from "@chakra-ui/react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
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

import {
  Participant,
  Expense,
  PaymentDetail,
  ExpenseDetail,
} from "../types/interfaces";
import { pickPalette } from "@/components/theme";
import { useEffect, useState } from "react";
import { mutate } from "swr";
import useSWR from "swr";
import { apiFetcher } from "@/utils/apiFetcher";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/utils/expensesApi";
import { getParticipantById, updateParticipant } from "@/utils/participantsApi";

interface ExpenseFormProps {
  participants: Participant[];
  openExpenseForm: boolean;
  setOpenExpenseForm: React.Dispatch<React.SetStateAction<boolean>>;
  expenseId: string | null;
  expenseGroupId: string;
}
interface ExpenseFormValues {
  title: string;
  note: string;
  cost: number;
  paidBy: string[];
  splitBy: string[];
}

const formDefaultValues: ExpenseFormValues = {
  title: "",
  note: "",
  cost: 0,
  paidBy: [],
  splitBy: [],
};

export default function ExpenseForm({
  participants,
  openExpenseForm,
  setOpenExpenseForm,
  expenseId,
  expenseGroupId
}: ExpenseFormProps) {
  const {
    data: expenseData,
    isLoading,
    error,
  } = useSWR(expenseId ? `/api/expenses/${expenseId}` : null, apiFetcher);
  const [expense, setExpense] = useState<Expense | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    defaultValues: formDefaultValues,
  });

  useEffect(() => {
    if (expenseData) {
      const { title, note, paidBy, splitBy } = expenseData.data;
      setExpense(expenseData.data);
      setValue("title", title);
      setValue("note", note);
      setValue("cost", paidBy.amount);
      setValue("paidBy", [paidBy.participantId]);
      setValue(
        "splitBy",
        splitBy.map((sb: PaymentDetail) => sb.participantId)
      );
    }
  }, [expenseData, setValue]);

  // options for paidBy select
  const participantsCollection = useMemo(() => {
    return createListCollection({
      items: participants.map((participant) => ({
        id: participant._id,
        label: `${participant.firstName} ${participant.lastName}`,
        value: participant._id,
      })),
    });
  }, [participants]);

  // options for splitBy checkbox
  const splitByParticipants = useMemo(() => {
    const result = participants.map((participant) => ({
      label: `${participant.firstName} ${participant.lastName}`,
      value: participant._id as string,
    }));
    return result;
  }, [participants]);

  if (error) return <Text>Failed to load expense.</Text>;

  const selectedValues = watch("splitBy");

  const toggleSelection = (value: string) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v: string) => v !== value)
      : [...selectedValues, value];

    setValue("splitBy", updatedValues);
  };

  const handleDeleteExpense = async () => {
    // ** DELETE **
    // === paid participant ===
    // 1. Get the paid participant by id
    // 2. Remove this expense from paid participant's paidExpenses
    //      Update their paidTotal
    //      Update their balance
    // 3. Update paid participant in DB

    // === split participants ===
    // 1. For each split participant, remove this split expense from their splitExpenses
    //        Update their splitTotal
    //        Update their balance
    //      Repeat 1. until all split participants are updated
    // 2. Update split participants in DB

    // => Now this expense can safely be deleted

    // === paid participant ===
    if (!expense) return;
    // const paidParticipant = participants.find(
    //   (participant) => participant._id === expense.paidBy.participantId
    // );
    // if (!paidParticipant) {
    //   throw new Error(
    //     `Paid participant ${expense.paidBy.participantId} not found`
    //   );
    // }
    try {
      const paidParticipant = await getParticipantById(
        expense.paidBy.participantId
      );

      const updatedPaidExpenses = paidParticipant.paidExpenses.filter(
        (pe: ExpenseDetail) => pe.expenseId !== expense._id
      );

      paidParticipant.paidExpenses = updatedPaidExpenses;
      paidParticipant.paidTotal = paidParticipant.paidExpenses.reduce(
        (acc: number, curr: ExpenseDetail) => acc + curr.amount,
        0
      );
      paidParticipant.balance =
        paidParticipant.paidTotal - paidParticipant.splitTotal;
      // setParticipants((prev) =>
      //   prev.map((p) => (p._id === paidParticipant._id ? paidParticipant : p))
      // );
      await updateParticipant(paidParticipant);

      // === split participants ===
      for (let i = 0; i < expense.splitBy.length; i++) {
        // const splitParticipant = participants.find(
        //   (participant) => participant._id === expense.splitBy[i].participantId
        // );
        // if (!splitParticipant) {
        //   throw new Error(
        //     `Split participant ${expense.splitBy[i].participantId} not found`
        //   );
        // }
        const splitParticipant = await getParticipantById(
          expense.splitBy[i].participantId
        );

        const updatedSplitExpenses = splitParticipant.splitExpenses.filter(
          (se: ExpenseDetail) => se.expenseId !== expense._id
        );
        splitParticipant.splitExpenses = updatedSplitExpenses;
        splitParticipant.splitTotal = splitParticipant.splitExpenses.reduce(
          (acc: number, curr: ExpenseDetail) => acc + curr.amount,
          0
        );
        splitParticipant.balance =
          splitParticipant.paidTotal - splitParticipant.splitTotal;

        // setParticipants((prev) =>
        //   prev.map((p) => (p._id === splitParticipant._id ? splitParticipant : p))
        // );
        await updateParticipant(splitParticipant);
      }

      // setExpenses((prev) => prev.filter((e) => e._id !== expense._id));
      await deleteExpense(expense._id as string);
    } catch (error) {
      console.error(`Error deleting expense`, error);
    }
    mutate("/api/participants");
    mutate("/api/expenses");
    reset();
    setOpenExpenseForm(false);
  };

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    console.log("data", data);

    const { title, note, cost, paidBy, splitBy } = data;
    // console.log("paidBy", paidBy);
    const newExpenseCost = Number(cost);
    const newPaidByDetail: PaymentDetail = {
      participantId: paidBy[0],
      amount: newExpenseCost,
    };
    const newSplitAmount = newExpenseCost / splitBy.length;
    const newSplitByDetails: PaymentDetail[] = splitBy.map((participantId) => ({
      participantId,
      amount: newSplitAmount,
    }));

    // new expense
    if (!expense) {
      console.log("[NEW EXPENSE]");
      // === Paid person ===
      // 1. Get paid person, add this expense to their paidExpenses
      // 2. Update their paidTotal
      // 3. Update their balance
      // 4. Update paid person in DB

      // === Split participants ===
      // 1. For each split participant, add this expense to their splitExpenses
      // 2. Update their splitTotal
      // 3. Update their balance
      // 4. Update split participants in DB

      // => Now this expense can safely be added to DB

      // const newExpenseId = uuidv4();

      const newExpenseData: Expense = {
        title,
        note,
        paidBy: newPaidByDetail,
        splitBy: newSplitByDetails,
        expenseGroupId
      };

      try {
        const newExpense = await createExpense(newExpenseData);

        // === Paid person ===
        // const paidPerson = participants.find(
        //   (participant) => participant._id === newPaidByDetail.participantId
        // );
        const paidPerson = await getParticipantById(
          newPaidByDetail.participantId
        );

        // if (!paidPerson) {
        //   throw new Error(
        //     `Paid person ${newPaidByDetail.participantId} not found`
        //   );
        // }
        paidPerson.paidExpenses = [
          ...paidPerson.paidExpenses,
          {
            expenseId: newExpense._id,
            amount: newExpenseCost,
          },
        ];

        paidPerson.paidTotal = paidPerson.paidExpenses.reduce(
          (acc: number, curr: PaymentDetail) => acc + curr.amount,
          0
        );
        paidPerson.balance = paidPerson.paidTotal - paidPerson.splitTotal;

        await updateParticipant(paidPerson);
        // setParticipants((prev) =>
        //   prev.map((p) => (p._id === paidPerson._id ? paidPerson : p))
        // );

        // === Split participants ===
        for (let i = 0; i < newSplitByDetails.length; i++) {
          // const splitParticipant = participants.find(
          //   (participant) =>
          //     participant._id === newSplitByDetails[i].participantId
          // );
          // if (!splitParticipant) {
          //   throw new Error(
          //     `Split participant ${newSplitByDetails[i].participantId} not found`
          //   );
          // }

          const splitParticipant = await getParticipantById(
            newSplitByDetails[i].participantId
          );

          splitParticipant.splitExpenses = [
            ...splitParticipant.splitExpenses,
            {
              expenseId: newExpense._id,
              amount: newSplitAmount,
            },
          ];

          splitParticipant.splitTotal = splitParticipant.splitExpenses.reduce(
            (acc: number, curr: PaymentDetail) => acc + curr.amount,
            0
          );
          splitParticipant.balance =
            splitParticipant.paidTotal - splitParticipant.splitTotal;
          // setParticipants((prev) =>
          //   prev.map((p) =>
          //     p._id === splitParticipant._id ? splitParticipant : p
          //   )
          // );
          await updateParticipant(splitParticipant);
        }

        // mutate("/api/participants");
      } catch (error) {
        console.error(`Error creating expense`, error);
      }

      // mutate("/api/expenses");

      // setExpenses((prev) => [...prev, newExpense]);
    }
    // update expense
    else {
      console.log("[UPDATE EXPENSE]");
      // === Paid person ===
      // 1. If paidBy person is changed, update paidBy person's paidExpenses
      //    === current paid person ===
      //    1.1. Get current paidBy person, remove this expense from their paidExpenses
      //    1.2. Update their paidTotal
      //    1.3. Update their balance
      //    1.4. Update paidBy person in DB
      //    === new paid person ===
      //    1.5. Get new paidBy person, add this expense with the right amount to their paidExpenses
      //    1.6. Update their paidTotal
      //    1.7. Update their balance
      //    1.8. Update paidBy person in DB
      // 2. Add new paymentDetail to this expense with new paid person and amount

      // === Split participants ===
      // 1. For each NEW split participant
      //    1.1. if they are in the old split participants, update their splitExpenses (one that has the same expenseId)
      //          Update their splitTotal
      //          Update their balance
      //     1.2. If they are not in the old split participants, add this expense to their splitExpenses
      //      Repeat 1. until all split participants are updated
      // 2. Update split participants in DB

      // => Now this expense can safely be updated to DB

      // ****** Paid person ******
      // === current paid person ===
      // const currPaidPerson = participants.find(
      //   (participant) => participant._id === expense.paidBy.participantId
      // );
      // if (!currPaidPerson) {
      //   throw new Error(
      //     `Previous paid person ${expense.paidBy.participantId} not found`
      //   );
      // }
      try {
        const currPaidPerson = await getParticipantById(
          expense.paidBy.participantId
        );
        // paidBy person changed
        if (currPaidPerson._id !== newPaidByDetail.participantId) {
          const updatedCurrPaidExpenses = currPaidPerson.paidExpenses.filter(
            (pe: ExpenseDetail) => pe.expenseId !== expense._id
          );
          currPaidPerson.paidExpenses = updatedCurrPaidExpenses;
          currPaidPerson.paidTotal = currPaidPerson.paidExpenses.reduce(
            (acc: number, curr: ExpenseDetail) => acc + curr.amount,
            0
          );
          currPaidPerson.balance =
            currPaidPerson.paidTotal - currPaidPerson.splitTotal;
          // setParticipants((prev) =>
          //   prev.map((p) => (p._id === currPaidPerson._id ? currPaidPerson : p))
          // );
          await updateParticipant(currPaidPerson);
          // mutate("/api/participants");

          // === new paid person ===
          // const newPaidPerson = participants.find(
          //   (participant) => participant._id === newPaidByDetail.participantId
          // );
          // if (!newPaidPerson) {
          //   throw new Error(
          //     `New paid person ${newPaidByDetail.participantId} not found`
          //   );
          // }
          const newPaidPerson = await getParticipantById(
            newPaidByDetail.participantId
          );

          newPaidPerson.paidExpenses = [
            ...newPaidPerson.paidExpenses,
            {
              expenseId: expense._id,
              amount: cost,
            },
          ];

          newPaidPerson.paidTotal = newPaidPerson.paidExpenses.reduce(
            (acc: number, curr: ExpenseDetail) => acc + curr.amount,
            0
          );
          newPaidPerson.balance =
            newPaidPerson.paidTotal - newPaidPerson.splitTotal;
          // setParticipants((prev) =>
          //   prev.map((p) => (p._id === newPaidPerson._id ? newPaidPerson : p))
          // );
          await updateParticipant(newPaidPerson);
          // mutate("/api/participants");
        }
        // paidBy person did not change, but cost changed
        else if (expense.paidBy.amount !== newExpenseCost) {
          const updatedCurrPaidExpenses = currPaidPerson.paidExpenses.map(
            (pe: ExpenseDetail) =>
              pe.expenseId == expense._id ? { ...pe, amount: cost } : pe
          );
          currPaidPerson.paidExpenses = updatedCurrPaidExpenses;
          currPaidPerson.paidTotal = currPaidPerson.paidExpenses.reduce(
            (acc: number, curr: ExpenseDetail) => acc + curr.amount,
            0
          );
          currPaidPerson.balance =
            currPaidPerson.paidTotal - currPaidPerson.splitTotal;
          // setParticipants((prev) =>
          //   prev.map((p) => (p._id === currPaidPerson._id ? currPaidPerson : p))
          // );
          await updateParticipant(currPaidPerson);
          // mutate("/api/participants");
        }

        // remove splitExpenses of prev split participants who are not in the new splitBy list
        const prevSplitParticipantIds = expense.splitBy.filter((sb) => {
          const found = newSplitByDetails.find(
            (newSplitBy) => sb.participantId === newSplitBy.participantId
          );
          return !found;
        });

        for (let i = 0; i < prevSplitParticipantIds.length; i++) {
          // const prevSplitParticipant = participants.find(
          //   (participant) =>
          //     participant._id === prevSplitParticipantIds[i].participantId
          // );
          // if (!prevSplitParticipant) {
          //   throw new Error(
          //     `Previous split participant ${prevSplitParticipantIds[i].participantId} not found`
          //   );
          // }
          const prevSplitParticipant = await getParticipantById(
            prevSplitParticipantIds[i].participantId
          );

          const updatedSplitExpenses =
            prevSplitParticipant.splitExpenses.filter(
              (se: ExpenseDetail) => se.expenseId !== expense._id
            );
          prevSplitParticipant.splitExpenses = updatedSplitExpenses;
          prevSplitParticipant.splitTotal =
            prevSplitParticipant.splitExpenses.reduce(
              (acc: number, curr: ExpenseDetail) => acc + curr.amount,
              0
            );
          prevSplitParticipant.balance =
            prevSplitParticipant.paidTotal - prevSplitParticipant.splitTotal;
          // setParticipants((prev) =>
          //   prev.map((p) =>
          //     p._id === prevSplitParticipant._id ? prevSplitParticipant : p
          //   )
          // );
          await updateParticipant(prevSplitParticipant);
          // mutate("/api/participants");
        }

        // update or add splitExpenses to the new split participants
        for (let i = 0; i < newSplitByDetails.length; i++) {
          // const newSplitParticipant = participants.find(
          //   (participant) =>
          //     participant._id === newSplitByDetails[i].participantId
          // );
          // if (!newSplitParticipant) {
          //   throw new Error(
          //     `New split participant ${newSplitByDetails[i].participantId} not found`
          //   );
          // }
          const newSplitParticipant = await getParticipantById(
            newSplitByDetails[i].participantId
          );

          const splitExpenseFound = newSplitParticipant.splitExpenses.find(
            (se: ExpenseDetail) => se.expenseId === expense._id
          );
          // new split participant
          if (!splitExpenseFound) {
            newSplitParticipant.splitExpenses = [
              ...newSplitParticipant.splitExpenses,
              {
                expenseId: expense._id,
                amount: newSplitAmount,
              },
            ];
          } // existing split participant
          else {
            const updatedSplitExpenses = newSplitParticipant.splitExpenses.map(
              (se: ExpenseDetail) =>
                se.expenseId === expense._id
                  ? { ...se, amount: newSplitAmount }
                  : se
            );
            newSplitParticipant.splitExpenses = updatedSplitExpenses;
          }

          newSplitParticipant.splitTotal =
            newSplitParticipant.splitExpenses.reduce(
              (acc: number, curr: ExpenseDetail) => acc + curr.amount,
              0
            );
          newSplitParticipant.balance =
            newSplitParticipant.paidTotal - newSplitParticipant.splitTotal;
          // setParticipants((prev) =>
          //   prev.map((p) =>
          //     p._id === newSplitParticipant._id ? newSplitParticipant : p
          //   )
          // );
          await updateParticipant(newSplitParticipant);
          // mutate("/api/participants");
        }

        const updatedExpense = {
          ...expense,
          title,
          note,
          paidBy: newPaidByDetail,
          splitBy: newSplitByDetails,
        };
        await updateExpense(updatedExpense);
        // setExpenses((prev) =>
        //   prev.map((e) => (e._id === updatedExpense._id ? updatedExpense : e))
        // );
        // mutate("/api/expenses");
      } catch (error) {
        console.error(`Error updating expense`, error);
      }
    }
    mutate(`/api/participants?groupId=${expenseGroupId}`);
    mutate(`/api/expenses?groupId=${expenseGroupId}`);
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
        <Flex align="center" direction="column" py={4}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ width: "100%", maxWidth: "370px" }}
          >
            <Flex align="center" direction="column" rowGap={4}>
              {isLoading ? (
                <HStack width="full">
                  <DrawerHeader>
                    <SkeletonText noOfLines={2} gap="4" />
                  </DrawerHeader>
                  <DrawerBody>
                    <SkeletonText noOfLines={8} gap="4" />
                  </DrawerBody>
                  <DrawerFooter>
                    <SkeletonText noOfLines={2} gap="4" />
                  </DrawerFooter>
                </HStack>
              ) : (
                <>
                  <DrawerHeader>
                    <DrawerTitle>
                      {expense ? expense.title : "New Expense"}
                    </DrawerTitle>
                  </DrawerHeader>
                  <Flex direction="column" gap={4} width="100%" maxW="370px">
                    <DrawerBody>
                      <Flex direction="column" gap={6}>
                        <Field.Root invalid={!!errors.title}>
                          <Field.Label>Title </Field.Label>
                          <Input
                            {...register("title", { required: "Required" })}
                          />
                          <Field.ErrorText>
                            {errors.title && errors.title.message}
                          </Field.ErrorText>
                        </Field.Root>

                        <Field.Root>
                          <Field.Label>Note</Field.Label>
                          <Textarea {...register("note")} />
                        </Field.Root>

                        <Field.Root invalid={!!errors.cost}>
                          <Field.Label>Cost</Field.Label>
                          <NumberInputRoot defaultValue="">
                            <NumberInputField
                              {...register("cost", {
                                validate: (value) =>
                                  value > 0 || "Cost must be greater than 0",
                              })}
                            />
                          </NumberInputRoot>
                          <Field.ErrorText>
                            {errors.cost && errors.cost.message}
                          </Field.ErrorText>
                        </Field.Root>
                        {/* Need to check validation of this field, when missing, it does not show form validation (error), but throws Error */}
                        <Field.Root invalid={!!errors.paidBy}>
                          <Field.Label> Paid By</Field.Label>
                          {participants.length ? (
                            <>
                              <Controller
                                control={control}
                                name="paidBy"
                                rules={{
                                  validate: (value) =>
                                    (value && value[0].length > 0) ||
                                    "Required",
                                }}
                                render={({ field }) => (
                                  <SelectRoot
                                    collection={participantsCollection}
                                    onValueChange={({ value }) =>
                                      field.onChange(value)
                                    }
                                    onInteractOutside={() => field.onBlur()}
                                    size="lg"
                                    closeOnSelect
                                    positioning={{
                                      placement: "top",
                                      flip: false,
                                    }}
                                    name={field.name}
                                    value={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValueText placeholder="Paid by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {participantsCollection.items.map(
                                        (participant) => (
                                          <SelectItem
                                            item={participant}
                                            key={participant.value}
                                          >
                                            {participant.label}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </SelectRoot>
                                )}
                              />
                              <Field.ErrorText>
                                {errors.paidBy && errors.paidBy.message}
                              </Field.ErrorText>
                            </>
                          ) : (
                            <Text>No participants</Text>
                          )}
                        </Field.Root>

                        <Field.Root invalid={!!errors.splitBy}>
                          <Field.Label>Split By</Field.Label>
                          {participants.length ? (
                            <Flex
                              direction="column"
                              justify="center"
                              align="start"
                              gap={2}
                            >
                              {splitByParticipants.map((participant) => (
                                <Flex
                                  align="center"
                                  gap={2}
                                  key={participant.value}
                                >
                                  <Avatar.Root
                                    bg={
                                      selectedValues.includes(participant.value)
                                        ? pickPalette(participant.value)
                                        : "gray"
                                    }
                                    key={participant.value}
                                    variant="subtle"
                                    size="lg"
                                    onClick={() =>
                                      toggleSelection(participant.value)
                                    }
                                    style={{
                                      cursor: "pointer",
                                      borderRadius: "50%",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      id={participant.value}
                                      value={participant.value}
                                      {...register(`splitBy`, {
                                        required: "Required",
                                      })}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        position: "absolute",
                                        borderRadius: "50%",
                                        appearance: "none",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <Avatar.Fallback
                                      name={participant.label}
                                      color="black"
                                    />
                                  </Avatar.Root>

                                  <label htmlFor={participant.label}>
                                    {participant.label}
                                  </label>
                                </Flex>
                              ))}
                              <Field.ErrorText>
                                {errors.splitBy && errors.splitBy.message}
                              </Field.ErrorText>
                            </Flex>
                          ) : (
                            <Text>No participants</Text>
                          )}
                        </Field.Root>
                      </Flex>
                    </DrawerBody>
                    <DrawerFooter>
                      <Flex
                        justify={expense ? "space-between" : "center"}
                        width="100%"
                      >
                        {expense && (
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
                                      Delete {expense.title}?
                                    </Dialog.Title>
                                  </Dialog.Header>
                                  <Dialog.Body>
                                    <p>
                                      Deleting expense will remove it from
                                      related participants.
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
                                      onClick={handleDeleteExpense}
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
                </>
              )}
            </Flex>
          </form>
        </Flex>
      </DrawerContent>
    </DrawerRoot>
  );
}
