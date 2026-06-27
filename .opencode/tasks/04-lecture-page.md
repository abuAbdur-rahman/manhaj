# 4. Lecture/Episode Page (`/lectures/[slug]`) — §4.4

- **Route:** `app/(public)/lectures/[slug]/page.tsx`
- **Layout:** Header (back left, share right), BottomNav, MiniPlayer appears when playing
- **Sections:**
  1. Large PlayButton (PlayButton size="lg")
  2. Episode title (display), Scholar · Series (caption), Badge (language), Badge (tags)
  3. Scrubber + PlayerControls (speed, sleep timer, skip)
  4. CTAs: [⬇ Download] Button + [Share via WhatsApp] Button
  5. Description text + recorded date
  6. "More from this series" — horizontal EpisodeCard list
- **Loading:** Skeleton + WaveformSkeleton for player area
- **Error state:** "Couldn't load this lecture. Check your connection and try again." + retry
- **Offline state:** "You're offline and this lecture isn't downloaded yet. Connect to play, or download lectures in advance from the Downloads tab."
- **Components used:** Header, BottomNav, MiniPlayer, PlayButton, Scrubber, PlayerControls, Badge, Chip, EpisodeCard, WaveformSkeleton, Button