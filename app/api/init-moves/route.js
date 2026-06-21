export async function GET() {
    return new Response(JSON.stringify({ error: "Route disabled" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
}
