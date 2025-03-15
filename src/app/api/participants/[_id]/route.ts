import dbConnect from "../../../../lib/mongodb";
import ParticipantModel from "../../../../../models/Participant";
import { NextRequest, NextResponse } from "next/server";

export async function GET({ params }: { params: Promise<{ _id: string }> }) {
  try {
    await dbConnect();
    const { _id } = await params;

    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const participant = await ParticipantModel.findById(_id);

    if (!participant) {
      console.error("Cannot find and get participant with _id", _id);
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ _id: string }> }
) {
  console.log("PUT one participant");

  try {
    await dbConnect();
    const { _id } = await params;
    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }
    const updateData = await req.json();
    const updateParticipant = await ParticipantModel.findByIdAndUpdate(
      _id,
      updateData
    );

    if (!updateParticipant) {
      console.error("Cannot find and update participant with _id", _id);
      return NextResponse.json({ success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: updateParticipant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE({ params }: { params: { _id: string } }) {
  await dbConnect();

  try {
    const { _id } = params;
    if (!_id) {
      console.error("No _id provided");
      return NextResponse.json({ success: false }, { status: 400 });
    }
    const deleteParticipant = await ParticipantModel.findByIdAndDelete(_id);
    if (!deleteParticipant) {
      console.error("Cannot find and delete participant with _id", _id);
      return NextResponse.json({ success: false }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: deleteParticipant });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
