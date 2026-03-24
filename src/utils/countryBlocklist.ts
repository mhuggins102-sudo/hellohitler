/**
 * Country-related terms blocklist for Hard Mode.
 * Contains country names, demonyms, and related adjectives in lowercase.
 */
export const BLOCKED_COUNTRY_TERMS: Set<string> = new Set([
  // ── Africa ──────────────────────────────────────────────────────────
  "algeria", "algerian",
  "angola", "angolan",
  "benin", "beninese",
  "botswana", "botswanan", "motswana", "batswana",
  "burkina faso", "burkinabe",
  "burundi", "burundian",
  "cameroon", "cameroonian",
  "cape verde", "cape verdean",
  "central african republic", "central african",
  "chad", "chadian",
  "comoros", "comorian",
  "congo", "congolese",
  "democratic republic of the congo",
  "republic of the congo",
  "cote d'ivoire", "ivory coast", "ivorian",
  "djibouti", "djiboutian",
  "egypt", "egyptian",
  "equatorial guinea", "equatoguinean",
  "eritrea", "eritrean",
  "eswatini", "swaziland", "swazi",
  "ethiopia", "ethiopian",
  "gabon", "gabonese",
  "gambia", "gambian",
  "ghana", "ghanaian",
  "guinea", "guinean",
  "guinea-bissau", "bissau-guinean",
  "kenya", "kenyan",
  "lesotho", "mosotho", "basotho",
  "liberia", "liberian",
  "libya", "libyan",
  "madagascar", "malagasy",
  "malawi", "malawian",
  "mali", "malian",
  "mauritania", "mauritanian",
  "mauritius", "mauritian",
  "morocco", "moroccan",
  "mozambique", "mozambican",
  "namibia", "namibian",
  "niger", "nigerien",
  "nigeria", "nigerian",
  "rwanda", "rwandan", "rwandese",
  "sao tome and principe", "santomean",
  "senegal", "senegalese",
  "seychelles", "seychellois",
  "sierra leone", "sierra leonean",
  "somalia", "somali", "somalian",
  "south africa", "south african",
  "south sudan", "south sudanese",
  "sudan", "sudanese",
  "tanzania", "tanzanian",
  "togo", "togolese",
  "tunisia", "tunisian",
  "uganda", "ugandan",
  "zambia", "zambian",
  "zimbabwe", "zimbabwean",

  // ── Asia ─────────────────────────────────────────────────────────────
  "afghanistan", "afghan",
  "armenia", "armenian",
  "azerbaijan", "azerbaijani", "azeri",
  "bahrain", "bahraini",
  "bangladesh", "bangladeshi",
  "bhutan", "bhutanese",
  "brunei", "bruneian",
  "cambodia", "cambodian", "khmer",
  "china", "chinese",
  "cyprus", "cypriot",
  "east timor", "timor-leste", "timorese",
  "georgia", "georgian",
  "india", "indian",
  "indonesia", "indonesian",
  "iran", "iranian", "persian", "persia",
  "iraq", "iraqi",
  "israel", "israeli",
  "japan", "japanese",
  "jordan", "jordanian",
  "kazakhstan", "kazakh", "kazakhstani",
  "kuwait", "kuwaiti",
  "kyrgyzstan", "kyrgyz", "kyrgyzstani",
  "laos", "laotian", "lao",
  "lebanon", "lebanese",
  "malaysia", "malaysian", "malay",
  "maldives", "maldivian",
  "mongolia", "mongolian",
  "myanmar", "burmese", "burma",
  "nepal", "nepalese", "nepali",
  "north korea", "north korean",
  "oman", "omani",
  "pakistan", "pakistani",
  "palestine", "palestinian",
  "philippines", "filipino", "filipina", "philippine",
  "qatar", "qatari",
  "saudi arabia", "saudi", "arabian",
  "singapore", "singaporean",
  "south korea", "south korean", "korean", "korea",
  "sri lanka", "sri lankan",
  "syria", "syrian",
  "taiwan", "taiwanese",
  "tajikistan", "tajik", "tajikistani",
  "thailand", "thai",
  "turkey", "turkish",
  "turkmenistan", "turkmen",
  "united arab emirates", "emirati", "emirian",
  "uzbekistan", "uzbek", "uzbekistani",
  "vietnam", "vietnamese",
  "yemen", "yemeni",

  // ── Europe ───────────────────────────────────────────────────────────
  "albania", "albanian",
  "andorra", "andorran",
  "austria", "austrian",
  "belarus", "belarusian", "byelorussian",
  "belgium", "belgian",
  "bosnia", "bosnia and herzegovina", "bosnian", "herzegovinian",
  "bulgaria", "bulgarian",
  "croatia", "croatian",
  "czech republic", "czechia", "czech",
  "denmark", "danish", "dane",
  "estonia", "estonian",
  "finland", "finnish", "finn",
  "france", "french", "francophone",
  "germany", "german", "germanic",
  "greece", "greek", "hellenic",
  "hungary", "hungarian", "magyar",
  "iceland", "icelandic", "icelander",
  "ireland", "irish",
  "italy", "italian",
  "kosovo", "kosovar", "kosovan",
  "latvia", "latvian",
  "liechtenstein", "liechtensteiner",
  "lithuania", "lithuanian",
  "luxembourg", "luxembourgish", "luxembourger",
  "malta", "maltese",
  "moldova", "moldovan",
  "monaco", "monegasque", "monacan",
  "montenegro", "montenegrin",
  "netherlands", "dutch", "holland",
  "north macedonia", "macedonian", "macedonia",
  "norway", "norwegian",
  "poland", "polish", "pole",
  "portugal", "portuguese",
  "romania", "romanian",
  "russia", "russian",
  "san marino", "sammarinese",
  "serbia", "serbian",
  "slovakia", "slovak", "slovakian",
  "slovenia", "slovenian", "slovene",
  "spain", "spanish", "spaniard",
  "sweden", "swedish", "swede",
  "switzerland", "swiss",
  "ukraine", "ukrainian",
  "united kingdom", "british", "briton",
  "england", "english",
  "scotland", "scottish",
  "wales", "welsh",
  "vatican", "vatican city",

  // ── North America ────────────────────────────────────────────────────
  "antigua and barbuda", "antiguan", "barbudan",
  "bahamas", "bahamian",
  "barbados", "barbadian", "bajan",
  "belize", "belizean",
  "canada", "canadian",
  "costa rica", "costa rican",
  "cuba", "cuban",
  "dominica", "dominican",
  "dominican republic",
  "el salvador", "salvadoran", "salvadorean",
  "grenada", "grenadian",
  "guatemala", "guatemalan",
  "haiti", "haitian",
  "honduras", "honduran",
  "jamaica", "jamaican",
  "mexico", "mexican",
  "nicaragua", "nicaraguan",
  "panama", "panamanian",
  "puerto rico", "puerto rican",
  "saint kitts and nevis", "kittitian", "nevisian",
  "saint lucia", "saint lucian",
  "saint vincent and the grenadines", "vincentian",
  "trinidad and tobago", "trinidadian", "tobagonian",
  "united states", "united states of america", "american", "usa",

  // ── South America ────────────────────────────────────────────────────
  "argentina", "argentine", "argentinian", "argentinean",
  "bolivia", "bolivian",
  "brazil", "brazilian",
  "chile", "chilean",
  "colombia", "colombian",
  "ecuador", "ecuadorian", "ecuadorean",
  "guyana", "guyanese",
  "paraguay", "paraguayan",
  "peru", "peruvian",
  "suriname", "surinamese",
  "uruguay", "uruguayan",
  "venezuela", "venezuelan",

  // ── Oceania ──────────────────────────────────────────────────────────
  "australia", "australian", "aussie",
  "fiji", "fijian",
  "kiribati", "i-kiribati",
  "marshall islands", "marshallese",
  "micronesia", "micronesian",
  "nauru", "nauruan",
  "new zealand", "new zealander", "kiwi",
  "palau", "palauan",
  "papua new guinea", "papua new guinean",
  "samoa", "samoan",
  "solomon islands", "solomon islander",
  "tonga", "tongan",
  "tuvalu", "tuvaluan",
  "vanuatu", "ni-vanuatu", "vanuatuan",
]);

// Pre-compute multi-word terms for efficient matching
const multiWordTerms: string[] = [];
const singleWordTerms: Set<string> = new Set();

for (const term of BLOCKED_COUNTRY_TERMS) {
  if (term.includes(" ") || term.includes("-") || term.includes("'")) {
    multiWordTerms.push(term);
  } else {
    singleWordTerms.add(term);
  }
}

// Sort multi-word terms by length descending so longer matches are checked first
multiWordTerms.sort((a, b) => b.length - a.length);

/**
 * Checks if a Wikipedia article title contains any country-related blocked term.
 * Uses case-insensitive word-boundary matching so that e.g. "Germany" matches
 * "Germany" and "West Germany" but NOT "germander".
 */
export function isCountryRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();

  // Check multi-word terms using word-boundary regex
  for (const term of multiWordTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i");
    if (regex.test(lowerTitle)) {
      return true;
    }
  }

  // Check single-word terms by splitting the title into words and looking them up
  // We split on non-alphanumeric characters to get individual words
  const words = lowerTitle.split(/[^a-z0-9]+/).filter(Boolean);
  for (const word of words) {
    if (singleWordTerms.has(word)) {
      return true;
    }
  }

  return false;
}
