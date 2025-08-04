import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("copro");
  // Ne renvoie que les non archivés
  const todos = await db.collection("todosyndic").find({ archived: { $ne: true } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(todos);
}

export async function POST(req) {
  const body = await req.json();
  if (!body.text) return NextResponse.json({ error: "Texte requis" }, { status: 400 });
  const client = await clientPromise;
  const db = client.db("copro");
  const todo = {
    text: body.text,
    done: false,
    createdAt: new Date(),
    archived: false
  };
  const res = await db.collection("todosyndic").insertOne(todo);
  return NextResponse.json({ ...todo, _id: res.insertedId });
}
