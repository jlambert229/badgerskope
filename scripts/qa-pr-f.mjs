// Quick visual + dimensional QA for PR F.
// Checks .lib-row__select hit area, wellness chip text fit, and screenshots.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173/web/";

async function check(viewport, label) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForSelector(".card", { timeout: 10_000 });

  // 1) lib-row__select bounding box
  const selBox = await page.locator(".lib-row__select").first().boundingBox();
  // 2) wellness chip — find one rendering "APPETITE & FULLNESS" if present
  const chips = page.locator(".card__category");
  const chipCount = await chips.count();
  let foundAppetite = null;
  for (let i = 0; i < chipCount; i++) {
    const txt = (await chips.nth(i).innerText()).trim();
    if (/APPETITE/i.test(txt)) {
      foundAppetite = {
        index: i,
        text: txt,
        box: await chips.nth(i).boundingBox(),
        height: await chips.nth(i).evaluate((n) => n.getBoundingClientRect().height),
        scrollHeight: await chips.nth(i).evaluate((n) => n.scrollHeight),
        clientHeight: await chips.nth(i).evaluate((n) => n.clientHeight),
        lineWraps: await chips.nth(i).evaluate((n) => {
          // Count lines = ceil(textHeight / lineHeight). textHeight excludes
          // padding+border. scrollHeight already excludes border-box border
          // for the inner content, so subtract padding only.
          const cs = getComputedStyle(n);
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
          const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
          const innerH = n.scrollHeight - padY;
          return Math.max(1, Math.round(innerH / lh));
        }),
      };
      break;
    }
  }
  // sample first chip box for reference
  const firstChip = chipCount > 0 ? {
    text: (await chips.nth(0).innerText()).trim(),
    box: await chips.nth(0).boundingBox(),
  } : null;

  // 3) screenshot
  await page.screenshot({
    path: `/tmp/pr-f-${label}.png`,
    fullPage: false,
  });

  console.log(`\n=== ${label} (${viewport.width}×${viewport.height}) ===`);
  console.log("lib-row__select boundingBox:", selBox);
  console.log("first .card__category:", firstChip);
  console.log("APPETITE & FULLNESS chip:", foundAppetite);

  await browser.close();
  return { selBox, firstChip, foundAppetite };
}

(async () => {
  const desk = await check({ width: 1440, height: 900 }, "desktop-1440");
  const mob = await check({ width: 390, height: 844 }, "mobile-390");

  // Sanity assertions
  const issues = [];
  if (!desk.selBox || desk.selBox.width < 44 || desk.selBox.height < 44) {
    issues.push(`Desktop .lib-row__select hit area < 44×44: ${JSON.stringify(desk.selBox)}`);
  }
  if (desk.foundAppetite && desk.foundAppetite.lineWraps > 1) {
    issues.push(`Desktop "APPETITE & FULLNESS" wraps to ${desk.foundAppetite.lineWraps} lines`);
  }
  if (issues.length) {
    console.log("\nISSUES:", issues);
    process.exit(1);
  } else {
    console.log("\nPASS — all dimensional checks OK");
  }
})();
