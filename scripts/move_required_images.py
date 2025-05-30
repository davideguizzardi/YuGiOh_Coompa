import os
import shutil
import json

DECKS_FOLDER = "../decks"
IMAGES_FOLDER = "../images"
DEST_FOLDER = "../usedimages"
BANLIST_FILE = "../banlist.json"  # Path to your banlist JSON file

def extract_card_ids_from_deck(file_path):
    card_ids = set()
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Filter out lines that are comments or empty
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("!"):
            continue
        # We expect lines here to be card IDs (numeric strings)
        if line.isdigit():
            card_ids.add(line)
    return card_ids

def extract_card_ids_from_banlist(banlist_path):
    card_ids = set()
    with open(banlist_path, 'r', encoding='utf-8') as f:
        banlist = json.load(f)

    # Loop through all formats and all categories (0, 1, 2)
    for category,cards in banlist.items():
        for card in cards:
            # Card id might be int or str, convert to str
            card_id = str(card.get("id") or card.get("card_id") or "")
            if card_id.isdigit():
                card_ids.add(card_id)
    return card_ids

def main():
    os.makedirs(DEST_FOLDER, exist_ok=True)

    all_card_ids = set()

    # Extract card IDs from decks
    for filename in os.listdir(DECKS_FOLDER):
        if filename.lower().endswith(".ydk"):
            deck_path = os.path.join(DECKS_FOLDER, filename)
            deck_card_ids = extract_card_ids_from_deck(deck_path)
            all_card_ids.update(deck_card_ids)

    # Extract card IDs from banlist.json
    banlist_card_ids = extract_card_ids_from_banlist(BANLIST_FILE)
    all_card_ids.update(banlist_card_ids)

    print(f"Total unique card IDs from decks + banlist: {len(all_card_ids)}")

    copied_count = 0
    skipped_count = 0

    for card_id in all_card_ids:
        image_filename = f"{card_id}.jpg"
        source_path = os.path.join(IMAGES_FOLDER, image_filename)
        dest_path = os.path.join(DEST_FOLDER, image_filename)

        if not os.path.isfile(source_path):
            print(f"Image not found for card ID {card_id}, skipping.")
            continue

        if os.path.isfile(dest_path):
            skipped_count += 1
        else:
            shutil.copy2(source_path, dest_path)
            copied_count += 1

    print(f"Copied {copied_count} images.")
    print(f"Skipped {skipped_count} images (already exist).")

if __name__ == "__main__":
    main()
