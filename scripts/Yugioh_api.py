import requests,json
set_api = "https://db.ygoprodeck.com/api/v7/cardsetsinfo.php?setcode="
card_api = "https://db.ygoprodeck.com/api/v7/cardinfo.php?tcgplayer_data"

class Copy:
    def __init__(self,code,card_id,rarity,price,copies):
        self.code=code
        self.card_id=card_id
        self.rarity=rarity
        self.price=price
        self.copies=copies
        self.id=code+"|"+rarity
        self.state=""
        self.monitor=1 if self.rarity not in ["Common","Rare","Super Rare"] else 0 #di default una carta è monitorata se è ultra rara o più
        self.parses_code()
    
    def parses_code(self):
        parsed=str.split(self.code,"-")
        self.set_code=parsed[0]
        self.set_number=parsed[1][2:]
        if(str.startswith(parsed[1],"EN")):
            self.lang="EN"
        else:
            self.lang=parsed[1][0:2]

    def as_tuple(self):
        return (self.id,
                self.card_id,
                self.code,
                self.set_code,
                self.lang,
                self.set_number,
                self.rarity,
                self.copies,
                self.price,
                self.state,
                self.monitor)


class Card:

    def parse_from_json(self,data):
        image=data["card_images"][0]["image_url"]
        self.id=data["id"]
        self.name=data["name"]
        self.type=data["type"]
        self.race=data["race"]
        self.image_url=image
        self.archetype=data["archetype"] if (data.get("archetype")!=None) else ""
        self.desc=data["desc"]
        self.set_list=json.dumps(data["card_sets"]) if (data.get("card_sets")!=None) else ""


        if "Monster" in self.type:
            self.attribute=data["attribute"]
            self.atk=data["atk"]
            if "Link" in self.type:
                self.level=data["linkval"]
                self.defense=-1
            else:
                self.level=data["level"]
                self.defense=data["def"]
        else:
            if "Spell" in self.type:
                self.attribute="SPELL"
            
            if "Trap" in self.type:
                self.attribute="TRAP"

            if "Skill Card" in self.type:
                self.attribute="SKILL"

            if "Token" in self.type:
                self.attribute="TOKEN"

            self.atk=-1
            self.defense=-1
            self.level=-1

    def as_tuple(self):
        return(
                self.id,
                self.name,
                self.type,
                self.race,
                self.desc,
                self.atk,
                self.defense,
                self.level,
                self.attribute,
                self.archetype,
                self.image_url,
                self.set_list
                )



def parse_code(code):  
    parsed=str.split(code,"-")
    out={"set_code":parsed[0],"set_number":parsed[1][2:]}
    if(str.startswith(parsed[1],"EN")):
        out["search_code"]=code
        out["lang"]="EN"
    else:
        out["search_code"]=parsed[0]+"-EN"+parsed[1][2:]
        out["lang"]=parsed[1][0:2]
    return out


def parse_card_from_json(data):
    image=data["card_images"][0]["image_url"]
    card = {
        "Id":data["id"],
        "Name":data["name"],
        "Type":data["type"],
        "Race":data["race"],
        "Image_Url":image,
        "Archetype":data["archetype"] if (data.get("archetype")!=None) else "",
        "Desc":data["desc"]
        }
    
    if "Monster" in card["Type"]:
        card["Attribute"]=data["attribute"]
        card["Atk"]=data["atk"]
        if "Link" in card["Type"]:
            card["Level"]=data["linkval"]
            card["Def"]=-1
        else:
            card["Level"]=data["level"]
            card["Def"]=data["def"]

    if "Spell" in card["Type"]:
        card["Attribute"]="SPELL"
        card["Atk"]=-1
        card["Def"]=-1
        card["Level"]=-1

    if "Trap" in card["Type"]:
        card["Attribute"]="TRAP"
        card["Atk"]=-1
        card["Def"]=-1
        card["Level"]=-1

    if "Skill Card" in card["Type"]:
        card["Attribute"]="SKILL"
        card["Atk"]=-1
        card["Def"]=-1
        card["Level"]=-1

    if "Token" in card["Type"]:
        card["Attribute"]="TOKEN"
        card["Atk"]=-1
        card["Def"]=-1
        card["Level"]=-1   

    return card

def get_copy_info_from_api(code,copies)->Copy:
    parsed_code=parse_code(code)
    x=requests.get(set_api+parsed_code["search_code"])
    if x.status_code==200:
        set=json.loads(x.text)
        copy=Copy(code,set["id"],set["set_rarity"],set["set_price"],copies)          
        return copy
    else:
        raise BaseException(code+" NOT FOUND!")
    
def get_card_list():
    x=requests.get(card_api)
    cards_list=[]
    if x.status_code==200:
        response=json.loads(x.text)
        cards = response["data"]
        for data in cards:
            card=Card()
            card.parse_from_json(data)
            cards_list.append(card.as_tuple())
    return cards_list

def get_card_info_from_api(code,copies)->tuple[Card,Copy]:
    parsed_code=parse_code(code)
    x=requests.get(set_api+parsed_code["search_code"])
    if x.status_code==200:
        set=json.loads(x.text)
        data_res=requests.get(url=card_api,params={"id":set["id"]})
        if data_res.status_code==200:
            data=json.loads(data_res.text)
            data=data["data"][0] #rimpiazzo con il primo elemento della lista che è l'unica entry
            price=data["card_prices"][0]

            card=Card()
            card.parse_from_json(data)

            copy=Copy(code,card.id,set["set_rarity"],set["set_price"] if float(set["set_price"])>0 else price["cardmarket_price"],copies)
            
            return card,copy
        else:
            raise BaseException(code+" NOT FOUND!")
