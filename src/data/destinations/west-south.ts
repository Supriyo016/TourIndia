import type { Destination } from "@/types/content";

export const westSouthDestinations: Destination[] = [
  {
    slug: "goa",
    name: "Goa",
    stateSlug: "goa",
    region: "west",
    tagline: "A small coastal state of long beaches, Portuguese-era churches, Hindu temples and a slower pace than most of India.",
    categories: ["beaches", "religious", "cultural", "weekend"],
    coordinates: { lat: 15.4909, lng: 73.8278 },
    wikipediaTitle: "Goa",
    popular: true,
    hiddenGem: false,
    overview: [
      "Goa sits on the Konkan coast between Maharashtra and Karnataka, with the Western Ghats forming its eastern edge and roughly a hundred kilometres of Arabian Sea shoreline. It is India's smallest state by area, yet it packs in estuaries, laterite plateaus, spice-growing valleys and a coastline that changes character from north to south.",
      "The north is the busier half. Baga, Calangute, Anjuna and Vagator have the most shacks, nightlife and traffic, while Morjim, Ashwem and Arambol are quieter. The south, around Colva, Agonda, Palolem and Patnem, has wider and calmer beaches and smaller guesthouses. Panaji, the capital, and the old Portuguese-era quarter of Fontainhas make a useful base for people who want food, churches and walking rather than a beach.",
      "Inland Goa is easy to overlook. Old Goa holds the Basilica of Bom Jesus and the Se Cathedral, both part of a UNESCO-listed group of churches and convents. Hindu temples such as those at Ponda reflect a different architectural tradition, with lamp towers and tiered roofs. Spice plantations, the Mhadei and Netravali wildlife areas and the Dudhsagar waterfall offer a break from the coast.",
      "Visitors should expect a very seasonal place. From about November to March the sea is calm, temporary beach shacks are open and the weather is dry. During the monsoon the sea is rough, many shacks are dismantled, and swimming is restricted at most beaches, but the state turns green and prices fall sharply."
    ],
    history: [
      "Goa's recorded history includes the Kadamba dynasty, which ruled from roughly the 11th century, followed by the Vijayanagara empire and the Bahmani and Adil Shahi sultanates. The Portuguese took Goa city in 1510 and held the territory far longer than the British held most of India. Old Goa became the capital of Portuguese India and a major centre for Catholic missionary work in Asia.",
      "India became independent in 1947, but Portugal refused to leave its Indian possessions. In December 1961 the Indian armed forces took Goa, Daman and Diu in a short operation, and Goa was administered as a union territory before becoming a state in 1987. Konkani, the local language, was recognised as an official language of the state at that time.",
      "The Portuguese legacy is still visible in surnames, Catholic festivals, the Latin-quarter houses of Panaji, and in cooking that uses vinegar, pork and coconut together. Hindu and Catholic traditions coexist here, and many families have roots in both."
    ],
    attractions: [
      {
        name: "Basilica of Bom Jesus and Se Cathedral, Old Goa",
        description: "The basilica holds the remains of St Francis Xavier and is a working place of worship as well as a UNESCO-listed monument. The Se Cathedral nearby is one of the largest churches in Asia. Dress modestly and keep voices low during services.",
        visitHours: 2.5,
        coordinates: { lat: 15.5009, lng: 73.9116 },
        interests: ["history", "spiritual", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Fontainhas, Panaji",
        description: "A residential Latin quarter of narrow lanes and painted houses with balconies, chapels and small bakeries. It is a place where people live, so keep noise down and ask before photographing doorways and residents.",
        visitHours: 1.5,
        coordinates: { lat: 15.4960, lng: 73.8350 },
        interests: ["culture", "photography", "food"],
        timeOfDay: "morning"
      },
      {
        name: "Fort Aguada",
        description: "A 17th-century Portuguese fort on the headland at the mouth of the Mandovi river, with ramparts, a lighthouse and wide sea views. It is a short, mostly level walk, though some ramparts have uneven stone.",
        visitHours: 1.5,
        coordinates: { lat: 15.4925, lng: 73.7737 },
        interests: ["history", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Palolem and Agonda beaches",
        description: "Two long crescent beaches in the south. Palolem has more cafes and boat trips; Agonda is quieter and is a nesting area for Olive Ridley turtles, so keep lights and dogs away from the sand at night in the season.",
        visitHours: 4,
        coordinates: { lat: 15.0100, lng: 74.0232 },
        interests: ["relaxation", "nature"],
        timeOfDay: "any"
      },
      {
        name: "Chapora Fort",
        description: "A ruined laterite fort above the Chapora river, reached by a short but steep climb on loose ground. The views north along the coast are the reason to go.",
        visitHours: 1,
        coordinates: { lat: 15.6050, lng: 73.7366 },
        interests: ["history", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Spice plantation visit in the Ponda area",
        description: "Guided walks through pepper, cardamom, cashew and areca gardens, usually ending with a Goan lunch. Quality varies, so choose a farm that explains the crops and does not rush the tour.",
        visitHours: 3,
        interests: ["food", "nature", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [11, 12, 1, 2, 3],
    bestTimeNote: "November to February is dry and comfortable; December and early January are the busiest and most expensive weeks. March and April are hot and humid. The monsoon (June to September) brings heavy rain, rough seas and many closed shacks, though it suits travellers who want greenery and quiet.",
    recommendedDays: { min: 3, max: 6 },
    budget: {
      budget: [1800, 3000],
      midRange: [4500, 8000],
      comfort: [10000, 20000],
      assumptions: "Per person per day, assuming two people sharing a room, local meals, scooter or taxi hire for short trips and no flights. Peak weeks around Christmas and New Year can double room rates. Alcohol and activities such as water sports are extra."
    },
    gettingThere: {
      air: "Manohar International Airport at Mopa serves North Goa, and Dabolim airport (Goa International) is closer to the south and Panaji. Check which airport your flight uses before booking transfers, as the two are about an hour or more apart by road.",
      rail: "Konkan Railway trains stop at Madgaon (Margao) for the south, Thivim for the north and Karmali near Old Goa. Services from Mumbai, Pune, Bengaluru and Delhi are popular and book out well ahead in winter.",
      road: "National Highway 66 runs along the Konkan coast from Mumbai and Mangaluru, and highways from Pune and Belagavi climb through the Ghats. Overnight buses from Mumbai, Pune and Bengaluru are common.",
      local: "Scooters and motorbikes for rent are the usual way around, but accident rates are high and a valid licence plus a helmet are essential. Taxis are plentiful but often unmetered, so agree a fare first. App-cab coverage in Goa has been patchy, so check what is available at your arrival point."
    },
    accommodation: "Choices range from hostels and beach huts to heritage Portuguese-style homestays, villas and large resorts. North Goa has the widest range; the south is quieter and more spread out. Book early for December and January, and check that beach huts have proper security and fire exits.",
    cuisine: [
      { name: "Fish curry rice", note: "A coconut and kokum based curry served with rice, the everyday meal for many Goans." },
      { name: "Pork vindaloo and sorpotel", note: "Catholic Goan dishes with vinegar and spices, derived from Portuguese techniques; served at festivals and in family homes." },
      { name: "Bebinca", note: "A layered sweet of coconut milk, egg yolk and sugar, traditionally made for Christmas." },
      { name: "Ros omelette and pao", note: "A breakfast or snack of omelette in a spicy chickpea or chicken gravy with local bread." },
      { name: "Feni", note: "A local spirit distilled from cashew apple or coconut sap. Buy from licensed shops only." }
    ],
    festivals: ["Goa Carnival", "Christmas", "Ganesh Chaturthi", "Diwali", "Shigmo"],
    festivalSlugs: ["goa-carnival", "christmas", "ganesh-chaturthi", "diwali"],
    nearby: [
      { name: "Dudhsagar Falls", distanceKm: 60, note: "Four-tiered waterfall on the Karnataka border, reached by jeep from Kulem or Castle Rock. Access rules and seasons change, so check locally." },
      { name: "Gokarna", distanceKm: 150, note: "Karnataka temple town with quieter beaches to the south, reached by road or the Konkan line." },
      { name: "Hampi", distanceKm: 340, note: "Ruins of the Vijayanagara capital in Karnataka, an overnight journey by road or rail via Hosapete.", destinationSlug: "hampi" },
      { name: "Mumbai", distanceKm: 590, note: "The usual long-haul connection by train, bus or flight.", destinationSlug: "mumbai" }
    ],
    precautions: [
      "Swim only where lifeguards (Drishti) are on duty and obey red flags; rip currents drown visitors every season, and swimming after drinking is a common factor.",
      "Do not drive a scooter without a licence, helmet and insurance. Roads are narrow, poorly lit at night and shared with cattle and buses.",
      "Check the legal position before buying alcohol or taking it out of the state; carrying it into neighbouring dry areas can be an offence.",
      "Use licensed taxis and agree prices beforehand. Be cautious with unsolicited offers of drugs or tours at beaches; drug possession carries serious penalties in India."
    ],
    tips: [
      "Visit churches and temples before midday, when it is cooler and quieter, and keep beach time for the afternoon.",
      "Stay inland or in the south if you want quiet; the Calangute to Baga stretch is loud late into the night in season.",
      "Do not photograph worshippers at services without permission, and remove footwear at temples.",
      "Book Konkan Railway tickets as early as the booking window allows for December travel."
    ],
    accessibility: "Beaches have soft sand and few ramps. Old Goa's main churches have steps at the entrances, and Fort Aguada and Chapora involve uneven paths and slopes. I could not confirm step-free access at individual sites; ask your hotel to check before you commit.",
    responsibleTravel: "Do not leave litter on the beach or hire jet-skis near turtle nesting areas. Support family-run guesthouses and Goan-owned restaurants, bargain politely, and avoid drinking in public spaces where it offends residents. Respect church dress codes and keep distance from nesting and roosting wildlife.",
    faqs: [
      { question: "Is Goa safe for solo travellers?", answer: "Many people travel alone in Goa without trouble, but the usual precautions apply: stay on lit roads at night, avoid isolated beaches after dark, keep drinks in sight and be wary of drink-driving. Women travelling alone report mixed experiences, so choose accommodation with good reviews and use registered taxis." },
      { question: "Which is better, North or South Goa?", answer: "North Goa has more nightlife, markets and water sports and is busier. South Goa is calmer, with longer beaches and a more spread-out feel. Choose by the type of stay you want, not by reputation." },
      { question: "Is Goa worth visiting in the monsoon?", answer: "Yes for some people. Seas are too rough for swimming, many shacks close and some boat trips stop, but rainfall is steady rather than constant, the countryside is green and rooms cost much less. Waterfalls and Old Goa are at their most atmospheric." },
      { question: "Do I need a visa or permit for Goa?", answer: "No special permit is needed beyond the usual Indian visa for foreign nationals. Check the current visa rules on the Indian government's official visa portal before you travel." }
    ],
    officialLinks: [
      { label: "Goa Tourism Development Corporation (a Government of Goa undertaking)", url: "https://goa-tourism.com" },
    ],
    sources: [
      { label: "Goa, Wikipedia", url: "https://en.wikipedia.org/wiki/Goa" },
      { label: "Churches and Convents of Goa, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/234" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    stateSlug: "maharashtra",
    region: "west",
    tagline: "India's largest financial city, with Victorian Gothic and Art Deco streets, island caves, street food and a working waterfront.",
    categories: ["monuments", "cultural", "photography", "weekend"],
    coordinates: { lat: 18.9220, lng: 72.8347 },
    wikipediaTitle: "Mumbai",
    popular: true,
    hiddenGem: false,
    overview: [
      "Mumbai occupies a group of former islands on India's west coast, joined by reclamation and causeways into a long peninsula. It is the capital of Maharashtra and the centre of India's finance, film and shipping industries, and it is crowded, expensive and fast moving. For visitors, the south of the city, from Colaba to Marine Drive and Fort, is where most heritage sights sit.",
      "The city has two UNESCO-recognised heritage elements within its limits: the Victorian Gothic and Art Deco ensemble around Oval Maidan and Marine Drive, and the Chhatrapati Shivaji Terminus railway station. Out in the harbour, the Elephanta Caves are reached by ferry from the Gateway of India. Beyond monuments, Mumbai rewards walking: local markets such as Crawford and Mangaldas, the Kala Ghoda arts district, and the dabbawalas and fishing communities that still keep older rhythms.",
      "The city is built on a grid of suburban railway lines. The Western, Central and Harbour lines carry millions daily and are the quickest way to cross town, though peak-hour carriages are physically demanding. Traffic is severe, and distances that look short on a map can take an hour or more by road.",
      "The monsoon, from June to September, floods low-lying areas and can disrupt flights and trains. The other seasons are warm to hot and humid. Festival periods, especially Ganesh Chaturthi, change the city's mood and transport for days at a time."
    ],
    history: [
      "The seven islands that make up the old city were home to Koli fishing communities and passed through successive local rulers before the Portuguese took them in the 16th century. In 1661 they came to the English crown as part of a royal dowry, and the East India Company developed Bombay as a port, building a fort and docks.",
      "From the 19th century the opening of cotton mills, the railway and the Suez Canal made Bombay a major port and commercial centre, and its colonial architecture dates mainly from this period. After independence it became the capital of Bombay State and then of Maharashtra in 1960. The city was officially renamed Mumbai in 1995, after the local goddess Mumbadevi.",
      "Today Mumbai is a city of migrants from across India. Communities such as the Parsis, Marathi speakers, Gujaratis, Bohras and many others have shaped its food, language and religious life."
    ],
    attractions: [
      {
        name: "Chhatrapati Shivaji Maharaj Terminus",
        description: "A working railway station completed in the late 19th century in Victorian Gothic style with Indian motifs. It is a UNESCO World Heritage Site and still full of commuters, so move out of the way of crowds and be cautious about photography near operational areas.",
        visitHours: 1,
        coordinates: { lat: 18.9398, lng: 72.8355 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Gateway of India and Elephanta Caves ferry",
        description: "The basalt arch by the harbour is the departure point for ferries to Elephanta Island, where rock-cut Shiva temples of about the 5th to 7th centuries stand. The island has a long flight of steps; there is a toy train to the foot of the climb, but I could not confirm step-free access to the caves. The ASI lists the caves as closed on Monday, so check the current day with ASI before sailing.",
        visitHours: 4,
        coordinates: { lat: 18.9220, lng: 72.8347 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Marine Drive and Oval Maidan Art Deco buildings",
        description: "A curving seafront promenade and a row of 1930s Art Deco apartments, cinemas and hotels. Walking at dusk is free and popular with locals.",
        visitHours: 2,
        coordinates: { lat: 18.9440, lng: 72.8235 },
        interests: ["relaxation", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
        description: "The former Prince of Wales Museum, a large Indo-Saracenic building near Kala Ghoda with collections of sculpture, miniatures and decorative arts. Confirm opening days and the camera policy on the museum's official channels.",
        visitHours: 2.5,
        coordinates: { lat: 18.9269, lng: 72.8326 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Dhobi Ghat and Mahalaxmi",
        description: "An open-air laundry district in Mahalaxmi, best seen from the railway bridge. This is a working area, so photograph from a distance and do not point cameras into people's faces.",
        visitHours: 0.5,
        coordinates: { lat: 18.9836, lng: 72.8250 },
        interests: ["culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Crawford Market and Mohammed Ali Road",
        description: "Old wholesale markets for spices, fruit, textiles and street food. Go in daylight with small change and keep your bag in front of you; the lanes are crowded and uneven.",
        visitHours: 2,
        coordinates: { lat: 18.9473, lng: 72.8346 },
        interests: ["food", "shopping", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [11, 12, 1, 2],
    bestTimeNote: "November to February is the most comfortable period, with lower humidity and temperatures. March to May is hot, and the monsoon (June to September) brings flooding and travel delays. Early October can still be humid.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2800],
      midRange: [4000, 8000],
      comfort: [10000, 25000],
      assumptions: "Per person per day assuming a shared room, local meals, metro, local trains and short taxi or app-cab rides. Hotel prices in south Mumbai are high; budgets assume hostels or modest hotels. Day trips to Elephanta and entry fees are extra."
    },
    gettingThere: {
      air: "Chhatrapati Shivaji Maharaj International Airport is the main hub for international and domestic flights. Navi Mumbai International Airport was inaugurated in October 2025 and airlines have been moving flights there in stages; check which airport your airline uses and the transfer time from each.",
      rail: "Chhatrapati Shivaji Maharaj Terminus, Mumbai Central, Dadar, Lokmanya Tilak Terminus and Bandra Terminus handle long-distance trains. Book well ahead for popular routes to Delhi, Goa, Pune and Gujarat.",
      road: "National highways connect to Pune, Nashik, Ahmedabad and the Konkan coast. Long-distance buses and shared taxis operate from several terminals; road journeys can be slow because of traffic.",
      local: "Suburban trains are the fastest option but very crowded at peak hours. Metro lines now cover parts of the city, and app cabs and black-and-yellow taxis are widely available. Ferries run to Elephanta from the Gateway of India."
    },
    accommodation: "South Mumbai has heritage hotels and mid-range options near Colaba and Fort, but prices are high. Bandra and the western suburbs have guesthouses and boutique hotels; areas near the airport suit short stopovers. Book ahead for festival weeks.",
    cuisine: [
      { name: "Vada pav", note: "A spiced potato fritter in a bread roll with chutney, sold at stalls across the city." },
      { name: "Pav bhaji", note: "A buttery vegetable mash served with bread, popular at street stalls and Juhu beach." },
      { name: "Bombay duck", note: "A dried or fried fish (bombil) in Koli and Maharashtrian cooking." },
      { name: "Irani cafe bun maska and chai", note: "Breakfast at the surviving Irani cafes founded by Zoroastrian migrants; some have closed, so check ahead." },
      { name: "Kheema pav", note: "Minced meat curry with bread, common at Muslim eateries around Mohammed Ali Road." }
    ],
    festivals: ["Ganesh Chaturthi", "Diwali", "Eid al-Fitr", "Christmas", "Navratri", "Kala Ghoda Arts Festival"],
    festivalSlugs: ["ganesh-chaturthi", "diwali", "eid-al-fitr", "christmas", "navratri"],
    nearby: [
      { name: "Elephanta Island", distanceKm: 11, note: "Rock-cut cave temples to Shiva, reached by ferry from the Gateway of India." },
      { name: "Sanjay Gandhi National Park, Borivali", distanceKm: 35, note: "A forest park inside the city limits with the Kanheri Caves, an ancient Buddhist site." },
      { name: "Lonavala and Khandala", distanceKm: 85, note: "Hill stops in the Western Ghats popular for monsoon weekends." },
      { name: "Ajanta and Ellora", distanceKm: 335, note: "Rock-cut cave complexes near Chhatrapati Sambhajinagar, about 335 km by road.", destinationSlug: "ajanta-ellora" }
    ],
    precautions: [
      "Watch for pickpockets in crowded trains, stations and markets, and keep valuables in front of you.",
      "Avoid wading into flooded roads in the monsoon; open manholes and electrical hazards are a risk. Check weather alerts before travelling by rail or air.",
      "Do not swim at city beaches such as Juhu and Girgaum; currents are strong and water quality is poor.",
      "Use metered taxis or app cabs and avoid unlicensed touts at the airport and stations."
    ],
    tips: [
      "Travel against rush-hour flows: avoid trains from 8 to 11 am and 5 to 9 pm if you can.",
      "Carry a power bank and cash for small purchases; digital payments are widely accepted but not everywhere.",
      "Visit Dhobi Ghat, markets and heritage sites in the morning, when it is cooler and less crowded.",
      "Cover shoulders and knees at temples, mosques and Haji Ali, and remove footwear before entering."
    ],
    accessibility: "Platforms, stations and trains are frequently crowded and have steps and gaps. Newer metro stations have lifts but older sights have uneven pavements, steps and narrow lanes. I could not confirm full step-free access at individual heritage sites, so confirm with each venue.",
    responsibleTravel: "Do not take photographs of residents in crowded settlements without permission, and avoid treating poverty as a spectacle; if you join a community walk, choose one that is run by or pays local residents. Use public transport, carry a refillable bottle, and avoid single-use plastic bags.",
    faqs: [
      { question: "How many days do I need in Mumbai?", answer: "Three days covers the main heritage district, a ferry to Elephanta, a market and a suburb or two. A fourth or fifth day allows for the Kanheri Caves, food walks and slower neighbourhoods." },
      { question: "Is Mumbai safe at night?", answer: "Central areas are active late and usually busy, but standard city precautions apply: use registered cabs, avoid empty side streets, and be careful with bags and phones. Women travelling alone often prefer app cabs after dark." },
      { question: "When are the Elephanta Caves open?", answer: "They are open most days, with the ASI listing Monday as the closed day, and boat services may stop in rough monsoon weather. Check the Archaeological Survey of India listing and the ferry operator on the day." },
      { question: "Is it worth using local trains?", answer: "Yes for off-peak journeys along the western or central lines, but not with heavy luggage or during rush hours. Buy tickets through the UTS app or at the counter, and board the correct compartment; first class is more comfortable." }
    ],
    officialLinks: [
      { label: "Maharashtra Tourism", url: "https://maharashtratourism.gov.in" }
    ],
    sources: [
      { label: "ASI: Elephanta Caves, closed on Monday (read 9 November 2026)", url: "https://asi.nic.in/pages/WorldHeritageElephantaCaves" },
      { label: "PIB: Prime Minister inaugurates Navi Mumbai International Airport (8 October 2025, read 9 November 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2176402&reg=48&lang=2" },
      { label: "Mumbai, Wikipedia", url: "https://en.wikipedia.org/wiki/Mumbai" },
      { label: "Victorian Gothic and Art Deco Ensembles of Mumbai, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/1480" },
      { label: "Elephanta Caves, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/244" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "ajanta-ellora",
    name: "Ajanta and Ellora",
    stateSlug: "maharashtra",
    region: "west",
    tagline: "Two UNESCO-listed rock-cut cave complexes, one Buddhist with painted walls, one a rare mix of Buddhist, Hindu and Jain art.",
    categories: ["monuments", "temples-heritage", "photography"],
    coordinates: { lat: 20.5519, lng: 75.7033 },
    wikipediaTitle: "Ajanta Caves",
    popular: true,
    hiddenGem: false,
    overview: [
      "Ajanta and Ellora are two separate cave complexes in the Deccan plateau of Maharashtra, usually visited together from Chhatrapati Sambhajinagar, the city formerly known as Aurangabad. Both are UNESCO World Heritage Sites inscribed in 1983 and are managed by the Archaeological Survey of India. They are in different directions from the city, so plan them as two separate days or one very long one.",
      "Ajanta lies in a horseshoe-shaped gorge above the Waghora river. Its roughly 30 caves, cut over several centuries, are Buddhist monasteries and prayer halls, and several contain painted murals and carved sculpture depicting the life of the Buddha and stories of his previous births. The paintings are fragile and lit only dimly, and flash photography is banned.",
      "Ellora, about 30 km from the city, has 34 caves cut into a basalt escarpment. Twelve are Buddhist, seventeen Hindu and five Jain, and the three groups sit side by side. The most visited is Cave 16, the Kailasa temple, a huge temple carved down from the top of the rock rather than built up. A short walk along the escarpment takes you between the three traditions.",
      "Neither site is a quick stop. Expect long walks, uneven floors, dim interiors and a lot of steps at Ajanta, and sun exposure at Ellora. Both close for one weekday each, and the days differ, so check before travelling."
    ],
    history: [
      "Ajanta's earliest caves date from the 2nd century BCE, with a second phase of work in the 5th century CE under the Vakataka dynasty and its patrons. The site was abandoned and then hidden by jungle until 1819, when a British officer on a hunting trip came across it. Scholars have studied and copied the paintings since the 19th century.",
      "Ellora was cut mostly between about the 6th and 10th centuries. The Buddhist caves come first, followed by Hindu caves under the Kalachuri and later the Rashtrakuta dynasty, and Jain caves a little later. The Kailasa temple is generally credited to Rashtrakuta patronage in the 8th century.",
      "Ellora lay on trade routes and remained in use as a pilgrimage and religious centre, and the Grishneshwar temple nearby is still active. Ajanta, tucked away from the main roads, escaped later damage but suffered from weathering and early restoration attempts."
    ],
    attractions: [
      {
        name: "Ajanta Caves",
        description: "Painted murals, sculpted halls and a quiet gorge setting. Caves 1, 2, 16, 17 and 26 are the ones usually recommended for painting and sculpture. A shuttle runs from the car park, followed by a climb on steps; take a torch if you have one, though flash is not permitted.",
        visitHours: 4,
        coordinates: { lat: 20.5519, lng: 75.7033 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Ellora Cave 16, the Kailasa temple",
        description: "A monolithic temple to Shiva carved from the rock face, with pillars, galleries and sculpted panels. The courtyard is open to the sky, so it gets hot at midday.",
        visitHours: 2,
        coordinates: { lat: 20.0268, lng: 75.1790 },
        interests: ["history", "spiritual", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Ellora Buddhist caves (Caves 1 to 12)",
        description: "Monasteries and prayer halls, including Cave 10, a vaulted hall known as the Vishvakarma cave. Caves are cut at ground level, which makes them easier to reach than many at Ajanta.",
        visitHours: 1.5,
        coordinates: { lat: 20.0257, lng: 75.1768 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Daulatabad Fort",
        description: "A hill fort on a steep rock with a spiral dark passage and a long climb. It was briefly the capital under Muhammad bin Tughlaq in the 14th century. Wear sturdy shoes; the climb is demanding.",
        visitHours: 2.5,
        coordinates: { lat: 19.9428, lng: 75.2130 },
        interests: ["history", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Bibi Ka Maqbara, Chhatrapati Sambhajinagar",
        description: "A 17th-century Mughal-era mausoleum built for Dilras Banu Begum, sometimes compared to the Taj Mahal. It is a modest monument with gardens, easy to add on the way back from Ellora.",
        visitHours: 1,
        coordinates: { lat: 19.9017, lng: 75.3190 },
        interests: ["history", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Grishneshwar Temple, Ellora",
        description: "A small, active Shiva temple counted among the twelve jyotirlingas. Men may be asked to remove shirts at the sanctum; follow the temple staff and avoid photography unless permitted.",
        visitHours: 1,
        coordinates: { lat: 20.0242, lng: 75.1699 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is cooler and suited to long walks. The monsoon (July to September) turns the Ajanta gorge green and brings waterfalls, but paths can be slippery and rain can disrupt visits. April to June is very hot.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 6500],
      comfort: [8000, 16000],
      assumptions: "Per person per day, based in Chhatrapati Sambhajinagar, with local meals, a shared or hired car to the sites and modest hotels. Entry fees, guides and the Ajanta shuttle are extra; foreign visitors usually pay a higher entry rate at ASI monuments, so confirm."
    },
    gettingThere: {
      air: "Chhatrapati Sambhajinagar (Aurangabad) Airport has scheduled flights to Mumbai, Delhi and other cities. Check current schedules, as services change.",
      rail: "Chhatrapati Sambhajinagar railway station is on the line from Mumbai, Pune, Hyderabad and Nanded. The station is a few kilometres from the city centre.",
      road: "Ajanta is about 100 km from the city by road, and Ellora is about 30 km. Hire a car for the day, or take state buses and tours that run on both routes.",
      local: "Auto-rickshaws and taxis serve the city. Ellora also has local buses from the city. At Ajanta, visitors park at the T-junction and take a shuttle to the caves."
    },
    accommodation: "The city has budget hotels, business hotels and a few heritage properties; staying there allows both sites as day trips. There are guesthouses closer to Ellora and Ajanta, though facilities are modest. Book ahead in the October to February season.",
    cuisine: [
      { name: "Naan qalia", note: "A local lamb or mutton stew eaten with soft naan, associated with the city's Mughal-era Deccan cooking." },
      { name: "Sheer khurma", note: "A vermicelli and milk dessert, especially around Eid." },
      { name: "Tarri poha", note: "A spicy Maharashtrian breakfast of flattened rice with gravy." },
      { name: "Jowar bhakri with thecha", note: "Sorghum flatbread with green chilli and peanut relish, typical of the Marathwada region." }
    ],
    festivals: ["Ellora Ajanta International Festival", "Diwali", "Ganesh Chaturthi", "Eid al-Fitr"],
    festivalSlugs: ["diwali", "ganesh-chaturthi", "eid-al-fitr"],
    nearby: [
      { name: "Daulatabad Fort", distanceKm: 15, note: "Hill fort between the city and Ellora." },
      { name: "Bibi Ka Maqbara", distanceKm: 5, note: "Mughal-era mausoleum in the city." },
      { name: "Lonar Crater Lake", distanceKm: 150, note: "A meteor-impact crater lake in Buldhana district; a separate trip." },
      { name: "Mumbai", distanceKm: 335, note: "The most common onward connection by train or flight.", destinationSlug: "mumbai" }
    ],
    precautions: [
      "Ajanta and Ellora close on different weekdays (the ASI lists Ajanta as closed on Monday and Ellora as closed on Tuesday), so check the ASI listing before you travel.",
      "Do not touch the paintings or sculpture, and do not use flash. Tripods, drones and commercial filming require permission.",
      "Carry water and a hat. There is little shade at Ellora, and the walk at Ajanta is longer than it appears.",
      "Monsoon rain can make steps and approach paths slippery; wear shoes with a good grip."
    ],
    tips: [
      "Visit Ajanta first thing in the morning to avoid school groups and dim crowds inside caves.",
      "Start at Ellora's Cave 16 and work outwards, rather than following the cave numbers strictly.",
      "A guide can help with Ajanta's iconography; agree the rate before starting, and check ASI-approved guide lists where available.",
      "Footwear is usually removed in active shrines, such as Grishneshwar, and sometimes within certain caves; follow the signs."
    ],
    accessibility: "Both sites involve steps and uneven stone. Ajanta has a climb from the shuttle drop to the caves and then steps between them; some visitors use dolis (chair carriers), which are available at the site. Ellora's caves are more level but many have steps at the entrance. I could not confirm step-free access at any cave, so ask ASI or your hotel in advance.",
    responsibleTravel: "Treat the caves as living religious sites for some communities as well as monuments: dress modestly, speak quietly and do not climb on sculpture. Buy local crafts and meals in the village markets and avoid leaving litter in the gorge or on the escarpment.",
    faqs: [
      { question: "Can I see Ajanta and Ellora in one day?", answer: "It is possible but very tiring, as the two are about 100 km apart in different directions. Two days gives more time at each, and a third allows Daulatabad and the city." },
      { question: "Which is better, Ajanta or Ellora?", answer: "They are different. Ajanta is mainly Buddhist and known for painting, with a quiet gorge setting. Ellora is known for its monolithic Kailasa temple and the mix of Buddhist, Hindu and Jain caves. If time is limited, choose by interest." },
      { question: "Why is Aurangabad now called Chhatrapati Sambhajinagar?", answer: "The city and district are officially called Chhatrapati Sambhajinagar, and the district administration uses that name. Railway, airline and map listings may use either name, so older signs, maps and bookings may still say Aurangabad." },
      { question: "How much do tickets cost?", answer: "Prices change, and foreign nationals are charged a different rate. Confirm on the Archaeological Survey of India website or at the ticket counters; there is also a separate fee for the Ajanta shuttle." }
    ],
    officialLinks: [
      { label: "Maharashtra Tourism", url: "https://maharashtratourism.gov.in" },
      { label: "Archaeological Survey of India: Ajanta Caves", url: "https://asi.nic.in/pages/WorldHeritageAjantaCaves" },
      { label: "Archaeological Survey of India: Ellora Caves", url: "https://asi.nic.in/pages/WorldHeritageElloraCaves" },
    ],
    sources: [
      { label: "ASI: Ajanta Caves, closed on Monday (read 9 November 2026)", url: "https://asi.nic.in/pages/WorldHeritageAjantaCaves" },
      { label: "ASI: Ellora Caves, closed on Tuesday (read 9 November 2026)", url: "https://asi.nic.in/pages/WorldHeritageElloraCaves" },
      { label: "District Chhatrapati Sambhajinagar, Government of Maharashtra (read 9 November 2026)", url: "https://chhatrapatisambhajinagar.maharashtra.gov.in/en/history/" },
      { label: "Ajanta Caves, Wikipedia", url: "https://en.wikipedia.org/wiki/Ajanta_Caves" },
      { label: "Ellora Caves, Wikipedia", url: "https://en.wikipedia.org/wiki/Ellora_Caves" },
      { label: "Ajanta Caves, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/242" },
      { label: "Ellora Caves, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/243" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "kutch",
    name: "Kutch",
    stateSlug: "gujarat",
    region: "west",
    tagline: "A district of salt desert, Harappan ruins, textile villages and rebuilt towns in far western Gujarat.",
    categories: ["cultural", "photography", "village", "hidden-gems"],
    coordinates: { lat: 23.2420, lng: 69.6669 },
    wikipediaTitle: "Kutch district",
    popular: true,
    hiddenGem: false,
    overview: [
      "Kutch is the largest district of Gujarat and one of the biggest in India. It lies between the Gulf of Kutch and the border with Pakistan, and is largely shaped by the Great and Little Ranns, vast seasonal salt marshes that flood in the monsoon and dry into a white crust by winter. Bhuj is the usual base; Mandvi and the villages around Hodka and Dhordo are the other typical stops.",
      "People come for three things. The first is the Rann itself, particularly near Dhordo, where the salt flats stretch to the horizon and a winter tent festival takes place. The second is Dholavira, the Harappan city that UNESCO inscribed in 2021. The third is craft: embroidery, block printing (Ajrakh), bandhani tie-dye, leatherwork and woodwork are produced by Rabari, Ahir, Meghwal and other communities.",
      "Kutch was hit by a severe earthquake in January 2001, and parts of Bhuj and nearby towns were rebuilt. Some old buildings, such as Aina Mahal and Prag Mahal, are damaged or partly closed for restoration. The rebuilt towns are functional, but the real draw is the countryside.",
      "Distances are long and public transport thin, so hiring a car with a driver for several days is typical. Some areas near the border require permits, and the weather swings sharply: hot in summer, cold at night in winter, and flooded in a heavy monsoon."
    ],
    history: [
      "Kutch was a princely state for centuries, ruled by a line of Jadeja Rajput rulers from Bhuj. The Jadejas built palaces and a series of buildings that mixed Indian and European ideas; the Aina Mahal, for example, was built in the 18th century with Dutch-influenced interiors. Kutch joined India after independence and became part of Gujarat in 1960.",
      "Much older than the princes is Dholavira, a Harappan city of the 3rd and 2nd millennia BCE on Khadir island in the Great Rann. Its stepped reservoirs and water-management system are unusually well preserved for an Indus Valley site, which is why UNESCO inscribed it in 2021.",
      "Many communities in Kutch migrated here over centuries from Sindh, Rajasthan and elsewhere. Their craft traditions are tied to family and caste ties, and Kutch has long been a trading and seafaring region through the port of Mandvi."
    ],
    attractions: [
      {
        name: "White Rann at Dhordo",
        description: "The salt flats near Dhordo are the most visited part of the Great Rann, with a seasonal tent village and a sunset viewpoint. The ground is only walkable after the water recedes, usually after the monsoon. Visits need a border-area permit, normally arranged at the checkpoint; foreign nationals face extra rules, so confirm before going.",
        visitHours: 4,
        coordinates: { lat: 23.8369, lng: 69.6837 },
        interests: ["nature", "photography", "culture"],
        timeOfDay: "evening"
      },
      {
        name: "Dholavira",
        description: "UNESCO World Heritage Harappan city with a walled citadel, reservoirs and a long stone signboard. It is remote and exposed, and a permit may be needed. The site is a long drive from Bhuj, so many visitors stay overnight at Dholavira village.",
        visitHours: 3,
        coordinates: { lat: 23.8864, lng: 70.2132 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Aina Mahal and Prag Mahal, Bhuj",
        description: "Two palaces in the old town, the first with a hall of mirrors and the second built in an Italianate style. Earthquake damage has closed parts, so check which areas are open before you go.",
        visitHours: 2,
        coordinates: { lat: 23.2494, lng: 69.6663 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Craft villages: Bhujodi, Ajrakhpur and Nirona",
        description: "Weaving, block printing and Rogan painting are done in homes and workshops. Visit in the morning, ask before taking photographs of artisans and pay fair prices; many artisans work in cooperatives.",
        visitHours: 3,
        interests: ["culture", "shopping"],
        timeOfDay: "morning"
      },
      {
        name: "Kala Dungar (Black Hill)",
        description: "The highest point in the district, at around 400 m, with views across the Rann. A temple stands at the top and the area has a military presence, so photography is restricted in places. Follow all signs and any permit conditions.",
        visitHours: 1,
        coordinates: { lat: 23.7878, lng: 69.5336 },
        interests: ["photography", "nature"],
        timeOfDay: "evening"
      },
      {
        name: "Mandvi beach and shipyard",
        description: "A port town with a long-standing shipbuilding trade, where wooden boats are still built by hand, plus a beach and the 19th-century Vijay Vilas Palace. The shipyard is a working site, so ask before entering.",
        visitHours: 3,
        coordinates: { lat: 22.8330, lng: 69.3500 },
        interests: ["culture", "relaxation", "photography"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [11, 12, 1, 2],
    bestTimeNote: "November to February is the main season for the White Rann and its tent festival, with cool nights and dry ground. March is still pleasant. Summer is very hot, and in the monsoon the Rann floods and roads can close.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2800],
      midRange: [3500, 7000],
      comfort: [9000, 22000],
      assumptions: "Per person per day, assuming two sharing, a shared car or driver for part of the stay and local meals. Tent-village packages in the Rann during festival season are priced separately and can be considerably higher; rooms book out in December and January."
    },
    gettingThere: {
      air: "Bhuj Airport has limited scheduled flights, mainly from Mumbai. Check current schedules; otherwise, Ahmedabad (about 330 km) is the main alternative.",
      rail: "Bhuj and Gandhidham are the main railheads, with trains from Ahmedabad, Mumbai and Delhi. Gandhidham is a busy junction about 60 km from Bhuj.",
      road: "State highways link Bhuj to Ahmedabad (around 330 km) and Rajkot. Buses are available but slow; a car with a driver is the practical option to reach the Rann.",
      local: "Taxis and auto-rickshaws serve Bhuj. Villages and Dholavira are hard to reach without a car, and phone signal is patchy in the desert."
    },
    accommodation: "Bhuj has hotels at all levels, and homestays and bhunga (round mud hut) guesthouses are available in villages. The tent village at Dhordo and the surrounding resorts fill up in winter. Book months ahead for December and January weekends.",
    cuisine: [
      { name: "Kutchi dabeli", note: "A spiced potato filling in a bun with peanuts and pomegranate, from Mandvi." },
      { name: "Khichdi with kadhi", note: "A simple rice and lentil dish with yoghurt gravy, widely served in Gujarati homes and thalis." },
      { name: "Bajra rotla with ghee and jaggery", note: "A millet flatbread served in village meals." },
      { name: "Gujarati thali", note: "A set meal with several vegetables, dal, rice and sweets; mostly vegetarian here." }
    ],
    festivals: ["Rann Utsav", "Navratri", "Diwali", "Makar Sankranti"],
    festivalSlugs: ["navratri", "diwali", "makar-sankranti"],
    nearby: [
      { name: "Mandvi", distanceKm: 60, note: "A port and beach town with a historic shipyard." },
      { name: "Narayan Sarovar and Koteshwar", distanceKm: 135, note: "Remote pilgrimage sites near the western coast, reached through a long drive." },
      { name: "Lakhpat", distanceKm: 135, note: "A ruined fortified town near the border, where a permit is needed." },
      { name: "Dholavira", distanceKm: 220, note: "Harappan city on Khadir island, a long drive from Bhuj." }
    ],
    permits: "Parts of Kutch are within the border area, and Indian citizens typically need a permit for places such as the White Rann at Dhordo and for Dholavira; this is usually issued online or at a checkpoint. Foreign nationals face additional requirements and may need prior permission. Rules change, so confirm with the Kutch district authorities or the Rann Utsav and Gujarat Tourism offices before travelling.",
    precautions: [
      "Carry the ID you used for the permit, and expect checkpoints. Photography near military or border installations is prohibited.",
      "Do not walk onto the Rann alone or drive on it, as the surface can be wet and soft; stay within marked areas.",
      "Temperatures vary sharply: very cold at night in winter, with strong sun in daytime. Bring layers and sun protection.",
      "Gujarat is a dry state, so alcohol is generally prohibited; check the current rules before you travel."
    ],
    tips: [
      "Hire a driver for several days; distances are large and village roads can be rough.",
      "Visit craft villages in the morning, and buy directly from artisans or cooperatives rather than through intermediaries.",
      "Book Rann tents before November and arrive in time for sunset, when the colour changes on the salt.",
      "Carry cash; ATMs are scarce in villages."
    ],
    accessibility: "The Rann is flat but soft or wet in places, and tent-village sites vary. Bhuj's old town has narrow lanes and steps, and Dholavira involves uneven walking on exposed ground. I could not confirm step-free access at palaces or the Dholavira site.",
    responsibleTravel: "Many craft communities live in the villages you pass. Ask before photographing people, pay properly for crafts and do not enter homes uninvited. Avoid littering on the salt flats, which is a fragile habitat, and stay on marked tracks.",
    faqs: [
      { question: "Do I need a permit to visit the White Rann?", answer: "Generally yes for Indian citizens, issued at a checkpoint or online, and foreign nationals face extra requirements. Rules change, so ask your hotel or the Kutch authorities in advance." },
      { question: "When is the Rann Utsav held?", answer: "It usually runs through the winter, from about November to February or March, but the dates change every year. Check the official Rann Utsav website for the current season." },
      { question: "Can I visit Kutch in the monsoon?", answer: "You can, but the Rann is flooded and not walkable, and some roads and sites may be closed. The countryside is green, but it is not the season for the salt desert." },
      { question: "How do I get from Bhuj to Dholavira?", answer: "By road, usually in a hired car; it is a long drive of several hours on a mix of highway and rural road. Many visitors stay overnight near the site." }
    ],
    officialLinks: [
      { label: "Gujarat Tourism", url: "https://www.gujarattourism.com" },
      { label: "Rann Utsav", url: "https://www.ranutsav.com" }
    ],
    sources: [
      { label: "Kutch district, Wikipedia", url: "https://en.wikipedia.org/wiki/Kutch_district" },
      { label: "Dholavira: A Harappan City, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/1645" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "diu",
    name: "Diu",
    stateSlug: "dadra-and-nagar-haveli-and-daman-and-diu",
    region: "west",
    tagline: "A small island town with a Portuguese fort, quiet beaches and churches, on the southern tip of the Kathiawar peninsula.",
    categories: ["beaches", "forts-palaces", "weekend", "hidden-gems"],
    coordinates: { lat: 20.7144, lng: 70.9874 },
    wikipediaTitle: "Diu, India",
    popular: false,
    hiddenGem: true,
    overview: [
      "Diu is a small island off the south coast of Gujarat, joined to the mainland by two bridges and a creek with mangroves. It is part of the union territory of Dadra and Nagar Haveli and Daman and Diu, which means it is governed separately from Gujarat even though it is surrounded by it. The island is only about 11 km long and is easy to cover in a day or two.",
      "The main sights are the Diu Fort, a large Portuguese structure on the eastern tip, the town's whitewashed churches, including St Paul's, and the offshore Panikota fort, which can be reached by boat. The beaches on the western side, such as Nagoa and Jallandhar, are quieter than Goa's, with calm water at certain times of year but strong currents at others.",
      "Diu is quiet and has a distinctive small-town feel. Many visitors are weekenders from Gujarat, which matters because Gujarat is dry and Diu is not: alcohol is available here, and the island fills up on weekends and holidays. Outside these peaks, the lanes are calm.",
      "It is not a big-sights destination. Plan on walking, cycling or scooter trips, a sunset at one of the beaches, and perhaps an onward visit to Somnath or Gir National Park on the mainland."
    ],
    history: [
      "Diu was an important port on the trade routes of the Arabian Sea, and in the early 16th century it was contested between the Gujarat Sultanate and the Portuguese, with Ottoman and Mamluk involvement. After battles in 1509 and 1538 to 1539, the Portuguese were given permission to build a fort, which was constructed in the 1530s and 1540s.",
      "Portuguese rule lasted until 1961, when India took Goa, Daman and Diu in the same operation. Diu was administered with Goa and then as part of the union territory of Daman and Diu; in 2020 it was merged with Dadra and Nagar Haveli into the present union territory.",
      "The Portuguese period left churches, houses with balconies and a small Catholic community. The island is also home to Hindu temples and Muslim shrines, and many residents have family links with Gujarat's Kathiawar region."
    ],
    attractions: [
      {
        name: "Diu Fort",
        description: "A massive sea fort with ramparts, cannon and a lighthouse. The ramparts and stairs can be uneven, and the sun is strong; go in the early morning or late afternoon. Confirm current opening times locally.",
        visitHours: 2,
        coordinates: { lat: 20.7090, lng: 70.9890 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "St Paul's Church",
        description: "A Baroque church from the early 17th century with a white facade. It is still used for worship, so dress modestly and keep quiet during services.",
        visitHours: 0.5,
        coordinates: { lat: 20.7138, lng: 70.9837 },
        interests: ["history", "spiritual", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Nagoa Beach",
        description: "A long crescent beach on the western side with palms, calm water and a few cafes. Check for lifeguards and warning flags, as currents can be strong.",
        visitHours: 3,
        coordinates: { lat: 20.7000, lng: 70.9180 },
        interests: ["relaxation", "nature"],
        timeOfDay: "afternoon"
      },
      {
        name: "Gangeshwar Temple",
        description: "A small temple where five Shiva lingas stand on rocks by the sea and are covered by the tide at high water. Reach it on foot along the shore at low tide, and respect worshippers.",
        visitHours: 1,
        coordinates: { lat: 20.6944, lng: 70.8830 },
        interests: ["spiritual", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Panikota Fort",
        description: "A small island fort off the coast, reached by boat from the jetty. Boat availability depends on the sea and tide, so confirm timings with operators.",
        visitHours: 1.5,
        interests: ["history", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Diu Museum (former St Thomas Church)",
        description: "A museum housed in a former church, displaying statues and carvings from the Portuguese era. Check opening days locally.",
        visitHours: 1,
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is dry and pleasant, with warm days and cooler nights. The monsoon is wet, windy and the sea is rough, and the summer months of April to June are hot and humid. Weekends and long holidays are crowded.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 5500],
      comfort: [7000, 14000],
      assumptions: "Per person per day, two sharing, a rented bicycle or scooter and local meals. Room rates rise sharply on weekends and holidays. Alcohol and boat trips are extra."
    },
    gettingThere: {
      air: "Diu Airport has had limited scheduled flights, for example from Mumbai; check the current schedule, as services are sporadic. Rajkot, Ahmedabad and Mumbai are the main alternatives.",
      rail: "The nearest railhead is Delwada (about 8 km), served by a few trains. Veraval, near Somnath, is a larger junction about 90 km away, and Rajkot is the next major station.",
      road: "The island is linked by road to Una (about 12 km) and then to Somnath, Veraval and Rajkot. State buses and private buses from Gujarat serve Diu.",
      local: "Rented bicycles, scooters and auto-rickshaws are the usual ways to get around. Distances are short. A licence is needed for scooters."
    },
    accommodation: "Hotels and guesthouses are concentrated around the town and Nagoa beach, from simple lodgings to beach resorts. Book ahead for weekends, Diwali and long holiday weeks. Some budget places are basic, so check reviews.",
    cuisine: [
      { name: "Fresh seafood", note: "Fish, prawns and crab served in restaurants and cafes; check what is in season." },
      { name: "Gujarati thali", note: "Widely available, usually vegetarian." },
      { name: "Goan-style Portuguese dishes", note: "A few restaurants cook in the Portuguese-influenced style, for example fish curries and bread." },
      { name: "Fresh coconut water and tender coconut", note: "Sold along the roadsides and beaches." }
    ],
    festivals: ["Diwali", "Navratri", "Christmas"],
    festivalSlugs: ["diwali", "navratri", "christmas"],
    nearby: [
      { name: "Una", distanceKm: 12, note: "The mainland town across the creek, with bus and rail links." },
      { name: "Somnath Temple, Veraval", distanceKm: 85, note: "One of the twelve jyotirlinga shrines, on the Gujarat coast." },
      { name: "Gir National Park", distanceKm: 100, note: "Home to the Asiatic lion; check the season and book safaris through the Gujarat forest department." }
    ],
    precautions: [
      "Swim only where lifeguards or marked areas exist; currents are strong on some beaches, and the monsoon sea is dangerous.",
      "Do not carry alcohol from Diu into Gujarat; Gujarat is a dry state and carrying it across the border can lead to prosecution.",
      "Keep valuables safe on the beaches and be careful with scooters on narrow roads.",
      "Sun and humidity can be intense; carry water and cover up on the ramparts."
    ],
    tips: [
      "Visit midweek if you want the island quiet.",
      "Combine Diu with Somnath and Gir on a longer Saurashtra route.",
      "Dress modestly in town and at religious sites, even though beaches are relaxed.",
      "Carry cash; ATMs are limited and some small shops do not take cards."
    ],
    accessibility: "The fort has stone ramparts and steps, and beach access is over sand. The churches have steps at entrances. I could not confirm step-free access at any site, so ask locally.",
    responsibleTravel: "Diu is a small community. Keep noise down at night, avoid littering on the beaches and mangroves, and respect the churches and temples, which are active places of worship. Choose locally owned guesthouses and restaurants.",
    faqs: [
      { question: "Is Diu part of Gujarat?", answer: "No. It is part of the union territory of Dadra and Nagar Haveli and Daman and Diu, although it is surrounded by Gujarat on the mainland. This is why alcohol rules differ." },
      { question: "How many days do I need in Diu?", answer: "Two days covers the fort, churches and a beach. Three allows for a boat trip to Panikota and a visit to Una or Somnath." },
      { question: "Can I drink alcohol in Diu?", answer: "Alcohol is legally sold on the island, subject to the union territory's rules, but it is illegal to take it into Gujarat. Drinking and driving laws are enforced." },
      { question: "How do I get to Diu without a flight?", answer: "By train to Delwada or Veraval and then by road, or by bus from Rajkot, Junagadh or Ahmedabad. Journeys can be long, so most visitors plan an overnight stay along the way." }
    ],
    officialLinks: [
      { label: "Diu District, UT Administration of Dadra and Nagar Haveli and Daman and Diu", url: "https://diu.gov.in" },
    ],
    sources: [
      { label: "Diu, India, Wikipedia", url: "https://en.wikipedia.org/wiki/Diu,_India" },
      { label: "Dadra and Nagar Haveli and Daman and Diu, Wikipedia", url: "https://en.wikipedia.org/wiki/Dadra_and_Nagar_Haveli_and_Daman_and_Diu" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "khajuraho",
    name: "Khajuraho",
    stateSlug: "madhya-pradesh",
    region: "central",
    tagline: "A village of 10th and 11th century Chandela temples, known for finely carved sculpture, in northern Madhya Pradesh.",
    categories: ["monuments", "temples-heritage", "photography"],
    coordinates: { lat: 24.8523, lng: 79.9199 },
    wikipediaTitle: "Khajuraho Group of Monuments",
    popular: true,
    hiddenGem: false,
    overview: [
      "Khajuraho is a small town in the Chhatarpur district of Madhya Pradesh, known for a group of Hindu and Jain temples built by the Chandela dynasty between about 950 and 1050 CE. UNESCO inscribed the group in 1986. The temples are in sandstone, built on high platforms with tiered, mountain-like towers, and covered in sculpture.",
      "Only a minority of the carvings are erotic. Most show gods, musicians, dancers, warriors, animals and scenes of daily life. The erotic panels are placed on outer walls and junctions, and scholars debate their meaning, with proposals ranging from tantric ideas to auspicious symbolism. Visitors tend to find the whole set more subtle than the reputation suggests.",
      "The temples are arranged in three groups: the Western group, the main ticketed enclosure, which includes the Kandariya Mahadeva and Lakshmana temples; the Eastern group, including Jain temples; and a Southern group. Most can be seen in a day. The town is small and quiet, with a handful of lanes, cafes and a very low-key pace.",
      "Khajuraho is relatively remote, though it has an airport and a railway station. Summer is severe, and winter is the comfortable season, which is also when the annual dance festival is held."
    ],
    history: [
      "The Chandela dynasty ruled much of Bundelkhand from the 9th to the 13th century, and Khajuraho was a religious and ceremonial centre rather than a capital. The temples were built by successive Chandela kings over about a century. Historical accounts suggest there were originally about 85 temples, of which around 25 survive.",
      "After the Chandelas lost power to the Delhi Sultanate in the 13th century, the area became less important, and the temples fell into disuse, hidden among forest and villages. A British engineer, T. S. Burt, reported the site in 1838, bringing it to wider attention. The Archaeological Survey of India has maintained it since.",
      "The Hindu temples are dedicated to Shiva, Vishnu and other deities, while the Jain temples in the Eastern group are still in use. The Western group is the one most visited."
    ],
    attractions: [
      {
        name: "Western Group of Temples",
        description: "The main, ticketed enclosure with the Kandariya Mahadeva, Lakshmana and Vishvanatha temples set in a garden. Walk around each temple clockwise and look closely at the three bands of sculpture. A sound and light show runs in the evening; check timings.",
        visitHours: 3,
        coordinates: { lat: 24.8523, lng: 79.9199 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Kandariya Mahadeva Temple",
        description: "The largest temple in the group, with a tall shikhara and thousands of carved figures. Interiors are dim, and there is a flight of steps to the platform.",
        visitHours: 1,
        coordinates: { lat: 24.8519, lng: 79.9199 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Eastern Group and Jain temples",
        description: "Temples including the Parsvanatha Jain temple, still in active use. Remove footwear as required and avoid photography inside shrines unless allowed.",
        visitHours: 2,
        coordinates: { lat: 24.8440, lng: 79.9400 },
        interests: ["history", "spiritual", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Archaeological Museum, Khajuraho",
        description: "Displays sculptures from the site and the surrounding region. Confirm opening days and timings with ASI.",
        visitHours: 1,
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Raneh Falls and the Ken Gharial Sanctuary",
        description: "A canyon with granite and basalt formations on the Ken river, with gharial and other wildlife in the sanctuary. Water flow varies by season. Check road conditions and entry rules locally.",
        visitHours: 3,
        interests: ["nature", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Evening sound and light show",
        description: "A narrated show at the Western group, usually in the evening; the language options and times vary. Confirm timings at the ticket counter.",
        visitHours: 1,
        interests: ["culture", "history"],
        timeOfDay: "evening"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is comfortable for sightseeing. The Khajuraho Dance Festival is usually held in February, and rooms fill early then. April to June is very hot, and the monsoon months of July to September are humid with rain.",
    recommendedDays: { min: 1, max: 3 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6000],
      comfort: [8000, 16000],
      assumptions: "Per person per day, two sharing, in the town, using autos or a hired vehicle for local trips. Entry fees, guides and any Panna safaris are extra; foreign nationals are charged higher entry rates at ASI sites."
    },
    gettingThere: {
      air: "Khajuraho Airport has scheduled flights to Delhi and a few other cities; schedules change, so check current services.",
      rail: "Khajuraho railway station has direct trains to Delhi and Jhansi, among others. Jhansi (about 175 km) and Satna (about 120 km) are larger junctions with more services.",
      road: "State highways link the town to Satna, Panna, Jhansi, Mahoba and Chhatarpur. Buses are available but slow; a hired car is easier for onward trips.",
      local: "Cycle-rickshaws, autos and rented bicycles are the usual ways to move around the town. The Western group is within walking distance of most hotels."
    },
    accommodation: "Hotels range from budget lodges to heritage-style and luxury properties near the temples. Book ahead for February, around the dance festival, and for national holiday weeks. Smaller guesthouses are within walking distance of the Western group.",
    cuisine: [
      { name: "Poha and jalebi", note: "A common Madhya Pradesh breakfast of flattened rice with sweet fried batter." },
      { name: "Dal bafla", note: "Baked wheat balls served with lentils and ghee, typical of Malwa and central MP." },
      { name: "Bundelkhandi thali", note: "A regional set meal with bajra or wheat bread, lentils and seasonal vegetables." },
      { name: "Mawa bati and malpua", note: "Milk-based sweets, often found in local sweet shops." }
    ],
    festivals: ["Khajuraho Dance Festival", "Maha Shivaratri", "Diwali"],
    festivalSlugs: ["diwali"],
    nearby: [
      { name: "Panna National Park", distanceKm: 25, note: "Tiger reserve on the Ken river; core zones close in the monsoon, so check the season." },
      { name: "Raneh Falls", distanceKm: 20, note: "Canyon and waterfalls on the Ken river." },
      { name: "Ajaigarh Fort", distanceKm: 80, note: "A hill fort of the Chandela and later Bundela rulers, with limited facilities." },
      { name: "Orchha", distanceKm: 175, note: "A medieval Bundela town with palaces and temples in Madhya Pradesh, near Jhansi." }
    ],
    precautions: [
      "Touts may approach near the temples offering guides and shopping tours; use ASI-approved guides and agree on prices first.",
      "Summer heat can be extreme, with temperatures well above 40 degrees Celsius; visit early in the day.",
      "Do not touch or climb on the sculpture, and keep to marked paths.",
      "Monsoon rain can make roads to nearby sights difficult."
    ],
    tips: [
      "See the Western group early, when the light is soft and the crowd is thin, and return in the evening if you want the sound and light show.",
      "Take binoculars or a camera with a zoom lens; much of the detail is high on the towers.",
      "Hire a guide for at least the Western group, where the iconography is hard to read without help.",
      "Footwear is removed at active temples and shrines."
    ],
    accessibility: "The Western group has paved paths in a garden, but each temple stands on a high platform reached by steps, and interiors are narrow. I could not confirm step-free access at the temples; ask ASI or your hotel in advance.",
    responsibleTravel: "Khajuraho is a village with its own residents and active temples. Dress modestly, avoid public displays of affection near temple sculpture, and do not treat the erotic sculpture as a joke. Buy crafts from local sellers and avoid leaving litter in the monument gardens.",
    faqs: [
      { question: "Are all Khajuraho temples erotic?", answer: "No. Most carvings show gods, goddesses, musicians, warriors and everyday scenes. The erotic panels are a small share of the total, placed on certain parts of the outer walls." },
      { question: "How long do I need in Khajuraho?", answer: "One full day covers the Western and Eastern groups. Two days allows the museum, the evening show and a trip to Panna or Raneh Falls." },
      { question: "Can I visit Khajuraho and Panna in the monsoon?", answer: "The temples are open year-round, but Panna's core zones are normally closed during the monsoon, so check dates in advance." },
      { question: "When is the Khajuraho Dance Festival?", answer: "It is usually held in February at the Western group, but the exact dates vary. Check with Madhya Pradesh Tourism." }
    ],
    officialLinks: [
      { label: "Madhya Pradesh Tourism", url: "https://www.mptourism.com" }
    ],
    sources: [
      { label: "Khajuraho Group of Monuments, Wikipedia", url: "https://en.wikipedia.org/wiki/Khajuraho_Group_of_Monuments" },
      { label: "Khajuraho Group of Monuments, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/240" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "kanha",
    name: "Kanha Tiger Reserve",
    stateSlug: "madhya-pradesh",
    region: "central",
    tagline: "A sal and grassland tiger reserve in the Maikal hills, known for tigers, barasingha and its open meadows.",
    categories: ["wildlife", "national-parks", "weekend"],
    coordinates: { lat: 22.3345, lng: 80.6115 },
    wikipediaTitle: "Kanha Tiger Reserve",
    popular: true,
    hiddenGem: false,
    overview: [
      "Kanha Tiger Reserve is in the Mandla and Balaghat districts of eastern Madhya Pradesh. It covers sal and mixed forest, bamboo and wide grasslands called maidans, and has a core zone, where jeep safaris run in the morning and afternoon, and a buffer zone around it. It is one of the better-known reserves in central India, and tigers, leopards, wild dogs, gaur, sambar and barasingha are among the animals seen.",
      "The barasingha, or hard-ground swamp deer, is a particular feature. The species was reduced to a small number in the mid-20th century, and conservation work at Kanha is credited with recovering the population. Birdlife includes crested serpent eagles, Indian rollers and many woodland species.",
      "Safaris take place in open jeeps with a driver and a naturalist, and entry is by permit booked online through the Madhya Pradesh forest department. Several gates serve the park, with Khatia and Mukki the main ones, and the park has been divided into zones such as Kanha, Kisli, Mukki and Sarhi. Which zone you get can affect the experience.",
      "Sightings are never guaranteed. Tigers are present but elusive, and many visitors see them only briefly or not at all. A realistic aim is to enjoy the landscape and the smaller animals and birds, and to treat a tiger as a bonus."
    ],
    history: [
      "The area was part of the Gond kingdoms and later British-administered forest, used for hunting. A game sanctuary was created in the early 20th century, and Kanha became a national park in 1955, with its boundaries extended in the following decades. It was brought under Project Tiger in 1973.",
      "As in other reserves, villages inside the core area were relocated as part of conservation policy, and the Baiga and Gond communities have lived in and around the forest for generations. Debates on forest rights and relocation continue.",
      "The reserve has since expanded to include buffer areas, and the landscape is often associated with the setting of Rudyard Kipling's The Jungle Book, though the precise inspiration for the stories is debated, and Seoni and Pench have a stronger claim."
    ],
    attractions: [
      {
        name: "Kanha zone safari",
        description: "The central zone, with maidans where sambar, chital and barasingha graze, and a good chance of seeing tigers. Safaris run at fixed morning and afternoon times and follow set routes.",
        visitHours: 4,
        coordinates: { lat: 22.3345, lng: 80.6115 },
        interests: ["wildlife", "nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Mukki zone safari",
        description: "The southwestern area of the reserve, with mixed forest and grassland, accessed from the Mukki gate. It is usually quieter than Kanha zone.",
        visitHours: 4,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Sarhi and Kisli zones",
        description: "Zones on the north and east sides, with a mix of habitats. Zone allocation is by booking, so you may get either of them.",
        visitHours: 4,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Bamni Dadar (Sunset Point)",
        description: "A plateau viewpoint in the reserve with wide views over the grassland, where herds of animals may be seen at dusk. Access is by safari only.",
        visitHours: 1,
        interests: ["wildlife", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Buffer zone safaris",
        description: "Safaris in the buffer zone around the core, which is often open in the months when core zones are closed. Check availability and rules for the season with the reserve authorities.",
        visitHours: 3,
        interests: ["wildlife", "nature"],
        timeOfDay: "any"
      },
      {
        name: "Baiga and Gond village visits",
        description: "Visits to villages on the reserve's edge, where you can learn about Baiga and Gond traditions. Ask permission, avoid intrusive photography and prefer visits arranged through local guides or cooperatives.",
        visitHours: 2,
        interests: ["culture"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6],
    bestTimeNote: "The core zones are normally closed during the monsoon, typically from 1 July to 30 September, and reopen on 1 October, though reopening dates have varied between sources; confirm with the Madhya Pradesh forest department. Winter (November to February) is cold in early mornings; April to June is hot but often better for tiger sightings as animals visit waterholes.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [3000, 5000],
      midRange: [7000, 12000],
      comfort: [15000, 35000],
      assumptions: "Per person per day, assuming two sharing a jeep and a room, with safari permits, vehicle and guide fees shared. Prices vary with season and zone; forest lodges and luxury camps are at the upper end. Park fees, camera fees and transfers from the airport are extra."
    },
    gettingThere: {
      air: "Jabalpur Airport (about 160 km) is the nearest airport with scheduled flights. Raipur (about 230 km) and Nagpur (about 270 km) are alternatives with more connections.",
      rail: "Jabalpur and Gondia are the main railheads; Nainpur Junction is closer. Check that your train stops at the station you need.",
      road: "Roads from Jabalpur, Mandla and Balaghat lead to the Khatia and Mukki gates. Drives of three to five hours are common, and some stretches are slow.",
      local: "Lodges arrange transfers. Safaris use park-registered jeeps booked through the lodge or the forest department."
    },
    accommodation: "Lodges and camps cluster near the Khatia and Mukki gates, from simple forest rest houses to luxury tented camps. Book months ahead for peak periods in winter and spring, and secure safari permits at the same time.",
    cuisine: [
      { name: "Dal bafla", note: "Baked wheat balls with lentils and ghee, a central Indian staple." },
      { name: "Bhutte ka kees", note: "A savoury dish of grated corn cooked in milk, common in Madhya Pradesh." },
      { name: "Thali meals at lodges", note: "Most lodges serve vegetarian and non-vegetarian set meals with local bread and vegetables." }
    ],
    festivals: ["Diwali", "Holi", "Gond and Baiga local festivals"],
    festivalSlugs: ["diwali", "holi"],
    nearby: [
      { name: "Mandla", distanceKm: 60, note: "Historic Gond town on the Narmada river." },
      { name: "Jabalpur and Bhedaghat Marble Rocks", distanceKm: 175, note: "Marble gorge on the Narmada, with boat rides." },
      { name: "Pench Tiger Reserve", distanceKm: 190, note: "Another reserve in the Satpura range, on the Madhya Pradesh and Maharashtra border." },
      { name: "Bandhavgarh Tiger Reserve", distanceKm: 250, note: "Reserve known for its fort and tigers, further east." }
    ],
    precautions: [
      "Follow your guide and do not leave the jeep inside the core zone; wild animals are dangerous.",
      "Core zones are closed in the monsoon; check dates before booking.",
      "Winter mornings in an open jeep are cold; carry a warm jacket, gloves and a scarf.",
      "Mobile signal is limited around the reserve."
    ],
    tips: [
      "Book safari permits as early as possible; popular zones and dates sell out.",
      "Bring binoculars and a camera with a telephoto lens, and keep noise low.",
      "Wear muted colours, and avoid perfumes and bright clothing.",
      "Be flexible about expectations: you may see few tigers but many other animals and birds."
    ],
    accessibility: "Safaris use open jeeps with high steps and bumpy tracks, which can be hard for people with mobility problems or back conditions. I could not confirm adapted vehicles; ask your lodge and the reserve in advance.",
    responsibleTravel: "Keep a respectful distance from animals and do not feed them. Choose lodges that employ local people and follow waste rules. Respect Baiga and Gond communities at the park's edge: ask before photographing them and avoid turning visits into a spectacle.",
    faqs: [
      { question: "Will I see a tiger at Kanha?", answer: "Possibly, but not for certain. Sightings depend on the season, zone and luck. Many visitors see other animals such as barasingha, gaur and sambar even when they miss tigers." },
      { question: "When is Kanha closed?", answer: "The core zones normally close for the monsoon from 1 July to 30 September, reopening on 1 October, though reopening dates have been reported differently. Buffer areas may stay open; check with the forest department." },
      { question: "How do I book a safari?", answer: "Permits are usually booked online through the Madhya Pradesh forest department's portal, or through your lodge. Book early for peak months." },
      { question: "Is Kanha suitable for children?", answer: "Children old enough to sit quietly in a jeep for several hours may enjoy it, but safaris are long and early-morning starts are cold. Check the reserve's age rules." }
    ],
    officialLinks: [
      { label: "Madhya Pradesh Tourism", url: "https://www.mptourism.com" }
    ],
    sources: [
      { label: "Kanha Tiger Reserve, Wikipedia", url: "https://en.wikipedia.org/wiki/Kanha_Tiger_Reserve" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "bastar",
    name: "Bastar",
    stateSlug: "chhattisgarh",
    region: "central",
    tagline: "A forested region in southern Chhattisgarh with waterfalls, limestone caves and long-established Adivasi cultures.",
    categories: ["waterfalls", "cultural", "village", "hidden-gems"],
    coordinates: { lat: 19.0748, lng: 82.0080 },
    wikipediaTitle: "Bastar district",
    popular: false,
    hiddenGem: true,
    overview: [
      "Bastar is a region in the south of Chhattisgarh, spread over several districts including Bastar, Kondagaon, Dantewada and Bijapur, with Jagdalpur as the main town. It is forested, rolling country on the Deccan plateau, home to Gond, Muria, Maria, Halba, Dhurwa and other Adivasi communities. Its main draws are Chitrakote Falls, Tirathgarh Falls, the Kanger Valley National Park with its caves, and a strong craft tradition.",
      "Chitrakote Falls, on the Indravati river, is a wide horseshoe waterfall, strongest in and after the monsoon. Kanger Valley National Park has dense forest, a stream-cut valley and limestone caves such as Kutumsar, which are closed in the rainy season. Kondagaon is known for Dhokra, the lost-wax brass casting practised by local craftspeople, and for wood and iron work.",
      "The main cultural event is Bastar Dussehra, a festival of around 75 days dedicated to the local goddess Danteshwari and the tribal deities, culminating in processions with large wooden chariots. It is unlike the Rama-centred Dussehra of north India. Weekly haat markets are another way to see local life, but treat them as markets, not shows.",
      "Bastar has long been in the news for Maoist insurgency, and visitors should understand the context and check current advice before travelling. Tourism infrastructure is limited: accommodation is basic outside Jagdalpur, roads are slow, and the sites need local transport and a driver."
    ],
    history: [
      "Bastar was a princely state ruled by a dynasty that claimed descent from the Kakatiya line of Warangal, with Jagdalpur as its capital. The rulers' relationship with local communities shaped festivals such as the Bastar Dussehra. The state acceded to India in 1948 and was merged into Madhya Pradesh, then into Chhattisgarh when it was created in 2000.",
      "The region has been the site of major land, forest and mining conflicts. Maoist insurgents have been active here since the 1980s, and a counter-insurgency campaign and village displacement, including the state-sponsored Salwa Judum movement of the 2000s, affected local communities severely. These events are a significant part of recent history.",
      "News reports in 2026 quote the central government as saying that Maoist insurgency had ended, and the state has been promoting tourism in the area; we could not find an official release to cite. Independent reports and local sources, however, still mention explosive devices and demining operations in some former conflict areas."
    ],
    attractions: [
      {
        name: "Chitrakote Falls",
        description: "A wide waterfall on the Indravati river, around 38 km from Jagdalpur, with viewing platforms and a boat ride. It is at its fullest after the monsoon. Stay behind barriers; the rocks are slippery, and currents are strong.",
        visitHours: 2,
        coordinates: { lat: 19.2073, lng: 81.7048 },
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Tirathgarh Falls",
        description: "A stepped waterfall on the Kanger river inside the Kanger Valley area, reached by a series of steps. Water flow depends on the season, and the steps are slippery in the rains.",
        visitHours: 2,
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Kanger Valley National Park and Kutumsar Cave",
        description: "A protected forest with limestone caves; Kutumsar Cave is a long underground passage visited with a guide and lights. The caves close in the monsoon, and some visitors find the narrow passages difficult.",
        visitHours: 3,
        interests: ["nature", "adventure", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Tribal Museum and Anthropological Museum, Jagdalpur",
        description: "Displays on the cultures, crafts and ritual objects of Bastar's communities. Confirm opening days locally.",
        visitHours: 1.5,
        interests: ["culture", "history"],
        timeOfDay: "afternoon"
      },
      {
        name: "Dhokra craft villages near Kondagaon",
        description: "Workshops where artisans cast brass figures by the lost-wax method. Buy directly and pay fairly; ask before photographing.",
        visitHours: 2,
        interests: ["culture", "shopping"],
        timeOfDay: "morning"
      },
      {
        name: "Danteshwari Temple, Dantewada",
        description: "A temple to the presiding goddess of Bastar, traditionally counted among the Shakti pithas. It is an active shrine; dress modestly and follow temple rules.",
        visitHours: 1,
        coordinates: { lat: 18.8996, lng: 81.3497 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is the most comfortable and dry period, with waterfalls still running after the monsoon. Bastar Dussehra falls in the post-monsoon months. Summer is hot, and the monsoon (June to September) can cut off roads and close caves.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2500],
      midRange: [3000, 5500],
      comfort: [6500, 12000],
      assumptions: "Per person per day, two sharing, with a hired car and driver for day trips from Jagdalpur and simple hotels. Options at the upper end are limited. Entry fees, guides and cave visits are extra."
    },
    gettingThere: {
      air: "Jagdalpur has a small airport with limited flights, for example to Raipur and Hyderabad; check schedules, as services change. Raipur (around 300 km) is the main alternative.",
      rail: "Jagdalpur is on the Kirandul to Kothavalasa line from Visakhapatnam, with a scenic route through the Eastern Ghats. Check current train schedules.",
      road: "National highways connect Jagdalpur to Raipur (about 300 km) and to Odisha and Andhra Pradesh. Roads can be slow, and night travel is discouraged in this region.",
      local: "A hired car with a driver is the practical option for waterfalls, caves and villages. Local buses exist but are infrequent."
    },
    accommodation: "Jagdalpur has hotels at budget and mid-range levels, and the state tourism board runs some resorts and rest houses near sights such as Chitrakote. Elsewhere, accommodation is basic. Book ahead for the Bastar Dussehra period.",
    cuisine: [
      { name: "Chapda chutney", note: "A tangy chutney made from red ants and chilli, eaten by some local communities. Treat it as a local custom, not a challenge." },
      { name: "Bamboo shoot dishes", note: "Cooked fresh or pickled and used in curries across the region." },
      { name: "Mahua-based drinks", note: "Local brews made from mahua flowers; consume only from licensed sources and with care." },
      { name: "Rice-based meals with local greens", note: "Typical home-cooked food of Chhattisgarh." }
    ],
    festivals: ["Bastar Dussehra", "Diwali", "Holi", "Madai fairs"],
    festivalSlugs: ["diwali", "holi"],
    nearby: [
      { name: "Chitrakote Falls", distanceKm: 38, note: "Horseshoe waterfall on the Indravati river." },
      { name: "Kanger Valley National Park", distanceKm: 30, note: "Forest, caves and the Tirathgarh Falls." },
      { name: "Dantewada", distanceKm: 85, note: "Town with the Danteshwari Temple." },
      { name: "Araku Valley", distanceKm: 280, note: "Hill region in Andhra Pradesh, reachable by road or the Kirandul to Visakhapatnam rail line.", destinationSlug: "araku-valley" }
    ],
    precautions: [
      "Security: news reports in 2026 quote the central government as saying that armed Maoist activity has ended, but explosive devices and demining operations have been reported in parts of the region. Check the latest advice with the district police or Chhattisgarh Tourism before you travel.",
      "Stay on main roads and established tourist routes, travel in daylight and do not wander into forests or villages off the main routes without local guidance.",
      "Follow the instructions of police and forest staff at checkpoints, and carry photo ID.",
      "Water currents and slippery rocks at waterfalls cause accidents; stay behind barriers."
    ],
    tips: [
      "Hire a driver who knows the area and confirm routes in advance with your hotel.",
      "Visit haat markets with local guidance, buy goods fairly, and do not photograph people without permission.",
      "Carry cash and basic medicines; services are limited outside Jagdalpur.",
      "Allow extra time for travel, as roads and connections are slower than the distances suggest."
    ],
    accessibility: "Waterfall viewpoints have steps, uneven paths and wet rock, and cave visits involve narrow, dark passages. Tirathgarh needs a long descent by stairs. I could not confirm step-free access at any site.",
    responsibleTravel: "Bastar's communities have faced displacement and conflict. Do not treat their lives as a spectacle: ask permission before photography, avoid giving money or sweets to children, buy crafts from the people who make them, and respect sacred groves and ritual places. Do not buy or accept wildlife or forest products.",
    faqs: [
      { question: "Is Bastar safe to visit?", answer: "News reports in 2026 quote the central government as saying that armed Maoist activity has ended, and tourist sites such as Chitrakote have not been targets. But explosive devices and demining operations have been reported in some areas, so stick to main roads in daylight and check current advice with local police or Chhattisgarh Tourism." },
      { question: "When is Bastar Dussehra?", answer: "It runs for around 75 days across the monsoon and early autumn, ending around the time of the main Dussehra festival. Dates are set annually by local committees; check with Chhattisgarh Tourism." },
      { question: "Do I need a permit for Bastar?", answer: "No special permit is generally required for tourist sites, but you may be asked for ID at checkpoints. Some areas are restricted, so check locally." },
      { question: "How do I see Chitrakote Falls from Jagdalpur?", answer: "By road, around 38 km from Jagdalpur, usually in a hired car. The falls are at their widest after the monsoon." }
    ],
    officialLinks: [],
    sources: [
      { label: "Bastar district, Wikipedia", url: "https://en.wikipedia.org/wiki/Bastar_district" },
      { label: "Chitrakote Falls, Wikipedia", url: "https://en.wikipedia.org/wiki/Chitrakote_Falls" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "alappuzha",
    name: "Alappuzha",
    stateSlug: "kerala",
    region: "south",
    tagline: "A canal and lagoon town on Kerala's coast, the usual gateway to the Kuttanad backwaters and houseboat cruises.",
    categories: ["lakes", "village", "weekend", "photography"],
    coordinates: { lat: 9.4981, lng: 76.3388 },
    wikipediaTitle: "Alappuzha",
    popular: true,
    hiddenGem: false,
    overview: [
      "Alappuzha, long written Alleppey, lies on a narrow strip between the Arabian Sea and the Vembanad lagoon in central Kerala. Canals thread through the town, and just inland lies Kuttanad, a low-lying rice-growing region where fields sit below sea level behind earthen bunds. This landscape of waterways, coconut palms and small villages is why most people come.",
      "The standard experience is a houseboat cruise on the Vembanad lake and its canals, either overnight or for a day. These are converted kettuvallam, traditional rice barges, now fitted with bedrooms and kitchens. Quieter alternatives include canoe trips, village boats and public ferries run by the state water transport department, which give a view of daily life at a fraction of the cost.",
      "The town itself has a beach with a pier, a lighthouse, coir workshops and a few old merchant buildings. Nearby are Marari beach, Ambalappuzha's Krishna temple, the Mannarasala Nagaraja temple and, a short drive from the lake, the Kumarakom bird sanctuary across the district line in Kottayam.",
      "The season matters. The dry months suit cruising better; the monsoon brings heavy rain, and boat services may be limited. The annual Nehru Trophy Boat Race, held on Punnamada Lake in the late monsoon, is a major event that draws large crowds."
    ],
    history: [
      "Alappuzha developed as a port in the late 18th and early 19th centuries, when the Travancore ruler's Diwan, Raja Kesavadas, laid out the town with canals and warehouses to rival nearby Kochi. Coir, spices and other goods were shipped from here, and the coir industry remained central for more than a century.",
      "The area has long been a centre of labour movements. The Punnapra-Vayalar uprising of 1946, in which coir and farm workers confronted the Travancore administration, is remembered in Kerala's political history.",
      "Kuttanad's rice cultivation depends on a drainage and bund system built up over generations, and it faces pressure from flooding, salinity and climate change. The 2018 floods hit the region hard."
    ],
    attractions: [
      {
        name: "Houseboat or canoe cruise on Vembanad Lake and Kuttanad",
        description: "Cruises run from half a day to overnight. Smaller canoes or village boats can enter narrower canals that houseboats cannot. Choose an operator registered with the Kerala tourism department and ask about waste handling.",
        visitHours: 6,
        coordinates: { lat: 9.5000, lng: 76.3500 },
        interests: ["nature", "relaxation", "photography"],
        timeOfDay: "any"
      },
      {
        name: "Alappuzha Beach and lighthouse",
        description: "A long beach with an old pier and a lighthouse that visitors can climb; opening hours vary. Swimming is not always safe, particularly in the monsoon.",
        visitHours: 1.5,
        coordinates: { lat: 9.4960, lng: 76.3190 },
        interests: ["relaxation", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Marari Beach, Mararikulam",
        description: "A quiet fishing-village beach north of the town with small resorts and homestays. The sea can be rough; check conditions with locals.",
        visitHours: 3,
        coordinates: { lat: 9.6040, lng: 76.2999 },
        interests: ["relaxation", "nature"],
        timeOfDay: "afternoon"
      },
      {
        name: "Ambalappuzha Sri Krishna Temple",
        description: "An active temple known for its sweet rice and milk offering, palpayasam. Dress modestly; entry rules for non-Hindus and photography vary, so ask at the gate.",
        visitHours: 1,
        coordinates: { lat: 9.3870, lng: 76.3640 },
        interests: ["spiritual", "culture", "food"],
        timeOfDay: "morning"
      },
      {
        name: "Kumarakom Bird Sanctuary",
        description: "A lakeside sanctuary with migratory and resident birds, best in the early morning. It lies across the district boundary, so allow travel time.",
        visitHours: 2.5,
        coordinates: { lat: 9.6177, lng: 76.4300 },
        interests: ["nature", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Krishnapuram Palace, Kayamkulam",
        description: "An 18th-century Kerala-style palace with a museum, known for its large mural of the Gajendra Moksham. Check opening days locally.",
        visitHours: 1.5,
        coordinates: { lat: 9.1680, lng: 76.5030 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [11, 12, 1, 2],
    bestTimeNote: "November to February is cool and dry and suits houseboats. March to May is hot and humid. The monsoon (June to September) brings heavy rain, and the Nehru Trophy Boat Race is usually held in the later part of that period; dates are set each year.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 7000],
      comfort: [9000, 20000],
      assumptions: "Per person per day, two sharing, using local ferries, auto-rickshaws and homestay or guesthouse rooms. A private overnight houseboat is a major cost that varies widely with boat size, season and the number of people; it is not included except at the comfort level."
    },
    gettingThere: {
      air: "Cochin International Airport at Nedumbassery is about 85 km away; Thiruvananthapuram airport is further south. Check transfers in advance.",
      rail: "Alappuzha station is on the coastal line between Ernakulam and Thiruvananthapuram, with regular services. Kayamkulam and Ernakulam are alternatives with more trains.",
      road: "NH 66 passes close to Alappuzha, and buses connect to Kochi, Kottayam, Thiruvananthapuram and other towns.",
      local: "Autos, taxis and the state water transport department's ferries are the main options. The ferry to Kottayam is a long and popular public route; check the timetable."
    },
    accommodation: "Choices include houseboats, lakeside resorts, homestays and town hotels. Homestays in Kuttanad give a quieter and more local experience. For houseboats, book through registered operators and confirm what the price includes, such as meals and the length of cruise.",
    cuisine: [
      { name: "Karimeen pollichathu", note: "Pearl spot fish marinated and steamed or fried in banana leaf, a Kuttanad speciality." },
      { name: "Duck roast and appam", note: "A common combination in Christian Kerala households and toddy shops." },
      { name: "Kappa and fish curry", note: "Boiled tapioca with spicy fish curry, served at toddy shops." },
      { name: "Palpayasam", note: "A milk and rice pudding offered at the Ambalappuzha temple." }
    ],
    festivals: ["Nehru Trophy Boat Race", "Onam", "Christmas", "Champakulam Moolam Boat Race"],
    festivalSlugs: ["onam", "christmas"],
    nearby: [
      { name: "Kumarakom", distanceKm: 40, note: "Backwater village with a bird sanctuary and resorts, in Kottayam district." },
      { name: "Marari Beach", distanceKm: 15, note: "Quiet beach north of the town." },
      { name: "Kochi", distanceKm: 55, note: "Port city with Fort Kochi, the Jewish quarter and Chinese fishing nets." },
      { name: "Munnar", distanceKm: 160, note: "Tea hills in the Western Ghats, reached by road through Kottayam or Kochi.", destinationSlug: "munnar" }
    ],
    precautions: [
      "Check that houseboats have working life jackets and registered crew, and avoid boats that look overloaded.",
      "Sea and lake conditions change quickly in the monsoon; follow local warnings.",
      "Mosquitoes can be heavy near the water in the evening; carry repellent.",
      "Agree on food and extras before an overnight houseboat cruise to avoid disputes."
    ],
    tips: [
      "Take a public ferry for a low-cost view of the backwaters, and a canoe tour for narrow canals.",
      "Travel midweek to avoid crowds and higher prices on weekends and holidays.",
      "Ask about boat engines and generators: electric or quieter boats are better for wildlife and noise.",
      "Carry cash for village shops and small ferries."
    ],
    accessibility: "Houseboats and ferries have steps, narrow gangways and gaps between boat and jetty. Some resorts have ramps, but I could not confirm step-free access to boats or temples. Ask the operator before booking.",
    responsibleTravel: "Backwater pollution from plastics and houseboat waste is a real concern. Choose operators with waste-treatment practices, avoid single-use plastics, and do not feed birds or fish. Respect temple and church customs, and ask before photographing villagers.",
    faqs: [
      { question: "Is Alappuzha the same as Alleppey?", answer: "Yes. Alleppey is the older spelling, and Alappuzha is the official name used by the government since 1990. Both are in use on tickets and signs." },
      { question: "How long should a houseboat cruise be?", answer: "A day cruise gives a taste; an overnight stay gives time on the water in the evening and morning. Two nights is rarely necessary." },
      { question: "When is the Nehru Trophy Boat Race?", answer: "It is usually held in the later part of the monsoon, but the date is fixed annually by the organisers. Check the Kerala Tourism website." },
      { question: "Is it worth visiting in the monsoon?", answer: "It can be if you like rain and green landscapes, but cruises may be restricted and there is a risk of flooding. Check conditions with operators." }
    ],
    officialLinks: [
      { label: "Kerala Tourism", url: "https://www.keralatourism.org" }
    ],
    sources: [
      { label: "Alappuzha, Wikipedia", url: "https://en.wikipedia.org/wiki/Alappuzha" },
      { label: "Kuttanad, Wikipedia", url: "https://en.wikipedia.org/wiki/Kuttanad" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "munnar",
    name: "Munnar",
    stateSlug: "kerala",
    region: "south",
    tagline: "A high-range hill town in the Western Ghats, surrounded by tea estates, grassland and the home of the Nilgiri tahr.",
    categories: ["hill-stations", "national-parks", "photography", "weekend"],
    coordinates: { lat: 10.0889, lng: 77.0595 },
    wikipediaTitle: "Munnar",
    popular: true,
    hiddenGem: false,
    overview: [
      "Munnar is a hill town in Idukki district, at about 1,500 m in the Western Ghats of Kerala. It sits at the meeting of three streams, which is where its name is often said to come from. The surrounding hills are covered in tea plantations, with eucalyptus, shola forest and grassland on the higher ridges.",
      "Most visitors come for the scenery: tea estates, viewpoints and short walks. Eravikulam National Park, near the town, is the home of the Nilgiri tahr, a mountain goat found only in the Western Ghats, and it contains Anamudi, at about 2,695 m the highest peak in India south of the Himalaya. A bus takes visitors up to the Rajamalai area, and the walk beyond is limited to a short trail.",
      "Munnar is touristy and traffic jams are common on weekends and during holidays. Quieter experiences are found by staying outside town, near Chinnakanal, Marayoor or Vattavada, where terraced vegetable farms and eucalyptus forests replace tea.",
      "The monsoon is heavy, and landslides have affected roads and settlements in this region. The Neelakurinji flowers cover the hills in a mass bloom roughly every twelve years; the last was in 2018, and the next is expected around 2030."
    ],
    history: [
      "The Munnar hills were once forest used by tribal communities such as the Muthuvan. In the late 19th century, British planters leased the land from the ruler of Poonjar, and tea cultivation expanded rapidly. A planting company later became Kannan Devan Hills Plantations, and today tea remains the main economic activity, with part of it owned by its workers.",
      "A narrow-gauge railway and an aerial ropeway once carried tea to the plains, but both were destroyed in the great flood of 1924. Roads replaced them, and the town grew as a hill station for estate staff and visitors.",
      "The 2018 floods and landslides caused severe damage to the region, and the 2020 Pettimudi landslide killed dozens of estate workers. These events are a reminder of the area's vulnerability in the monsoon."
    ],
    attractions: [
      {
        name: "Eravikulam National Park",
        description: "A protected grassland on the high range, with Nilgiri tahr often seen near the trail. Tickets are limited and sold online or at the gate. The park closes for several weeks in the calving season, usually in late winter, so check dates in advance.",
        visitHours: 3,
        coordinates: { lat: 10.1500, lng: 77.0600 },
        interests: ["nature", "wildlife", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Mattupetty Dam and lake",
        description: "A reservoir surrounded by tea and grassland, with boat rides and a nearby dairy farm. It gets crowded at weekends.",
        visitHours: 1.5,
        coordinates: { lat: 10.1066, lng: 77.1245 },
        interests: ["relaxation", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Tea Museum, Nallathanni",
        description: "A museum run by the plantation company on the history of Munnar tea, with machinery and a tasting room. Confirm opening days locally.",
        visitHours: 1,
        interests: ["history", "food", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Top Station",
        description: "A viewpoint on the Kerala and Tamil Nadu border with views over the plains. It is cold and often misty, and the road is narrow.",
        visitHours: 1.5,
        interests: ["photography", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Marayoor dolmens and sandalwood forest",
        description: "A rain-shadow area with megalithic burial monuments and natural sandalwood forest. It is drier and warmer than Munnar, and forest areas are regulated.",
        visitHours: 3,
        coordinates: { lat: 10.2745, lng: 77.1647 },
        interests: ["history", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Attukal and Lakkam waterfalls",
        description: "Seasonal waterfalls near the town, fullest after the monsoon. Keep to marked areas, as rocks are slippery.",
        visitHours: 1.5,
        interests: ["nature", "photography"],
        timeOfDay: "any"
      }
    ],
    bestMonths: [9, 10, 11, 12, 1, 2, 3],
    bestTimeNote: "September to March is generally mild, with cool nights and clearer views. January and February are cold and dry. April and May bring weekend and holiday crowds. The monsoon (June to August) is wet and misty, and landslide risk rises.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 7000],
      comfort: [9000, 20000],
      assumptions: "Per person per day, two sharing, using local jeeps, autos and shared taxis. Entry fees for Eravikulam and the tea museum, and guided treks, are extra. Prices rise in peak season and around Christmas and New Year."
    },
    gettingThere: {
      air: "Cochin International Airport is the nearest major airport, around 110 km away. Madurai airport in Tamil Nadu is also a possible route.",
      rail: "There is no railway station in Munnar. Aluva and Ernakulam in Kerala are the nearest railheads, and Theni in Tamil Nadu is another option.",
      road: "NH 85 from Kochi climbs through the Western Ghats, with a drive of about three to four hours depending on traffic. Roads from Madurai and Theni enter through Bodinayakanur.",
      local: "Taxis, auto-rickshaws and jeeps are available for sightseeing. Local buses serve nearby villages, and the state road transport corporation runs tourist services."
    },
    accommodation: "Hotels and homestays are found in Munnar town and around the tea estates. Staying outside the centre gives views and quiet but requires a vehicle. Book early for weekends and holiday seasons.",
    cuisine: [
      { name: "Fresh estate tea", note: "Tea from local estates is available at tea shops and factories." },
      { name: "Kerala meals", note: "Rice with fish or vegetable curries, served on banana leaf at local restaurants." },
      { name: "Cardamom and spice products", note: "Spices are widely sold, but buy from reputable shops." },
      { name: "Appam and stew", note: "A common breakfast in Kerala homes and hotels." }
    ],
    festivals: ["Onam", "Christmas", "Neelakurinji bloom (every 12 years)"],
    festivalSlugs: ["onam", "christmas"],
    nearby: [
      { name: "Marayoor", distanceKm: 40, note: "Dolmens and sandalwood forest in a drier area." },
      { name: "Thekkady (Periyar)", distanceKm: 100, note: "Spice country and wildlife reserve on the Tamil Nadu border." },
      { name: "Alappuzha", distanceKm: 160, note: "Backwaters on the coast.", destinationSlug: "alappuzha" },
      { name: "Madurai", distanceKm: 160, note: "Temple city in Tamil Nadu, reached through the high range.", destinationSlug: "madurai" }
    ],
    precautions: [
      "Landslides and flooding occur in the monsoon; check road status and weather alerts before travelling and avoid risky slopes after heavy rain.",
      "Mountain roads are narrow and winding. Do not drive at night if you are not used to it.",
      "Eravikulam has a limit on daily visitors, and it closes at certain times of year. Book ahead.",
      "Weather changes quickly; carry a jacket and rain cover."
    ],
    tips: [
      "Avoid Saturdays and public holidays in peak season, when traffic is heavy.",
      "Visit viewpoints early in the morning for the clearest air.",
      "Stay on trails in Eravikulam, and do not feed or approach tahr.",
      "Buy tea and spices from factory shops or cooperatives where you can see the source."
    ],
    accessibility: "Roads are steep and winding, and the Eravikulam path is paved but sloping with a rise in altitude. I could not confirm step-free access at the park or the tea museum. People with breathing or mobility problems should ask in advance.",
    responsibleTravel: "Tea estates are workplaces, so stay on public paths and ask before entering. Avoid littering in the national park, avoid single-use plastic, and do not buy animal products. Take care not to harm the fragile grassland by leaving trails.",
    faqs: [
      { question: "When does the Neelakurinji bloom?", answer: "Strobilanthes kunthiana flowers in a mass bloom roughly once every twelve years. The last major bloom was in 2018, and the next is expected around 2030." },
      { question: "Is Eravikulam open all year?", answer: "It closes for several weeks, usually in late winter, for the tahr calving season. Check the Kerala forest department for current dates." },
      { question: "Is Munnar worth visiting in the monsoon?", answer: "It is green, misty and cheaper, but landslides and road closures are possible and viewpoints are often clouded over. Check conditions before you go." },
      { question: "How do I get to Munnar without a car?", answer: "Take a train to Aluva or Ernakulam, then a state or private bus or a taxi up the ghat road. The journey takes several hours." }
    ],
    officialLinks: [
      { label: "Kerala Tourism", url: "https://www.keralatourism.org" }
    ],
    sources: [
      { label: "Munnar, Wikipedia", url: "https://en.wikipedia.org/wiki/Munnar" },
      { label: "Eravikulam National Park, Wikipedia", url: "https://en.wikipedia.org/wiki/Eravikulam_National_Park" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "hampi",
    name: "Hampi",
    stateSlug: "karnataka",
    region: "south",
    tagline: "The ruined capital of the Vijayanagara empire, spread across a boulder-strewn landscape beside the Tungabhadra river.",
    categories: ["monuments", "temples-heritage", "forts-palaces", "photography"],
    coordinates: { lat: 15.3350, lng: 76.4600 },
    wikipediaTitle: "Hampi",
    popular: true,
    hiddenGem: false,
    overview: [
      "Hampi is a village in northern Karnataka built among the remains of Vijayanagara, a 14th to 16th century capital whose ruins cover roughly 40 square kilometres. The site is a UNESCO World Heritage Site, with temples, palaces, markets, water tanks and fortifications scattered among granite boulders and banana fields on both banks of the Tungabhadra river.",
      "The Virupaksha Temple, in the village, is still a place of worship, and the long Hampi Bazaar street in front of it is lined with old pillared mandapas. Elsewhere, the royal centre contains the Lotus Mahal, the Elephant Stables and the Queen's Bath, and the sacred centre by the river has the Vittala Temple with its stone chariot. Some sights are far apart, so most visitors hire a bicycle, scooter or auto-rickshaw.",
      "Across the river lie Anegundi and the island area of Virupapur Gadde, where many guesthouses and cafes have grown up. The area offers rock climbing and bouldering, short hikes to hilltop temples and sunsets over the boulders. Coracles, round boats, cross the river at several points, though routes and rules change.",
      "Hampi is hot for much of the year. A visit needs early starts, water and a plan, because the monuments are spread over rough ground, and shade is limited."
    ],
    history: [
      "Vijayanagara was founded in 1336 and, over the next two centuries, became one of the largest cities in the world, ruling much of South India. Its rulers, including Krishnadevaraya in the early 16th century, patronised temple building, trade and the arts. Foreign visitors from Portugal and Persia left accounts of its markets and wealth.",
      "In 1565, a coalition of the Deccan sultanates defeated the Vijayanagara army at the Battle of Talikota, and the city was sacked and abandoned over the following months. It was never rebuilt as a capital, and its stone structures survived because they were left empty.",
      "The ruins were brought to wider attention by Colonel Colin Mackenzie in the early 19th century, and the Archaeological Survey of India has carried out conservation since. UNESCO inscribed the Group of Monuments at Hampi in 1986."
    ],
    attractions: [
      {
        name: "Virupaksha Temple and Hampi Bazaar",
        description: "A working temple of Shiva in the village, with a tall gopuram and a temple elephant. Footwear is removed at the gate; cover shoulders and knees. Photography is regulated inside, so ask.",
        visitHours: 2,
        coordinates: { lat: 15.3350, lng: 76.4600 },
        interests: ["spiritual", "history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Vittala Temple and the stone chariot",
        description: "A temple complex with carved halls, including the musical pillars, and a stone chariot shrine. It is a ticketed ASI site, and the walk or buggy ride from the entrance is some distance. Pillars are fragile, so do not tap them.",
        visitHours: 2,
        coordinates: { lat: 15.3417, lng: 76.4750 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Royal Centre: Lotus Mahal, Elephant Stables and Queen's Bath",
        description: "A walled zone of palaces, platforms and ceremonial buildings with Indo-Islamic influences. Tickets cover several monuments.",
        visitHours: 2.5,
        coordinates: { lat: 15.3270, lng: 76.4710 },
        interests: ["history", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Matanga Hill sunrise",
        description: "A short but steep scramble up rock steps for a view of the ruins at dawn. Go with a torch and take care on the stones; do not climb alone in the dark.",
        visitHours: 1.5,
        coordinates: { lat: 15.3395, lng: 76.4745 },
        interests: ["photography", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Hemakuta Hill temples",
        description: "A group of early temples and gateways on a hill above the Virupaksha Temple, good for sunset. The path is rocky.",
        visitHours: 1,
        coordinates: { lat: 15.3345, lng: 76.4590 },
        interests: ["history", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Anegundi and Anjanadri Hill",
        description: "A village north of the river with a medieval fort, with a hilltop shrine reached by several hundred steps. The area is reached by coracle or bridge, and the climb is demanding in heat.",
        visitHours: 3,
        interests: ["history", "adventure", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is cooler and suited to long days outdoors. March to May is very hot, often well above 40 degrees Celsius. The monsoon is mild compared with the coast, but it can make rocks slippery and river crossings unsafe. The Hampi Utsav, a state-run cultural festival, has been held in the cool season; check dates each year.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6000],
      comfort: [7500, 15000],
      assumptions: "Per person per day, two sharing, using a hired bicycle or scooter and occasional autos. Entry fees, guides and coracle rides are extra. Foreign nationals pay a higher entry rate at ASI monuments."
    },
    gettingThere: {
      air: "Vidyanagar airport near Toranagallu has had scheduled flights, and Hubballi (about 140 km) and Bengaluru (about 340 km) are major alternatives. Check current services.",
      rail: "Hosapete (Hospet) Junction, about 13 km away, is the railhead, with trains from Bengaluru, Hubballi and elsewhere. Overnight services from Bengaluru are popular.",
      road: "Hosapete has frequent buses and shared autos to Hampi. Roads from Bengaluru, Hubballi and Ballari link to Hosapete.",
      local: "Bicycles, scooters, autos and battery buggies move visitors between monuments. Coracles cross the river at certain points; check safety and whether services are running."
    },
    accommodation: "Guesthouses and small hotels are in Hampi village, Virupapur Gadde and Anegundi, with larger hotels in Hosapete. Rules limit new building in the protected zone, so choices are modest. Book ahead in the winter season.",
    cuisine: [
      { name: "Jolada rotti and ennegayi", note: "Sorghum flatbread with stuffed brinjal curry, typical of north Karnataka." },
      { name: "Girmit and mirchi bajji", note: "A puffed rice snack and fried chilli fritters." },
      { name: "Karnataka thali", note: "A vegetarian set meal at local restaurants." },
      { name: "Fresh sugarcane juice", note: "A common roadside drink in hot weather." }
    ],
    festivals: ["Hampi Utsav", "Virupaksha Temple car festival", "Diwali", "Makar Sankranti"],
    festivalSlugs: ["diwali", "makar-sankranti"],
    nearby: [
      { name: "Anegundi", distanceKm: 5, note: "Village across the river with a fort and craft cooperatives." },
      { name: "Hosapete (Hospet)", distanceKm: 13, note: "Town with the railway station and the Tungabhadra Dam." },
      { name: "Badami, Aihole and Pattadakal", distanceKm: 135, note: "Early Chalukya rock-cut and structural temples." },
      { name: "Gandikota", distanceKm: 260, note: "A canyon on the Pennar river in Andhra Pradesh.", destinationSlug: "gandikota" }
    ],
    precautions: [
      "Heat and sun exposure are serious risks. Carry plenty of water, wear a hat and plan midday breaks.",
      "Do not climb on monuments or enter areas that are closed. Rocks can be loose and steep.",
      "Check river conditions before taking a coracle, and use life jackets where provided. Do not swim in the river.",
      "Be cautious on scooters, as roads are narrow and visitors share them with animals."
    ],
    tips: [
      "Start at dawn and finish by lunchtime; return in the late afternoon.",
      "Buy a combined ticket where available, and keep it with you.",
      "Hire a guide for the Vittala Temple and the royal centre, where the layout is easy to misread.",
      "Remove footwear at temples, and observe the rules on photography."
    ],
    accessibility: "Paths are uneven, and many monuments have steps and rocky approaches. Battery buggies run between some sites. I could not confirm step-free access at any monument. People with limited mobility should plan with a vehicle and a guide.",
    responsibleTravel: "Hampi's ruins are fragile and also include active worship. Do not touch carvings, do not climb on structures and do not litter. Support local guesthouses, craft cooperatives and community tours, and respect the local rules on alcohol and meat in the village around the temples.",
    faqs: [
      { question: "How many days do I need in Hampi?", answer: "Two days covers the main monuments. Three or four days lets you add Anegundi, a sunrise climb and some slow time by the river." },
      { question: "Where should I stay: Hampi, Virupapur Gadde or Hosapete?", answer: "Hampi village is closest to the temples. Virupapur Gadde is more relaxed but across the river, and Hosapete has more choice and transport but is 13 km away." },
      { question: "Can I cycle around Hampi?", answer: "Yes, bicycles are popular, but distances are longer than they look and heat is intense. Scooters and autos are alternatives." },
      { question: "Is Hampi suitable for older travellers?", answer: "It can be if you plan with a vehicle and guide and avoid steep climbs, though uneven ground, heat and steps limit access at many sites." }
    ],
    officialLinks: [
      { label: "Karnataka Tourism", url: "https://www.karnatakatourism.org" }
    ],
    sources: [
      { label: "Hampi, Wikipedia", url: "https://en.wikipedia.org/wiki/Hampi" },
      { label: "Group of Monuments at Hampi, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/241" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "mysuru",
    name: "Mysuru",
    stateSlug: "karnataka",
    region: "south",
    tagline: "A former royal capital with a grand palace, a 10-day Dasara festival, a famous market and easy access to forest reserves.",
    categories: ["forts-palaces", "cultural", "weekend", "photography"],
    coordinates: { lat: 12.3052, lng: 76.6552 },
    wikipediaTitle: "Mysuru",
    popular: true,
    hiddenGem: false,
    overview: [
      "Mysuru, formerly spelled Mysore, is a city in southern Karnataka, about 145 km from Bengaluru. It was the capital of the Wodeyar dynasty for centuries, and the city retains wide avenues, parks, palaces and heritage buildings from that time. It is smaller and calmer than Bengaluru and suits a short break or a base for day trips.",
      "The Mysore Palace, or Amba Vilas Palace, is the centrepiece. Built in the early 20th century in an Indo-Saracenic style, it is lit by thousands of bulbs on selected evenings. Elsewhere in the city, the Devaraja Market sells flowers, spices and sandalwood, the Jaganmohan Palace houses an art gallery, and Chamundi Hill, above the city, has a temple and a large Nandi statue on its steps.",
      "Mysuru is the centre of the state's Dasara festival, held over ten days in autumn, with a procession, cultural events and illuminated palace. It draws large crowds and raises prices. Outside festival time, the city is quiet, with yoga schools, silk and sandalwood shops, and a reputation for its clean streets.",
      "Day trips reach Srirangapatna, the Brindavan Gardens, Somanathapura and the Bandipur and Nagarhole forests. The city is also a common stop between Bengaluru and Coorg or Ooty."
    ],
    history: [
      "The Wodeyar family ruled Mysore from the 14th century, first as feudatories of Vijayanagara and later as independent rulers. In the late 18th century, Hyder Ali and his son Tipu Sultan took control and fought several wars with the British East India Company, ending with Tipu's death at Srirangapatna in 1799. The British restored the Wodeyars to the throne, as a princely state under British supervision.",
      "The current Mysore Palace was built after the old wooden palace burned in 1897, completed in 1912. The Wodeyars supported music, dance, education and industry, and the city became known for sandalwood, silk, incense.",
      "After independence, the state of Mysore became Karnataka in 1973, and the city's name was officially changed to Mysuru in 2014. The Dasara procession continues as a state festival."
    ],
    attractions: [
      {
        name: "Mysore Palace (Amba Vilas)",
        description: "A palace with halls of mirrors, stained glass and gilded ceilings, open to visitors. Footwear and cameras are restricted inside, and queues are long on weekends. The palace is lit on selected evenings; check the schedule.",
        visitHours: 2.5,
        coordinates: { lat: 12.3052, lng: 76.6552 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Devaraja Market",
        description: "A century-old market for flowers, fruit, kumkum powder and spices. It is crowded and the lanes are uneven; visit in the morning.",
        visitHours: 1.5,
        coordinates: { lat: 12.3058, lng: 76.6523 },
        interests: ["shopping", "food", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Chamundi Hill and Temple",
        description: "A hilltop temple to the goddess Chamundeshwari, reached by road or about a thousand stone steps. A large Nandi statue stands on the climb. Dress modestly and follow temple rules.",
        visitHours: 2.5,
        coordinates: { lat: 12.2724, lng: 76.6700 },
        interests: ["spiritual", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Jaganmohan Palace and Art Gallery",
        description: "A former palace now an art gallery with paintings, including works by Raja Ravi Varma. Opening hours vary; confirm locally.",
        visitHours: 1.5,
        coordinates: { lat: 12.3117, lng: 76.6538 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Sri Chamarajendra Zoological Gardens",
        description: "One of India's older zoos, set in a large park. Check its closing day and policies before going.",
        visitHours: 2.5,
        coordinates: { lat: 12.3015, lng: 76.6520 },
        interests: ["nature", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Srirangapatna and Tipu Sultan's Summer Palace",
        description: "An island town on the Kaveri river, with a fort, the Ranganathaswamy Temple, Tipu's summer palace and mausoleum. It lies about 15 km from Mysuru and fits a half-day trip.",
        visitHours: 3.5,
        coordinates: { lat: 12.4148, lng: 76.6958 },
        interests: ["history", "spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is pleasant. Dasara, in autumn, is the busiest and most expensive time, and visitors need to book transport and rooms early. March to May is hot, and the monsoon (June to September) is mild but can bring rain.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6000],
      comfort: [7500, 16000],
      assumptions: "Per person per day, two sharing, using autos and local buses. Palace entry, zoo tickets and taxis for day trips are extra. During Dasara, room rates can double."
    },
    gettingThere: {
      air: "Mysuru Airport has limited scheduled services. Bengaluru's Kempegowda International Airport, about 175 km away, is the main gateway.",
      rail: "Mysuru Junction connects to Bengaluru, Chennai and other cities. Trains from Bengaluru take about two to three hours.",
      road: "The Bengaluru to Mysuru Expressway (NH 275) cuts the journey; buses and taxis run all day. Roads also lead to Coorg, Ooty and Bandipur.",
      local: "Autos, app cabs and city buses cover the sights. Many are walkable from the palace, but Chamundi Hill is better by vehicle."
    },
    accommodation: "Hotels range from budget lodges to heritage palaces and luxury resorts, with several near the palace. Homestays are available in quiet neighbourhoods. Book well in advance for Dasara.",
    cuisine: [
      { name: "Mysore pak", note: "A rich sweet of gram flour, ghee and sugar, said to have been created in the palace kitchens." },
      { name: "Mysore masala dosa", note: "A crisp dosa with a red chutney spread inside." },
      { name: "Maddur vada", note: "A crisp fritter associated with the Maddur area, between Bengaluru and Mysuru." },
      { name: "Filter coffee", note: "A strong South Indian coffee served in steel tumblers." }
    ],
    festivals: ["Mysuru Dasara", "Diwali", "Makar Sankranti"],
    festivalSlugs: ["mysuru-dasara", "diwali"],
    nearby: [
      { name: "Srirangapatna", distanceKm: 15, note: "Island fort town of Tipu Sultan and a major Vishnu temple." },
      { name: "Brindavan Gardens, KRS Dam", distanceKm: 20, note: "Terraced gardens below a dam on the Kaveri, with an evening fountain show." },
      { name: "Bandipur National Park", distanceKm: 80, note: "Tiger reserve on the Karnataka and Tamil Nadu border; safari seasons and rules apply." },
      { name: "Coorg (Kodagu)", distanceKm: 120, note: "Coffee hills and forests to the west.", destinationSlug: "coorg" }
    ],
    precautions: [
      "Dasara crowds are very heavy and can strain transport; book early and expect long queues and road closures.",
      "Dress and photography rules apply at temples and inside the palace.",
      "Traffic in the old town is congested; use app cabs or autos to avoid parking problems.",
      "Chamundi Hill steps are steep; carry water and avoid the midday sun."
    ],
    tips: [
      "Visit the palace early on a weekday to avoid queues, and check the date of the evening illumination.",
      "Buy sandalwood and silk from government-run or well-known outlets to avoid fakes.",
      "Combine the market, palace and Jaganmohan Palace on one day on foot.",
      "Add Srirangapatna and KRS to the same day by taxi."
    ],
    accessibility: "The palace has steps and long interiors, and its entry rules restrict some items. Chamundi Hill can be reached by road, but the steps are steep. I could not confirm step-free access at the palace or other sites; check with the palace board in advance.",
    responsibleTravel: "Temples and the palace are active cultural spaces. Dress modestly, follow rules on footwear and photography and do not litter. Buy from local craftspeople and avoid products made from endangered wood or animals.",
    faqs: [
      { question: "When is Mysuru Dasara?", answer: "It is held over ten days in the autumn, ending on Vijayadashami. The dates follow the Hindu lunar calendar, so check the state tourism listings each year." },
      { question: "Is Mysuru the same as Mysore?", answer: "Yes. The city was officially renamed Mysuru in 2014. Both spellings appear on maps and signs." },
      { question: "Can I do Mysuru as a day trip from Bengaluru?", answer: "Yes, by the expressway or train, but you will have little time for more than the palace and market. An overnight stay is better." },
      { question: "When is the palace lit up?", answer: "The palace is illuminated on certain evenings, such as Sundays and public holidays, and during Dasara. Confirm the schedule before you go." }
    ],
    officialLinks: [
      { label: "Karnataka Tourism", url: "https://www.karnatakatourism.org" }
    ],
    sources: [
      { label: "Mysuru, Wikipedia", url: "https://en.wikipedia.org/wiki/Mysuru" },
      { label: "Mysore Palace, Wikipedia", url: "https://en.wikipedia.org/wiki/Mysore_Palace" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "coorg",
    name: "Coorg (Kodagu)",
    stateSlug: "karnataka",
    region: "south",
    tagline: "A hilly district of coffee estates, forests and waterfalls, with the distinct culture of the Kodava people.",
    categories: ["hill-stations", "waterfalls", "village", "weekend"],
    coordinates: { lat: 12.4244, lng: 75.7382 },
    wikipediaTitle: "Kodagu district",
    popular: true,
    hiddenGem: false,
    overview: [
      "Coorg is the common name for Kodagu, a district in the Western Ghats of southwestern Karnataka. Its main town is Madikeri, at about 1,100 m. The landscape is hilly and green, with coffee and pepper estates under shade trees, patches of forest, rivers and waterfalls. The Kaveri river rises here, at Talakaveri.",
      "The Kodavas, the district's main community, have a distinct language, dress and customs, including a martial tradition and ancestral houses called ainmane. Visitors who stay in homestays often meet Kodava families and learn about the cuisine, which is meat-friendly and uses kachampuli, a dark vinegar from a local fruit.",
      "Most visitors stay in Madikeri, Kushalnagar or on estates and take short outings: Abbey Falls, Raja's Seat, Madikeri Fort, the Dubare elephant camp and the Tibetan settlement at Bylakuppe, just outside the district. Treks lead into the Brahmagiri and Tadiandamol hills, and rafting runs on the Barapole at some times of year.",
      "Public transport is limited, so most visitors hire a car. The monsoon is intense, and in 2018 and 2019 floods and landslides caused heavy damage; some trails and attractions close in the rains."
    ],
    history: [
      "Kodagu was ruled by the Haleri dynasty of Lingayat kings from the 17th century. They fought Hyder Ali and Tipu Sultan, who invaded the region in the 18th century. In 1834, the British annexed Kodagu after a short war with the last ruler, Chikka Virarajendra, and it became a separate province, Coorg.",
      "The British introduced coffee plantations in the 19th century, and later planting became central to the economy. Kodagu became a state in independent India and was merged into Mysore State, now Karnataka, in 1956. Kodavas have a notable tradition of military service, and General K. M. Cariappa and Field Marshal K. S. Thimayya, both from Kodagu, led the Indian Army.",
      "The district remains agricultural and forested, and coffee, pepper and cardamom are the main crops. Climate-related damage in recent years has become an important concern."
    ],
    attractions: [
      {
        name: "Abbey Falls",
        description: "A waterfall in a private coffee estate near Madikeri, strongest in and after the monsoon. Steps lead down to a viewing bridge. The rocks are slippery, so stay behind railings.",
        visitHours: 1.5,
        coordinates: { lat: 12.4519, lng: 75.7222 },
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Raja's Seat and Madikeri Fort",
        description: "A garden viewpoint over the valley, built by the rulers for watching sunsets, and a 19th-century fort with a small museum and church. Both are in the town and close together.",
        visitHours: 2,
        coordinates: { lat: 12.4208, lng: 75.7346 },
        interests: ["history", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Talakaveri and Bhagamandala",
        description: "The source of the Kaveri river, with a temple and tank, and a sacred confluence nearby at Bhagamandala. Dress modestly and follow temple rules. Fog and rain are common.",
        visitHours: 3,
        coordinates: { lat: 12.3866, lng: 75.4966 },
        interests: ["spiritual", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Dubare Elephant Camp",
        description: "A forest camp on the Kaveri river where elephants are bathed and fed; activities and rules change and may be restricted. Choose experiences that do not involve riding elephants.",
        visitHours: 2.5,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Coffee estate walk",
        description: "A guided walk through a coffee and pepper estate, usually with a tasting. Choose an estate that explains the work and pays staff fairly.",
        visitHours: 2,
        interests: ["food", "nature", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Namdroling Monastery, Bylakuppe",
        description: "A large Tibetan Buddhist monastery in a settlement just beyond Kodagu's eastern boundary, with a golden temple. Dress modestly, speak quietly and ask before photographing monks.",
        visitHours: 2,
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is dry and cool, with the coffee blossom in March and April. The monsoon (June to September) brings very heavy rain, landslide risk and closed trails, though waterfalls are at their fullest. April and May are warm but pleasant at altitude.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 7000],
      comfort: [9000, 20000],
      assumptions: "Per person per day, two sharing, in a homestay or modest hotel, with a car and driver shared between two. Estate stays with meals are often priced per person including food; entry fees and activities are extra."
    },
    gettingThere: {
      air: "Mysuru (about 120 km) and Mangaluru (about 135 km) are the nearest airports with scheduled services; Kannur in Kerala is also an option. Bengaluru is a longer drive.",
      rail: "There is no railway line in Kodagu. Mysuru is the nearest major railhead, around 120 km away.",
      road: "Roads from Mysuru, Mangaluru, Hassan and Kannur reach Madikeri. Some ghat sections are narrow and landslide-prone in the monsoon.",
      local: "Taxis and hired cars are the main way around; local buses link towns. Auto-rickshaws serve Madikeri and Kushalnagar."
    },
    accommodation: "Homestays on coffee estates, resorts and hotels in Madikeri are common. Estates give a quieter stay but are remote. Book ahead for weekends and holidays, and check access roads in the monsoon.",
    cuisine: [
      { name: "Pandi curry", note: "A Kodava pork curry cooked with kachampuli vinegar." },
      { name: "Kadambuttu", note: "Soft rice dumplings served with curries." },
      { name: "Akki roti and noolputtu", note: "Rice-based breakfast breads and rice noodles." },
      { name: "Kodava coffee", note: "Locally grown coffee, often served strong with milk." }
    ],
    festivals: ["Kaveri Sankramana", "Puthari (harvest festival)", "Kailpodh", "Kodava Hockey Festival"],
    festivalSlugs: [],
    nearby: [
      { name: "Bylakuppe", distanceKm: 40, note: "Tibetan settlement with monasteries and a golden temple." },
      { name: "Dubare", distanceKm: 45, note: "Elephant camp on the Kaveri." },
      { name: "Mysuru", distanceKm: 120, note: "Former royal city with a palace.", destinationSlug: "mysuru" },
      { name: "Wayanad", distanceKm: 100, note: "Hill district in Kerala, reached through the forest roads." }
    ],
    precautions: [
      "Landslides and flooding occur in the monsoon; check road status and local advice, and avoid travelling during heavy rain warnings.",
      "Ghat roads are narrow with sharp bends. Avoid night driving.",
      "Leeches and insects are common on forest trails in the rains; wear closed shoes and carry repellent.",
      "Waterfalls can rise quickly; do not swim in unmarked pools."
    ],
    tips: [
      "Stay on a working estate to see harvesting and processing, and ask what each season involves.",
      "Visit viewpoints early, when fog is lower and views clearer.",
      "Try local food in a Kodava home or reputable restaurant, and ask about pork and vegetarian options.",
      "Carry cash; ATMs and mobile signal can be patchy outside towns."
    ],
    accessibility: "Terrain is hilly, and waterfalls, forts and viewpoints involve steps and uneven paths. Abbey Falls has a staircase of many steps. I could not confirm step-free access to sights, so ask homestays and operators before booking.",
    responsibleTravel: "Estates are private land and workplaces, so stay on paths, avoid littering and do not disturb workers. Avoid elephant riding and other activities that harm animals. Respect Kodava customs, and keep to the rules at temples, monasteries and sacred groves.",
    faqs: [
      { question: "Is Coorg the same as Kodagu?", answer: "Yes. Coorg was the British-era name, and Kodagu is the local and official name. Both are used in tourism." },
      { question: "How long should I stay in Coorg?", answer: "Two to three days cover the main sights. A longer stay suits trekking or an estate retreat." },
      { question: "Is Coorg safe to visit in the monsoon?", answer: "It can be, but the rains are heavy and landslides or road closures are possible. Check forecasts and local advice, and avoid travelling during red alerts." },
      { question: "Can I take a bus to Coorg?", answer: "Yes, state and private buses run from Bengaluru, Mysuru and Mangaluru to Madikeri. A car is more convenient once you are there." }
    ],
    officialLinks: [
      { label: "Karnataka Tourism", url: "https://www.karnatakatourism.org" }
    ],
    sources: [
      { label: "Kodagu district, Wikipedia", url: "https://en.wikipedia.org/wiki/Kodagu_district" },
      { label: "Kodava people, Wikipedia", url: "https://en.wikipedia.org/wiki/Kodava_people" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "madurai",
    name: "Madurai",
    stateSlug: "tamil-nadu",
    region: "south",
    tagline: "A temple city on the Vaigai river, centred on the Meenakshi Amman Temple and one of South India's oldest settlements.",
    categories: ["temples-heritage", "religious", "cultural", "weekend"],
    coordinates: { lat: 9.9195, lng: 78.1193 },
    wikipediaTitle: "Madurai",
    popular: true,
    hiddenGem: false,
    overview: [
      "Madurai is a city in southern Tamil Nadu, on the banks of the Vaigai river. It is among the oldest continuously inhabited cities in India, with literary references going back to the Sangam period, and it is the cultural capital of the Tamil country. The old town is laid out in concentric streets around the Meenakshi Amman Temple.",
      "The temple, dedicated to the goddess Meenakshi and her consort Sundareswarar, is a large complex with tall painted gopurams, a Hall of Thousand Pillars and a sacred tank. It is an active temple, with daily rituals and evening ceremonies, and many visitors come to watch. Rules for photography, phones and dress apply, and non-Hindu entry to inner shrines is the subject of court orders and local rules, so ask at the entrance.",
      "Elsewhere, the Thirumalai Nayakkar Mahal, a 17th-century palace, the Gandhi Memorial Museum and the Vandiyur Mariamman Teppakulam tank complete a day of sights. The city is also known for its food, jasmine flowers, and its night life, since the streets around the temple stay active late.",
      "Madurai can be hot, crowded and noisy. The Chithirai festival in April or May draws large crowds, and January's Pongal brings the jallikattu events at nearby villages."
    ],
    history: [
      "Madurai was the capital of the Pandya dynasty for much of the first millennium CE and is linked in Tamil literature with the Sangam academies. It later came under the Cholas, the Delhi Sultanate and the Madurai Sultanate before the Vijayanagara empire took over in the 14th century.",
      "The Nayak rulers, who governed as Vijayanagara governors and then independently from the 16th century, rebuilt the Meenakshi Temple and laid out the city's streets. Thirumalai Nayak, who ruled from 1623 to 1659, built the palace that carries his name.",
      "The British East India Company took control in the 18th century. In recent years, excavations at Keezhadi, a short distance away, have revealed an urban settlement dating back more than two thousand years, and have drawn new attention to the region's early history."
    ],
    attractions: [
      {
        name: "Meenakshi Amman Temple",
        description: "A walled temple complex with gopurams covered in painted figures, a hall of carved pillars and a golden-lotus tank. Footwear is left outside, and phones and cameras are restricted inside, with lockers nearby. The evening ritual is worth watching quietly.",
        visitHours: 3,
        coordinates: { lat: 9.9195, lng: 78.1193 },
        interests: ["spiritual", "history", "culture"],
        timeOfDay: "evening"
      },
      {
        name: "Thirumalai Nayakkar Mahal",
        description: "The surviving part of a 17th-century palace with large pillars and arches in an Indo-Saracenic style. A sound and light show is held in the evening; confirm timings.",
        visitHours: 1.5,
        coordinates: { lat: 9.9150, lng: 78.1260 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Gandhi Memorial Museum",
        description: "A museum in a former Nayak-era palace with exhibits on the independence movement and a section on South Indian crafts. Check opening days.",
        visitHours: 1.5,
        coordinates: { lat: 9.9411, lng: 78.1424 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Vandiyur Mariamman Teppakulam",
        description: "A very large temple tank, with a central pavilion, used for a float festival in the Tamil month of Thai. It is mostly a quiet place outside festival days.",
        visitHours: 1,
        coordinates: { lat: 9.9141, lng: 78.1470 },
        interests: ["culture", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Keezhadi excavation site and museum",
        description: "An archaeological site where Sangam-period finds were uncovered, with a museum displaying them. It lies in Sivagangai district; confirm opening days and visiting arrangements.",
        visitHours: 2,
        coordinates: { lat: 9.8560, lng: 78.1850 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Alagar Koil",
        description: "A hill temple of Vishnu to the north of the city, in a wooded setting, whose deity is central to the Chithirai festival. It is a quieter alternative to the main temple.",
        visitHours: 2,
        interests: ["spiritual", "nature"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is cooler. Summer is very hot, with April to June temperatures often above 38 degrees Celsius. Chithirai in April or May is a major festival period, with heavy crowds and higher prices. The northeast monsoon brings rain from October to December.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6000],
      comfort: [7500, 16000],
      assumptions: "Per person per day, two sharing, using autos and city buses, with local meals. Taxis for outstation trips and any entry fees are extra. Room rates rise sharply during Chithirai."
    },
    gettingThere: {
      air: "Madurai Airport has flights to Chennai, Bengaluru, Mumbai, Delhi and some international destinations. Check current schedules.",
      rail: "Madurai Junction, close to the temple, is a major station with trains to Chennai, Coimbatore, Kanniyakumari, Rameswaram and beyond.",
      road: "National highways connect Madurai to Chennai, Tiruchirappalli, Kodaikanal, Theni and the Kerala border. Mattuthavani is the main bus terminal.",
      local: "Autos, app cabs and city buses are widely available. Cycle rickshaws operate near the temple. The temple area is mostly pedestrian-friendly."
    },
    accommodation: "Hotels from budget to luxury are concentrated around the temple and the railway station. Staying close to the temple lets you attend early and late rituals on foot. Book ahead for Chithirai and for the Thai Pongal period.",
    cuisine: [
      { name: "Jigarthanda", note: "A cold drink of milk, almond gum and ice cream, a Madurai speciality." },
      { name: "Kari dosai and parotta", note: "Meat-topped dosa and layered flatbread served late into the night." },
      { name: "Idli and filter coffee", note: "A common breakfast in Tamil households and restaurants." },
      { name: "Paruthi paal", note: "A drink made from cottonseed milk, found in local stalls." }
    ],
    festivals: ["Chithirai Thiruvizha", "Pongal", "Thai Poosam float festival", "Diwali"],
    festivalSlugs: ["pongal", "diwali"],
    nearby: [
      { name: "Keezhadi", distanceKm: 12, note: "Archaeological site and museum." },
      { name: "Alagar Koil", distanceKm: 21, note: "Hill temple north of the city." },
      { name: "Kodaikanal", distanceKm: 120, note: "Hill station in the Palani hills." },
      { name: "Munnar", distanceKm: 160, note: "Tea hills in Kerala.", destinationSlug: "munnar" }
    ],
    precautions: [
      "Heat in summer is intense; plan temple visits for early morning or evening.",
      "Watch your belongings in crowded areas, particularly around the temple during festivals.",
      "Do not carry banned items such as phones or cameras into the temple; use lockers.",
      "Agree on auto fares in advance or use app cabs."
    ],
    tips: [
      "Visit the temple in the evening for the closing ritual, and in the morning for fewer crowds.",
      "Dress modestly: cover shoulders and knees, and carry socks if the stone floors are hot.",
      "Allow time for a late-night meal; the streets around the temple are lively.",
      "Hire a licensed guide for the Meenakshi Temple if you want the iconography explained."
    ],
    accessibility: "The temple has stone floors, steps at gateways and crowds that can be hard for wheelchair users, and the sanctum areas have restrictions. I could not confirm step-free routes through the complex. Streets around the temple are crowded and uneven.",
    responsibleTravel: "The Meenakshi Temple is a living place of worship. Observe the rules on dress, phones and photography, and do not disturb devotees. Buy flowers, silks and crafts from local vendors, and avoid littering in temple streets and the tank.",
    faqs: [
      { question: "Can non-Hindus enter the Meenakshi Temple?", answer: "Rules on entry to inner shrines have been the subject of court orders and local practice, so they can change. Ask at the temple entrance, and follow the staff's instructions." },
      { question: "Can I take photos inside the temple?", answer: "Phones and cameras are restricted inside the temple, and lockers are provided outside. The gopurams can be photographed from the street." },
      { question: "How many days do I need in Madurai?", answer: "Two days is enough for the temple, palace, museum and a food walk. A third day can cover Keezhadi and Alagar Koil." },
      { question: "When is the Chithirai festival?", answer: "It is held in the Tamil month of Chithirai, usually April or May. The dates change each year, so check with Tamil Nadu Tourism or the temple." }
    ],
    officialLinks: [
      { label: "Tamil Nadu Tourism", url: "https://www.tamilnadutourism.tn.gov.in" }
    ],
    sources: [
      { label: "Madurai, Wikipedia", url: "https://en.wikipedia.org/wiki/Madurai" },
      { label: "Meenakshi Temple, Wikipedia", url: "https://en.wikipedia.org/wiki/Meenakshi_Temple" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "mahabalipuram",
    name: "Mahabalipuram",
    stateSlug: "tamil-nadu",
    region: "south",
    tagline: "A Pallava-era coastal town of rock-cut temples, a shore temple and sculptors' workshops, south of Chennai.",
    categories: ["monuments", "temples-heritage", "beaches", "weekend"],
    coordinates: { lat: 12.6168, lng: 80.1992 },
    wikipediaTitle: "Mahabalipuram",
    popular: true,
    hiddenGem: false,
    overview: [
      "Mahabalipuram, also called Mamallapuram, is a small town on the Bay of Bengal, about 55 km south of Chennai. It is known for the stone monuments carved under the Pallava dynasty in the 7th and 8th centuries, which UNESCO inscribed in 1984 as the Group of Monuments at Mahabalipuram. The sites are close together and can be covered on foot in a day.",
      "The Shore Temple, a granite temple facing the sea, is the most photographed monument. Inland are the Pancha Rathas, five rock-cut monoliths shaped like chariots; the huge bas-relief known as Arjuna's Penance or the Descent of the Ganga; Krishna's Butter Ball, a boulder balanced on a slope; and rock-cut caves with carved panels. Some are ASI ticketed, and others are free to view.",
      "The town is also a centre of stone carving, and the streets are lined with workshops where sculptors make granite figures and soapstone items. A small beach with fishing boats lies beside the Shore Temple, and a longer, quieter stretch runs to the south. Cafes and guesthouses cater to day-trippers from Chennai and longer-stay visitors.",
      "Mahabalipuram has a relaxed pace. It is hot and humid most of the year, with the main cooler season from November to February, and cyclone weather is a risk from October to December."
    ],
    history: [
      "Mahabalipuram was a port of the Pallava kings, whose capital was at Kanchipuram. Most of the monuments date from the reigns of Mahendravarman I, Narasimhavarman I, nicknamed Mamalla, and Narasimhavarman II (Rajasimha) between about 600 and 730 CE. The town's alternative name, Mamallapuram, is linked to Mamalla.",
      "The monuments are a record of early Dravidian temple architecture, moving from rock-cut caves to monoliths and then free-standing structural temples such as the Shore Temple. They influenced later Chola and other South Indian temple styles, and links with Southeast Asian architecture are discussed by scholars.",
      "The town later declined as the Pallavas lost power, and the Shore Temple was partly buried in sand and affected by erosion. The Archaeological Survey of India has conserved the main monuments, and the Indian prime minister hosted a bilateral meeting with the Chinese president here in 2019."
    ],
    attractions: [
      {
        name: "Shore Temple",
        description: "A granite temple complex of the early 8th century with two main shrines to Shiva and one to Vishnu. It is ticketed and protected by a barrier from sea spray. It gets crowded at sunrise and weekends.",
        visitHours: 1.5,
        coordinates: { lat: 12.6168, lng: 80.1992 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Pancha Rathas",
        description: "Five monolithic temples carved from single rock outcrops, named after the Pandava brothers and Draupadi, though they are not dedicated to them. Ticketed ASI site with open ground and little shade.",
        visitHours: 1.5,
        coordinates: { lat: 12.6081, lng: 80.2010 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Arjuna's Penance (Descent of the Ganga)",
        description: "A large open-air relief carved on two boulders, with elephants, deities and figures in procession. It is in the town and free to view.",
        visitHours: 1,
        coordinates: { lat: 12.6178, lng: 80.1928 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Krishna's Butter Ball and the hill monuments",
        description: "A giant boulder balanced on a slope, with rock-cut caves and a lighthouse on the hill nearby. The climbs are short but over rock; wear grippy shoes.",
        visitHours: 1.5,
        coordinates: { lat: 12.6171, lng: 80.1915 },
        interests: ["history", "photography", "adventure"],
        timeOfDay: "afternoon"
      },
      {
        name: "Stone-carving workshops",
        description: "Open-air workshops where artisans carve granite and soapstone. Watching is free; buy only if you want to, and ask about shipping. Ask permission before photographing workers.",
        visitHours: 1,
        interests: ["culture", "shopping"],
        timeOfDay: "any"
      },
      {
        name: "Beach at the Shore Temple",
        description: "A small public beach with fishing boats. Swimming is risky because of currents; the beach is mostly for walks and views.",
        visitHours: 1,
        interests: ["relaxation", "photography"],
        timeOfDay: "evening"
      }
    ],
    bestMonths: [11, 12, 1, 2, 3],
    bestTimeNote: "November to February is the most comfortable period, though cyclone-related rain is possible in November and December. March is warmer. April to June is hot and humid, and the monsoon rainfall on this coast mostly falls from October to December.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6500],
      comfort: [8000, 18000],
      assumptions: "Per person per day, two sharing, in a guesthouse or mid-range hotel, with local meals and autos or bicycles. Entry fees for ticketed monuments, taxis from Chennai and any guide are extra. Foreign nationals pay a higher rate at ASI sites."
    },
    gettingThere: {
      air: "Chennai International Airport is the nearest major airport, about 55 km north, and the drive takes one to two hours depending on traffic.",
      rail: "Chengalpattu Junction, about 30 km inland, is the nearest major station; Chennai also has long-distance services. Buses are the usual way in.",
      road: "The East Coast Road from Chennai is the scenic route, and state and private buses run frequently. Puducherry is about 100 km south on the same road.",
      local: "Autos, cycle rickshaws and rented bicycles are the usual ways around the town, which is compact."
    },
    accommodation: "Guesthouses, boutique hotels and beach resorts are available, many within walking distance of the monuments. Rooms near the Shore Temple are convenient. Book ahead for weekends and during the Dance Festival season.",
    cuisine: [
      { name: "Fresh seafood", note: "Fish, prawns and crab are served in beachside restaurants; check freshness and prices before ordering." },
      { name: "Tamil meals", note: "Rice served with sambar, rasam and vegetables, often on banana leaf." },
      { name: "Filter coffee and idli", note: "A common breakfast." },
      { name: "Kothu parotta", note: "Shredded flatbread stir-fried with eggs or meat, a street food classic." }
    ],
    festivals: ["Mamallapuram Dance Festival", "Pongal", "Masi Magam"],
    festivalSlugs: ["pongal"],
    nearby: [
      { name: "Madras Crocodile Bank", distanceKm: 14, note: "Reptile conservation centre on the East Coast Road." },
      { name: "DakshinaChitra", distanceKm: 30, note: "Museum of South Indian living traditions and crafts." },
      { name: "Kanchipuram", distanceKm: 70, note: "Pallava and Chola temple town known for silk." },
      { name: "Puducherry", distanceKm: 100, note: "Former French colony on the coast.", destinationSlug: "puducherry" }
    ],
    precautions: [
      "Do not swim at beaches with strong currents; there are few lifeguards.",
      "Sun exposure at the monuments is high, with little shade at the Pancha Rathas and the Shore Temple.",
      "Beware of touts offering guides or souvenir deals; agree prices first.",
      "Check cyclone warnings in October to December before travelling."
    ],
    tips: [
      "Arrive at the Shore Temple early to avoid crowds and heat.",
      "Buy tickets at the counter or online where available, and keep them for the Pancha Rathas and other ASI sites.",
      "Take a guide for the relief panels; the stories are hard to follow unaided.",
      "Combine with Puducherry or Chennai on a longer route along the East Coast Road."
    ],
    accessibility: "The Shore Temple and Pancha Rathas have paved paths but uneven ground, steps and sandy areas. Arjuna's Penance is at street level. I could not confirm step-free access at all monuments; ask ASI or your hotel in advance.",
    responsibleTravel: "The temples are protected monuments, and some are still used for worship. Do not climb on the carvings or leave litter on the beach. Buy from the carvers directly, and check that stone items are not made from protected materials.",
    faqs: [
      { question: "Is Mahabalipuram the same as Mamallapuram?", answer: "Yes. The state government uses Mamallapuram, derived from Narasimhavarman's title Mamalla, but Mahabalipuram is still widely used on maps and tickets." },
      { question: "Can I visit Mahabalipuram as a day trip from Chennai?", answer: "Yes. Leave early, spend the morning at the monuments and return in the afternoon, but allow for traffic on the East Coast Road." },
      { question: "Which monuments need tickets?", answer: "The Shore Temple and Pancha Rathas are ticketed by ASI; Arjuna's Penance and Krishna's Butter Ball can be viewed freely. Confirm the current arrangements locally." },
      { question: "Is the beach good for swimming?", answer: "It is mostly for walking. Currents can be strong, and there are few lifeguards, so swimming is risky." }
    ],
    officialLinks: [
      { label: "Tamil Nadu Tourism", url: "https://www.tamilnadutourism.tn.gov.in" }
    ],
    sources: [
      { label: "Mahabalipuram, Wikipedia", url: "https://en.wikipedia.org/wiki/Mahabalipuram" },
      { label: "Group of Monuments at Mahabalipuram, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/249" }
    ],
    lastReviewed: "2026-11-08"
  },
];
