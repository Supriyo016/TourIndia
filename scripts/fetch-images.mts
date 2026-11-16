/**
 * Builds the licensed photo library from Wikimedia Commons.
 *
 * For each content record it finds the lead image of the record's English
 * Wikipedia article, confirms the file carries a free licence, downloads a
 * resized copy and records author and licence for the Credits page. Files with
 * any other licence are skipped. Safe to re-run: finished keys are not fetched
 * again unless their entry is removed from images.json.
 *
 * Usage: node scripts/fetch-images.mts [--only=prefix]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { northDestinations } from "../src/data/destinations/north.ts";
import { westSouthDestinations } from "../src/data/destinations/west-south.ts";
import { eastIslandDestinations } from "../src/data/destinations/east-islands.ts";
import { northeastDestinations } from "../src/data/destinations/northeast.ts";
import { states } from "../src/data/states.ts";
import { festivals } from "../src/data/festivals.ts";
import { foods } from "../src/data/food.ts";
import { unescoSites } from "../src/data/heritage.ts";
import { stories } from "../src/data/stories.ts";
import { artForms } from "../src/data/arts.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "src/data/generated/images.json");
const USER_AGENT = "TourIndiaBuild/2.0 (https://github.com/Supriyo016/TourIndia)";
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);

interface Job {
  key: string;
  folder: string;
  file: string;
  title: string;
  alt: string;
  width: number;
  /** Prefer landscape framing. */
  landscape: boolean;
  /** Skip this many suitable images, used to get a second view of a place. */
  offset?: number;
  /** Extra Commons search terms, tried after the article's own images. */
  search?: string;
  /** Use the Commons description as alt text when it reads as a caption. */
  describe?: boolean;
  /** Take a portrait image when no landscape one is found. */
  portraitFallback?: boolean;
}

const destinations = [
  ...northDestinations,
  ...westSouthDestinations,
  ...eastIslandDestinations,
  ...northeastDestinations,
];
const stateName = (slug: string) => states.find((state) => state.slug === slug)?.name ?? "";

/** Better subjects where a city article opens with a collage. */
const titleOverrides: Record<string, string | null> = JSON.parse(
  readFileSync(join(root, "scripts/image-overrides.json"), "utf8"),
);

const hero: [string, string, string][] = [
  ["taj-mahal", "Taj Mahal", "The Taj Mahal at Agra seen across its gardens"],
  ["kashmir", "Dal Lake", "Dal Lake at Srinagar with the mountains of Kashmir beyond"],
  ["kerala", "Kerala backwaters", "A boat on the backwaters of Kerala"],
  ["rajasthan", "Jaisalmer Fort", "The sandstone walls of Jaisalmer Fort in Rajasthan"],
  ["varanasi", "Ghats in Varanasi", "Stone ghats along the Ganga at Varanasi"],
  ["northeast", "Living root bridge", "A living root bridge in Meghalaya"],
  ["goa", "Palolem Beach", "A beach on the coast of Goa"],
  ["ladakh", "Nubra Valley", "The Nubra Valley in Ladakh"],
];

/** Commons search terms for each art form, tried after the Wikipedia article's own images. */
const artSearch: Record<string, string> = {
  bharatanatyam: "Bharatanatyam dancer", kathak: "Kathak dance", kathakali: "Kathakali", kuchipudi: "Kuchipudi dance",
  "manipuri-dance": "Manipuri dance", mohiniyattam: "Mohiniyattam", odissi: "Odissi dance", sattriya: "Sattriya dance",
  bhangra: "Bhangra dance", garba: "Garba Navratri", ghoomar: "Ghoomar dance", lavani: "Lavani dance", "bihu-dance": "Bihu dance",
  chhau: "Chhau dance", kalbelia: "Kalbelia dance", cheraw: "Cheraw dance", karakattam: "Karakattam", "dollu-kunitha": "Dollu Kunitha",
  "hindustani-music": "Hindustani classical music concert", "carnatic-music": "Carnatic music concert", baul: "Baul singer",
  qawwali: "Qawwali", "gurbani-kirtan": "Kirtan Harmandir Sahib", manganiyar: "Manganiyar musicians",
  pashmina: "Pashmina shawl", "banarasi-silk": "Banarasi saree", "blue-pottery": "Jaipur blue pottery", bidriware: "Bidriware",
  "channapatna-toys": "Channapatna toys", dhokra: "Dhokra", ajrakh: "Ajrakh", "sanganer-block-printing": "block printing Sanganer Bagru",
  zardozi: "Zardozi embroidery", "bankura-terracotta": "Bankura horse terracotta", "northeast-cane-bamboo": "cane bamboo craft Assam Tripura",
  "kutch-embroidery": "Kutch embroidery", sari: "saree handloom weaving", "salwar-kameez": "salwar kameez", "dhoti-mundu": "mundu Kerala",
  turban: "Rajasthani turban pagri", pheran: "Pheran Kashmir", "mekhela-chador": "Mekhela chador", "chaniya-choli": "Chaniya choli",
  "naga-shawls": "Naga shawl", madhubani: "Madhubani painting", warli: "Warli painting", pattachitra: "Pattachitra",
  kalamkari: "Kalamkari", "pahari-painting": "Kangra painting", "rajput-painting": "Rajput painting", "thanjavur-painting": "Tanjore painting",
  "gond-art": "Gond art", "hindi-devanagari": "Devanagari signboard", bengali: "Bengali signboard Kolkata", tamil: "Tamil signboard",
  urdu: "Urdu signboard", "punjabi-gurmukhi": "Gurmukhi signboard", malayalam: "Malayalam signboard", namaste: "Namaste greeting",
  "shoes-off": "footwear outside temple India", "right-hand": "meal banana leaf eating hand", "kerala-temple-dress": "Kerala temple festival devotees",
  langar: "Langar Golden Temple", "buddhist-circumambulation": "prayer wheels monastery Ladakh",
};
/**
 * Reviewed by hand after the first run. Rejected files are wrong subjects (a US
 * town called Cheraw, a French museum for "Gond") or unsuitable captions;
 * pinned files are tried first for a slot; alt text replaces weak Commons captions.
 */
const artRejected = new Set([
  "File:Indians NW of South Carolina.jpg",
  "File:NC Museum of History, Raleigh, NC - panoramio (3).jpg",
  "File:Jogis, snake charmers, Hindoos of low caste, Delhi (NYPL b13409080-1125444).jpg",
  "File:Village lady grinding ants for her family.jpg",
  "File:Bharatanatyam dance performance by Guru Saroja Vaidyanathan' disciples at Youth Festival 2012 IMG 3201 26.jpg",
  "File:Bandhej.JPG",
  "File:A Lady Enjoying Her Drink.jpg",
  "File:Schoolgirls in Shalwar Kameez, Abbotabad Pakistan - UK International Development.jpg",
  "File:A-punjabi-kitchen.jpg",
  "File:ANBU TAMIL INDIAN COSTUME IN VENICE ITALY 1.jpg",
  "File:A Manipuri Dancer in traditional Krishna attire.jpg",
  "File:Kangra Painting.jpg",
  "File:Bride entering the hall - Indian Hindu Wedding.jpg",
  "File:Raja Ravi Varma, Goddess Saraswati.jpg",
  "File:Pakistani Qawwali Harmonium.jpg",
  "File:German Jubilate Bass and Male reeds in a Pakistani Qawwali harmonium..jpg",
  "File:Processional scene with Amar Singh, ruler of Thanjavur (Tanjore) (1787-98) and Sarabhoji (1798-1832).jpg",
  "File:Painted Brass repousse Tirupati Balaji.jpg",
  "File:Ang mus may2.JPG",
  "File:Angoulême 16 Musée Le Bac à Roffit L.-E. May 2011.jpg",
  "File:UAE signboard.jpg",
  "File:Jaulian Site Signboard.JPG",
  "File:Immigration gate area of Vancouver airport with multilingual signs.jpg",
  "File:Gurdwara Bazar at Nairobi, Kenya, 1939.jpg",
  "File:Cuddapah railway station signboard.jpg",
  "File:Namaste Waterfall.JPG",
  "File:1 namaste greeting statue in Bali Indonesia.jpg",
  "File:The Banyan tree at Akkare Kottiyoor.jpg",
  "File:MelsripuraFarm.JPG",
  "File:Dancing Figures.JPG",
  "File:Bharatanatyam dance performance by Guru Saroja Vaidyanathan' disciples at Youth Festival 2012 IMG 3201 27.jpg",
  "File:Afghan Uniformed Police officer Noor Haya talks with an elder outside the district center in Spin Boldak, Kandahar province, Afghanistan, Sept 110918-A-VB845-368.jpg",
  "File:Rajarajesvaram Temple 4-8a.jpg",
  "File:Namaste a greetngs gesture by a local lady while meeting whom she knew at Okhaldunga Nepal IMG 3068.jpg",
  "File:'എടുപ്പുകുതിര' എന്ന കെട്ടുകാഴ്ചയിനം.jpg",
  "File:Konark Sun Temple Wheel.jpg",
  "File:Bengali Hindu wedding DSCN1106 03.jpg",
  "File:Afghan boys in shalwar kameez in Badakshan.jpg",
  "File:Baluchi dress (UBC 2013).jpg",
  "File:Namaste Garud.jpg",
  "File:'എടുപ്പുകുതിര' എന്ന കെട്ടുകാഴ്ചയിനം-2.jpg",
  "File:2016 photo - IMG 4988 (37891924662).jpg", // a head wrap, not a Rajasthani turban
  "File:Detail of the entry sign-board from a photograph of Gurdwara Sis Ganj Sahib in Chandni Chowk, Delhi, ca.1913–16.jpg", // Urdu script, not Devanagari
]);
const artPinned: Record<string, string[]> = {
  "art:ajrakh": ["File:Ajrak.jpg"],
  "art:ajrakh-2": ["File:Ajrak Print 3.jpg"],
  "art:ajrakh-3": ["File:Ajrak Print 1.jpg"],
  "art:sanganer-block-printing": ["File:Woman doing Block Printing at Bagru village, Jaipur, India.jpg"],
  "art:sanganer-block-printing-2": ["File:Anokhi Hand Block.jpg"],
  "art:sanganer-block-printing-3": ["File:Carving of a wooden block.jpg"],
  "art:northeast-cane-bamboo": ["File:Bamboo Khorahi.jpg"],
  "art:northeast-cane-bamboo-2": ["File:The skilled traditional duli maker creates large bamboo baskets, called Dulis, specifically designed for storing paddy seeds. 01.jpg"],
  "art:northeast-cane-bamboo-3": ["File:Bamboo assamese traditional Jakoi-Khaloi.jpg"],
  "art:bengali": ["File:Signboard for Gate 8 & 9 – International Kolkata Book Fair 2020.jpg"],
  "art:bengali-2": ["File:Shani Temple Signboard - Barisha - Kolkata 2011-10-03 030308.JPG"],
  "art:bengali-3": ["File:A road signboard on a ruined wall indicating the name of the road- Pramanick Ghat Road.jpg"],
  "art:gurbani-kirtan-2": ["File:Kirtan inside a Sikh Gurdwara.jpg"],
  "art:gurbani-kirtan-3": ["File:Photograph of Bhai Jawala Singh Ragi playing accordion (vaaja), Bhai Gurcharn Singh on Jori, and Bhai Avtar Singh on Taus at Gurdwara Dehra Sahib, Lahore, ca.1935.jpg"],
  "art:cheraw": ["File:Cheraw.jpg"],
  "art:cheraw-2": ["File:Cheraw Mizoram.jpg"],
  "art:gond-art": ["File:Gond art IMG 8707.jpg"],
  "art:gond-art-2": ["File:Gond art -peacock.jpg"],
  "art:gond-art-3": ["File:Gond art of a tiger.jpg"],
  "art:sari": ["File:Silk Sari Weaving at Kanchipuram, Tamil Nadu.jpg"],
  "art:sari-3": ["File:Weaver of Kanchipuram sarees at Kanchipuram Tamil Nadu (7642280114).jpg"],
  "art:dhoti-mundu-2": ["File:Yellow cotton Veshti & shawl - India 21. Century 2023-04-13.jpg"],
  "art:dhoti-mundu-3": ["File:The rural youth-Tamil Nadu.JPG"],
  "art:chaniya-choli": ["File:Indian garba night.jpg"],
  "art:salwar-kameez": ["File:A lady at srinagar.JPG"],
  "art:hindustani-music-2": ["File:Pandit Ravi Shankar Concert 2005.jpg"],
  "art:qawwali-2": ["File:Qawwali hazrat nizamuddin delhi.jpg"],
  "art:thanjavur-painting": ["File:Tanjore Paintings Venkateshwara.jpg"],
  "art:thanjavur-painting-3": ["File:Natarajar Tanjore painting.jpg"],
  "art:urdu-2": ["File:Niyaz Khana Signboard, Hyderabad.JPG"],
  "art:urdu-3": ["File:Signboard of the Arabic, Persian and Urdu section of the Asiatic Society.jpg"],
  "art:malayalam-2": ["File:Malayalam board with old style Malayalam letter.jpg"],
  "art:zardozi": ["File:Zardozi Artisan.jpg"],
  "art:turban": ["File:Jaisalmeri safa 02.jpg"],
  "art:zardozi-3": ["File:Zardozi Art of Farrukhabad.jpg"],
  "art:salwar-kameez-2": ["File:Women of Puducherry.jpg"],
  "art:salwar-kameez-3": ["File:Contemporary Phulkari design.jpg"],
};
/** Slots a reviewer left empty because no suitable free image was found. */
const artEmpty = new Set(["art:namaste-3", "art:kerala-temple-dress-3", "art:hindi-devanagari-2"]);
const artAlt: Record<string, string> = {
  "art:bharatanatyam-3": "A Bharatanatyam dancer at the Kerala School Kalolsavam, 2019",
  "art:kathak": "A Kathak performance",
  "art:kathak-3": "Kathak dancers Namrata Rai and Vishal Krishna as Radha and Krishna",
  "art:kathakali-2": "A chenda, the cylindrical drum that drives Kathakali",
  "art:manipuri-dance": "Musicians and dancers at a Manipuri dance performance",
  "art:manipuri-dance-2": "A Manipuri dancer in the barrel-shaped potloi skirt",
  "art:manipuri-dance-3": "Manipuri dancers in performance",
  "art:mohiniyattam": "Mohiniyattam at a school arts festival in Kannur, Kerala, 2019",
  "art:mohiniyattam-2": "A Mohiniyattam dancer at a festival in Palakkad, Kerala",
  "art:mohiniyattam-3": "A Mohiniyattam dancer in the white and gold Kerala costume",
  "art:odissi-2": "Odissi at the Nishagandhi Dance Festival, Thiruvananthapuram, 2024",
  "art:sattriya": "A Sattriya dancer in costume",
  "art:sattriya-2": "A Sattriya dancer performing in Assam",
  "art:sattriya-3": "A Sattriya dancer performing in Assam",
  "art:bhangra": "Students performing Bhangra",
  "art:garba": "Dancers in kediyu and chaniya choli, the dress worn for Garba",
  "art:ghoomar": "Ghoomar dancers in Rajasthan, 2023",
  "art:ghoomar-2": "A Ghoomar dancer at Chokhi Dhani, Rajasthan",
  "art:ghoomar-3": "Banjara women performing a Ghoomar dance",
  "art:lavani-2": "A Lavani dancer at a Sangeet Natak Akademi programme, 2009",
  "art:chhau-2": "Chhau dancers in costume",
  "art:kalbelia": "Kalbelia dancer Kamla Sapera performing",
  "art:dollu-kunitha-3": "Dollu Kunitha drummers at a procession in Mudigere, Karnataka",
  "art:hindustani-music": "Vocalist Nandini Bedekar in a Hindustani classical concert",
  "art:hindustani-music-2": "Ravi Shankar playing the sitar in concert, 2005",
  "art:hindustani-music-3": "Balasaheb Mirajkar tuning his tanpura before a concert in Sangli",
  "art:carnatic-music": "SK Mahathi in a Carnatic concert at Kakkengad, Kannur, with violin accompaniment",
  "art:carnatic-music-2": "A Tanjore-style tambura, the drone instrument of Carnatic music",
  "art:carnatic-music-3": "A Carnatic concert at Kakkengad, Kannur",
  "art:baul": "A Baul singer",
  "art:qawwali": "Qawwali at the Ajmer Sharif dargah",
  "art:qawwali-2": "Qawwali at Hazrat Nizamuddin Dargah, Delhi",
  "art:gurbani-kirtan": "The palki procession carrying the Guru Granth Sahib at the Golden Temple, Amritsar",
  "art:gurbani-kirtan-2": "Kirtan inside a gurdwara",
  "art:gurbani-kirtan-3": "Ragis with vaaja, jori and taus at Gurdwara Dehra Sahib, Lahore, about 1935",
  "art:manganiyar-2": "Manganiyar musicians performing",
  "art:manganiyar-3": "Manganiyar musicians on stage",
  "art:pashmina": "A Kashmir shawl, about 1840",
  "art:pashmina-2": "Detail of an antique Kashmiri pashmina shawl, about 1870",
  "art:pashmina-3": "A Kashmiri shawl seller in a New Delhi market",
  "art:bidriware-2": "A Bidri hookah base",
  "art:bidriware-3": "A Bidri hookah base inlaid with silver, made between 1750 and 1800",
  "art:channapatna-toys": "Lacquered wooden Channapatna toys",
  "art:channapatna-toys-2": "Lacquered bangles among Channapatna toys",
  "art:dhokra": "Dhokra metal figures for sale at the West Bengal State Handicrafts Fair, Kolkata",
  "art:dhokra-3": "A Dhokra figure of a Hindu deity",
  "art:zardozi-2": "Close-up of zardozi embroidery on a cushion cover",
  "art:zardozi-3": "Lady Curzon's peacock gown, embroidered in India, in a 1903 newspaper",
  "art:kutch-embroidery": "Embroidered baby carriers from Sindh or Kutch, Honolulu Museum of Art",
  "art:kutch-embroidery-3": "Kutch embroidery with mirror work on a cushion cover",
  "art:sari-2": "A sari draped on a mannequin",
  "art:salwar-kameez": "A woman in Srinagar wearing salwar kameez",
  "art:dhoti-mundu": "A dancer in a dhoti",
  "art:dhoti-mundu-2": "A yellow cotton veshti with a shawl",
  "art:dhoti-mundu-3": "A young man in Tamil Nadu wearing a veshti",
  "art:turban": "A Jaisalmeri safa, a turban style of western Rajasthan",
  "art:turban-2": "A Sikh man wearing a dastar",
  "art:turban-3": "An Akali turban of cotton over a wicker frame, with steel quoits",
  "art:pheran": "Elderly men in Kashmir wearing pherans",
  "art:pheran-2": "A Kashmiri wearing a pheran",
  "art:mekhela-chador-2": "A traditional motif woven into an Assamese mekhela chador",
  "art:chaniya-choli": "Women in chaniya choli at a Garba night",
  "art:chaniya-choli-2": "A flared lehenga decorated with Rogan painting by Ashish Kansara",
  "art:chaniya-choli-3": "An embroidered blouse from Kutch",
  "art:tamil": "A church signboard in Tamil at Manganur, Tamil Nadu",
  "art:qawwali-3": "Qawwali singers at the dargah of Salim Chishti, Fatehpur Sikri",
  "art:zardozi": "A zardozi artisan embroidering with metallic thread",
  "art:zardozi-3": "Zardozi work from Farrukhabad, Uttar Pradesh",
  "art:salwar-kameez-2": "Women in Puducherry wearing salwar kameez and saris",
  "art:salwar-kameez-3": "A contemporary Phulkari design, the embroidery of Punjab often worn as a dupatta",
  "art:kalbelia-2": "Kalbelia dancers in black embroidered skirts",
  "art:dhokra-2": "A Dhokra cast brass head",
  "art:odissi-3": "Odissi dancer Madhumita Raut",
  "art:naga-shawls-3": "A Naga shawl",
  "art:madhubani": "Madhubani paintings on the walls of Madhubani railway station",
  "art:madhubani-3": "A Madhubani painting at the Crafts Museum, New Delhi",
  "art:warli": "Warli paintings at the Sanskriti Kendra Museum, Anandagram, New Delhi",
  "art:warli-2": "A Warli painting by Jivya Soma Mashe",
  "art:warli-3": "Warli-style paintings on a wall in Mysuru",
  "art:kalamkari": "A kalamkari rumal (painted cotton cover) in the Metropolitan Museum of Art",
  "art:kalamkari-3": "A kalamkari hanging of the ten avatars of Vishnu, British Museum",
  "art:pahari-painting-2": "Krishna and Radha looking into a mirror, Pahari painting",
  "art:pahari-painting-3": "A lady gazing at doves, Pahari painting",
  "art:rajput-painting": "A Rajput miniature painting",
  "art:rajput-painting-2": "Rao Jagat Singh of Kota at ease, attributed to the Hada Master",
  "art:rajput-painting-3": "Malashri ragini, a page from the Chawand Ragamala, by Nasiruddin",
  "art:thanjavur-painting": "A Thanjavur painting of Venkateshwara",
  "art:thanjavur-painting-2": "A Thanjavur painting with gold leaf",
  "art:thanjavur-painting-3": "A Thanjavur painting of Nataraja",
  "art:gond-art": "A Gond painting",
  "art:gond-art-2": "A Gond painting of a peacock",
  "art:gond-art-3": "A Gond painting of a tiger",
  "art:hindi-devanagari": "A gate sign in Devanagari script in Pune",
  "art:tamil-2": "The Tamil and English signboard of the Government Museum, Salem",
  "art:tamil-3": "Road signs in Tamil and English on the Chennai-Bengaluru highway",
  "art:urdu": "A railway station signboard at Habibganj, Bhopal, in Hindi, English and Urdu",
  "art:urdu-2": "A signboard in Urdu at Niyaz Khana, Hyderabad",
  "art:urdu-3": "Signboard of the Arabic, Persian and Urdu section of the Asiatic Society, Kolkata",
  "art:malayalam-2": "A Malayalam signboard in the older style of the script",
  "art:bengali": "Signboard in Bengali at the International Kolkata Book Fair, 2020",
  "art:bengali-2": "A temple signboard in Bengali, Kolkata",
  "art:bengali-3": "A Bengali road sign on a ruined wall, Kolkata",
  "art:namaste": "A namaste greeting, palms joined at the chest",
  "art:shoes-off": "Footwear left at the entrance of the Brihadisvara Temple, Thanjavur",
  "art:shoes-off-2": "Footwear left outside a temple in Coimbatore",
  "art:right-hand": "A meal served on a banana leaf at a wedding in south India",
  "art:kerala-temple-dress": "Devotees at the annual festival of the Kottiyoor temple, Kerala",
  "art:kerala-temple-dress-2": "Devotees crossing to the Akkare Kottiyoor temple during the festival",
  "art:langar-2": "Langar being served at the Golden Temple, Amritsar",
  "art:langar-3": "Volunteers in the Guru Ram Das Langar at the Golden Temple, Amritsar",
  "art:cheraw": "Dancers stepping between bamboo poles in Cheraw",
  "art:cheraw-2": "Cheraw, the bamboo dance of Mizoram",
  "art:cheraw-3": "Schoolgirls in Mizo traditional dress, Hnahthial",
  "art:ajrakh": "Ajrakh block-printed cloth",
  "art:ajrakh-2": "Ajrakh print in indigo and madder",
  "art:ajrakh-3": "Ajrakh print",
  "art:sanganer-block-printing": "A woman block printing cloth at Bagru village, near Jaipur",
  "art:sanganer-block-printing-2": "A carved wooden printing block",
  "art:sanganer-block-printing-3": "Carving a wooden printing block",
  "art:northeast-cane-bamboo": "A bamboo khorahi basket from Assam",
  "art:northeast-cane-bamboo-2": "A craftsman weaving a duli, a large bamboo basket for storing paddy seed, in Assam",
  "art:northeast-cane-bamboo-3": "Assamese bamboo fishing traps, jakoi and khaloi",
};
/** Language and custom articles open with maps and portraits, so these use Commons search only. */
const searchOnly = new Set(["language", "custom"]);
const artJobs: Job[] = artForms.flatMap((form) => {
  const title = searchOnly.has(form.category) || !form.wikipediaTitle ? `search:${artSearch[form.slug] ?? form.name}` : form.wikipediaTitle;
  const search = title.startsWith("search:") ? undefined : artSearch[form.slug];
  const base = { folder: "art", title, search, describe: true };
  return [
    { ...base, key: `art:${form.slug}`, file: form.slug, alt: form.name, width: 1600, landscape: true, portraitFallback: true },
    { ...base, key: `art:${form.slug}-2`, file: `${form.slug}-2`, alt: form.name, width: 1200, landscape: false },
    { ...base, key: `art:${form.slug}-3`, file: `${form.slug}-3`, alt: form.name, width: 1200, landscape: false },
  ];
});

const jobs: Job[] = [
  ...hero.map(([slug, title, alt]) => ({
    key: `hero:${slug}`, folder: "hero", file: slug, title, alt, width: 1920, landscape: true,
  })),
  ...destinations.flatMap((item) => {
    const place = `${item.name}, ${stateName(item.stateSlug)}`;
    return [
      { key: `destination:${item.slug}`, folder: "destinations", file: item.slug, title: titleOverrides[`destination:${item.slug}`] ?? item.wikipediaTitle, alt: place, width: 1600, landscape: true },
      { key: `gallery:${item.slug}-2`, folder: "gallery", file: `${item.slug}-2`, title: item.wikipediaTitle, alt: place, width: 1200, landscape: false, offset: 2 },
    ];
  }),
  ...states.map((item) => ({
    key: `state:${item.slug}`, folder: "states", file: item.slug, title: titleOverrides[`state:${item.slug}`] ?? item.wikipediaTitle, alt: item.name, width: 1400, landscape: true,
  })),
  ...festivals.map((item) => ({
    key: `festival:${item.slug}`, folder: "festivals", file: item.slug, title: item.wikipediaTitle, alt: `${item.name} celebrations`, width: 1200, landscape: true,
  })),
  ...foods.map((item) => ({
    key: `food:${item.slug}`, folder: "food", file: item.slug, title: item.wikipediaTitle, alt: `${item.name}, served`, width: 1000, landscape: false,
  })),
  ...unescoSites.map((item) => {
    const file = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    return { key: `unesco:${file}`, folder: "unesco", file, title: item.wikipediaTitle, alt: item.name, width: 1000, landscape: true };
  }),
  ...stories.map((item) => ({
    key: `story:${item.slug}`, folder: "stories", file: item.slug, title: item.wikipediaTitle, alt: item.title, width: 1400, landscape: true,
  })),
  ...artJobs,
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string): Promise<Response> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(45_000),
      });
      if (response.status !== 429 && response.status < 500) return response;
      await sleep(4000 * (attempt + 1));
    } catch {
      await sleep(3000 * (attempt + 1));
    }
  }
  throw new Error(`Gave up on ${url}`);
}

interface ImageInfo {
  thumburl?: string;
  url: string;
  width: number;
  height: number;
  descriptionurl: string;
  extmetadata?: Record<string, { value?: string | boolean }>;
}

interface ApiResult {
  query?: {
    pages?: { missing?: boolean; pageimage?: string; images?: { title: string }[]; imageinfo?: ImageInfo[] }[];
  };
}

async function api(host: string, params: Record<string, string>) {
  const query = new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params });
  const response = await fetchWithRetry(`https://${host}/w/api.php?${query}`);
  return response.json() as Promise<ApiResult>;
}

const FREE = /^(cc0|cc[ -]by([ -]sa)?([ -]\d(\.\d)?)?|public domain|pd\b|pd-)/i;
const SKIP_NAME = /(collage|montage|clockwise|map|locator|flag|logo|seal|emblem|coat[ _]of|icon|commons-|wiki|diagram|chart|stamp|banner|symbol|portrait|\.svg|\.gif|\.tif|\.webm|\.ogv|\.ogg|\.pdf)/i;

const stripHtml = (value = "") =>
  value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/** An override of "search:terms" looks on Commons directly, for subjects with no usable article image. */
async function searchCommons(terms: string): Promise<string[]> {
  const found = await api("commons.wikimedia.org", {
    action: "query", generator: "search", gsrnamespace: "6", gsrlimit: "20", gsrsearch: `filetype:bitmap ${terms}`, prop: "info",
  });
  return (found.query?.pages ?? [])
    .map((page) => (page as { title?: string }).title ?? "")
    .filter((name) => /\.jpe?g$/i.test(name) && !SKIP_NAME.test(name.replace(/^File:/, "")));
}

async function candidates(title: string): Promise<string[]> {
  if (title.startsWith("search:")) return searchCommons(title.slice(7));
  const lead = await api("en.wikipedia.org", {
    action: "query", redirects: "1", titles: title, prop: "pageimages|images", piprop: "name", imlimit: "60",
  });
  const page = lead.query?.pages?.[0];
  if (!page || page.missing) return [];
  const names = (page.images ?? []).map((image) => image.title);
  const first = page.pageimage ? [`File:${page.pageimage}`] : [];
  return [...new Set([...first, ...names])]
    .filter((name) => !SKIP_NAME.test(name.replace(/^File:/, "")))
    .filter((name) => /\.jpe?g$/i.test(name))
    .slice(0, 24);
}

/** Page-image names come back with underscores; file lists with spaces. */
const normalName = (name: string) => name.replace(/_/g, " ");

async function candidatesFor(job: Job): Promise<string[]> {
  const names = await candidates(titleOverrides[job.key] ?? job.title);
  const extra = job.search ? await searchCommons(job.search) : [];
  return [...new Set([...names, ...extra].map(normalName))].filter((name) => !artRejected.has(name) && !(artPinned[job.key] ?? []).includes(name));
}

/** A Commons description that reads as a short caption, for alt text. */
function captionFrom(description: string): string | undefined {
  const text = description.replace(/^(english|en)\s*:\s*/i, "").split(/(?<=[.!?])\s/)[0]?.trim() ?? "";
  if (text.length < 12 || text.length > 150) return undefined;
  if (/[^\x20-\x7E\u00C0-\u017F\u2018-\u201D]/.test(text) || /own work|uploaded|wikimedia|flickr|camera|dsc|img[_ ]?\d/i.test(text)) return undefined;
  return text.replace(/[.\s]+$/, "");
}

const inspected = new Map<string, Awaited<ReturnType<typeof inspectRaw>>>();
async function inspect(fileTitle: string, width: number) {
  const key = `${fileTitle}|${width}`;
  if (!inspected.has(key)) {
    inspected.set(key, await inspectRaw(fileTitle, width));
    await sleep(120);
  }
  return inspected.get(key)!;
}

async function inspectRaw(fileTitle: string, width: number) {
  const data = await api("commons.wikimedia.org", {
    action: "query", titles: fileTitle, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: String(width),
  });
  const info = data.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const textOf = (key: string) => {
    const value = meta[key]?.value;
    return typeof value === "string" ? value : "";
  };
  const license = stripHtml(textOf("LicenseShortName"));
  if (!FREE.test(license) || meta.NonFree?.value === "true" || meta.NonFree?.value === true) return null;
  if (info.width < 1000) return null;
  return {
    thumb: info.thumburl ?? info.url,
    width: info.width,
    height: info.height,
    license,
    licenseUrl: textOf("LicenseUrl") || undefined,
    author: stripHtml(textOf("Artist")).slice(0, 160) || "Unknown author",
    sourceUrl: info.descriptionurl,
    description: stripHtml(textOf("ImageDescription")),
  };
}

const manifest: Record<string, unknown> = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : {};
const added = new Set<string>();
/** Re-reads the file before writing, so a run does not drop keys another run saved meanwhile. */
const save = () => {
  const current: Record<string, unknown> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  for (const key of added) current[key] = manifest[key];
  writeFileSync(manifestPath, `${JSON.stringify(current, null, 1)}\n`);
};
mkdirSync(dirname(manifestPath), { recursive: true });

const usedFiles = new Set<string>(Object.values(manifest).map((item) => (item as { sourceUrl: string }).sourceUrl));
const failures: string[] = [];
let done = 0;

/** Downloads the first suitable candidate for a job; returns false when none fits. */
async function saveFirstSuitable(job: Job, names: string[], landscape: boolean): Promise<boolean> {
  let skip = job.offset ?? 0;
  for (const name of names) {
    const details = await inspect(name, job.width);
    if (!details || usedFiles.has(details.sourceUrl)) continue;
    if (landscape && details.width < details.height * 1.15) continue;
    if (skip > 0) { skip -= 1; continue; }

    const response = await fetchWithRetry(details.thumb);
    if (!response.ok) continue;
    const input = Buffer.from(await response.arrayBuffer());
    const directory = join(root, "public/images", job.folder);
    mkdirSync(directory, { recursive: true });
    const output = await sharp(input)
      .rotate()
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toBuffer({ resolveWithObject: true });
    writeFileSync(join(directory, `${job.file}.webp`), output.data);
    const blur = await sharp(input).resize(16).webp({ quality: 40 }).toBuffer();

    manifest[job.key] = {
      src: `/images/${job.folder}/${job.file}.webp`,
      width: output.info.width,
      height: output.info.height,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
      alt: artAlt[job.key] ?? ((job.describe && captionFrom(details.description)) || job.alt),
      author: details.author,
      license: details.license,
      licenseUrl: details.licenseUrl,
      sourceUrl: details.sourceUrl,
    };
    added.add(job.key);
    usedFiles.add(details.sourceUrl);
    done += 1;
    if (done % 10 === 0) save();
    console.log(`ok   ${job.key}  (${details.license})`);
    return true;
  }
  return false;
}

for (const [key, alt] of Object.entries(artAlt)) {
  const entry = manifest[key] as { alt: string } | undefined;
  if (entry && entry.alt !== alt && (!only || key.startsWith(only))) {
    entry.alt = alt;
    added.add(key);
  }
}

for (const job of jobs) {
  // A null override means a person reviewed this slot and no automatic pick is wanted.
  if (manifest[job.key] || titleOverrides[job.key] === null || artEmpty.has(job.key) || (only && !job.key.startsWith(only))) continue;
  try {
    const names = await candidatesFor(job);
    // A file picked by hand is used whatever its shape.
    const pinned = artPinned[job.key] ?? [];
    const saved =
      (pinned.length > 0 && (await saveFirstSuitable(job, pinned, false))) ||
      (await saveFirstSuitable(job, names, job.landscape)) ||
      (job.landscape && job.portraitFallback === true && (await saveFirstSuitable(job, names, false)));
    if (!saved) failures.push(job.key);
  } catch (error) {
    failures.push(`${job.key}: ${(error as Error).message}`);
  }
  await sleep(250);
}

save();
console.log(`\nSaved ${done} new images. Manifest holds ${Object.keys(manifest).length}.`);
if (failures.length) console.log(`No suitable licensed image for:\n  ${failures.join("\n  ")}`);
