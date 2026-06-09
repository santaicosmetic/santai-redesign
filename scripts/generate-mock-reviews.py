"""Generate 367 mock customer reviews for the Santai Shopify store.

Output: data/mock-reviews.csv  (10 columns matching the planned `review` metaobject schema)

Distribution by product (367 total):
  inbox      50   pitch      60   boardroom  38   minutes    35   kickoff    28
  afterhours 45   twilight   28   nightshift 24   memo       25   vip        34

Rating distribution: ~70% 5-star, 22% 4-star, 6% 3-star, 1.5% 2-star, ~0.5% 1-star
Verified: ~93% true (rest unverified, e.g. anonymous DMs reposted)
Featured: 9 hand-picked standout reviews flagged for the homepage pull-quotes band
Voice mix per review (rough): 50% Chinese-Malaysian English, 30% Malay (informal/formal mix),
  20% Indian-Malaysian English. Across all: significant Manglish + code-switching.
Tags: "<eye_shape> · <use_case>" derived per product from the prototype taxonomy.
"""
import csv
import os
import random
from pathlib import Path

random.seed(2026_05_23)

OUT = Path(__file__).parent.parent / 'data' / 'mock-reviews.csv'
OUT.parent.mkdir(parents=True, exist_ok=True)

# ---------- Product distribution ----------
PRODUCT_COUNTS = {
    'inbox-magnetic-eyelashes':                              75,   # +25 (top bestseller)
    'pitch-magnetic-eyelashes':                              60,
    'boardroom-magnetic-eyelashes':                          68,   # +30 (top bestseller)
    'minutes-magnetic-eyelashes':                            35,
    'kickoff-magnetic-eyelashes':                            28,
    'afterhours-magnetic-eyelashes':                         45,
    'twilight-magnetic-eyelashes':                           28,
    'nightshift-magnetic-eyelashes':                         24,
    'memo-magnetic-eyelashes-pre-order':                     25,
    'vip-access-magnetic-eyelashes-pre-order':               34,
}
assert sum(PRODUCT_COUNTS.values()) == 422

# Display name per product (used inside review text)
PRODUCT_DISPLAY = {
    'inbox-magnetic-eyelashes':                't Inbox',
    'pitch-magnetic-eyelashes':                'Pitch',
    'boardroom-magnetic-eyelashes':            'Boardroom',
    'minutes-magnetic-eyelashes':              'Minutes',
    'kickoff-magnetic-eyelashes':              'Kickoff',
    'afterhours-magnetic-eyelashes':           'Afterhours',
    'twilight-magnetic-eyelashes':             'Twilight',
    'nightshift-magnetic-eyelashes':           'Nightshift',
    'memo-magnetic-eyelashes-pre-order':       'Memo',
    'vip-access-magnetic-eyelashes-pre-order': 'VIP Access',
}
# Strip the leading 't ' artifact for Inbox (so we have a clean "Inbox" string)
PRODUCT_DISPLAY['inbox-magnetic-eyelashes'] = 'Inbox'

# Eye-shape buckets per product (from shopify-metafields.py — single primary shape per product)
PRODUCT_EYE = {
    'inbox-magnetic-eyelashes':                'Monolid',
    'pitch-magnetic-eyelashes':                'Monolid',  # also fits inner-double
    'boardroom-magnetic-eyelashes':            'Double lid',
    'minutes-magnetic-eyelashes':              'Monolid',
    'kickoff-magnetic-eyelashes':              'Inner double lid',
    'afterhours-magnetic-eyelashes':           'Double lid',
    'twilight-magnetic-eyelashes':             'Inner double lid',
    'nightshift-magnetic-eyelashes':           'Monolid',
    'memo-magnetic-eyelashes-pre-order':       'Double lid',
    'vip-access-magnetic-eyelashes-pre-order': 'Double lid',
}

USE_CASES = [
    'Office', 'Office', 'Office', 'Daily', 'Daily', 'Weekend', 'First-timer',
    'Wedding', 'Date night', 'Photoshoot', 'Travel', 'Raya', 'CNY',
    'Engagement', 'Birthday', 'Hari Raya', 'Diwali', 'Akad', 'Reception',
]

# ---------- Name pools ----------
# Chinese-Malaysian names: mix of pinyin, hokkien, cantonese romanizations + Western first names
CHINESE_FIRST = [
    'Mei Ling', 'Wei Ting', 'Jia Xin', 'Pei Shan', 'Si Min', 'Hui Ying',
    'Xin Yi', 'Hui Min', 'Pei Ling', 'Wen Xin', 'Yu Han', 'Sze Wei',
    'Jasmine', 'Crystal', 'Cheryl', 'Joyce', 'Vivian', 'Sharon', 'Karen',
    'Michelle', 'Sarah', 'Jamie', 'Rachel', 'Hannah', 'Janet', 'Joanne',
    'Ling', 'Mei', 'Hui', 'Ying', 'Bee', 'Pei',
]
CHINESE_LAST = [
    'Tan', 'Lim', 'Lee', 'Wong', 'Chong', 'Chan', 'Ng', 'Yap', 'Goh',
    'Cheong', 'Heng', 'Ooi', 'Ho', 'Foo', 'Lai', 'Yong', 'Loh', 'Choo',
    'Soo', 'Yeoh', 'Kang', 'Boon', 'Khoo', 'Teh', 'Sim', 'Yeo', 'Chew',
]

# Malay names: balanced mix of common feminine names
MALAY_FIRST = [
    'Aisyah', 'Nadira', 'Aida', 'Farah', 'Hanis', 'Iman', 'Nurul', 'Siti',
    'Aliya', 'Sofea', 'Sharifah', 'Atikah', 'Khadijah', 'Nadia', 'Liyana',
    'Syafiqah', 'Aina', 'Eka', 'Mira', 'Izzati', 'Hawa', 'Maisarah',
    'Husna', 'Amira', 'Aleya', 'Fatin', 'Marissa', 'Nor', 'Wani', 'Diyana',
]
MALAY_LAST = [
    'Roslan', 'Ismail', 'Razak', 'Yusof', 'Hassan', 'Aziz', 'Bakar',
    'Rahman', 'Ahmad', 'Ibrahim', 'Mohd', 'Zainal', 'Salleh',
]

# Indian-Malaysian names: South Indian (Tamil) heritage common in Malaysia
INDIAN_FIRST = [
    'Priya', 'Lakshmi', 'Deepa', 'Anjali', 'Kavitha', 'Nirmala', 'Sangeetha',
    'Shanti', 'Vimala', 'Kamala', 'Indira', 'Saraswati', 'Divya', 'Meera',
    'Sushila', 'Padma', 'Geetha', 'Mahalakshmi', 'Hema', 'Sumi',
]
INDIAN_LAST = [
    'Sundaram', 'Krishnan', 'Govindasamy', 'Ramasamy', 'Naidu', 'Subramaniam',
    'Pillai', 'Kumar', 'Singh', 'Devi', 'Raj', 'Murugan', 'Ravi', 'Selvam',
]

# Mixed-heritage / expat / shorter handles
MISC_NAMES = [
    'Liyana', 'Sumi K.', 'Cik Aida', 'Anonymous', 'Cik N.', 'A.',
]

NAME_FORMATS = [
    'full',          # "Aisyah Roslan"
    'first_initial', # "Aisyah R."
    'first_only',    # "Aisyah"
    'initial_last',  # "A. Roslan"
    'handle',        # "@aisyah_kl"
]
NAME_FORMAT_WEIGHTS = [22, 38, 28, 4, 8]


def make_name(ethnicity):
    """Generate a name from one of three ethnicity pools, with realistic format variation."""
    if ethnicity == 'chinese':
        first = random.choice(CHINESE_FIRST)
        last = random.choice(CHINESE_LAST)
    elif ethnicity == 'malay':
        first = random.choice(MALAY_FIRST)
        last = random.choice(MALAY_LAST)
    elif ethnicity == 'indian':
        first = random.choice(INDIAN_FIRST)
        last = random.choice(INDIAN_LAST)
    else:
        return random.choice(MISC_NAMES)

    fmt = random.choices(NAME_FORMATS, weights=NAME_FORMAT_WEIGHTS, k=1)[0]
    if fmt == 'full':
        return f'{first} {last}'
    if fmt == 'first_initial':
        return f'{first} {last[0]}.'
    if fmt == 'first_only':
        return first
    if fmt == 'initial_last':
        return f'{first[0]}. {last}'
    if fmt == 'handle':
        # build a plausible IG/TikTok handle
        base = first.lower().replace(' ', '')
        suffix = random.choice(['_kl', '.my', '_pj', '', '_xx', '.studio'])
        return f'@{base}{suffix}'


# ---------- Voice pools ----------
# Each pool is keyed by voice and (sometimes) sentiment. The generator picks an opener +
# 1-2 middle bits + a closer to compose a review, occasionally adding pain-points.
# Pools are deliberately large to keep generated reviews from feeling templated; a
# no-recent-repeat tracker (see _pick) further reduces back-to-back duplication.

# Standard Malaysian English (clean, like an office worker writing on a tablet)
ENG_OPENERS_POS = [
    "Honestly didn't think magnetic lashes would work for me.",
    "Bought {product} two months ago and I keep coming back to it.",
    "First time trying anything magnetic and I'm sold.",
    "{product} lives in my work bag now.",
    "Skipped my mascara for the first time in years.",
    "I have {eye_shape} eyes and was worried the band wouldn't sit flat.",
    "Got these as a gift and ended up ordering my own pair.",
    "My makeup routine just got 8 minutes shorter.",
    "The packaging alone is worth a photo.",
    "Wore {product} for a 12-hour shift, didn't budge.",
    "I'm bad at makeup. These still worked.",
    "Bought during the launch sale and have zero regrets.",
    "Took me 5 minutes the first time, 30 seconds by day 3.",
    "Finally a magnetic lash that doesn't look obviously fake.",
    "Hard to believe these are reusable.",
    "Saw {product} on a friend and had to ask what brand.",
    "Was on the fence for two months. Should've bought sooner.",
    "Discovered Santai through a TikTok and now I'm in the cult.",
    "Tried two other Malaysian magnetic brands before this. Nothing compares.",
    "Birthday present from my husband, best gift this year.",
    "Saw the founder's interview and decided to support local. No regrets.",
    "I work from home but still wear these because they make me feel put together.",
    "Wore them to my best friend's solemnisation and didn't think about them once.",
    "I was scared I'd poke my eye out. Reader, I did not.",
    "Office crush noticed my eyes. Worth every ringgit alone.",
    "Three months in and these still look brand new.",
    "Replaced my whole strip-lash stash with one pair of these.",
    "My MUA recommended these for a wedding shoot. Now I own three pairs.",
    "Used to wake up at 6 just to put on lashes. Now I sleep till 6:45.",
    "I have sensitive eyes and these don't irritate at all.",
    "I always thought magnetic was a gimmick. Officially wrong.",
    "Mum tried them first, now she's stealing mine.",
    "Took these to a beach trip and they survived the swim, the sweat, and the karaoke.",
    "Sister-in-law gave me a pair after I kept complimenting hers.",
    "Bought these the day my old strip lashes ripped my real ones out. Never going back.",
    "Worth the wait between launches. Pre-ordered immediately.",
    "Tried at a friend's place before buying. Sold within five minutes.",
    "Had to wear them for an event and was nervous, but everything stayed.",
    "My beautician was the one who introduced me to Santai. Trust the experts.",
    "Use them maybe three times a week and still on my first pair after four months.",
]
ENG_OPENERS_NEUTRAL = [
    "Honest review: needed practice.",
    "It took me a few tries to get the alignment right.",
    "Beautiful product but there's a small learning curve.",
    "Good lashes but I needed to watch the tutorial twice.",
    "Took some getting used to but I love them now.",
    "Day 1 was humbling. Day 5 was effortless.",
    "Bought these knowing magnetic lashes take practice. I was right.",
    "Pretty design, fair price, just needs patience to apply.",
    "Worth it, but don't try them for the first time before an event.",
    "Solid product once you watch the demo video twice.",
    "Took longer than the advertised 30 seconds. By day 2, much faster.",
]
ENG_OPENERS_CRITICAL = [
    "Mixed feelings.",
    "Wanted to love these.",
    "Liner runs out faster than I expected.",
    "Pretty but tricky to put on the first time.",
    "Decent but the corner lifts on me if I rush.",
    "Was expecting easier given the marketing.",
    "Cute but not as effortless as I hoped.",
    "Quality is there, application is not for me.",
    "Bought these on the hype train. Hype was slightly oversold.",
]

ENG_BODY_POS = [
    "The magnets do most of the work, you just hold the band close and they snap into place.",
    "Sits completely flat on my lid, no gap, no awkward corner-lift.",
    "Holds through long days, including the LRT commute and aircon offices.",
    "I get compliments every time. People always assume I had extensions done.",
    "Light enough that I forget I'm wearing them.",
    "The case is gorgeous, makes me feel like I'm using something premium.",
    "No glue means no panda eyes at the end of the day.",
    "Easier to remove than to apply. Just lift off, no residue.",
    "Customer service responded within an hour when I had a question.",
    "Looks natural in selfies and in person — not the same with most magnetic lashes.",
    "Pairs well with my normal eyeliner, the magnetic one is just for the lash band.",
    "Works under my glasses, doesn't smudge the lenses.",
    "Survived a swim session at Sunway Lagoon. Tested.",
    "Held through air-con, humidity, the works.",
    "The band is so thin I can apply eyeshadow over it without lifting.",
    "Looks different in every lighting — flatters daylight, dramatic at night.",
    "I keep them in the case in my handbag and they're never tangled.",
    "Magnetic liner draws like a regular eyeliner, no learning curve there.",
    "The instructions card actually helps, didn't expect that.",
    "My contact lenses don't fog up with these, unlike strip lashes.",
    "I've shown three friends how to apply, all bought their own pairs.",
    "Lifts up the outer corner just enough to balance my eye shape.",
    "Fibre quality is genuinely premium, not the stiff plastic strip-lash kind.",
    "Took these to Bali, survived the humidity and the ocean.",
    "Photographs beautifully. My ring light selfies look like studio shots.",
    "Stayed perfect through a tearful K-drama marathon.",
    "Has the right balance — not too natural, not too dramatic.",
    "I love that I can re-use them. Strip lashes felt so wasteful.",
    "The 70L curl lifts my downturned eyes in a way mascara never could.",
    "Sits flush even on my deep-set eyes. Big plus.",
    "I usually struggle with hooded eye products, but the band sits right.",
    "Genuinely the lightest lash I've ever worn. No droop by end of day.",
    "Removal is the part that sold me. Strip-lash glue ruined my natural lashes.",
    "The magnetic liner stays put through eye-rubbing and tearing up at weddings.",
    "Pairs perfectly with a winged liner if you're already used to drawing one.",
]
ENG_BODY_CRITICAL = [
    "Wish the magnetic liner was bigger or refillable.",
    "Instructions in the box could be clearer for first-timers.",
    "Took me about 4 tries on day 1 to get them seated correctly.",
    "The first application was rough, mostly because I rushed it.",
    "Magnet alignment is fiddly if you're applying in dim light.",
    "Wish the case was a tiny bit smaller for my handbag.",
    "The outer corner needs an extra press, otherwise it'll lift.",
    "Take longer than expected if you have shaky hands like me.",
]

ENG_CLOSERS_POS = [
    "Will repurchase.",
    "Worth every ringgit.",
    "Already ordered a backup pair.",
    "100% buying again.",
    "10/10, no notes.",
    "Highly recommend, especially for first-timers.",
    "Recommended to my whole office WhatsApp group.",
    "My new daily.",
    "Permanently in my bag.",
    "Bought a second pair as a gift.",
    "If you're on the fence, just buy them.",
    "Hands down the best beauty purchase this year.",
    "My makeup bag has been forever changed.",
    "Skip the strip lashes, go straight to these.",
    "Genuinely worth the price.",
    "Will be repurchasing the moment my pair gives out.",
    "Already telling everyone who'll listen.",
    "Just go for it.",
    "Local brand done right.",
    "Five stars without thinking twice.",
    "Worth more than the asking price honestly.",
]
ENG_CLOSERS_NEUTRAL = [
    "Recommended, just be patient on day 1.",
    "Worth it once you get the hang of it.",
    "Would buy again, learning curve and all.",
    "Stick with it through the first week and it pays off.",
    "Solid product, just don't expect Day-1 perfection.",
]

# Manglish — heavier slang, particles, "lah / eh / leh / hor / can / cannot / confirm / gerek"
MANGLISH_OPENERS = [
    "Eh confirm worth it lah.",
    "Walao, why I never try this earlier.",
    "Okay first of all, this is so gerek.",
    "Beli {product} masa launch, no regrets at all.",
    "Aiyo, the application part is the fun bit.",
    "Got it from Santai launch promo, can confirm legit.",
    "Saya beli {product} dua bulan lepas, sampai sekarang still pakai.",
    "Bestie kata try this brand, I tried, sekarang dia pulak nak beli.",
    "Boss noticed my eyes today. Told her Santai, she Instagram-stalked the shop.",
    "Mak suruh beli yang murah dulu, ended up buying two pairs of these instead.",
    "Akak office punya recommendation, ended up jadi addicted.",
    "Tetiba je nampak ad on IG, panggil bestie suruh beli sekali.",
    "Honestly the easiest thing I've added to my morning routine in years.",
    "Aunty cashier kat MidValley pun tanya which brand.",
    "Sis, this is the lazy-girl lash, period.",
    "Akak punya colleague pakai, nampak best, terus PM founder for stock check.",
    "Save up dua bulan untuk beli set, totally worth it tau.",
    "Pakai first time, jaw dropped weh.",
    "Macam tak percaya magnetic boleh sit flat macam ni.",
    "Beli untuk akad sister, dia minta lagi second pair untuk reception.",
    "Eh first try sangat senang, you ingat susah but no.",
    "Last week pergi Bangsar event, semua orang tanya which lashes.",
    "After tried 3 other brands, akhirnya jumpa the one.",
    "Pakai pergi MRT, panas, hujan, tak lekang pun.",
    "Tak menyesal langsung beli pre-order set.",
    "Cousin saya influencer, dia pun pakai Santai. Confirm legit.",
]

MANGLISH_BODY = [
    "Senang nak pakai gila, terus stick on the lash line.",
    "Cantik dia, very flattering for my mata sepet.",
    "Kawan-kawan ingat saya buat extension haha.",
    "Hold properly the whole day, no need touch up.",
    "Lipat kasi flat, simpan dalam casing, sekejap saja.",
    "Pakai pergi kerja, balik rumah masih on the dot.",
    "Tak rasa heavy on the eye lid, macam tak pakai apa-apa.",
    "Recommended for office girlies who always rush in the morning.",
    "Pakai pergi wedding, tak ada lift up langsung sampai habis majlis.",
    "Tahan air mata bila cry watching K-drama, can confirm waterproof.",
    "Senang pakai under glasses, tak kacau the lens.",
    "Cantik dia sit flush on the lid, no gap, no lifting.",
    "Apply ikut tutorial, jadi within seconds.",
    "Tak rasa berat langsung, macam tak pakai apa-apa.",
    "Bila tanggal, no glue residue, no patah lashes asli.",
    "Liner dia draw smooth, tak skip-skip macam yang lain.",
    "Travel with the case, sekali pun tak rosak.",
    "Comel betul packaging dia, rasa macam unboxing luxury.",
    "Mata saya sensitive, tapi ni tak buat watery langsung.",
    "Boss compliment hari Senin pagi. Win.",
    "Husband ingat saya pergi salon. Told him magnetic, dia tak percaya.",
    "Senang nak simpan dalam beg tangan, casing dia compact.",
    "Pakai sekali jadi habit, sekarang every Monday wajib.",
    "Sit perfectly on my eye shape, tak payah trim langsung.",
    "Berbaloi sangat, harga bawah RM150 dapat magnetic quality macam ni.",
    "Brush dia included in the kit pun useful giler.",
]

MANGLISH_CLOSERS = [
    "Confirm beli lagi.",
    "100% recommend lah.",
    "Sangat berbaloi-baloi.",
    "Boleh tahan lah honestly.",
    "Try lah, you won't regret.",
    "Memang sayang nak habiskan.",
    "Will get another pair next month.",
    "Will rep this brand sampai bila-bila.",
    "Sis you need to try.",
    "Stop scrolling and just buy lah.",
    "My honest verdict: terbaik.",
    "Local brand boleh kalahkan Sephora honestly.",
    "Don't sleep on this one.",
    "Will tag you guys when I do the next review.",
]

# Bahasa Malaysia — formal-leaning, the kind of review an older customer might leave
BM_FORMAL_OPENERS = [
    "Saya amat berpuas hati dengan {product}.",
    "Pertama kali mencuba bulu mata magnetik dan saya sangat impressed.",
    "Produk ini memang sesuai untuk mereka yang sibuk dan tidak ada masa untuk makeup yang complicated.",
    "Saya membeli {product} sebagai hadiah dan akhirnya saya pun beli untuk diri sendiri.",
    "Hasil yang ditawarkan oleh {product} setanding dengan harga yang dibayar.",
]
BM_FORMAL_BODY = [
    "Reka bentuk band yang nipis membolehkan ia melekat dengan kemas pada garisan bulu mata semula jadi.",
    "Tidak meninggalkan sebarang kesan apabila ditanggalkan, tidak seperti gam yang sering merosakkan bulu mata.",
    "Sangat ringan dan selesa dipakai sepanjang hari.",
    "Pakej yang diterima sangat elegant, sesuai untuk hadiah.",
    "Pengalaman membeli-belah dengan Santai juga lancar — penghantaran cepat di Klang Valley.",
    "Saya mengesyorkan produk ini kepada rakan-rakan saya, terutamanya yang baru ingin mencuba bulu mata magnetik.",
]
BM_FORMAL_CLOSERS = [
    "Pasti akan membeli semula.",
    "Sangat berbaloi.",
    "Saya berpuas hati sepenuhnya.",
    "Akan saya cadangkan kepada keluarga dan rakan-rakan.",
]

# Bahasa Malaysia — INFORMAL, the kind of casual review a young customer leaves
BM_INFORMAL_OPENERS = [
    "Comel sangat lashes ni.",
    "Cantik gila, sumpah.",
    "Suka sangat dengan {product}, ringan dan natural.",
    "Akhirnya jumpa magnetic lashes yang fit my mata.",
    "Suka sebab tak rasa heavy.",
    "Beli {product} ikut review IG, sumpah tak menyesal.",
    "Sis sumpah bayar mahal pun berbaloi untuk ni.",
    "First time tengok ad, terus add to cart.",
    "Dah lama nak cuba magnetic lashes, alhamdulillah jumpa Santai.",
    "Kakak ipar bagi sebagai birthday gift, terus jatuh cinta.",
    "Sebelum ni stress nak pakai bulu mata palsu, tapi ni mudah giler.",
    "Mama saya pun pakai, dia kata best.",
    "Tengok TikTok girls semua pakai, akhirnya beli sendiri.",
]
BM_INFORMAL_BODY = [
    "Bila pakai tak nampak palsu, betul-betul nampak macam own lashes.",
    "Hubby pun tak perasan, ingat saya pergi salon.",
    "Hari-hari pakai pergi office, sampai weekend pun pakai.",
    "Senang nak ratakan, tak payah cermin pun boleh.",
    "Casing dia cantik, tak rasa segan letak atas meja dressing.",
    "Beg saya sekarang ada Santai sebagai essentials.",
    "Tahan cuaca panas KL yang melampau ni.",
    "Pakai 3 hari berturut-turut, masih cantik macam baru.",
    "Bila orang puji baru perasan tu sebab Santai.",
    "Pakai pakai pakai, sekarang dah jadi part of muka.",
    "Sekejap je settle, sambung makeup yang lain.",
    "Tak gugur walaupun sambil masak dan menangis tengok cerekarama.",
    "Suami pun puji cantik, dia rare nak comment pasal makeup.",
]
BM_INFORMAL_CLOSERS = [
    "Beli lagi confirm.",
    "Recommended sangat.",
    "Berbaloi-baloi.",
    "Cuba lah, tak rugi.",
    "Will repurchase, jangan tanya.",
    "Akak pun nak beli lagi sepasang.",
    "Five stars, no doubt.",
    "Tak boleh hidup tanpa Santai sekarang.",
    "Yes yes yes, beli je.",
    "Bagi 100 stars boleh tak?",
]

# Indian-Malaysian voice — clean English, occasional code-switch with "lah" / "macha" / family refs
INDIAN_OPENERS = [
    "My sister introduced me to Santai and now I'm a convert.",
    "I'm an oncologist and our hospital rules don't allow extensions, but these are perfect.",
    "Bought {product} for my engagement weekend.",
    "I have hooded eyes and the band sits flush, no awkward gap.",
    "Skeptical at first because I've tried other brands and the magnets always failed.",
    "Got these for Diwali makeup and they completed the look.",
    "My amma kept asking about my lashes after Deepavali. Had to buy her a set.",
    "Bought these for my Tamil wedding muhurtham and I have zero regrets.",
    "Was looking for something that would survive a long puja day. Found it.",
    "My MUA in Bangsar uses Santai on all her brides, that sold me.",
    "Got mine after seeing a review from a fellow Bharatanatyam student.",
    "I teach yoga and my regular lashes were drooping after every class. Not these.",
    "Cousin's wedding photoshoot was my first wear, photographer was impressed.",
    "Sister-in-law tried mine and bought her own within the week.",
    "Wore these for my graduation ceremony, didn't budge through 4 hours.",
]
INDIAN_BODY = [
    "The band weight is the lightest I've tried — I literally don't feel them.",
    "Held up perfectly through a Carnatic music performance with stage lights.",
    "Photographer at my engagement asked which extensions I was wearing.",
    "Survived a 6-hour bharatanatyam recital, the makeup melted before the lashes did.",
    "Magnetic eyeliner doesn't sting my eyes the way the previous brand's did.",
    "The band sits perfectly with traditional eye makeup, no gap when I do my kohl.",
    "Held up through a Mehndi ceremony, a sangeet, and the actual wedding day.",
    "Lasted through my Pongal cooking session in a hot kitchen, no smudging.",
    "Fits beautifully under my horn-rimmed glasses, no lens touching.",
    "I have monolid-leaning eyes and this still lifts the corner naturally.",
    "Removal is gentle enough that I don't lose any of my natural lashes.",
    "Even survived a temple visit with all the incense and humidity.",
]
INDIAN_CLOSERS = [
    "Already on my second pair.",
    "Recommended to my mom and aunties at the temple.",
    "Highly recommended, especially for festival makeup.",
    "Will definitely buy again, no hesitation.",
    "My sisters are next on my list to convert.",
    "Bought one for my mom's birthday next month.",
    "Cannot go back to strip lashes after this.",
    "Worth every cent and then some.",
]

# Mandarin / Chinese-English code-switch voice — for Chinese-Malaysian reviewers
# who lean into Chinese phrases. Includes some Mandarin script + mixed-language sentences.
MANDARIN_OPENERS = [
    "用了三个月，还是像新的一样。",                         # Used 3 months, still like new
    "终于找到适合我单眼皮的磁性睫毛。",                       # Finally found magnetic lashes for my monolid
    "完全没有不适感，第一次戴磁性睫毛就成功了。",             # No discomfort, first try successful
    "买了两双，一双自用一双送朋友。",                       # Bought two pairs, one for self one for friend
    "Quality 真的不错，比预期的好。",                       # Quality really good, better than expected
    "Used them for Chinese New Year visiting, no touch-ups all day.",
    "My ah-ma actually approved, that's a first.",
    "妈妈试过我的，现在她也要买。",                         # Mom tried mine, now she wants to buy
    "比之前用的胶水睫毛好太多了。",                         # Much better than the glue lashes I used before
    "包装精美，质量也很好。",                              # Packaging beautiful, quality good
    "Bestie 介绍的，现在我也介绍给我的朋友们。",              # Bestie introduced, now I introduce to my friends
    "试过其他牌子，还是 Santai 最适合我。",                  # Tried other brands, Santai suits me best
    "Sister introduced me to these, now my whole 姐妹 group has them.",
    "终于一对磁性睫毛 sit flush 在我的眼皮上。",
    "Quality 完全 worth 这个价钱。",
]
MANDARIN_BODIES = [
    "磁吸力够强，戴一整天都不会掉。",                       # Strong magnetic force, won't fall off all day
    "Eyeliner draw 很顺，magnet click 也准。",
    "戴起来很轻，几乎感觉不到。",                         # Light to wear, barely felt
    "Office wear 完全 OK，no one noticed they're magnetic.",
    "Travel 带着方便，casing 很 sturdy。",
    "Removed 容易，no residue。",
    "适合 monolid 的款式，band sit flush。",
    "Pair with 现有的 eyeliner 也 fine。",
    "戴了一整天都没有不舒服。",                           # Wore all day, no discomfort
    "比 strip lashes 方便十倍。",                          # Ten times more convenient than strip lashes
    "Lasted through CNY visiting without touch-ups.",
    "Cousin asked which brand, told her Santai, she ordered same night.",
]
MANDARIN_CLOSERS = [
    "强烈推荐！",                                      # Strongly recommend!
    "Will definitely 回购。",                          # Will definitely repurchase
    "Worth every cent.",
    "Local brand 加油！",                              # Support local brand
    "推荐给所有 Chinese girls。",
    "已经买第二双了。",                                # Already bought second pair
    "Stop scrolling 直接 buy。",
    "Saved me so much morning time, no joke.",
]

# ---------- Learning-curve narrative pool ----------
# A specific story arc: "first try was rough, then I got it, now it's effortless."
# Injected as a full-arc replacement for ~20% of 4-5 star reviews so the dataset
# reflects the real first-time-user experience.
LEARNING_CURVE_OPENERS = [
    "First time was humbling. By day 3, faster than mascara.",
    "Took me five attempts on day 1. Six months in, I do it in 20 seconds.",
    "Almost returned them on day 2. Glad I didn't — now my daily.",
    "Patience is the secret. First try was rough, third try was perfect.",
    "Day 1: panic mode. Day 7: muscle memory.",
    "Watched the demo video three times before I got it. Worth the patience.",
    "Be patient with the first few wears. It clicks suddenly, then it's effortless.",
    "Day 1 I almost cried. Day 14, my sister asked me to teach her.",
    "Don't judge it by attempt one. By attempt five it's a different product.",
    "Bought, struggled, watched a tutorial, fell completely in love.",
    "The learning curve is real but short — about a week if you're average.",
    "First wear: 12 minutes and slightly crooked. Third wear: 45 seconds and perfect.",
    "Felt like I was failing for 3 days. Then it just clicked.",
    "Honestly thought I'd made a mistake the first night. Day 4 I was a believer.",
    "Pakai first time, frustrated nak gila. Pakai fifth time, jadi muscle memory.",
    "First try sangat susah, fifth try sangat senang. Promise.",
    "Take it from someone who fumbled for an hour on day 1 — give it three tries.",
    "My friend warned me about the learning curve. She was right but also it's so worth it.",
    "Was about to message customer service to ask for a refund. Then watched the video properly.",
]
LEARNING_CURVE_BODIES = [
    "If you struggle on day 1, stick with it — the breakthrough happens around day 3-4.",
    "What helped me: do it sitting down, good lighting, no rushing.",
    "Pro tip from another struggler: let the magnets find each other, don't force them.",
    "Once you nail the angle, it lives in muscle memory forever.",
    "Wish someone told me the first time would feel awkward — it gets so much faster.",
    "The video tutorial saved me. Watch it BEFORE your first attempt, not after.",
    "I almost returned mine after day 1. So glad I didn't.",
    "The breakthrough happens when you stop thinking and just trust the magnet click.",
    "Three days of slight struggle, six months of effortless wear. Worth the trade.",
    "Like learning to drive — first lesson chaos, fifth lesson natural.",
    "It's a 5-minute job on day 1 and a 30-second job by day 7. Just hang in there.",
    "The shift from 'this is hard' to 'this is easy' happens overnight. Wild experience.",
    "Now I think it would actually be harder for me to do strip-lash glue again.",
    "I genuinely don't remember the last time I used mascara. That's the level of life-changing.",
    "Cancelled my eyelash extension appointments. These are that good once you've got the hang.",
]
LEARNING_CURVE_CLOSERS = [
    "Trust the process. It's worth it.",
    "Push through day 1 and you're set for life.",
    "Patience pays off massively with these.",
    "Genuinely life-changing once you're past the first few tries.",
    "The learning curve is brief. The payoff is enormous.",
    "If I can do this, anyone can.",
    "Take it from someone who was about to give up.",
    "Three days of patience for a lifetime of effortless lashes. Take the trade.",
    "My only regret is not buying them sooner.",
]

# Pain-point sentences to occasionally inject in lower-rating reviews
PAIN_POINTS = [
    "Took me about 4 tries on day 1 to align the magnets right.",
    "The first application took me 10 minutes. Now I do it in 30 seconds.",
    "Outer corner lifted on me twice before I learned to press inward first.",
    "Magnetic liner ran out faster than I'd like — wish there was a refill.",
    "Wish the instructions in the box had a QR code to the demo video.",
    "Took practice. Day 1 was rough but I figured it out by day 3.",
    "First time I stuck them on upside down, lol. Lesson learned.",
]

# ---------- Lazy / short-form reviews (~17% of all reviews) ----------
# These are the "drive-by" reviews — 2-7 words, often no title. Real customers leave
# these all the time. Pools are split by voice + sentiment to keep mixing realistic.
LAZY_ENG_POS = [
    'Love it.', 'Game changer.', 'Obsessed.', '10/10.', 'Worth it.',
    'Best decision.', 'Already repurchased.', 'No notes.', 'My new daily.',
    'Genuinely so good.', 'Sold.', 'Bought a second pair.', 'Recommended.',
    'Sits flat, looks natural.', 'No regrets.', 'Best magnetic lashes I\'ve tried.',
    'Hooked.', 'Lives in my bag.', 'Perfect for first-timers.',
    'So light, didn\'t feel them.', 'Better than expected.', 'Survived a long day.',
    'Yes.', 'Easier than mascara, like they said.',
]
LAZY_ENG_NEUTRAL = [
    'Decent.', 'Took practice but okay.', 'Pretty, but learning curve.',
    'Okay lah, needs patience.', 'Average. Will keep trying.', 'Not bad.',
]
LAZY_ENG_NEGATIVE = [
    'Not for me.', 'Wanted to love it.', 'Didn\'t sit right on my eyes.',
]

LAZY_MANGLISH = [
    'Best lah.', 'Confirm berbaloi.', 'Syiok!', 'Best gila.', 'Suka sangat.',
    'Gerek!', 'Top notch.', 'Pakai dah berbulan, masih on point.',
    'Walao, why I never try earlier.', 'Wakaka boss kena tipu.',
    'Cantik dia, can confirm.', 'Beli lagi confirm.', 'Memang gerek lah.',
    'Worth the hype.', 'Senang gila pakai.', 'Eh nice.',
    'Tak menyesal.', 'Beli untuk akak pulak.', 'Bagi mak, dia pun beli.',
]
LAZY_MANGLISH_NEUTRAL = [
    'Boleh tahan lah.', 'So-so for me.', 'Macam okay aje.',
]

LAZY_BM = [
    'Cantik sangat.', 'Senang pakai.', 'Comel.', 'Memang berbaloi.',
    'Suka!', 'Ringan dan selesa.', 'Cantik gila.', 'Best.',
    'Worth it sungguh.', 'Senang dan cepat.', 'Sangat memuaskan.',
    'Berkualiti.', 'Disyorkan.', 'Tak rugi beli.',
]
LAZY_BM_NEUTRAL = [
    'Okay je.', 'Boleh tahan.', 'Standard saja.',
]

LAZY_INDIAN = [
    'Already on pair two.', 'Mom approved.', '10/10 quality.',
    'Recommended to my sisters.', 'Lasted through Diwali, sold.',
    'Akka also bought after seeing mine.', 'Will buy again.',
    'My niece wants one.', 'No complaints.',
]
LAZY_MANDARIN = [
    '强烈推荐！',                  # Strongly recommend!
    '已经买第二双了。',             # Already bought second pair
    '比 strip lashes 好太多。',
    '推荐！',                      # Recommend!
    'Quality 真的不错。',
    '完全 worth it。',
    '会回购。',                    # Will repurchase
    'Mom approved 了。',
    '太方便了。',                  # Too convenient
    'Saved my morning routine.',
    'Sister 也想买。',
]

LAZY_TITLES = [
    'Sold', 'Yes', 'Love', 'Best lah', 'Recommended', 'No notes',
    'Worth it', 'Obsessed', 'My new daily', 'Repurchasing',
    '', '', '', '', '',  # empty titles common for lazy reviews
]
LAZY_TITLES_NEUTRAL = [
    'Okay', 'Decent', 'Mixed', 'Learning curve', '', '',
]
LAZY_TITLES_NEGATIVE = [
    'Not for me', 'Meh', '',
]

LAZY_PCT = 0.17  # ~17% of all reviews are lazy/short

# ---------- No-recent-repeat picker ----------
# Tracks the last N picks per pool so the same opener/body/closer doesn't
# show up back-to-back across reviews. Without this, even with large pools
# the random.choice picks cluster — readers spot the repeats immediately.

from collections import deque

_recent = {}
_WINDOW = 20  # don't pick the same line if it's within the last 20 picks from this pool

def _pick(pool, key):
    """Like random.choice(pool) but avoids the last _WINDOW picks for this key."""
    if key not in _recent:
        _recent[key] = deque(maxlen=_WINDOW)
    available = [x for x in pool if x not in _recent[key]]
    if not available:  # window saturated the whole pool — reset
        available = pool
        _recent[key].clear()
    pick = random.choice(available)
    _recent[key].append(pick)
    return pick


def _sample(pool, k, key):
    """Like random.sample(pool, k) but avoids the last _WINDOW picks."""
    out = []
    for _ in range(k):
        out.append(_pick([x for x in pool if x not in out], key))
    return out


# ---------- Compose a review ----------

def compose_lazy(voice, rating):
    """Drive-by review: a few words, often no title. Returns (title, body)."""
    if rating >= 4:
        if voice == 'manglish':
            body = _pick(LAZY_MANGLISH, 'lazy_mang')
        elif voice in ('bm_informal', 'bm_formal'):
            body = _pick(LAZY_BM, 'lazy_bm')
        elif voice == 'indian':
            body = _pick(LAZY_INDIAN, 'lazy_ind')
        elif voice == 'mandarin':
            body = _pick(LAZY_MANDARIN, 'lazy_man')
        else:
            body = _pick(LAZY_ENG_POS, 'lazy_eng_pos')
        title = _pick(LAZY_TITLES, 'lazy_title')
    elif rating == 3:
        if voice == 'manglish':
            body = _pick(LAZY_MANGLISH_NEUTRAL, 'lazy_mang_neu')
        elif voice in ('bm_informal', 'bm_formal'):
            body = _pick(LAZY_BM_NEUTRAL, 'lazy_bm_neu')
        else:
            body = _pick(LAZY_ENG_NEUTRAL, 'lazy_eng_neu')
        title = _pick(LAZY_TITLES_NEUTRAL, 'lazy_title_neu')
    else:  # 1-2 stars
        body = _pick(LAZY_ENG_NEGATIVE, 'lazy_eng_neg')
        title = _pick(LAZY_TITLES_NEGATIVE, 'lazy_title_neg')
    return title, body


def compose_review(ethnicity, voice, rating, product_handle):
    """Build a review body + title that feels like a real customer."""
    product_name = PRODUCT_DISPLAY[product_handle]
    eye_shape = PRODUCT_EYE[product_handle]

    def fill(s):
        return s.replace('{product}', product_name).replace('{eye_shape}', eye_shape)

    # Learning-curve narrative: 20% of 4-5 star reviews tell the "first was hard, now it's amazing" arc.
    # This overrides voice + uses dedicated pools so the story arc reads as a single coherent voice.
    if rating in (4, 5) and random.random() < 0.20:
        opener = _pick(LEARNING_CURVE_OPENERS, 'lc_open')
        body = ' '.join(_sample(LEARNING_CURVE_BODIES, random.choice([1, 2]), 'lc_body'))
        closer = _pick(LEARNING_CURVE_CLOSERS, 'lc_close')
        full_text = f'{fill(opener)} {fill(body)} {fill(closer)}'
        title = random.choice([
            'Trust the process', 'Worth pushing through', 'Day 1 was rough, day 7 was magic',
            'Patience pays', 'Stick with it', 'The breakthrough is real',
            'Almost gave up — glad I didn\'t', 'It clicks suddenly',
            'Learning curve was worth it', 'Life-changing after the first week',
        ])
        return title, full_text

    # Pick opener / body / closer based on voice + rating, with no-recent-repeat dedup
    if voice == 'manglish':
        opener = _pick(MANGLISH_OPENERS, 'mang_open')
        body = ' '.join(_sample(MANGLISH_BODY, random.choice([1, 1, 2]), 'mang_body'))
        closer = _pick(MANGLISH_CLOSERS, 'mang_close')
    elif voice == 'bm_formal':
        opener = _pick(BM_FORMAL_OPENERS, 'bmf_open')
        body = ' '.join(_sample(BM_FORMAL_BODY, random.choice([1, 1, 2]), 'bmf_body'))
        closer = _pick(BM_FORMAL_CLOSERS, 'bmf_close')
    elif voice == 'bm_informal':
        opener = _pick(BM_INFORMAL_OPENERS, 'bmi_open')
        body = ' '.join(_sample(BM_INFORMAL_BODY, random.choice([1, 1, 2]), 'bmi_body'))
        closer = _pick(BM_INFORMAL_CLOSERS, 'bmi_close')
    elif voice == 'indian':
        opener = _pick(INDIAN_OPENERS, 'ind_open')
        body = ' '.join(_sample(INDIAN_BODY, random.choice([1, 1, 2]), 'ind_body'))
        closer = _pick(INDIAN_CLOSERS, 'ind_close')
    elif voice == 'mandarin':
        opener = _pick(MANDARIN_OPENERS, 'man_open')
        body = ' '.join(_sample(MANDARIN_BODIES, random.choice([1, 1, 2]), 'man_body'))
        closer = _pick(MANDARIN_CLOSERS, 'man_close')
    else:  # 'eng'
        if rating == 5:
            opener = _pick(ENG_OPENERS_POS, 'eng_open_pos')
            body = ' '.join(_sample(ENG_BODY_POS, random.choice([1, 1, 2]), 'eng_body_pos'))
            closer = _pick(ENG_CLOSERS_POS, 'eng_close_pos')
        elif rating == 4:
            opener = _pick(ENG_OPENERS_POS + ENG_OPENERS_NEUTRAL, 'eng_open_4')
            body_pool = ENG_BODY_POS + ENG_BODY_CRITICAL[:1]
            body = ' '.join(_sample(body_pool, random.choice([1, 2]), 'eng_body_4'))
            closer = _pick(ENG_CLOSERS_POS + ENG_CLOSERS_NEUTRAL, 'eng_close_4')
        else:  # 3, 2, 1
            opener = _pick(ENG_OPENERS_NEUTRAL + ENG_OPENERS_CRITICAL, 'eng_open_crit')
            body = ' '.join(_sample(ENG_BODY_CRITICAL + ENG_BODY_POS[:3], 2, 'eng_body_crit'))
            closer = _pick(ENG_CLOSERS_NEUTRAL, 'eng_close_neu')

    # Occasional pain-point injection for 3-4 star reviews
    if rating <= 4 and random.random() < 0.4:
        body = body + ' ' + random.choice(PAIN_POINTS)

    full_text = f"{fill(opener)} {fill(body)} {fill(closer)}"

    # Title — derive a short headline from common patterns
    title = random.choice([
        f'{product_name} convert',
        f'Worth the hype',
        f'Now my daily',
        f'Surprised, in a good way',
        f'My new favourite',
        f'First magnetic lash that actually fits',
        f'Did not expect to like these as much',
        f'Better than extensions',
        f'Wore it through a long day',
        f'Easier than mascara',
        f'Genuine 30-second application by day 3',
        f'Sits flat, looks natural',
        f'Compliments every time',
        f'Light, comfy, easy',
        f'Lazy-girl approved',
        f'Bestie put me on',
        f'Bought it for Raya, kept wearing it after',
        f'Survived my akad',
        f'Easy after the first try',
        f'Glasses-friendly',
        f'Survived a 12-hour shift',
        f'Lasted through KL humidity',
    ])
    # Lower-rating reviews get more honest headlines
    if rating == 3:
        title = random.choice([
            'Good but practice needed', 'Works after a few tries',
            'Not bad, learning curve',
        ])
    elif rating == 2:
        title = random.choice([
            'Mixed feelings', 'Needed more practice than expected',
            'Wanted to love these',
        ])
    elif rating == 1:
        title = random.choice([
            'Didn\'t work for my eye shape', 'Not for me',
        ])

    return title, full_text


def make_tag(product_handle):
    eye = PRODUCT_EYE[product_handle]
    use = random.choice(USE_CASES)
    return f'{eye} · {use}'


def make_date():
    """Realistic relative dates spread across a year."""
    unit = random.choices(
        ['day', 'week', 'month'],
        weights=[15, 35, 50],
        k=1,
    )[0]
    if unit == 'day':
        n = random.randint(1, 30)
        return f'{n} day{"s" if n != 1 else ""} ago'
    if unit == 'week':
        n = random.randint(1, 8)
        return f'{n} week{"s" if n != 1 else ""} ago'
    n = random.randint(1, 11)
    return f'{n} month{"s" if n != 1 else ""} ago'


# ---------- Generate ----------

RATING_WEIGHTS = [1, 7, 22, 70]   # 2★, 3★, 4★, 5★. 1★ added separately ~0.5%
RATING_VALUES = [2, 3, 4, 5]

# Voice mix by ethnicity (within each ethnicity, what voice register do they default to)
def pick_voice(ethnicity):
    if ethnicity == 'malay':
        return random.choices(
            ['eng', 'manglish', 'bm_informal', 'bm_formal'],
            weights=[20, 40, 30, 10], k=1,
        )[0]
    if ethnicity == 'indian':
        return random.choices(
            ['eng', 'manglish', 'indian'],
            weights=[35, 25, 40], k=1,
        )[0]
    # Chinese-Malaysian: mostly clean English, some Mandarin / Chinese-English code-switch,
    # a sprinkle of Manglish. Never Bahasa Melayu — that's not their voice.
    return random.choices(
        ['eng', 'mandarin', 'manglish'],
        weights=[75, 15, 10], k=1,
    )[0]


def pick_rating():
    # 0.5% chance of 1-star
    if random.random() < 0.005:
        return 1
    return random.choices(RATING_VALUES, weights=RATING_WEIGHTS, k=1)[0]


def pick_ethnicity():
    return random.choices(
        ['chinese', 'malay', 'indian'],
        weights=[50, 35, 15], k=1,
    )[0]


rows = []
for handle, count in PRODUCT_COUNTS.items():
    for _ in range(count):
        eth = pick_ethnicity()
        voice = pick_voice(eth)
        rating = pick_rating()
        if random.random() < LAZY_PCT:
            title, body = compose_lazy(voice, rating)
        else:
            title, body = compose_review(eth, voice, rating, handle)
        rows.append({
            'rating': rating,
            'title': title,
            'body': body,
            'author': make_name(eth),
            'tag': make_tag(handle),
            'verified': 'true' if random.random() < 0.93 else 'false',
            'date': make_date(),
            'product_handle': handle,
            'featured': 'false',
            'photos': '',
        })

# Hand-pick 9 featured reviews for homepage band — spread across products + ethnicities + voices
# Criteria: 5-star, short-to-medium body, clear voice. We pick by index from the generated set.
# To keep it deterministic + curated, we'll find candidates that match a rough quality filter.
def find_featured():
    candidates = []
    for i, r in enumerate(rows):
        if r['rating'] != 5:
            continue
        body_len = len(r['body'])
        # Skip lazy reviews — featured pull-quotes need a full sentence or two
        if body_len < 110 or body_len > 220:
            continue
        candidates.append(i)
    # Shuffle deterministically, then pick first 9 — spread across products
    random.shuffle(candidates)
    picked = []
    seen_handles = set()
    for i in candidates:
        if rows[i]['product_handle'] not in seen_handles or len(picked) >= 6:
            picked.append(i)
            seen_handles.add(rows[i]['product_handle'])
        if len(picked) >= 9:
            break
    return picked


for i in find_featured():
    rows[i]['featured'] = 'true'

# ---------- Write CSV ----------
with OUT.open('w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=[
        'rating', 'title', 'body', 'author', 'tag',
        'verified', 'date', 'product_handle', 'featured', 'photos',
    ])
    w.writeheader()
    w.writerows(rows)

# ---------- Summary ----------
from collections import Counter
print(f'Wrote {len(rows)} reviews to {OUT}')
print()
print('Distribution by product:')
counts = Counter(r['product_handle'] for r in rows)
for handle, c in counts.most_common():
    print(f'  {handle:50}  {c:3}')
print()
print('Distribution by rating:')
ratings = Counter(r['rating'] for r in rows)
for r in sorted(ratings, reverse=True):
    pct = ratings[r] * 100 / len(rows)
    print(f'  {r}★  {ratings[r]:3}  ({pct:.1f}%)')
print()
print(f'Verified: {sum(1 for r in rows if r["verified"] == "true")} / {len(rows)}')
print(f'Featured: {sum(1 for r in rows if r["featured"] == "true")} / {len(rows)}')
print()
print('--- Sample reviews (5 random) ---')
for r in random.sample(rows, 5):
    print(f'  [{r["rating"]}★] {r["author"]}  ·  {r["tag"]}  ·  {r["date"]}  ·  {r["product_handle"]}')
    print(f'    "{r["title"]}"')
    print(f'    {r["body"][:200]}{"..." if len(r["body"]) > 200 else ""}')
    print()
