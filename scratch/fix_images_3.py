import urllib.request
import os
import time

urls = {
    "extra_flavor_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Camp_Coffee.jpg",
    "g_bitter_lemon.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Schweppes_Bitter_Lemon_%2801%29.jpg",
    "g_soda_water.jpg": "https://upload.wikimedia.org/wikipedia/commons/8/87/Glass_of_Carbonated_Water.jpg",
    "pepsi_can.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pepsi_Can.jpg",
    "sparkling_water_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/14/Mineralwasser_im_Glas.jpg"
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TalloAhbabna/1.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}

for filename, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            if len(data) > 1000:
                with open('images/drinks/' + filename, 'wb') as out_file:
                    out_file.write(data)
                print("Downloaded", filename, "Size:", len(data))
            else:
                print("Failed", filename, "Data too small:", len(data))
    except Exception as e:
        print("Failed", filename, e)
    time.sleep(3)

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
