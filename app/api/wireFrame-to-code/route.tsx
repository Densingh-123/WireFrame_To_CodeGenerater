import { db } from "../../../configs/db";
import { WireFrameToCode } from "@/configs/schema";
import { eq } from "drizzle-orm"; // Import eq for filtering
import { NextResponse } from "next/server";


// export async function POST(req: Request) {
//   const { description, imageUrl, model, uid, email } = await req.json();
//   const result = await db
//     .insert(WireFrameToCode)
//     .values({
//       uid,
//       description,
//       imageUrl,
//       model,
//       createdBy: email,
//     })
//     .returning({ id: WireFrameToCode.id });

//   return NextResponse.json(result);
// }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid"); // Get the uid from query parameters

  if (uid) {
    const result = await db
      .select()
      .from(WireFrameToCode)
      .where(eq(WireFrameToCode.uid, uid)); // Use eq for filtering
    return NextResponse.json(result[0]); // Return the first matching record
  }

  return NextResponse.json({ result: "No Record Found" });
}
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const uid = searchParams.get("uid"); // Get the uid from query parameters

//   if (uid) {
//     const result = await db
//       .select()
//       .from(WireFrameToCode)
//       .where(eq(WireFrameToCode.uid, uid)); // Use eq for filtering
//     return NextResponse.json(result[0]); // Return the first matching record
//   }

//   return NextResponse.json({ result: "No Record Found" });
// }
export async function POST(req: Request) {
  const { description, imageUrl, model, uid, email } = await req.json();
  const result = await db
    .insert(WireFrameToCode)
    .values({
      uid,
      description,
      imageUrl,
      model,
      createdBy: email,
    })
    .returning({ id: WireFrameToCode.id });

  return NextResponse.json(result);
}
