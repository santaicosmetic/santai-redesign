"""Read data/mock-reviews.csv → create 367 `review` metaobjects on Shopify →
wire each one to its product's `santai.reviews` list + collect featured ones
into the shop's `santai.featured_reviews` list.

Idempotent: re-running creates duplicate review entries (no natural key to
de-dupe on). If you need to wipe and reload, delete existing review metaobjects
via the admin first, then re-run.

Rate limit handling: GraphQL costs ~10 per metaobjectCreate. Bucket is 1000 max,
restored at 50/sec → ~5 creates/sec safe. We chunk in batches of 50 with
a short sleep between batches to stay well below the throttle line.
"""
import csv, os, sys, json, time, urllib.request
from collections import defaultdict
from pathlib import Path

SHOP = os.environ['SHOPIFY_SHOP']
TOKEN = os.environ['SHOPIFY_ADMIN_ACCESS_TOKEN']
API = f'https://{SHOP}/admin/api/2026-04/graphql.json'

CSV = Path(__file__).parent.parent / 'data' / 'mock-reviews.csv'


def gql(query, variables=None):
    req = urllib.request.Request(
        API,
        data=json.dumps({'query': query, 'variables': variables or {}}).encode(),
        headers={'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json'},
    )
    res = json.load(urllib.request.urlopen(req))
    if 'errors' in res:
        print(f'GraphQL errors: {res["errors"]}', file=sys.stderr)
        sys.exit(1)
    return res['data']


# ---------- Step 1: Fetch product handle → ID map ----------

print('--- Fetching product IDs by handle ---')
PRODUCTS_Q = '{ products(first: 30) { edges { node { id handle } } } }'
res = gql(PRODUCTS_Q)
id_by_handle = {e['node']['handle']: e['node']['id'] for e in res['products']['edges']}
print(f'  {len(id_by_handle)} products on store')


# ---------- Step 2: Load CSV ----------

with CSV.open(encoding='utf-8') as f:
    rows = list(csv.DictReader(f))
print(f'  {len(rows)} review rows in CSV')


# ---------- Step 3: Create review metaobjects in batches ----------

CREATE = """
mutation Create($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message code }
  }
}"""

print()
print('--- Creating 367 review metaobjects (this will take ~90s) ---')

# Track the ID of each created metaobject so we can build per-product + featured lists after
review_ids_by_product = defaultdict(list)
featured_review_ids = []
created_count = 0
failed_count = 0

for i, r in enumerate(rows):
    product_gid = id_by_handle.get(r['product_handle'])
    if not product_gid:
        print(f'  [{i:3}] SKIP — unknown handle: {r["product_handle"]}')
        failed_count += 1
        continue

    fields = [
        {'key': 'rating',   'value': r['rating']},
        {'key': 'body',     'value': r['body']},
        {'key': 'author',   'value': r['author']},
        {'key': 'tag',      'value': r['tag']},
        {'key': 'verified', 'value': r['verified']},
        {'key': 'date',     'value': r['date']},
        {'key': 'product',  'value': product_gid},
        {'key': 'featured', 'value': r['featured']},
    ]
    if r['title']:
        fields.append({'key': 'title', 'value': r['title']})

    res = gql(CREATE, {'metaobject': {
        'type': 'review',
        'fields': fields,
        'capabilities': {'publishable': {'status': 'ACTIVE'}},  # publish immediately so Liquid can read
    }})
    errs = res['metaobjectCreate']['userErrors']
    if errs:
        print(f'  [{i:3}] ERROR: {errs}')
        failed_count += 1
        continue

    mid = res['metaobjectCreate']['metaobject']['id']
    review_ids_by_product[r['product_handle']].append(mid)
    if r['featured'] == 'true':
        featured_review_ids.append(mid)
    created_count += 1

    if (i + 1) % 50 == 0:
        print(f'  ... {i + 1} done')
        time.sleep(2)  # let the cost bucket refill

print(f'  CREATED: {created_count}  FAILED: {failed_count}')
if failed_count:
    print('  Aborting list wiring due to failures.')
    sys.exit(1)


# ---------- Step 4: Write per-product `santai.reviews` lists ----------

SET_MF = """
mutation Set($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key }
    userErrors { field message code }
  }
}"""

print()
print('--- Wiring per-product santai.reviews + reviews_overflow lists ---')
# Shopify Liquid caps `list.metaobject_reference` at 50 entries per list. For
# products with more reviews, split: first 50 → santai.reviews, rest → santai.reviews_overflow.
# See REVIEWS.md "50-per-list" gotcha. If a product ever exceeds 100 reviews we'll
# need a reviews_overflow_2 — flag at that time.
LIQUID_LIST_CAP = 50
mf_inputs = []
for handle, review_ids in review_ids_by_product.items():
    pid = id_by_handle[handle]
    chunk_primary = review_ids[:LIQUID_LIST_CAP]
    chunk_overflow = review_ids[LIQUID_LIST_CAP:LIQUID_LIST_CAP * 2]
    mf_inputs.append({
        'ownerId': pid,
        'namespace': 'santai',
        'key': 'reviews',
        'type': 'list.metaobject_reference',
        'value': json.dumps(chunk_primary),
    })
    # Always set overflow (even to []) so previous data doesn't linger between runs.
    mf_inputs.append({
        'ownerId': pid,
        'namespace': 'santai',
        'key': 'reviews_overflow',
        'type': 'list.metaobject_reference',
        'value': json.dumps(chunk_overflow),
    })
    if len(review_ids) > LIQUID_LIST_CAP * 2:
        print(f'  WARN: {handle} has {len(review_ids)} reviews — only first 100 will render (need reviews_overflow_2)')

res = gql(SET_MF, {'metafields': mf_inputs})
errs = res['metafieldsSet']['userErrors']
if errs:
    print(f'  ERRORS: {errs}')
    sys.exit(1)
for handle, review_ids in review_ids_by_product.items():
    print(f'  {handle:50}  {len(review_ids):3} reviews linked')


# ---------- Step 5: Write shop-level `santai.featured_reviews` list ----------

print()
print(f'--- Wiring shop santai.featured_reviews ({len(featured_review_ids)} entries) ---')
SHOP_Q = '{ shop { id } }'
shop_id = gql(SHOP_Q)['shop']['id']

res = gql(SET_MF, {'metafields': [{
    'ownerId': shop_id,
    'namespace': 'santai',
    'key': 'featured_reviews',
    'type': 'list.metaobject_reference',
    'value': json.dumps(featured_review_ids),
}]})
errs = res['metafieldsSet']['userErrors']
if errs:
    print(f'  ERRORS: {errs}')
    sys.exit(1)
print(f'  Featured list set: {len(featured_review_ids)} reviews')

print()
print('Done. Reviews are now live on the draft theme.')
