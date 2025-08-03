import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }
    const token = signToken({ id: user._id, email: user.email, role: user.role });
    return NextResponse.json({ token, role: user.role, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
