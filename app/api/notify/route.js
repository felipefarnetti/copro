// /app/api/notify/route.js
export async function POST(req) {
  const body = await req.json(); // attend { title, message }

  // Récupère tes clés depuis les variables d'environnement pour plus de sécurité
  const ONESIGNAL_APP_ID = "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83";
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

  console.log("ONESIGNAL_API_KEY (test log):", ONESIGNAL_API_KEY);


  const resp = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["All"], // pour tout le monde
      headings: { en: body.title },
      contents: { en: body.message },
      url: body.url || undefined, // Optionnel : lien cliquable sur la notif
    }),
  });

  if (!resp.ok) {
 const error = await resp.json();
  console.error("OneSignal API error:", error);
  return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const data = await resp.json();
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}
