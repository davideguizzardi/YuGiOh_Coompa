export function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export async function imageExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}



const TYPE_PRIORITY = {
  "Normal Monster": 1,
  "Effect Monster": 2,
  "Ritual Monster": 3,
  "Fusion Monster": 4,
  "Synchro Monster": 5,
  "XYZ Monster": 6,
  "Link Monster": 7,
  "Spell Card": 8,
  "Trap Card": 9
};


export function getTypePriority(type) {
  if (!type) return 99;
  const typeStr = type.toLowerCase();

  if (typeStr.includes("normal")) return TYPE_PRIORITY["Normal Monster"];
  if (typeStr.includes("ritual")) return TYPE_PRIORITY["Ritual Monster"];
  if (typeStr.includes("fusion")) return TYPE_PRIORITY["Fusion Monster"];
  if (typeStr.includes("synchro")) return TYPE_PRIORITY["Synchro Monster"];
  if (typeStr.includes("xyz")) return TYPE_PRIORITY["XYZ Monster"];
  if (typeStr.includes("link")) return TYPE_PRIORITY["Link Monster"];
  if (typeStr.includes("spell")) return TYPE_PRIORITY["Spell Card"];
  if (typeStr.includes("trap")) return TYPE_PRIORITY["Trap Card"];
  if (typeStr.includes("effect monster")) return TYPE_PRIORITY["Effect Monster"]; //must be here to avoid parsing ritual effect, fusion effect... prematurely
  if (typeStr.includes("tuner")) return TYPE_PRIORITY["Effect Monster"];

  return 99;
}
