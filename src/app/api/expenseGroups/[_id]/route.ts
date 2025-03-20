import dbConnect from "../../../../lib/mongodb";
import ExpenseGroupModel from "../../../../../models/ExpenseGroup";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    await dbConnect();
    const { _id } = await params;

    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const expenseGroup = await ExpenseGroupModel.findById(_id);

    if (!expenseGroup) {
      console.error("Cannot find and get expense group with _id", _id);
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expenseGroup });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  try {
    await dbConnect();
    const { _id } = await params;
    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }
    const updateData = await req.json();
    const updateExpenseGroup = await ExpenseGroupModel.findByIdAndUpdate(
      _id,
      updateData
    );
    if (!updateExpenseGroup) {
      console.error("Cannot find and update expense group with _id", _id);
      return NextResponse.json({ success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: updateExpenseGroup });
  } catch (error) {
    console.error(`Error updating expense group`, error);
  }
}

