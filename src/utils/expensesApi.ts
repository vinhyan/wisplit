import { Expense } from "@/app/types/interfaces";

const apiUrl = "/api/expenses";

export const createExpense = async (expenseData: Expense) => {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(`Error creating expense`, error);
  }
};

export const updateExpense = async (expenseData: Expense) => {
  try {
    const res = await fetch(`${apiUrl}/${expenseData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(`Error updating expense with id ${expenseData._id}`, error);
  }
};
