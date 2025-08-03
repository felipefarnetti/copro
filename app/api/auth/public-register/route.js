import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("copro");
    const exists = await db.collection("users").findOne({ email });
    if (exists) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      email,
      password: hashed,
      role: "copro",
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
