import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      updated="17 November 2026"
      intro={
        <p>
          These terms cover your use of Slotline, an online appointment book for salons, clinics and other businesses that work by
          appointment. By creating an account or using the service you agree to them. If you do not agree, do not use the service.
        </p>
      }
      sections={[
        {
          heading: "Your account",
          body: (
            <>
              <p>You must be at least 18 years old and allowed to act for the business you register. Keep your sign-in details private and tell us straight away if you think someone else has used your account.</p>
              <p>You are responsible for everything done through your account, including by staff you give access to.</p>
            </>
          ),
        },
        {
          heading: "Client and patient information",
          body: (
            <>
              <p>
                Your account holds details of the people who book with you, such as names, phone numbers, appointment times and notes. You
                decide what is stored, and you are responsible for having a lawful reason to store it and for telling those people how
                their details are used.
              </p>
              <p>Do not store medical records, diagnoses, payment card numbers or government ID numbers in booking notes.</p>
              <p>How we handle this information is set out in our <Link href="/privacy" className="font-semibold underline underline-offset-4">Privacy Policy</Link>.</p>
            </>
          ),
        },
        {
          heading: "Bookings",
          body: (
            <p>
              Bookings may come from your phone line or be added by you. Check important appointments against your own records. We are not
              responsible for missed, double or incorrect bookings, or for disputes between you and your clients or patients.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              Do not use the service for anything unlawful, to send unwanted messages, to store information you have no right to hold, or
              to try to access other accounts or disrupt the service.
            </p>
          ),
        },
        {
          heading: "Fees",
          body: (
            <p>
              The service is free during early access. Before any paid plan starts we will tell you the price at least 30 days in advance,
              and you can close your account instead of paying.
            </p>
          ),
        },
        {
          heading: "Availability and changes",
          body: (
            <p>
              We work to keep the service running but cannot promise it will always be available or free of errors. We may change or
              improve features. If a change affects you significantly we will tell you first.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              The service is provided as is. To the extent the law allows, we are not liable for indirect losses such as lost income or
              lost bookings. Nothing in these terms limits liability that cannot be limited by law.
            </p>
          ),
        },
        {
          heading: "Closing your account",
          body: (
            <p>
              You can close your account at any time. We may suspend or close an account that breaks these terms. After closing, you can
              ask for an export of your data within 30 days, after which it is deleted.
            </p>
          ),
        },
        {
          heading: "Changes to these terms",
          body: <p>We may update these terms. The date at the top shows the latest version. If you keep using the service after a change, the new terms apply.</p>,
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-4">{CONTACT_EMAIL}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
