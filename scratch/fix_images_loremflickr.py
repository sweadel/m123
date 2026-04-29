import urllib.request
import os

urls = {
    "cappuccino_real.jpg": "https://loremflickr.com/600/600/cappuccino,coffee/all",
    "mocha_real.jpg": "https://loremflickr.com/600/600/mocha,coffee/all",
    "white_mocha_real_2.jpg": "https://loremflickr.com/600/600/latte,macchiato/all",
    "hot_chocolate_real_2.jpg": "https://loremflickr.com/600/600/hotchocolate,mug/all",
    "spanish_latte_real.jpg": "https://loremflickr.com/600/600/cortado,coffee/all",
    "tea_real.jpg": "https://loremflickr.com/600/600/cup,tea,black/all",
    "herbal_tea_real.jpg": "https://loremflickr.com/600/600/herbal,tea/all",
    "g_bitter_lemon.jpg": "https://loremflickr.com/600/600/soda,lemon/all",
    "g_soda_water.jpg": "https://loremflickr.com/600/600/sparkling,water,glass/all",
    "sparkling_water_real.jpg": "https://loremflickr.com/600/600/sparkling,water/all"
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

try:
    from PIL import Image
    canvas = Image.new('RGB', (800, 800), color=(0, 0, 0))
    pepsi = Image.open('images/drinks/pepsi_can.jpg').convert("RGBA")
    pepsi.thumbnail((400, 800))
    canvas.paste(pepsi, (int(200 - pepsi.width/2), int(400 - pepsi.height/2)))
    
    matrix = Image.open('images/drinks/matrix_cola_bottle_1777405640074.png').convert("RGBA")
    matrix.thumbnail((400, 800))
    canvas.paste(matrix, (int(600 - matrix.width/2), int(400 - matrix.height/2)), matrix)
    
    canvas.save('images/drinks/soft_drinks_split.jpg')
    print("Created soft_drinks_split.jpg successfully.")
except Exception as e:
    print("Failed to combine images:", e)
