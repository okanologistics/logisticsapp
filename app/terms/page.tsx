import Head from 'next/head';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsAndConditions() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | Okano Logistics</title>
        <meta name="description" content="Read the full Terms and Conditions of Okano Logistics services." />
      </Head>
      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800 font-sans">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: 08/08/2025</p>

        <Section title="1. Working Hours">
          <p>
            Our standard operating hours are <strong>12 hours per day</strong>.<br />
            Services required beyond this period may incur <strong>overtime charges</strong>, depending on the vehicle type and location.
          </p>
        </Section>

        <Section title="2. Airport Pick-Up & Drop-Off">
          <p>
            Each client is entitled to <strong>one airport transfer</strong> (either pick-up or drop-off) per day.<br />
            Additional airport transfers must be booked separately and may incur additional charges.
          </p>
        </Section>

        <Section title="3. Service Routes">
          <p>
            <strong>Mainland Axis:</strong> Ikeja GRA, Murtala Muhammed Airport, Opebi, Allen Avenue, Maryland, Parts of Ogba<br />
            <strong>Island Axis:</strong> Lekki Phase 1 & 2, Victoria Island, Ikoyi, Up to Abraham Adesanya Roundabout (before Lagos Business School)<br />
            <strong>Off-Route Areas (Subject to Extra Conditions):</strong> Destinations such as Badagry, Epe, and Sangotedo (beyond Shoprite):<br />
            <ul className="list-disc pl-6 mt-2">
              <li>Will incur additional charges</li>
              <li>Require mandatory security escort for safety of passengers and vehicles</li>
            </ul>
          </p>
        </Section>

        <Section title="4. Change of Destination During Trip">
          <p>
            Any change in destination must be approved in writing by Okano Logistics.<br />
            Clients are required to notify us immediately for changes.<br />
            Approval will be communicated to both the driver and the client.<br />
            Unauthorized changes may result in service cancellation or extra charges.
          </p>
        </Section>

        <Section title="5. Prohibited Use of Vehicles">
          <p>
            Our vehicles must not be used for:
            <ul className="list-disc pl-6 mt-2">
              <li>Illegal activities</li>
              <li>Transporting drugs, weapons, or contraband</li>
            </ul>
            Violation of this policy will result in:
            <ul className="list-disc pl-6 mt-2">
              <li>Immediate service termination</li>
              <li>Notification to law enforcement authorities</li>
              <li>No refund of any fees paid</li>
            </ul>
          </p>
        </Section>

        <Section title="6. Overtime & Off-Route Charges">
          <p>
            Overtime applies after <strong>12 continuous hours</strong> of service.<br />
            Rates vary by vehicle type and location.<br />
            Off-route trips (see Section 3) are subject to:
            <ul className="list-disc pl-6 mt-2">
              <li>Extra charges</li>
              <li>Mandatory security escort fees</li>
            </ul>
          </p>
        </Section>

        <Section title="7. Client Responsibilities">
          <p>
            Clients are expected to:
            <ul className="list-disc pl-6 mt-2">
              <li>Provide accurate and timely trip details</li>
              <li>Pay all applicable charges (including overtime and off-route fees)</li>
              <li>Treat company property — including vehicles and staff — with respect</li>
            </ul>
            Failure to comply may result in denial of future services.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            Okano Logistics is not liable for:
            <ul className="list-disc pl-6 mt-2">
              <li>Delays caused by traffic, weather, or other uncontrollable events</li>
              <li>Loss, damage, or theft of personal items during transit</li>
            </ul>
            We are committed to taking all reasonable steps to ensure your comfort and safety.
          </p>
        </Section>

        <Section title="9. Agreement to Terms">
          <p>
            By booking or using our services, you confirm that you have read, understood, and accepted these Terms and Conditions.<br />
            Okano Logistics reserves the right to update these terms at any time without prior notice.
          </p>
        </Section>

        <Section title="Need Help?">
          <p>
            For inquiries or special requests, contact us at:
            <ul className="list-disc list-inside mt-2">
              <li>📞 +2347037221197</li>
              <li>✉️ support@okanologistics.com</li>
              <li>🌐 www.okanologistics.com</li>
            </ul>
          </p>
        </Section>
      </main>
    </>
  );
}
