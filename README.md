
# Yugioh Deck and Banlist Viewer
This is a simple web page that I'm using to keep track of my and my friends' Yu-Gi-Oh decklist. Additionally there is our custom banlist.
It is not meant to be used outside our group but you are free to download the application and customize decks and banlist if you want.

## Folders structure
YuGiOh_Coompa/
├── decks/           # Folder for user-uploaded .ydk deck files
│   ├── list.json    # JSON file listing available decks
│   ├── *.ydk        # Individual deck files
├── js/              # JavaScript files for application logic
├── scripts/         # Additional python scripts to create cards files and move images
├── usedimages/      # Directory containing card images
├── all_cards.json   # JSON file with full card data
├── banlist.html     # HTML page displaying the banlist
├── banlist.json     # JSON file containing banlist data
├── deck.html        # HTML page for viewing individual decks
├── index.html       # Main landing page listing all decks
├── style.css        # CSS file for styling the application
└── README.md        # Documentation and setup instructions

## Adding a deck
Decks are saved in the `decks` folder. The format used to save and read decks is `.ydk`, which is standard for sites like [YGOPROdeck](https://ygoprodeck.com).
In order to enumerate and load decks it is also necessary to add an entry in the `list.json` file. The structure of the file is the following:
```
{
  "filename":"file.ydk", #name of the deck file
  "previewImage":44146295 #konami id of the card will be used as a preview in the application
}
```

## Python scripts for the creation of the card library 
In the `scripts` folder there are some python files that are resposible for the creation of the `all_cards.json`, `banlist.json` files and the `usedimages` folder.
All the cards information and images are pulled form the [YUGIOHapi](https://ygoprodeck.com/api-guide/) please consult the guideline before using the application (in particular when downloading images).
