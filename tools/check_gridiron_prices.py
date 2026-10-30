"""Checks that the Gridiron page's hand-copied bumper prices still match Shopify.

Run it before and after changing Gridiron prices in Shopify:
    python tools/check_gridiron_prices.py

Reads the store's public catalog (nothing is written). Fails (exit 1) when a price
on the page is no longer a Shopify price, when a Shopify bumper price is missing
from the page, or when the custom-colour upcharge differs from the page. A listing
priced differently from the rest of its type is only a warning: it may be a typo in Shopify.
"""
import json
import os
import re
import sys
import urllib.request
from collections import defaultdict

SHOP = "https://xr6pmx-y0.myshopify.com"
VENDOR = "gridiron bumper"
PAGE = os.path.join(os.path.dirname(__file__), "..", "src", "pages", "gridiron", "index.html")


def catalog():
    products = []
    for page in range(1, 10):
        with urllib.request.urlopen(f"{SHOP}/products.json?limit=250&page={page}", timeout=30) as r:
            batch = json.load(r)["products"]
        if not batch:
            break
        products += batch
    return products


def kind(handle):
    """Bumper type for comparing like with like: tier (base, prerunner, full-tube), with or without winch, or rear."""
    tier = next((k for k in ("full-tube", "prerunner", "base") if k in handle), None)
    if "winch" in handle:
        return f"{tier}-winch" if tier else "winch"
    return "rear" if "rear" in handle else tier or "other"


def main():
    with open(PAGE, encoding="utf-8-sig") as f:
        page_prices = {float(p) for p in re.findall(r'data-price-cad="([\d.]+)"', f.read())}
    page_upcharge = 600.0 if 600.0 in page_prices else None
    page_prices.discard(600.0)

    by_kind = defaultdict(lambda: defaultdict(list))
    upcharges = set()
    for p in catalog():
        if VENDOR not in p.get("vendor", "").lower():
            continue
        variants = {v["title"].lower(): float(v["price"]) for v in p["variants"]}
        black = next((v for t, v in variants.items() if "black" in t), None)
        if black is None:
            continue
        by_kind[kind(p["handle"])][black].append(p["handle"])
        custom = next((v for t, v in variants.items() if "custom color powder" in t), None)
        if custom is not None:
            upcharges.add(custom - black)

    shopify_prices = {price for k in by_kind.values() for price in k}
    errors, warnings = [], []
    for price in sorted(page_prices - shopify_prices):
        errors.append(f"page shows ${price:,.0f} but no Gridiron listing has that price in Shopify")
    for price in sorted(shopify_prices - page_prices):
        errors.append(f"Shopify has a Gridiron price of ${price:,.0f} that the page does not show")
    if upcharges != {page_upcharge}:
        errors.append(f"custom colour upcharge: page {page_upcharge}, Shopify {sorted(upcharges)}")
    for k, prices in by_kind.items():
        if len(prices) > 1:
            usual = max(prices, key=lambda price: len(prices[price]))
            for price, handles in prices.items():
                if price != usual:
                    warnings.append(f"{k}: ${price:,.0f} differs from the usual ${usual:,.0f}: {', '.join(handles)}")

    for w in warnings:
        print("WARNING", w)
    for e in errors:
        print("MISMATCH", e)
    if errors:
        sys.exit(1)
    print(f"OK: the Gridiron page matches Shopify ({len(shopify_prices)} prices checked).")


if __name__ == "__main__":
    main()
