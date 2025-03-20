import { Button } from "@chakra-ui/react";
import mongoose from "mongoose";
import { createExpenseGroup } from "@/utils/expenseGroupApi";
import { useRouter } from "next/navigation";

export default function NewGroupButton() {
  const router = useRouter();
  const handleCreateGroup = async () => {
    const objId = new mongoose.Types.ObjectId();
    const groupId = objId.toString();
    const expenseGroupData = {
      _id: groupId,
      title: "",
      note: "",
      participants: [],
      expenses: [],
    };
    try {
      await createExpenseGroup(expenseGroupData);
      // console.log("res", res);
      router.push(`/groups/${groupId}/edit`);
    } catch (error) {
      console.error("Error creating expense group", error);
    }
  }
  return (
    <Button size="lg" mx="4" rounded="full" bgColor="lime.500"
      onClick={handleCreateGroup}>
      New Expense Group
    </Button>
  );
}
