import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  expenseGroupId: { type: String, default: "" },
  title: String,
  note: String,
  paidBy: { participantId: String, amount: Number },
  splitBy: [{ participantId: String, amount: Number }],
});

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
