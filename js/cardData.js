
export let allCardsData = null;
export let altIdToMainCard = {};

export async function loadAllCards() {
  try {
    const response = await fetch('all_cards.json');
    if (!response.ok) throw new Error('Failed to load all_cards.json');
    allCardsData = await response.json();

    altIdToMainCard = {};
    for (const [mainId, card] of Object.entries(allCardsData)) {
      if (card.card_images && Array.isArray(card.card_images)) {
        card.card_images.forEach(altId => {
          altIdToMainCard[altId] = card;
        });
      } else {
        altIdToMainCard[mainId] = card;
      }
    }
  } catch (e) {
    alert("Error loading all_cards.json: " + e.message);
  }
}
