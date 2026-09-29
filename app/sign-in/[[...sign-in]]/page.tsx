// ============================================================
// KOVA — /sign-in
// Redirects to /login, the first-party email + password
// sign-in. The Clerk-hosted sign-in was removed because the
// Clerk instance forces a second factor and requires phone
// numbers it does not support (e.g. Nigeria +234).
// ============================================================

import { redirect } from 'next/navigation';

export default function SignInPage() {
  redirect('/login');
}
