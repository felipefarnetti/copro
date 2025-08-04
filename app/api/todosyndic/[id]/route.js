import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
  const id = params.id;
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db("copro");
  // Peut modifier text, done, archived
  await db.collection("todosyndic").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...body } }
  );
  const updated = await db.collection("todosyndic").findOne({ _id: new ObjectId(id) });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const id = params.id;
  const client = await clientPromise;
  const db = client.db("copro");
  await db.collection("todosyndic").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}
