// /app/api/notify/route.js
export async function POST(req) {
  const body = await req.json();
  const ONESIGNAL_APP_ID = "2a6dc7fc-1f0e-4f6c-9218-8b7addca1b83";
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

  // Construction du payload pour l'API v9
  const payload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ["All"],
    name: "Notification",
    contents: { en: body.message },
    headings: { en: body.title },
    // Ajoute un tag unique pour éviter le remplacement
    ttl: 300,
    priority: 10,
    web_push_topic: `notif-${Date.now()}`
  };

  const resp = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const error = await resp.json();
    console.error("OneSignal v9 API error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const data = await resp.json();
  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}
