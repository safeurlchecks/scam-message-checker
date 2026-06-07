export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, service: 'Scam Message Checker API' }), {
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
