import dbConnect from "../../../lib/mongodb";
import ParticipantModel from "../../../../models/Participant";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";

export async function GET() {
  console.log("GET all participants");

  await dbConnect();
  try {
    const participants = await ParticipantModel.find({});
    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const log = logger.child({
    module: "app/api/participants/route.ts",
  });

  log.info("POST a participant");

  console.log("POST a participant");

  await dbConnect();
  try {
    const body = await req.json();
    const participant = await ParticipantModel.create(body);
    return NextResponse.json(
      { success: true, data: participant },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
