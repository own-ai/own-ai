import Link from "next/link";

export const metadata = {
  title: "Legal Notice / Impressum | ownAI",
};

export default function LegalPage() {
  return (
    <section className="container prose py-8 dark:prose-invert md:max-w-[64rem] md:py-12 lg:py-24">
      <h1 className="font-cal">Legal Notice / Impressum</h1>
      <h2 className="font-cal">Information according to § 5 TMG</h2>
      <p>
        ownAI
        <br />
        Jan Pawellek
        <br />
        Liebigstrasse 12
        <br />
        76135 Karlsruhe
        <br />
        Germany
        <br />
        Represented by: Jan Pawellek
      </p>
      <h2 className="font-cal">Contact us</h2>
      <p>
        E-mail:{" "}
        <Link
          href="mailto:info@ownai.com"
          className="font-semibold underline decoration-stone-500 underline-offset-4 dark:decoration-stone-400"
        >
          info@ownai.com
        </Link>
        <br />
        Phone:{" "}
        <Link
          href="tel:+4915679016662"
          className="font-semibold underline decoration-stone-500 underline-offset-4 dark:decoration-stone-400"
        >
          +49 15679 016662
        </Link>
        <br />
      </p>
      <h2 className="font-cal">Sales tax ID</h2>
      <p>DE343249257</p>
      <h2 className="font-cal">EU dispute resolution</h2>
      <p>
        The European Commission provides a platform for online dispute
        resolution (ODR):{" "}
        <Link
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          className="font-semibold underline decoration-stone-500 underline-offset-4 dark:decoration-stone-400"
        >
          https://ec.europa.eu/consumers/odr/
        </Link>
      </p>
      <h2 className="font-cal">Data protection notice</h2>
      <p>
        You can find our Privacy Policy at:{" "}
        <Link
          href="/privacy"
          className="font-semibold underline decoration-stone-500 underline-offset-4 dark:decoration-stone-400"
        >
          https://ownai.com/privacy
        </Link>
      </p>
    </section>
  );
}
