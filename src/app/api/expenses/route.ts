import dbConnect from "../../../lib/mongodb";
import ExpenseModel from "../../../../models/Expense";
import { NextRequest, NextResponse } from "next/server";
// import { logger } from "@/utils/logger";

export async function GET(req: NextRequest) {
  console.log("GET all expenses");
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");
    let expenses;
    if (!ids) {
       expenses = await ExpenseModel.find({});
    } else {
      const expenseIds = ids.split(",");
      expenses = await ExpenseModel.find({
        _id: { $in: expenseIds },
      });
    }
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
