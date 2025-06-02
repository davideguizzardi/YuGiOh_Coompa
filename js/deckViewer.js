import { loadAllCards } from './cardData.js';
import { displayCards,showCardDetails } from './cardDisplay.js';


// --- CSS classes ---
const DETAILS_CONTAINER_CLASS = "flex flex-col items-center lg:items-start lg:flex-row gap-4";
const DETAILS_IMAGE_CLASS = "mb-4 rounded shadow w-full lg:w-[12vw]";
const DETAILS_TEXT_CONTAINER_CLASS = "flex flex-col gap-2 lg:w-1/2";
const DETAILS_TITLE_CLASS = "text-xl font-bold mb-2";
const DETAILS_P_CLASS = "mb-2";
const DETAILS_LINK_CLASS = "text-blue-600 hover:underline";

export let deckSections = { main: [], extra: [], side: [] };

export function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function parseYDKSections(ydkText) {
  deckSections = { main: [], extra: [], side: [] };
  let currentSection = 'main';

  ydkText.split('\n').forEach(line => {
    line = line.trim();
    if (line === '' || line.startsWith('#created') || line.startsWith('#') || line.toLowerCase() === '!side') {
      if (line.toLowerCase() === '#main') currentSection = 'main';
      else if (line.toLowerCase() === '#extra') currentSection = 'extra';
      else if (line.toLowerCase() === '!side') currentSection = 'side';
      return;
    }
    deckSections[currentSection].push(line);
  });
}

export async function loadDeck(deckFile) {
  try {
    const response = await fetch('decks/' + deckFile);
    if (!response.ok) throw new Error('Failed to load deck file');
    const text = await response.text();
    parseYDKSections(text);
    await displayCards(deckSections, showCardDetails);
  } catch (e) {
    alert("Error loading deck file: " + e.message);
  }
}

export function showCardDetails1(card, altId = null) {
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

export async function main() {
  const deckFile = getQueryParam('deck');
  if (!deckFile) {
    alert('No deck specified in URL.');
    return;
  }

  document.getElementById('deckTitle').textContent = deckFile;

  document.getElementById("saveDeckBtn").addEventListener("click", () => {
    if (!deckFile) {
      alert("No deck specified.");
      return;
    }

    const a = document.createElement("a");
    a.href = `decks/${deckFile}`;
    a.download = deckFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  await loadAllCards();
  await loadDeck(deckFile);
}

main();
