// India map TopoJSON URLs from the udit-001/india-maps-data repository
const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453";

export const INDIA_TOPO_URL = `${CDN_BASE}/topojson/india.json`;

// State name (matching the map's st_nm property) -> topojson file slug
const STATE_SLUG_MAP: Record<string, string> = {
  "Andhra Pradesh": "andhra-pradesh",
  "Arunachal Pradesh": "arunachal-pradesh",
  Assam: "assam",
  Bihar: "bihar",
  Chhattisgarh: "chhattisgarh",
  Goa: "goa",
  Gujarat: "gujarat",
  Haryana: "haryana",
  "Himachal Pradesh": "himachal-pradesh",
  Jharkhand: "jharkhand",
  Karnataka: "karnataka",
  Kerala: "kerala",
  "Madhya Pradesh": "madhya-pradesh",
  Maharashtra: "maharashtra",
  Manipur: "manipur",
  Meghalaya: "meghalaya",
  Mizoram: "mizoram",
  Nagaland: "nagaland",
  Odisha: "odisha",
  Punjab: "punjab",
  Rajasthan: "rajasthan",
  Sikkim: "sikkim",
  "Tamil Nadu": "tamilnadu",
  Telangana: "telangana",
  Tripura: "tripura",
  Uttarakhand: "uttarakhand",
  "Uttar Pradesh": "uttar-pradesh",
  "West Bengal": "west-bengal",
  "Andaman and Nicobar Islands": "andaman-and-nicobar-islands",
  Chandigarh: "chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu": "dnh-and-dd",
  Delhi: "delhi",
  "Jammu and Kashmir": "jammu-and-kashmir",
  Ladakh: "ladakh",
  Lakshadweep: "lakshadweep",
  Puducherry: "puducherry",
};

export function stateTopoUrl(stateName: string): string | null {
  const slug = STATE_SLUG_MAP[stateName];
  if (!slug) return null;
  return `${CDN_BASE}/topojson/states/${slug}.json`;
}
