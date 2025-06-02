import { altIdToMainCard } from './cardData.js';
import { imageExists,getTypePriority } from './utils.js';

const CARD_CONTAINER_CLASS = "rounded cursor-pointer hover:scale-110 transition-transform flex items-center justify-center";
const CARD_IMAGE_CLASS = "rounded";
const NO_IMAGE_CLASS = "text-xs text-gray-500 text-center";
const BADGE_CLASS = "absolute bottom-0 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-base font-bold px-1 rounded-t-sm";
const SECTION_TITLE_CLASS = "font-bold text-lg";
const SECTION_GRID_CLASS = "grid grid-cols-5 items-center md:grid-cols-7 lg:grid-cols-10 gap-1";

const DETAILS_CONTAINER_CLASS = "flex flex-col items-center lg:items-start lg:flex-row gap-4";
const DETAILS_IMAGE_CLASS = "mb-4 rounded shadow w-full lg:w-[12vw]";
const DETAILS_TEXT_CONTAINER_CLASS = "flex flex-col gap-2 lg:w-1/2";
const DETAILS_TITLE_CLASS = "text-xl font-bold mb-2";
const DETAILS_P_CLASS = "mb-2";
const DETAILS_LINK_CLASS = "text-blue-600 hover:underline";

export async function createCardElement(cardId) {
  const cardIdNum = Number(cardId);
  const mainCard = altIdToMainCard[cardIdNum];
  console.log(cardId)
  const imgUrl = `./usedimages/${cardIdNum}.jpg`;

  const container = document.createElement('div');
  container.className = CARD_CONTAINER_CLASS;

  const exists = await imageExists(imgUrl);

  if (exists) {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = mainCard?.name ?? 'Unknown card';
    img.title = mainCard?.name ?? '';
    img.className = CARD_IMAGE_CLASS;
    container.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.textContent = 'No Image';
    span.className = NO_IMAGE_CLASS;
    container.appendChild(span);
  }

  if (mainCard) {
    container.addEventListener('click', () => showCardDetails(mainCard, cardIdNum));
  }

  return container;
}


export function showCardDetails(card, altId = null) {
  const details = document.getElementById('cardDetails');
  const imageId = altId ?? card.id;

  details.innerHTML = `
    <h2 class="${DETAILS_TITLE_CLASS}">${card.name}</h2>
    <div class="${DETAILS_CONTAINER_CLASS}">
      <div class="w-2/3 lg:w-1/2">
        <img src="./usedimages/${imageId}.jpg" alt="${card.name}" class="${DETAILS_IMAGE_CLASS}" />
      </div>
      <div class="${DETAILS_TEXT_CONTAINER_CLASS}">
        <p class="${DETAILS_P_CLASS}">[ ${card.type.toLowerCase().includes("monster") ? `${card.typeline.join(" / ")}` : `${card.humanReadableCardType}`} ]</p>
        <p class="${DETAILS_P_CLASS} whitespace-pre-wrap">${card.desc}</p>
        <p class="${DETAILS_P_CLASS}"><strong>Current ban:</strong> ${card.ban_tgc_current ?? 'N/A'}</p>
        <p class="${DETAILS_P_CLASS}"><strong>2014 ban:</strong> ${card.ban_tgc_2014 ?? 'N/A'}</p>
        <a href="${card.ygoprodeck_url}" target="_blank" class="${DETAILS_LINK_CLASS}">More info</a>
      </div>
    </div>
  `;
}


export async function displayCards(deckSections, showCardDetails) {
  const grid = document.getElementById('cardGrid');
  const details = document.getElementById('cardDetails');
  grid.innerHTML = '';
  details.innerHTML = '<p class="light:text-gray-500 italic">Select a card to see details.</p>';

  for (const [section, cardIds] of Object.entries(deckSections)) {
    if (cardIds.length === 0) continue;

    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = `${section.toUpperCase()} (${cardIds.length})`;
    sectionTitle.className = SECTION_TITLE_CLASS;
    grid.appendChild(sectionTitle);

    const sectionGrid = document.createElement('div');
    sectionGrid.className = SECTION_GRID_CLASS;
    grid.appendChild(sectionGrid);

    // Group cards by mainId and count
    const grouped = {};
    for (const id of cardIds) {
      const card = altIdToMainCard[Number(id)];
      if (!card) continue;
      const mainId = card.id;
      if (!grouped[mainId]) {
        grouped[mainId] = { card, count: 0, firstAltId: Number(id) };
      }
      grouped[mainId].count++;
    }

    // Sort cards by priority and name
    const sorted = Object.values(grouped).sort((a, b) => {
      const priA = getTypePriority(a.card.type) ?? 99;
      const priB = getTypePriority(b.card.type) ?? 99;
      if (priA !== priB) return priA - priB;
      return a.card.name.localeCompare(b.card.name);
    });

    for (const { card, count, firstAltId } of sorted) {
      const cardEl = await createCardElement(firstAltId, showCardDetails);

      if(count>1){

        // Badge for copies count
        const badge = document.createElement('div');
        badge.textContent = `x${count}`;
        badge.className = BADGE_CLASS;
        cardEl.classList.add("relative");
        cardEl.appendChild(badge);
      }

      sectionGrid.appendChild(cardEl);
    }
  }
}
