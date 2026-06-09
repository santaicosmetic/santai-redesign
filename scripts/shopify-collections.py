"""Create + populate Shopify collections used by the Santai theme.
Idempotent. Run after `set -a; source .env`.

Collections created (manual, not smart):
  - by-eye-shape (all 10 lashes — front-end groups them by metafield)
  - by-makeup    (all 10 lashes — front-end groups them by metafield)
  - accessories  (the 2 accessory products)

The Shopify default "all" collection is auto-created — we don't touch it.
"""
import os, sys, json, urllib.request

SHOP = os.environ['SHOPIFY_SHOP']
TOKEN = os.environ['SHOPIFY_ADMIN_ACCESS_TOKEN']
API = f'https://{SHOP}/admin/api/2026-04/graphql.json'


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


# Step 1: Fetch products + categorise by metafield
PRODUCTS_Q = """
{
  products(first: 30) {
    edges {
      node {
        id
        handle
        title
        metafields(first: 5, namespace: "santai") {
          edges { node { key value } }
        }
      }
    }
  }
}"""

res = gql(PRODUCTS_Q)
lash_ids = []
accessory_ids = []
for e in res['products']['edges']:
    p = e['node']
    mfs = {m['node']['key']: m['node']['value'] for m in p['metafields']['edges']}
    if mfs.get('category') == 'lash':
        lash_ids.append(p['id'])
    elif mfs.get('category') == 'accessory':
        accessory_ids.append(p['id'])

print(f'{len(lash_ids)} lashes, {len(accessory_ids)} accessories found')

# Step 2: Check existing collections — don't duplicate
EXISTING_Q = """
{
  collections(first: 50) {
    edges { node { id handle title } }
  }
}"""

existing = gql(EXISTING_Q)
existing_by_handle = {e['node']['handle']: e['node']['id'] for e in existing['collections']['edges']}
print(f'Existing collection handles: {list(existing_by_handle.keys())}')

# Step 3: Define what we want
COLLECTIONS = [
    {
        'handle': 'by-eye-shape',
        'title': 'Shop by eye shape',
        'desc': 'Lashes grouped by Monolid / Double lid / Inner double lid — the right band for the geometry of your eye.',
        'product_ids': lash_ids,
        'template_suffix': 'by-eye-shape',
    },
    {
        'handle': 'by-makeup',
        'title': 'Shop by makeup',
        'desc': 'Lashes grouped by Natural / Light makeup / Heavy makeup — pick the energy you want.',
        'product_ids': lash_ids,
        'template_suffix': 'by-makeup',
    },
    {
        'handle': 'accessories',
        'title': 'Accessories',
        'desc': 'The two essentials that keep magnetic lashes wearable for 30+ uses.',
        'product_ids': accessory_ids,
        'template_suffix': 'accessories',
    },
]

CREATE_COLLECTION = """
mutation($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id handle title }
    userErrors { field message }
  }
}"""

UPDATE_COLLECTION = """
mutation($input: CollectionInput!) {
  collectionUpdate(input: $input) {
    collection { id handle title }
    userErrors { field message }
  }
}"""

ADD_PRODUCTS = """
mutation($id: ID!, $productIds: [ID!]!) {
  collectionAddProducts(id: $id, productIds: $productIds) {
    collection { id productsCount { count } }
    userErrors { field message }
  }
}"""

print()
print('--- Creating / updating collections ---')
for c in COLLECTIONS:
    existing_id = existing_by_handle.get(c['handle'])
    if existing_id:
        # Update title/desc + template suffix, then re-set products
        res = gql(UPDATE_COLLECTION, {'input': {
            'id': existing_id, 'title': c['title'], 'descriptionHtml': f'<p>{c["desc"]}</p>',
            'templateSuffix': c['template_suffix'],
        }})
        errs = res['collectionUpdate']['userErrors']
        if errs:
            print(f'  {c["handle"]:18}  UPDATE ERRORS: {errs}')
        coll_id = existing_id
    else:
        res = gql(CREATE_COLLECTION, {'input': {
            'handle': c['handle'], 'title': c['title'], 'descriptionHtml': f'<p>{c["desc"]}</p>',
            'templateSuffix': c['template_suffix'],
        }})
        errs = res['collectionCreate']['userErrors']
        if errs:
            print(f'  {c["handle"]:18}  CREATE ERRORS: {errs}')
            continue
        coll_id = res['collectionCreate']['collection']['id']

    # Add products
    if c['product_ids']:
        res = gql(ADD_PRODUCTS, {'id': coll_id, 'productIds': c['product_ids']})
        errs = res['collectionAddProducts']['userErrors']
        if errs:
            print(f'  {c["handle"]:18}  ADD-PRODUCTS ERRORS: {errs}')
        else:
            count = res['collectionAddProducts']['collection']['productsCount']['count']
            verb = 'updated' if existing_id else 'created'
            print(f'  {c["handle"]:18}  {verb}, {count} products')
    else:
        print(f'  {c["handle"]:18}  no products')

print()
print('--- Publishing collections to all sales channels ---')

# Newly-created Shopify collections default to UNPUBLISHED on every sales channel.
# Without explicit publishing, /collections/<handle> returns 404 on the live store.
# This block fetches every publication (Online Store, POS, Facebook & Instagram,
# TikTok, Google & YouTube) and publishes each of our 3 collections to all of them.

PUBS_Q = '{ publications(first: 20) { edges { node { id name } } } }'
pubs = gql(PUBS_Q)['publications']['edges']
pub_inputs = [{'publicationId': p['node']['id']} for p in pubs]
pub_names = [p['node']['name'] for p in pubs]
print(f'Sales channels: {pub_names}')

PUBLISH = '''
mutation($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable { __typename }
    userErrors { field message }
  }
}'''

# Re-fetch the 3 collections by handle to get current IDs
cols_q = '{ collections(first: 50, query: "handle:by-eye-shape OR handle:by-makeup OR handle:accessories") { edges { node { id handle } } } }'
for e in gql(cols_q)['collections']['edges']:
    col_id, handle = e['node']['id'], e['node']['handle']
    res = gql(PUBLISH, {'id': col_id, 'input': pub_inputs})
    errs = res['publishablePublish']['userErrors']
    if errs:
        print(f'  {handle:18}  PUBLISH ERRORS: {errs}')
    else:
        print(f'  {handle:18}  published to all {len(pub_inputs)} channels')

print()
print('Done.')
