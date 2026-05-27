import urllib.request
import urllib.parse
import json
import os

topics = {
    "river-view-v3.jpg": "Padma River",
    "padma-bridge-v3.jpg": "Padma Bridge",
    "rooftop-v3.jpg": "River char Bangladesh",
    "sunset-v3.jpg": "Mustard field Bangladesh",
    "event-deck-v3.jpg": "Playing guitar",
    "dining-v3.jpg": "Barbecue Chicken"
}

def get_commons_image(query):
    # Search for files
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=File:{urllib.parse.quote(query)}&utf8=&format=json&srnamespace=6"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        if not data['query']['search']:
            return None
        title = data['query']['search'][0]['title']
        
        # Get image info
        img_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
        req2 = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        resp2 = urllib.request.urlopen(req2)
        data2 = json.loads(resp2.read().decode('utf-8'))
        pages = data2['query']['pages']
        for page_id in pages:
            if 'imageinfo' in pages[page_id]:
                return pages[page_id]['imageinfo'][0]['url']
    except Exception as e:
        print(f"Error fetching {query}: {e}")
        return None
    return None

for filename, query in topics.items():
    print(f"Fetching {filename} for query: {query}")
    img_url = get_commons_image(query)
    # If specific queries fail, fallback to a more generic one
    if not img_url and "Bangladesh" in query:
        img_url = get_commons_image(query.replace(" Bangladesh", ""))
        
    if img_url:
        print(f"Downloading from {img_url}")
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(f"public/images/padma/{filename}", 'wb') as out_file:
            data = response.read()
            out_file.write(data)
    else:
        print(f"Failed to find image for {query}")
