# 7. Admin Login (`/admin/login`) — §4.8

- **Route:** `app/(admin)/admin/login/page.tsx`
- **Layout:** Standalone — no Header, no Sidebar, no BottomNav. Centered card.
- **Sections:**
  1. WaveformSeal (inline) + "Manhaj Admin" title
  2. Input (email) + Input (password, type="password")
  3. Button (primary, full width) "Log in"
- **Error state:** "Invalid email or password." (inline below form)
- **Loading state:** Button shows spinner/disabled while submitting
- **Components used:** WaveformSeal, Input, Button