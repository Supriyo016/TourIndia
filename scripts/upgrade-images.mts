/**
 * Upgrades the photo library to the highest-resolution free originals on
 * Wikimedia Commons, fills records that have no photo, and sources the
 * Wikipedia-style reference images for the encyclopedia.
 *
 * Originals are never stored: each file is fetched as a Commons thumbnail at a
 * standard size, resized to the site's web width, given a gentle contrast lift
 * and saved as WebP. `sourceWidth` in images.json records the original width.
 *
 * Phases, run in order; each writes to a cache folder outside the repo so a
 * person can review contact sheets between steps:
 *   widths   original size of every file in images.json
 *   propose  better originals for slots under 4000 px, and fills for empty slots
 *   refs     reference-image candidates for each encyclopedia entry
 *   sheets   contact sheets (old | candidates) for review
 *   apply    download chosen files, enhance and write images.json
 *
 * Usage: node scripts/upgrade-images.mts --phase=<name> [--only=prefix]
 * Cache: $UPGRADE_CACHE or <os tmp>/tourindia-upgrade
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { cleanAuthor } from "../src/lib/credits.ts";
import { northDestinations } from "../src/data/destinations/north.ts";
import { westSouthDestinations } from "../src/data/destinations/west-south.ts";
import { eastIslandDestinations } from "../src/data/destinations/east-islands.ts";
import { northeastDestinations } from "../src/data/destinations/northeast.ts";
import { states } from "../src/data/states.ts";
import { festivals } from "../src/data/festivals.ts";
import { foods } from "../src/data/food.ts";
import { unescoSites } from "../src/data/heritage.ts";
import { stories } from "../src/data/stories.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "src/data/generated/images.json");
const cache = process.env.UPGRADE_CACHE ?? join(tmpdir(), "tourindia-upgrade");
mkdirSync(join(cache, "thumbs"), { recursive: true });
const USER_AGENT = "TourIndiaBuild/2.0 (image library upgrade; https://github.com/Supriyo016/TourIndia)";
const phase = process.argv.find((arg) => arg.startsWith("--phase="))?.slice(8);
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);
/** --only takes comma-separated key prefixes. */
const matches = (key: string) => !only || only.split(",").some((prefix) => key.startsWith(prefix));

/** Originals at or above this width are kept as they are. */
const GOOD_WIDTH = 4000;
const REF_WIDTH = 1000;
const REF_COUNT = 6;
const QUALITY = 74;

// ---------------------------------------------------------------- review decisions

/**
 * Upgrade choices made from the contact sheets: 0 keeps the current file,
 * 2 or 3 takes that candidate instead of the first. Unlisted slots take candidate 1.
 */
const upgradeChoice: Record<string, number | string> = {
  // Reviewed 2026-11-17 against contact sheets (current | candidates 1-3).
  "gallery:agra-2": 2, "destination:delhi": 0, "destination:udaipur": 3, "gallery:udaipur-2": 0,
  "gallery:jaisalmer-2": 2, "gallery:srinagar-2": 2, "destination:leh": 0, "gallery:leh-2": 2, "destination:manali": 2,
  "gallery:rishikesh-2": 2, "gallery:amritsar-2": 3, "destination:chandigarh": 2, "gallery:kurukshetra-2": 3,
  "destination:kutch": 1, "gallery:kutch-2": 1, "destination:diu": "File:Diu fort Diu india.jpg", "gallery:diu-2": "File:St. Paul Church - Diu - 001.jpg",
  "destination:khajuraho": 2, "gallery:khajuraho-2": 2, "destination:bastar": "File:Chitrakote Falls.jpg",
  "gallery:bastar-2": "File:Bastar Dusshera Unexplored Bastar.jpg", "destination:alappuzha": 0, "gallery:munnar-2": 3,
  "destination:mysuru": 0, "gallery:madurai-2": 2, "destination:gandikota": "File:Gandikota Canyon, Cudappah district, Andhra Pradesh, India.jpg",
  "gallery:gandikota-2": 0, "destination:andaman": 2, "gallery:kolkata-2": 2, "destination:darjeeling": 0, "gallery:darjeeling-2": 2,
  "gallery:puri-konark-2": 0, "gallery:netarhat-2": 0, "destination:kaziranga": 0, "gallery:majuli-2": 2,
  "destination:shillong-sohra": 0, "gallery:shillong-sohra-2": 2, "gallery:tawang-2": 2, "destination:ziro": 0, "gallery:ziro-2": 0,
  "destination:gangtok": 2, "gallery:kohima-2": 3, "gallery:aizawl-2": 2, "destination:loktak": 0, "state:bihar": 2,
  "state:chhattisgarh": 0, "state:maharashtra": 3, "state:mizoram": 2, "state:nagaland": 0, "state:punjab": 2,
  "state:rajasthan": "File:20191219 Fort Amber, Amer, Jaipur 0955 9481.jpg", "state:west-bengal": 3,
  "state:andaman-and-nicobar-islands": 0, "state:dadra-and-nagar-haveli-and-daman-and-diu": 2,
  "festival:ganesh-chaturthi": 2, "festival:christmas": 0, "festival:pushkar-fair": 3, "festival:rath-yatra": 0, "festival:baisakhi": 3,
  "festival:goa-carnival": "File:Carnival in Goa - Panjim 2019 - Picture 1.jpg",
  "festival:losoong": "File:Rumtek Monastery alias Dharma Chakra Centre near Gangtok in East Sikkim 01.jpg",
  "festival:thrissur-pooram": 0, "food:butter-chicken": 2, "food:rogan-josh": 2, "food:aloo-paratha": 0, "food:pav-bhaji": 3,
  "food:goan-fish-curry": 0, "food:hyderabadi-biryani": 2, "food:appam": 0, "food:filter-coffee": 3, "food:litti-chokha": 3,
  "food:mishti-doi": 2, "food:rasgulla": 0, "food:momo": 3, "food:eromba": 0,
  "food:lakshadweep-tuna": "File:Fishermen at Kavarathi, Lakshadweep, India (edit).jpg",
  "unesco:ajanta-caves": 1, "unesco:taj-mahal": 3, "unesco:kaziranga-national-park": 2, "unesco:manas-wildlife-sanctuary": 0,
  "unesco:keoladeo-national-park": 2, "unesco:khajuraho-group-of-monuments": 2, "unesco:fatehpur-sikri": 0,
  "unesco:group-of-monuments-at-pattadakal": 2, "unesco:elephanta-caves": 2, "unesco:sundarbans-national-park": 0,
  "unesco:nanda-devi-and-valley-of-flowers-national-parks": 0, "unesco:mountain-railways-of-india": 0,
  "unesco:mahabodhi-temple-complex-at-bodh-gaya": "File:Mahabodhitemple.jpg", "unesco:the-jantar-mantar-jaipur": 2,
  "unesco:western-ghats": 0, "unesco:rani-ki-vav-the-queen-s-stepwell-at-patan": 3,
  "unesco:the-architectural-work-of-le-corbusier-an-outstanding-contri": "File:Open Hand monument, Chandigarh.jpg",
  "unesco:sacred-ensembles-of-the-hoysalas": 2, "unesco:moidams-the-mound-burial-system-of-the-ahom-dynasty": 0,
  "unesco:maratha-military-landscapes-of-india": 2, "unesco:ancient-buddhist-site-of-sarnath": 0,
  "story:planning-a-first-trip-to-india": 2, "story:low-impact-travel-in-the-himalaya": 0,
};
/** Captions for files chosen by hand, where the slot's generic alt text would mislead. */
const altFor: Record<string, string> = {
  "food:lakshadweep-tuna": "Fishermen at Kavaratti, Lakshadweep, where tuna is the everyday catch",
  "festival:losoong": "Rumtek Monastery near Gangtok, one of the monasteries that hold chaam dances at Losoong",
  "festival:goa-carnival": "Carnival decorations and crowds in Panaji, Goa, 2019",
};
/** Files a reviewer pinned for a slot (used before any search). */
const pinned: Record<string, string> = {};
/** Reference candidates rejected on review (wrong subject, map, portrait, poor photo). */
const refRejected = new Set<string>([
  "File:Church of St. Francis of Assisi, Diu (with altar).jpg",
  "File:13 Manzil Temple Rishikesh 2021.jpg",
  "File:48 kos parikrama.jpg",
  "File:Forest and pastures vs agricultural land Darjeeling 1900 to 2000.jpg",
  "File:Sundarbans a few months after cyclone sidr.jpg",
  "File:Cayo Jutías-Mangrove (3).jpg",
  "File:Gadiya temple ruins, Bastar Chhattisgarh 004.jpg",
  "File:\"Flowers Blossom At valley of flowers Chamoli, India\" 38.jpg",
  "File:2009 Pristis microdon1.JPG",
  "File:Alchi.jpg",
  "File:Arunachal Vikas Parishad Office Ziro (88271).jpg",
  "File:Average annual temperatures Darjeeling 1890 to 2010.jpg",
  "File:Axishirsche in den Sundarbans.JPG",
  "File:Gadiya temple ruins, Bastar Chhattisgarh 014.jpg",
  "File:Gangore Nritya Malwa India.jpg",
  "File:Green turtle Lakshadweep.jpg",
  "File:Holy Prayer.jpg",
  "File:Khajuraho,Chausath-Yogini-Tempel2.jpg",
  "File:Loktak Lake Manipur 06.jpg",
  "File:Mumbai Metro at Gundavali Station.jpg",
  "File:Netarhat Gate, Latehar, Jharkhand.jpg",
  "File:Ningol-chakkouba.jpg",
  "File:XP Nepf D4090.JPG",
  "File:Undavalli Caves, Vijayawada.JPG",
  "File:Manas landscape rhino.jpg",
  "File:Mahabodhitemple.jpg",
  "File:Aerial view of Grand Prismatic (23428929375).jpg",
  "File:Chitrakot waterfalls.JPG",
  "File:Landuse landcover imgae of Chhattisgarh.jpg",
  "File:Lhasa khrom gzigs khang 2014.09.23 11-19-07.jpg",
  "File:Wild Bos gaurus Upparabeeranahalli.jpg",
  "File:Silk route copy.jpg",
  "File:Silk route.jpg",
  "File:Tiger Valley Bridge view 3.jpg",
  "File:Dawki River, Meghalaya.jpg",
  "File:Shillong Bypass road.jpg",
  "File:Shillong Airport terminal building 4.jpg",
  "File:National Highway 6 to Guwahati.jpg",
  "File:National Highway 6 Toll Plaza.jpg",
  "File:Indian Institute of Management, main gate, Shillong.jpg",
  "File:NEHU campus, Mawlai, Shillong.jpg",
  "File:SaurabhSawant DzukouValley Khonoma Nagaland MG 2559.jpg",
  "File:Rhododendron ponticum actm 06.jpg",
  "File:Alnus Olsza 2020-07-31 01.jpg",
  "File:Golden Temple, Amritsar, Punjab UNAG.jpg",
  "File:Golden Temple Amritsar Gurudwara (cropped).jpg",
  "File:1 Sri Kesgarh Takhat Anandpur Sahib Khalsa birthplace Punjab India.jpg",
  "File:Thanjavur 2.jpg",
  "File:Shiv Linga at Warangal Fort Complex.jpg",
  "File:Melaghar Municipal Council.jpg",
  "File:Mbb airport.jpg",
  "File:IBC Post.jpeg",
  "File:Badrinath Temple- Uttarakhand.jpg",
  "File:Ganga aarti of haridwar.jpg",
  "File:Howrah bridge betwixt Lights.jpg",
  "File:Chandigarh hockey stadium.JPG",
  "File:Rajiv Gandhi Chandigarh Technology Park (RGCTP).jpg",
  "File:Major Churches of Diu Island.jpg",
  "File:India Gate 2014-11-01.jpg",
  "File:Amaterske akvarium.jpg",
  "File:Sterna fuscata.JPG",
  "File:Eid al fitr photo.jpg",
  "File:TEDxAMS2011 044.JPG",
  "File:Neptunia oleracea-IMG 1661.jpg",
  "File:Taj Mahal, Agra, India.jpg",
  "File:Tajview Agra 2019 002.jpg",
  "File:Varanasi, India, Ghats, Cremation ceremony in progress.jpg",
  "File:Sampurnanand Sanskrit University left gate.jpg",
  "File:Silver Rupee of the Bengal Presidency, struck in Muhammadabad Benaras, in the name of Mughal emperor Shah Alam II.jpg",
  "File:Chennai National Art Gallery GJE.jpg",
  "File:Hyderabad house US Sec Def highest intensity.jpg",
  "File:NIGHT - Jaipur International Airport (13-07-2022) 01.jpg",
  "File:रंगीलो म्हारो देस.jpg",
  "File:Red and Yellow Tulips.JPG",
  "File:Chandigarh Rock Garden 4.jpg",
  "File:Kurukshetra Panorama and Science Centre.JPG",
  "File:NITKurukshetra.jpg",
  "File:Great Indian Pennunsula Railways Exhibition @CST,Mumbai - panoramio (89).jpg",
  "File:Ikea mumbai backside.jpg",
  "File:DULHADEO TEMPLE ARCHITECTURE.jpg",
  "File:Godavari old and new bridges.jpg",
  "File:Dummugudem Barrage on Godavari Khammam District.jpg",
  "File:Alleppey canal.jpg",
  "File:Mysore (Baedeker, 1914).jpg",
  "File:Mysore race course.jpeg",
  "File:Mysore India Infosys.JPG",
  "File:Mysore Airport.jpg",
  "File:Mysore university building.JPG",
  "File:Oriental Library, Mysore, India.jpg",
  "File:Mysuru Rail Museum - Rail Bus - 1.jpg",
  "File:Mysuru Rail Museum - Locomotive YDM4 6200.jpg",
  "File:Madurai Junction.jpg",
  "File:MaduraiAirport.JPG",
  "File:Madurai Corporation Office.jpeg",
  "File:MGR Bus Stand.jpg",
  "File:Karaikudi - Madurai Green Field Highway.jpg",
  "File:Honeywell Technology Solution Lab, Madurai.jpg",
  "File:Charminar-Pride of Hyderabad.jpg",
  "File:A local church entrance at Araku Valley in Andhra Pradesh.jpg",
  "File:Camping Banks Pennar River.jpg",
  "File:EM Bypass Kolkata.jpg",
  "File:Himalayan journal Hooker page 129.jpg",
  "File:1046 IndiaDarjeeling 19931231 (2).jpg",
  "File:South Asia non political, with rivers.jpg",
  "File:Konark Sun Temple JEG DSCN4984.jpg",
  "File:Konark Sun Temple JEG DSCN4995.jpg",
  "File:Konark Sun Temple - IRCTC 2017 (22).jpg",
  "File:Konark Sun Temple JEG DSCN5051.jpg",
  "File:Konark Sun Temple JEG DSCN5031.jpg",
  "File:Hill station of jharkhand,Netarhat.jpg",
  "File:Majuli Island , Assam (19).jpg",
  "File:Tawang Monastery second largest monastery in Asia Arunachal Pradesh India.jpg",
  "File:Apatani tribal women.jpg",
  "File:Drée 2012 07 - 03.jpg",
  "File:Arunachal Vikas Parishad Office Ziro (70202).jpg",
  "File:Capital Cultural Hall.jpg",
  "File:Francois Vatable, reconstructie van de tempel van Salomo (detail).jpg",
  "File:Kids in Traditional Attire.jpg",
]);
/** Captions rewritten on review, by Commons file title. */
const captionFix: Record<string, string> = {
  "File:A Sailboat in Sundarbans, West Bengal, India 07.jpg": "A sailboat on a creek in the Sundarbans",
  "File:\"Flowers Blossom at Valley of Flowers Chamoli, India\" 52.jpg": "Wild flowers in the Valley of Flowers, Chamoli",
  "File:Fishermen at Kavarathi, Lakshadweep, India (edit).jpg": "Fishermen sorting their nets on the beach at Kavaratti, Lakshadweep",
  "File:University Mumbai convoc hall.jpg": "The convocation hall of the University of Mumbai",
  "File:Kohima War Cemetery, Kohima, Nagaland (89).jpeg": "The Kohima Epitaph at the Kohima War Cemetery",
  "File:Kohima 24 July 2021.jpeg": "Kohima town, Nagaland",
  "File:Getting ready for Losar.jpg": "Monks preparing for Losar, Tawang",
  "File:\"Gaden Namgyal Lhatse\" (Tibetan) was consecrated by Tenzin Gyatso, the 14th Dalai Lama of Tibet on 15 October 1997 detail, from- Tawang Monastery 100 (22) (cropped).jpg": "Inside Tawang Monastery",
  "File:018 Bodhi Tree (9219396225).jpg": "The Bodhi Tree at the Mahabodhi Temple, Bodh Gaya",
  "File:Marine Lines Mumbai 2021.jpg": "Marine Drive at night, Mumbai",
  "File:Indien ajanta2.jpg": "Detail of a wall painting in the Ajanta Caves",
  "File:Meister des Mahâjanaka Jâtaka 001.jpg": "A painting by the master of the Mahajanaka Jataka, Ajanta",
  "File:Valley of flowers pic.jpg": "Flowers in the Valley of Flowers",
  "File:\"Flowers Blossom At valley of flowers Chamoli, India\" 40.jpg": "Flowers in bloom in the Valley of Flowers National Park",
  "File:Minicoy123.jpg": "Minicoy Island, Lakshadweep",
  "File:Minicoy Island, Lakshadweep.jpg": "A beach on Minicoy, Lakshadweep",
  "File:Now memory Shiva statue near Paramarth Niketan.jpg": "Shiva statue on the Ganga near Parmarth Niketan, Rishikesh",
  "File:Takhat-Sri-Kesgarh-Sahib-Anandpur-Sahib.jpg": "Takht Sri Kesgarh Sahib, Anandpur Sahib, Punjab",
  "File:Kumbhalgarh 055.jpg": "Kumbhalgarh Fort, Rajasthan",
  "File:Kisama main arena Hornbill Festival 2019.jpg": "Kisama Heritage Village, home of the Hornbill Festival, Nagaland",
  "File:Image pondicherry.jpg": "A beach in Puducherry",
  "File:Konarka Temple.jpg": "Konark Sun Temple, Odisha",
  "File:Snake Charmer, India, Patna School, 19th century, Honolulu Museum of Art.JPG": "Snake charmer, a Patna School painting of the 19th century",
  "File:Kolkata maidan.jpg": "The Kolkata skyline beside the Maidan",
  "File:Digha Sankarpur 2Arnab.jpg": "The beach at Digha-Sankarpur, West Bengal",
  "File:Road Padum Zanskar Range Jun24 A7CR 00818.jpg": "The Zanskar Range above the road to Padum, Ladakh",
  "File:Embossed Figures Kawtchhuah Ropui Vangchhia Mapuia Hnamte (1).JPG": "Carved stones at the Kawtchhuah Ropui heritage site, Vangchhia, Mizoram",
  "File:Vantawng Falls in 1990s.jpg": "Vantawng Falls, Serchhip, Mizoram",
  "File:Kawtchhuah Ropui Vangchhia Mapuia Hnamte (2).JPG": "The Kawtchhuah Ropui heritage site at Vangchhia, Mizoram",
  "File:A Magnificient Evening Sunset With Pamban Railway Bridge and Boat Mail Express Passes Through this Pamban Railway Bridge !-.jpg": "The Pamban railway bridge at sunset, Tamil Nadu",
  "File:Trayambakeshwar Temple VK.jpg": "The thirteen-storey Trayambakeshwar Temple near Lakshman Jhula, Rishikesh",
  "File:Undavalli Caves, Vijayawada, Guntur, Andhra Pradesh, India (2018) 1.jpg": "The rock-cut Undavalli Caves, Andhra Pradesh",
  "File:Ranghar - Assam.jpg": "The Rang Ghar pavilion at Sivasagar, Assam",
  "File:Palolem Beach, South Goa.jpg": "Palolem Beach, Goa",
  "File:Bastar Dusshera Unexplored Bastar.jpg": "The chariot procession of Bastar Dussehra",
  "File:Shravanabelagola Bahubali wideframe.jpg": "The Gommateshwara statue of Bahubali at Shravanabelagola, Karnataka",
  "File:Pattadakal 000.JPG": "Temples at Pattadakal, Karnataka",
  "File:GolGumbaz2 altered.jpg": "Gol Gumbaz, Vijayapura, Karnataka",
  "File:Gateway of India -Mumbai.jpg": "The Gateway of India, Mumbai",
  "File:Elephanta Caves Trimurti.jpg": "The Trimurti sculpture in the Elephanta Caves, Maharashtra",
  "File:Pratapgad The Fort of Valour.jpg": "Pratapgad Fort, Maharashtra",
  "File:Ramappa Temple (Human Scale).jpg": "Ramappa Temple, Telangana",
  "File:Deer, Sepahijala WLS.jpg": "Deer at Sepahijala Wildlife Sanctuary, Tripura",
  "File:Authentic Gujrati Dhokla, Daman, Daman and Diu, IMG 20181019 085624211.jpg": "Dhokla, a steamed Gujarati snack, served in Daman",
  "File:Forest snow Namdapha IMG 3373 04.jpg": "A snowy forest in Namdapha Tiger Reserve, Arunachal Pradesh",
  "File:Dirang Valley.jpg": "The Dirang Valley, Arunachal Pradesh",
  "File:Doodhsagar Fall.jpg": "Dudhsagar Falls, one of India's tallest waterfalls, Goa",
  "File:Kullu Valley near Manali, Himachal Pradesh, India.jpg": "The Kullu Valley north of Manali, Himachal Pradesh",
  "File:Kochi, Fishing nets at sunset, Kerala, India.jpg": "Chinese fishing nets at sunset, Kochi, Kerala",
  "File:7th century Lakshmana Hindu temple, Sirpur Chhattisgarh India 1.jpg": "The brick Lakshmana Temple at Sirpur, Chhattisgarh",
  "File:0010622 Ramgarh hills Puta Sitabhenga and Jogimara Caves Chattisgarh 012.jpg": "The Ramgarh hills, site of the Sitabengra and Jogimara caves, Chhattisgarh",
  "File:Kangch-Goechala.jpg": "Kangchenjunga from the Goecha La pass, Sikkim",
  "File:Tsongmo Lake or Changu Lake - East Sikkim.jpg": "Tsomgo (Changu) Lake near Gangtok",
  "File:Statue of Thiruvalluvar.jpg": "The 41-metre statue of the poet Thiruvalluvar, Kanyakumari",
  "File:Badrinath temple DSCN9998.jpg": "Badrinath Temple, Uttarakhand",
  "File:Valley of flowers national park, Uttarakhand, India 03 (edit).jpg": "The Valley of Flowers National Park, Uttarakhand",
  "File:Victoria Memorial situated in Kolkata.jpg": "The Victoria Memorial, Kolkata, built between 1906 and 1921",
  "File:The Coral Reef at the Andaman Islands.jpg": "A coral reef off Havelock Island, Andaman",
  "File:Ross Island (Netaji Subhas Bose Island).jpg": "Ross Island, Andaman",
  "File:Dal Lake Hazratbal Srinagar.jpg": "The Char Chinar island in Dal Lake, Srinagar",
  "File:Thajiwas Park, Sonamarg, Jammu and Kashmir, India.jpg": "Thajiwas, above Sonamarg, Jammu and Kashmir",
  "File:Rashrapati Bhavan in September 2024.jpg": "Rashtrapati Bhavan, the official residence of the President of India",
  "File:Fateh burj 4.jpg": "The Fateh Burj at Chappar Chiri, Punjab",
  "File:The sacred idols of God Pakhangba and his divine consort kept inside the Pakhangba Temple in the Kangla Fort in Imphal.jpg": "Idols of Pakhangba and his consort in the Kangla Fort, Imphal",
  "File:India Tree.jpg": "Coconut palms on Agatti, Lakshadweep",
  "File:Jaisalmer forteresse.jpg": "Jaisalmer Fort",
  "File:Resting places.jpg": "The cenotaphs of Bada Bagh, Jaisalmer",
  "File:Jagdish Temple Udaipur.jpg": "Jagdish Temple, Udaipur",
  "File:Udaipur, India, Jag Mandir Palace.jpg": "Jag Mandir palace on Lake Pichola, Udaipur",
  "File:Monsoon Palace, Udaipur.jpg": "Sajjangarh (the Monsoon Palace), Udaipur",
  "File:Rishabhdeo Jain temple (9710280717).jpg": "The Rishabhdeo Jain temple near Udaipur",
  "File:India - Ladakh - Leh - 053 - flower fields outside my guesthouse (3844435507).jpg": "Fields outside Leh in summer",
  "File:1000 Year loop.jpg": "The Spiti Valley at dusk",
  "File:Tabo Monjastery Entrance.jpg": "Entrance to Tabo Monastery, Spiti",
  "File:MAHARAJA RANJIT SINGH STATUE-AMRITSAR-PUNJAB-10.jpg": "Statue of Maharaja Ranjit Singh, Amritsar",
  "File:Old Goa Church 01.jpg": "A church in Old Goa",
  "File:Ashapura Mata Tempe, Matano Madh, Kachchh.jpg": "Ashapura Mata Temple, Mata no Madh, Kutch",
  "File:Lakhpat Gurdwara 2014-01-27 13-07.jpg": "The gurdwara at Lakhpat, Kutch",
  "File:Haji Peer Dargah from backsyd - panoramio.jpg": "Haji Pir dargah, Kutch",
  "File:Caravan 1.jpg": "A camel caravan near Mundra, Kutch",
  "File:Alleppey beach.jpg": "Alappuzha Beach and its old pier",
  "File:Jain-temple-alleppey.jpg": "Jain temple, Alappuzha",
  "File:Our Lady of Mount Carmel Cathedral.jpg": "Our Lady of Mount Carmel Cathedral, Alappuzha",
  "File:Abbey Falls New.jpg": "Abbey Falls, Kodagu",
  "File:Krishna Butterball Below Mahabalipuram Sep22 A7C 02490.jpg": "Krishna's Butterball, a balanced granite boulder at Mahabalipuram",
  "File:Five Rathas at Mahaballipuram,Tamil Nadu.jpg": "The Five Rathas, Mahabalipuram",
  "File:Mamallapuram, Shore Temple, India.jpg": "The Shore Temple, Mahabalipuram",
  "File:Dry fruits being sold at Khari Baoli market in Old Delhi.jpg": "Dry fruit sellers at Khari Baoli, Chandni Chowk, Old Delhi",
  "File:Connaught Place New Delhi.jpg": "Connaught Place, New Delhi",
  "File:Scenic View of Rishikesh with Ganga River and Hills in Background.jpg": "Morning light over the Ganga and the hills at Rishikesh",
  "File:Chhatrapati Shivaji Maharaj Vastu Sangrahalaya.jpg": "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya, Mumbai",
  "File:Hotel The Taj Mahal Palace (cropped).jpg": "The Taj Mahal Palace hotel beside the Gateway of India, Mumbai",
  "File:Enchey Monastery in Gangtok district, East Sikkim.jpg": "Enchey Monastery, Gangtok",
  "File:Sambar Deer during Flood at Kaziranga National Park, North East India.jpg": "Sambar deer in the monsoon floods, Kaziranga",
  "File:Tiger. King. (39942477145).jpg": "A tiger in Kaziranga National Park",
  "File:Majuli - The largest river island.jpg": "Fishing nets on the Khekutia River, Majuli",
  "File:Mizoram Assembly House (wider view).jpg": "The Mizoram Legislative Assembly, Aizawl",
  "File:Mary Help of Christians Cathedral, Shillong – Front Side (2).jpg": "The Cathedral of Mary Help of Christians, Shillong",
  "File:BehdienKhlam Festival.jpg": "Behdienkhlam festival of the Pnar people, Meghalaya",
  "File:Ziro valley - a possible world heritage site.jpg": "The Ziro Valley, Arunachal Pradesh",
  "File:Bum La Pass.jpg": "Bum La Pass on the India-China border near Tawang",
  "File:Unakoti (Scorpian ad).JPG": "Unakoti hill, Tripura",
  "File:One afternoon at the Kanha National Park.jpg": "Kanha National Park on a February afternoon",
  "File:Indian Gaur at Kanha.jpg": "A gaur guarding its herd, Kanha Tiger Reserve",
  "File:Tiger (India) 665.jpg": "A tiger in Kanha Tiger Reserve",
  "File:Gadiya village road, Bastar Chhattisgarh India.jpg": "Ruins of the stone temple at Gadiya, Bastar",
  "File:Bison Horn Maria Tribal Bastar.jpg": "A Bison Horn Maria dancer, Bastar",
  "File:Juma masjid.jpg": "The mosque beside the granary, Gandikota",
  "File:Grand Canon of India (Gandikota).jpg": "The Gandikota gorge on the Penna River",
  "File:Hampi, India, Sri Krishna Temple, Ancient ruins of Hampi.jpg": "The pillared Krishna Temple, Hampi",
  "File:Hampi, India, Temple on top of Matanga Hill.jpg": "Matanga Hill, Hampi",
  "File:A sunrise over Vaigai River in Madurai Tamil Nadu India.jpg": "Sunrise over the Vaigai River, Madurai",
  "File:Indian Museum, Courtyard, Kolkata, India.jpg": "The Indian Museum, Kolkata",
  "File:Science City Kolkata 4643.JPG": "Science City, Kolkata",
  "File:Sundarban Tiger.jpg": "A Bengal tiger at the Sundarban Tiger Reserve, West Bengal",
  "File:Monkeys of The Sundarbans 07.jpg": "Monkeys at Karamjal, Sundarbans",
  "File:Vof13082010.jpg": "The Bhyundar Valley, Valley of Flowers, Chamoli",
  "File:\"Flowers Blossom at Valley of Flowers Chamoli, India\" 61.jpg": "Flowers blooming in the Valley of Flowers National Park",
  "File:48 kos parikrama.jpg": "Kurukshetra, centre of the 48 Kos pilgrimage circuit",
  "File:Road along Vasco-da-gama residence in Fontainhas, Panaji.jpg": "Portuguese-era houses in Fontainhas, Panaji, Goa",
  "File:Mangueshi Temple Goa.jpg": "Mangueshi Temple, Ponda, Goa",
  "File:Shri Jagannath temple.jpg": "Shri Jagannath Temple, Puri",
  "File:British Museum Asia 14.jpg": "Sculpture from the Amaravati Stupa, now in the British Museum",
  "File:Indian Grand Canyon Sudhakar Bichali.jpg": "The gorge of the Penna River at Gandikota, Andhra Pradesh",
  "File:A wintry morning in Vijaynagar.jpg": "A winter morning at Vijaynagar, Arunachal Pradesh",
  "File:DHOLAVIRA SITE (24).jpg": "The excavated Harappan city of Dholavira, Kutch",
  "File:Holy pic kkr.jpg": "Brahma Sarovar at Kurukshetra at sunset",
  "File:Sourabh475123 01.jpg": "Statue of Krishna and Arjuna's chariot at Kurukshetra",
  "File:IMGJagannathpur Temple.jpg": "Jagannathpur Temple, Ranchi",
  "File:Boathouse (7063399547).jpg": "A kettuvallam houseboat on the Kerala backwaters",
  "File:Dawki River, Meghalaya, India.jpg": "The Umngot River at Dawki, Meghalaya",
  "File:Taj Mahal (Edited).jpeg": "The Taj Mahal, Agra",
  "File:Delhi fort.jpg": "The Red Fort, Delhi",
  "File:Rasmancha Arnab Dutta 2011.JPG": "The Rasmancha temple at Bishnupur, West Bengal",
  "File:Entrance area of Ramnagar Fort.jpg": "Entrance to Ramnagar Fort, Varanasi",
  "File:Church of St. Francis of Assisi, Diu (with altar).jpg": "Church of St Francis of Assisi, Diu",
  "File:Unakoti 1.jpg": "Rock-cut relief at Unakoti, Tripura",
  "File:Unakoti 5.jpg": "Rock-cut figure of a Hindu deity at Unakoti, Tripura",
};
/** Extra reference subjects (Wikipedia titles) for entries whose own lists are thin. */
const refExtra: Record<string, string[]> = {
  diu: ["Diu Fort", "Naida Caves", "St. Paul's Church, Diu", "Nagoa Beach", "Gangeshwar Temple", "Panikota Fort", "Ghoghla Beach"],
};
/** Files kept for an entry even though several entries share them (a festival photo taken in that state). */
const refAllow: Record<string, string[]> = {
  "state-west-bengal": ["File:বাগবাজার সার্বজনীন দুর্গোৎসব ২০১৮.jpg"],
};
/** Entries that carry more than the usual six references. */
const refCount: Record<string, number> = { "state-west-bengal": 8, diu: 5, netarhat: 5 };
/** Files picked by hand from Commons search for entries whose articles have too few usable photos. */
const refPinned: Record<string, [string, string][]> = {
  sundarbans: [
    ["File:Dense Mangrove Forest of the Sundarban Tiger Reserve during High Tide, West Bengal, India 03.jpg", "Mangrove forest at high tide, Sundarban Tiger Reserve"],
    ["File:Sundarban Mudflats during low tide, Sundarban Tiger Reserve, West Bengal, India 02.jpg", "Mudflats at low tide, Sundarban Tiger Reserve"],
    ["File:Tourist Boat in Sundarbans, West Bengal, India 03.jpg", "A tourist boat on a creek in the Sundarbans"],
  ],
  "state-west-bengal": [["File:বাগবাজার সার্বজনীন দুর্গোৎসব ২০১৮.jpg", "A Durga Puja pandal at Bagbazar, Kolkata"]],
  netarhat: [
    ["File:Sunset in netarhatt, jharkhand.jpg", "Sunset over the hills at Netarhat"],
    ["File:View of netarhat from 8th seat.jpg", "Buildings on the Netarhat plateau"],
    ["File:Netarhat pine forest.jpg", "Pine forest at Netarhat"],
    ["File:Hill station of jharkhand,Netarhat.jpg", "The hill station of Netarhat, Jharkhand"],
  ],
  diu: [
    ["File:Diu Fortress, Jan. 2010.jpg", "The ramparts of Diu Fort facing the Arabian Sea"],
    ["File:Diu Fort Sea View.JPG", "The sea from the walls of Diu Fort"],
    ["File:St. Paul Church - Diu - 006.jpg", "St Paul's Church, Diu"],
    ["File:Naida caves in diu , india.jpg", "The Naida Caves, Diu"],
    ["File:Diu IMG.jpg", "The gateway of Diu Fort"],
  ],
};

// ---------------------------------------------------------------- content slots

const destinations = [...northDestinations, ...westSouthDestinations, ...eastIslandDestinations, ...northeastDestinations];
const stateName = (slug: string) => states.find((state) => state.slug === slug)?.name ?? "";
const overrides: Record<string, string | null> = JSON.parse(readFileSync(join(root, "scripts/image-overrides.json"), "utf8"));
const unescoFile = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

interface Slot {
  key: string;
  folder: string;
  file: string;
  width: number;
  landscape: boolean;
  alt: string;
  /** Wikipedia titles whose images show this subject. */
  titles: string[];
  /** Commons search terms. */
  search: string;
}

const subject = (key: string, title: string) => {
  const override = overrides[key];
  if (typeof override === "string" && !override.startsWith("search:")) return [override, title];
  return [title];
};
const searchFor = (key: string, fallback: string) => {
  const override = overrides[key];
  return typeof override === "string" && override.startsWith("search:") ? override.slice(7) : fallback;
};

const slots: Slot[] = [
  ...destinations.flatMap((item) => {
    const place = `${item.name}, ${stateName(item.stateSlug)}`;
    return [
      { key: `destination:${item.slug}`, folder: "destinations", file: item.slug, width: 1600, landscape: true, alt: place, titles: subject(`destination:${item.slug}`, item.wikipediaTitle), search: searchFor(`destination:${item.slug}`, item.name) },
      { key: `gallery:${item.slug}-2`, folder: "gallery", file: `${item.slug}-2`, width: 1200, landscape: false, alt: place, titles: [item.wikipediaTitle, ...item.attractions.slice(0, 2).map((a) => a.name)], search: searchFor(`gallery:${item.slug}-2`, `${item.name} ${stateName(item.stateSlug)}`) },
    ];
  }),
  ...states.map((item) => ({ key: `state:${item.slug}`, folder: "states", file: item.slug, width: 1400, landscape: true, alt: item.name, titles: subject(`state:${item.slug}`, item.wikipediaTitle), search: item.name })),
  ...festivals.map((item) => ({ key: `festival:${item.slug}`, folder: "festivals", file: item.slug, width: 1200, landscape: true, alt: `${item.name} celebrations`, titles: [item.wikipediaTitle], search: searchFor(`festival:${item.slug}`, `${item.name} festival`) })),
  ...foods.map((item) => ({ key: `food:${item.slug}`, folder: "food", file: item.slug, width: 1000, landscape: false, alt: `${item.name}, served`, titles: [item.wikipediaTitle], search: searchFor(`food:${item.slug}`, item.name) })),
  ...unescoSites.map((item) => ({ key: `unesco:${unescoFile(item.name)}`, folder: "unesco", file: unescoFile(item.name), width: 1000, landscape: true, alt: item.name, titles: subject(`unesco:${unescoFile(item.name)}`, item.wikipediaTitle), search: item.name })),
  ...stories.map((item) => ({ key: `story:${item.slug}`, folder: "stories", file: item.slug, width: 1400, landscape: true, alt: item.title, titles: subject(`story:${item.slug}`, item.wikipediaTitle), search: searchFor(`story:${item.slug}`, item.wikipediaTitle) })),
];

type RefKind = "landmark" | "article" | "culture" | "food" | "search";

interface Entry {
  /** Key stem: `ref:<stem>-1`. */
  stem: string;
  name: string;
  article: string;
  /** [label, Wikipedia title, kind] for landmarks, culture and food. */
  subjects: [string, string, RefKind][];
  search: string;
}

const splitSummary = (line: string) =>
  line.split(/[:,;]| and /).map((part) => part.replace(/\(.*?\)/g, "").trim()).filter((part) => part.length > 2);
const tag = (kind: RefKind) => (name: string): [string, string, RefKind] => [name, name, kind];

const entries: Entry[] = [
  ...states.map((item) => ({
    stem: `state-${item.slug}`,
    name: item.name,
    article: item.wikipediaTitle,
    subjects: [
      ...item.attractionsSummary.flatMap(splitSummary).map(tag("landmark")),
      ...(refExtra[`state-${item.slug}`] ?? []).map(tag("landmark")),
      ...item.festivals.map(tag("culture")),
      ...item.cuisine.map(tag("food")),
    ],
    search: item.name,
  })),
  ...destinations.map((item) => ({
    stem: item.slug,
    name: item.name,
    article: item.wikipediaTitle,
    subjects: [
      ...item.attractions.map((a): [string, string, RefKind] => [a.name, a.name.replace(/\s*\(.*?\)/g, ""), "landmark"]),
      ...(refExtra[item.slug] ?? []).map(tag("landmark")),
      ...item.festivals.map(tag("culture")),
    ],
    search: `${item.name} ${stateName(item.stateSlug)}`,
  })),
];

// ---------------------------------------------------------------- Commons helpers

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string): Promise<Response> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      if (response.status !== 429 && response.status < 500) return response;
      await sleep(5000 * (attempt + 1));
    } catch {
      await sleep(3000 * (attempt + 1));
    }
  }
  throw new Error(`Gave up on ${url}`);
}

/** MediaWiki responses are read loosely; every field used is checked before use. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiJson = Record<string, any>;

async function api(host: string, params: Record<string, string>) {
  const query = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  const response = await fetchWithRetry(`https://${host}/w/api.php?${query}`);
  await sleep(150);
  return response.json() as Promise<ApiJson>;
}

const FREE = /^(cc0|cc[ -]by([ -]sa)?([ -]\d(\.\d)?)?|public domain|pd\b|pd-)/i;
const SKIP_NAME = /(collage|montage|clockwise|map\b|map[ _.]|locator|flag|logo|seal|emblem|coat[ _]of|icon|commons-|wiki|diagram|chart|stamp|banner|symbol|portrait|signature|\.svg|\.gif|\.tif|\.webm|\.ogv|\.ogg|\.pdf|\.png)/i;

const stripHtml = (value = "") =>
  value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export interface FileInfo {
  title: string;
  width: number;
  height: number;
  thumb: string;
  license: string;
  licenseUrl?: string;
  author: string;
  sourceUrl: string;
  description: string;
  free: boolean;
}

const infoCache = new Map<string, FileInfo | null>();
const normal = (name: string) => (name.startsWith("File:") ? name : `File:${name}`).replace(/_/g, " ");

/** Image details for many files, 50 per request. Thumb is the 330 px preview. */
async function fileInfo(names: string[]): Promise<Map<string, FileInfo>> {
  const wanted = [...new Set(names.map(normal))].filter((name) => !infoCache.has(name));
  for (let index = 0; index < wanted.length; index += 50) {
    const batch = wanted.slice(index, index + 50);
    const data = await api("commons.wikimedia.org", {
      action: "query", titles: batch.join("|"), prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: "330",
      iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|ImageDescription|NonFree",
    });
    const pages: ApiJson[] = data.query?.pages ?? [];
    const renamed = new Map<string, string>();
    for (const item of data.query?.normalized ?? []) renamed.set(item.to, item.from);
    for (const page of pages) {
      const image = page.imageinfo?.[0];
      const title = page.title as string;
      if (!image) { infoCache.set(title, null); continue; }
      const meta = image.extmetadata ?? {};
      const text = (key: string) => (typeof meta[key]?.value === "string" ? meta[key].value : "");
      const license = stripHtml(text("LicenseShortName"));
      infoCache.set(title, {
        title,
        width: image.width,
        height: image.height,
        thumb: image.thumburl ?? image.url,
        license,
        licenseUrl: text("LicenseUrl") || undefined,
        author: cleanAuthor(stripHtml(text("Artist"))),
        sourceUrl: image.descriptionurl,
        description: stripHtml(text("ImageDescription")),
        free: FREE.test(license) && meta.NonFree?.value !== "true" && meta.NonFree?.value !== true,
      });
    }
    for (const name of batch) if (!infoCache.has(name)) infoCache.set(name, null);
  }
  const result = new Map<string, FileInfo>();
  for (const name of names.map(normal)) {
    const info = infoCache.get(name);
    if (info) result.set(name, info);
  }
  return result;
}

/** Article images in the order they appear on the page. */
async function articleImages(title: string): Promise<string[]> {
  const data = await api("en.wikipedia.org", { action: "parse", page: title, redirects: "1", prop: "images" });
  return ((data.parse?.images ?? []) as string[]).map((name) => normal(name));
}

/** The lead image of each article, in input order. */
async function leadImages(titles: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (let index = 0; index < titles.length; index += 40) {
    const batch = titles.slice(index, index + 40);
    const data = await api("en.wikipedia.org", { action: "query", titles: batch.join("|"), redirects: "1", prop: "pageimages", piprop: "name" });
    const alias = new Map<string, string>();
    for (const item of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) alias.set(item.to, alias.get(item.from) ?? item.from);
    for (const page of data.query?.pages ?? []) {
      if (!page.pageimage) continue;
      const asked = alias.get(page.title) ?? page.title;
      result.set(asked, normal(page.pageimage));
      result.set(page.title, normal(page.pageimage));
    }
  }
  return result;
}

async function searchCommons(terms: string, minWidth: number, limit = 20): Promise<string[]> {
  const data = await api("commons.wikimedia.org", {
    action: "query", list: "search", srnamespace: "6", srlimit: String(limit), srsearch: `${terms} filew:>${minWidth - 1} filetype:bitmap`,
  });
  return ((data.query?.search ?? []) as { title: string }[]).map((item) => item.title);
}

const usable = (name: string) => /\.jpe?g$/i.test(name) && !SKIP_NAME.test(name.replace(/^File:/, ""));

/** A Commons description cleaned into a caption, or undefined when it does not read as one. */
export function cleanCaption(description: string): string | undefined {
  let text = description
    .replace(/^(english|en)\s*:\s*/i, "")
    .replace(/\b(Deutsch|Français|Español|Italiano|Русский|हिन्दी|বাংলা)\s*:.*$/i, "")
    .replace(/\s*\(\s*\)/g, "")
    .trim();
  // Split at the first full stop that ends a word of three letters or more, so "c. 1600" stays whole.
  text = text.split(/(?<=[A-Za-z0-9)]{3}[.!?])\s/)[0]?.trim() ?? "";
  if (text.length < 12 || text.length > 170) return undefined;
  if (/[^\x20-\x7EÀ-ſ–—‘-”]/.test(text)) return undefined;
  if (/own work|uploaded|wikimedia|flickr|camera|\bdsc|img[_ ]?\d|photograph(ed)? by|this is a photo|wiki loves|^\d+$/i.test(text)) return undefined;
  text = text.replace(/[.\s]+$/, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------------------------------------------------------------- image processing

/** Gentle lift: a touch more saturation and contrast around mid-grey, no crushed shadows. */
export function enhance(image: sharp.Sharp) {
  return image.modulate({ saturation: 1.06 }).linear(1.06, -7);
}

/** Commons serves standard thumbnail steps; ask for one and resize here. */
const thumbAt = (thumb330: string, info: FileInfo, width: number) => {
  const step = [960, 1280, 1920, 3840].find((value) => value >= width) ?? 1920;
  if (info.width <= step) return null;
  return thumb330.replace(/\/330px-/, `/${step}px-`);
};

async function originalOrThumb(info: FileInfo, width: number): Promise<Buffer> {
  const thumb = thumbAt(info.thumb, info, width);
  let url = thumb;
  if (!url) {
    // Small original: fetch the original file itself.
    const data = await api("commons.wikimedia.org", { action: "query", titles: info.title, prop: "imageinfo", iiprop: "url" });
    url = data.query.pages[0].imageinfo[0].url as string;
  }
  const response = await fetchWithRetry(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  await sleep(250);
  return Buffer.from(await response.arrayBuffer());
}

async function render(input: Buffer, width: number) {
  const output = await enhance(sharp(input, { limitInputPixels: false }).rotate().resize({ width, withoutEnlargement: true }))
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });
  const blur = await sharp(output.data).resize(16).webp({ quality: 40 }).toBuffer();
  return { data: output.data, width: output.info.width, height: output.info.height, blur: `data:image/webp;base64,${blur.toString("base64")}` };
}

async function preview(info: FileInfo): Promise<string> {
  const path = join(cache, "thumbs", `${createHash("md5").update(info.title).digest("hex")}.jpg`);
  if (!existsSync(path)) {
    const response = await fetchWithRetry(info.thumb);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
    await sleep(120);
  }
  return path;
}

// ---------------------------------------------------------------- manifest

type Manifest = Record<string, Record<string, unknown> & { src: string; sourceUrl: string; alt: string }>;
const readManifest = (): Manifest => JSON.parse(readFileSync(manifestPath, "utf8"));
const titleFromUrl = (url: string) => normal(decodeURIComponent(url.replace(/^.*\/wiki\//, "")));
const readCache = <T,>(name: string): T => JSON.parse(readFileSync(join(cache, name), "utf8"));
const writeCache = (name: string, value: unknown) => writeFileSync(join(cache, name), JSON.stringify(value, null, 1));

// ---------------------------------------------------------------- phases

async function widthsPhase() {
  const manifest = readManifest();
  const keys = Object.keys(manifest).filter((key) => !key.startsWith("hero:"));
  const infos = await fileInfo(keys.map((key) => titleFromUrl(manifest[key].sourceUrl)));
  const widths: Record<string, { title: string; width: number; height: number }> = {};
  for (const key of keys) {
    const title = titleFromUrl(manifest[key].sourceUrl);
    const info = infos.get(title);
    widths[key] = { title, width: info?.width ?? 0, height: info?.height ?? 0 };
  }
  writeCache("widths.json", widths);
  const values = Object.values(widths).map((item) => item.width).sort((a, b) => a - b);
  console.log(`${values.length} files; widths ${values[0]}–${values.at(-1)}; under ${GOOD_WIDTH}: ${values.filter((v) => v < GOOD_WIDTH).length}`);
}

interface Proposal { key: string; current?: string; currentWidth: number; candidates: FileInfo[] }

async function proposePhase() {
  const manifest = readManifest();
  const widths = readCache<Record<string, { title: string; width: number }>>("widths.json");
  const used = new Set(Object.values(manifest).map((item) => titleFromUrl(item.sourceUrl)));
  const proposals: Proposal[] = [];
  for (const slot of slots) {
    if (only && !slot.key.startsWith(only)) continue;
    const current = widths[slot.key];
    if (current && current.width >= GOOD_WIDTH) continue;
    const names: string[] = pinned[slot.key] ? [normal(pinned[slot.key])] : [];
    for (const title of slot.titles) {
      try {
        const lead = await leadImages([title]);
        names.push(...lead.values());
        names.push(...(await articleImages(title)));
      } catch { /* missing article */ }
    }
    // Empty slots accept smaller originals: any good photo beats none.
    const minWidth = current ? Math.max(GOOD_WIDTH, Math.round(current.width * 1.4)) : 1600;
    names.push(...(await searchCommons(slot.search, minWidth)));
    const infos = await fileInfo([...new Set(names)].filter(usable));
    const candidates = [...new Set(names.map(normal))]
      .map((name) => infos.get(name))
      .filter((info): info is FileInfo => Boolean(info))
      .filter((info) => info.free && info.width >= minWidth && (!used.has(info.title) || info.title === current?.title))
      .filter((info) => (slot.landscape ? info.width >= info.height * 1.25 : info.height <= info.width * 1.5))
      .filter((info) => info.title !== current?.title)
      .slice(0, 3);
    if (candidates.length || !current) {
      proposals.push({ key: slot.key, current: current?.title, currentWidth: current?.width ?? 0, candidates });
      for (const candidate of candidates) await preview(candidate);
    }
    console.log(`${slot.key}: ${current ? current.width : "empty"} -> ${candidates.map((c) => c.width).join(", ") || "none"}`);
  }
  writeCache("proposals.json", proposals);
}

interface RefCandidate { info: FileInfo; label: string; kind: RefKind; caption: string }

/** Plans, sections, satellite views and atlas pages are not photographs of the place. */
const NOT_A_PHOTO = /\bplan\b|section|grundriss|ISS0\d\d|sheet-\d|compilation|elevation|drawing|engraving|sketch|lithograph|thumb\|/i;
/** Photos taken outside India that article galleries sometimes use for shared festivals and dishes. */
const ABROAD = /\b(nepal|janakpur|lalitpur|kathmandu|seoul|korea|damascus|syria|japan|osaka|chile|chilean|yellowstone|lauderdale|putrajaya|malaysia|samarkand|uzbekistan|pakistan|lahore|karachi|bangladesh|dhaka|indonesia|bali|singapore|london|usa|america|hawaii|wroc\u0142aw|bergianska|sweden|poland|germany|france|yap|shanghai|micronesia|bangladeshi)\b/i;

/** A readable name from a Commons file title, when the description gives no caption. */
function captionFromFileName(title: string): string | undefined {
  const text = title
    .replace(/^File:/, "")
    .replace(/\.[a-z]+$/i, "")
    .replace(/\((cropped|edited|edit)\)/gi, "")
    .replace(/\(\d+\)/g, "")
    .replace(/\b(IMG|DSC|DSCN|DSCF|P)[_ -]?\d+\b/gi, "")
    .replace(/\b\d{4}[-_ ]?\d{2}[-_ ]?\d{2}\b|\b\d{6,}\b/g, "")
    .replace(/\s+-\s+Flickr.*$/i, "")
    .replace(/_+/g, " ")
    .replace(/\s*\d+$/, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s,.-]+|[\s,.-]+$/g, "");
  if (text.split(" ").length < 2 || text.length > 110 || /[^\x20-\x7EÀ-ſ]/.test(text)) return undefined;
  return text;
}

const WEAK_CAPTION = /^(this|the) (photo|image|picture|photograph)|^(i|we) |^captured|^clicked|^taken |^shots? |^just |^perhaps|^a higher|^a dead tree|^adjescent|^weddings? by|^view of earth|^#|photo has been taken|^entrance view$|^the old and the new$|note:|thumb\|/i;

/** The caption shown under a reference image and used as its alt text. */
export function captionFor(info: FileInfo, label: string, entryName: string): string {
  if (captionFix[info.title]) return captionFix[info.title];
  const described = cleanCaption(info.description);
  const fromName = captionFromFileName(info.title);
  let caption = described && !WEAK_CAPTION.test(described) && described.toLowerCase() !== entryName.toLowerCase() ? described : undefined;
  caption ??= fromName ?? (label === entryName ? entryName : `${label}, ${entryName}`);
  const lower = caption.toLowerCase();
  const named = [entryName, label].some((value) => lower.includes(value.toLowerCase().split(/[ ,(]/)[0]));
  if (!named && caption.length < 80) caption = `${caption}, ${entryName}`;
  return caption.replace(/\s+,/g, ",").replace(/\s{2,}/g, " ");
}

/** Up to six references: four views of the place, then culture and food when found, then the rest. */
export function chooseRefs(list: RefCandidate[], generic: Set<string>, stem: string, lead = ""): RefCandidate[] {
  const allowed = new Set([...(refAllow[stem] ?? []), ...(refPinned[stem] ?? []).map(([title]) => normal(title))]);
  const count = refCount[stem] ?? REF_COUNT;
  // Files a reviewer picked by hand skip the automatic filters.
  const pool = list.filter(({ info }) =>
    info.title !== lead && !refRejected.has(info.title) &&
    (allowed.has(info.title) || (!generic.has(info.title) &&
      !NOT_A_PHOTO.test(`${info.title} ${info.description}`) && !ABROAD.test(`${info.title} ${info.description}`))));
  const chosen: RefCandidate[] = [];
  const take = (test: (item: RefCandidate) => boolean, limit: number) => {
    for (const item of pool) {
      if (chosen.length >= limit) return;
      if (!chosen.includes(item) && test(item)) chosen.push(item);
    }
  };
  take((item) => item.kind === "landmark" || item.kind === "article", 4);
  take((item) => allowed.has(item.info.title), chosen.length + allowed.size);
  take((item) => item.kind === "culture", chosen.length + 1);
  take((item) => item.kind === "food", chosen.length + 1);
  take(() => true, count);
  take((item) => allowed.has(item.info.title), count);
  return chosen.slice(0, count);
}

/** Puts an entry's hand-picked files ahead of the searched candidates. */
async function withPinned(stem: string, list: RefCandidate[]): Promise<RefCandidate[]> {
  const picks = refPinned[stem] ?? [];
  if (!picks.length) return list;
  const infos = await fileInfo(picks.map(([title]) => title));
  const pinnedItems = picks.flatMap(([title, caption]): RefCandidate[] => {
    const info = infos.get(normal(title));
    if (info?.free) captionFix[info.title] ??= caption;
    return info?.free ? [{ info, label: caption, kind: "landmark", caption }] : [];
  });
  const titles = new Set(pinnedItems.map((item) => item.info.title));
  return [...pinnedItems, ...list.filter((item) => !titles.has(item.info.title))];
}

/** Files offered to three or more entries are generic festival or dish photos, not of the place. */
export function genericFiles(refs: Record<string, RefCandidate[]>): Set<string> {
  const counts = new Map<string, number>();
  for (const list of Object.values(refs)) for (const item of list) counts.set(item.info.title, (counts.get(item.info.title) ?? 0) + 1);
  return new Set([...counts].filter(([, count]) => count >= 3).map(([title]) => title));
}

async function refsPhase() {
  const manifest = readManifest();
  const out: Record<string, RefCandidate[]> = {};
  const previous = existsSync(join(cache, "refs.json")) ? readCache<Record<string, RefCandidate[]>>("refs.json") : {};
  for (const entry of entries) {
    if (only && !entry.stem.startsWith(only)) { if (previous[entry.stem]) out[entry.stem] = previous[entry.stem]; continue; }
    const leadKey = entry.stem.startsWith("state-") ? `state:${entry.stem.slice(6)}` : `destination:${entry.stem}`;
    const lead = manifest[leadKey] ? titleFromUrl(manifest[leadKey].sourceUrl) : "";
    const leads = await leadImages([...new Set(entry.subjects.map(([, title]) => title))]);
    const article = (await articleImages(entry.article).catch(() => [])).filter(usable);
    const searched = await searchCommons(entry.search, 3000, 15);
    const subjectFiles = entry.subjects
      .map(([label, title, kind]): [string, string, RefKind] | null => (leads.get(title) ? [leads.get(title)!, label, kind] : null))
      .filter((x): x is [string, string, RefKind] => x !== null);
    // Landmarks interleaved with the article's own photographs, then culture, food and search results.
    const landmarks = subjectFiles.filter(([, , kind]) => kind === "landmark");
    const ordered: [string, string, RefKind][] = [];
    for (let index = 0; index < Math.max(landmarks.length, article.length); index += 1) {
      if (landmarks[index]) ordered.push(landmarks[index]);
      if (article[index]) ordered.push([article[index], entry.name, "article"]);
    }
    ordered.push(...subjectFiles.filter(([, , kind]) => kind !== "landmark"));
    ordered.push(...searched.map((name): [string, string, RefKind] => [normal(name), entry.name, "search"]));
    const infos = await fileInfo(ordered.map(([name]) => name).filter(usable));
    const seen = new Set<string>([lead]);
    const picked: RefCandidate[] = [];
    for (const [name, label, kind] of ordered) {
      const info = infos.get(normal(name));
      if (!info || seen.has(info.title) || !info.free) continue;
      if (NOT_A_PHOTO.test(`${info.title} ${info.description}`) || ABROAD.test(`${info.title} ${info.description}`)) continue;
      if (info.width < 1600 || info.width < info.height * 0.6 || info.width > info.height * 2.6) continue;
      seen.add(info.title);
      picked.push({ info, label, kind, caption: captionFor(info, label, entry.name) });
      if (picked.length >= 16) break;
    }
    out[entry.stem] = picked;
    console.log(`${entry.stem}: ${picked.length} candidates`);
  }
  writeCache("refs.json", out);
}

async function tile(path: string | undefined, width: number, height: number, label: string) {
  const text = label.replace(/[<>&]/g, "").slice(0, 34);
  const base = path && existsSync(path)
    ? await sharp(path).resize(width, height, { fit: "cover" }).toBuffer()
    : await sharp({ create: { width, height, channels: 3, background: "#ddd" } }).png().toBuffer();
  const svg = Buffer.from(`<svg width="${width}" height="${height}"><rect x="0" y="${height - 18}" width="${width}" height="18" fill="black" opacity="0.7"/><text x="4" y="${height - 5}" font-family="Arial" font-size="12" fill="white">${text}</text></svg>`);
  return sharp(base).composite([{ input: svg }]).jpeg().toBuffer();
}

async function sheetsPhase() {
  const W = 300, H = 200;
  const proposals = existsSync(join(cache, "proposals.json")) ? readCache<Proposal[]>("proposals.json") : [];
  const manifest = readManifest();
  const rows: Buffer[][] = [];
  for (const proposal of proposals) {
    const current = manifest[proposal.key] ? join(root, "public", manifest[proposal.key].src) : undefined;
    const row = [await tile(current, W, H, `${proposal.key} ${proposal.currentWidth}`)];
    for (const [index, candidate] of proposal.candidates.entries()) row.push(await tile(await preview(candidate), W, H, `${index + 1}: ${candidate.width}px`));
    rows.push(row);
  }
  await writeSheets("upgrade", rows, W, H, 4, 8);

  const refs = existsSync(join(cache, "refs.json")) ? readCache<Record<string, RefCandidate[]>>("refs.json") : {};
  const refRows: Buffer[][] = [];
  const generic = genericFiles(refs);
  for (const [stem, found] of Object.entries(refs)) {
    if (only && !stem.startsWith(only)) continue;
    const list = await withPinned(stem, found);
    const row: Buffer[] = [];
    const leadKey = stem.startsWith("state-") ? `state:${stem.slice(6)}` : `destination:${stem}`;
    const lead = manifest[leadKey] ? titleFromUrl(manifest[leadKey].sourceUrl) : "";
    for (const item of chooseRefs(list, generic, stem, lead)) row.push(await tile(await preview(item.info), 240, 160, `${stem.slice(0, 16)} ${list.indexOf(item) + 1}${item.kind[0]}`));
    refRows.push(row);
  }
  await writeSheets("refs", refRows, 240, 160, 6, 10);
}

async function writeSheets(name: string, rows: Buffer[][], W: number, H: number, columns: number, perSheet: number) {
  for (let start = 0, sheet = 1; start < rows.length; start += perSheet, sheet += 1) {
    const chunk = rows.slice(start, start + perSheet);
    const composite = chunk.flatMap((row, y) => row.slice(0, columns).map((input, x) => ({ input, left: x * (W + 4), top: y * (H + 4) })));
    await sharp({ create: { width: columns * (W + 4), height: chunk.length * (H + 4), channels: 3, background: "#fff" } })
      .composite(composite).jpeg({ quality: 80 }).toFile(join(cache, `${name}-${String(sheet).padStart(2, "0")}.jpg`));
  }
  console.log(`${name}: ${rows.length} rows in ${Math.ceil(rows.length / perSheet)} sheets at ${cache}`);
}

async function applyPhase() {
  const manifest = readManifest();
  const widths = readCache<Record<string, { title: string; width: number }>>("widths.json");
  const proposals = new Map(readCache<Proposal[]>("proposals.json").map((item) => [item.key, item]));
  const refs = existsSync(join(cache, "refs.json")) ? readCache<Record<string, RefCandidate[]>>("refs.json") : {};
  const stats = { upgraded: 0, kept: 0, filled: 0, refs: 0, failed: [] as string[] };
  const save = () => writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
  const write = async (key: string, folder: string, file: string, width: number, info: FileInfo, alt: string) => {
    const output = await render(await originalOrThumb(info, width), width);
    const directory = join(root, "public/images", folder);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, `${file}.webp`), output.data);
    manifest[key] = {
      src: `/images/${folder}/${file}.webp`,
      width: output.width,
      height: output.height,
      sourceWidth: info.width,
      blur: output.blur,
      alt,
      author: info.author,
      license: info.license,
      licenseUrl: info.licenseUrl,
      sourceUrl: info.sourceUrl,
    };
  };

  const artWidth = (key: string) => (/-\d$/.test(key) ? 1200 : 1600);
  const allSlots: Slot[] = [
    ...slots,
    ...Object.keys(manifest).filter((key) => key.startsWith("art:")).map((key) => ({
      key, folder: "art", file: key.slice(4), width: artWidth(key), landscape: false, alt: manifest[key].alt, titles: [], search: "",
    })),
  ];
  let count = 0;
  const unknown = Object.keys(upgradeChoice).filter((key) => !allSlots.some((slot) => slot.key === key));
  if (unknown.length) throw new Error(`Choices for unknown slots: ${unknown.join(", ")}`);
  for (const slot of allSlots) {
    if (!matches(slot.key)) continue;
    try {
      const proposal = proposals.get(slot.key);
      const choice = upgradeChoice[slot.key] ?? 1;
      const candidate = typeof choice === "string"
        ? (await fileInfo([choice])).get(normal(choice))
        : proposal && choice > 0 ? proposal.candidates[choice - 1] : undefined;
      if (typeof choice === "string" && !candidate) throw new Error(`pinned file not found: ${choice}`);
      const existing = manifest[slot.key];
      if (candidate) {
        const owner = Object.entries(manifest).find(([key, item]) => key !== slot.key && !key.startsWith("ref:") && titleFromUrl(item.sourceUrl) === candidate.title);
        if (owner) throw new Error(`${candidate.title} is already used by ${owner[0]}`);
        await write(slot.key, slot.folder, slot.file, slot.width, candidate, altFor[slot.key] ?? existing?.alt ?? slot.alt);
        if (existing) stats.upgraded += 1; else stats.filled += 1;
      } else if (existing) {
        const title = widths[slot.key]?.title ?? titleFromUrl(existing.sourceUrl);
        const info = (await fileInfo([title])).get(title);
        if (!info) throw new Error(`no info for ${title}`);
        // Same photo, fetched fresh from the original and given the same gentle lift.
        await write(slot.key, slot.folder, slot.file, slot.width, info, existing.alt);
        stats.kept += 1;
      } else {
        stats.failed.push(slot.key);
      }
    } catch (error) {
      stats.failed.push(`${slot.key}: ${(error as Error).message}`);
    }
    count += 1;
    if (count % 10 === 0) { save(); console.log(`${count} slots…`); }
  }

  const generic = genericFiles(refs);
  const entryName = (stem: string) => entries.find((entry) => entry.stem === stem)?.name ?? stem;
  for (const [stem, found] of Object.entries(refs)) {
    if (!matches(`ref:${stem}-`)) continue;
    const list = await withPinned(stem, found);
    for (const key of Object.keys(manifest)) if (new RegExp(`^ref:${stem}-\\d$`).test(key)) delete manifest[key];
    const leadKey = stem.startsWith("state-") ? `state:${stem.slice(6)}` : `destination:${stem}`;
    const lead = manifest[leadKey] ? titleFromUrl(manifest[leadKey].sourceUrl) : "";
    const chosen = chooseRefs(list, generic, stem, lead);
    for (const [index, item] of chosen.entries()) {
      try {
        const caption = captionFor(item.info, item.label, entryName(stem));
        await write(`ref:${stem}-${index + 1}`, "ref", `${stem}-${index + 1}`, REF_WIDTH, item.info, caption);
        stats.refs += 1;
      } catch (error) {
        stats.failed.push(`ref:${stem}-${index + 1}: ${(error as Error).message}`);
      }
    }
    // Drop files left over from an earlier, longer set.
    for (let index = chosen.length + 1; index <= 8; index += 1) rmSync(join(root, "public/images/ref", `${stem}-${index}.webp`), { force: true });
    save();
    console.log(`refs ${stem}: ${chosen.length}`);
  }
  save();
  console.log(JSON.stringify(stats, null, 1));
}

const phases: Record<string, () => Promise<void>> = { widths: widthsPhase, propose: proposePhase, refs: refsPhase, sheets: sheetsPhase, apply: applyPhase };
if (phase && phases[phase]) await phases[phase]();
else if (phase) console.log(`Unknown phase. Use one of: ${Object.keys(phases).join(", ")}`);
