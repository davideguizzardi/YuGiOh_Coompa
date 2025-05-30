import os
import json
import time
import requests

DECKS_FOLDER = "../decks"
DEST_FOLDER = "../usedimages"
BANLIST_FILE = "../banlist.json"
BASE_IMAGE_URL = "https://images.ygoprodeck.com/images/cards_small"

REQUESTS_PER_SECOND = 5
SLEEP_INTERVAL = 1.0 / REQUESTS_PER_SECOND

def extract_card_ids_from_deck(file_path):
    card_ids = set()
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("!"):
            continue
        if line.isdigit():
            card_ids.add(line)
    return card_ids

def extract_card_ids_from_banlist(banlist_path):
    card_ids = set()
    with open(banlist_path, 'r', encoding='utf-8') as f:
        banlist = json.load(f)

    for category, cards in banlist.items():
        for card in cards:
            card_id = str(card.get("id") or card.get("card_id") or "")
            if card_id.isdigit():
                card_ids.add(card_id)
    return card_ids

def download_image(card_id, dest_path):
    url = f"{BASE_IMAGE_URL}/{card_id}.jpg"
    try:
        response = requests.get(url, stream=True, timeout=10)
        if response.status_code == 200:
            with open(dest_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
        else:
            print(f"Failed to download {url} (status {response.status_code})")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    os.makedirs(DEST_FOLDER, exist_ok=True)

    all_card_ids = set()

    # Extract card IDs from decks
    for filename in os.listdir(DECKS_FOLDER):
        if filename.lower().endswith(".ydk"):
            deck_path = os.path.join(DECKS_FOLDER, filename)
            all_card_ids.update(extract_card_ids_from_deck(deck_path))

    # Extract card IDs from banlist.json
    all_card_ids.update(extract_card_ids_from_banlist(BANLIST_FILE))

    print(f"Total unique card IDs from decks + banlist: {len(all_card_ids)}")

    downloaded = 0
    skipped = 0

    for card_id in all_card_ids:
        dest_path = os.path.join(DEST_FOLDER, f"{card_id}.jpg")
        if os.path.exists(dest_path):
            skipped += 1
            continue

        success = download_image(card_id, dest_path)
        if success:
            downloaded += 1

        time.sleep(SLEEP_INTERVAL)  # Respect API rate limit

    print(f"Downloaded {downloaded} images.")
    print(f"Skipped {skipped} images (already exist).")

if __name__ == "__main__":
    main()
