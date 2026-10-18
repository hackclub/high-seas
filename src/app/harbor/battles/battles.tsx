import { MATCHUPS_CLOSED_MESSAGE } from '@/lib/event-status'

export default function Matchups() {
  return (
    <section className="px-6 py-12 text-center text-white">
      <h1 className="font-heading text-5xl mb-6">The Wonderdome</h1>
      <p>{MATCHUPS_CLOSED_MESSAGE}</p>
      <p className="mt-4">Thanks for taking part!</p>
    </section>
  )
}
