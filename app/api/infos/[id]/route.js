import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// DELETE: Supprime une info (admin)
export async function DELETE(req, { params }) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const id = params.id;
  const client = await clientPromise;
  const db = client.db();
  await db.collection("infos").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

// PUT: Modifier une info (admin)
export async function PUT(req, { params }) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { titre, contenu } = await req.json();
  const id = params.id;
  const client = await clientPromise;
  const db = client.db();
  await db.collection("infos").updateOne(
    { _id: new ObjectId(id) },
    { $set: { titre, contenu } }
  );
  return NextResponse.json({ success: true });
}
