import dbConnect from "../../../lib/mongodb";
import ParticipantModel from "../../../../models/Participant";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";

export async function GET(req: NextRequest) {
  console.log("GET all participants");

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");
    let participants;
    if (!ids) {
      participants = await ParticipantModel.find({});
    } else {
      const participantIds = ids.split(",");
      participants = await ParticipantModel.find({
        _id: { $in: participantIds },
      });
    }
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

  try {
    await dbConnect();
    const body = await req.json();
    console.log("[PARTICIPANT POST] body", body);

    // const { firstName, lastName } = body;
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
