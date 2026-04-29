import urllib.request
import time

urls = {
    "cappuccino_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Cappuccino_at_Sightglass_Coffee.jpg",
    "mocha_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Mocha_coffee.jpg",
    "white_mocha_real_2.jpg": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Latte_macchiato.jpg",
    "hot_chocolate_real_2.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/09/Hot_chocolate_mug.jpg",
    "spanish_latte_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/41/Espresso_macchiato_in_a_glass.jpg",
    "tea_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/45/Tea_in_a_glass_cup.jpg",
    "herbal_tea_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Hibiscus_tea.jpg"
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for filename, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        data = urllib.request.urlopen(req).read()
        if len(data) > 10000:
            with open('images/drinks/' + filename, 'wb') as f:
                f.write(data)
            print("Successfully downloaded", filename, "Size:", len(data))
        else:
            print("Data too small for", filename)
    except Exception as e:
        print("Failed to download", filename, e)
    time.sleep(2)
