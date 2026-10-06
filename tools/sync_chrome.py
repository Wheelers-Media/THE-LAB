"""Stamp the shared header, footer and search overlay into every page.

Source of truth: src/components/site-header.html, site-footer.html, site-search.html
Run from the repo root:  python tools/sync_chrome.py
Safe to re-run: it replaces whatever sits between <body> and <main>, the <footer>, and the search overlay.
Conditional blocks in the header use <!--if:store--> ... <!--/if:store--> and <!--if:price--> ... <!--/if:price-->.
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, "src", "pages")
COMP = os.path.join(ROOT, "src", "components")
CHROME_JS = '<script src="/assets/js/chrome.js"></script>'


def read(path):
    with open(path, encoding="utf8", newline="") as f:
        return f.read().replace("\r\n", "\n")


def render(template, flags):
    def block(m):
        return m.group(2) if flags.get(m.group(1)) else ""
    out = re.sub(r"<!--if:(\w+)-->(.*?)<!--/if:\1-->\n?", block, template, flags=re.S)
    return out.strip("\n") + "\n"


def sync(path):
    rel = os.path.relpath(path, PAGES).replace("\\", "/")
    raw = open(path, encoding="utf8", newline="").read()
    nl = "\r\n" if "\r\n" in raw else "\n"
    s = raw.replace("\r\n", "\n")

    store = rel.startswith("store/")
    price = store or "data-price-cad" in s or "data-price-from-cad" in s
    flags = {"store": store, "price": price}
    header = render(read(os.path.join(COMP, "site-header.html")), flags)
    footer = render(read(os.path.join(COMP, "site-footer.html")), flags)
    search = render(read(os.path.join(COMP, "site-search.html")), flags)

    # 1. header region: everything between <body ...> and <main
    b = re.search(r"<body[^>]*>", s)
    m = s.find("<main")
    if not b or m < 0 or m < b.end():
        raise SystemExit("cannot find <body> and <main> in " + rel)
    s = s[:b.end()] + "\n\n" + header + "\n    " + s[m:]

    # 2. <main id="main"> so the skip link has a target
    s = re.sub(r"<main(?![^>]*\bid=)", '<main id="main"', s, count=1)

    # 3. footer
    # only the site footer: pages also use <footer> inside review quotes, so match on the site footer classes
    f = re.search(r'<footer\b[^>]*class="[^"]*\b(?:bg-void|site-footer)\b[^"]*"[^>]*>.*?</footer>', s, flags=re.S)
    if not f:
        raise SystemExit("no <footer> in " + rel)
    s = s[:f.start()] + footer.rstrip("\n") + s[f.end():]

    # 4. search overlay, ahead of global-search.js
    sj = s.find('<script src="/assets/js/global-search.js"')
    if sj < 0:
        raise SystemExit("no global-search.js include in " + rel)
    ov = s.find("<!-- GLOBAL SEARCH OVERLAY -->")
    if ov < 0:
        ov = s.find('<div id="global-search-overlay"')
    gs = s.rfind("<!-- GLOBAL SEARCH -->", 0, sj)
    end = gs if gs > ov >= 0 else sj
    if ov >= 0 and ov < end:
        s = s[:ov] + search + "\n" + s[end:]
    else:
        s = s[:sj] + search + "\n" + s[sj:]

    # 5. chrome.js in <head>, once
    if "/assets/js/chrome.js" not in s:
        s = s.replace("</head>", "    " + CHROME_JS + "\n</head>", 1)

    open(path, "w", encoding="utf8", newline="").write(s.replace("\n", nl))
    return rel, flags


if __name__ == "__main__":
    for p in sorted(glob.glob(os.path.join(PAGES, "**", "index.html"), recursive=True)):
        rel, flags = sync(p)
        print("synced", rel, "store" if flags["store"] else "", "price" if flags["price"] else "")
