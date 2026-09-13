# Project Card Design QA

## Evidence

- Source visual truth: `C:\Users\HUAWEI\AppData\Local\Temp\codex-clipboard-d6d032d6-6f9d-42d0-915e-1d7b2bcb04c0.png`
- Source page: `https://lucky-hilda.github.io/AboutHilda2026/#skills`
- Implementation: `http://127.0.0.1:8796/#projects`
- Implementation screenshot: Codex in-app browser capture in the current task; the browser surface did not expose a filesystem export path.
- Desktop viewport: 1440 × 900 CSS px, device scale 1.
- Mobile viewport: 375 × 812 CSS px, device scale 1.
- Source image: 1920 × 868 px. For the combined comparison it was normalized to the inferred 1536 × 694 CSS viewport at 1.25 density; the implementation iframe used the same 1536 × 694 CSS viewport before both panels were scaled equally for display.
- State: `#projects`, first project card, product retrospective collapsed.

## Full-view comparison evidence

The source and implementation were placed in the same two-panel comparison view. The implementation preserves the source's main structural cues: an independent bordered project card, a distinct title header, a description block, and a bordered two-part link summary. Intentional deviations follow the user brief: Leila's existing pink and lavender buttons remain unchanged, while the keyword footer uses the requested yellow-to-mint gradient.

## Focused comparison evidence

The first project header and link summary were inspected at desktop size, then the same component was checked at 375 px mobile width. The project title remains visually subordinate to the section heading, link buttons keep at least 48 px height, long button copy wraps without clipping, and the keyword footer remains inside the card. A separate focused crop was not needed because these elements were clearly readable in the browser captures.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Typography: project titles are 20 px/800 on desktop and 19 px/800 on mobile, versus 17 px and 16 px body copy. The hierarchy is smaller than the previous 25 px treatment and matches the requested one-step emphasis.
- Spacing and layout: About, Projects, and Skills share a 1020 px desktop section width. All three project cards use the same header, overview, link summary, body, and disclosure spacing.
- Colors and tokens: the title header and upper link surface use translucent lavender; the keyword footer uses the requested yellow-to-mint gradient. Existing button colors, hover rules, borders, and shadows were not changed.
- Image quality: this component contains no image assets; the existing page background asset remains unchanged.
- Copy and content: all three keyword sets match the brief, and all six outbound links retain their original destinations and safe `rel` attributes.
- Responsiveness and accessibility: no horizontal overflow at 1440 px or 375 px; heading order remains h2 → h3 → h4; links retain visible labels and 48 px mobile minimum height; all three disclosure controls still open and close.

## Comparison history

- Pass 1: implemented the selected card structure and compared desktop and mobile renders with the source. No P0/P1/P2 mismatch was found, so no corrective visual iteration was required.

## Implementation checklist

- [x] Align the three main reading sections to one narrower width.
- [x] Add a distinct project title header to every card.
- [x] Move descriptions and links into the project body.
- [x] Add two-part link summary cards and project-specific keywords.
- [x] Preserve existing button colors and hover behavior.
- [x] Verify desktop, mobile, disclosures, overflow, and outbound-link structure.

## Follow-up polish

- No P3 follow-up is required for this pass.

final result: passed
