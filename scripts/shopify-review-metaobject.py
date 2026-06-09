"""Create the `review` metaobject definition + the two metafield definitions
that link reviews to products and to the homepage featured band.

Run once per store (idempotent — re-running prints "exists" and moves on).

After this runs, the populate script can create 367 review metaobjects and
hook them up to:
  - product.metafields.santai.reviews         (list of metaobject references)
  - shop.metafields.santai.featured_reviews   (list of metaobject references)
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


# ---------- Step 1: Define the `review` metaobject ----------

DEF_CREATE = """
mutation Create($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition { id type name }
    userErrors { field message code }
  }
}"""

DEF_LOOKUP = """
{ metaobjectDefinitionByType(type: "review") { id type name fieldDefinitions { key type { name } } } }
"""

print('--- Defining `review` metaobject ---')
existing = gql(DEF_LOOKUP)['metaobjectDefinitionByType']
if existing:
    print(f'  exists already: {existing["id"]}  ({len(existing["fieldDefinitions"])} fields)')
    review_def_id = existing['id']
else:
    definition_input = {
        'name': 'Review',
        'type': 'review',
        'access': {'storefront': 'PUBLIC_READ'},
        'capabilities': {'publishable': {'enabled': True}},
        'fieldDefinitions': [
            {'name': 'Rating',   'key': 'rating',   'type': 'number_integer'},
            {'name': 'Title',    'key': 'title',    'type': 'single_line_text_field'},
            {'name': 'Body',     'key': 'body',     'type': 'multi_line_text_field'},
            {'name': 'Author',   'key': 'author',   'type': 'single_line_text_field'},
            {'name': 'Tag',      'key': 'tag',      'type': 'single_line_text_field',
             'description': 'e.g. "Monolid · Office" — first word used as the eye-shape filter on PDP.'},
            {'name': 'Verified', 'key': 'verified', 'type': 'boolean'},
            {'name': 'Date',     'key': 'date',     'type': 'single_line_text_field',
             'description': 'Relative or absolute date string shown on the review card.'},
            {'name': 'Product',  'key': 'product',  'type': 'product_reference'},
            {'name': 'Featured', 'key': 'featured', 'type': 'boolean',
             'description': 'Flag for editorial tracking only; the homepage band reads from the shop-level `featured_reviews` list.'},
            {'name': 'Photos',   'key': 'photos',   'type': 'list.file_reference'},
        ],
    }
    res = gql(DEF_CREATE, {'definition': definition_input})
    errs = res['metaobjectDefinitionCreate']['userErrors']
    if errs:
        print(f'  CREATE ERRORS: {errs}')
        sys.exit(1)
    review_def_id = res['metaobjectDefinitionCreate']['metaobjectDefinition']['id']
    print(f'  CREATED: {review_def_id}')


# ---------- Step 2: Product metafield `santai.reviews` ----------

MFD_CREATE = """
mutation Create($def: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $def) {
    createdDefinition { id namespace key }
    userErrors { field message code }
  }
}"""

print()
print('--- Defining `santai.reviews` on Product (list of review metaobjects) ---')

product_mfd = {
    'namespace': 'santai',
    'key': 'reviews',
    'name': 'Reviews',
    'description': 'List of `review` metaobjects linked to this product. Populated by scripts/shopify-populate-reviews.py.',
    'type': 'list.metaobject_reference',
    'ownerType': 'PRODUCT',
    'validations': [{'name': 'metaobject_definition_id', 'value': review_def_id}],
    'pin': True,
    'access': {'storefront': 'PUBLIC_READ'},  # required for Liquid to see the list
}
res = gql(MFD_CREATE, {'def': product_mfd})
errs = res['metafieldDefinitionCreate']['userErrors']
if errs and any(e.get('code') == 'TAKEN' for e in errs):
    print('  exists already (skipped)')
elif errs:
    print(f'  ERRORS: {errs}')
else:
    print(f'  CREATED: {res["metafieldDefinitionCreate"]["createdDefinition"]["id"]}')


# ---------- Step 3: Shop metafield `santai.featured_reviews` ----------

print()
print('--- Defining `santai.featured_reviews` on Shop (list of review metaobjects) ---')

shop_mfd = {
    'namespace': 'santai',
    'key': 'featured_reviews',
    'name': 'Featured reviews (homepage)',
    'description': 'Hand-curated list of `review` metaobjects shown in the homepage reviews band.',
    'type': 'list.metaobject_reference',
    'ownerType': 'SHOP',
    'validations': [{'name': 'metaobject_definition_id', 'value': review_def_id}],
    'pin': True,
    'access': {'storefront': 'PUBLIC_READ'},  # required for Liquid to see the list
}
res = gql(MFD_CREATE, {'def': shop_mfd})
errs = res['metafieldDefinitionCreate']['userErrors']
if errs and any(e.get('code') == 'TAKEN' for e in errs):
    print('  exists already (skipped)')
elif errs:
    print(f'  ERRORS: {errs}')
else:
    print(f'  CREATED: {res["metafieldDefinitionCreate"]["createdDefinition"]["id"]}')


print()
print('Done. Next: run scripts/shopify-populate-reviews.py to create 367 review entries.')
