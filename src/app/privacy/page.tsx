import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 1, 2026">
      <p>ChessCast respects your privacy. This policy explains what we collect and how we use it.</p>
      <div>
        <h2>1. What we collect</h2>
        <ul>
          <li>Your display name, game history, saved clips and coin balance.</li>
          <li>Your email address when you subscribe or use a contact form.</li>
          <li>Payments are processed directly by Stripe; ChessCast never stores card numbers.</li>
        </ul>
      </div>
      <div>
        <h2>2. How we use it</h2>
        <ul>
          <li>To run matches, AI commentary and Chaos Cards.</li>
          <li>To create highlight clips and recommend content.</li>
          <li>To provide support and prevent cheating and fraud.</li>
        </ul>
      </div>
      <div>
        <h2>3. AI commentary</h2>
        <p>To generate commentary, moves and positions (without personal information) may be sent to an AI model provider.</p>
      </div>
      <div>
        <h2>4. Your rights</h2>
        <p>
          You can request access to, correction of or deletion of your data at any time via <a href={`mailto:${site.emails.support}`}>{site.emails.support}</a>.
        </p>
      </div>
    </LegalPage>
  );
}
