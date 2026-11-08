import type { Story } from "@/types/content";

/**
 * Editorial guides. Rules about fares, booking windows, permits and visa
 * procedures change; each guide tells readers to confirm the current position
 * with the official body named in its sources.
 */
export const stories: Story[] = [
  {
    slug: "how-to-book-and-read-indian-train-tickets",
    title: "How to book and read Indian train tickets",
    dek: "Classes, quotas, waiting-list codes and the booking window, explained so that a ticket makes sense before you pay for it.",
    category: "How-to",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "Indian Railways carries millions of passengers a day, and most long journeys are booked in advance. A reserved ticket gives you a seat or berth for your name, so it is worth learning how to read one. This guide covers what a ticket shows, how booking works and what the waiting-list codes mean.",
        ],
      },
      {
        heading: "Where to book",
        paragraphs: [
          "The official online channel is IRCTC, through its website and app. You register with an email address and a mobile number, then search by station and date. Foreign visitors can register too, and the site accepts international cards for foreign-passport bookings, though the rules on registration and payment have been revised from time to time, so check the current instructions on the IRCTC site first.",
          "You can also book at a station reservation counter, which is useful if your card or phone does not work online. Many large stations have a separate counter or window for foreign tourists, where a passport is needed. Third-party booking apps exist, but they add a fee and the ticket still comes from IRCTC.",
          "Advance reservations generally open 60 days before the date of travel, excluding the travel day itself. Popular routes and festival dates fill quickly, so book as soon as the window opens if your dates are fixed.",
        ],
      },
      {
        heading: "Choosing a class",
        paragraphs: [
          "First AC (1A) has lockable cabins for two or four. Second AC (2A) has open bays of four berths and two across the corridor, with curtains. Third AC (3A) packs three tiers into each bay, plus two across the corridor, and is the most common choice for overnight trips. Sleeper (SL) has no air conditioning and is cheaper but hotter and more crowded. For daytime travel, Chair Car (CC) and Executive Chair Car (EC) are seated classes found on faster trains. Second Sitting (2S) is a cheap seat with no air conditioning.",
          "Not every train has every class. The booking page shows only what is available on that train.",
        ],
      },
      {
        heading: "Reading the ticket",
        paragraphs: [
          "A ticket carries a ten-digit PNR number, which identifies the booking. It shows the train number and name, the boarding and destination stations, the date, the class and, once confirmed, the coach and berth for each passenger, such as B2, 34, Lower. Berth abbreviations are LB (lower), MB (middle), UB (upper), SL (side lower) and SU (side upper). The coach position is shown on the platform display or on the paper chart pasted to the coach.",
          "You must carry a valid photo identity along with the e-ticket. For foreigners that is the passport.",
        ],
      },
      {
        heading: "Waiting lists and what they mean",
        paragraphs: [
          "CNF means confirmed. RAC, reservation against cancellation, means you have a shared sideways berth that may become a full berth if others cancel. WL means waiting list, and the number shows your place in the queue. A WL ticket does not entitle you to board a reserved coach unless it clears.",
          "The prefix tells you more. GNWL is the general waiting list, which moves fastest. RLWL (remote location) and PQWL (pooled quota) clear less often. Chart preparation, normally about four hours before departure, decides your final status, and a ticket that remains on the waiting list is cancelled and refunded automatically for e-tickets. The IRCTC prediction on the booking page is only an estimate.",
        ],
      },
      {
        heading: "Tatkal and last-minute options",
        paragraphs: [
          "Tatkal quota opens one day before the journey, at 10:00 for air-conditioned classes and 11:00 for non-AC classes, and costs more. Seats go within minutes on busy trains, so log in early with your passenger details saved. Premium Tatkal is dearer still and its price changes with demand. Some stations also have a foreign tourist quota (FTQ), which can sometimes release seats when the general quota is full.",
        ],
      },
      {
        heading: "On the day",
        paragraphs: [
          "Arrive at least thirty minutes early. Platform numbers are announced shortly before arrival and can change, so check the display screens and the app. Keep valuables close, chain your bag to the berth rail if you wish, and eat food only from sealed or reliable sources. If you must cancel, do so through the same channel you used to book, because refund deductions depend on how close to departure you cancel.",
        ],
      },
    ],
    relatedDestinationSlugs: ["delhi", "agra", "varanasi", "jaipur", "kolkata"],
    wikipediaTitle: "Indian Railways",
    publishedOn: "2026-11-08",
    sources: [
      { label: "IRCTC", url: "https://www.irctc.co.in" },
      { label: "Indian Railways", url: "https://indianrailways.gov.in" },
      { label: "Wikipedia: Indian Railways", url: "https://en.wikipedia.org/wiki/Indian_Railways" },
    ],
  },
  {
    slug: "planning-a-first-trip-to-india",
    title: "Planning a first trip to India",
    dek: "How to choose a season, a route and a pace for a first visit, with notes on visas, money, health and getting around.",
    category: "How-to",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "India is large and varied, and a first trip goes better if it is small. Most visitors enjoy one or two regions more than a rushed tour of six. This guide sets out the decisions to make before you book.",
        ],
      },
      {
        heading: "Choose a season first",
        paragraphs: [
          "Season shapes everything else. October to March is the usual period for the plains of the north and the centre, when days are warm and dry. April to June is very hot in these areas, but it is the main season for the high Himalaya. June to September is the monsoon in most of the country, though Ladakh and Spiti sit in a rain shadow and are at their most accessible then. The south and the east coast have a second rainy season in October to December.",
          "Match the place to the month, not the other way round. Rajasthan in December, Kerala in January and Ladakh in July are good examples.",
        ],
      },
      {
        heading: "Pick a region and keep to it",
        paragraphs: [
          "Distances are long and trains and roads are slow. A sensible first itinerary is two weeks in one area: Delhi, Agra and Rajasthan; Kerala and Tamil Nadu; Mumbai, Goa and Karnataka; or Kolkata and the eastern hills. Aim for no more than a night or two in each place, and budget one buffer day for delays.",
          "The Destinations section of this site lists sensible lengths of stay for each place, and the circuits suggest ways to link them.",
        ],
      },
      {
        heading: "Visas and paperwork",
        paragraphs: [
          "Most foreign nationals need a visa, and many can apply online for an e-visa through the Indian government's official portal. Rules, fees and eligible nationalities change, so use only the official site and ignore lookalike websites that charge extra. Your passport should be valid for at least six months from arrival and have blank pages. Some regions need separate permits, which is covered in our guide to restricted areas.",
        ],
      },
      {
        heading: "Money and connectivity",
        paragraphs: [
          "Cards are widely accepted in cities and larger hotels, but small shops, rural areas and many taxis want cash. Withdraw from ATMs attached to bank branches during daylight, and carry small notes for tips, tolls and snacks. UPI payment apps are everywhere, but access for foreign visitors is limited, so do not plan around them. A local SIM needs identity documents and can take time to activate, so ask your hotel which route is simplest at your arrival airport. An eSIM is an alternative.",
        ],
      },
      {
        heading: "Health and food",
        paragraphs: [
          "See a travel clinic six to eight weeks before departure. Typical advice covers routine vaccinations, typhoid and hepatitis A, and malaria precautions for some areas. Drink sealed or filtered water, choose busy food stalls where food is cooked fresh in front of you, and carry oral rehydration salts. Travel insurance that covers medical evacuation is worth having, especially if you plan to go above 3,000 metres.",
        ],
      },
      {
        heading: "Getting around and staying safe",
        paragraphs: [
          "Trains are the most comfortable way to cover long distances, and domestic flights save time on routes like Delhi to Kochi. Within cities, app-based taxis and auto-rickshaws are convenient, and agreeing a fare or using a meter avoids disputes. Some solo women travellers prefer to book prepaid taxis at airports and to avoid night arrivals in unfamiliar towns. Use common-sense precautions with bags and phones in crowds.",
          "Be wary of unsolicited offers of help at stations and tourist sites, particularly claims that your hotel has closed or that your ticket is invalid. Check with the station enquiry counter or your hotel directly.",
          "In an emergency, dial 112, the single national emergency number run under the Ministry of Home Affairs. The Ministry of Tourism also runs a 24-hour multilingual tourist helpline on 1800-11-1363, or 1363 as a short code, for travel information and help if you are in difficulty.",
        ],
      },
      {
        heading: "Pace yourself",
        paragraphs: [
          "The first few days can feel intense because of noise, crowds and heat. Plan a quiet first afternoon, avoid midday sightseeing in the hot months and leave one slow day in each week. A short trip done calmly is better than a long one done in a rush.",
        ],
      },
    ],
    relatedDestinationSlugs: ["delhi", "agra", "jaipur", "udaipur", "alappuzha", "goa"],
    wikipediaTitle: "Tourism in India",
    publishedOn: "2026-11-08",
    sources: [
      { label: "Indian Visa Online (Government of India)", url: "https://indianvisaonline.gov.in" },
      { label: "Incredible India", url: "https://www.incredibleindia.org" },
      { label: "Ministry of Home Affairs: Emergency Response Support System, 112 (read 9 November 2026)", url: "https://www.mha.gov.in/nirbhayaerss-section" },
      { label: "PIB, Ministry of Tourism: 24x7 multilingual tourist helpline 1800-11-1363 or 1363 (read 9 November 2026)", url: "https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1882744" },
      { label: "Wikipedia: Tourism in India", url: "https://en.wikipedia.org/wiki/Tourism_in_India" },
    ],
  },
  {
    slug: "visiting-temples-mosques-and-gurdwaras-respectfully",
    title: "Visiting temples, mosques and gurdwaras respectfully",
    dek: "What to wear, when to take your shoes off and how to behave at Hindu, Muslim, Sikh, Jain, Buddhist and Christian places of worship.",
    category: "Culture",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "Places of worship are central to daily life in India, and many welcome visitors. A few habits are common to nearly all of them, and each tradition has its own details. When in doubt, watch what local worshippers do and follow the signs and any staff who speak to you.",
        ],
      },
      {
        heading: "Habits that apply nearly everywhere",
        paragraphs: [
          "Dress modestly: cover your shoulders and knees, and for women a scarf is useful for covering the head. Remove your shoes before entering and leave them at the shoe stand. Socks are usually accepted, and stone floors in summer can be very hot. Speak quietly, switch off your phone and do not point your feet at sacred images or people.",
          "Ask before taking photographs. Many places forbid photography inside the sanctum or prayer hall, and some charge for cameras. Never photograph worshippers, especially women and children, without asking.",
        ],
      },
      {
        heading: "Hindu temples",
        paragraphs: [
          "Shoes are left outside. Worshippers often walk clockwise around the shrine. Prasad, a food offering that has been blessed, is given out and is accepted with the right hand. Leather items, such as belts and bags, are not allowed in some temples. A few temples admit only Hindus, particularly in parts of Kerala and Odisha, and the Jagannath Temple at Puri is among them. Respect the restriction, because arguing with guards will not help, and look for alternative viewing points, which are sometimes provided.",
          "Some temples have separate dress rules. In several Kerala temples men wear a mundu and no shirt.",
        ],
      },
      {
        heading: "Mosques and dargahs",
        paragraphs: [
          "Non-Muslim visitors are welcome at many mosques outside prayer times, but not at all. Jama Masjid in Delhi, for example, admits visitors with conditions. Women are asked to cover their arms, legs and hair, and loan robes are sometimes provided. Avoid visiting during Friday midday prayers. Do not walk in front of anyone who is praying.",
          "Dargahs, shrines of Sufi saints such as Nizamuddin in Delhi and Ajmer Sharif, welcome people of all faiths. Heads are covered and shoes left outside. Visitors may offer flowers or a chadar, and qawwali music is often sung in the evening, with small donations welcomed.",
        ],
      },
      {
        heading: "Gurdwaras",
        paragraphs: [
          "Everyone is welcome in a gurdwara, regardless of faith. Cover your head with a scarf or bandana (rumals are usually available at the entrance), remove shoes and wash your hands and feet. Tobacco, alcohol and meat are not allowed on the premises. Walk clockwise around the sacred pool at the Golden Temple. Sit on the floor, accept the karah prasad in cupped hands, and eat the langar meal in line with everyone else. Keep your feet from pointing toward the Guru Granth Sahib.",
        ],
      },
      {
        heading: "Jain, Buddhist and Christian places",
        paragraphs: [
          "At Jain temples, such as Ranakpur and Dilwara, leather items are generally not allowed, so check the rules at the entrance. Buddhist monasteries are entered after shoes are removed, with visitors walking clockwise around stupas and prayer wheels and never touching sacred objects. Churches are open to visitors outside services. Dress modestly, keep to the side during Mass, and do not use flash.",
        ],
      },
      {
        heading: "Small courtesies",
        paragraphs: [
          "Donations are welcome but not required, and anyone who insists on a fee for blessing you is not an official. Use official ticket counters, and ask the temple office about a guide if you want one. If you are unsure, ask politely. Most people will be pleased that you did.",
        ],
      },
    ],
    relatedDestinationSlugs: ["amritsar", "varanasi", "delhi", "madurai", "bodh-gaya", "leh"],
    wikipediaTitle: "Religion in India",
    publishedOn: "2026-11-08",
    sources: [
      { label: "Wikipedia: Religion in India", url: "https://en.wikipedia.org/wiki/Religion_in_India" },
      { label: "Wikipedia: Langar (Sikhism)", url: "https://en.wikipedia.org/wiki/Langar_(Sikhism)" },
      { label: "Wikipedia: Harmandir Sahib", url: "https://en.wikipedia.org/wiki/Golden_Temple" },
    ],
  },
  {
    slug: "travelling-in-the-indian-monsoon",
    title: "Travelling in the Indian monsoon",
    dek: "When the rains arrive, where they are heaviest, what stops working and which places are easiest to visit between June and September.",
    category: "Season",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "The south-west monsoon brings most of India's annual rainfall, and travel is different during it. Some trips become harder, a few become easier, and the landscape changes completely. This guide explains how the season behaves and how to plan around it.",
        ],
      },
      {
        heading: "How the season moves",
        paragraphs: [
          "The monsoon normally reaches Kerala in the first days of June and moves north and east over the following weeks, covering most of the country by early July. It withdraws from the north-west from around September and from the rest of the country in the following weeks. The India Meteorological Department publishes onset and withdrawal dates and daily forecasts, and these are more reliable than any rule of thumb. The south-east coast, including Chennai, gets most of its rain from the north-east monsoon between October and December.",
          "Rain rarely falls all day. In many places it comes in heavy spells, with clear periods in between.",
        ],
      },
      {
        heading: "Where it is hardest",
        paragraphs: [
          "Mumbai and the Konkan coast, Goa, coastal Karnataka and Kerala receive the heaviest rain, and the Western Ghats can see landslides on roads. The north-east, including Meghalaya, has extraordinary rainfall and frequent landslides in Sikkim, Assam and Arunachal Pradesh. Himalayan roads in Uttarakhand and Himachal Pradesh can be closed for days by slides, flash floods or damaged bridges, which is why pilgrimages and treks there are often disrupted. Many beach shacks in Goa close and the sea is unsafe for swimming, with red flags on the beaches.",
        ],
      },
      {
        heading: "Where it is easier",
        paragraphs: [
          "Ladakh and Spiti lie in the rain shadow of the Himalaya and have their main season from June to September, with roads open. Care is still needed at stream crossings and on the Manali approach roads. The Valley of Flowers in Uttarakhand reaches its flowering peak from about July to September. The Western Ghats turn green, and Kerala's Ayurveda centres promote treatments in the monsoon, which traditional practitioners regard as a suitable season for them. Rajasthan's lakes fill, and Udaipur and Mount Abu are cooler. Hotel prices in many leisure destinations fall.",
        ],
      },
      {
        heading: "Practical planning",
        paragraphs: [
          "Book flexible tickets, and allow a buffer of one or two days before an international flight. Trains in flood-prone areas, including parts of Mumbai and Assam, can be cancelled at short notice, so check the railway's alerts the evening before and again on the morning of travel. Roads in the hills should be driven in daylight, and local drivers know which routes are safe on a given day.",
          "Pack a light waterproof jacket and not just an umbrella, quick-drying clothes, sandals that grip, and sealed bags for electronics and documents. Carry insect repellent, because mosquito-borne illnesses such as dengue increase. Choose boiled or filtered water and avoid raw salads and street food that has been standing, as stomach infections increase in the rains.",
        ],
      },
      {
        heading: "Safety on the ground",
        paragraphs: [
          "Do not wade through flooded streets, since open drains and manholes are hidden under the water. Stay out of rivers and waterfalls when water is rising, because a mild-looking stream can rise within minutes after upstream rain. Respect closures and warnings from local police and forest officers. Treks may be shut for the monsoon altogether, and that is a decision to follow, not to argue with.",
        ],
      },
      {
        heading: "Choosing whether to go",
        paragraphs: [
          "If you have flexible dates and a taste for green scenery, the monsoon can be a good time for Kerala, the Western Ghats, Ladakh and the Valley of Flowers. If your plans involve beaches, wildlife safaris (many parks close from July to September) or fixed deadlines, travelling between October and March is simpler.",
        ],
      },
    ],
    relatedDestinationSlugs: ["alappuzha", "munnar", "leh", "valley-of-flowers", "mumbai", "shillong-sohra"],
    wikipediaTitle: "Monsoon of India",
    publishedOn: "2026-11-08",
    sources: [
      { label: "India Meteorological Department", url: "https://mausam.imd.gov.in" },
      { label: "Wikipedia: Monsoon of India", url: "https://en.wikipedia.org/wiki/Monsoon_of_India" },
    ],
  },
  {
    slug: "permits-for-restricted-areas",
    title: "Permits for restricted areas in India",
    dek: "Which regions need a permit, what the main types are called and how to find the current rules before you travel.",
    category: "How-to",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "Some of India's most remote regions are close to international borders or are protected for the benefit of local communities. Visitors need a permit to enter, and the rules differ between Indian citizens and foreign nationals. Permit rules change often, so this guide explains the system and tells you where to check the current position.",
        ],
      },
      {
        heading: "The main permit types",
        paragraphs: [
          "An Inner Line Permit (ILP) is issued under a colonial-era regulation to people who visit certain north-eastern states from outside. The states that have used it include Arunachal Pradesh, Mizoram and Nagaland, and Manipur was added in 2019. Each state runs its own system, and many now have online applications. Arunachal Pradesh issues its e-ILP to Indian citizens only, while the Nagaland government's ILP portal also has a category for foreign tourists. Foreign nationals usually need a Restricted Area Permit or Protected Area Permit as well.",
          "A Protected Area Permit (PAP) and Restricted Area Permit (RAP) are issued by the central and state governments for specified border areas. Foreigners generally travel in a group of at least two and sometimes with an approved guide, and in some places the rules have been relaxed for particular areas and periods.",
        ],
      },
      {
        heading: "Regions where permits come up",
        paragraphs: [
          "In Arunachal Pradesh, places such as Tawang and Ziro need an ILP for Indian visitors, and a PAP for foreigners. Sikkim has rules for the north of the state and for border sites. Tsomgo Lake and some higher areas need a permit that the district office or a registered operator can arrange. Nagaland and Mizoram use ILPs for visitors from outside, and the Mizoram tourism site says foreign nationals need a Protected Area Permit applied for through the e-FRRO portal, and dates that requirement from 17 December 2024. In Ladakh, foreign nationals need a Protected Area Permit for areas such as Nubra and Pangong, while the Leh district portal says the Inner Line Permit applies to foreign tourists only and asks Indian visitors to register and pay fees; the system has changed in recent years.",
          "The Andaman and Nicobar Islands have restricted areas, particularly the Nicobar group and tribal reserves, where access is limited. An A&N tourism department notice from March 2026 says foreign nationals do not need a Restricted Area Permit for 29 listed islands, but nationals of Afghanistan, China and Pakistan still need a permit approved in advance, and separate approvals apply to tribal reserves, reserved forests and wildlife sanctuaries. Lakshadweep requires an entry permit for non-residents, issued by the administration. Parts of Himachal Pradesh, such as stretches near the Tibetan border in Kinnaur and Spiti, have had permit requirements for foreigners that may differ from the current ones. Check with the state before you travel.",
        ],
      },
      {
        heading: "How to apply",
        paragraphs: [
          "Start with the official state tourism or home department website. Many states offer online application with scans of an identity document and photograph, and issue the permit by email. Where an agent must apply for you, such as for some Sikkim and Ladakh routes, choose a registered operator and ask for a receipt. Permits are not usually sold by hotels or drivers on the day, and anyone who promises one with no paperwork should be checked with the issuing office.",
          "Apply well ahead. Processing can take a few days to a few weeks, and some cannot be extended once you are in the area.",
        ],
      },
      {
        heading: "Carrying and using the permit",
        paragraphs: [
          "Carry several printed copies and the original identity document you used to apply, because checkpoints may keep a copy. Keep to the route and dates stated on the permit. Some require registration at police stations or checkposts on entry and exit. Photography is banned near military installations, bridges and border posts, and drones are heavily restricted.",
        ],
      },
      {
        heading: "Why the rules exist",
        paragraphs: [
          "The restrictions serve border security and, in several states, the protection of local and indigenous communities and their land. Treat them as a condition of visiting. Hire local guides and homestays, ask before photographing people, and do not enter a village without an invitation or a guide from it.",
        ],
      },
      {
        heading: "Where to confirm the current rules",
        paragraphs: [
          "The Ministry of Home Affairs and the Bureau of Immigration publish central rules, and each state's tourism department publishes its own. Rules can change with little notice, so confirm the situation a few weeks before departure and again just before you travel.",
        ],
      },
    ],
    relatedDestinationSlugs: ["tawang", "ziro", "gangtok", "leh", "kohima", "aizawl", "andaman", "lakshadweep"],
    wikipediaTitle: "Inner Line Permit",
    publishedOn: "2026-11-08",
    sources: [
      { label: "Government of Nagaland: Inner Line Permit portal, FAQ (read 9 November 2026)", url: "https://ilp.nagaland.gov.in/faq" },
      { label: "Mizoram Tourism: entry formalities (read 9 November 2026)", url: "https://mizoramtourism.com/about/4" },
      { label: "Government of Sikkim, Tourism and Civil Aviation Department: general info and permits (read 9 November 2026)", url: "https://www.sikkim.gov.in/department/departmentmenudetails?url=Menu%3Dtourism-civil-aviation-department%2Fgeneral-info" },
      { label: "Leh District Tourist Management System: FAQ (read 9 November 2026)", url: "https://www.lahdclehpermit.in/faq/" },
      { label: "A&N Tourism: Restricted Area Permit notice (March 2026, read 9 November 2026)", url: "https://tourism.andamannicobar.gov.in/userpages/admin/whatsnewfile/2026030570Restricted Area Permit.pdf" },
      { label: "Ministry of Home Affairs, Government of India", url: "https://www.mha.gov.in" },
      { label: "Bureau of Immigration, India", url: "https://boi.gov.in" },
      { label: "Wikipedia: Inner Line Permit", url: "https://en.wikipedia.org/wiki/Inner_Line_Permit" },
    ],
  },
  {
    slug: "low-impact-travel-in-the-himalaya",
    title: "Low-impact travel in the Himalaya",
    dek: "How to handle altitude, water, waste and local communities with care when visiting India's mountain regions.",
    category: "Responsible travel",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "The Indian Himalaya is a living landscape with villages, monasteries, pastures and fragile water sources, and visitor numbers are rising in many valleys. Small choices by visitors add up. This guide sets out practical ways to travel with less impact.",
        ],
      },
      {
        heading: "Go slowly for your own sake and the place's",
        paragraphs: [
          "Altitude sickness can affect anyone above about 2,500 metres, whatever their fitness. Climb gradually, spend two nights at Leh (3,500 m) before going higher, and avoid sleeping more than about 500 metres higher each night above 3,000 metres. Drink water, skip alcohol in the first days and descend if headaches, nausea or breathlessness worsen. Rescue in remote valleys is slow and burdens local people, so insurance and caution are a courtesy as well as common sense.",
        ],
      },
      {
        heading: "Water",
        paragraphs: [
          "Mountain villages often depend on a single spring or stream, and a visitor's long shower may use what a household needs for the day. Ask your homestay what is available, keep washing short, and avoid using soap or toothpaste in streams. Bring a refillable bottle with a filter or purification tablets and refill at filtered water points, in place of buying bottled water that someone must carry up and then carry the empty bottles back down.",
        ],
      },
      {
        heading: "Waste",
        paragraphs: [
          "Plastic and packaging do not decompose quickly in cold, dry air, and many remote settlements have no collection. Carry out what you carry in, including wrappers, batteries and sanitary products. Take a small bag for rubbish, and decline carrier bags and straws. Some Himalayan states have restrictions on single-use plastics and on bottles in protected areas, and fines are charged. Burning rubbish or burying it is not a solution.",
        ],
      },
      {
        heading: "Fuel, fires and trails",
        paragraphs: [
          "Wood is scarce above the tree line, and fires harm slow-growing vegetation. Use stoves and lodges that cook with gas or electricity instead of building campfires. Stay on marked trails to limit erosion, do not pick flowers or collect plants, and keep distance from wildlife. In the Valley of Flowers and other protected areas, rules on entry hours, camping and group size are enforced by forest staff and exist for the plants.",
        ],
      },
      {
        heading: "Respect communities and sacred places",
        paragraphs: [
          "Mountain communities include Buddhist, Hindu, Muslim and animist traditions, and many have sacred peaks, lakes and monasteries. Follow local customs: walk clockwise around mani walls and stupas, ask before entering a prayer hall, and keep voices low. Some peaks and lakes are considered the homes of deities, and climbing or swimming in them may be forbidden. Ask a local guide or monastery before photographing monks, festivals or private homes, and do not offer sweets or money to children, which encourages begging.",
        ],
      },
      {
        heading: "Spend where it helps",
        paragraphs: [
          "Staying in family-run homestays, hiring local guides and porters, and buying from cooperatives keeps money in the valley. Pay porters a fair wage, check that they have adequate warm clothing and shelter, and keep loads to a reasonable weight. Visit in shoulder months where you can, since peak season puts the greatest strain on water and roads. Avoid the busiest viewpoints at the busiest times, and consider smaller valleys that receive fewer visitors.",
        ],
      },
      {
        heading: "Travelling on the road",
        paragraphs: [
          "Himalayan roads are narrow and prone to slides, and drivers who know the route are worth hiring. Share vehicles where possible, avoid idling engines at high passes, and keep to speed limits. Check road status with the local police or the Border Roads Organisation before you set out, and allow spare days in your plan for closures.",
        ],
      },
    ],
    relatedDestinationSlugs: ["leh", "spiti-valley", "valley-of-flowers", "manali", "darjeeling", "gangtok", "tawang"],
    wikipediaTitle: "Himalayas",
    publishedOn: "2026-11-08",
    sources: [
      { label: "Wikipedia: Himalayas", url: "https://en.wikipedia.org/wiki/Himalayas" },
      { label: "Wikipedia: Altitude sickness", url: "https://en.wikipedia.org/wiki/Altitude_sickness" },
      { label: "Wikipedia: Valley of Flowers National Park", url: "https://en.wikipedia.org/wiki/Valley_of_Flowers_National_Park" },
    ],
  },
];
