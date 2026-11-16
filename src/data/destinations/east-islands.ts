import type { Destination } from "@/types/content";

export const eastIslandDestinations: Destination[] = [
  {
    slug: "puducherry",
    name: "Puducherry",
    stateSlug: "puducherry",
    region: "south",
    tagline: "A former French settlement on the Coromandel Coast, with a gridded old quarter, a seafront promenade and the experimental township of Auroville nearby.",
    categories: ["beaches", "cultural", "weekend", "religious"],
    coordinates: { lat: 11.9416, lng: 79.8083 },
    wikipediaTitle: "Puducherry",
    popular: true,
    hiddenGem: false,
    overview: [
      "Puducherry, still widely written as Pondicherry, is a small coastal city on the Bay of Bengal about 150 km south of Chennai. It is the capital of the Union Territory of Puducherry, which also includes the detached enclaves of Karaikal, Mahe and Yanam. Most visitors come for the old town, where the streets follow a grid laid out by the French and are lined with ochre, yellow and white colonial houses with deep verandas.",
      "The old town is split by a former canal. The French or White Town lies between the canal and the sea, with quiet lanes, restored mansions, cafes and the Promenade along the water. The Tamil quarter, or Black Town, to the west is denser and noisier, with temples, markets and textile shops. Walking from one side to the other makes the layered colonial and Tamil history easy to read.",
      "Two institutions give the place a character unlike other Tamil Nadu coastal towns. The Sri Aurobindo Ashram, founded in the 1920s around the philosopher Sri Aurobindo and the spiritual leader known as The Mother, runs from the old town. Auroville, an international township founded in 1968, lies a short way north in the Tamil Nadu part of the coast. Visitors are asked to treat both as places of quiet practice rather than attractions.",
      "The city works best as a slow two or three-day stop. Mornings are best for walking before the heat builds, and the beaches here are rocky or narrow with strong surf, so they suit strolling more than swimming. Many restaurants serve French-influenced and Creole-influenced dishes alongside Tamil meals, and alcohol is taxed lower here than in neighbouring Tamil Nadu, which shapes the evening scene."
    ],
    history: [
      "Settlements on this coast are old. Archaeologists have linked the site of Arikamedu, a few kilometres south, to Roman-era trade with the Mediterranean in the early centuries CE. Later the area passed through Pallava, Chola, Vijayanagara and Mughal-era hands.",
      "The French East India Company established a trading post in 1674, and Pondicherry became the main French base in India. It changed hands between the French, Dutch and British several times in the 17th and 18th centuries, and the French finally regained it after 1816. The town plan with its regular blocks dates from this long colonial period.",
      "After Indian independence in 1947, the French territories stayed under French rule for several years. Pondicherry was transferred de facto to India in 1954 and de jure in 1962, and the name was officially changed to Puducherry in 2006. Many residents still hold French citizenship or speak French, and the language is taught in local schools."
    ],
    attractions: [
      {
        name: "French Quarter (White Town)",
        description: "A grid of quiet streets with restored colonial houses, small galleries, cafes and shops. It is best explored on foot or by bicycle in the early morning or after sunset.",
        visitHours: 3,
        coordinates: { lat: 11.9335, lng: 79.8330 },
        interests: ["history", "photography", "food"],
        timeOfDay: "morning"
      },
      {
        name: "Promenade Beach",
        description: "A paved seafront walk of about a kilometre with a war memorial, a statue of Gandhi and an old lighthouse. Traffic is closed to vehicles in the evening hours, but check current arrangements. The water is not suitable for swimming.",
        visitHours: 1.5,
        coordinates: { lat: 11.9328, lng: 79.8363 },
        interests: ["relaxation", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Sri Aurobindo Ashram",
        description: "A spiritual community centred on the Samadhi of Sri Aurobindo and The Mother. Entry to the courtyard is allowed during set hours with silence and respectful dress expected; photography is restricted, so ask staff.",
        visitHours: 1,
        coordinates: { lat: 11.9344, lng: 79.8305 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Immaculate Conception Cathedral",
        description: "A church in the Black Town built in the 18th century in the Jesuit tradition. Its white facade and twin towers are a landmark of the Tamil quarter.",
        visitHours: 0.75,
        coordinates: { lat: 11.9340, lng: 79.8343 },
        interests: ["history", "spiritual"],
        timeOfDay: "morning"
      },
      {
        name: "Auroville and the Matrimandir",
        description: "An experimental international township about 10 km north. The golden Matrimandir is a meditation space whose interior is accessible only with a pass arranged through the visitors' centre; confirm booking rules on the Auroville website before going.",
        visitHours: 4,
        coordinates: { lat: 12.0057, lng: 79.8106 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Manakula Vinayagar Temple",
        description: "A busy Ganesha temple in the Tamil quarter, known for its temple elephant that blesses visitors. Non-Hindus may enter the outer area; remove footwear and dress modestly.",
        visitHours: 0.75,
        coordinates: { lat: 11.9345, lng: 79.8335 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is cooler and drier, though the northeast monsoon brings heavy rain and occasional cyclones between October and December. April to June is hot and humid.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 6500],
      comfort: [8000, 15000],
      assumptions: "Per person per day for one person sharing a double room. Covers a guesthouse or hotel, local meals, auto-rickshaw or bicycle hire. Excludes transport to Puducherry, alcohol and Auroville workshops. Rates rise sharply over weekends, New Year and long holidays."
    },
    gettingThere: {
      air: "Puducherry airport has limited scheduled service, so most travellers fly into Chennai (about 150 km, 3 to 4 hours by road) or Tiruchirappalli. Check current flights, as services change.",
      rail: "Puducherry station connects by a branch line to Villupuram on the main Chennai–Tamil Nadu route, with direct services to some cities. Chennai Egmore and Villupuram are the usual railheads.",
      road: "The East Coast Road from Chennai is the scenic route. State and private buses run from Chennai, Bengaluru and Tamil Nadu towns.",
      local: "Autos, rented scooters and bicycles are the practical way around. Walking is easiest inside the old town."
    },
    accommodation: "Heritage guesthouses and boutique hotels cluster in the French Quarter, with larger resorts on the coast road north and south. Auroville has guesthouses for longer stays. Book ahead for weekends and December to January.",
    cuisine: [
      { name: "Creole and French-influenced dishes", note: "Cafes in White Town serve crepes, baguette sandwiches and seafood with Tamil spicing." },
      { name: "Meen kuzhambu and fried fish", note: "Tamil coastal fish curries are served at small local restaurants in the Black Town." },
      { name: "Filter coffee and idli-dosai", note: "Standard Tamil breakfast fare is available at inexpensive local eateries." },
      { name: "Pondicherry baguette and pastries", note: "French-style bakeries sell baguettes, croissants and cakes." }
    ],
    festivals: ["Bastille Day (14 July, observed by the French community)", "Pongal", "Christmas", "Puducherry Heritage Festival (check current dates)"],
    festivalSlugs: ["pongal", "christmas"],
    nearby: [
      { name: "Auroville", distanceKm: 10, note: "International township with the Matrimandir and visitor centre." },
      { name: "Arikamedu", distanceKm: 4, note: "Ancient trading site, now a modest archaeological area." },
      { name: "Mahabalipuram", distanceKm: 100, note: "Shore Temple and rock-cut monuments on the East Coast Road.", destinationSlug: "mahabalipuram" },
      { name: "Chidambaram", distanceKm: 70, note: "Nataraja temple town in Tamil Nadu." },
      { name: "Madurai", distanceKm: 280, note: "Meenakshi temple city, reachable by road or train.", destinationSlug: "madurai" }
    ],
    precautions: [
      "Do not swim on the Promenade Beach or most beaches here; the surf and currents are strong, and lifeguard cover is thin.",
      "Rented scooters are popular but traffic is mixed and pavements are narrow. Carry a licence and wear a helmet.",
      "The northeast monsoon and cyclones can disrupt travel between October and December. Check weather forecasts.",
      "Dress modestly and remove footwear at temples, the ashram and churches.",
      "Auroville and the ashram are living communities. Stay within visitor areas and ask before photographing people."
    ],
    tips: [
      "Walk the French Quarter early, before cafes open and the heat builds.",
      "Book Matrimandir visits in advance through Auroville's official channels.",
      "Stay in the old town if you want to avoid traffic; stay on the coast road if you want a quieter beach.",
      "Carry cash for small shops and temples, though cards and UPI work in most cafes.",
      "Weekdays are far quieter than weekends, especially from December to January."
    ],
    accessibility: "Old-town streets are mostly flat but pavements are narrow and uneven in places, and some heritage buildings have steps at the entrance. Auroville distances are long and the Matrimandir viewing point involves a walk. Confirm step-free access individually with venues.",
    responsibleTravel: "Respect the ashram and Auroville as places of practice, not attractions. Avoid plastic on the beach, support small local businesses and fishers, and buy crafts from recognised cooperatives.",
    faqs: [
      { question: "Is Puducherry in Tamil Nadu?", answer: "No. It is a separate Union Territory, although the city is surrounded by Tamil Nadu on three sides and the culture is largely Tamil. Auroville lies just outside the territory in Tamil Nadu." },
      { question: "Can I swim at the beaches?", answer: "Swimming is risky at most local beaches because of strong surf and currents. Resorts with pools or sheltered beaches are safer; ask locals or lifeguards about conditions." },
      { question: "How many days do I need?", answer: "Two days cover the old town, the ashram and a visit to Auroville. Three or four days suit a slower pace with cafes and nearby coastal day trips." },
      { question: "Is alcohol allowed?", answer: "Alcohol is legally sold here and is cheaper than in many Indian states. Drinking in public places is restricted, so stay within licensed premises." }
    ],
    officialLinks: [],
    sources: [
      { label: "Puducherry - Wikipedia", url: "https://en.wikipedia.org/wiki/Puducherry" },
      { label: "Auroville - Wikipedia", url: "https://en.wikipedia.org/wiki/Auroville" },
      { label: "Sri Aurobindo Ashram - Wikipedia", url: "https://en.wikipedia.org/wiki/Sri_Aurobindo_Ashram" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    stateSlug: "telangana",
    region: "south",
    tagline: "A Deccan city of Qutb Shahi and Nizam-era monuments, famous for its biryani, pearls and a large technology sector.",
    categories: ["monuments", "forts-palaces", "cultural", "weekend"],
    coordinates: { lat: 17.3850, lng: 78.4867 },
    wikipediaTitle: "Hyderabad, India",
    popular: true,
    hiddenGem: false,
    overview: [
      "Hyderabad is the capital of Telangana and one of India's largest cities. It sits on the Deccan Plateau on the Musi river, with the Hussain Sagar lake at its centre and the walled Old City to the south. The Old City is the part most visitors come for, with Charminar, the Mecca Masjid, the Laad Bazaar and the Chowmahalla Palace within a short distance of each other.",
      "The city's different areas feel like separate towns. The Old City is dense, crowded and often loud, with traders selling bangles, attar and pearls. Banjara Hills and Jubilee Hills have restaurants and galleries. HITEC City, to the west, is a modern business district of glass towers that employs many people across India's technology industry.",
      "Hyderabad is also known for its food, which combines Telugu, Mughlai and Deccani traditions. Biryani is the best-known dish, but Haleem, Irani chai, Osmania biscuits and a long list of sweets are all part of how people eat here. Many of the best-regarded places are modest and crowded, with queues at peak hours.",
      "It suits a three-day visit. Golconda Fort and the Qutb Shahi Tombs are on the western edge, and the Salar Jung Museum and Chowmahalla Palace hold the Nizam-era collections. Summer is hot, and the monsoon brings heavy but usually short downpours that can flood low roads."
    ],
    history: [
      "The area was ruled by the Kakatiya dynasty and later the Bahmani Sultanate. In the 16th century, Golconda became the seat of the Qutb Shahi dynasty, whose fort and tombs still stand. Muhammad Quli Qutb Shah founded Hyderabad in 1591 on the southern bank of the Musi, and the Charminar was built soon afterwards.",
      "The Mughals took Golconda in 1687, and from 1724 the Asaf Jahi dynasty, the Nizams of Hyderabad, ruled the region from the city. Under the Nizams, Hyderabad grew into one of the largest princely states in British India and a centre of Urdu culture, building palaces, museums and the Osmania University.",
      "After Indian independence in 1947, the Nizam held out against joining India until the state was integrated in 1948 through a military operation. Hyderabad later became the capital of Andhra Pradesh, and in 2014 the state of Telangana was formed with Hyderabad as its capital. Hyderabad remains the shared capital of Andhra Pradesh and Telangana for a ten-year period that ended in 2024; confirm the current administrative status if it matters for your trip."
    ],
    attractions: [
      {
        name: "Charminar",
        description: "A four-minaret monument built in 1591 that is the emblem of the city. The surrounding market is crowded. Visitors can usually climb to an upper level; confirm access and hours with the Archaeological Survey of India.",
        visitHours: 1.5,
        coordinates: { lat: 17.3616, lng: 78.4747 },
        interests: ["history", "shopping", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Golconda Fort",
        description: "A Qutb Shahi fortress on a granite hill west of the city, known for its acoustic system and the climb to the upper palace. The ascent is by stone steps and uneven paths.",
        visitHours: 3,
        coordinates: { lat: 17.3833, lng: 78.4011 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Chowmahalla Palace",
        description: "The Nizams' formal palace complex, restored and open to visitors, with courtyards, a durbar hall and a collection of vintage cars and textiles.",
        visitHours: 2,
        coordinates: { lat: 17.3578, lng: 78.4717 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Salar Jung Museum",
        description: "One of the largest one-person collections in India, assembled by Mir Yousuf Ali Khan, Salar Jung III. It holds sculpture, manuscripts, clocks and furniture. Confirm opening days before going.",
        visitHours: 3,
        coordinates: { lat: 17.3713, lng: 78.4804 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Qutb Shahi Tombs",
        description: "A group of domed tombs of the Golconda rulers set in landscaped grounds near the fort. The site is quiet compared with the Old City.",
        visitHours: 1.5,
        coordinates: { lat: 17.3948, lng: 78.3938 },
        interests: ["history", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Mecca Masjid",
        description: "One of the oldest and largest mosques in the city, beside Charminar. Non-Muslim visitors may enter outside prayer times; dress modestly and cover your head and shoulders where asked.",
        visitHours: 0.75,
        coordinates: { lat: 17.3604, lng: 78.4736 },
        interests: ["spiritual", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Hussain Sagar",
        description: "A large artificial lake with a monolithic Buddha statue on an island, reached by boat. The lakeside promenade is busy in the evening.",
        visitHours: 1.5,
        coordinates: { lat: 17.4239, lng: 78.4738 },
        interests: ["relaxation", "photography"],
        timeOfDay: "evening"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is the most comfortable, with warm days and cool nights. March to June is very hot, often above 40 degrees Celsius, and the monsoon runs from June to September.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 7000],
      comfort: [8500, 18000],
      assumptions: "Per person per day for one person sharing a double room. Covers a hotel, local meals, app-based taxis and metro or auto fares. Excludes flights or trains to Hyderabad, shopping and entry fees."
    },
    gettingThere: {
      air: "Rajiv Gandhi International Airport at Shamshabad, about 25 km south-west of the centre, has domestic and international flights.",
      rail: "Secunderabad, Hyderabad Deccan (Nampally) and Kacheguda are the main stations, linked to most major Indian cities.",
      road: "National highways connect Hyderabad to Bengaluru, Mumbai, Vijayawada and Nagpur, with long-distance buses from the main bus stations.",
      local: "Hyderabad Metro covers several corridors, including some routes to the Old City; confirm the current network. App-based taxis and autos fill the gaps."
    },
    accommodation: "The Old City has budget hotels, while Banjara Hills, Jubilee Hills and the business districts have mid-range and large international hotels. Stay near a metro station to avoid long road transfers in rush-hour traffic.",
    cuisine: [
      { name: "Hyderabadi biryani", note: "Layered rice and meat cooked on dum, often with raita and mirchi ka salan." },
      { name: "Haleem", note: "A slow-cooked wheat and meat porridge served in large quantities during Ramadan; check dates." },
      { name: "Irani chai and Osmania biscuits", note: "Sweet, milky tea with salty-sweet biscuits served at old Irani cafes." },
      { name: "Double ka meetha and khubani ka meetha", note: "Traditional Deccan sweets made from bread or dried apricots." }
    ],
    festivals: ["Bonalu", "Eid", "Diwali", "Ugadi", "Bathukamma"],
    festivalSlugs: ["eid-al-fitr", "diwali"],
    nearby: [
      { name: "Golconda Fort", distanceKm: 11, note: "Qutb Shahi fort on the western edge of the city." },
      { name: "Ramoji Film City", distanceKm: 40, note: "Large film studio complex with tours; check the operator for dates and tickets." },
      { name: "Warangal", distanceKm: 150, note: "Kakatiya-era Warangal Fort and the Ramappa temple, a UNESCO site." },
      { name: "Nagarjuna Sagar", distanceKm: 165, note: "Large dam and Buddhist remains on the Krishna river." },
      { name: "Hampi", distanceKm: 380, note: "Vijayanagara ruins on the Tungabhadra river, a long road or rail journey.", destinationSlug: "hampi" }
    ],
    precautions: [
      "Summer heat can be severe from April to June; carry water and avoid midday walking.",
      "The Old City is crowded and traffic is heavy; keep valuables secure in markets.",
      "Dress modestly at mosques, temples and dargahs.",
      "Food hygiene varies; choose busy, well-cooked places if you have a sensitive stomach.",
      "Heavy monsoon rain can flood some underpasses and slow traffic."
    ],
    tips: [
      "Start at Golconda early to avoid the heat, then spend the afternoon in the Old City.",
      "Visit Charminar and Laad Bazaar in the evening when it is cooler, but expect crowds.",
      "Use the metro to avoid long road delays between the business districts.",
      "Try breakfast at an Irani cafe for a local experience.",
      "Ask for pearls and bangles from established shops; compare prices before buying."
    ],
    accessibility: "The Old City is crowded with uneven pavements. Golconda involves many steps and uneven stone paths, so it is difficult for wheelchair users. Chowmahalla Palace and Salar Jung Museum have steps at some entrances; confirm accessibility with each venue.",
    responsibleTravel: "Respect prayer times and dress rules at religious sites. Avoid littering at lakes and monuments, bargain politely, and buy crafts from artisans or registered shops.",
    faqs: [
      { question: "How many days do I need for Hyderabad?", answer: "Two full days cover Charminar, Golconda and a museum. Three or four allow a slower pace and a day trip to Warangal or Ramoji Film City." },
      { question: "What is the best way to see the Old City?", answer: "On foot, with a start from Charminar and a short walk through Laad Bazaar and the Mecca Masjid. Avoid driving into the area at peak times." },
      { question: "Is Hyderabad safe for solo travellers?", answer: "Generally yes, in the main visitor areas. Use app-based taxis after dark, keep valuables secure and be careful in crowded markets." },
      { question: "Which biryani should I try?", answer: "Hyderabadi dum biryani, cooked with rice and meat in a sealed pot, is the standard. Vegetarian versions are also widely available." }
    ],
    officialLinks: [
      { label: "Telangana Tourism", url: "https://tourism.telangana.gov.in" },
    ],
    sources: [
      { label: "Hyderabad, India - Wikipedia", url: "https://en.wikipedia.org/wiki/Hyderabad,_India" },
      { label: "Charminar - Wikipedia", url: "https://en.wikipedia.org/wiki/Charminar" },
      { label: "Golconda - Wikipedia", url: "https://en.wikipedia.org/wiki/Golconda" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "araku-valley",
    name: "Araku Valley",
    stateSlug: "andhra-pradesh",
    region: "south",
    tagline: "A cool hill valley in the Eastern Ghats, reached by a scenic railway from Visakhapatnam, with tribal markets, coffee and limestone caves.",
    categories: ["hill-stations", "village", "weekend", "photography"],
    coordinates: { lat: 18.3273, lng: 82.8775 },
    wikipediaTitle: "Araku Valley",
    popular: false,
    hiddenGem: true,
    overview: [
      "Araku Valley is a hill area in the Alluri Sitharama Raju district of Andhra Pradesh, about 110 km from Visakhapatnam in the Eastern Ghats. It sits at roughly 900 metres, which makes it noticeably cooler than the coast, with mist in winter mornings and plantations of coffee and pepper on the slopes.",
      "The area is home to several Adivasi communities, who farm, collect forest produce and run weekly markets. The Girijan Cooperative Corporation and the state forest department have helped develop coffee plantations managed by tribal farmers. The valley is best seen as a working agricultural landscape rather than a conventional hill station.",
      "The journey is part of the attraction. The railway from Visakhapatnam climbs the Eastern Ghats through dozens of tunnels and bridges, and some trains carry glass-roofed Vistadome coaches. The road is slower but passes viewpoints and waterfalls, including Katiki Falls and the Borra Caves, a large limestone cave system.",
      "A weekend is enough for the main sights, though the road in and out is long. Facilities are modest outside peak season, and mobile signal can vary in the hills."
    ],
    history: [
      "The Eastern Ghats around Araku have been home to Adivasi communities such as the Kondh, Khond, Bagata and Valmiki for centuries. Colonial forest laws and later development projects changed access to land and forest produce.",
      "The Kothavalasa–Kirandul railway was built to carry iron ore from the Bailadila mines in Chhattisgarh to Visakhapatnam port. It opened in the 1960s and passes through Araku, bringing passenger services into the valley.",
      "In recent decades, coffee cultivation has been developed as a tribal livelihood, and the valley has become a weekend destination for people from Visakhapatnam and Hyderabad. Tourism now sits beside farming, and some communities run homestays and market stalls."
    ],
    attractions: [
      {
        name: "Borra Caves",
        description: "A large limestone cave system with stalactites and stalagmites, lit for visitors. It lies on the road from Visakhapatnam, with steps and a sloping path inside.",
        visitHours: 2,
        coordinates: { lat: 18.2808, lng: 83.0390 },
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Tribal Museum, Araku",
        description: "A small museum run by the tribal welfare department that displays clothing, tools and jewellery of local communities. Confirm opening hours before visiting.",
        visitHours: 1,
        coordinates: { lat: 18.3273, lng: 82.8775 },
        interests: ["culture", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Katiki Falls",
        description: "A waterfall in the hills near Borra, best when the monsoon has fed the streams. The approach involves walking and steps.",
        visitHours: 1.5,
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Coffee plantations and local market",
        description: "Visit plantations managed by tribal cooperatives, and the weekly local market where tribal farmers sell produce. Ask before photographing people.",
        visitHours: 2,
        interests: ["culture", "food", "shopping"],
        timeOfDay: "morning"
      },
      {
        name: "Ananthagiri and Tyda",
        description: "Hill roads with viewpoints, forest and coffee gardens on the road to Borra Caves, good for a slow drive.",
        visitHours: 2,
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is cool and clear, with misty mornings in December and January. July to September is monsoon, when waterfalls are full but roads and caves can be affected.",
    recommendedDays: { min: 1, max: 3 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 5500],
      comfort: [6500, 12000],
      assumptions: "Per person per day, sharing a room. Covers a basic lodge or resort stay, meals and shared cabs. Excludes travel to Visakhapatnam and cave or train tickets. Prices peak on winter weekends."
    },
    gettingThere: {
      air: "Visakhapatnam airport is the nearest, about 110 km away by road.",
      rail: "The Visakhapatnam–Kirandul line runs through Araku, with passenger services and Vistadome coaches on some trains. Confirm timetables and seat availability on Indian Railways.",
      road: "State buses and private taxis run from Visakhapatnam, taking three to four hours. The road includes hill bends and can be slow in the monsoon.",
      local: "Local autos and hired taxis cover the main spots. Self-drive is possible, but hill roads need care."
    },
    accommodation: "Government-run and private resorts, small hotels and a few homestays are available in Araku and along the road. Options are limited during peak weekends, so book ahead.",
    cuisine: [
      { name: "Araku coffee", note: "Grown in the valley by tribal farmers and sold at local outlets and cooperative cafes." },
      { name: "Bamboo chicken", note: "A dish cooked in a bamboo tube over a fire, sold by tribal vendors near the caves." },
      { name: "Andhra meals", note: "Rice with spicy curries and pickles, served at roadside restaurants." }
    ],
    festivals: ["Araku Utsav (check dates)", "Makar Sankranti", "Dussehra"],
    festivalSlugs: ["makar-sankranti"],
    nearby: [
      { name: "Visakhapatnam", distanceKm: 110, note: "Port city with beaches, the Kailasagiri hill park and the submarine museum." },
      { name: "Lambasingi", distanceKm: 100, note: "A cool hill village known for winter mist; confirm road conditions." },
      { name: "Simhachalam", distanceKm: 125, note: "Hill temple north of Visakhapatnam dedicated to Narasimha." },
      { name: "Bheemunipatnam", distanceKm: 145, note: "Old Dutch-era beach town north of Visakhapatnam." }
    ],
    precautions: [
      "Mobile signal and ATMs are limited; carry some cash.",
      "Hill roads are winding. Avoid night driving and check road conditions in the monsoon.",
      "Do not stray off marked paths in forest areas, and follow local guidance.",
      "Caves have wet, uneven floors; wear shoes with grip.",
      "Ask permission before photographing local people, and do not pass money or sweets to children."
    ],
    tips: [
      "Book the Vistadome train early; it sells out on weekends.",
      "Start early to visit Borra Caves before the crowds.",
      "Buy coffee and honey from cooperative outlets to support tribal producers.",
      "Carry a light jacket in December and January.",
      "Weekdays are far quieter than weekends."
    ],
    accessibility: "Borra Caves and waterfalls involve steps, slopes and uneven ground. The road and train are the easier parts of the journey, but station platforms and viewpoints may not have ramps. Confirm access before travelling if mobility is a concern.",
    responsibleTravel: "Buy from tribal cooperatives rather than middlemen, pay fair prices, avoid plastic, and treat markets and villages as places where people live and work rather than as a backdrop.",
    faqs: [
      { question: "Is Araku Valley a good day trip from Visakhapatnam?", answer: "It is possible, but the road takes three to four hours each way. An overnight stay is much more relaxed." },
      { question: "Can I take the train?", answer: "Yes. The Visakhapatnam–Kirandul line passes through Araku. Some trains have glass-roofed Vistadome coaches; check the timetable and booking on Indian Railways." },
      { question: "Is there a permit?", answer: "No special permit is needed for Araku Valley itself. Some forest or cave areas have entry tickets." },
      { question: "When can I see the waterfalls at their fullest?", answer: "After the monsoon, in September and October, though road conditions may be affected." }
    ],
    officialLinks: [
      { label: "Andhra Pradesh Tourism", url: "https://tourism.ap.gov.in" },
    ],
    sources: [
      { label: "Araku Valley - Wikipedia", url: "https://en.wikipedia.org/wiki/Araku_Valley" },
      { label: "Borra Caves - Wikipedia", url: "https://en.wikipedia.org/wiki/Borra_Caves" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "gandikota",
    name: "Gandikota",
    stateSlug: "andhra-pradesh",
    region: "south",
    tagline: "A ruined hill fort above a red-rock gorge of the Pennar river, often compared with a canyon.",
    categories: ["forts-palaces", "photography", "hidden-gems", "weekend"],
    coordinates: { lat: 14.8147, lng: 78.2875 },
    wikipediaTitle: "Gandikota",
    popular: false,
    hiddenGem: true,
    overview: [
      "Gandikota is a village in Kadapa district, Andhra Pradesh, on the right bank of the Pennar river, about 15 km from Jammalamadugu. Its draw is a gorge where the river has cut through the Erramala hills, narrowing to around 100 metres at one point. The sandstone and quartzite cliffs are red-brown, and a viewpoint over the water makes it a popular photography stop. It is sometimes called the Grand Canyon of India, a comparison best taken as a local nickname rather than a literal one.",
      "The fort sits on the cliff edge. Inside its walls are two temples to Madhava and Ranganatha that are now largely ruined, along with a granary, a mosque with two minarets and a number of ruined palaces and water tanks. The mosque is the best preserved, and the site rewards slow walking more than any single monument.",
      "Gandikota is a small village with limited facilities, and visitors typically come as a day trip from Kadapa, or stay overnight in tents or basic guesthouses. The landscape is dry and hot for much of the year, and the best light is at sunrise and sunset.",
      "The area is rural and quiet. There is little shade inside the fort, and mobile coverage varies, so plan water, food and transport in advance."
    ],
    history: [
      "Local tradition links the first fort to Kaka Raja, a subordinate of the Kalyani Chalukyas, in the 12th century. The Kakatiyas later held the area, and the Pemmasani Nayaka chieftains expanded it into a significant fortified settlement under Vijayanagara rule.",
      "In the 16th century the fort passed to the Golconda Sultanate, and later Islamic additions such as the Jama Masjid date from this period. It was later contested by Mysore and the British, and it fell into ruin as the political centre moved elsewhere.",
      "The site became a tourist destination in recent decades after photographs of the gorge spread online. The state tourism department has promoted it with an annual cultural festival, though the numbers of visitors remain modest compared with larger heritage sites."
    ],
    attractions: [
      {
        name: "Pennar Gorge viewpoint",
        description: "A cliff-edge view of the river cutting through the hills. The edge is unfenced in places, so keep well back.",
        visitHours: 1.5,
        coordinates: { lat: 14.8147, lng: 78.2875 },
        interests: ["nature", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Gandikota Fort",
        description: "A ruined fort with walls, gates, granary and water tanks, set along the cliff edge. Most of the interior is walked on foot over uneven ground.",
        visitHours: 2,
        coordinates: { lat: 14.8140, lng: 78.2870 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Madhavaraya and Ranganatha temples",
        description: "Two ruined temples inside the fort, dedicated to Vishnu in his forms as Madhava and Ranganatha. Only parts survive.",
        visitHours: 1,
        interests: ["history", "spiritual"],
        timeOfDay: "morning"
      },
      {
        name: "Jama Masjid",
        description: "A mosque with twin minarets inside the fort, one of the better-preserved buildings. Dress modestly and ask before entering the prayer hall.",
        visitHours: 0.75,
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Pennar riverbank and boating",
        description: "Boating on the river and the reservoir behind the Mylavaram dam is available seasonally; confirm operator arrangements and safety on the day.",
        visitHours: 1,
        interests: ["nature", "relaxation"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is cooler. Summer is very hot, and during the monsoon the river is high and access can be affected.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [1000, 1800],
      midRange: [2500, 4500],
      comfort: [5000, 9000],
      assumptions: "Per person per day, with cab sharing. Covers a basic stay or tent camp, meals and local transport. Excludes travel to Kadapa or Bengaluru. Options are limited and prices vary on weekends."
    },
    gettingThere: {
      air: "Kadapa airport has limited services. Bengaluru and Tirupati are the larger gateways, several hours away by road.",
      rail: "Muddanur (about 26 km) and Jammalamadugu are the nearest railway stations. Kadapa is a larger junction.",
      road: "Buses run from Jammalamadugu to Gandikota, but a private car or taxi from Kadapa or Tadipatri is easier. Roads are rural.",
      local: "Within the fort, visitors must walk. Local autos and jeeps connect the village and viewpoints."
    },
    accommodation: "Accommodation is limited: government-run rooms, a handful of private lodges and seasonal tent camps near the gorge. Book ahead, particularly for weekends.",
    cuisine: [
      { name: "Rayalaseema meals", note: "Spicy local meals with ragi sangati and curries, available at small restaurants." },
      { name: "Gongura pachadi", note: "A tangy sorrel-leaf chutney common across Andhra Pradesh." },
      { name: "Roadside snacks", note: "Mirchi bajji and fresh juices near the entrance." }
    ],
    festivals: ["Gandikota Utsavalu (annual festival, check dates)", "Makar Sankranti"],
    festivalSlugs: ["makar-sankranti"],
    nearby: [
      { name: "Jammalamadugu", distanceKm: 15, note: "Nearest town with shops, banks and bus connections." },
      { name: "Muddanur", distanceKm: 26, note: "Nearest railway station." },
      { name: "Belum Caves", distanceKm: 90, note: "Large cave system in neighbouring Kurnool district; confirm road conditions." },
      { name: "Lepakshi", distanceKm: 230, note: "Vijayanagara-era temple with painted ceilings, a long drive away." },
      { name: "Hampi", distanceKm: 250, note: "Vijayanagara capital ruins in Karnataka.", destinationSlug: "hampi" }
    ],
    precautions: [
      "Cliff edges are unfenced in places. Keep back from the gorge, especially at sunset and with children.",
      "There is little shade; carry water, a hat and sun protection.",
      "Do not swim in the river without local advice, as currents and depths vary.",
      "Facilities are limited; carry cash and snacks.",
      "Do not climb on ruined walls or temple structures."
    ],
    tips: [
      "Arrive for sunrise or late afternoon for the best light.",
      "Hire a local guide for context on the fort's history.",
      "Combine with Belum Caves on a longer trip.",
      "Fill your fuel tank in Jammalamadugu or Kadapa.",
      "Check if tent camps are operating before planning an overnight stay."
    ],
    accessibility: "The fort involves uneven ground, loose stone and steps, and there are no ramps. The gorge viewpoint requires a walk. It is not suitable for wheelchair users, and those with limited mobility should expect difficulty.",
    responsibleTravel: "Carry out litter, do not climb on ruins, and avoid loud music. Use local guides and small businesses, and respect the mosque and temples as places of worship.",
    faqs: [
      { question: "Is Gandikota worth a visit?", answer: "It suits travellers who enjoy ruins and landscape photography and who accept limited facilities. It is a long drive from the main cities, so plan for travel time." },
      { question: "Can I do it as a day trip from Bengaluru?", answer: "It is possible but long. An overnight stay in Kadapa or at Gandikota is more practical." },
      { question: "Is the fort open all day?", answer: "Hours and tickets vary; confirm with the state tourism office or the site on arrival." },
      { question: "Is swimming allowed?", answer: "It is not advised without local guidance. Currents and rock formations can be dangerous." }
    ],
    officialLinks: [
      { label: "Andhra Pradesh Tourism", url: "https://tourism.ap.gov.in" },
    ],
    sources: [
      { label: "Gandikota - Wikipedia", url: "https://en.wikipedia.org/wiki/Gandikota" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "lakshadweep",
    name: "Lakshadweep",
    stateSlug: "lakshadweep",
    region: "islands",
    tagline: "A small coral archipelago in the Arabian Sea where visits are controlled by an entry permit and the draw is lagoons, diving and island life.",
    categories: ["beaches", "adventure", "village", "photography"],
    coordinates: { lat: 10.5667, lng: 72.6417 },
    wikipediaTitle: "Lakshadweep",
    popular: false,
    hiddenGem: false,
    overview: [
      "Lakshadweep is a Union Territory made up of 36 coral islands and reefs in the Arabian Sea, off the coast of Kerala. Only ten islands are inhabited, and the territory's capital is Kavaratti. The islands are low-lying atolls and coral islets, with white sand, lagoons and shallow reefs, and almost no land is higher than a few metres above the sea.",
      "Tourism is tightly controlled. Visitors need an entry permit from the Lakshadweep administration, and only some islands are open to non-residents. Indian citizens have been allowed to visit islands such as Kavaratti, Agatti, Bangaram, Kadmat and Minicoy, while foreign nationals have been limited to fewer islands. Rules and processing steps have changed in recent years, so check the official portal before planning.",
      "The population is largely Muslim, with Malayalam widely spoken on most islands and Mahl on Minicoy. Island life centres on fishing, coconut and a small tourism sector. Alcohol is generally not available outside designated resort arrangements, and modest dress is expected in villages.",
      "Travel logistics shape the trip. There is one airport, on Agatti, and ships from Kochi take much longer. Facilities are simple, and weather can disrupt flights and ferries. A visit suits people who want water-based activities and quiet, not nightlife or sightseeing."
    ],
    history: [
      "The islands were settled by seafarers from the Malabar coast, possibly in the first millennium CE, and local tradition links Islam's arrival to the 7th century and the saint Ubaidullah, whose tomb is on Andrott. The islands were later part of the Cannanore (Kannur) Arakkal kingdom's sphere.",
      "The Portuguese attempted to establish control in the 16th century but were driven out by local resistance. The Arakkal rulers later passed some islands to Tipu Sultan, and after 1799 the British took over. In the 19th century the islands became part of British Madras Presidency.",
      "After independence the islands were grouped as the Laccadive, Minicoy and Amindivi Islands, and in 1973 they were renamed Lakshadweep. They became a Union Territory in 1956. Since then, access has been regulated to protect fragile ecosystems and the culture of island communities."
    ],
    attractions: [
      {
        name: "Kavaratti",
        description: "The administrative capital and a base for visitors. It has a lagoon, a marine aquarium and several mosques, including the Ujra Mosque. Dress modestly in the village.",
        visitHours: 4,
        coordinates: { lat: 10.5626, lng: 72.6369 },
        interests: ["culture", "relaxation"],
        timeOfDay: "any"
      },
      {
        name: "Agatti",
        description: "The island with Lakshadweep's only airport. It has a large lagoon and is often the first stop for visitors, with water sports run through licensed operators.",
        visitHours: 4,
        coordinates: { lat: 10.8574, lng: 72.1760 },
        interests: ["relaxation", "adventure"],
        timeOfDay: "any"
      },
      {
        name: "Bangaram",
        description: "An uninhabited atoll with a large lagoon, long associated with a resort and diving. Access depends on current arrangements; confirm before planning.",
        visitHours: 5,
        coordinates: { lat: 10.9333, lng: 72.2833 },
        interests: ["relaxation", "adventure", "nature"],
        timeOfDay: "any"
      },
      {
        name: "Kadmat",
        description: "A long, narrow island known for diving, sailing and water sports, with a lagoon on its western side.",
        visitHours: 5,
        coordinates: { lat: 11.2167, lng: 72.7833 },
        interests: ["adventure", "relaxation"],
        timeOfDay: "any"
      },
      {
        name: "Minicoy",
        description: "The southernmost island, culturally distinct, with a lighthouse and a traditional Mahl-speaking community. Access for visitors depends on current rules and transport.",
        visitHours: 5,
        coordinates: { lat: 8.2833, lng: 73.0500 },
        interests: ["culture", "history"],
        timeOfDay: "any"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    bestTimeNote: "October to May has calmer seas and better visibility for snorkelling and diving. The southwest monsoon from June to September makes seas rough, and ferry services and some activities are suspended.",
    recommendedDays: { min: 4, max: 7 },
    budget: {
      budget: [3500, 6000],
      midRange: [8000, 14000],
      comfort: [18000, 35000],
      assumptions: "Per person per day, sharing a room. Mostly based on package-style stays that include meals and some activities. Excludes flights or ship passage, diving courses and permit fees. Prices vary widely by season and operator."
    },
    gettingThere: {
      air: "Agatti Airport is the only airport. Flights operate from Kochi; check the current operator and schedule. Weather can cause cancellations.",
      rail: "There is no railway in Lakshadweep. Travellers usually use Kochi (Ernakulam) as the mainland base.",
      road: "There are no roads connecting to the mainland. Ships and passenger vessels run from Kochi, taking around 14 to 20 hours depending on the island. Check schedules and booking with the administration.",
      local: "Between islands, travel is by government vessels, helicopters on some routes or tourist boats. Many arrangements are booked as part of tour packages."
    },
    accommodation: "Stays include government-run guest houses, a few resorts and homestay-style rooms on some islands. Options are limited, and packages should be booked well in advance in season.",
    cuisine: [
      { name: "Tuna and reef fish", note: "Freshly caught tuna is central to island meals, grilled or in curries." },
      { name: "Coconut-based dishes", note: "Coconut features in almost every meal." },
      { name: "Octopus fry", note: "A local dish found on some islands; ask your host." },
      { name: "Lakshadweep halwa", note: "A sweet made with coconut, sugar and jaggery." }
    ],
    festivals: ["Eid al-Fitr", "Eid al-Adha", "Milad-un-Nabi", "Lakshadweep Utsav (check dates)"],
    festivalSlugs: ["eid-al-fitr"],
    nearby: [
      { name: "Kochi", distanceKm: 400, note: "Mainland base for ships and flights to the islands." },
      { name: "Alappuzha", distanceKm: 450, note: "Backwaters of Kerala, a common add-on after Lakshadweep.", destinationSlug: "alappuzha" },
      { name: "Munnar", distanceKm: 520, note: "Hill station in the Western Ghats.", destinationSlug: "munnar" }
    ],
    precautions: [
      "An entry permit is required for all visitors, including Indian citizens. Confirm the current application process on the official portal.",
      "Dress modestly in villages and avoid public displays of affection; swimwear is for resort beaches and designated areas.",
      "Do not collect shells, corals or marine life, and do not stand on corals. Rules protect fragile reefs.",
      "Weather can cancel flights and ships. Keep spare days in your plan.",
      "Alcohol availability is very limited; do not bring it into the islands."
    ],
    tips: [
      "Apply for the permit well in advance and carry copies of ID and travel tickets.",
      "Choose a package that includes transfers and activities.",
      "Bring reef-safe sunscreen and any prescription medication, as medical facilities are basic.",
      "Carry cash, as ATMs and card acceptance are limited.",
      "Ask residents before photographing people, especially women."
    ],
    accessibility: "Boat transfers from ships and between islands often involve stepping from vessel to jetty or boat, and sandy ground is uneven. Facilities for visitors with limited mobility are limited; confirm arrangements with the operator.",
    responsibleTravel: "Respect the small island communities and their customs. Take all waste away, avoid damaging corals, use sunscreen carefully and support local guides and homestays.",
    permits: "All non-resident visitors need an entry permit from the Lakshadweep administration, and the permit is for specified islands. Indian citizens and foreign nationals follow different processes and island lists. Applications are made via the administration's ePermit portal or offline through the administration. Recent reports describe a relaxed sponsorship requirement, but processing times vary. Always confirm the current rules with the administration before booking.",
    faqs: [
      { question: "Do Indians need a permit for Lakshadweep?", answer: "Yes. An entry permit is required for all non-residents, including Indian citizens. Apply through the official administration channels." },
      { question: "Can foreigners visit?", answer: "Yes, with a permit and a valid Indian visa, though the list of open islands is shorter. Check the current rules and processing times." },
      { question: "How do I get there?", answer: "By flight to Agatti from Kochi or by passenger ship from Kochi. Both depend on the weather and the schedule." },
      { question: "Is alcohol available?", answer: "Alcohol is generally not available on most islands. Check with your resort or operator for current arrangements." }
    ],
    officialLinks: [
      { label: "Lakshadweep Tourism", url: "https://www.lakshadweeptourism.com" }
    ],
    sources: [
      { label: "Lakshadweep Administration: Entry Permit (read 9 November 2026)", url: "https://lakshadweep.gov.in/tourism/entry-permit/" },
      { label: "Lakshadweep - Wikipedia", url: "https://en.wikipedia.org/wiki/Lakshadweep" },
      { label: "Agatti Airport - Wikipedia", url: "https://en.wikipedia.org/wiki/Agatti_Airport" },
      { label: "Lakshadweep Tourism", url: "https://www.lakshadweeptourism.com" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "andaman",
    name: "Andaman Islands",
    stateSlug: "andaman-and-nicobar-islands",
    region: "islands",
    tagline: "A tropical archipelago in the Bay of Bengal with coral reefs, rainforest and the colonial Cellular Jail, subject to strict rules around tribal reserves.",
    categories: ["beaches", "adventure", "national-parks", "monuments"],
    coordinates: { lat: 11.6234, lng: 92.7265 },
    wikipediaTitle: "Andaman and Nicobar Islands",
    popular: true,
    hiddenGem: false,
    overview: [
      "The Andaman and Nicobar Islands are a Union Territory in the Bay of Bengal, made up of hundreds of islands, only a small number of them inhabited. Tourism is centred on the Andaman group, particularly the South Andaman base at Sri Vijaya Puram, formerly Port Blair. The Nicobar Islands are not open for ordinary tourism, and many parts of both groups are protected for tribal communities and forest.",
      "Place names have changed in recent years. Port Blair was renamed Sri Vijaya Puram in 2024, Havelock Island is now Swaraj Dweep and Neil Island is Shaheed Dweep. Ross Island carries the name Netaji Subhas Chandra Bose Dweep. Older names remain in common use, so you will see both on signs, tickets and maps.",
      "Most visitors go for the beaches, snorkelling and diving. Radhanagar Beach on Swaraj Dweep and the reefs near Shaheed Dweep are the best-known water spots. Sri Vijaya Puram has the Cellular Jail, a former colonial prison now a memorial, and boats go to Ross Island's ruins and the Mahatma Gandhi Marine National Park near Wandoor.",
      "The islands also hold some of the most vulnerable indigenous communities in the world. The Jarawa, Onge, Great Andamanese and Shompen, and the Sentinelese on North Sentinel Island, live under legal protections. Contact is prohibited, and tourism must not intrude on these groups. Distances are large, ferries are essential, and the weather affects everything."
    ],
    history: [
      "The islands have been inhabited for tens of thousands of years by indigenous communities. The Cholas are said to have used them as a naval staging point in the 11th century. The Danes briefly attempted settlement in the 18th century.",
      "The British established a penal colony after the 1857 uprising, and the Cellular Jail, built between 1896 and 1906, held political prisoners including many from the independence movement. The Japanese occupied the islands from 1942 to 1945. In 1943, Subhas Chandra Bose raised the flag of the Provisional Government of Free India at Port Blair.",
      "The islands joined India after independence and became a Union Territory in 1956. The 2004 Indian Ocean tsunami caused serious damage and loss of life, especially in the Nicobar Islands. Since then, indigenous protections, forest limits and tourism have been managed under changing rules."
    ],
    attractions: [
      {
        name: "Cellular Jail National Memorial",
        description: "A colonial-era prison with surviving cell wings, now a memorial. A light-and-sound show is held in the evening. Confirm hours and ticketing with the administration.",
        visitHours: 2,
        coordinates: { lat: 11.6722, lng: 92.7476 },
        interests: ["history", "culture"],
        timeOfDay: "evening"
      },
      {
        name: "Radhanagar Beach, Swaraj Dweep",
        description: "A long beach on Swaraj Dweep (Havelock) with calm water and sunset views. Currents can be strong at times; follow signs and lifeguard guidance.",
        visitHours: 3,
        coordinates: { lat: 11.9855, lng: 92.9511 },
        interests: ["relaxation", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Ross Island (Netaji Subhas Chandra Bose Dweep)",
        description: "A small island of ruined British administrative buildings overgrown with trees. Boats leave from Sri Vijaya Puram.",
        visitHours: 2,
        coordinates: { lat: 11.6767, lng: 92.7656 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Shaheed Dweep (Neil Island) beaches",
        description: "A small island with quiet beaches, natural rock formations and a village feel, reached by ferry.",
        visitHours: 4,
        interests: ["relaxation", "nature"],
        timeOfDay: "any"
      },
      {
        name: "Mahatma Gandhi Marine National Park, Wandoor",
        description: "A marine park with coral reefs, boat tours and snorkelling. Access is regulated and requires boat bookings.",
        visitHours: 4,
        interests: ["nature", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Chidiya Tapu",
        description: "A birdwatching and sunset point on the southern tip of South Andaman, about 25 km from Sri Vijaya Puram.",
        visitHours: 2,
        coordinates: { lat: 11.4986, lng: 92.7090 },
        interests: ["nature", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Baratang limestone caves and mud volcano",
        description: "A day trip by road and boat that passes through the Jarawa Tribal Reserve in a convoy. You must not stop, photograph or interact with the Jarawa. Confirm current convoy rules and whether the trip is advisable.",
        visitHours: 8,
        interests: ["nature", "adventure"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [11, 12, 1, 2, 3, 4],
    bestTimeNote: "November to April is the main season, with calm seas and clear water. May to October brings monsoon rains, rough seas and ferry cancellations. Cyclones can occur in the Bay of Bengal in the pre- and post-monsoon periods.",
    recommendedDays: { min: 5, max: 8 },
    budget: {
      budget: [2500, 4000],
      midRange: [6000, 11000],
      comfort: [14000, 30000],
      assumptions: "Per person per day, sharing a room. Includes accommodation, local meals, ferries and a share of local transport and a couple of activities. Excludes flights, diving courses and permits. Prices peak from December to January."
    },
    gettingThere: {
      air: "Veer Savarkar International Airport at Sri Vijaya Puram has flights from Chennai, Kolkata, Delhi, Bengaluru and other cities. Schedules and fares vary.",
      rail: "There is no rail link. Mainland ports Chennai, Kolkata and Visakhapatnam have passenger ships to the islands, taking days.",
      road: "Roads link towns within South, Middle and North Andaman. Ferries (government and private) connect Sri Vijaya Puram with Swaraj Dweep, Shaheed Dweep and other islands. Book ahead in season.",
      local: "Taxis, autos and rented scooters operate in Sri Vijaya Puram and on larger islands. Ferries are the main way between islands."
    },
    accommodation: "Choices range from budget guesthouses to beach resorts, mostly in Sri Vijaya Puram and on Swaraj Dweep. Book ahead for December to January and holidays. On Shaheed Dweep, accommodation is simpler.",
    cuisine: [
      { name: "Fresh seafood", note: "Grilled fish, prawns and crab at beach restaurants." },
      { name: "Bengali and South Indian dishes", note: "Settler communities from Bengal, Tamil Nadu and Kerala shape local menus." },
      { name: "Coconut-based curries", note: "Common in island cooking." },
      { name: "Tropical fruit", note: "Banana, papaya and coconut water are widely available." }
    ],
    festivals: ["Island Tourism Festival (usually January or February)", "Durga Puja", "Christmas", "Diwali"],
    festivalSlugs: ["durga-puja", "christmas", "diwali"],
    nearby: [
      { name: "Swaraj Dweep (Havelock)", distanceKm: 70, note: "Island with Radhanagar Beach and dive sites, reached by ferry." },
      { name: "Shaheed Dweep (Neil)", distanceKm: 40, note: "Small island with quiet beaches." },
      { name: "Baratang", distanceKm: 100, note: "Limestone caves and mud volcano; the road crosses a protected tribal reserve." },
      { name: "Kolkata", distanceKm: 1250, note: "Mainland gateway by air or ship.", destinationSlug: "kolkata" }
    ],
    precautions: [
      "Do not contact, photograph, feed or approach the Jarawa, Sentinelese or other protected tribes. This is illegal, and offences are prosecuted under law.",
      "North Sentinel Island and its surrounding waters are off-limits. The Nicobar Islands are restricted and not open for ordinary tourism.",
      "Ferries are cancelled in rough weather. Keep buffer days, especially before flights home.",
      "Use only licensed diving and water-sports operators, and follow safety briefings.",
      "Do not touch or collect coral, shells or turtle eggs. Fines apply."
    ],
    tips: [
      "Book ferries and key hotels before arriving, especially in December and January.",
      "Carry cash; ATMs are limited outside Sri Vijaya Puram and mobile data can be slow.",
      "Check the current names on tickets and signs, since both old and new names appear.",
      "Wear reef-safe sunscreen and protect against mosquitoes.",
      "Do not plan tight connections between ferries and flights."
    ],
    accessibility: "Beaches involve soft sand and jetty steps, and ferries require stepping across gaps. Cellular Jail has stairs and uneven floors. Wheelchair access is limited; confirm arrangements with operators.",
    responsibleTravel: "Respect protected tribes and the law that prevents contact. Do not take part in so-called tribal tourism. Take away rubbish, use reef-friendly products and choose licensed local operators.",
    permits: "Indian citizens do not usually need a permit for the main tourist islands. An Andaman and Nicobar tourism department notice (March 2026) says foreign nationals do not need a Restricted Area Permit for 29 listed islands, and that 11 further islands are exempt for day visits only until 31 December 2027. Nationals of Afghanistan, China (including Hong Kong and Macau) and Pakistan, and foreign nationals of origin in those countries, still need a permit approved in advance by the Ministry of Home Affairs, and are refused entry on arrival without one. Separate approvals are required for reserved forests, wildlife sanctuaries and tribal reserves, and photographing or interacting with Indigenous people is not allowed. North Sentinel Island and the Nicobar group are restricted. Confirm the current list with the Andaman and Nicobar tourism department before travelling.",
    faqs: [
      { question: "Is Port Blair the same as Sri Vijaya Puram?", answer: "Yes. Port Blair was renamed Sri Vijaya Puram in 2024. You will see both names on tickets and maps." },
      { question: "Can I visit the Nicobar Islands?", answer: "Not for ordinary tourism. Visits to the Nicobar Islands are restricted and need special permission, so ask the Andaman and Nicobar administration before planning." },
      { question: "Is the Baratang trip allowed?", answer: "The trip passes through the Jarawa reserve in convoy under restrictions. You must not stop or interact. Check current rules and consider whether you wish to take the route." },
      { question: "How many days do I need?", answer: "Five days cover Sri Vijaya Puram and Swaraj Dweep. Seven or eight let you add Shaheed Dweep and a slower pace." }
    ],
    officialLinks: [
      { label: "Andaman and Nicobar Islands Tourism", url: "https://tourism.andamannicobar.gov.in" },
      { label: "Andaman and Nicobar Police: guidelines for tourists", url: "https://police.andamannicobar.gov.in/index.php/en/public-information/2013-10-13-13-24-03/guidelines-for-tourist-indian-foreigner.html" },
    ],
    sources: [
      { label: "A&N Tourism: Restricted Area Permit notice (March 2026, read 9 November 2026)", url: "https://tourism.andamannicobar.gov.in/userpages/admin/whatsnewfile/2026030570Restricted Area Permit.pdf" },
      { label: "A&N Police: guidelines for tourists, no photography in tribal reserves (read 9 November 2026)", url: "https://police.andamannicobar.gov.in/index.php/en/public-information/2013-10-13-13-24-03/guidelines-for-tourist-indian-foreigner.html" },
      { label: "PIB, Ministry of Home Affairs: Port Blair renamed Sri Vijaya Puram (13 September 2024, read 9 November 2026)", url: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2054647&reg=48&lang=2" },
      { label: "Andaman and Nicobar Islands - Wikipedia", url: "https://en.wikipedia.org/wiki/Andaman_and_Nicobar_Islands" },
      { label: "Cellular Jail - Wikipedia", url: "https://en.wikipedia.org/wiki/Cellular_Jail" },
      { label: "Jarawa people - Wikipedia", url: "https://en.wikipedia.org/wiki/Jarawa_people_(Andaman_Islands)" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    stateSlug: "west-bengal",
    region: "east",
    tagline: "A river-port city with colonial landmarks, bookshops, trams and one of India's richest food and arts cultures.",
    categories: ["monuments", "cultural", "temples-heritage", "weekend"],
    coordinates: { lat: 22.5726, lng: 88.3639 },
    wikipediaTitle: "Kolkata",
    popular: true,
    hiddenGem: false,
    overview: [
      "Kolkata, the capital of West Bengal, lies on the east bank of the Hooghly river. It grew from three villages into the capital of British India until 1911, and the city's centre still holds colonial offices, churches and the Victoria Memorial. The grid of the Maidan, a large central park, gives the city a breathing space amid dense neighbourhoods.",
      "It is known for its literary and artistic culture. College Street has one of the largest second-hand book markets in the country, adda (conversation) culture in tea stalls and coffee houses is part of daily life, and theatre, film and music are strong. The city has produced several Nobel and Oscar-winning names, and Rabindranath Tagore's house at Jorasanko is a museum.",
      "Neighbourhoods feel very different. North Kolkata has old mansions, Kumartuli's idol-makers and narrow lanes. South Kolkata has restaurants and parks. Howrah, across the river, has the Howrah Bridge and a large railway terminus. The Kolkata Metro, India's oldest, runs through the city, and some routes of the tram system still run, though the network has shrunk.",
      "Kolkata is humid and hot for much of the year, crowded and loud, but visitors find it welcoming. Durga Puja in autumn transforms the city, and UNESCO has listed it as intangible cultural heritage. Fish, sweets and street food are central to why many people come."
    ],
    history: [
      "The city grew from the villages of Sutanuti, Gobindapur and Kolikata, where the East India Company established a trading post in the late 17th century. Fort William was built, and the settlement became a centre of the Company's power after the Battle of Plassey in 1757.",
      "Calcutta was the capital of British India until 1911, when the capital moved to Delhi. During this period it became a centre of education, publishing and the nationalist movement. The Bengal Renaissance of the 19th century produced reformers, writers and scientists, and the city was also a site of political upheaval, including the 1943 famine.",
      "Partition in 1947 divided Bengal and brought large numbers of refugees to the city. The city was renamed Kolkata in 2001. It remains a major commercial and cultural centre of eastern India, though it has faced economic challenges and congestion."
    ],
    attractions: [
      {
        name: "Victoria Memorial",
        description: "A white marble museum and memorial built in the early 20th century, set in gardens beside the Maidan. Galleries cover the colonial period. Confirm opening days and ticket details.",
        visitHours: 2.5,
        coordinates: { lat: 22.5448, lng: 88.3426 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Howrah Bridge",
        description: "A steel cantilever bridge over the Hooghly that carries heavy traffic and pedestrians. The best views are from the ghats or a ferry. Photography near the bridge is restricted in some areas; follow signage.",
        visitHours: 1,
        coordinates: { lat: 22.5851, lng: 88.3468 },
        interests: ["photography", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Dakshineswar Kali Temple",
        description: "A temple complex on the Hooghly linked to Ramakrishna Paramahamsa, crowded on weekends. Footwear and phones are not allowed inside the main shrine area.",
        visitHours: 2,
        coordinates: { lat: 22.6547, lng: 88.3578 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Indian Museum",
        description: "The oldest and one of the largest museums in India, with collections of archaeology, art and natural history. Confirm which galleries are open.",
        visitHours: 2.5,
        coordinates: { lat: 22.5580, lng: 88.3510 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "College Street book market",
        description: "A long lane of bookshops, stalls and coffee houses near the university. Browse new and second-hand books in many languages.",
        visitHours: 2,
        coordinates: { lat: 22.5744, lng: 88.3637 },
        interests: ["culture", "shopping", "food"],
        timeOfDay: "afternoon"
      },
      {
        name: "Kumartuli",
        description: "A potters' quarter where clay idols are made for Durga Puja and other festivals. Visits are best a few weeks before the festival. Ask artisans before photographing.",
        visitHours: 1.5,
        coordinates: { lat: 22.5981, lng: 88.3628 },
        interests: ["culture", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "St Paul's Cathedral",
        description: "An Indo-Gothic Anglican cathedral near the Maidan, with stained glass and a quiet interior.",
        visitHours: 0.75,
        coordinates: { lat: 22.5446, lng: 88.3470 },
        interests: ["history", "spiritual"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is the most comfortable. Durga Puja falls in September or October. Summers are hot and humid, and the monsoon brings flooding on some streets.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 7500],
      comfort: [9000, 20000],
      assumptions: "Per person per day, sharing a double room. Covers a hotel, meals, metro and app-based taxis. Excludes flights or trains to Kolkata, shopping and entry tickets. Rates rise during Durga Puja."
    },
    gettingThere: {
      air: "Netaji Subhas Chandra Bose International Airport at Dum Dum serves domestic and international flights.",
      rail: "Howrah and Sealdah are the main terminals, with Kolkata station and Santragachi also serving long-distance trains.",
      road: "National highways link Kolkata with Odisha, Bihar and Jharkhand, and with the northeast through Siliguri. Buses run from Esplanade and other terminals.",
      local: "The Metro is the fastest way to move in north-south corridors. Buses, app taxis, ferries on the Hooghly and some tram routes also operate; check which tram routes are currently running."
    },
    accommodation: "Hotels range from budget lodges near Howrah and Sudder Street to heritage hotels and international chains in Park Street, Salt Lake and New Town. Book early during Durga Puja.",
    cuisine: [
      { name: "Kathi roll", note: "A street-food wrap with egg or kebab, widely associated with Kolkata." },
      { name: "Hilsa and other river fish", note: "Fish is central to Bengali meals, served with rice in mustard-based curries." },
      { name: "Mishti doi and rosogolla", note: "Sweet curd and syrup-soaked cheese balls, found at sweet shops across the city." },
      { name: "Kolkata biryani", note: "A mild biryani with potato, distinct from Hyderabadi versions." },
      { name: "Puchka", note: "Crisp shells filled with spiced water and tamarind, sold at street stalls." }
    ],
    festivals: ["Durga Puja", "Kali Puja", "Poila Boishakh (Bengali New Year)", "Kolkata Book Fair", "Christmas"],
    festivalSlugs: ["durga-puja", "diwali", "christmas", "holi"],
    nearby: [
      { name: "Sundarbans", distanceKm: 100, note: "Mangrove forest and tiger reserve reached by road and boat.", destinationSlug: "sundarbans" },
      { name: "Shantiniketan", distanceKm: 160, note: "University town founded by Tagore, with a weekend market." },
      { name: "Mayapur", distanceKm: 130, note: "International centre of ISKCON on the Ganga." },
      { name: "Bishnupur", distanceKm: 140, note: "Terracotta temple town." },
      { name: "Puri", distanceKm: 500, note: "Jagannath temple and beach town in Odisha.", destinationSlug: "puri-konark" }
    ],
    precautions: [
      "The city is hot and humid; drink water and avoid midday walks from April to June.",
      "Monsoon rain can flood roads and slow traffic.",
      "Crowds are heavy during Durga Puja, with road closures and diversions. Plan ahead.",
      "Be careful on crowded buses and at markets. Use app taxis after dark.",
      "Dress modestly at temples and ask before photographing people or religious ceremonies."
    ],
    tips: [
      "Use the Metro to beat traffic.",
      "Visit Victoria Memorial early to avoid crowds.",
      "Try a tea stall or coffee house near College Street.",
      "Book hotels well ahead for Durga Puja.",
      "Check which tram routes still run before planning a ride."
    ],
    accessibility: "Pavements are crowded and uneven, and many heritage buildings have steps. Metro stations have lifts at some stops; confirm. Victoria Memorial has ramps at some entrances but not all areas; check with staff.",
    responsibleTravel: "Be polite when photographing artisans and religious events, avoid plastic where possible, and support independent bookshops, sweet shops and craft cooperatives.",
    faqs: [
      { question: "Is Kolkata safe for tourists?", answer: "Generally yes in the main visitor areas. Be alert in crowds and use app taxis at night." },
      { question: "When is Durga Puja?", answer: "It usually falls in September or October according to the lunar calendar. Check the exact dates each year." },
      { question: "Do trams still run?", answer: "Some routes have run in recent years, but the network has been reduced. Confirm which routes are operating." },
      { question: "How many days do I need?", answer: "Two days cover the main sights. Three or four allow food walks, day trips and slower exploration." }
    ],
    officialLinks: [
      { label: "West Bengal Tourism", url: "https://wbtourism.gov.in" }
    ],
    sources: [
      { label: "Kolkata - Wikipedia", url: "https://en.wikipedia.org/wiki/Kolkata" },
      { label: "Victoria Memorial, Kolkata - Wikipedia", url: "https://en.wikipedia.org/wiki/Victoria_Memorial,_Kolkata" },
      { label: "Durga Puja in Kolkata - UNESCO", url: "https://ich.unesco.org/en/RL/durga-puja-in-kolkata-01609" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "darjeeling",
    name: "Darjeeling",
    stateSlug: "west-bengal",
    region: "east",
    tagline: "A tea-growing hill town in the eastern Himalaya, with a narrow-gauge railway and views of Kanchenjunga on clear mornings.",
    categories: ["hill-stations", "mountains", "photography", "cultural"],
    coordinates: { lat: 27.0410, lng: 88.2663 },
    wikipediaTitle: "Darjeeling",
    popular: true,
    hiddenGem: false,
    overview: [
      "Darjeeling is a hill town in northern West Bengal at about 2,000 metres, overlooking the Kanchenjunga range on clear mornings. It is spread over a ridge, with steep roads and stepped lanes linking the Mall, the market and neighbourhoods below. The surrounding hills hold tea estates, forest and small villages, and the town is known worldwide for Darjeeling tea.",
      "Culture here is mixed. Gorkha communities, Lepcha, Bhutia and Tibetan families, along with Bengali and Marwari residents, live side by side. Monasteries, churches, temples and mosques sit close together, and the main languages are Nepali, Bengali and Hindi. Many Tibetans arrived after 1959, and the Tibetan Refugee Self Help Centre is one result.",
      "The Darjeeling Himalayan Railway, a narrow-gauge line often called the toy train, links the hills with the plains and is a UNESCO World Heritage Site. Some stretches run steam-hauled joyrides, though service patterns change, so confirm what is running before you plan around it. Other highlights include the Batasia Loop, the Himalayan Mountaineering Institute and the Padmaja Naidu Himalayan Zoological Park.",
      "Weather is changeable. Mist can hide the mountains for days, and monsoon landslides regularly disrupt roads. A visit during October to November or March to April gives the best chance of clear views. Political strikes in the hills have occasionally closed shops and transport, so check local news."
    ],
    history: [
      "The area was part of the Kingdom of Sikkim, then briefly under Nepal and Bhutan. In 1835 the Chogyal of Sikkim ceded Darjeeling to the British East India Company, which wanted a hill sanatorium for its officials.",
      "Tea was introduced in the 1850s, and estates spread across the hills, drawing Nepali labourers who settled in large numbers. The Darjeeling Himalayan Railway opened in 1881, and the town became a summer retreat for the colonial administration. Darjeeling tea later received a geographical indication in India in 2004.",
      "After independence, Darjeeling became part of West Bengal. Demands for a separate state of Gorkhaland have shaped politics since the 1980s and have led to periods of unrest and strikes. A semi-autonomous Gorkhaland Territorial Administration was formed in 2012."
    ],
    attractions: [
      {
        name: "Tiger Hill sunrise",
        description: "A viewpoint about 11 km from town, reached by a pre-dawn drive, with views of Kanchenjunga on clear mornings. It is crowded, and visibility is not guaranteed.",
        visitHours: 3,
        coordinates: { lat: 26.9870, lng: 88.2670 },
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Darjeeling Himalayan Railway",
        description: "A narrow-gauge steam-and-diesel railway listed by UNESCO. Joyrides run to Ghum and Batasia Loop. Confirm timetable and booking through Indian Railways and the railway.",
        visitHours: 2.5,
        coordinates: { lat: 27.0425, lng: 88.2635 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Batasia Loop and War Memorial",
        description: "A spiral section of the railway with a garden and memorial to Gorkha soldiers, and views of the town and mountains.",
        visitHours: 1,
        coordinates: { lat: 27.0319, lng: 88.2517 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Happy Valley Tea Estate",
        description: "A working tea estate close to the town, where visitors can see the leaves being plucked and processed. Confirm tour times with the estate.",
        visitHours: 1.5,
        interests: ["food", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Himalayan Mountaineering Institute and zoo",
        description: "The institute, set up after the 1953 Everest ascent, has a museum. The adjacent zoo is known for snow leopards and red pandas; confirm which animals can be seen.",
        visitHours: 2.5,
        interests: ["history", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Ghum Monastery (Yiga Choeling)",
        description: "A Tibetan Buddhist monastery of the Gelug tradition near the railway's highest station. Remove shoes and ask before photographing inside.",
        visitHours: 1,
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Observatory Hill (Mahakal Temple)",
        description: "A hilltop shrine shared by Hindu and Buddhist worshippers above the Mall. Macaque monkeys are numerous; secure food and loose items.",
        visitHours: 1,
        coordinates: { lat: 27.0450, lng: 88.2640 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [3, 4, 5, 10, 11],
    bestTimeNote: "March to May and October to November usually offer the clearest mountain views. June to September is monsoon with heavy rain and landslides. December to February is cold, with fog and occasional frost.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2800],
      midRange: [3500, 7000],
      comfort: [8500, 18000],
      assumptions: "Per person per day, sharing a double room. Covers a hotel, meals, shared taxi rides and a share of a toy-train ticket. Excludes transport to Siliguri and trekking permits. Rates peak in April to June and October."
    },
    gettingThere: {
      air: "Bagdogra airport near Siliguri is the nearest, about 90 km and three to four hours by road.",
      rail: "New Jalpaiguri (NJP) is the main railhead, with long-distance services from Kolkata, Delhi and Guwahati. The narrow-gauge line from NJP to Darjeeling operates in parts; confirm which services run.",
      road: "Shared jeeps and taxis run from Siliguri and NJP through Pankhabari or the Hill Cart Road. Landslides can close roads in the monsoon.",
      local: "Walking is usual in the centre. Shared jeeps and taxis cover other areas. Roads are steep and narrow."
    },
    accommodation: "Heritage-style guesthouses, family-run homestays and hotels are spread along the Mall and nearby ridges. Book early for April to June and October. Check heating in winter.",
    cuisine: [
      { name: "Darjeeling tea", note: "First flush and second flush teas are sold at shops and estates." },
      { name: "Momos and thukpa", note: "Tibetan-influenced dumplings and noodle soup are staples." },
      { name: "Sel roti", note: "A ring-shaped rice-flour bread eaten on festivals in Nepali households." },
      { name: "Churpi", note: "Hardened yak or cow cheese, a local snack." }
    ],
    festivals: ["Losar", "Dashain and Tihar", "Darjeeling Carnival (check dates)", "Christmas"],
    festivalSlugs: ["losar", "christmas", "diwali"],
    nearby: [
      { name: "Kalimpong", distanceKm: 50, note: "Hill town with monasteries and nurseries." },
      { name: "Gangtok", distanceKm: 100, note: "Capital of Sikkim, reached by road.", destinationSlug: "gangtok" },
      { name: "Sandakphu", distanceKm: 55, note: "Trek in the Singalila National Park; guides and permits needed." },
      { name: "Mirik", distanceKm: 49, note: "Lake and tea gardens." },
      { name: "Siliguri", distanceKm: 80, note: "Gateway city for Darjeeling and the northeast." }
    ],
    precautions: [
      "Landslides can close roads in the monsoon. Check road conditions with your driver before travelling.",
      "Altitude is moderate, but cold nights require warm clothing in winter.",
      "Strikes called by political groups can close shops and transport; ask your hotel about the situation.",
      "Monkeys at Observatory Hill can snatch food; keep bags closed.",
      "Ask before photographing people, monks or ceremonies."
    ],
    tips: [
      "Go to Tiger Hill on a clear forecast; early morning is crowded.",
      "Book the toy train in advance and check which services run.",
      "Buy tea from estates or reputable shops, and check the harvest date.",
      "Carry layers even in summer; evenings are cool.",
      "Allow extra time for travel from Siliguri."
    ],
    accessibility: "The town is on steep slopes with many steps and uneven pavements. Taxis can reach most main sights, but toy-train platforms and monasteries have steps. Wheelchair access is limited.",
    responsibleTravel: "Buy from tea estates and local cooperatives, respect monastery rules, avoid plastic bottles, and be cautious when joining trekking groups that overload fragile trails.",
    faqs: [
      { question: "Do I need a permit for Darjeeling?", answer: "No special permit is needed for the town. Treks into Singalila National Park need entry fees and usually a guide." },
      { question: "Does the toy train run?", answer: "Some stretches run regular joyrides. The full line has suffered landslide damage in the past; check the current schedule." },
      { question: "When can I see Kanchenjunga?", answer: "Views are most likely in clear spells in October to November and March to April, usually early in the morning." },
      { question: "How do I get from the airport?", answer: "Take a taxi or shared jeep from Bagdogra or Siliguri. The drive takes three to four hours." }
    ],
    officialLinks: [
      { label: "West Bengal Tourism", url: "https://wbtourism.gov.in" }
    ],
    sources: [
      { label: "Darjeeling - Wikipedia", url: "https://en.wikipedia.org/wiki/Darjeeling" },
      { label: "Mountain Railways of India - UNESCO", url: "https://whc.unesco.org/en/list/944" },
      { label: "Darjeeling Himalayan Railway - Wikipedia", url: "https://en.wikipedia.org/wiki/Darjeeling_Himalayan_Railway" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "sundarbans",
    name: "Sundarbans",
    stateSlug: "west-bengal",
    region: "east",
    tagline: "The Indian part of the world's largest mangrove delta, explored by boat and known for the Bengal tiger.",
    categories: ["national-parks", "wildlife", "village", "adventure"],
    coordinates: { lat: 21.9497, lng: 88.8000 },
    wikipediaTitle: "Sundarbans",
    popular: false,
    hiddenGem: false,
    overview: [
      "The Sundarbans is a vast delta where the Ganga, Brahmaputra and Meghna rivers reach the Bay of Bengal, shared between India and Bangladesh. The Indian portion covers about 4,260 sq km in the South and North 24 Parganas districts of West Bengal. It is a maze of tidal creeks and mangrove islands, and the Sundarbans National Park here was listed as a UNESCO World Heritage Site in 1987.",
      "The forest is the home of the Bengal tiger, which swims between islands, along with estuarine crocodiles, spotted deer, wild boar, monitor lizards and many birds. Sightings of tigers are rare, and most visitors see birds, deer, crocodiles and the mangroves themselves. The experience is slow and quiet, mostly from the deck of a boat.",
      "The delta is also home to people. Villages on islands such as Gosaba and Satjelia farm, fish and collect honey, often entering the forest at risk to their lives from tigers. Local belief in Bonbibi, a forest guardian venerated by both Hindus and Muslims, shapes how people approach the forest. Visitors should treat these communities with care.",
      "Most trips begin from Gosaba or Canning. Permits and a guide are required, and visitors usually book a package with a licensed operator or the state tourism department. Sea level rise, cyclones and erosion threaten the islands, making the delta one of the most vulnerable places in India."
    ],
    history: [
      "The delta has long been home to fishing and farming communities. Under the Mughals and later the British, parts of the forest were cleared for agriculture, and the British declared some forest as protected in the 19th century.",
      "The area was set up as a tiger reserve in 1973, a wildlife sanctuary in 1977 and became a national park in 1984. Gosaba was developed in the early 20th century under Sir Daniel Hamilton's cooperative scheme, which settled farmers on cleared land.",
      "Cyclones such as Aila in 2009, Amphan in 2020 and Yaas in 2021 damaged embankments and flooded villages. Conservation and local livelihoods remain in tension, particularly around tiger-human conflict and the loss of land to the sea."
    ],
    attractions: [
      {
        name: "Sajnekhali Watchtower and Mangrove Interpretation Centre",
        description: "A watchtower and visitor centre in the Sajnekhali sanctuary, with a crocodile and turtle enclosure and information on mangroves.",
        visitHours: 1.5,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Sudhanyakhali Watchtower",
        description: "A watchtower overlooking a creek where deer and sometimes tigers are seen, with a freshwater pond. Binoculars help.",
        visitHours: 1,
        interests: ["wildlife", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Dobanki Canopy Walk",
        description: "A raised walkway through the mangrove canopy that allows visitors to view the forest safely from above.",
        visitHours: 1,
        interests: ["nature", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Netidhopani and Bonbibi shrine",
        description: "Creeks and temple ruins, with small shrines to Bonbibi that local people visit before entering the forest. Treat shrines with respect.",
        visitHours: 1.5,
        interests: ["culture", "spiritual"],
        timeOfDay: "morning"
      },
      {
        name: "Gosaba village",
        description: "The last large settlement before the forest, with the Hamilton-era cooperative buildings and a market. It is a base for boat trips.",
        visitHours: 2,
        coordinates: { lat: 22.1630, lng: 88.6740 },
        interests: ["culture", "history"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [11, 12, 1, 2],
    bestTimeNote: "November to February is cooler and drier, with better wildlife viewing and calmer rivers. Summer is hot and humid, and the monsoon brings rough water and cyclone risk.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [2000, 3500],
      midRange: [4500, 8500],
      comfort: [10000, 20000],
      assumptions: "Per person per day on a shared package, often including boat, permits, guide and meals. Excludes transfers from Kolkata in some cases, and tips. Prices vary by operator and by length of boat stay."
    },
    gettingThere: {
      air: "Kolkata's airport is the nearest, about 100 km from the main departure points.",
      rail: "Canning is on the Sealdah suburban line, connecting to Kolkata. Many tour operators pick up from Kolkata.",
      road: "Roads lead from Kolkata to Godkhali or Gosaba, where boats begin. The drive takes three to four hours depending on traffic.",
      local: "Within the delta, travel is by boat. Rickshaw-vans and shared vans link villages on land."
    },
    accommodation: "Resorts and lodges at Gosaba and Pakhiralay offer basic to comfortable rooms, and some tours use houseboats or launches for overnight stays. Book through the state tourism department or licensed operators.",
    cuisine: [
      { name: "River fish and prawn dishes", note: "Local fish and prawns, cooked in mustard or coconut gravies." },
      { name: "Sundarbans honey", note: "Wild honey collected from the forest by licensed honey gatherers; buy from reputable sellers." },
      { name: "Crab curry", note: "Local crab is served at some lodges." }
    ],
    festivals: ["Bonbibi Puja (January)", "Durga Puja", "Poush Sankranti"],
    festivalSlugs: ["durga-puja", "makar-sankranti"],
    nearby: [
      { name: "Kolkata", distanceKm: 100, note: "The usual base, with airport and rail connections.", destinationSlug: "kolkata" },
      { name: "Canning", distanceKm: 55, note: "Small town on the railway and road to the delta." },
      { name: "Bakkhali", distanceKm: 130, note: "Quiet beach on the Bay of Bengal." },
      { name: "Digha", distanceKm: 185, note: "Seaside resort town on the West Bengal coast." }
    ],
    precautions: [
      "Tigers are active in the forest. Stay on the boat or in designated areas, and follow guide instructions.",
      "Never swim in creeks; crocodiles, sharks and strong currents are present.",
      "Cyclones can strike in the pre- and post-monsoon seasons. Avoid travelling when warnings are issued.",
      "Mobile coverage is limited, and medical facilities are far away.",
      "Do not buy honey or other forest products from unlicensed sellers, and do not enter the forest without permission."
    ],
    tips: [
      "Book through the state tourism department or a licensed operator.",
      "Carry ID, as entry permits are issued against it.",
      "Bring binoculars, insect repellent and a hat.",
      "Keep voices low on the boat for better wildlife viewing.",
      "Do not expect to see a tiger; treat any sighting as a bonus."
    ],
    accessibility: "Boat boarding involves stepping between jetty and vessel, often on narrow or tilted planks. Watchtowers have stairs. The trip is difficult for wheelchair users.",
    responsibleTravel: "Choose licensed operators, avoid plastic waste on the boat, respect Bonbibi shrines and village life, and buy honey and crafts from registered cooperatives.",
    permits: "Entry to the national park and tiger reserve areas requires permits issued by the forest department, usually arranged by tour operators or at Sajnekhali. Carry original photo ID, and foreign nationals should carry their passport. Rules and fees change, so confirm through the state tourism department or the operator.",
    faqs: [
      { question: "Will I see a tiger?", answer: "Sightings are rare. Most visitors see deer, crocodiles, birds and the mangrove scenery." },
      { question: "Can I do it as a day trip from Kolkata?", answer: "Yes, but days are long. A two-day trip with a night near Gosaba or on a boat is more relaxed." },
      { question: "Do I need a permit?", answer: "Yes. Entry permits are required and are typically arranged by a licensed operator or at the park office." },
      { question: "Is it safe?", answer: "With a licensed operator and guides, yes. Do not leave the boat or designated areas, and avoid swimming." }
    ],
    officialLinks: [
      { label: "West Bengal Tourism", url: "https://wbtourism.gov.in" }
    ],
    sources: [
      { label: "Sundarbans - Wikipedia", url: "https://en.wikipedia.org/wiki/Sundarbans" },
      { label: "Sundarbans National Park - UNESCO", url: "https://whc.unesco.org/en/list/452" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "puri-konark",
    name: "Puri and Konark",
    stateSlug: "odisha",
    region: "east",
    tagline: "A pilgrimage town of the Jagannath cult and a 13th-century sun temple, 35 km apart on the Odisha coast.",
    categories: ["religious", "temples-heritage", "monuments", "beaches"],
    coordinates: { lat: 19.8135, lng: 85.8312 },
    wikipediaTitle: "Konark Sun Temple",
    popular: true,
    hiddenGem: false,
    overview: [
      "Puri and Konark are two coastal sites in Odisha linked by the Marine Drive road. Puri is a pilgrimage town centred on the Jagannath Temple, one of the four Char Dham sites for Hindus, and a seaside resort. Konark, about 35 km to the north-east, has the ruins of the 13th-century Sun Temple, a UNESCO World Heritage Site designed as a giant chariot.",
      "Jagannath Temple is open only to Hindus, and security is strict. Non-Hindu visitors can see the temple from nearby viewpoints and from the Raghunandan Library rooftop, subject to current arrangements, and may be asked about their faith at the gate. The temple's deities are made of wood and replaced periodically in a ritual called Nabakalebara. Photography, cameras and phones are restricted around the temple, so ask police or officials.",
      "The Konark temple was built as a stone chariot with 24 carved wheels and seven horses. Much of the main tower has fallen, but the surviving carvings of dancers, musicians, animals and erotic scenes are remarkable. The temple is protected by the Archaeological Survey of India, and guides can explain the iconography and astronomy.",
      "The beaches at Puri are wide and busy, and the sea is rough. Traditional fishers called Nolias act as informal lifeguards. The area also has craft villages such as Raghurajpur, known for pattachitra painting. Plan around heat from April to June and cyclone risk in autumn."
    ],
    history: [
      "The present Jagannath Temple was built in the 12th century by the Eastern Ganga ruler Anantavarman Chodaganga Deva. Puri has been a centre of Jagannath worship, and the annual Rath Yatra draws large crowds to pull the huge chariots on the Grand Road.",
      "The Konark Sun Temple was built in the 13th century, traditionally credited to Narasimhadeva I of the Eastern Ganga dynasty. It was dedicated to Surya, the sun god. The main tower later collapsed or deteriorated, and the sanctum was filled with sand by the British in 1903 for stabilisation.",
      "UNESCO inscribed Konark in 1984. Both places have faced cyclone damage, most recently Cyclone Fani in 2019, which hit Puri hard. Conservation of the temples and the coast remains ongoing."
    ],
    attractions: [
      {
        name: "Jagannath Temple, Puri",
        description: "A large temple complex of the Jagannath, Balabhadra and Subhadra triad. Only Hindus may enter. Others can view it from outside. Bags, phones and cameras are restricted; confirm current rules.",
        visitHours: 2,
        coordinates: { lat: 19.8048, lng: 85.8180 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Konark Sun Temple",
        description: "A UNESCO-listed temple designed as a chariot with intricately carved wheels and sculpture. Confirm opening hours and ticket details with the ASI.",
        visitHours: 2.5,
        coordinates: { lat: 19.8876, lng: 86.0945 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Puri Beach",
        description: "A wide, crowded beach, especially at sunrise and in the evening. Swim only in designated areas with Nolia lifeguards; currents are strong.",
        visitHours: 2,
        coordinates: { lat: 19.7981, lng: 85.8250 },
        interests: ["relaxation", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Raghurajpur artists' village",
        description: "A heritage craft village where families paint pattachitra scrolls and make palm-leaf engravings. Buying directly supports artisans.",
        visitHours: 2,
        interests: ["culture", "shopping"],
        timeOfDay: "afternoon"
      },
      {
        name: "Chilika Lake",
        description: "A large brackish lagoon known for migratory birds in winter and Irrawaddy dolphins. Boat trips run from Satapada and Barkul.",
        visitHours: 5,
        interests: ["nature", "wildlife"],
        timeOfDay: "morning"
      },
      {
        name: "Chandrabhaga Beach",
        description: "A quieter beach near Konark, linked by local tradition with a bathing festival in February. Currents can be strong.",
        visitHours: 1.5,
        interests: ["relaxation", "photography"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is cooler and drier. Rath Yatra falls in June or July with very large crowds. April to June is hot and humid, and cyclones can occur between October and December.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6000],
      comfort: [7500, 15000],
      assumptions: "Per person per day, sharing a room. Covers a hotel or guesthouse, local meals and local transport. Excludes transport to Odisha, ritual offerings and shopping. Prices rise sharply during Rath Yatra and holidays."
    },
    gettingThere: {
      air: "Biju Patnaik International Airport at Bhubaneswar is about 60 km from Puri and the closest major airport.",
      rail: "Puri station is a terminus with trains from Kolkata, Delhi, Mumbai and southern cities. Bhubaneswar is also a major railhead.",
      road: "Bus and taxi services run from Bhubaneswar. The Marine Drive links Puri and Konark along the coast.",
      local: "Autos, e-rickshaws and shared vans operate in Puri. A taxi is convenient for Konark."
    },
    accommodation: "Puri has everything from pilgrim lodges and ashram guesthouses to beach hotels. Konark has fewer options, so many visitors stay in Puri. Book early for Rath Yatra and winter weekends.",
    cuisine: [
      { name: "Mahaprasad", note: "Food offered to Lord Jagannath and sold at Ananda Bazar; vegetarian and cooked in earthen pots." },
      { name: "Dalma", note: "Dal cooked with vegetables, a staple Odia dish." },
      { name: "Chhena poda", note: "A baked cheese dessert from Odisha." },
      { name: "Puri khaja", note: "Layered fried sweet pastry sold near the temple." },
      { name: "Fresh seafood", note: "Fish, crab and prawns are served at beach restaurants." }
    ],
    festivals: ["Rath Yatra", "Konark Dance Festival (usually early December)", "Snana Yatra", "Chandan Yatra"],
    festivalSlugs: ["rath-yatra"],
    nearby: [
      { name: "Bhubaneswar", distanceKm: 60, note: "Capital of Odisha, with temples such as Lingaraj and Mukteshwar." },
      { name: "Chilika Lake", distanceKm: 50, note: "Brackish lagoon known for birds and dolphins." },
      { name: "Pipili", distanceKm: 20, note: "Village known for appliqué work." },
      { name: "Kolkata", distanceKm: 500, note: "Major city and rail gateway.", destinationSlug: "kolkata" }
    ],
    precautions: [
      "Swim only where lifeguards are present; Puri's sea has strong currents.",
      "Non-Hindus may not enter Jagannath Temple. Do not try to bypass security.",
      "Rath Yatra crowds are extreme; avoid it if you dislike crowds, and stay with your group.",
      "Dress modestly in temple areas and remove footwear before entering.",
      "Cyclone warnings can lead to evacuation and cancelled trains; keep an eye on forecasts in autumn."
    ],
    tips: [
      "Visit Konark in the early morning for softer light and fewer crowds.",
      "Hire an ASI-approved guide at Konark for context on the carvings.",
      "Buy pattachitra and palm-leaf work from artists at Raghurajpur.",
      "Book Rath Yatra stays months in advance if you plan to attend.",
      "Agree taxi fares in advance or use the prepaid counter at the station."
    ],
    accessibility: "Jagannath Temple area is crowded and has steps. Konark has uneven stone and some ramps, but not all areas are step-free. Puri's beach is soft sand and difficult for wheelchairs.",
    responsibleTravel: "Follow temple rules and photography limits, avoid littering on beaches, and buy crafts from artisans directly. Do not climb on the Konark sculptures.",
    faqs: [
      { question: "Can non-Hindus enter Jagannath Temple?", answer: "No. Only Hindus may enter. Others can see it from outside and from certain viewing spots." },
      { question: "How far is Konark from Puri?", answer: "About 35 km by the Marine Drive, around an hour by road." },
      { question: "When is Rath Yatra?", answer: "It falls in June or July according to the lunar calendar. Check the date for the year." },
      { question: "Is the sea safe for swimming?", answer: "Only in designated stretches with lifeguards. Currents are strong." }
    ],
    officialLinks: [
      { label: "Odisha Tourism", url: "https://odishatourism.gov.in" }
    ],
    sources: [
      { label: "Konark Sun Temple - Wikipedia", url: "https://en.wikipedia.org/wiki/Konark_Sun_Temple" },
      { label: "Sun Temple, Konark - UNESCO", url: "https://whc.unesco.org/en/list/246" },
      { label: "Jagannath Temple, Puri - Wikipedia", url: "https://en.wikipedia.org/wiki/Jagannath_Temple,_Puri" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "bodh-gaya",
    name: "Bodh Gaya",
    stateSlug: "bihar",
    region: "east",
    tagline: "The place where the Buddha is said to have attained enlightenment, centred on the Mahabodhi Temple and a Bodhi tree.",
    categories: ["religious", "temples-heritage", "monuments", "cultural"],
    coordinates: { lat: 24.6961, lng: 84.9913 },
    wikipediaTitle: "Bodh Gaya",
    popular: true,
    hiddenGem: false,
    overview: [
      "Bodh Gaya is a small town in Bihar's Gaya district, about 13 km from the city of Gaya. It is the most sacred site of Buddhism, the place where Siddhartha Gautama is believed to have attained enlightenment beneath a Bodhi tree about 2,500 years ago. The Mahabodhi Temple Complex, listed by UNESCO in 2002, stands at the centre.",
      "The town is shaped by pilgrims. Monasteries and temples built by Buddhist communities from Thailand, Japan, Bhutan, Tibet, Myanmar, Sri Lanka, Vietnam and other countries line the roads, each in its own architectural style. Pilgrim numbers peak in winter, when Tibetan teachings are held, and on Buddha Purnima in spring.",
      "The site is calm but organised. Visitors circumambulate the temple, sit under the Bodhi tree and listen to chanting. Rules vary on photography and the use of phones in the inner areas, so check at the gate. Dress modestly with covered shoulders and knees, and remove footwear.",
      "Bodh Gaya is small and easy to walk, and one or two days are enough. It can be paired with nearby Rajgir and Nalanda, or with Gaya, which is a Hindu pilgrimage centre for ancestral rites."
    ],
    history: [
      "Buddhist tradition holds that Siddhartha Gautama meditated under a pipal tree here and reached enlightenment, becoming the Buddha. The emperor Ashoka, who ruled in the 3rd century BCE, is traditionally said to have visited and built a shrine, and a railing and stone slab are linked to this period.",
      "The present Mahabodhi Temple dates in its main form to the Gupta period, around the 5th to 6th centuries CE, and is one of the oldest brick temples surviving in India. After Buddhism declined in the region, the site fell under the management of a Hindu mahant and was neglected for centuries.",
      "In the 19th century, British archaeologists including Alexander Cunningham restored the temple, and Buddhist revival movements, notably led by Anagarika Dharmapala, campaigned for Buddhist control. The Bodh Gaya Temple Act of 1949 created a management committee with Hindu and Buddhist members, a structure that remains under discussion."
    ],
    attractions: [
      {
        name: "Mahabodhi Temple",
        description: "A tall brick temple with a pyramidal spire, surrounded by smaller stupas and carved railings. Entry rules, queues and photography limits apply; check on arrival.",
        visitHours: 2,
        coordinates: { lat: 24.6961, lng: 84.9913 },
        interests: ["spiritual", "history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Bodhi Tree",
        description: "A pipal tree beside the temple that is regarded as a descendant of the original tree. Pilgrims sit and meditate in the shade.",
        visitHours: 1,
        coordinates: { lat: 24.6958, lng: 84.9915 },
        interests: ["spiritual"],
        timeOfDay: "morning"
      },
      {
        name: "Great Buddha Statue",
        description: "A large seated Buddha statue, about 80 feet tall, in a landscaped park. The statue is easy to reach and quiet.",
        visitHours: 1,
        coordinates: { lat: 24.7000, lng: 84.9890 },
        interests: ["spiritual", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Monasteries of different countries",
        description: "Thai, Japanese, Bhutanese, Tibetan and other temples near the main complex. Each has its own architecture and rules. Dress modestly and ask before photographing.",
        visitHours: 3,
        interests: ["culture", "spiritual", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Sujata Kuti and Sujatha village",
        description: "A site across the Niranjana river linked to the offering of milk rice to the Buddha before enlightenment. It is a quiet rural spot.",
        visitHours: 1.5,
        interests: ["history", "spiritual"],
        timeOfDay: "afternoon"
      },
      {
        name: "Dungeshwari Cave Temples",
        description: "Caves in the hills where the Buddha is said to have practised austerities before enlightenment. The site is about 12 km away and involves a climb.",
        visitHours: 2,
        interests: ["history", "spiritual"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is the best, with cool weather and pilgrim events. April to June is very hot. Buddha Purnima in spring brings large crowds.",
    recommendedDays: { min: 1, max: 3 },
    budget: {
      budget: [1000, 1800],
      midRange: [2500, 4500],
      comfort: [6000, 12000],
      assumptions: "Per person per day, sharing a room. Covers a guesthouse or hotel, meals and local autos. Excludes transport to Gaya and donations. Prices rise in winter pilgrim season."
    },
    gettingThere: {
      air: "Gaya International Airport, about 12 km away, has domestic and some international flights, mainly seasonal.",
      rail: "Gaya Junction is the main railhead, about 13 km away, on routes between Delhi and Kolkata.",
      road: "Roads connect to Gaya, Patna, Varanasi and Rajgir. Autos and taxis run from Gaya station.",
      local: "The main area is walkable. Cycle rickshaws and autos serve outlying monasteries."
    },
    accommodation: "Hotels, guesthouses and monastery guest rooms are available at all price levels. Book well ahead for winter months and festival dates.",
    cuisine: [
      { name: "Litti chokha", note: "Roasted wheat balls with spiced mashed vegetables, a Bihari staple." },
      { name: "Tilkut", note: "A sesame and sugar sweet from Gaya, especially around Makar Sankranti." },
      { name: "Tibetan food", note: "Momos and thukpa are common near the monasteries." },
      { name: "Thai and Japanese meals", note: "Some restaurants cater to monastery visitors." }
    ],
    festivals: ["Buddha Purnima", "Kagyu Monlam (Tibetan prayer festival)", "Pitru Paksha Mela at Gaya"],
    festivalSlugs: ["makar-sankranti"],
    nearby: [
      { name: "Gaya", distanceKm: 13, note: "Hindu pilgrimage city with the Vishnupad Temple." },
      { name: "Rajgir", distanceKm: 70, note: "Hills, hot springs and sites linked with the Buddha and Mahavira." },
      { name: "Nalanda", distanceKm: 95, note: "Ruins of an ancient Buddhist monastic university, a UNESCO site." },
      { name: "Varanasi", distanceKm: 250, note: "City on the Ganga, with Sarnath nearby.", destinationSlug: "varanasi" }
    ],
    precautions: [
      "Dress modestly with covered shoulders and knees, and remove shoes at temples.",
      "Security checks are in place around the Mahabodhi complex; carry minimal bags.",
      "Summers are very hot. Carry water and avoid midday walks.",
      "Beggars and touts can be persistent near the main complex; politely decline.",
      "Be careful of touts offering to arrange tickets or guides."
    ],
    tips: [
      "Visit early morning or at dusk for quieter meditation and chanting.",
      "Hire a guide for the history of the temple and the nearby sites.",
      "Check the rules on photography and phones before entering.",
      "Allow time for smaller monasteries, where hospitality is warm.",
      "Combine with Rajgir and Nalanda for a Buddhist circuit."
    ],
    accessibility: "The main complex has paved paths, though steps lead to some terraces and the inner shrine. Smaller monasteries vary. Confirm step-free access with the temple management.",
    responsibleTravel: "Treat the site as a place of worship. Keep voices low, follow dress codes, avoid pointing feet at images, and give donations at official boxes rather than to unknown solicitors.",
    faqs: [
      { question: "Is Bodh Gaya open to non-Buddhists?", answer: "Yes. The complex is open to visitors of all faiths, with rules on dress and conduct." },
      { question: "How many days do I need?", answer: "One day for the main complex; two or three if you want to see monasteries and nearby sites like Rajgir." },
      { question: "Can I take photographs?", answer: "Rules vary by area. Photography is restricted in some inner parts; check at the gate." },
      { question: "How do I get there?", answer: "Fly into Gaya or go by train to Gaya Junction, then take an auto or taxi for about 13 km." }
    ],
    officialLinks: [
      { label: "Bihar Tourism", url: "https://tourism.bihar.gov.in" }
    ],
    sources: [
      { label: "Bodh Gaya - Wikipedia", url: "https://en.wikipedia.org/wiki/Bodh_Gaya" },
      { label: "Mahabodhi Temple Complex at Bodh Gaya - UNESCO", url: "https://whc.unesco.org/en/list/1056" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "netarhat",
    name: "Netarhat",
    stateSlug: "jharkhand",
    region: "east",
    tagline: "A quiet plateau hill station in Jharkhand with sunset points, forest and waterfalls, and few crowds.",
    categories: ["hill-stations", "waterfalls", "hidden-gems", "village"],
    coordinates: { lat: 23.4833, lng: 84.2667 },
    wikipediaTitle: "Netarhat",
    popular: false,
    hiddenGem: true,
    overview: [
      "Netarhat is a small hill station on the Chotanagpur Plateau in Latehar district, Jharkhand, at an altitude of about 1,100 metres. It lies roughly 150 km from Ranchi and is known for its sunrise and sunset viewpoints, pine and sal forest, and a pleasant climate compared with the plains. The town is sometimes called the Queen of Chotanagpur.",
      "It is a low-key place, with a small bazaar, a few guesthouses and a well-known residential school founded in 1954. The viewpoints draw domestic visitors, especially for the sunset at Magnolia Point. The surroundings include waterfalls such as Upper Ghaghri and Lower Ghaghri, and a forested plateau that sits within the wider Palamau region.",
      "The area is inhabited by Adivasi communities, including Oraon, Munda and Asur, whose villages are scattered around the plateau. Visitors should treat these as lived-in places and ask before photographing people or homes. Tourism is modest and facilities are basic.",
      "Netarhat suits travellers who want a quiet two-day break and who are comfortable with limited services. Mobile coverage can be patchy, and ATMs are few. Roads are in reasonable condition on main routes but winding."
    ],
    history: [
      "The plateau has long been home to Adivasi communities, and the Chotanagpur region was ruled by local chiefs before coming under British control in the 18th century. Colonial officials used the cooler plateau as a retreat in the hot season.",
      "Netarhat Vidyalaya, a residential school, was founded in 1954 and became known as a leading school in the region. This gave the small settlement a distinctive identity beyond tourism.",
      "Jharkhand was carved out of Bihar in 2000. Parts of the Latehar district were affected by Maoist violence in earlier decades, which limited tourism. The state has promoted Netarhat in recent years, but infrastructure is still developing."
    ],
    attractions: [
      {
        name: "Magnolia Point (sunset point)",
        description: "A viewpoint on the plateau edge for sunset over the forest. A local story about a British girl, Magnolia, is told here, but it is folklore rather than documented history.",
        visitHours: 1.5,
        coordinates: { lat: 23.4880, lng: 84.2600 },
        interests: ["nature", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Sunrise Point",
        description: "A viewpoint for dawn light over the plateau and forest, usually reached by a short walk.",
        visitHours: 1,
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Upper and Lower Ghaghri Falls",
        description: "Waterfalls in the forest near Netarhat. They are strongest after the monsoon. The approach involves uneven paths and some steps.",
        visitHours: 2,
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Koel View Point",
        description: "A viewpoint over the Koel river valley and the forest below.",
        visitHours: 1,
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Lodh Falls (Budha Ghagh)",
        description: "One of the tallest waterfalls in Jharkhand, reached via a road and a walk; confirm access and conditions locally before going.",
        visitHours: 3,
        interests: ["nature", "adventure"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is cool and clear. July to September is lush, with strong waterfalls but wet roads and leeches. April to June is warm but milder than the plains.",
    recommendedDays: { min: 1, max: 3 },
    budget: {
      budget: [900, 1600],
      midRange: [2000, 3800],
      comfort: [4500, 8000],
      assumptions: "Per person per day, sharing a room. Covers a basic guesthouse or tourist lodge, local meals and a share of a hired cab. Excludes transfers from Ranchi. Options are limited, and prices rise in peak season."
    },
    gettingThere: {
      air: "Birsa Munda Airport in Ranchi is the nearest, about 155 km away by road.",
      rail: "Ranchi and Lohardaga are the railheads. There is no station at Netarhat.",
      road: "Roads run from Ranchi through Lohardaga and Gumla. Buses and shared jeeps serve the route, but a hired car is more comfortable. The final stretch includes hill bends.",
      local: "Autos and taxis are limited. Most points are reached by hired vehicle or on foot."
    },
    accommodation: "Accommodation is basic: a state tourist lodge, a few private hotels and guesthouses. Book ahead in season and confirm facilities such as hot water.",
    cuisine: [
      { name: "Dhuska", note: "A deep-fried rice and lentil bread, eaten with spicy potato curry in Jharkhand." },
      { name: "Litti chokha", note: "Roasted wheat balls with spiced mashed vegetables." },
      { name: "Handia (rice beer)", note: "A traditional drink in some Adivasi communities; offered only in a cultural context, and drink responsibly." },
      { name: "Seasonal forest produce", note: "Mahua, jackfruit and mushrooms in season." }
    ],
    festivals: ["Sarhul", "Karma", "Sohrai", "Makar Sankranti"],
    festivalSlugs: ["makar-sankranti", "diwali"],
    nearby: [
      { name: "Betla National Park", distanceKm: 75, note: "Part of the Palamau Tiger Reserve with elephants and deer." },
      { name: "Ranchi", distanceKm: 155, note: "Capital of Jharkhand, with waterfalls and the Birsa Munda Airport." },
      { name: "Lodh Falls", distanceKm: 40, note: "Tall waterfall, accessed by road and a walk." }
    ],
    precautions: [
      "Mobile coverage and ATMs are limited. Carry cash and download offline maps.",
      "Parts of the region have had security concerns in the past. Check current advisories and avoid travelling at night.",
      "Waterfall approaches are slippery in the monsoon; take care near edges.",
      "Ask before photographing local people, and respect sacred groves and village customs.",
      "Roads have sharp bends; drive carefully and avoid night driving."
    ],
    tips: [
      "Plan around sunrise and sunset viewpoints.",
      "Book accommodation ahead of weekends and holidays.",
      "Carry warm layers for winter evenings.",
      "Fill fuel before leaving Ranchi.",
      "Ask your host about the safest roads and local conditions."
    ],
    accessibility: "Viewpoints involve short walks on uneven ground. Waterfall approaches have steps and slopes. Facilities for wheelchair users are limited.",
    responsibleTravel: "Respect Adivasi villages and sacred sites, buy local produce directly, avoid litter in forest and waterfalls, and do not feed wild animals.",
    faqs: [
      { question: "How far is Netarhat from Ranchi?", answer: "About 155 km. Allow four to five hours by road." },
      { question: "Is it safe to visit?", answer: "Tourism has resumed, but conditions change. Check local advice and avoid travelling at night." },
      { question: "When are the waterfalls at their best?", answer: "After the monsoon, from August to October, though access may be wet." },
      { question: "Can I do it as a day trip?", answer: "It is a long day. An overnight stay is much better." }
    ],
    officialLinks: [],
    sources: [
      { label: "Netarhat - Wikipedia", url: "https://en.wikipedia.org/wiki/Netarhat" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "kaziranga",
    name: "Kaziranga",
    stateSlug: "assam",
    region: "northeast",
    tagline: "A floodplain national park on the Brahmaputra holding the world's largest population of the Indian one-horned rhinoceros.",
    categories: ["national-parks", "wildlife", "photography", "adventure"],
    coordinates: { lat: 26.5775, lng: 93.1711 },
    wikipediaTitle: "Kaziranga National Park",
    popular: true,
    hiddenGem: false,
    overview: [
      "Kaziranga National Park lies on the south bank of the Brahmaputra in Assam, in the Golaghat and Nagaon districts. It is a floodplain landscape of tall elephant grass, marsh and patches of woodland, and it was listed as a UNESCO World Heritage Site in 1985. It holds the largest population of the Indian one-horned rhinoceros, with more than 2,400 animals recorded.",
      "The park is also a tiger reserve, with a high density of tigers, and supports wild water buffalo, Asian elephants, swamp deer, hog deer and hundreds of bird species. Rivers within the park hold Gangetic dolphins. Visitors see animals from jeeps, and in some zones, elephant rides at dawn, since walking is not allowed.",
      "The park is closed during the monsoon. It opens roughly from November to April, but dates are set by the forest department each year, so confirm before planning. During floods, many animals move to the Karbi Anglong hills to the south, crossing National Highway 715, which runs along the park's edge.",
      "Safari zones include the Central (Kohora), Western (Bagori), Eastern (Agoratoli) and Burhapahar ranges. Booking, timings and fees are set by the forest department. Guides and drivers are essential for spotting animals and observing rules."
    ],
    history: [
      "The area was home to tribal communities and Ahom-era settlements. In 1904, Mary Curzon, wife of the Viceroy Lord Curzon, visited and, finding no rhinos, urged protection. A Proposed Reserve Forest was set up in 1905.",
      "Kaziranga became a game sanctuary in 1916, a wildlife sanctuary in 1950 and a national park in 1974. UNESCO listed it as a World Heritage Site in 1985, and it was declared a tiger reserve in 2006.",
      "The park faces floods, poaching and pressure from human settlement and the highway. Conservation work includes anti-poaching patrols, animal corridors and speed limits for traffic on NH715."
    ],
    attractions: [
      {
        name: "Central Range (Kohora) jeep safari",
        description: "The most visited zone with grassland and wetlands where rhinos are often seen. Book through official channels and confirm timings.",
        visitHours: 3,
        coordinates: { lat: 26.5775, lng: 93.1711 },
        interests: ["wildlife", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Western Range (Bagori)",
        description: "A zone known for rhinos and birds, about 4 km west of Kohora. Elephant rides may be offered at dawn; confirm availability.",
        visitHours: 3,
        interests: ["wildlife", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Eastern Range (Agoratoli)",
        description: "A quieter zone with wetlands and a good place for birds, about 25 km east of Kohora.",
        visitHours: 3,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Burhapahar Range",
        description: "A zone with forest and grassland on the western side, less crowded than the central ranges.",
        visitHours: 3,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Tea estates near Kohora",
        description: "Working estates on the road to the park, where visitors can see tea plucking in season. Confirm access with the estate.",
        visitHours: 1.5,
        interests: ["culture", "nature", "food"],
        timeOfDay: "afternoon"
      },
      {
        name: "Karbi Anglong hills and Panbari forest",
        description: "Forested hills south of the highway where animals retreat during floods. Panbari is a reserve forest with hoolock gibbons, accessed via a short drive.",
        visitHours: 3,
        interests: ["nature", "wildlife"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [11, 12, 1, 2, 3, 4],
    bestTimeNote: "The park is generally open from November to April. Winter mornings are cool and misty, and March to April is warmer with better visibility of grassland animals. The park is closed during the monsoon, from May to October, subject to annual dates.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [2000, 3500],
      midRange: [5000, 9000],
      comfort: [12000, 25000],
      assumptions: "Per person per day, sharing a room. Covers lodging, meals and a share of jeep safari costs. Excludes entry fees, camera fees and flights or rail to the region. Prices peak from December to February."
    },
    gettingThere: {
      air: "Jorhat airport is about 97 km away. Guwahati's Lokpriya Gopinath Bordoloi International Airport is about 215 km, and Dimapur in Nagaland is about 127 km.",
      rail: "Furkating junction is about 75 km away. Guwahati and Jorhat are larger rail and bus hubs.",
      road: "NH715 runs along the park's southern boundary. Buses and taxis run from Guwahati, Jorhat and Golaghat.",
      local: "The safari jeeps are booked at the park offices or through lodges. Taxis run between lodges and Kohora."
    },
    accommodation: "Lodges and resorts cluster around Kohora and Bagori, from budget guesthouses to upscale jungle lodges. Book ahead for December to February.",
    cuisine: [
      { name: "Assamese thali", note: "Rice with dal, fish curry and greens, served at local restaurants." },
      { name: "Masor tenga", note: "A sour fish curry flavoured with tomato or lemon." },
      { name: "Pitha", note: "Rice cakes made for Bihu and sold at some stalls." },
      { name: "Assam tea", note: "Strong black tea grown in nearby estates." }
    ],
    festivals: ["Bihu", "Elephant Festival (check dates)", "Magh Bihu"],
    festivalSlugs: ["bihu"],
    nearby: [
      { name: "Majuli", distanceKm: 120, note: "River island with Vaishnavite monasteries.", destinationSlug: "majuli" },
      { name: "Jorhat", distanceKm: 97, note: "Town and airport, with tea estates and the Hoollongapar Gibbon Sanctuary nearby." },
      { name: "Guwahati", distanceKm: 215, note: "Largest city in Assam, with the Kamakhya Temple." },
      { name: "Shillong", distanceKm: 330, note: "Hill town in Meghalaya.", destinationSlug: "shillong-sohra" }
    ],
    precautions: [
      "Do not leave the vehicle or walk in the park; wild animals can be dangerous.",
      "Floods can close roads and the park in monsoon; check the forest department before booking.",
      "Drive slowly on NH715, as animals cross at night and during floods.",
      "Follow guide instructions and keep voices low in the park.",
      "Carry mosquito repellent and sun protection."
    ],
    tips: [
      "Book jeeps and permits through official channels or reputable lodges.",
      "Go early; animals are most active at dawn.",
      "Carry binoculars and a long lens if you photograph wildlife.",
      "Consider more than one zone to improve your chances.",
      "Check closing dates and rules before travelling."
    ],
    accessibility: "Jeeps require stepping up into the vehicle, and tracks are bumpy. Elephant rides use a platform with steps. Lodges vary in step-free access; confirm with them.",
    responsibleTravel: "Keep distance from animals, do not use flash, and follow park rules. Choose lodges that support local communities, and do not buy items made from wildlife.",
    permits: "No separate permit is required for Indian citizens beyond the park entry and safari tickets. Foreign nationals pay higher entry fees. Carry photo ID for registration. Confirm current fees and booking on the official channels.",
    faqs: [
      { question: "When is Kaziranga open?", answer: "Roughly November to April. Dates are set each year by the forest department and the park is closed in the monsoon." },
      { question: "Will I see a rhino?", answer: "Sightings are very likely in the main zones, though no animal is guaranteed." },
      { question: "Can I walk in the park?", answer: "No. Walking is not permitted; safaris are by jeep or elephant where offered." },
      { question: "How many safaris should I do?", answer: "Two or three, in different zones and at different times of day." }
    ],
    officialLinks: [
      { label: "Assam Tourism", url: "https://assamtourism.gov.in" }
    ],
    sources: [
      { label: "Kaziranga National Park - Wikipedia", url: "https://en.wikipedia.org/wiki/Kaziranga_National_Park" },
      { label: "Kaziranga National Park - UNESCO", url: "https://whc.unesco.org/en/list/337" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "majuli",
    name: "Majuli",
    stateSlug: "assam",
    region: "northeast",
    tagline: "A river island in the Brahmaputra, the centre of Assamese Vaishnavite monastic culture and shrinking steadily through erosion.",
    categories: ["village", "cultural", "religious", "hidden-gems"],
    coordinates: { lat: 26.9500, lng: 94.1700 },
    wikipediaTitle: "Majuli",
    popular: false,
    hiddenGem: true,
    overview: [
      "Majuli is a river island in the Brahmaputra in Assam, reached by ferry from Nimati Ghat near Jorhat. It is recognised by Guinness World Records as the world's largest inhabited river island, though some sources disagree on the claim. In 2016 it became the first island in India to be designated a district.",
      "The island is a centre of the Neo-Vaishnavite tradition founded by Srimanta Sankardev in the 15th and 16th centuries. Monasteries called satras are the cultural heart, once numbering 65 and now fewer than 25 active. They preserve Sattriya dance, drama, music, mask-making and boat-building, and visitors may be welcomed to see prayers and performances.",
      "Majuli is also home to Mising, Deori and Sonowal Kachari communities, many of whom live in stilt houses called chang ghar. The island is known for pottery made without a wheel by women in villages like Salmora, handloom weaving and a calm rural landscape of paddy fields, wetlands and bamboo groves.",
      "Erosion has reduced the island from about 1,300 sq km in the 1790s to around 880 sq km. Floods in the monsoon are common, and some villages have been lost. Visitors should treat Majuli as a living place facing real hardship, and travel with care and respect."
    ],
    history: [
      "Majuli's form has been shaped over centuries by floods and earthquakes that shifted the channels of the Brahmaputra and its tributaries. The great Assam earthquake of 1950 changed river levels and flooding patterns markedly.",
      "Srimanta Sankardev and his disciple Madhavdev spread Vaishnavism in Assam from the 15th century. Satras were founded on Majuli under Ahom patronage, and the Ahom kings gave land grants to support them. Each satra developed its own specialities in art and ritual.",
      "In the 20th and 21st centuries, floods, bank erosion and upstream changes have destroyed villages and satras, and some have relocated. Government and community projects are working on embankments and conservation, while a long bridge from Neematighat to Kamalabari has been under construction since 2021."
    ],
    attractions: [
      {
        name: "Kamalabari Satra",
        description: "A satra known for Sattriya dance, music and boat-making. Visitors may attend evening prayers or observe activities; ask before photographing.",
        visitHours: 2,
        coordinates: { lat: 26.9500, lng: 94.2000 },
        interests: ["culture", "spiritual"],
        timeOfDay: "evening"
      },
      {
        name: "Auniati Satra",
        description: "One of the largest satras, with a collection of historic artefacts and royal gifts. Confirm opening times.",
        visitHours: 1.5,
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Dakhinpat Satra",
        description: "A satra famous for its Raas Leela performance in November. Respect the rules of conduct and dress.",
        visitHours: 1.5,
        interests: ["culture", "spiritual"],
        timeOfDay: "afternoon"
      },
      {
        name: "Samaguri Satra",
        description: "Known for traditional mask-making, used in religious plays. Artisans will explain the craft.",
        visitHours: 1.5,
        interests: ["culture", "shopping"],
        timeOfDay: "morning"
      },
      {
        name: "Salmora pottery village",
        description: "A village where women shape pottery by hand without a wheel. Buy directly to support the craft.",
        visitHours: 1.5,
        interests: ["culture", "shopping"],
        timeOfDay: "morning"
      },
      {
        name: "Mising villages and chang ghar",
        description: "Villages with houses on stilts, handloom weaving and traditional rice-based drinks. Ask permission before visiting or photographing, and consider a homestay.",
        visitHours: 2,
        interests: ["culture", "photography"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is dry and cool, and November brings the Raas festival. The monsoon from June to September floods parts of the island, and ferry services may be disrupted.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1000, 1800],
      midRange: [2500, 4500],
      comfort: [5000, 9000],
      assumptions: "Per person per day, sharing a room. Covers a homestay or basic guesthouse, local meals and shared transport on the island. Excludes travel to Jorhat, bicycle or scooter hire extras and gifts. Options are limited."
    },
    gettingThere: {
      air: "Jorhat airport is the nearest, about 20 km from Nimati Ghat. Guwahati is a larger hub.",
      rail: "Jorhat Town and Furkating are the nearest railheads. There is no rail on the island.",
      road: "From Jorhat, roads lead to Nimati Ghat, where ferries cross the Brahmaputra to Kamalabari. A bridge is under construction, so check status. A second ferry crossing links from North Lakhimpur side.",
      local: "On the island, hire a bicycle, scooter or taxi. Roads are narrow and can be flooded."
    },
    accommodation: "Homestays, small guesthouses and bamboo cottages are the main options, with some in Kamalabari. Book through reputable hosts or the district tourism office.",
    cuisine: [
      { name: "Assamese fish thali", note: "Fish curries, dal and greens, served in homestays." },
      { name: "Mising dishes", note: "Steamed and leaf-wrapped dishes made with local ingredients; ask hosts." },
      { name: "Pitha and laru", note: "Rice cakes and sweets made for Bihu." },
      { name: "Apong", note: "A traditional rice drink in Mising homes, served in cultural contexts; drink responsibly." }
    ],
    festivals: ["Raas Mahotsav (November)", "Bihu", "Ali-Ai-Ligang", "Paal Naam"],
    festivalSlugs: ["bihu"],
    nearby: [
      { name: "Jorhat", distanceKm: 20, note: "Gateway city with tea estates and the airport." },
      { name: "Kaziranga", distanceKm: 120, note: "National park with the one-horned rhinoceros.", destinationSlug: "kaziranga" },
      { name: "Sivasagar", distanceKm: 80, note: "Ahom-era monuments and temples." },
      { name: "Hoollongapar Gibbon Sanctuary", distanceKm: 40, note: "Forest reserve with hoolock gibbons." }
    ],
    precautions: [
      "Ferry timetables are limited and weather-dependent. Last boats leave in the afternoon; plan to cross in daylight.",
      "Floods can cut roads and close ferries from June to September.",
      "Remove footwear and dress modestly in satras; ask before photographing prayers or monks.",
      "Services such as ATMs and pharmacies are limited; carry cash and medicines.",
      "Use mosquito repellent, especially in the evenings."
    ],
    tips: [
      "Stay overnight to see evening prayers at a satra.",
      "Hire a local guide for context on the satra tradition.",
      "Buy pottery, masks and handloom directly from artisans.",
      "Check current ferry timings and bridge status with local authorities.",
      "Bring cash for homestays and small purchases."
    ],
    accessibility: "Ferry boarding involves ramps or planks over mud and can be difficult. Roads are rough, and satras have steps and open floors. Wheelchair access is limited.",
    responsibleTravel: "Treat satras as places of worship and living communities. Stay with local hosts, buy crafts directly, avoid plastic waste, and be mindful that the island faces serious erosion.",
    faqs: [
      { question: "How do I reach Majuli?", answer: "Take a ferry from Nimati Ghat near Jorhat to Kamalabari. The crossing takes about an hour, but timings vary." },
      { question: "Is Majuli the largest river island?", answer: "Guinness World Records recognises it as the world's largest inhabited river island, though other sources dispute the claim." },
      { question: "When is the Raas festival?", answer: "It usually takes place in November around the full moon. Check dates with the satras or local tourism offices." },
      { question: "How many days do I need?", answer: "Two days allow a few satras and villages. Three give more time for rural life." }
    ],
    officialLinks: [
      { label: "Assam Tourism", url: "https://assamtourism.gov.in" }
    ],
    sources: [
      { label: "Majuli - Wikipedia", url: "https://en.wikipedia.org/wiki/Majuli" },
      { label: "Sattriya - Wikipedia", url: "https://en.wikipedia.org/wiki/Sattriya" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "shillong-sohra",
    name: "Shillong and Sohra",
    stateSlug: "meghalaya",
    region: "northeast",
    tagline: "A hill capital of pine and lakes, and the rain-soaked Khasi plateau of Sohra with waterfalls and living root bridges.",
    categories: ["hill-stations", "waterfalls", "cultural", "village"],
    coordinates: { lat: 25.5788, lng: 91.8933 },
    wikipediaTitle: "Shillong",
    popular: true,
    hiddenGem: false,
    overview: [
      "Shillong is the capital of Meghalaya, a hill town at about 1,500 metres in the Khasi Hills. It has pine-covered ridges, Ward's Lake, Umiam Lake nearby and a lively music and cafe culture. Sohra, also spelled Cherrapunji, lies about 55 km south on a plateau edge, known for waterfalls, caves and heavy rainfall. Meghalaya government sources, including its tourism website, use the original name Sohra.",
      "The area is the homeland of the Khasi and Jaintia peoples, who follow a matrilineal system where family names and property pass through the mother, with the youngest daughter holding the family home. Garo communities live in the western hills. Christianity is the majority religion, alongside traditional faiths such as Niam Khasi.",
      "Sohra and the nearby areas are among the wettest places on Earth. The rains feed Nohkalikai Falls, caves and the living root bridges, where Khasi communities guide the aerial roots of rubber fig trees across streams over generations. The double-decker root bridge at Nongriat is the best known and is reached by thousands of steps.",
      "The monsoon, from June to September, brings extreme rain, landslides and road closures. October to April is drier and brings clearer views. Dawki, on the Bangladesh border, offers clear river views, and Mawlynnong is known for its tidy streets. Plan time for the winding roads."
    ],
    history: [
      "The Khasi Hills were governed by a confederacy of chiefdoms called syiemships. The British took control in the early 19th century, and Shillong was made the capital of Assam in 1874, becoming a hill station for colonial officials.",
      "Meghalaya was carved out of Assam, first as an autonomous state in 1970 and a full state in 1972, with Shillong as its capital. Khasi, Jaintia and Garo identities and customary laws remain central to politics.",
      "Sohra was once the administrative centre of the Khasi Hills under the British, before the capital shifted to Shillong. The area's rainfall and limestone landscape have shaped traditions such as living root bridges and coal and limestone mining, the latter controversial for its environmental impact."
    ],
    attractions: [
      {
        name: "Ward's Lake",
        description: "A small lake and garden in the town centre, popular with locals in the evening.",
        visitHours: 1,
        coordinates: { lat: 25.5726, lng: 91.8826 },
        interests: ["relaxation", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Umiam Lake",
        description: "A reservoir north of Shillong with water sports and viewpoints. Confirm activity availability.",
        visitHours: 2,
        coordinates: { lat: 25.6667, lng: 91.8833 },
        interests: ["nature", "relaxation"],
        timeOfDay: "afternoon"
      },
      {
        name: "Don Bosco Museum of Indigenous Cultures",
        description: "A multi-storey museum on the cultures of the northeast, with a skywalk. Confirm opening days.",
        visitHours: 2.5,
        interests: ["culture", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Nohkalikai Falls",
        description: "One of the tallest plunge waterfalls in India, near Sohra, visible from a viewing platform. Mist can hide it; the best flow is in the monsoon.",
        visitHours: 1.5,
        coordinates: { lat: 25.2759, lng: 91.6872 },
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Nongriat living root bridges",
        description: "A trek down thousands of steps to double-decker and single root bridges. Wear grippy shoes and allow a full day. Steps are steep and slippery in rain.",
        visitHours: 6,
        interests: ["nature", "adventure", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Mawsmai Cave",
        description: "A limestone cave near Sohra with a lit passage. Narrow sections require stooping and wet footing.",
        visitHours: 1,
        interests: ["nature", "adventure"],
        timeOfDay: "any"
      },
      {
        name: "Dawki and the Umngot river",
        description: "A river with very clear water near the Bangladesh border. Boating is popular, but follow local safety advice. Carry ID near the border.",
        visitHours: 3,
        coordinates: { lat: 25.1833, lng: 92.0167 },
        interests: ["nature", "photography"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 3, 4],
    bestTimeNote: "October to April is drier, with clearer views. The monsoon from June to September brings very heavy rain, landslides and waterfalls at their fullest. December to February is cold in Shillong.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 6500],
      comfort: [8000, 16000],
      assumptions: "Per person per day, sharing a room. Covers lodging, meals and shared taxi hire for sightseeing. Excludes travel to Guwahati, trekking guides and entry fees. Taxi hire is a major cost for day trips from Shillong."
    },
    gettingThere: {
      air: "Guwahati airport is the main gateway, about 100 km and three hours by road. Shillong Airport at Umroi has limited services; check schedules.",
      rail: "Guwahati is the main railhead. There is no railway in Meghalaya's hills.",
      road: "Shared taxis and buses run between Guwahati and Shillong. Shillong to Sohra takes about two hours by road.",
      local: "In Shillong, small taxis and shared cabs run on fixed routes. For Sohra, Dawki and Mawlynnong, hire a taxi for the day."
    },
    accommodation: "Shillong has hotels and guesthouses for all budgets. Sohra and nearby villages have resorts and homestays. Book ahead for winter weekends and holidays.",
    cuisine: [
      { name: "Jadoh", note: "Rice cooked with pork or chicken, a Khasi staple." },
      { name: "Dohneiiong", note: "Pork cooked in black sesame paste." },
      { name: "Tungrymbai", note: "Fermented soybean dish, with a strong smell." },
      { name: "Kyat tea and local snacks", note: "Tea shops serve fried snacks and regional sweets." }
    ],
    festivals: ["Nongkrem Dance Festival", "Shad Suk Mynsiem", "Wangala", "Behdienkhlam", "Christmas"],
    festivalSlugs: ["wangala", "christmas"],
    nearby: [
      { name: "Mawlynnong", distanceKm: 90, note: "Village known for clean streets and a living root bridge nearby." },
      { name: "Dawki", distanceKm: 80, note: "River with clear water on the Bangladesh border." },
      { name: "Guwahati", distanceKm: 100, note: "Gateway city in Assam." },
      { name: "Kaziranga", distanceKm: 330, note: "Rhino and tiger reserve in Assam.", destinationSlug: "kaziranga" }
    ],
    precautions: [
      "Landslides and floods can close roads in the monsoon. Check before travelling.",
      "Nongriat steps are steep and slippery, especially in rain. Wear sturdy shoes and carry water.",
      "Mist can hide views; weather changes quickly.",
      "Meghalaya requires registration of some non-resident visitors under a state residents' safety law; check the current rules before travelling.",
      "Carry ID near the Bangladesh border at Dawki and follow instructions."
    ],
    tips: [
      "Start early for Sohra and Nongriat; mornings are clearer.",
      "Bargain politely for taxis, or arrange fares in advance.",
      "Respect customs in Khasi villages and ask before photographing people.",
      "Carry cash for homestays and small shops.",
      "Allow at least two nights outside Shillong for the root bridges."
    ],
    accessibility: "Shillong has steep roads and uneven pavements. Nohkalikai Falls has a viewing platform with steps. The Nongriat trek has thousands of steps and is not suitable for wheelchair users.",
    responsibleTravel: "Respect Khasi customs and sacred groves, avoid litter on trails, support homestays and guides from local villages, and do not enter private land without permission.",
    permits: "Meghalaya requires some non-resident visitors to register under the Meghalaya Residents Safety and Security Act, as amended in 2019, and a new online system may be introduced. Rules change, so confirm the current requirements with the state government before travelling. No separate protected-area permit is needed for Shillong or Sohra for most visitors.",
    faqs: [
      { question: "Is Sohra the same as Cherrapunji?", answer: "Yes. Sohra is the original name, and Meghalaya government sources use it. Cherrapunji is still widely used." },
      { question: "How hard is the Nongriat trek?", answer: "It involves thousands of steps down and up, taking several hours. Reasonable fitness is needed." },
      { question: "Do I need a permit?", answer: "Meghalaya has a registration system for some non-resident visitors. Check the current rules." },
      { question: "When is the best time to visit?", answer: "October to April for clear weather; June to September for waterfalls but with landslide risks." }
    ],
    officialLinks: [
      { label: "Meghalaya Tourism", url: "https://www.meghalayatourism.in" },
    ],
    sources: [
      { label: "Shillong - Wikipedia", url: "https://en.wikipedia.org/wiki/Shillong" },
      { label: "Cherrapunji - Wikipedia", url: "https://en.wikipedia.org/wiki/Cherrapunji" },
      { label: "Living root bridges - Wikipedia", url: "https://en.wikipedia.org/wiki/Living_root_bridges" }
    ],
    lastReviewed: "2026-11-09"
  }
];
