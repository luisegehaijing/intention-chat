import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#6cb5ff]/45" />
        <div className="pointer-events-none absolute -left-10 -top-8 h-24 w-24 rounded-full bg-[#7fd98a]/45" />
        <div className="pointer-events-none absolute bottom-5 right-8 h-20 w-20 rounded-full bg-[#b38bff]/35" />
        <p className="text-xs uppercase tracking-[0.2em] text-moss sm:text-sm">Land of synchronicities</p>
        <h1 className="mt-3 max-w-3xl font-serif text-xl leading-tight sm:text-5xl">Synchria</h1>
        <p className="mt-4 max-w-2xl text-sm text-moss sm:text-lg">
          Some thoughts are hard to share without the right moment, or the right person. We try to connect you with someone on a similar wavelength, each week. No scrolling, no feeds. Just a space for genuine intentions, and where something meaningful can begin.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href="/auth" className="rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-paper hover:bg-terracotta">
            Create Account
          </Link>
          <Link href="/auth" className="rounded-full border border-moss/40 bg-paper px-5 py-2.5 text-sm font-medium text-ink hover:bg-sand">
            Log In
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Card className="p-6">
          <h2 className="text-lg font-serif sm:text-2xl">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-moss">
            <li><strong className="text-ink">1.</strong> Submit your school email, available times, and one or two discussion intentions for the coming week.</li>
            <li><strong className="text-ink">2.</strong> Tuesday night, matching groups 2-3 people around shared timing and conversational resonance.</li>
            <li><strong className="text-ink">3.</strong> Chat for 40 minutes with camera on or off, then share feedback and optional new prompt ideas.</li>
            <li><strong className="text-ink">4.</strong> Return next week and keep building depth over time.</li>
          </ol>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-serif sm:text-2xl">Weekly rhythm</h2>
          <ul className="mt-4 space-y-3 text-sm text-moss">
            <li><strong className="text-ink">Tuesday 11:59 PM:</strong> setup closes</li>
            <li><strong className="text-ink">Late Tuesday / early Wednesday:</strong> matches and emails</li>
            <li><strong className="text-ink">Thu-Fri-Sat:</strong> conversations happen</li>
            <li><strong className="text-ink">After meeting:</strong> feedback + next-week intentions</li>
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-serif sm:text-2xl">Safety and tone</h2>
        <div className="mt-4 grid gap-4 text-sm text-moss sm:grid-cols-3">
          <p><strong className="text-ink">Boundaries first.</strong> You decide what times and topics you are ready for.</p>
          <p><strong className="text-ink">Respectful culture.</strong> Every group starts from curiosity, consent, and confidentiality.</p>
          <p><strong className="text-ink">Easy reporting.</strong> If something feels wrong, leave the conversation and report to us immediately.</p>
        </div>
      </Card>
    </div>
  );
}
