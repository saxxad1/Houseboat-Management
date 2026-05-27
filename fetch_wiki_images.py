import urllib.request
import re
import json

topics = {
    "river-view-v4.jpg": "Padma_River",
    "padma-bridge-v4.jpg": "Padma_Bridge",
    "rooftop-v4.jpg": "Char_(landform)",
    "sunset-v4.jpg": "Agriculture_in_Bangladesh",
    "event-deck-v4.jpg": "Carrom",
    "dining-v4.jpg": "Barbecue"
}

for filename, page in topics.items():
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&titles={page}&prop=pageimages&format=json&pithumbsize=800"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            page_id = list(pages.keys())[0]
            if 'thumbnail' in pages[page_id]:
                img_url = pages[page_id]['thumbnail']['source']
                print(f"Downloading {img_url} to {filename}")
                urllib.request.urlretrieve(img_url, f"public/images/padma/{filename}")
            else:
                print(f"No image found for {page}")
    except Exception as e:
        print(f"Error {page}: {e}")
