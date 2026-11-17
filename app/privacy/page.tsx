import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="17 November 2026"
      intro={<p>This policy explains what information Slotline holds, why, and the choices you have.</p>}
      sections={[
        {
          heading: "What we collect",
          body: (
            <>
              <p><strong>About you:</strong> your name, business name, email address and how you sign in.</p>
              <p><strong>About the people who book with you:</strong> names, phone numbers, appointment details and any notes added to a booking.</p>
              <p><strong>Usage:</strong> basic technical information such as browser type and pages visited, used to keep the service working.</p>
            </>
          ),
        },
        {
          heading: "Why we use it",
          body: <p>To run your appointment book, show your schedule and reports, keep accounts secure, and contact you about the service. We do not sell personal information or use it for advertising.</p>,
        },
        {
          heading: "Who can see it",
          body: <p>You and the staff you give access to. Service providers that host the service may process it on our behalf under contract. We share information with authorities only when the law requires it.</p>,
        },
        {
          heading: "How long we keep it",
          body: <p>For as long as your account is open. When you close it, we delete your data within 30 days unless the law requires us to keep it longer.</p>,
        },
        {
          heading: "Your choices",
          body: <p>You can see, correct, export or delete the information in your account. People who booked with you can ask you, or us, to correct or remove their details.</p>,
        },
        {
          heading: "Security",
          body: <p>Information is sent over encrypted connections and access is limited to people who need it. No system is perfectly secure, so please use a strong password and keep it private.</p>,
        },
        {
          heading: "Contact",
          body: (
            <p>
              Privacy questions or requests: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-4">{CONTACT_EMAIL}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
