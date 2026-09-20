# Visual Differentiation QA

## Evidence

- Similarity baseline: `C:\Users\HUAWEI\Desktop\个人网页\tmp\site-similarity-audit\hilda-desktop-hero.png`
- User first-fold reference: `C:\Users\HUAWEI\AppData\Local\Temp\codex-clipboard-22b04080-8b7c-44c2-af21-4945d0328233.png`
- User blue palette reference: `D:\xwechat_files\wxid_s31v0ca5msnr22_f088\temp\RWTemp\2026-09\9e20f478899dc29eb19741386f9343c8\14daa8a05f5da22d5c1432cf63edb4ca.jpg`
- Final hero mood reference: `C:\Users\HUAWEI\AppData\Local\Temp\codex-clipboard-c31a03ab-3c4a-4ad5-9b17-48da9f7bbc84.png`
- Generated hero asset: `assets\hero-watercolor-blue-v2.png` (background only; no reference UI or text retained).
- Current desktop capture: `C:\Users\HUAWEI\Desktop\个人网页\tmp\redesign-desktop.png`
- Current mobile capture: `C:\Users\HUAWEI\Desktop\个人网页\tmp\redesign-mobile.png`
- Checked viewports: 1920 x 900 and 375 x 812.

## Result

- The old name badge and detached capsule navigation are replaced by one floating portfolio utility bar with a visible resume download action.
- `Vibe Coding 作品` reveals two distinct destinations on hover, focus, and mobile tap: `项目经历` and `轻量产品实践`.
- The hero no longer uses the same left-copy/right-profile-card composition as the similarity baseline. Profile facts now form a full-width evidence strip below the introduction.
- The first-fold profile strip is fully inside a 1920 x 900 viewport. The eyebrow label is removed, the hero type is reduced, and the existing background focal point is shifted left so the text and scroll link sit over the light area.
- Project cases now use an editorial casebook structure: warm-white paper cards, a slim top accent, split title/metadata, and side-by-side overview/link panels on desktop. This is structurally distinct from the reference portfolio's thick outlined, colored-header cards.
- Coral, mist blue, and sage identify the three cases without turning the full cards into colored blocks. Demo actions remain pink and the keyword strip keeps a restrained pale-yellow fill.
- At mobile width the header, overview, links, background, work list, and disclosure return to one column without removing or clipping information.
- The first-fold profile strip is pure white with no outer border or shadow; only very light internal dividers remain.
- The two lightweight-product cards share the same warm background, and the redundant `点击查看` labels are removed.
- The hero profile headings align on one row, the availability statement stays on one desktop line, and the smaller hero type plus left-shifted light area keep the full copy inside the readable halo.
- Education uses a very light blue fill; content modules use the navigation action's deep teal outline. Project overview sentences carry the case color while background rows remain unfilled.
- Lightweight-product metadata is de-emphasized, the two experience actions use mint and peach hover states, and the 780/420 proof figures follow their corresponding card colors.
- Capability-card title bars use pale yellow, sky blue, blush, and mint accents; the footer signature is near-black.
- The three hero button hover states remain in their own dark-green, mint, and blue families instead of turning pink.
- Desktop and mobile have no horizontal overflow. The desktop submenu and mobile menu/submenu are visible and usable.
- The first fold uses the new blue watercolor landscape without a halo, keeps the profile strip inside the viewport, and prevents the About section from appearing at the top scroll position. Both profile statements remain complete and single-line at their intended desktop widths.
- The bundled resume PDF exists and both download links resolve to it.
- No P0, P1, or P2 visual or interaction issue remains in this scoped pass.

final result: passed
