import mongoose from "mongoose";

const ExpenseGroupSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["draft", "completed", "deleted"],
    default: "draft",
  },
  title: String,
  note: String,
  expenses: [String],
  participants: [String],
});

export default mongoose.models.ExpenseGroup ||
  mongoose.model("ExpenseGroup", ExpenseGroupSchema);
