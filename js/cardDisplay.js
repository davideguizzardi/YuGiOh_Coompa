import { altIdToMainCard } from './cardData.js';
import { imageExists, getTypePriority } from './utils.js';

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
        <p class=""><strong>Banlists</strong></p>
        <table class="w-full text-sm border-collapse mb-2 rounded table-fixed">
          <thead>
            <tr>
              <th class="border px-2 py-1 text-left">Our</th>
              <th class="border px-2 py-1 text-left">Current</th>
              <th class="border px-2 py-1 text-left">2014 </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border px-2 py-1">${card.our_banlist ?? 'N/A'}</td>
              <td class="border px-2 py-1">${card.ban_tgc_current ?? 'N/A'}</td>
              <td class="border px-2 py-1">${card.ban_tgc_2014 ?? 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        <p class="${DETAILS_P_CLASS}"><strong>Handtrap:</strong> ${card.handtrap ? "Yes" : "No"}</p>
        <a href="${card.ygoprodeck_url}" target="_blank" class="${DETAILS_LINK_CLASS}">More info</a>
      </div>
    </div>
  `;

  details.scrollIntoView({ behavior: "smooth", block: "start" });
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

      if (count > 1) {

        // Badge for copies count
        const badge = document.createElement('div');
        badge.textContent = `x${count}`;
        badge.className = BADGE_CLASS;
        cardEl.classList.add("relative");
        cardEl.appendChild(badge);
      }

      if (card.our_banlist < 3) {

        // Badge for banlist
        const badge = document.createElement('div');
        if(card.our_banlist!=0){

          badge.textContent = `${card.our_banlist}`;
          badge.className = "absolute top-0 right-0 bg-yellow-600 text-white text-xl font-bold px-2 rounded-full";
        }
        else{
          badge.innerHTML=`<i class="fa-solid fa-ban"></i>`
          badge.className = "absolute top-0 right-0 bg-black text-red-800 text-2xl font-black px-1 rounded-full";
        }
        cardEl.classList.add("relative");
        cardEl.appendChild(badge);
      }

      sectionGrid.appendChild(cardEl);
    }
  }
}

export async function createCardTableWithImages(cards, status, parentElement) {
  const table = document.createElement('table');
  table.className = "min-w-full table-auto border border-collapse border-gray-300 dark:border-gray-600";

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr class="bg-gray-200 dark:bg-gray-800">
      <th class="p-2 border dark:border-gray-600">Name</th>
      <th class="p-2 border dark:border-gray-600">Type</th>
      <th class="p-2 border dark:border-gray-600">Status</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  for (const card of cards) {
    const cardId = card.id ?? card.card_images?.[0];
    if (!cardId) continue;

    //const imgCell = document.createElement('td');
    //imgCell.className = "p-2 border dark:border-gray-600 w-16";

    //const imageContainer = await createCardElement(cardId); // your async thumbnail function
    //imageContainer.classList.add("w-12", "h-16", "overflow-hidden", "rounded");
    //imgCell.appendChild(imageContainer);

    const row = document.createElement('tr');
    row.className = getRowColor(card.humanReadableCardType) + " hover:brightness-110 cursor-pointer transition";
    //row.appendChild(imgCell);

    row.innerHTML += `
      <td class="p-2 border dark:border-gray-600">${card.name ?? 'Unknown'}</td>
      <td class="p-2 border dark:border-gray-600">${card.type ?? 'Unknown'}</td>
      <td class="p-2 border dark:border-gray-600">${status}</td>
    `;

    row.addEventListener('click', () => {
      const mainCard = altIdToMainCard[Number(cardId)];
      if (mainCard) showCardDetails(mainCard, cardId);
    });

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  parentElement.appendChild(table);
}


function getRowColor(type = '') {
  const lower = type.toLowerCase();
  if (lower.includes('spell')) return "bg-green-100 dark:bg-green-900";
  if (lower.includes('trap')) return "bg-pink-100 dark:bg-pink-900";
  if (lower.includes('fusion')) return "bg-purple-100 dark:bg-purple-900";
  if (lower.includes('synchro')) return "bg-gray-100 dark:bg-white-900 dark:text-gray-800";
  if (lower.includes('xyz')) return "bg-gray-100 dark:bg-gray-900";
  if (lower.includes('link')) return "bg-cyan-100 dark:bg-blue-900";
  if (lower.includes('ritual')) return "bg-indigo-100 dark:bg-indigo-900";
  if (lower.includes('normal')) return "bg-indigo-100 dark:bg-yellow-700";
  if (lower.includes('effect')) return "bg-yellow-100 dark:bg-yellow-900";
  return "bg-white dark:bg-gray-700";
}

