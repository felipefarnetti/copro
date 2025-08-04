import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("copro"); // <-- nom de ta base !
    const users = await db.collection("users")
      .find({}, { projection: { password: 0 } }) // on cache les passwords
      .sort({ email: 1 })
      .toArray();

    return NextResponse.json(users);
  } catch (e) {
    console.error("Erreur GET /api/users:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const token = auth.split(" ")[1];
    const user = verifyToken(token);
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    if (!body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Check if user already exists
    const client = await clientPromise;
    const db = client.db("copro");
    const exist = await db.collection("users").findOne({ email: body.email });
    if (exist) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }

    const hash = await bcrypt.hash(body.password, 10);

    // Ajout du champ createdAt
    const newUser = {
      prenom: body.prenom || "",
      nom: body.nom || "",
      email: body.email,
      telephone: body.telephone || "",
      batiment: body.batiment || "",
      appartement: body.appartement || "",
      role: body.role,
      password: hash,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);
    delete newUser.password; // Ne jamais retourner le hash
    return NextResponse.json(newUser, { status: 201 });
  } catch (e) {
    console.error("Erreur POST /api/users:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}