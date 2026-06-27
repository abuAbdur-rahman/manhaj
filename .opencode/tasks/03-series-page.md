# 3. Series Page (`/scholars/[slug]/[series]`) — §4.3

- **Route:** `app/(public)/scholars/[slug]/[series]/page.tsx`
- **Layout:** Header (back + series title, scholar name · episode count)
- **Sections:**
  1. Header — "Scholar name · 18 episodes", [▶ Play all] [⬇ Download all] (Button primary + secondary)
  2. Episode list — `EpisodeRow` rows, each with independent download button (44px tap target)
  3. Loading: `WaveformSkeleton` rows
  4. Play action: `PlayButton` on each row, tapping row = play
- **Empty state:** "No episodes in this series yet."
- **Error state:** "Couldn't load episodes. Tap to retry."
- **Components used:** Header, EpisodeRow, PlayButton, WaveformSkeleton, Button