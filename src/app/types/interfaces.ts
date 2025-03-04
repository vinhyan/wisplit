export interface Bill {
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
  id: string;
  sender: string;
  receiver: string;
  amount: number;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  paidExpense: string[]; // item id
  splitDetails: string[]; // item id
  balance: number;
  paidTotal: number;
  splitTotal: number;
  transactions: string[]; // transaction id
  transactionsTotal: number;
}

// SharedDetail
export interface SplitDetail {
  id: string;
  expense: string;
  participant: string;
  amount: number;
}

// Item
export interface Expense {
  id: string;
  title: string;
  note: string;
  cost: number;
  paidBy: string;
  splitDetails: string[];
}
