import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  paidExpenses: [{ expenseId: String, amount: Number }],
  splitExpenses: [{ expenseId: String, amount: Number }],
  balance: Number,
  paidTotal: Number,
  splitTotal: Number,
  transactions: [{ recipientId: String, amount: Number }],
});

export default mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);
