import requests
import json

with open("./ban_oct_2014.json", "r", encoding="utf-8") as f:
    banlist_2014=json.load(f)

with open("./handtrap.json", "r", encoding="utf-8") as f:
    handtraps=json.load(f)

url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?tcgplayer_data"
print(f"Fetching card data from {url}...")

try:
    response = requests.get(url)
    response.raise_for_status()
except requests.RequestException as e:
    print(f"Failed to fetch data: {e}")
    exit(1)

data = response.json()
cards = data.get("data", [])
print(f"Retrieved {len(cards)} cards.")

cards_by_id = {}
banlist_current={0:[],1:[],2:[]}

for card in cards:
    card_id = str(card["id"])
    images_list=[]
    card.pop("card_prices", None)
    card.pop("card_sets", None)
    for image in card["card_images"]:
        images_list.append(image["id"])
    card["card_images"]=images_list
    card["ban_tgc_current"]=3
    card["ban_tgc_2014"]=banlist_2014.get(card["name"],3)
    card["handtrap"]=len([x for x in handtraps if x.get("konamiID","")==card_id])>0

    if "banlist_info" in card:
        ban_tcg = card["banlist_info"].get("ban_tcg","")
        card["ban_tgc_current"]=0 if ban_tcg=="Forbidden" else 1 if ban_tcg=="Limited" else 2 if ban_tcg=="Semi-Limited" else 3
        card.pop("banlist_info", None)

    card_banlist=0 if card["handtrap"] else min(int(card["ban_tgc_2014"]),int(card["ban_tgc_current"]))

    card["our_banlist"]=card_banlist

    if card_banlist<3:
        banlist_current[card_banlist].append(card)

    cards_by_id[card_id] = card

print(f"Processed {len(cards_by_id)} cards. Saving to 'processed_cards.json'...")

with open("../all_cards.json", "w", encoding="utf-8") as f:
    json.dump(cards_by_id, f, indent=2, ensure_ascii=False)

with open("../banlist.json", "w", encoding="utf-8") as f:
    json.dump(banlist_current, f, indent=2, ensure_ascii=False)


print("Data saved successfully.")
