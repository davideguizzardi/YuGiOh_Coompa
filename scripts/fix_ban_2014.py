import json


with open("ban_oct_2014.json", "r", encoding="utf-8") as f:
    banlist=json.load(f)
new_ban={}
for rank in banlist:
    for card in banlist[rank]:
        new_ban[card["nameeng"]]=rank

with open("ban_oct_2014_fix.json", "w", encoding="utf-8") as f:
    json.dump(new_ban, f, indent=2, ensure_ascii=False)
