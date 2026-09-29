import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller Terms & Conditions — Kova',
  description:
    'The terms every Kova seller agrees to: eligibility, listings, payouts, prohibited items, fulfillment, taxes, refunds, disputes, account termination and more. Version 1.0.',
};

/**
 * KOVA Seller Terms — versioned copy. Bump VERSION when sections change;
 * sellers must re-accept after a major revision.
 */
const VERSION = '1.0';
const LAST_UPDATED = 'September 28, 2026';

interface TermSection {
  n: string;
  title: string;
  body: string[];
  list?: string[];
}

const SECTIONS: TermSection[] = [
  {
    n: '01',
    title: 'Eligibility',
    body: [
      'To sell on Kova you must be at least 18 years old (or the age of legal majority in your jurisdiction) and legally able to enter into a binding contract. You must provide accurate, current and complete information about yourself and your business during registration and keep it up to date.',
      'A seller account is tied to a single person or registered business. One person may operate one store account. Kova may request identification or business documentation to verify your eligibility before approving or while reviewing your application.',
    ],
  },
  {
    n: '02',
    title: 'Account & seller responsibilities',
    body: [
      'You are responsible for all activity that happens under your account, including actions taken by anyone you allow to use it. Keep your password secure and notify us immediately of any unauthorized access.',
      'You agree to: respond to buyer messages in a reasonable time; honor the price, description and availability you list; fulfill orders as promised; and keep your store profile accurate. You remain fully responsible for your products, content, and compliance with the laws that apply to you.',
    ],
  },
  {
    n: '03',
    title: 'Listings & product quality',
    body: [
      'Every listing must be honest and accurately represent the product: photographs of the actual item, truthful materials, dimensions, condition and inventory counts. Stock photos that misrepresent the item are not permitted.',
      'Listings may be placed in review before publication and may be removed if they are incomplete, misleading, miscategorized, or otherwise violate these terms. Repeated violations can lead to removal of products, suspension of your store, or termination of your account.',
    ],
  },
  {
    n: '04',
    title: 'Pricing, fees & payouts',
    body: [
      'You set your own prices in the currency Kova displays. Kova may charge a commission or fee on sales; the rate applied to your store is shown at the time of listing or in your dashboard. We will give you reasonable notice before changing fee structures.',
      'Payouts are processed through the payment provider connected to your account. You are responsible for supplying correct payout details and for any provider fees, transfer delays or holds the provider applies.',
    ],
  },
  {
    n: '05',
    title: 'Prohibited items & conduct',
    body: [
      'You may not list or sell anything that is illegal, unsafe, or prohibited by Kova policy, including but not limited to:',
    ],
    list: [
      'Counterfeit or unauthorized copies of branded goods',
      'Weapons, ammunition, explosives or controlled substances',
      'Adult material, and content that exploits or endangers minors',
      'Stolen goods, hacked accounts, or fraudulent services',
      'Medical claims or products marketed deceptively',
      'Live animals, protected species, or items made from them where trade is restricted',
      'Anything whose sale would violate the law of the buyer\u2019s or seller\u2019s country',
    ],
  },
  {
    n: '06',
    title: 'Reviews & ratings',
    body: [
      'Buyers may review products and sellers. You may not offer incentives for positive reviews, exchange reviews with other sellers, or attempt to remove or suppress a legitimate review through pressure or misreporting.',
      'Reviews reflect the opinion of the buyer, not of Kova. You may respond to reviews professionally; abusive responses violate these terms.',
    ],
  },
  {
    n: '07',
    title: 'Shipping & fulfillment (physical products)',
    body: [
      'For physical products you must ship within the handling time shown on your listing, use a trackable method where possible, provide tracking numbers in the seller dashboard, and package items to survive transit.',
      'If an order cannot be fulfilled, cancel it promptly and notify the buyer. Repeated cancellations, late shipments, or items that do not match their description can lead to withheld payouts, suspension or termination.',
    ],
  },
  {
    n: '08',
    title: 'Digital products',
    body: [
      'For digital products you confirm you own or are licensed to distribute the files you upload, that they are free of malware, and that they match their description. Deliver files promptly through Kova\u2019s delivery flow.',
      'Buyers of digital products may be entitled to a refund where the product is materially not as described or does not work as promised, at Kova\u2019s reasonable discretion.',
    ],
  },
  {
    n: '09',
    title: 'Taxes & legal compliance',
    body: [
      'You are responsible for determining, collecting, reporting and remitting any taxes (including VAT, sales tax and income tax) that apply to your sales. Kova does not provide tax advice.',
      'You must comply with all laws applicable to your business: consumer protection, product safety, import/export, labeling and data protection. Kova may cooperate with lawful requests from authorities regarding your account.',
    ],
  },
  {
    n: '10',
    title: 'Returns & refunds',
    body: [
      'Your store\u2019s return policy must be stated clearly on your profile or listings and cannot be less favorable than what consumer law grants the buyer. Where a buyer is entitled to a return or refund, you will honor it.',
      'Kova may issue a refund to a buyer and offset it against your payouts when a product was never delivered, is materially not as described, or you are unresponsive during a dispute.',
    ],
  },
  {
    n: '11',
    title: 'Disputes & chargebacks',
    body: [
      'Buyers are encouraged to contact you first. You agree to respond to buyer concerns and Kova inquiries promptly and in good faith during a dispute.',
      'If a payment is disputed or reversed by the buyer\u2019s bank, Kova may withhold the disputed amount from your payouts and may ask you for evidence (proof of delivery, correspondence). Outcomes follow the payment provider\u2019s rules where they apply.',
    ],
  },
  {
    n: '12',
    title: 'Content licensing & intellectual property',
    body: [
      'You keep ownership of the content you upload, but grant Kova a worldwide, royalty-free license to host, display and promote it for the purpose of operating and marketing the marketplace — e.g. featuring your product on the homepage or a category page.',
      'Do not list anything that infringes someone else\u2019s copyright, trademark or other rights. Rights holders may report infringement; Kova may remove reported listings while reviewing the report.',
    ],
  },
  {
    n: '13',
    title: 'Privacy & data protection',
    body: [
      'Buyer data you receive through Kova (names, addresses, emails) may only be used to fulfill and support the related order. You may not sell, share, or use it for marketing without the buyer\u2019s consent.',
      'You must protect that data with reasonable security and delete it when it is no longer needed for the order, subject to record-keeping duties that apply to you.',
    ],
  },
  {
    n: '14',
    title: 'Account verification, review & rejection',
    body: [
      'New stores submit an application that Kova reviews before they go live. We may approve, reject or request more information about any application. You will be told the reason for a rejection, and you may re-apply after correcting the issues.',
      'Providing false information during application — fake identity, misappropriated photos, staged reviews — is grounds for permanent blocking.',
    ],
  },
  {
    n: '15',
    title: 'Suspension & termination',
    body: [
      'Kova may suspend or block a store that violates these terms, fails to fulfill orders, or creates risk for buyers. During suspension your published products are hidden and new publishing is disabled. Termination ends payouts of amounts legitimately owed, less amounts withheld for disputes or violations.',
      'You may stop selling at any time by deleting your account from your profile page. Deleting your account removes your store and products from the marketplace. Sections that by their nature should survive termination (payouts owed, disputes already opened, licenses already granted to buyers) survive.',
    ],
  },
  {
    n: '16',
    title: 'Disclaimers & limitation of liability',
    body: [
      'Kova provides the marketplace \u201cas is\u201d and works to keep it safe and available, but does not guarantee uninterrupted service or that every buyer or seller will act in good faith.',
      'To the maximum extent permitted by law, Kova is not liable for indirect or consequential losses (lost profits, lost data, lost goodwill). Kova\u2019s total liability to you for any claim is limited to the total fees you paid to Kova in the six months before the claim, or $100, whichever is greater. Nothing in this section limits liability that cannot be limited by law.',
    ],
  },
  {
    n: '17',
    title: 'Changes to these terms',
    body: [
      'We may update these Seller Terms as the marketplace evolves. The version number at the top of this page changes when we do, and significant changes are announced to sellers by email or dashboard notice.',
      'Continuing to sell after a new version takes effect means you accept it. If a change is unacceptable to you, you may stop selling and delete your account before the effective date.',
    ],
  },
  {
    n: '18',
    title: 'Contact & support',
    body: [
      'Questions about these terms, your application, a payout, or a dispute: reach the seller support team through the contact page. Include your store name and, where relevant, order numbers.',
      'Formal notices to Kova should be sent through the same channel and will be confirmed by reply when received.',
    ],
  },
];

export default function SellerTermsPage() {
  return (
    <div className="bg-[#F5F0E8]">
      {/* Hero */}
      <section className="px-4 sm:px-5 md:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14">
        <div className="max-w-[860px] mx-auto">
          <span className="inline-block text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-[#E8622A] bg-[#E8622A]/[0.08] rounded-full px-4 py-1.5 mb-6">
            Seller Terms &amp; Conditions
          </span>
          <h1
            className="font-extrabold text-[#0D0D0D] leading-[1.02] tracking-[-0.03em] mb-5"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 7vw, 3.2rem)' }}
          >
            The agreement between you and the marketplace.
          </h1>
          <p className="text-black/55 text-[0.95rem] sm:text-[1.05rem] leading-relaxed max-w-[640px] mb-6">
            These terms govern your Kova store: what you can sell, how you treat buyers, how you get paid, and
            what happens when things go wrong. Written in plain language — deliberately.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[0.74rem] text-black/45">
            <span className="rounded-full bg-white border border-black/[0.08] px-3.5 py-1.5 font-semibold text-[#0D0D0D]">
              Version {VERSION}
            </span>
            <span>Last updated {LAST_UPDATED}</span>
          </div>
        </div>
      </section>

      {/* Table of contents */}
      <section className="px-4 sm:px-5 md:px-8 pb-4">
        <div className="max-w-[860px] mx-auto">
          <nav aria-label="Table of contents" className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-7">
            <h2 className="font-bold text-[0.9rem] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              On this page
            </h2>
            <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {SECTIONS.map((s) => (
                <li key={s.n}>
                  <a
                    href={`#section-${s.n}`}
                    className="group flex items-baseline gap-2.5 text-[0.82rem] text-black/55 hover:text-[#E8622A] transition-colors"
                  >
                    <span className="font-semibold text-black/30 group-hover:text-[#E8622A] transition-colors text-[0.7rem]">
                      {s.n}
                    </span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Sections */}
      <section className="px-4 sm:px-5 md:px-8 pb-12 sm:pb-16">
        <div className="max-w-[860px] mx-auto flex flex-col gap-3 sm:gap-4">
          {SECTIONS.map((s) => (
            <article
              key={s.n}
              id={`section-${s.n}`}
              className="scroll-mt-24 bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-6 sm:p-8"
            >
              <div className="flex items-baseline gap-3 mb-3.5">
                <span
                  className="font-extrabold text-[#E8622A] text-[0.85rem] tracking-[0.06em] flex-shrink-0"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {s.n}
                </span>
                <h2
                  className="font-extrabold text-[#0D0D0D] text-[1.05rem] sm:text-[1.2rem] leading-snug"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {s.title}
                </h2>
              </div>
              <div className="space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className="text-[0.88rem] text-black/55 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[0.86rem] text-black/55 leading-relaxed">
                      <span className="text-[#E8622A] mt-[0.35rem] flex-shrink-0" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                          <circle cx="5" cy="5" r="4" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Plain-language summary + CTA */}
      <section className="px-4 sm:px-5 md:px-8 pb-16 sm:pb-24">
        <div className="max-w-[860px] mx-auto">
          <div className="bg-[#0D0D0D] rounded-[20px] sm:rounded-[24px] px-6 sm:px-10 py-10 sm:py-12">
            <h2
              className="text-[#F5F0E8] font-extrabold leading-[1.1] tracking-[-0.02em] mb-4"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4.5vw, 1.8rem)' }}
            >
              The short version
            </h2>
            <ul className="space-y-2.5 mb-9">
              {[
                'Be real: honest listings, real photos, ships when you say it will.',
                'Sell what you are allowed to sell — nothing counterfeit, illegal or unsafe.',
                'You set the price; Kova takes the fee it shows you, and payout details are your responsibility.',
                'Buyer data is for fulfilling orders only — never for your own marketing.',
                'Break the rules and your store can be suspended, blocked or removed.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[0.88rem] text-[#F5F0E8]/70 leading-relaxed">
                  <span className="text-[#E8622A] font-bold mt-[0.1rem] flex-shrink-0" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sell"
                className="px-7 py-3 rounded-full bg-[#E8622A] text-white font-medium hover:bg-[#F07A48] transition-colors text-center"
              >
                Apply to sell
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3 rounded-full border border-[#F5F0E8]/25 text-[#F5F0E8] font-medium hover:bg-[#F5F0E8]/10 transition-colors text-center"
              >
                Ask a question
              </Link>
            </div>
            <p className="text-[0.7rem] text-[#F5F0E8]/35 mt-6">
              This page is the operative Seller Terms document. It is written to be readable on purpose, but it
              is a legal agreement — have a lawyer review it for your specific situation before relying on it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
