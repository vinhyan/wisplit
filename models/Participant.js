import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  paidExpenses: [{ expenseId: String, amount: { type: Number, default: 0 } }],
  splitExpenses: [{ expenseId: String, amount: { type: Number, default: 0 } }],
  balance: { type: Number, default: 0 },
  paidTotal: { type: Number, default: 0 },
  splitTotal: { type: Number, default: 0 },
  transactions: [{ recipientId: String, amount: { type: Number, default: 0 } }],
});

export default mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);
