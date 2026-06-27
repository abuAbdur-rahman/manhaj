# 9. Admin New Episode (`/admin/episodes/new`) — §4.10

- **Route:** `app/(admin)/admin/episodes/new/page.tsx`
- **Layout:** Header (breadcrumb "Episodes > New"), AdminSidebar (desktop), AdminMobileNav (mobile)
- **Sections:**
  1. Title — Input
  2. Series — Select (scoped to admin's scholar)
  3. Language — Select (Yoruba, English, Arabic)
  4. Tags — Chip multi-select (Aqeedah, Fiqh, Tafseer, etc.)
  5. Audio file — file input + upload progress bar (percentage + bar)
  6. Recorded date — Input type="date"
  7. Description — Input (textarea)
  8. Actions — Button "Save draft", Button primary "Publish"
- **Validation:** title required, series required, audio file required for publish
- **Error state:** field-level validation errors, upload failure with retry
- **Loading state:** Button disabled during upload/submit
- **Components used:** Header, AdminSidebar, AdminMobileNav, Input, Select, Chip, Button, Badge