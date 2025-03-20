const apiUrl = "/api/expenseGroups";
import { ExpenseGroup } from "../app/types/interfaces";

export const getExpenseGroupById = async (id: string) => {
  try {
    const res = await fetch(`${apiUrl}/${id}`, { method: "GET" });
    const resData = await res.json();
    if (!resData.success) {
      throw new Error(`Cannot get expense group by id ${id}`);
    }
    return resData.data;
  } catch (error) {
    console.error(`Error updating expense group by id ${id}`, error);
  }
};

export const createExpenseGroup = async (expenseGroupData: ExpenseGroup) => {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseGroupData),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(`Error creating expense group`, error);
  }
};

export const updateExpenseGroup = async (groupData: ExpenseGroup) => {
  try {
    const res = await fetch(`${apiUrl}/${groupData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error(`Error updating expense group`, error);
  }
};
