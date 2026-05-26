import urllib.request
import json
import os

env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k] = v

url = f"{env['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1/gallery?select=*"
req = urllib.request.Request(url)
req.add_header('apikey', env['NEXT_PUBLIC_SUPABASE_ANON_KEY'])
req.add_header('Authorization', f"Bearer {env['NEXT_PUBLIC_SUPABASE_ANON_KEY']}")

with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
    print("Total items:", len(data))
    for d in data[-5:]:
        print(d['id'], d['title'], d['image_url'])
