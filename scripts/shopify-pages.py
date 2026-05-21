"""Create / update Shopify Pages from prototype HTML.
Reads the <main>...</main> inner content of each prototype file, strips
unresolvable image references, and creates a Shopify page with that body.

For pages that have a dedicated section template (contact, wishlist), we set
the page's template_suffix accordingly and leave body_html empty.

Idempotent. Run after `set -a; source .env`.
"""
import os, sys, json, re, urllib.request

SHOP = os.environ['SHOPIFY_SHOP']
TOKEN = os.environ['SHOPIFY_ADMIN_ACCESS_TOKEN']
REST = f'https://{SHOP}/admin/api/2026-04'

def rest(method, path, body=None):
    req = urllib.request.Request(
        f'{REST}/{path}',
        data=json.dumps(body).encode() if body else None,
        method=method,
        headers={'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json', 'Accept': 'application/json'},
    )
    try:
        res = urllib.request.urlopen(req)
        return json.load(res) if res.status != 204 else None
    except urllib.error.HTTPError as e:
        print(f'  HTTP {e.code}: {e.read().decode()[:200]}', file=sys.stderr)
        return None


def extract_main_inner(html):
    """Return the inner HTML of the first <main> ... </main> block."""
    m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    if not m:
        return ''
    inner = m.group(1)
    # Strip page-hero sections with unresolvable image refs
    inner = re.sub(r'<section class="page-hero">.*?</section>', '', inner, flags=re.DOTALL)
    # Strip any remaining <img src="assets/..."> (broken on Shopify until images upload)
    inner = re.sub(r'<img[^>]*src="assets/[^"]*"[^>]*>', '', inner)
    # Strip relative .html links that won't make sense (they'll be rewritten by handle).
    # Replace known prototype links with Shopify equivalents.
    replacements = {
        'href="how-to-apply.html"':    'href="/pages/how-to-apply"',
        'href="faq.html"':             'href="/pages/faq"',
        'href="shipping.html"':        'href="/pages/shipping"',
        'href="returns.html"':         'href="/pages/returns"',
        'href="care-guide.html"':      'href="/pages/care-guide"',
        'href="contact.html"':         'href="/pages/contact"',
        'href="about.html"':           'href="/pages/about"',
        'href="privacy.html"':         'href="/policies/privacy-policy"',
        'href="terms.html"':           'href="/policies/terms-of-service"',
        'href="refund-policy.html"':   'href="/policies/refund-policy"',
        'href="collection.html"':                 'href="/collections/all"',
        'href="collection-makeup.html"':          'href="/collections/by-makeup"',
        'href="collection-eye-shape.html"':       'href="/collections/by-eye-shape"',
        'href="collection-accessories.html"':     'href="/collections/accessories"',
        'href="cart.html"':            'href="/cart"',
        'href="wishlist.html"':        'href="/pages/wishlist"',
        'href="search.html"':          'href="/search"',
        'href="journal.html"':         'href="/blogs/journal"',
        'href="journal-magnetic-vs-strip.html"':  'href="/blogs/journal/magnetic-vs-strip-lashes"',
        'href="journal-glue-damage.html"':        'href="/blogs/journal/why-eyelash-glue-damages-lashes"',
        'href="journal-styling-guide.html"':      'href="/blogs/journal/how-to-spot-your-eye-shape"',
        'href="product.html?style=inbox"':        'href="/products/inbox-magnetic-eyelashes"',
        'href="product.html?style=pitch"':        'href="/products/pitch-magnetic-eyelashes"',
        'href="product.html?style=minutes"':      'href="/products/minutes-magnetic-eyelashes"',
        'href="product.html?style=kickoff"':      'href="/products/kickoff-magnetic-eyelashes"',
        'href="product.html?style=boardroom"':    'href="/products/boardroom-magnetic-eyelashes"',
        'href="product.html?style=memo"':         'href="/products/memo-magnetic-eyelashes-pre-order"',
        'href="product.html?style=afterhours"':   'href="/products/afterhours-magnetic-eyelashes"',
        'href="product.html?style=twilight"':     'href="/products/twilight-magnetic-eyelashes"',
        'href="product.html?style=nightshift"':   'href="/products/nightshift-magnetic-eyelashes"',
        'href="product.html?style=vip"':          'href="/products/vip-access-magnetic-eyelashes-pre-order"',
        'href="product-cleanser.html"':           'href="/products/the-pure-ritual-professional-magnetic-lash-cleanser"',
        'href="product-curler.html"':             'href="/products/the-executive-lift-24h-precision-thermo-curler"',
    }
    for old, new in replacements.items():
        inner = inner.replace(old, new)
    return inner.strip()


# Pages to create. Body source = prototype filename (None = empty body, section handles it).
PAGES = [
    {'handle': 'about',          'title': 'Our story',                'source': 'html-build/about.html',          'template_suffix': None},
    {'handle': 'how-to-apply',   'title': 'How to apply',             'source': 'html-build/how-to-apply.html',   'template_suffix': None},
    {'handle': 'faq',            'title': 'FAQ',                      'source': 'html-build/faq.html',            'template_suffix': None},
    {'handle': 'shipping',       'title': 'Shipping',                 'source': 'html-build/shipping.html',       'template_suffix': None},
    {'handle': 'returns',        'title': 'Returns & exchanges',      'source': 'html-build/returns.html',        'template_suffix': None},
    {'handle': 'care-guide',     'title': 'Care guide',               'source': 'html-build/care-guide.html',     'template_suffix': None},
    {'handle': 'contact',        'title': 'Contact',                  'source': None,                              'template_suffix': 'contact'},
    {'handle': 'wishlist',       'title': 'Wishlist',                 'source': None,                              'template_suffix': 'wishlist'},
]

# Fetch existing pages once
existing = rest('GET', 'pages.json?limit=250')
existing_pages = {p['handle']: p for p in (existing or {}).get('pages', [])}
print(f'Existing pages on store: {list(existing_pages.keys())}')
print()
print('--- Creating / updating pages ---')

for p in PAGES:
    body_html = ''
    if p['source']:
        try:
            with open(p['source'], encoding='utf-8') as h:
                html = h.read()
            body_html = extract_main_inner(html)
        except FileNotFoundError:
            print(f'  {p["handle"]:18}  SKIP (source file missing: {p["source"]})')
            continue

    page_data = {
        'page': {
            'title': p['title'],
            'handle': p['handle'],
            'body_html': body_html,
            'published': True,
        }
    }
    if p['template_suffix']:
        page_data['page']['template_suffix'] = p['template_suffix']

    if p['handle'] in existing_pages:
        # Update
        page_id = existing_pages[p['handle']]['id']
        del page_data['page']['handle']  # can't change handle on update
        res = rest('PUT', f'pages/{page_id}.json', page_data)
        if res and 'page' in res:
            size = len(body_html)
            tpl = f' [tpl: {p["template_suffix"]}]' if p['template_suffix'] else ''
            print(f'  {p["handle"]:18}  UPDATED  body={size}b{tpl}')
        else:
            print(f'  {p["handle"]:18}  UPDATE FAILED')
    else:
        # Create
        res = rest('POST', 'pages.json', page_data)
        if res and 'page' in res:
            size = len(body_html)
            tpl = f' [tpl: {p["template_suffix"]}]' if p['template_suffix'] else ''
            print(f'  {p["handle"]:18}  CREATED  body={size}b{tpl}')
        else:
            print(f'  {p["handle"]:18}  CREATE FAILED')

print()
print('Done.')
