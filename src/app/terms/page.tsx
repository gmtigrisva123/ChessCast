import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 1, 2026">
      <p>Welcome to ChessCast. By using the platform you agree to the terms below. This is a launch summary and will be finalized with legal counsel.</p>
      <div>
        <h2>1. The service</h2>
        <p>ChessCast offers live chess viewing and play with AI commentary, Chaos Cards, Chess Court, Chess Royale and related entertainment features.</p>
      </div>
      <div id="coins" className="scroll-mt-28">
        <h2>2. Chaos Coins &amp; virtual items</h2>
        <ul>
          <li>Chaos Coins are virtual entertainment items usable only inside ChessCast.</li>
          <li>Coins have no cash value and cannot be withdrawn, transferred or resold.</li>
          <li>Coins can never be used to bet on the outcome of a game. ChessCast offers no form of gambling.</li>
          <li>Coins spent on Chaos Cards or tips are non-refundable, except when a card fails to activate.</li>
        </ul>
      </div>
      <div>
        <h2>3. Memberships</h2>
        <p>Fan Pro and Chaos Lord renew automatically for the billing cycle you chose. You can cancel at any time; benefits remain until the end of the paid period.</p>
      </div>
      <div>
        <h2>4. Conduct</h2>
        <ul>
          <li>No cheating, engine assistance during play or abuse of system bugs.</li>
          <li>Tips and chat must not insult, harass or discriminate. The AI hosts will refuse requests that do.</li>
          <li>Chess Court penalties are entertainment challenges only and never cause players material loss.</li>
        </ul>
      </div>
      <div>
        <h2>5. Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${site.emails.support}`}>{site.emails.support}</a>.
        </p>
      </div>
    </LegalPage>
  );
}
