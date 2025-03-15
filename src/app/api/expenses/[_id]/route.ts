import dbConnect from "../../../../lib/mongodb";
import ExpenseModel from "../../../../../models/Expense";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { _id: string } }
) {
  try {
    await dbConnect();
    const { _id } = params;

    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const expense = await ExpenseModel.findById(_id);

    if (!expense) {
      console.error("Cannot find and get expense with _id", _id);
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  console.log("PUT one expense");

  try {
    await dbConnect();

    const { _id } = await params;
    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }
    const updateData = await req.json();
    const updateExpense = await ExpenseModel.findByIdAndUpdate(_id, updateData);

    if (!updateExpense) {
      console.error("Cannot find and update expense with _id", _id);
      return NextResponse.json({ success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: updateExpense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE(
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
    const deleteExpense = await ExpenseModel.findByIdAndDelete(_id);
    if (!deleteExpense) {
      console.error("Cannot find and delete expense with _id", _id);
      return NextResponse.json({ success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: deleteExpense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
