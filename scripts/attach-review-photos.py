"""Upload buyer-show photos to Shopify Files and attach one to the first review
of each lash product. Run after `set -a; source .env; set +a`."""
import os, sys, json, glob, mimetypes, urllib.request, uuid

SHOP = os.environ['SHOPIFY_SHOP']; TOKEN = os.environ['SHOPIFY_ADMIN_ACCESS_TOKEN']
API = f'https://{SHOP}/admin/api/2026-04/graphql.json'
FOLDER = '/Users/mapetiteyee/Desktop/买家秀'


def gql(query, variables=None):
    req = urllib.request.Request(API, data=json.dumps({'query': query, 'variables': variables or {}}).encode(),
        headers={'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json'})
    res = json.load(urllib.request.urlopen(req))
    if 'errors' in res:
        print('GraphQL errors:', res['errors'], file=sys.stderr); sys.exit(1)
    return res['data']


STAGED = """mutation($input:[StagedUploadInput!]!){ stagedUploadsCreate(input:$input){
  stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ message } } }"""
FILECREATE = """mutation($files:[FileCreateInput!]!){ fileCreate(files:$files){
  files{ id fileStatus alt } userErrors{ message } } }"""


def multipart_post(url, params, file_bytes, filename, mime):
    boundary = '----santai' + uuid.uuid4().hex
    body = b''
    for p in params:
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{p["name"]}"\r\n\r\n{p["value"]}\r\n'.encode()
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
    body += file_bytes + f'\r\n--{boundary}--\r\n'.encode()
    req = urllib.request.Request(url, data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}, method='POST')
    urllib.request.urlopen(req).read()


def upload(path):
    fn = os.path.basename(path); size = os.path.getsize(path)
    mime = mimetypes.guess_type(path)[0] or 'image/jpeg'
    t = gql(STAGED, {'input': [{'filename': fn, 'mimeType': mime, 'resource': 'IMAGE',
                                'fileSize': str(size), 'httpMethod': 'POST'}]})['stagedUploadsCreate']['stagedTargets'][0]
    with open(path, 'rb') as f:
        multipart_post(t['url'], t['parameters'], f.read(), fn, mime)
    res = gql(FILECREATE, {'files': [{'alt': 'Customer review photo', 'contentType': 'IMAGE', 'originalSource': t['resourceUrl']}]})
    fc = res['fileCreate']
    if fc['userErrors']:
        print('  fileCreate error:', fc['userErrors']); return None
    return fc['files'][0]['id']


# --- collect photos ---
photos = sorted(p for p in glob.glob(FOLDER + '/*')
                if os.path.splitext(p)[1].lower() in ('.jpg', '.jpeg', '.png'))
print(f'{len(photos)} photos found')

# --- lash products with their first review ---
Q = """{ products(first:30){ nodes{ handle
  cat: metafield(namespace:"santai", key:"category"){ value }
  rv: metafield(namespace:"santai", key:"reviews"){ references(first:1){ nodes{ ... on Metaobject { id } } } } } } }"""
prods = []
for n in gql(Q)['products']['nodes']:
    if (n.get('cat') or {}).get('value') != 'lash':
        continue
    refs = ((n.get('rv') or {}).get('references') or {}).get('nodes') or []
    if refs:
        prods.append((n['handle'], refs[0]['id']))
print(f'{len(prods)} lash products with a first review')

UPDATE = """mutation($id:ID!,$photos:String!){ metaobjectUpdate(id:$id,
  metaobject:{ fields:[{ key:"photos", value:$photos }] }){ metaobject{ id } userErrors{ message } } }"""

# --- upload + attach (one photo per product, cycling if counts differ) ---
print('\n--- uploading + attaching ---')
for i, (handle, review_id) in enumerate(prods):
    if i >= len(photos):
        break
    fid = upload(photos[i])
    if not fid:
        print(f'  {handle:38} SKIP (upload failed)'); continue
    r = gql(UPDATE, {'id': review_id, 'photos': json.dumps([fid])})['metaobjectUpdate']
    if r['userErrors']:
        print(f'  {handle:38} attach error: {r["userErrors"]}')
    else:
        print(f'  {handle:38} <- {os.path.basename(photos[i])}  OK')
print('\nDone.')
