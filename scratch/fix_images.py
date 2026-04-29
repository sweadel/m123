import urllib.request
import os
import json

urls = {
    "cappuccino_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Cappuccino_in_original.jpg/960px-Cappuccino_in_original.jpg",
    "mocha_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mocha_coffee.jpg/960px-Mocha_coffee.jpg",
    "white_mocha_real_2.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Latte_macchiato_with_coffee_beans.jpg/960px-Latte_macchiato_with_coffee_beans.jpg",
    "hot_chocolate_real_2.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Mug_of_Tea.JPG/960px-Mug_of_Tea.JPG", # Using this nice mug for now
    "spanish_latte_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Caf%C3%A9Cortado%28Tallat%29.jpg/960px-Caf%C3%A9Cortado%28Tallat%29.jpg",
    "tea_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Cup_of_black_tea.JPG/960px-Cup_of_black_tea.JPG",
    "herbal_tea_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Peppermint_tea_2.jpg/960px-Peppermint_tea_2.jpg",
    "extra_flavor_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Camp_Coffee.jpg/960px-Camp_Coffee.jpg",
    "g_bitter_lemon.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Schweppes_Bitter_Lemon_%2801%29.jpg/800px-Schweppes_Bitter_Lemon_%2801%29.jpg",
    "g_soda_water.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Glass_of_Carbonated_Water.jpg/800px-Glass_of_Carbonated_Water.jpg",
    "pepsi_can.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Pepsi_Can.jpg/800px-Pepsi_Can.jpg",
    "sparkling_water_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Mineralwasser_im_Glas.jpg/800px-Mineralwasser_im_Glas.jpg",
    "red_bull_real.png": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Red_Bull_Energy_Drink.svg/800px-Red_Bull_Energy_Drink.svg.png",
    "passion_fruit_smoothie_real.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Passion_fruits_-_whole_and_halved.jpg/960px-Passion_fruits_-_whole_and_halved.jpg"
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
    from PIL import Image, ImageDraw, ImageFont
    # Create an 800x800 canvas
    canvas = Image.new('RGB', (800, 800), color=(0, 0, 0))
    
    pepsi = Image.open('images/drinks/pepsi_can.jpg').convert("RGBA")
    # Resize keeping aspect ratio
    pepsi.thumbnail((400, 800))
    canvas.paste(pepsi, (int(200 - pepsi.width/2), int(400 - pepsi.height/2)))
    
    matrix = Image.open('images/drinks/matrix_cola_bottle_1777405640074.png').convert("RGBA")
    matrix.thumbnail((400, 800))
    canvas.paste(matrix, (int(600 - matrix.width/2), int(400 - matrix.height/2)), matrix)
    
    canvas.save('images/drinks/soft_drinks_split.jpg')
    print("Created soft_drinks_split.jpg successfully.")
except Exception as e:
    print("Failed to combine images:", e)
