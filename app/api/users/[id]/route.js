import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// DELETE: admin only
export async function DELETE(req, { params }) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const id = params.id;
  const client = await clientPromise;
  const db = client.db();
  await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

// PUT: admin only (changer email, password, rôle)
export async function PUT(req, { params }) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { email, password, role } = await req.json();
  const id = params.id;
  const client = await clientPromise;
  const db = client.db();

  const update = { email, role };
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }
  await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );
  return NextResponse.json({ success: true });
}
