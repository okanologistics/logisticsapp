import Head from 'next/head';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy & Refunds | Okano Logistics</title>
        <meta name="description" content="Read the Privacy Policy and Cancellation & Refund Policy of Okano Logistics." />
      </Head>
      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800 font-sans">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: 08/08/2025</p>

        <Section title="1. Information We Collect">
          <ul className="list-disc pl-6 mt-2">
            <li>Full name, phone number, and email address</li>
            <li>Pick-up and drop-off locations</li>
            <li>Payment and billing details</li>
            <li>Emergency contact information (optional)</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-6 mt-2">
            <li>Provide and manage transportation and logistics services</li>
            <li>Send trip confirmations and updates</li>
            <li>Process payments securely</li>
            <li>Improve safety and customer service</li>
            <li>Fulfill legal or regulatory obligations</li>
          </ul>
          <p className="mt-2">We do not sell, rent, or share your data with third parties unless:
            <ul className="list-disc pl-6 mt-2">
              <li>Required by law</li>
              <li>Shared with trusted service providers (e.g., payment processors) under strict confidentiality agreements</li>
            </ul>
          </p>
        </Section>

        <Section title="3. Data Security">
          <p>We implement reasonable technical and organizational safeguards to protect your personal information. However, no method of internet transmission or electronic storage is 100% secure.</p>
        </Section>

        <Section title="4. Data Retention">
          <p>We retain your data only for as long as needed to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide our services</li>
            <li>Meet legal requirements</li>
            <li>Resolve disputes</li>
          </ul>
        </Section>

        <Section title="5. Your Rights">
          <ul className="list-disc pl-6 mt-2">
            <li>Request access to your personal data</li>
            <li>Request correction or deletion</li>
            <li>Opt out of marketing communications at any time</li>
          </ul>
          <p className="mt-2">To make a request, contact us at:<br />📧 contact@okanologistics.com</p>
        </Section>

        <Section title="6. Cookies & Tracking">
          <p>We may use cookies on our website for:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Performance analytics</li>
            <li>User experience optimization</li>
          </ul>
          <p className="mt-2">You may disable cookies in your browser settings.</p>
        </Section>

        <Section title="7. Changes to This Policy">
          <p>We may update this policy periodically. Please revisit this page to stay informed of any changes.</p>
        </Section>

        <h1 className="text-3xl font-bold mb-6 mt-16">Cancellation & Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: 08/08/2025</p>

        <Section title="1. Booking Confirmation">
          <p>A booking is confirmed once a payment or deposit is received and acknowledged. Confirmation will be sent via:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Phone</li>
            <li>Email</li>
            <li>WhatsApp</li>
          </ul>
        </Section>

        <Section title="2. Cancellation by Client">
          <ul className="list-disc pl-6 mt-2">
            <li><strong>More than 48 hours before service:</strong> ✅ Full refund or rescheduling option</li>
            <li><strong>Less than 48 hours before service:</strong> ⚠️ 50% cancellation fee</li>
            <li><strong>Less than 24 hours or no-show:</strong> ❌ No refund</li>
          </ul>
        </Section>

        <Section title="3. Cancellation by Okano Logistics">
          <p>In rare cases (e.g., vehicle issues, security concerns), we may need to cancel or reschedule your trip. In such cases:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>We will notify you promptly</li>
            <li>You will receive a full refund or the option to reschedule</li>
          </ul>
        </Section>

        <Section title="4. Refund Processing">
          <ul className="list-disc pl-6 mt-2">
            <li>Approved refunds will be issued within 3–7 business days</li>
            <li>Refunds will be processed using the original payment method</li>
          </ul>
        </Section>

        <Section title="5. Modifying a Booking">
          <p>If you need to change the trip time, destination, or vehicle, please notify us at least 12 hours before service.<br />Late changes may incur extra charges or be denied due to availability.</p>
        </Section>

        <Section title="6. Contact for Cancellations or Refunds">
          <p>To cancel, modify, or request a refund, contact us:<br />📞 +23470<br />📧 [Insert Email Address]</p>
        </Section>
      </main>
    </>
  );
}
