import urllib.request
import os

urls = {
    "tea_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Cup_of_black_tea.JPG",
    "herbal_tea_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/64/Peppermint_tea_2.jpg",
    "extra_flavor_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Camp_Coffee.jpg",
    "g_bitter_lemon.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Schweppes_Bitter_Lemon_%2801%29.jpg",
    "g_soda_water.jpg": "https://upload.wikimedia.org/wikipedia/commons/8/87/Glass_of_Carbonated_Water.jpg",
    "pepsi_can.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pepsi_Can.jpg",
    "sparkling_water_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/1/14/Mineralwasser_im_Glas.jpg",
    "red_bull_real.png": "https://upload.wikimedia.org/wikipedia/en/f/f6/Red_Bull_Energy_Drink.svg"
}

for filename, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open('images/drinks/' + filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print("Downloaded", filename, "Size:", len(data))
    except Exception as e:
        print("Failed", filename, e)

# Now use PIL to combine pepsi_can.jpg and matrix_cola_bottle.png
try:
    from PIL import Image
    # Create an 800x800 canvas
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
