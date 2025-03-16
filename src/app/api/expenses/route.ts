import dbConnect from "../../../lib/mongodb";
import ExpenseModel from "../../../../models/Expense";
import { NextRequest, NextResponse } from "next/server";
// import { logger } from "@/utils/logger";

export async function GET() {
  console.log("GET all participants");

  await dbConnect();
  try {
    const participants = await ExpenseModel.find({});
    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  console.log("POST a participant");

  await dbConnect();
  try {
    const body = await req.json();
    const expense = await ExpenseModel.create(body);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
