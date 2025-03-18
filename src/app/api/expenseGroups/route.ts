import dbConnect from "../../../lib/mongodb";
import ExpenseGroupModel from "../../../../models/ExpenseGroup";
import { NextRequest, NextResponse } from "next/server";
import { ExpenseGroup } from "../../types/interfaces";

export async function GET() {
  try {
    await dbConnect();
    const expenseGroups: ExpenseGroup[] = await ExpenseGroupModel.find({});
    return NextResponse.json({ success: true, data: expenseGroups });
  } catch (error) {
    console.error(`Error fetching expense groups`, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const expenseGroup = await ExpenseGroupModel.create(body);
    return NextResponse.json(
      { success: true, data: expenseGroup },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error creating expense group`, error);
  }
}

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<void> {
//   await dbConnect();

//   const { method } = req;

//   switch (method) {
//     case "GET":
//       try {
//         const expenseGroups: ExpenseGroup[] = await ExpenseGroupModel.find({});
//         res.status(200).json({ success: true, data: expenseGroups });
//       } catch (error) {
//         console.error(error);
//         res.status(400).json({ success: false });
//       }
//       break;
//     case "POST":
//       try {
//         const expenseGroup: ExpenseGroup = await ExpenseGroupModel.create(
//           req.body
//         );
//         res.status(201).json({ success: true, data: expenseGroup });
//       } catch (error) {
//         console.error(error);
//         res.status(400).json({ success: false });
//       }
//       break;
//     default:
//       res.status(400).json({ success: false });
//       break;
//   }
// }
