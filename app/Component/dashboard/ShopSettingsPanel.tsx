'use client';
// ============================================================
// KOVA — Seller Dashboard · Shop Management tab
// Shop name, description, location and logo — persisted through
// PATCH /api/sellers/profile. Logo uploads go through the real
// POST /api/uploads/image endpoint (Cloudinary-backed), the same
// pipeline product images use. The public shop URL is shown and
// linked: /store/<storeSlug>.
// ============================================================

import { useRef, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/app/Component/ToastContext';
import type { SellerProfile } from '@/lib/types';

const inputClass =
  'w-full rounded-[12px] bg-[#F5F0E8] border border-black/[0.09] text-[0.9rem] text-[#0D0D0D] placeholder:text-black/30 px-4 py-3 outline-none focus:border-[#E8622A] focus:ring-2 focus:ring-[#E8622A]/15 transition-all duration-200';

export function ShopSettingsPanel({ profile, onSaved }: { profile: SellerProfile; onSaved: () => void }) {
  const { addToast } = useToast();
  const [storeName, setStoreName] = useState(profile.storeName);
  const [description, setDescription] = useState(profile.description ?? '');
  const [location, setLocation] = useState((profile as any).location ?? '');
  const [payoutEmail, setPayoutEmail] = useState((profile as any).payoutEmail ?? '');
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const dirty =
    storeName !== profile.storeName ||
    description !== (profile.description ?? '') ||
    location !== ((profile as any).location ?? '') ||
    payoutEmail !== ((profile as any).payoutEmail ?? '') ||
    logoUrl !== (profile.logoUrl ?? '');

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please choose an image file for the shop logo.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Logo must be under 5 MB.', 'error');
      return;
    }
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.uploadImage(form);
      setLogoUrl(res.url);
      addToast('Logo uploaded — press Save to apply it to your shop.');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Logo upload failed. Try again.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    if (storeName.trim().length < 2) {
      addToast('Shop name must be at least 2 characters.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.updateSellerProfile({
        storeName: storeName.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        payoutEmail: payoutEmail.trim() || undefined,
        logoUrl: logoUrl || undefined,
      });
      addToast('Shop details saved.');
      onSaved();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Could not save shop details.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      {/* ── Form ── */}
      <section className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-7">
        <h2 className="font-extrabold text-[1.05rem] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Shop details
        </h2>
        <p className="text-[0.8rem] text-black/45 mb-6">
          Shown on your public shop page and wherever your products appear.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="shop-name" className="block text-[0.78rem] font-semibold text-[#0D0D0D] mb-1.5">
              Shop name
            </label>
            <input
              id="shop-name"
              type="text"
              value={storeName}
              maxLength={60}
              onChange={(e) => setStoreName(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-[0.68rem] text-black/35">
              The web address /store/{profile.storeSlug} keeps working even if you rename the shop.
            </p>
          </div>

          <div>
            <label htmlFor="shop-desc" className="block text-[0.78rem] font-semibold text-[#0D0D0D] mb-1.5">
              Shop description
            </label>
            <textarea
              id="shop-desc"
              value={description}
              rows={4}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you sell, how you make it, what makes your shop worth a visit…"
              className={inputClass}
            />
            <p className="mt-1 text-[0.68rem] text-black/35">{500 - description.length} characters left</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shop-loc" className="block text-[0.78rem] font-semibold text-[#0D0D0D] mb-1.5">
                Location <span className="font-normal text-black/35">(city / state)</span>
              </label>
              <input
                id="shop-loc"
                type="text"
                value={location}
                maxLength={80}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="shop-payout" className="block text-[0.78rem] font-semibold text-[#0D0D0D] mb-1.5">
                Payout email <span className="font-normal text-black/35">(optional)</span>
              </label>
              <input
                id="shop-payout"
                type="email"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                placeholder="payments@yourshop.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className={[
                'px-7 py-2.5 rounded-full font-medium text-[0.85rem] transition-all',
                saving || !dirty
                  ? 'bg-black/[0.06] text-black/35 cursor-not-allowed'
                  : 'bg-[#E8622A] text-white hover:bg-[#F07A48] active:scale-[0.98]',
              ].join(' ')}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {dirty && <span className="text-[0.72rem] text-black/40">Unsaved changes</span>}
          </div>
        </div>
      </section>

      {/* ── Preview column ── */}
      <aside className="space-y-5">
        <section className="bg-white rounded-[16px] sm:rounded-[20px] border border-black/[0.07] p-5 sm:p-6">
          <h3 className="font-extrabold text-[0.92rem] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Shop logo
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F5F0E8] border border-black/[0.08] flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Shop logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-extrabold text-[1.4rem] text-[#E8622A]" style={{ fontFamily: 'var(--font-display)' }}>
                  {storeName.trim().slice(0, 1).toUpperCase() || 'K'}
                </span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="px-4 py-2 rounded-full border border-black/[0.14] text-[0.78rem] font-medium text-[#0D0D0D] hover:border-black/30 transition-colors disabled:opacity-50"
              >
                {uploadingLogo ? 'Uploading…' : logoUrl ? 'Change logo' : 'Upload logo'}
              </button>
              <p className="mt-1.5 text-[0.66rem] text-black/35">PNG/JPG · up to 5 MB</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
        </section>

        <section className="bg-[#0D0D0D] rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 text-[#F5F0E8]">
          <h3 className="font-extrabold text-[0.92rem] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Your public shop
          </h3>
          <p className="text-[0.76rem] text-[#F5F0E8]/55 mb-4 leading-relaxed">
            Every product you publish appears here automatically — no manual steps.
          </p>
          <Link
            href={`/store/${profile.storeSlug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E8622A] text-white text-[0.78rem] font-medium hover:bg-[#F07A48] transition-colors"
          >
            Visit /store/{profile.storeSlug} →
          </Link>
        </section>
      </aside>
    </div>
  );
}
