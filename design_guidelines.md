# Stimmung Design Guidelines

## Design Approach: Reference-Based

**Selected References:** Netflix (discovery patterns), Letterboxd (cinephile aesthetic), Spotify (mood-based UX)

**Justification:** Movie discovery apps thrive on emotional engagement and visual immersion. Users expect a cinematic experience that mirrors the content they're exploring. The app bridges entertainment discovery with AI interaction, requiring both visual appeal and functional clarity.

**Core Principles:**
- Cinematic immersion with rich imagery
- Mood-driven color theming
- Clean information hierarchy for multilingual content
- Nostalgic warmth honoring classic cinema

---

## Color Palette

### Dark Mode Primary (Default)
- **Background Base:** 222 15% 8% (deep charcoal, film-noir inspired)
- **Background Elevated:** 222 12% 12% (card backgrounds)
- **Background Accent:** 222 10% 16% (hover states, modal overlays)
- **Text Primary:** 40 5% 96% (warm off-white for readability)
- **Text Secondary:** 40 3% 70% (muted for metadata)
- **Border Subtle:** 222 10% 20% (dividers, card edges)

### Brand Colors
- **Primary (Vintage Gold):** 45 85% 58% (warm, nostalgic accent for CTAs and highlights)
- **Secondary (Film Red):** 355 75% 55% (like/favorite actions, urgency)

### Mood-Based Accent System
Dynamic accent colors shift based on selected mood:
- **Happy/Uplifting:** 50 90% 60% (sunny yellow)
- **Sad/Melancholic:** 215 50% 50% (muted blue)
- **Nostalgic/Cozy:** 25 70% 55% (amber)
- **Adventurous:** 165 60% 48% (teal)
- **Romantic:** 330 65% 60% (rose)
- **Intense/Thrilling:** 5 80% 52% (crimson)

Apply mood accent to: section headers, active mood selector borders, progress indicators

---

## Typography

**Font Families:**
- **Display/Headers:** 'Libre Baskerville' (serif, cinematic elegance for hero and section titles)
- **Body/UI:** 'Inter' (sans-serif, clean readability for descriptions, metadata)
- **Accent/Tags:** 'DM Sans' (geometric sans for mood tags, streaming badges)

**Type Scale:**
- Hero Headline: text-5xl md:text-6xl lg:text-7xl, font-bold
- Section Headers: text-3xl md:text-4xl, font-semibold
- Movie Titles: text-xl md:text-2xl, font-medium
- Body Text: text-base md:text-lg, font-normal, leading-relaxed
- Metadata (year, runtime, language): text-sm, font-medium, text-secondary
- Micro-copy (badges, tags): text-xs, uppercase, tracking-wide

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 8, 12, 16, 20, 24** for consistent rhythm
- Tight spacing: p-2, gap-2 (within badges/tags)
- Standard spacing: p-4, gap-4 (card padding, form fields)
- Section spacing: py-12 md:py-20 lg:py-24 (vertical sections)
- Hero spacing: py-16 md:py-24 lg:py-32 (landing hero)

**Container Strategy:**
- Full-width sections: w-full with inner max-w-7xl mx-auto px-4 md:px-8
- Content width: max-w-6xl for feature grids
- Reading width: max-w-prose (for "About" or help text)

**Grid System:**
- Mood selectors: grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3
- Movie results: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6

---

## Component Library

### 1. Hero Section (Landing)
**Structure:** Full-viewport (min-h-screen) cinematic entry
- **Background:** Large hero image of classic film reels/vintage cinema with 60% dark overlay (bg-black/60)
- **Content:** Centered layout with headline, tagline, dual input modes
- **Headline:** "Discover Classic Films That Match Your Mood" (Libre Baskerville, vintage gold accent underline)
- **Tagline:** "From Bollywood gems to Hollywood legends — timeless cinema for every feeling"
- **Input Modes:** 
  - Quick mood selector (pill-shaped buttons with mood icons)
  - AI text input (large textarea with placeholder: "Describe how you're feeling...")
- **CTA:** Prominent "Find My Movie" button (Primary gold, rounded-full, px-8 py-4, shadow-lg)

### 2. Mood Selector
**Style:** Interactive pill buttons with hover glow
- Base: border-2 border-border-subtle, rounded-full, px-6 py-3, backdrop-blur-sm
- Active state: border-[mood-accent-color], bg-[mood-accent-color]/10, shadow-[0_0_20px_rgba(mood,0.3)]
- Icon + Label layout (flex items-center gap-2)
- Transition: all 300ms ease

### 3. Movie Card
**Dimensions:** aspect-[2/3] poster with overlay on hover
- **Poster:** Full-bleed image with rounded-lg overflow-hidden
- **Overlay (on hover):** bg-gradient-to-t from-black via-black/80 to-transparent
- **Content Reveal:**
  - Title: text-xl, font-bold
  - Year + Runtime: text-sm, text-secondary
  - Rating: Star icon + vote average (IMDb-style)
  - Genres: Pill badges (text-xs, bg-background-accent, rounded-full, px-3 py-1)
  - Language indicator: Flag emoji + "Hindi" / "Dubbed" label
  - Streaming badges: Logo icons for Netflix, Prime, etc. (flex gap-2)
  - Like/Dislike buttons: Icon buttons (heart outline/filled, thumbs down)

### 4. AI Mood Interpreter Panel
**Design:** Elevated card with typewriter effect
- Background: bg-background-elevated, border border-vintage-gold/20, rounded-xl, p-6
- Textarea: Large, bg-background-base, rounded-lg, p-4, min-h-[120px], focus:ring-2 ring-vintage-gold
- AI Processing: Animated gradient border pulse during interpretation
- Output Display: Structured JSON preview (optional debug) + visual mood tags generated

### 5. Results Grid
**Layout:** Masonry-style grid (staggered heights if posters vary)
- Header: "We Found [X] Classics for Your [Mood] Mood" (section title + count)
- Filters: Horizontal scroll chips (year range, language, streaming platform)
- Load More: Infinite scroll or "Show More" button at bottom

### 6. Navigation
**Style:** Sticky header with blur backdrop
- Logo: "Stimmung" in Libre Baskerville with vintage film reel icon
- Links: Discover, About, Languages (dropdown for multi-language)
- Account: Future placeholder with ghost icon
- Background: bg-background-base/80, backdrop-blur-md, border-b border-border-subtle

### 7. Footer
**Content-Rich Design:**
- 4-column layout: About, Languages, Legal, Social/Newsletter
- TMDb attribution logo + text (legally required)
- "🔧 Testing Mode – Non-commercial" badge
- Language selector (flags + names)
- Newsletter signup: Input + button combo (inline)

### 8. Streaming Availability Badges
**Style:** Compact logo pills
- Small platform logos (Netflix, Prime, Disney+, etc.)
- Badge: flex items-center gap-1.5, bg-background-accent, rounded-full, px-2.5 py-1, text-xs
- Hover: slight scale(1.05) transform

### 9. Feedback Buttons
**Design:** Minimal icon buttons with tooltips
- Like: Heart icon (outline → filled on click), text-secondary → text-vintage-gold
- Dislike: Thumbs down (outline → filled), text-secondary → text-film-red
- Positioned: Bottom-right of movie card overlay
- Tooltip: "Love it" / "Not for me" on hover

---

## Images

### Hero Image
**Description:** Cinematic vintage film reel montage or classic movie theater interior with warm amber lighting. Evokes nostalgia and timeless cinema. High-resolution, wide aspect ratio (21:9 or 16:9).
**Placement:** Full-bleed background for hero section with 60% dark overlay for text contrast.
**Alternative:** Collage of iconic classic film posters (grayscale with selective color accents).

### Decorative Accents
- Film strip border patterns (subtle, used sparingly as section dividers)
- Vintage camera/projector icons for empty states

---

## Animations

**Minimal, Purposeful Only:**
- Mood selector: 300ms border glow transition on select
- Movie card: Opacity 0→1 on scroll-in (stagger 50ms delay)
- AI processing: Subtle gradient pulse on interpreter border
- Button hovers: Scale 1→1.02 transform (150ms ease)
- **No:** Parallax, continuous loops, or gratuitous scroll effects

---

## Accessibility Notes

- Maintain WCAG AA contrast (all text on backgrounds)
- Focus states: 2px ring-vintage-gold ring-offset-2 ring-offset-background-base
- Keyboard navigation for mood selectors (arrow keys)
- Alt text for all movie posters
- ARIA labels for like/dislike icon buttons