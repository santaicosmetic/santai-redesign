"""Delete all `review` metaobjects + clear per-product `santai.reviews` lists +
clear shop's `santai.featured_reviews` list.

Requires `--confirm` flag. Without it, prints what WOULD be deleted and exits.

After wiping, run scripts/shopify-populate-reviews.py to load fresh data.
"""
import os, sys, json, time, urllib.request

if '--confirm' not in sys.argv:
    print('SAFETY: pass --confirm to actually delete.')
    print('Without --confirm, this script does a dry run and exits.')

CONFIRM = '--confirm' in sys.argv
SHOP = os.environ['SHOPIFY_SHOP']
TOKEN = os.environ['SHOPIFY_ADMIN_ACCESS_TOKEN']
API = f'https://{SHOP}/admin/api/2026-04/graphql.json'


def gql(q, v=None, attempts=4):
    for i in range(attempts):
        try:
            req = urllib.request.Request(API,
                data=json.dumps({'query': q, 'variables': v or {}}).encode(),
                headers={'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json'})
            return json.load(urllib.request.urlopen(req, timeout=30))
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if i == attempts - 1:
                raise
            time.sleep(2 ** i)


# ---------- Step 1: Fetch all review metaobject IDs (paginated) ----------
ids = []
cursor = None
while True:
    after = f', after: "{cursor}"' if cursor else ''
    q = f'{{ metaobjects(type: "review", first: 250{after}) {{ edges {{ cursor node {{ id }} }} pageInfo {{ hasNextPage }} }} }}'
    r = gql(q)
    edges = r['data']['metaobjects']['edges']
    ids.extend(e['node']['id'] for e in edges)
    if not r['data']['metaobjects']['pageInfo']['hasNextPage']:
        break
    cursor = edges[-1]['cursor']

print(f'Found {len(ids)} review metaobjects')

if not CONFIRM:
    print(f'\nDRY RUN — would delete {len(ids)} metaobjects + clear product/shop reference lists.')
    print('Re-run with --confirm to actually delete.')
    sys.exit(0)


# ---------- Step 2: Clear per-product reviews lists + shop featured list ----------
# Set the metafield value to "[]" — this disassociates references before deleting
# the metaobjects (avoids dangling references).

print()
print('--- Clearing reference lists ---')

# Get all products that have a reviews list
PRODUCTS_Q = '''
{ products(first: 30) { edges { node { id handle metafield(namespace: "santai", key: "reviews") { id } } } } }
'''
r = gql(PRODUCTS_Q)
shop_q = '{ shop { id metafield(namespace: "santai", key: "featured_reviews") { id } } }'
shop_r = gql(shop_q)

SET_MF = '''
mutation Set($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id }
    userErrors { field message code }
  }
}'''

inputs = []
for e in r['data']['products']['edges']:
    n = e['node']
    if n['metafield']:
        inputs.append({
            'ownerId': n['id'],
            'namespace': 'santai',
            'key': 'reviews',
            'type': 'list.metaobject_reference',
            'value': '[]',
        })
        # Also clear overflow list (added in Session 13 to bypass 50-per-list cap)
        inputs.append({
            'ownerId': n['id'],
            'namespace': 'santai',
            'key': 'reviews_overflow',
            'type': 'list.metaobject_reference',
            'value': '[]',
        })
if shop_r['data']['shop']['metafield']:
    inputs.append({
        'ownerId': shop_r['data']['shop']['id'],
        'namespace': 'santai',
        'key': 'featured_reviews',
        'type': 'list.metaobject_reference',
        'value': '[]',
    })

if inputs:
    res = gql(SET_MF, {'metafields': inputs})
    errs = res['data']['metafieldsSet']['userErrors']
    if errs:
        print(f'  ERRORS: {errs}')
        sys.exit(1)
    print(f'  Cleared {len(inputs)} reference lists.')


# ---------- Step 3: Delete metaobjects in batches ----------
DELETE = '''
mutation Delete($id: ID!) {
  metaobjectDelete(id: $id) {
    deletedId
    userErrors { field message code }
  }
}'''

print()
print(f'--- Deleting {len(ids)} metaobjects ---')
ok = fail = 0
for i, mid in enumerate(ids):
    try:
        r = gql(DELETE, {'id': mid})
        errs = r['data']['metaobjectDelete']['userErrors']
        if errs:
            fail += 1
        else:
            ok += 1
    except Exception as e:
        fail += 1
        print(f'  EXC on {mid}: {e}')
    if (i + 1) % 50 == 0:
        print(f'  {i + 1} / {len(ids)} deleted')
        time.sleep(2)

print(f'\nDeleted: {ok}  Failed: {fail}')
print('Now run scripts/shopify-populate-reviews.py to load fresh data.')
