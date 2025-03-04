"use client ";

// import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input, Button } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useForm, SubmitHandler } from "react-hook-form";

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

import { Participant } from "@/app/types/interfaces";

interface ParticipantFormProps {
  openParticipantForm: boolean;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  setOpenParticipantForm: React.Dispatch<React.SetStateAction<boolean>>;
  participant: Participant;
}

export default function ParticipantForm({
  setParticipants,
  openParticipantForm,
  setOpenParticipantForm,
  participant,
}: ParticipantFormProps) {
  const { register, handleSubmit, reset } = useForm<Participant>({
    defaultValues: {
      id: participant.id,
      firstName: participant.firstName,
      lastName: participant.lastName,
    },
  });

  const onSubmit: SubmitHandler<Participant> = (data) => {
    // update participant
    console.log("2. SUBMIT PARTICIPANT");
    if (participant.id.length) {
      console.log("2.1. Update participant", data);
      setParticipants((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      data.id = uuidv4();
      console.log("2.2. New participant", data);
      setParticipants((prev) => [...prev, data]);
    }
    reset();
    setOpenParticipantForm(false);
  };

  const handleDeleteParticipant = () => {
    if (participant.id.length) {
      setParticipants((prev) => {
        return prev.filter((p) => p.id !== participant.id);
      });
    }
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
