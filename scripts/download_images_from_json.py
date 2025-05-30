import requests
import shutil
import os
import json
from time import sleep

IMAGES_PATH = "../images/"
REQUESTS_PER_SECOND = 7
JSON_FILE = "../all_cards.json"

def fetch_image(url, save_path):
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(save_path, 'wb') as f:
            r.raw.decode_content = True
            shutil.copyfileobj(r.raw, f)
    else:
        print(f"Failed to fetch {url} - Status code: {r.status_code}")

def main():
    os.makedirs(IMAGES_PATH, exist_ok=True)

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        cards = json.load(f)

    total = len(cards.keys())
    count = 0

    for card in cards.values():
        # Construct the small image URL using the id
        for card_id in card["card_images"]:
            image_url = f"https://images.ygoprodeck.com/images/cards_small/{card_id}.jpg"
            filename = f"{card_id}.jpg"
            save_path = os.path.join(IMAGES_PATH, filename)

            if os.path.isfile(save_path):
                print(f"Already downloaded {filename} ({count + 1}/{total})")
            else:
                try:
                    fetch_image(image_url, save_path)
                    print(f"Downloaded {filename} ({count + 1}/{total})")
                    sleep(1 / REQUESTS_PER_SECOND)
                except Exception as e:
                    print(f"Error downloading {filename}: {e}")

        count += 1

if __name__ == "__main__":
    main()
