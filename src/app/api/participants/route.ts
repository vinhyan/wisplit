import dbConnect from "../../../lib/mongodb";
import ParticipantModel from "../../../../models/Participant";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import { Participant } from "../../types/interfaces";

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

export async function PUT(
  req: NextRequest
  // { params }: { params: Promise<{ groupId: string }> }
) {
  console.log("PUT multiple participants");

  try {
    await dbConnect();
    const participantsData = await req.json();

    if (!(Array.isArray(participantsData) || participantsData.length)) {
      console.error("Invalid or empty participants array");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const bulkOps = participantsData.map((p: Participant) => ({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            firstName: p.firstName,
            lastName: p.lastName,
            paidExpenses: p.paidExpenses,
            splitExpenses: p.splitExpenses,
            balance: p.balance,
            netBalance: p.netBalance,
            paidTotal: p.paidTotal,
            splitTotal: p.splitTotal,
            transactions: p.transactions,
          },
        },
      },
    }));

    await ParticipantModel.bulkWrite(bulkOps);
    return NextResponse.json(
      { success: true, data: participantsData },
      { status: 200 }
    );
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
