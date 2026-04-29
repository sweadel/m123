import urllib.request
import os

urls = {
    "cappuccino_real.jpg": "https://loremflickr.com/600/600/cappuccino",
    "mocha_real.jpg": "https://loremflickr.com/600/600/mocha",
    "spanish_latte_real.jpg": "https://loremflickr.com/600/600/latte",
    "herbal_tea_real.jpg": "https://loremflickr.com/600/600/tea,green"
}

for filename, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req).read()
        with open('images/drinks/' + filename, 'wb') as f:
            f.write(data)
        print("Downloaded", filename)
    except Exception as e:
        print("Failed", filename, e)
