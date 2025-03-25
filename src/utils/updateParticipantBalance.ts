import { Participant } from "../app/types/interfaces";

export const updateParticipantBalance = (participant: Participant) => {
  const { paidExpenses, splitExpenses } = participant;

  if (!paidExpenses || !splitExpenses)
    throw new Error("No existing paid or split expenses");

  participant.paidTotal = paidExpenses.reduce((acc, expenseDetail) => {
    return acc + expenseDetail.amount;
  }, 0);

  participant.splitTotal = splitExpenses.reduce((acc, expenseDetail) => {
    return acc + expenseDetail.amount;
  }, 0);

  participant.netBalance = participant.paidTotal - participant.splitTotal;

  console.log("p:", participant);

  return participant.netBalance;
};
