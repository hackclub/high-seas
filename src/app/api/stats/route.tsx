// The stats endpoint was disabled when High Seas ended.
export function GET() {
  return new Response('High Seas stats are no longer available.', { status: 410 })
}
