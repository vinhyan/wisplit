export interface Group {
  id: string;
  code: string;
  title: string;
  note: string;
  expenses: string[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  participants: string[];
}

export interface Transaction {
  recipientId: string;
  amount: number;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  paidExpenses: ExpenseDetail[];
  splitExpenses: ExpenseDetail[];
  balance: number;
  paidTotal: number;
  splitTotal: number;
  transactions: Transaction[];
}

export interface ExpenseDetail {
  expenseId: string;
  amount: number;
}

export interface PaymentDetail {
  participantId: string;
  amount: number;
}

// Item
export interface Expense {
  id: string;
  title: string;
  note: string;
  paidBy: PaymentDetail;
  splitBy: PaymentDetail[];
}

// const johnDoe = {
//   id: "123",
//   firstName: "John",
//   lastName: "Doe",
//   paidExpenses: [],
//   splitExpenses: [],
//   balance: 0,
//   paidTotal: 0,
//   splitTotal: 0,
// };

// const kimLoe = {
//   id: "456",
//   firstName: "Kim",
//   lastName: "Loe",
//   paidExpenses: [],
//   splitExpenses: [],
//   balance: 0,
//   paidTotal: 0,
//   splitTotal: 0,
// };

// const seanFoe = {
//   id: "001",
//   firstName: "Sean",
//   lastName: "Foe",
//   paidExpenses: [],
//   splitExpenses: [],
//   balance: 0,
//   paidTotal: 0,
//   splitTotal: 0,
// };

// const expense1 = {
//   id: "123456",
//   title: "Some title",
//   note: "Some notes",
//   paidBy: { participant: "123", amount: 200 },
//   splitBy: [
//     { participant: "456", amount: 100 },
//     { participant: "001", amount: 100 },
//   ],
// };
// curr splitby participants = ["456", "001", "123", "047" ]
// new splitby participants = ["456", "123", "789"]

// split participants who are not in the new splitby participants = ["001", "047"]

// const mikeMoe = {
//   id: "789",
//   firstName: "Mike",
//   lastName: "Moe",
//   paidExpenses: [],
//   splitExpenses: [],
//   balance: 0,
//   paidTotal: 0,
//   splitTotal: 0,
// };

// const expense2 = {
//   id: "654321",
//   title: "Some title",
//   note: "Some notes",
//   paidBy: { participant: "456", amount: 600 },
//   splitBy: [
//     { participant: "456", amount: 300 },
//     // { participant: "789", amount: 200 },
//     { participant: "001", amount: 300 },
//   ],
// };

// update: paidBy Kim, cost is now 600. SplitBy: Kim, Mike, Sean

// const expense3 = {
//   id: "456789",
//   title: "Some title",
//   note: "Some notes",
//   paidBy: { participant: "789", amount: 600 },
//   splitBy: [
//     // { participant: "123", amount: 300 },
//     // { participant: "789", amount: 300 },
//   ],
// };

// new splitby participants = ["456", "789"]

// new splitby participants = ["456", "123"]

// new splitby participants = ["456", "123", "789"]

// new splitby participants = ["456", "123", "789"]

// ==== PARTICIPANT ====
// ** DELETE **

// 1. Get the list of expenses this person paid
// 2. For each expense

// paid person changes && cost changes
// paid person changes && cost unchanged

// paid person unchanged && cost changes
// paid person unchanged && cost unchanged
