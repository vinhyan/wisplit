import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  title: String,
  note: String,
  paidBy: { participantId: String, amount: Number },
  splitBy: [{ participantId: String, amount: Number }],
});

export default mongoose.models.Expense ||
  mongoose.model("Participant", ExpenseSchema);
