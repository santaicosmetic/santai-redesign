"""Create the Journal blog + 3 articles from prototype HTML.
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
        print(f'  HTTP {e.code}: {e.read().decode()[:300]}', file=sys.stderr)
        return None


def extract_article_body(html):
    """Extract the inner content of <div class="page-policy__body">.
    This is the actual essay prose, without the article meta/title block.
    Shopify article rendering will re-render title/date/tags from article fields
    so we don't want to duplicate them in body_html."""
    m = re.search(r'<div class="page-policy__body">(.*?)</div>\s*</div>\s*</article>', html, re.DOTALL)
    if not m:
        # Fallback: take everything inside <article>
        m2 = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
        return m2.group(1).strip() if m2 else ''
    inner = m.group(1)
    # Strip any <img src="assets/..."> tags that won't resolve
    inner = re.sub(r'<img[^>]*src="assets/[^"]*"[^>]*>', '', inner)
    # Rewrite prototype-relative URLs
    rewrites = {
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
        'href="about.html"':                      'href="/pages/about"',
        'href="contact.html"':                    'href="/pages/contact"',
        'href="how-to-apply.html"':               'href="/pages/how-to-apply"',
        'href="shipping.html"':                   'href="/pages/shipping"',
        'href="care-guide.html"':                 'href="/pages/care-guide"',
    }
    for old, new in rewrites.items():
        inner = inner.replace(old, new)
    return inner.strip()


# Step 1: Find or create the Journal blog
blogs = rest('GET', 'blogs.json?limit=20')
blog = next((b for b in (blogs or {}).get('blogs', []) if b['handle'] == 'journal'), None)
if not blog:
    res = rest('POST', 'blogs.json', {'blog': {'title': 'The journal', 'handle': 'journal', 'commentable': 'no'}})
    blog = res['blog']
    print(f'Created blog: {blog["handle"]} (#{blog["id"]})')
else:
    print(f'Found existing blog: {blog["handle"]} (#{blog["id"]})')

blog_id = blog['id']

# Step 2: Articles
ARTICLES = [
    {
        'handle': 'magnetic-vs-strip-lashes',
        'title': 'Magnetic vs strip lashes: the honest comparison.',
        'tags': 'The truth about',
        'summary': 'A side-by-side on application time, comfort, lash damage, and real cost-per-wear. No spin — just the numbers we\'d give a friend over coffee.',
        'source': 'html-build/journal-magnetic-vs-strip.html',
        'published_at': '2026-03-12T09:00:00+08:00',
    },
    {
        'handle': 'why-eyelash-glue-damages-lashes',
        'title': 'Why eyelash glue is quietly eating your natural lashes.',
        'tags': 'Lash care',
        'summary': 'The chemistry of cyanoacrylate, why "gentle formula" is half-true, and the recovery timeline if you stop.',
        'source': 'html-build/journal-glue-damage.html',
        'published_at': '2026-02-24T09:00:00+08:00',
    },
    {
        'handle': 'how-to-spot-your-eye-shape',
        'title': 'How to spot your eye shape — and which lash actually fits.',
        'tags': 'Tutorial',
        'summary': 'Monolid, double, inner double — three small differences that completely change which lash sits right. A 4-minute read with the styles we\'d pair to each.',
        'source': 'html-build/journal-styling-guide.html',
        'published_at': '2026-04-08T09:00:00+08:00',
    },
]

# Find existing articles by handle
existing = rest('GET', f'blogs/{blog_id}/articles.json?limit=50')
existing_articles = {a['handle']: a for a in (existing or {}).get('articles', [])}
print(f'\nExisting articles in blog: {list(existing_articles.keys())}')
print()
print('--- Creating / updating articles ---')

for a in ARTICLES:
    try:
        with open(a['source'], encoding='utf-8') as h:
            html = h.read()
        body_html = extract_article_body(html)
    except FileNotFoundError:
        print(f'  {a["handle"]:38}  SKIP (source missing)')
        continue

    article_data = {
        'article': {
            'title': a['title'],
            'handle': a['handle'],
            'body_html': body_html,
            'tags': a['tags'],
            'summary_html': f'<p>{a["summary"]}</p>',
            'published_at': a['published_at'],
            'published': True,
        }
    }
    if a['handle'] in existing_articles:
        aid = existing_articles[a['handle']]['id']
        del article_data['article']['handle']
        res = rest('PUT', f'blogs/{blog_id}/articles/{aid}.json', article_data)
        verb = 'UPDATED'
    else:
        res = rest('POST', f'blogs/{blog_id}/articles.json', article_data)
        verb = 'CREATED'
    if res and 'article' in res:
        print(f'  {a["handle"]:38}  {verb}  body={len(body_html)}b')
    else:
        print(f'  {a["handle"]:38}  FAILED')

print()
print('Done.')
