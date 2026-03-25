/**
 * Geographic terms blocklist for Hard Mode.
 * Contains country names, demonyms, continents, major cities, US states,
 * and related geographic adjectives in lowercase.
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

  // ── Continents & Regions ────────────────────────────────────────────
  "africa", "african",
  "asia", "asian", "asiatic",
  "europe", "european", "europeans",
  "north america", "north american",
  "south america", "south american",
  "central america", "central american",
  "latin america", "latin american",
  "oceania", "oceanian",
  "antarctica", "antarctic",
  "arctic",
  "caribbean", "west indies", "west indian",
  "middle east", "middle eastern",
  "southeast asia", "southeast asian",
  "east asia", "east asian",
  "south asia", "south asian",
  "scandinavia", "scandinavian",
  "balkans", "balkan",
  "iberia", "iberian",
  "caucasus", "caucasian",
  "mesopotamia", "mesopotamian",
  "polynesia", "polynesian",
  "melanesia", "melanesian",
  "sub-saharan",
  "subsaharan",

  // ── US States & Territories ─────────────────────────────────────────
  "alabama", "alabamian", "alabaman",
  "alaska", "alaskan",
  "arizona", "arizonan", "arizonian",
  "arkansas", "arkansan",
  "california", "californian",
  "colorado", "coloradan", "coloradoan",
  "connecticut", "connecticuter",
  "delaware", "delawarean",
  "florida", "floridian", "floridan",
  "hawaii", "hawaiian",
  "idaho", "idahoan",
  "illinois", "illinoisan",
  "indiana", "indianan", "hoosier",
  "iowa", "iowan",
  "kansas", "kansan",
  "kentucky", "kentuckian",
  "louisiana", "louisianan", "louisianian",
  "maine", "mainer",
  "maryland", "marylander",
  "massachusetts",
  "michigan", "michigander", "michiganian",
  "minnesota", "minnesotan",
  "mississippi", "mississippian",
  "missouri", "missourian",
  "montana", "montanan",
  "nebraska", "nebraskan",
  "nevada", "nevadan", "nevadian",
  "new hampshire",
  "new jersey", "jerseyan",
  "new mexico", "new mexican",
  "new york", "new yorker",
  "north carolina", "north carolinian",
  "north dakota", "north dakotan",
  "ohio", "ohioan",
  "oklahoma", "oklahoman",
  "oregon", "oregonian",
  "pennsylvania", "pennsylvanian",
  "rhode island", "rhode islander",
  "south carolina", "south carolinian",
  "south dakota", "south dakotan",
  "tennessee", "tennessean",
  "texas", "texan",
  "utah", "utahn", "utahan",
  "vermont", "vermonter",
  "virginia", "virginian",
  "washington", "washingtonian",
  "west virginia", "west virginian",
  "wisconsin", "wisconsinite",
  "wyoming", "wyomingite",
  "guam", "guamanian",
  "us virgin islands",

  // ── Canadian Provinces ──────────────────────────────────────────────
  "ontario", "ontarian",
  "quebec", "quebecer", "quebecois",
  "british columbia", "british columbian",
  "alberta", "albertan",
  "manitoba", "manitoban",
  "saskatchewan",
  "nova scotia", "nova scotian",
  "new brunswick",
  "newfoundland", "newfoundlander",
  "labrador",

  // ── Major World Cities ──────────────────────────────────────────────
  "new york city", "nyc",
  "los angeles",
  "chicago", "chicagoan",
  "houston", "houstonian",
  "phoenix",
  "philadelphia", "philadelphian",
  "san antonio",
  "san diego",
  "dallas",
  "san francisco", "san franciscan",
  "austin",
  "seattle", "seattleite",
  "denver",
  "boston", "bostonian",
  "nashville", "nashvillian",
  "detroit", "detroiter",
  "portland", "portlander",
  "las vegas",
  "atlanta", "atlantan",
  "miami", "miamian",
  "minneapolis",
  "new orleans",
  "cleveland",
  "pittsburgh", "pittsburgher",
  "st. louis",
  "saint louis",
  "cincinnati",
  "milwaukee",
  "baltimore", "baltimorean",
  "london", "londoner",
  "paris", "parisian",
  "berlin", "berliner",
  "madrid",
  "rome", "roman",
  "moscow", "muscovite",
  "tokyo",
  "beijing",
  "shanghai",
  "mumbai",
  "delhi",
  "istanbul",
  "cairo", "cairene",
  "lagos",
  "sydney",
  "melbourne",
  "toronto", "torontonian",
  "montreal", "montrealer",
  "vancouver", "vancouverite",
  "mexico city",
  "buenos aires",
  "sao paulo",
  "rio de janeiro",
  "bogota",
  "lima",
  "santiago",
  "dublin", "dubliner",
  "edinburgh",
  "amsterdam",
  "brussels",
  "vienna", "viennese",
  "prague",
  "warsaw",
  "budapest",
  "bucharest",
  "lisbon",
  "athens", "athenian",
  "stockholm",
  "oslo",
  "copenhagen",
  "helsinki",
  "bangkok",
  "singapore",
  "hong kong",
  "seoul",
  "taipei",
  "manila",
  "jakarta",
  "hanoi",
  "kuala lumpur",
  "nairobi",
  "johannesburg",
  "cape town",
  "dubai",
  "abu dhabi",
  "riyadh",
  "tehran",
  "baghdad",
  "jerusalem",
  "tel aviv",
  "beirut",
  "kabul",
  "kathmandu",
  "havana",
  "honolulu",
  "anchorage",
]);

/**
 * Adjective / demonym forms that should only block when they ARE the article
 * subject, not when they modify another topic (e.g. "Greek mythology" is OK,
 * but "Greek" alone or "History of Greek" is blocked).
 */
const GEOGRAPHIC_ADJECTIVES: Set<string> = new Set([
  // African demonyms
  "algerian", "angolan", "beninese", "botswanan", "burkinabe", "burundian",
  "cameroonian", "cape verdean", "central african", "chadian", "comorian",
  "congolese", "ivorian", "djiboutian", "egyptian", "equatoguinean",
  "eritrean", "swazi", "ethiopian", "gabonese", "gambian", "ghanaian",
  "guinean", "bissau-guinean", "kenyan", "mosotho", "basotho", "liberian",
  "libyan", "malagasy", "malawian", "malian", "mauritanian", "mauritian",
  "moroccan", "mozambican", "namibian", "nigerien", "nigerian", "rwandan",
  "rwandese", "santomean", "senegalese", "seychellois", "sierra leonean",
  "somalian", "somali", "south african", "south sudanese", "sudanese",
  "tanzanian", "togolese", "tunisian", "ugandan", "zambian", "zimbabwean",
  // Asian demonyms
  "afghan", "armenian", "azerbaijani", "azeri", "bahraini", "bangladeshi",
  "bhutanese", "bruneian", "cambodian", "khmer", "chinese", "cypriot",
  "georgian", "timorese", "indian", "indonesian", "iranian", "persian",
  "iraqi", "israeli", "japanese", "jordanian", "kazakh", "kazakhstani",
  "kuwaiti", "kyrgyz", "kyrgyzstani", "laotian", "lebanese", "malaysian",
  "malay", "maldivian", "mongolian", "burmese", "nepalese", "nepali",
  "north korean", "omani", "pakistani", "palestinian", "filipino", "filipina",
  "philippine", "qatari", "saudi", "arabian", "singaporean", "south korean",
  "korean", "sri lankan", "syrian", "taiwanese", "tajik", "tajikistani",
  "thai", "turkish", "turkmen", "emirati", "emirian", "uzbek", "uzbekistani",
  "vietnamese", "yemeni",
  // European demonyms
  "albanian", "andorran", "austrian", "belarusian", "byelorussian", "belgian",
  "bosnian", "herzegovinian", "bulgarian", "croatian", "czech", "danish",
  "estonian", "finnish", "french", "francophone", "german", "germanic",
  "greek", "hellenic", "hungarian", "magyar", "icelandic", "irish", "italian",
  "kosovar", "kosovan", "latvian", "lithuanian", "luxembourgish", "maltese",
  "moldovan", "monegasque", "monacan", "montenegrin", "dutch", "macedonian",
  "norwegian", "polish", "portuguese", "romanian", "russian", "sammarinese",
  "serbian", "slovak", "slovakian", "slovenian", "slovene", "spanish",
  "swedish", "swiss", "ukrainian", "british", "english", "scottish", "welsh",
  // North American demonyms
  "antiguan", "barbudan", "bahamian", "barbadian", "bajan", "belizean",
  "canadian", "costa rican", "cuban", "dominican", "salvadoran", "salvadorean",
  "grenadian", "guatemalan", "haitian", "honduran", "jamaican", "mexican",
  "nicaraguan", "panamanian", "puerto rican", "kittitian", "nevisian",
  "saint lucian", "vincentian", "trinidadian", "tobagonian", "american",
  // South American demonyms
  "argentine", "argentinian", "argentinean", "bolivian", "brazilian",
  "chilean", "colombian", "ecuadorian", "ecuadorean", "guyanese",
  "paraguayan", "peruvian", "surinamese", "uruguayan", "venezuelan",
  // Oceanian demonyms
  "australian", "aussie", "fijian", "i-kiribati", "marshallese",
  "micronesian", "nauruan", "palauan", "papua new guinean", "samoan",
  "solomon islander", "tongan", "tuvaluan", "ni-vanuatu", "vanuatuan",
  // Continental / regional adjectives
  "african", "asian", "asiatic", "european", "europeans", "north american",
  "south american", "central american", "latin american", "oceanian",
  "antarctic", "arctic", "west indian", "middle eastern", "southeast asian",
  "east asian", "south asian", "scandinavian", "balkan", "iberian",
  "caucasian", "mesopotamian", "polynesian", "melanesian", "sub-saharan",
  "subsaharan",
  // US state demonyms
  "alabamian", "alabaman", "alaskan", "arizonan", "arizonian", "arkansan",
  "californian", "coloradan", "coloradoan", "connecticuter", "delawarean",
  "floridian", "floridan", "hawaiian", "idahoan", "illinoisan", "indianan",
  "hoosier", "iowan", "kansan", "kentuckian", "louisianan", "louisianian",
  "mainer", "marylander", "michigander", "michiganian", "minnesotan",
  "mississippian", "missourian", "montanan", "nebraskan", "nevadan",
  "nevadian", "new yorker", "ohioan", "oklahoman", "oregonian",
  "pennsylvanian", "tennessean", "texan", "utahn", "utahan", "vermonter",
  "virginian", "washingtonian", "wisconsinite", "wyomingite", "guamanian",
  // Canadian demonyms
  "ontarian", "quebecer", "quebecois", "british columbian", "albertan",
  "manitoban", "nova scotian", "newfoundlander",
  // City demonyms
  "chicagoan", "houstonian", "philadelphian", "san franciscan", "seattleite",
  "bostonian", "nashvillian", "detroiter", "portlander", "atlantan",
  "miamian", "pittsburgher", "baltimorean", "londoner", "parisian",
  "berliner", "roman", "muscovite", "cairene", "torontonian", "montrealer",
  "vancouverite", "dubliner", "viennese", "athenian",
  // Other adjective forms
  "dane", "finn", "swede", "briton", "pole", "spaniard", "icelander",
  "liechtensteiner", "luxembourger", "new zealander", "kiwi",
  "motswana", "batswana",
  "north carolinian", "south carolinian", "north dakotan", "south dakotan",
  "west virginian", "rhode islander", "new mexican", "jerseyan",
]);

// Pre-compute multi-word terms for efficient matching
const multiWordTerms: string[] = [];
const singleWordTerms: Set<string> = new Set();

// Also split adjectives into single/multi for efficient lookup
const singleWordAdjectives: Set<string> = new Set();
const multiWordAdjectives: string[] = [];

for (const term of BLOCKED_COUNTRY_TERMS) {
  if (term.includes(" ") || term.includes("-") || term.includes("'")) {
    multiWordTerms.push(term);
  } else {
    singleWordTerms.add(term);
  }
}

for (const term of GEOGRAPHIC_ADJECTIVES) {
  if (term.includes(" ") || term.includes("-") || term.includes("'")) {
    multiWordAdjectives.push(term);
  } else {
    singleWordAdjectives.add(term);
  }
}

// Sort multi-word terms by length descending so longer matches are checked first
multiWordTerms.sort((a, b) => b.length - a.length);

/**
 * Checks if a Wikipedia article title is a geographic article that should be
 * blocked in Hard Mode.
 *
 * Place-name nouns (Greece, Paris, California) block broadly — if they appear
 * anywhere in the title the link is blocked.
 *
 * Adjective / demonym forms (Greek, Parisian, Californian) only block when
 * they ARE the entire title or appear after a preposition (e.g. "History of
 * Greece" is blocked, but "Greek mythology" is allowed).
 */
export function isCountryRelated(title: string): boolean {
  const lowerTitle = title.toLowerCase();

  // Check multi-word terms using word-boundary regex
  for (const term of multiWordTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|\\b)${escaped}(?:\\b|$)`, "i");
    if (regex.test(lowerTitle)) {
      // If this multi-word term is an adjective and NOT the full title,
      // only block if it follows a preposition
      if (GEOGRAPHIC_ADJECTIVES.has(term) && lowerTitle !== term) {
        const prepRegex = new RegExp(
          `\\b(?:of|in|from|about)\\s+${escaped}(?:\\b|$)`,
          "i"
        );
        if (!prepRegex.test(lowerTitle)) {
          continue; // adjective used as modifier — allow
        }
      }
      return true;
    }
  }

  // Check single-word terms
  const words = lowerTitle.split(/[^a-z0-9]+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!singleWordTerms.has(word)) continue;

    // If this word is an adjective/demonym form, only block when it is the
    // entire title or follows a preposition like "of", "in", "from"
    if (singleWordAdjectives.has(word)) {
      if (words.length === 1) return true; // exact title match
      const prev = i > 0 ? words[i - 1] : "";
      if (["of", "in", "from", "about"].includes(prev)) return true;
      continue; // adjective modifying another word — allow
    }

    // Place-name noun — block regardless of position
    return true;
  }

  return false;
}
