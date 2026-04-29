import urllib.request
import os
import json
from duckduckgo_search import DDGS

queries = {
    "cappuccino_real.jpg": "beautiful cappuccino cafe cup photography high quality",
    "mocha_real.jpg": "beautiful cafe mocha coffee glass high quality photography",
    "white_mocha_real_2.jpg": "white chocolate mocha macchiato glass cafe beautiful photography",
    "hot_chocolate_real_2.jpg": "hot chocolate mug cafe photography beautiful",
    "spanish_latte_real.jpg": "spanish latte cortado cafe glass photography high quality",
    "tea_real.jpg": "black tea glass cup cafe beautiful photography",
    "herbal_tea_real.jpg": "herbal tea peppermint cup cafe beautiful photography"
}

ddgs = DDGS()

for filename, query in queries.items():
    try:
        results = ddgs.images(query, max_results=3, size="Large")
        if not results:
            print("No results for", query)
            continue
        
        # Try downloading the first one that works
        downloaded = False
        for res in results:
            url = res['image']
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                data = urllib.request.urlopen(req, timeout=5).read()
                if len(data) > 10000: # at least 10KB
                    with open('images/drinks/' + filename, 'wb') as f:
                        f.write(data)
                    print(f"Downloaded {filename} from {url[:50]}... Size: {len(data)}")
                    downloaded = True
                    break
            except Exception as e:
                pass
        
        if not downloaded:
            print(f"Failed completely for {filename}")

    except Exception as e:
        print("Failed search", filename, e)
