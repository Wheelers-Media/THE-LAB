# THE LAB site (thelabfsj.ca)

Luxx Automotive Boutique Inc., Fort St. John BC. Owners Eric and Christine Wheeler. Static HTML, CSS and JS on Vercel. `PRODUCT.md` has the audience and positioning, but its stack and booking notes are out of date (Tailwind is prebuilt, booking is Cal.com); this file wins.

## Git
- `main` is the live site. Never merge or push to `main` unless the user says so in that message. Work on a branch and share the Vercel preview.
- No attribution lines (Co-Authored-By, "Generated with") in commits or PRs.
- Commit or push only when asked. Keep local `main` fast-forwarded to `origin/main` before merging.
- Preview URLs are `the-lab-git-<branch>-nathans-projects-e8dc0632.vercel.app` and sit behind Vercel login. To share without a login, use the Vercel MCP tool `get_access_to_vercel_url` (link lasts about a day; Hobby allows one at a time).

## Build and test
- Shared header, footer, search overlay and truck-selector modal live once in `src/components/site-*.html`. After editing one, run `python tools/sync_chrome.py` (idempotent). It stamps all pages and normalizes `<head>`. Never hand-edit chrome on a single page.
- Tailwind is prebuilt: after adding classes run `cd tools/tailwind && npm run build` (`npm install` first; `node_modules` is gitignored).
- Local server: `node dev-server.js` (port 3000, mimics `vercel.json` rewrites).
- Test in a background browser tab; the user often clicks in the shared pane and cancels long scripts. Block the Web3Forms call when testing forms so nothing is emailed to Eric.
- After any change: no console errors, forms/cart/checkout still work, step changes land below the sticky header.

## Design
`DESIGN-RULES.md` is the rulebook (type scale, spacing tokens, photos, motion, forms). Tokens live in the Foundation block of `src/assets/css/lab.css`; change them there, not per page. Never add `data-reveal` by hand; `reveal.js` does it. Respect reduced motion. Native scroll only.

## Single source of truth
- **Prices** live on the service pages (detailing, tinting, SxS, lighting) and in Shopify. `quote.js` and the walkthrough builders read the service pages. Never copy a price into code or into another page's copy.
- Exception: the Gridiron page keeps static copies of the Shopify bumper prices (Base $2,549, Prerunner $2,949, Full Tube $3,749, winch $3,899/$4,299/$5,099, rear $2,599, custom colour +$600). Update it when Shopify changes.
- Form option labels in `intake.js` must match the strings the builders pass to `window.labHandoff` exactly, or the pre-tick breaks.
- Every "Get a quote" or "Estimate" button must lead to something that delivers one: `/contact/?service=<name>#form` opens the quote tool with the service chosen. Do not add a button whose promise nothing fulfills.

## Booking flow
Form (`intake.js`) -> Web3Forms email to the shop inbox -> confirmation with Cal.com embedded and pre-filled (`cal.com/the-lab/detailing-drop-off` for detailing, `cal.com/the-lab/eric-services` for everything else) -> Eric texts the $50 deposit link (short link `https://srtr.me/deposit`). Shop number for Text Us and fallbacks: (250) 261-9502. GoHighLevel is fully removed; do not reintroduce it.

## Claims
Do not publish these until Eric confirms them: "authorized dealer for every brand", "certified specialists", "satisfaction guarantee". Do not state anything about legality of delete/emissions products beyond "off-road use only"; legality questions go to Eric. Do not describe SMS marketing, lead magnets or a fitment gallery as live.

## Never
- Enter credentials, payment data or API keys anywhere.
- Download files without asking first.
- Delete or overwrite photos in `src/assets` without looking at them. Export sizes per `DESIGN-RULES.md`; never upload originals.
