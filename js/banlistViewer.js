import { getTypePriority } from "./utils.js";
import { loadAllCards } from "./cardData.js";
import { createCardElement } from "./cardDisplay.js";

const banNames = { 0: "Forbidden", 1: "Limited", 2: "Semi-Limited" };

function sortCards(cards) {
    return cards.slice().sort((a, b) => {
        const priA = getTypePriority(a.type);
        const priB = getTypePriority(b.type);
        if (priA !== priB) return priA - priB;
        return (a.name ?? "").localeCompare(b.name ?? "");
    });
}


async function loadBanlist() {
    document.getElementById('banlistTitle').textContent = `Current Banlist`;
    const res = await fetch('banlist.json');
    const banlist = await res.json();
    const cardsByStatus = banlist;

    const grid = document.getElementById('cardGrid');
    grid.innerHTML = '';

    for (const status of ['0', '1', '2']) {
        const cards = cardsByStatus[status];
        if (!cards || cards.length === 0) continue;

        // Sort the cards before displaying
        const sortedCards = sortCards(cards);

        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = `${banNames[status]} (${sortedCards.length})`;
        sectionTitle.className = "font-bold text-lg pb-1";
        grid.appendChild(sectionTitle);

        const sectionGrid = document.createElement('div');
        sectionGrid.className = "grid grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-1";
        grid.appendChild(sectionGrid);

        for (const card of sortedCards) {
            const cardId = card.id;
            const cardEl = await createCardElement(cardId);
            sectionGrid.appendChild(cardEl);
        }
    }
}


async function main() {
    await loadAllCards();
    await loadBanlist();
}

main();