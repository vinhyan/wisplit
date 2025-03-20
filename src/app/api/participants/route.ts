import dbConnect from "../../../lib/mongodb";
import ParticipantModel from "../../../../models/Participant";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";

export async function GET(req: NextRequest) {
  console.log("GET all participants from a group expense");

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      console.error("No group ID provided");
      return NextResponse.json({ success: false }, { status: 404 });
      // participants = await ParticipantModel.find({});
    }

    const participants = await ParticipantModel.find({
      expenseGroupId: { $in: groupId },
    });

    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

// export async function GET(
//   req: NextRequest
//   // { params }: { params: Promise<{ groupId: string }> }
// ) {
//   console.log("GET all participants");

//   try {
//     await dbConnect();
//     const { searchParams } = new URL(req.url);
//     // const { searchParams } = new URL(req.url);
//     // const ids = searchParams.get("ids");
//     const groupId = searchParams.get("groupId");
//     console.log("groupId", groupId);
//     let participants;
//     if (!groupId) {
//       // participants = await ParticipantModel.find({});
//       throw new Error("No group ID provided");
//     } else {
//       // const participantIds = ids.split(",");
//       participants = await ParticipantModel.find({
//         $or: [{ expenseGroupId: groupId }, { draftId: groupId }],
//       });
//     }
//     return NextResponse.json({ success: true, data: participants });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ success: false }, { status: 400 });
//   }
// }

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
