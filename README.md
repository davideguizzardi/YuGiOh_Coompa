
# Yugioh Deck Viewer

## Setup

- Place your `.ydk` deck files inside the `decks/` folder.
- Replace the `all_cards.json` with your full card data JSON file.
- Open `index.html` in a browser to see a list of decks.
- Click a deck name to open the deck viewer page.
- The deck viewer page displays card images and details on click.

## Notes

- This is a static site and requires all files to be served from a local or remote HTTP server.
- Opening `index.html` directly from the file system may cause fetch errors due to browser restrictions.
- Use a simple local server like `python3 -m http.server` for testing locally.
