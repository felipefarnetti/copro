import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("copro");
  const todos = await db.collection("todosyndic").find({ archived: true }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(todos);
}
