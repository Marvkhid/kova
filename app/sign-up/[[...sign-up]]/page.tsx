// ============================================================
// KOVA — /sign-up
// Redirects to /register, the first-party email + password
// sign-up (no phone number required). The Clerk-hosted sign-up
// was removed because the Clerk instance requires a phone
// number and rejects Nigerian (+234) numbers entirely.
// ============================================================

import { redirect } from 'next/navigation';

export default function SignUpPage() {
  redirect('/register');
}
