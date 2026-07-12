import json
import urllib.request

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

req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/gallery?select=*', headers=headers)
with urllib.request.urlopen(req) as response:
    gallery = json.loads(response.read().decode())

translations = {
    "কেবিনের জানালার পাশে আরামদায়ক মুহূর্ত": "Cozy moment by cabin window",
    "Floatbase এর কাঠের ইন্টেরিয়র": "Wooden interior of Floatbase",
    "প্রিমিয়াম কেবিন বেড": "Premium cabin bed",
    "রুফটপ ডেকে খাবারের আয়োজন": "Dining arrangement on rooftop deck",
    "হাওরের পানিতে Floatbase": "Floatbase in Haor waters",
    "রুফটপে সানসেট মুহূর্ত": "Sunset moment at rooftop",
    "বড় জানালা সহ কেবিন": "Cabin with large windows",
    "লোকাল খাবারের আয়োজন": "Local food arrangement",
    "রুফটপ ডাইনিং সেটআপ": "Rooftop dining setup",
    "নদীর পাশে লাঞ্চ প্লেট": "Lunch plate by the river",
    "Floatbase কেবিন বেড": "Floatbase cabin bed",
    "সাজানো প্রিমিয়াম কেবিন": "Decorated premium cabin",
    "কেবিনের বাইরের বসার জায়গা": "Sitting area outside cabin",
    "এসি কেবিন ইন্টেরিয়র": "AC cabin interior",
    "মেঘলা আকাশে Floatbase": "Floatbase under cloudy sky",
    "আরামদায়ক ডাবল বেড কেবিন": "Comfortable double bed cabin",
    "সবুজ পাতার ফাঁকে হাউসবোট": "Houseboat among green leaves",
    "কেবিনে নাস্তার আয়োজন": "Breakfast arrangement in cabin",
    "লাউঞ্জ স্পেস ও জানালার ভিউ": "Lounge space and window view",
    "কেবিনে অতিথির মুহূর্ত": "Guest moment in cabin",
    "Floatbase এর লাউঞ্জ এরিয়া": "Lounge area of Floatbase",
    "অতিথিদের আনন্দময় মুহূর্ত": "Joyful moments of guests",
    "লাউঞ্জে কাঠের ইন্টেরিয়র": "Wooden interior in lounge"
}

for item in gallery:
    old_title = item.get('title', '')
    if old_title in translations:
        new_title = translations[old_title]
        url = f"{SUPABASE_URL}/rest/v1/gallery?id=eq.{item['id']}"
        data = json.dumps({"title": new_title}).encode('utf-8')
        patch_req = urllib.request.Request(url, data=data, headers=headers, method='PATCH')
        try:
            with urllib.request.urlopen(patch_req) as resp:
                print(f"Updated '{old_title}' -> '{new_title}'")
        except Exception as e:
            print(f"Failed to update {old_title}: {e}")

print("Done")
