import { Expense } from "@/app/types/interfaces";

const apiUrl = "/api/expenses";

export const getExpensesByIds = async (ids: string[]) => {
  if (!ids || ids.length === 0) throw new Error("No ids provided");
  const expenseIds = ids.join(",");
  try {
    const res = await fetch(`${apiUrl}?ids=${expenseIds}`, {
      method: "GET",
    });
    const resData = await res.json();
    if (!resData.success) {
      throw new Error(`Cannot get expenses by ids ${ids}`);
    }
    return resData.data;
  } catch (error) {
    console.error(`Error fetching expenses by ids ${ids}`, error);
  }
};

export const getExpenseById = async (expenseId: string) => {
  try {
    const res = await fetch(`${apiUrl}/${expenseId}`, { method: "GET" });
    const resData = await res.json();
    if (!resData.success) {
      throw new Error(`Cannot get expense by id ${expenseId}`);
    }
    return resData.data;
  } catch (error) {
    console.error(`Error fetching expense by id ${expenseId}`, error);
  }
};

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
    return resData.data;
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
    return resData.data;
  } catch (error) {
    console.error(`Error updating expense with id ${expenseData._id}`, error);
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    const res = await fetch(`${apiUrl}/${expenseId}`, {
      method: "DELETE",
    });

    const resData = await res.json();
    return resData.data;
  } catch (error) {
    console.error(`Error deleting expense with id ${expenseId}`, error);
  }
};
