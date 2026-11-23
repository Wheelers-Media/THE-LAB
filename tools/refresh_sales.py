"""Refresh src/assets/data/sales.json (what the shop has sold) from a sales-by-product export.

Input: a CSV or TSV with product_title, quantity_ordered, orders columns, for example the
ShopifyQL result of
  FROM sales SHOW quantity_ordered, orders GROUP BY product_title ORDER BY quantity_ordered DESC SINCE -365d UNTIL today
or Shopify Admin > Analytics > Sales by product > Export. Aggregate counts only: no customer or order data.

  python tools/refresh_sales.py sales.tsv [--days 365]

Titles are matched to catalog handles through the store's public /products.json. Unmatched titles
(services, renamed or deleted products) are listed and skipped. Run it monthly, commit the JSON.
"""
import csv, json, re, sys, datetime, urllib.request, pathlib

STORE = 'https://xr6pmx-y0.myshopify.com'
OUT = pathlib.Path(__file__).resolve().parent.parent / 'src/assets/data/sales.json'

def norm(t):
    t = t.lower().replace('\u2013', '-').replace('\u2014', '-').replace('\u201d', '"').replace('\u201c', '"').replace('\u2019', "'")
    return re.sub(r'\s+', ' ', t).strip()

def handles():
    out, page = {}, 1
    while True:
        req = urllib.request.Request(f'{STORE}/products.json?limit=250&page={page}', headers={'User-Agent': 'Mozilla/5.0'})
        items = json.load(urllib.request.urlopen(req, timeout=30))['products']
        if not items: return out
        for p in items: out[norm(p['title'])] = p['handle']
        page += 1

def main():
    src = sys.argv[1]
    days = int(sys.argv[sys.argv.index('--days') + 1]) if '--days' in sys.argv else 365
    text = open(src, encoding='utf-8-sig').read()
    rows = csv.DictReader(text.splitlines(), delimiter='\t' if '\t' in text.splitlines()[0] else ',')
    hmap, sold, miss = handles(), {}, []
    for r in rows:
        title = norm(r['product_title'])
        h = hmap.get(title)
        u, o = int(r['quantity_ordered']), int(r['orders'])
        if not h: miss.append((u, r['product_title'])); continue
        a = sold.setdefault(h, [0, 0]); a[0] += u; a[1] += o
    doc = {'updated': datetime.date.today().isoformat(), 'windowDays': days, 'sold': dict(sorted(sold.items(), key=lambda kv: -kv[1][0]))}
    OUT.write_text(json.dumps(doc, indent=1) + '\n', encoding='utf-8')
    print(f'{len(sold)} products written to {OUT}')
    for u, t in miss: print('unmatched:', u, t)

main()
