Found the problem. Your `fenceData.ts` file is **incomplete** — it only has `MATERIALS` and `LABOR_MULTIPLIER` but is missing these exports that `FenceQuoteApp.tsx` needs:

- `TERRAIN_MULTIPLIER`
- `POST_OPTIONS`
- `PRO_DEFAULTS`
- `currency` (function)
- `todayStamp` (function)

That's why it won't compile. Here's the complete fixed `fenceData.ts` — replace your entire file with this:

Download that file, then replace your `lib/fenceData.ts` in GitHub with it. Here's how:

**To replace it in GitHub on mobile:**
1. Open `lib/fenceData.ts` in your repo
2. Tap the **pencil/edit icon** (top right)
3. Select all the existing code → delete it
4. Paste the new code
5. Tap **Commit changes**

Vercel will auto-redeploy and the build error should be gone. Let me know what happens after you commit it.