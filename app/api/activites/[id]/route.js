import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// DELETE une activité
export async function DELETE(req, { params }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("copro");
  await db.collection("activites").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

// PUT : Modifier une activité
export async function PUT(req, { params }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const body = await req.json();
  if (!body.description || !body.date || !body.heureDebut || !body.heureFin) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("copro");
  await db.collection("activites").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        description: body.description,
        date: new Date(body.date),
        heureDebut: body.heureDebut,
        heureFin: body.heureFin,
      }
    }
  );
  const updated = await db.collection("activites").findOne({ _id: new ObjectId(id) });
  return NextResponse.json(updated);
}
