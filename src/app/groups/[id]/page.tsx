"use client";

import { Text, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { Participant, Expense } from "@/app/types/interfaces";

export default function Group() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  return (
    <div>
      <Heading as="h1">Expense Group Name</Heading>
      <Heading as="h2">Note</Heading>
      <Text>Note...</Text>
      <Heading as="h2">Participants</Heading>
      <Heading as="h2">Expenses</Heading>
      <Heading as="h2">Settlements</Heading>
    </div>
  );
}
