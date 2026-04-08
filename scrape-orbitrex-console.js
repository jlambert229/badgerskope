/**
 * Orbitrex / WooCommerce category page: paste into DevTools Console (F12)
 * while logged in on https://orbitrexpeptide.is/product-category/peptides/
 * Copy the printed JSON into orbitrex-peptides.json -> "items"
 */
(function () {
  const cards = document.querySelectorAll("li.product, .product.type-product");
  const seen = new Set();
  const items = [];

  cards.forEach((card) => {
    const link =
      card.querySelector("a.woocommerce-LoopProduct-link") ||
      card.querySelector("a[href*='/product/']");
    const titleEl =
      card.querySelector(".woocommerce-loop-product__title") ||
      card.querySelector("h2") ||
      link;
    const title = (titleEl && titleEl.textContent && titleEl.textContent.trim()) || "";
    const url = (link && link.href) || "";
    if (!title || !url || seen.has(url)) return;
    seen.add(url);

    const priceEl = card.querySelector(".price .woocommerce-Price-amount, .price");
    const priceText = priceEl ? priceEl.textContent.replace(/\s+/g, " ").trim() : null;

    items.push({ title, url, priceText });
  });

  const out = {
    scrapedAt: new Date().toISOString(),
    pageUrl: location.href,
    items,
  };
  console.log(JSON.stringify(out, null, 2));
  return out;
})();
