"""Create + populate Shopify product metafields under namespace `santai`.
Idempotent — re-running updates values, doesn't duplicate. Run after `set -a; source .env`."""
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


# ---------- Step 1: Create metafield DEFINITIONS (idempotent) ----------
DEFINITIONS = [
    # All products
    {'key': 'short_id',    'name': 'Short ID',        'type': 'single_line_text_field',        'desc': 'Internal short slug used by theme.js (e.g. inbox, pitch, curler).'},
    {'key': 'tagline',     'name': 'Tagline',         'type': 'single_line_text_field',        'desc': 'Short editorial pitch line shown on cards + PDP.'},
    {'key': 'category',    'name': 'Category',        'type': 'single_line_text_field',        'desc': 'Either "lash" or "accessory".'},
    {'key': 'real_video',  'name': 'Real footage video (mp4 URL)', 'type': 'url',              'desc': "Per-product real wear-test video. Upload the mp4 under Settings -> Files, paste its URL here. Shown in the 'See it on a real eye' PDP section; the section hides when empty."},
    # Lash-only
    {'key': 'group',       'name': 'Makeup group',    'type': 'single_line_text_field',        'desc': 'Natural / Light makeup / Heavy makeup.'},
    {'key': 'eye_buckets', 'name': 'Eye-shape fit',   'type': 'list.single_line_text_field',   'desc': 'List of: monolid, double-lid, inner-double-lid.'},
    {'key': 'drama',       'name': 'Drama (1-5)',     'type': 'number_integer',                'desc': '1 = quietest, 5 = most dramatic.'},
    {'key': 'length',      'name': 'Lash length',     'type': 'single_line_text_field',        'desc': 'e.g. 10.5mm.'},
    {'key': 'curl',        'name': 'Curl',            'type': 'single_line_text_field',        'desc': 'e.g. 70 L.'},
    {'key': 'design',      'name': 'Band design',     'type': 'single_line_text_field',        'desc': 'e.g. V-weave airy fibre.'},
    # Accessory-only
    {'key': 'use_case',    'name': 'Use case',        'type': 'single_line_text_field',        'desc': 'For accessories: Daily lash + lid wash etc.'},
    {'key': 'size',        'name': 'Size / spec',     'type': 'single_line_text_field',        'desc': 'For accessories: 100ml / USB-C etc.'},
]

CREATE_DEF = """
mutation($def: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $def) {
    createdDefinition { id name key namespace }
    userErrors { field message code }
  }
}"""

print('--- Creating metafield definitions ---')
for d in DEFINITIONS:
    res = gql(CREATE_DEF, {'def': {
        'namespace': 'santai', 'key': d['key'], 'name': d['name'],
        'description': d['desc'], 'type': d['type'], 'ownerType': 'PRODUCT',
        'pin': True,
    }})
    errs = res['metafieldDefinitionCreate']['userErrors']
    if errs and any(e['code'] == 'TAKEN' for e in errs):
        print(f'  {d["key"]:14}  exists already (skipped)')
    elif errs:
        print(f'  {d["key"]:14}  ERROR: {errs}')
    else:
        print(f'  {d["key"]:14}  CREATED')

# ---------- Step 2: Populate per-product VALUES ----------
PRODUCTS = {
    'inbox-magnetic-eyelashes':      {'short_id':'inbox',      'category':'lash',      'group':'Natural',      'eye_buckets':['monolid'],                                 'drama':1, 'length':'10.5mm',                'curl':'45 B+',  'design':'V-weave airy fibre',          'tagline':'The one that looks like nothing — and everything.'},
    'minutes-magnetic-eyelashes':    {'short_id':'minutes',    'category':'lash',      'group':'Natural',      'eye_buckets':['monolid','inner-double-lid'],              'drama':1, 'length':'10.5mm',                'curl':'50 C',   'design':'True-to-lash simulation',     'tagline':'Your lashes, but better.'},
    'kickoff-magnetic-eyelashes':    {'short_id':'kickoff',    'category':'lash',      'group':'Natural',      'eye_buckets':['inner-double-lid'],                        'drama':2, 'length':'10-11mm',               'curl':'50 C',   'design':'Korean strand-by-strand',     'tagline':'Fresh air energy. Younger-looking.'},
    'boardroom-magnetic-eyelashes':  {'short_id':'boardroom',  'category':'lash',      'group':'Light makeup', 'eye_buckets':['double-lid'],                              'drama':3, 'length':'10-11mm',               'curl':'50 C',   'design':'Classic soft volume',         'tagline':'The one that never gets it wrong.'},
    'pitch-magnetic-eyelashes':      {'short_id':'pitch',      'category':'lash',      'group':'Light makeup', 'eye_buckets':['monolid','inner-double-lid'],              'drama':3, 'length':'10-11mm',               'curl':'70 L',   'design':'High-lift 70 L arc',          'tagline':'Refuse to droop. Stay sharp.'},
    'memo-magnetic-eyelashes-pre-order':{'short_id':'memo',       'category':'lash',      'group':'Light makeup', 'eye_buckets':['double-lid'],                              'drama':3, 'length':'12mm',                  'curl':'50 C',   'design':'7-cluster fairy burst',       'tagline':'Sweet, wide-eyed, unforgettable.'},
    'afterhours-magnetic-eyelashes': {'short_id':'afterhours', 'category':'lash',      'group':'Heavy makeup', 'eye_buckets':['double-lid'],                              'drama':5, 'length':'10-11mm',               'curl':'50 C',   'design':'Sunflower triangle cluster',  'tagline':'The night queen, no apologies.'},
    'twilight-magnetic-eyelashes':   {'short_id':'twilight',   'category':'lash',      'group':'Heavy makeup', 'eye_buckets':['inner-double-lid'],                        'drama':5, 'length':'10-11mm',               'curl':'50 C',   'design':'Volumised natural',           'tagline':'The hour between work and magic.'},
    'nightshift-magnetic-eyelashes': {'short_id':'nightshift', 'category':'lash',      'group':'Heavy makeup', 'eye_buckets':['monolid'],                                 'drama':5, 'length':'10-12mm + 13mm outer',  'curl':'50 C',   'design':'Fox-eye upswept',             'tagline':'Mysterious. Fatal. Irresistible.'},
    'vip-access-magnetic-eyelashes-pre-order':{'short_id':'vip',        'category':'lash',      'group':'Heavy makeup', 'eye_buckets':['double-lid'],                              'drama':5, 'length':'11-12mm',               'curl':'50 C',   'design':'Statement volume',            'tagline':'You were born for the front row.'},
    'the-executive-lift-24h-precision-thermo-curler':{'short_id':'curler',     'category':'accessory', 'use_case':'Pre-application set',    'size':'USB-C, 14-day battery',     'tagline':'12-second pre-application heater that sets the band flush.'},
    'the-pure-ritual-professional-magnetic-lash-cleanser':{'short_id':'cleanser',   'category':'accessory', 'use_case':'Daily lash + lid wash',  'size':'100ml ~ 3 months',          'tagline':'60-second daily wash that keeps lashes wearable for 30+ uses.'},
}

ALL_Q = "{ products(first: 30) { edges { node { id handle } } } }"
res = gql(ALL_Q)
id_by_handle = {e['node']['handle']: e['node']['id'] for e in res['products']['edges']}

SET_MUTATION = """
mutation($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key }
    userErrors { field message code }
  }
}"""

print()
print('--- Populating metafield values ---')
for handle, fields in PRODUCTS.items():
    pid = id_by_handle.get(handle)
    if not pid:
        print(f'  {handle:36}  SKIP (not on store)')
        continue
    mf_inputs = []
    for key, value in fields.items():
        if isinstance(value, list):
            v_str = json.dumps(value)
            mf_type = 'list.single_line_text_field'
        elif isinstance(value, int):
            v_str = str(value)
            mf_type = 'number_integer'
        else:
            v_str = str(value)
            mf_type = 'single_line_text_field'
        mf_inputs.append({
            'ownerId': pid, 'namespace': 'santai', 'key': key,
            'type': mf_type, 'value': v_str,
        })
    res = gql(SET_MUTATION, {'metafields': mf_inputs})
    errs = res['metafieldsSet']['userErrors']
    if errs:
        print(f'  {handle:36}  ERRORS: {errs}')
    else:
        print(f'  {handle:36}  OK ({len(mf_inputs)} fields set)')

print()
print('Done.')
