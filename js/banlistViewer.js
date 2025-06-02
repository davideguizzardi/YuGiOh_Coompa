import { getTypePriority } from "./utils.js";
import { loadAllCards } from "./cardData.js";
import { createCardTableWithImages } from "./cardDisplay.js";

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

  // Create search input
  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "Search cards...";
  search.className = "mb-2 p-2 w-full rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white";

  // Create handtrap checkbox
  const filterWrapper = document.createElement("div");
  filterWrapper.className = "flex items-center gap-2 mb-4";

  const handtrapCheckbox = document.createElement("input");
  handtrapCheckbox.type = "checkbox";
  handtrapCheckbox.id = "handtrapFilter";
  handtrapCheckbox.className = "rounded-md";

  const handtrapLabel = document.createElement("label");
  handtrapLabel.htmlFor = "handtrapFilter";
  handtrapLabel.textContent = "Show only handtraps";
  handtrapLabel.className = "text-base";

  filterWrapper.appendChild(handtrapCheckbox);
  filterWrapper.appendChild(handtrapLabel);

  grid.appendChild(search);
  grid.appendChild(filterWrapper);

  const renderFiltered = () => {
    const query = search.value.toLowerCase();
    const handtrapOnly = handtrapCheckbox.checked;

    grid.querySelectorAll(".banlist-section").forEach(el => el.remove());

    for (const status of ['0', '1', '2']) {
      const allCards = cardsByStatus[status];
      if (!allCards || allCards.length === 0) continue;

      
      const filtered = allCards.filter(card => {
        const nameMatch = card.name?.toLowerCase().includes(query);
        const handtrapMatch = !handtrapOnly || card.handtrap === true;
        return nameMatch && handtrapMatch;
      });

      if (filtered.length === 0) continue;

      const sortedCards = sortCards(filtered);

      const section = document.createElement('div');
      section.className = "banlist-section";

      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = `${banNames[status]} (${sortedCards.length})`;
      sectionTitle.className = "font-bold text-lg pb-1";
      section.appendChild(sectionTitle);

      const sectionGrid = document.createElement('div');
      createCardTableWithImages(sortedCards, status, sectionGrid);
      section.appendChild(sectionGrid);

      grid.appendChild(section);
    }
  };

  let timeout;
  search.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(renderFiltered, 200);
  });

  handtrapCheckbox.addEventListener("change", renderFiltered);

  renderFiltered(); 
}




async function main() {
    await loadAllCards();
    await loadBanlist();
}

main();