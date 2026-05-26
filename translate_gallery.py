import os
import json
import urllib.request

# Parse .env.local
env = {}
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            key, val = line.split('=', 1)
            env[key.strip()] = val.strip().strip("'").strip('"')

SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Fetch gallery
req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/gallery?select=*', headers=headers)
with urllib.request.urlopen(req) as response:
    gallery = json.loads(response.read().decode())

translations = {
    "কেবিনের জানালার পাশে আরামদায়ক মুহূর্ত": "Cozy moment by cabin window",
    "কুহেলিকার কাঠের ইন্টেরিয়র": "Wooden interior of Kuhelika",
    "প্রিমিয়াম কেবিন বেড": "Premium cabin bed",
    "ছাদের ডেকে খাবারের আয়োজন": "Dining arrangement on rooftop deck",
    "কুহেলিকা হাউসবোটের বাইরের দৃশ্য": "Exterior view of Kuhelika houseboat",
    "হাওরের মাঝে কুহেলিকা": "Kuhelika in Haor waters",
    "ছাদে সূর্যাস্তের মুহূর্ত": "Sunset moment at rooftop",
    "বড় জানালা সহ কেবিন": "Cabin with large windows",
    "হাওরের মাঝে খাবার পরিবেশন": "Serving food in the middle of Haor",
    "দেশীয় খাবারের আয়োজন": "Local food arrangement",
    "ছাদে ডাইনিং সেটআপ": "Rooftop dining setup",
    "নদীর পাড়ে দুপুরের খাবার": "Lunch plate by the river",
    "কুহেলিকা কেবিনের বিছানা": "Kuhelika cabin bed",
    "কাঠের লাউঞ্জ স্পেস": "Wooden lounge space",
    "গ্রুপ ট্যুরের স্মৃতি": "Group tour memories",
    "সাজানো প্রিমিয়াম কেবিন": "Decorated premium cabin",
    "কেবিনের বাইরের বসার জায়গা": "Sitting area outside cabin",
    "এসি কেবিনের ইন্টেরিয়র": "AC cabin interior",
    "মেঘলা আকাশের নিচে কুহেলিকা": "Kuhelika under cloudy sky",
    "আরামদায়ক ডাবল বেড কেবিন": "Comfortable double bed cabin",
    "সবুজ পাতার মাঝে হাউসবোট": "Houseboat among green leaves",
    "কেবিনের কাঠের সাজসজ্জা": "Wooden decoration of cabin",
    "কেবিনে সকালের নাস্তার আয়োজন": "Breakfast arrangement in cabin",
    "লাউঞ্জ স্পেস ও জানালার দৃশ্য": "Lounge space and window view",
    "কেবিনে অতিথিদের মুহূর্ত": "Guest moment in cabin",
    "প্রাইভেট কেবিন সেটআপ": "Private cabin setup",
    "কেবিন ডেকের বাইরের দৃশ্য": "Exterior view of cabin deck",
    "কুহেলিকার লাউঞ্জ এরিয়া": "Lounge area of Kuhelika",
    "অতিথিদের আনন্দময় মুহূর্ত": "Joyful moments of guests",
    "কুহেলিকা লোগো কর্নার": "Kuhelika logo corner",
    "কেবিনে কাপল স্টে": "Couple stay in cabin",
    "লাউঞ্জের কাঠের ইন্টেরিয়র": "Wooden interior in lounge",
    "প্যানোরামা রুম ভিউ": "Panorama Room View"
}

for item in gallery:
    old_title = item.get('title', '')
    if old_title in translations:
        new_title = translations[old_title]
        # Update
        url = f"{SUPABASE_URL}/rest/v1/gallery?id=eq.{item['id']}"
        data = json.dumps({"title": new_title}).encode('utf-8')
        patch_req = urllib.request.Request(url, data=data, headers=headers, method='PATCH')
        try:
            with urllib.request.urlopen(patch_req) as resp:
                print(f"Updated '{old_title}' -> '{new_title}'")
        except Exception as e:
            print(f"Failed to update {old_title}: {e}")
    else:
        print(f"Skipped '{old_title}' (No translation found)")

print("Done")
