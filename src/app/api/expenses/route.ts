import dbConnect from "../../../lib/mongodb";
import ExpenseModel from "../../../../models/Expense";
import { NextRequest, NextResponse } from "next/server";
// import { logger } from "@/utils/logger";

export async function GET(req: NextRequest) {
  console.log("GET all expenses from a group expense");
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      console.error("No group ID provided");
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const expenses = await ExpenseModel.find({
      expenseGroupId: { $in: groupId },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  console.log("POST a participant");
  try {
    await dbConnect();
    const body = await req.json();
    const expense = await ExpenseModel.create(body);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
