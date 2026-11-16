import type { Destination } from "@/types/content";

const wiki = (title: string) => ({
  label: `${title} (Wikipedia)`,
  url: encodeURI(`https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`),
});

export const northeastDestinations: Destination[] = [
  {
    slug: "tawang",
    name: "Tawang",
    stateSlug: "arunachal-pradesh",
    region: "northeast",
    tagline:
      "A high Monpa Buddhist town in western Arunachal Pradesh, reached over the Sela Pass and close to the Tibetan frontier.",
    categories: ["mountains", "religious", "lakes", "cultural", "adventure"],
    coordinates: { lat: 27.586, lng: 91.8594 },
    wikipediaTitle: "Tawang Monastery",
    popular: true,
    hiddenGem: false,
    overview: [
      "Tawang is the headquarters of Tawang district, in the far north-west of Arunachal Pradesh. The town sits at roughly 2,700 metres on a ridge above the Tawang Chu valley, with Bhutan to the west and the Tibet Autonomous Region of China to the north. Its main institution is Tawang Monastery, a Gelug-school Buddhist monastery that dominates the skyline and remains an active community of monks.",
      "The people of the district are mostly Monpa, a Tibetic-speaking Buddhist community with its own dialects, dress and festival calendar. Visitors will see prayer wheels, mani walls, chortens and prayer flags in almost every village. The area also has a strong military presence, because it lies close to the disputed boundary with China, and army-run facilities, war memorials and checkpoints are part of the ordinary landscape.",
      "The journey is a large part of the visit. The usual road climbs from the Assam plains through Bhalukpong, Dirang and Bomdila, then crosses the Sela Pass at about 4,170 metres before descending to Jang and on to Tawang. Many travellers take two days over it, spending a night at Dirang or Bomdila to acclimatise. The Sela Tunnel, opened in 2024, now carries traffic under the pass, which has shortened the drive and made it less dependent on snow clearance, though landslides and weather closures still happen.",
      "Tawang is cold for much of the year and can be below freezing from December to February. The pace is slow, the air is thin, and most sights are monasteries, memorials, lakes and viewpoints rather than conventional attractions. Allow time for the altitude and for the road, and treat religious spaces as places of worship rather than backdrops.",
    ],
    history: [
      "Tawang Monastery, known in Tibetan as Galden Namgey Lhatse, was founded in the early 1680s by Merak Lama Lodre Gyatso, in line with the wishes of the Fifth Dalai Lama. It was linked to Drepung Monastery in Lhasa and became the main Gelug institution of the Monpa region. The Sixth Dalai Lama, Tsangyang Gyatso, is traditionally held to have been born in the Tawang area, at Urgelling.",
      "The Tawang tract was administered by Tibetan authorities for a long period, with local Monpa communities paying dues to the monastery and to Lhasa. The 1914 Simla Convention drew the McMahon Line, which placed Tawang on the Indian side; China does not accept that boundary. Indian administration was extended to Tawang in early 1951, led by the assistant political officer Major R. Khathing.",
      "The Dalai Lama crossed into India through the Tawang area in March 1959. During the Sino-Indian war of October 1962 Chinese forces advanced into Tawang, then withdrew north of the McMahon Line after the ceasefire. The war, especially the fighting at Nuranang near Jang, is commemorated at memorials on the road to Tawang.",
    ],
    attractions: [
      {
        name: "Tawang Monastery",
        description:
          "The principal Gelug monastery of the region, with a large assembly hall, a library of Buddhist texts and a museum. Photography rules vary inside the prayer hall, so ask before using a camera and avoid disturbing prayers.",
        visitHours: 2,
        coordinates: { lat: 27.5875, lng: 91.8667 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Sela Pass",
        description:
          "A high pass of about 4,170 metres on the Bomdila to Tawang road, with a small lake and a roadside shrine. Snow can close or slow the road, and the altitude is noticeable for anyone who has come up quickly.",
        visitHours: 1,
        coordinates: { lat: 27.5, lng: 92.1 },
        interests: ["nature", "photography", "adventure"],
        timeOfDay: "morning",
      },
      {
        name: "Madhuri (Sangetsar) Lake",
        description:
          "A high-altitude lake formed after an earthquake in 1950, with dead tree trunks standing in the water. The road is rough and a permit from the district administration is normally required, so arrange this through a registered driver.",
        visitHours: 2,
        interests: ["nature", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Bum La Pass",
        description:
          "A border pass on the boundary with China, above 4,500 metres. Entry is restricted, requires a separate permit and is controlled by the army. It is not a casual excursion and may be closed without notice.",
        visitHours: 4,
        interests: ["adventure", "history"],
        timeOfDay: "morning",
      },
      {
        name: "Nuranang (Jang) Falls and the Jaswant Garh memorial",
        description:
          "A tall waterfall on the Nuranang river near Jang, about 40 km from Tawang, close to a memorial to the 1962 fighting. The falls are fullest after the monsoon and in spring melt.",
        visitHours: 2,
        interests: ["nature", "history", "photography"],
        timeOfDay: "any",
      },
      {
        name: "Urgelling Monastery",
        description:
          "A small monastery marking the traditional birthplace of the Sixth Dalai Lama, a short drive from Tawang town and usually quieter than the main monastery.",
        visitHours: 1,
        interests: ["spiritual", "history", "culture"],
        timeOfDay: "morning",
      },
      {
        name: "Tawang War Memorial",
        description:
          "A memorial to Indian soldiers killed in the 1962 war, with the names of the fallen and a small exhibition. It is a place of remembrance, so keep noise and photography respectful.",
        visitHours: 1,
        interests: ["history"],
        timeOfDay: "afternoon",
      },
    ],
    bestMonths: [3, 4, 5, 9, 10],
    bestTimeNote:
      "March to May and September to October usually give the clearest roads and views. Winter is cold and the pass can close after snowfall, although the Sela Tunnel has reduced the risk. The monsoon (June to August) brings landslides on the approach roads, and delays of a day or more are not unusual.",
    recommendedDays: { min: 4, max: 6 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 6000],
      comfort: [7000, 12000],
      assumptions:
        "Per person per day, assuming two people share a room and a shared or hired vehicle on a multi-day trip. Budget covers basic guesthouses and local meals; mid-range covers a hotel with heating and a hired car shared between two to four people; comfort adds the best available hotels and a private vehicle with a driver. Excludes flights or rail to Assam, permit fees, and any helicopter service.",
    },
    gettingThere: {
      air: "There is no commercial airport in Tawang. The nearest airports are Tezpur (Salonibari) in Assam and Guwahati, both many hours away by road. A helicopter service has run between Guwahati and Tawang in the past; check current operation and weather dependence before relying on it.",
      rail: "The nearest railheads are in Assam, such as Rangapara North and Tezpur, with Guwahati the main hub. Onward travel is by road.",
      road: "Guwahati to Tawang is roughly 450 to 500 km and usually takes two days with an overnight stop at Dirang or Bomdila. Shared Sumos and state buses run from Tezpur and Guwahati; many visitors hire a vehicle with a driver who knows the mountain road.",
      local:
        "Within Tawang, most visitors hire a local taxi by the day. Longer excursions such as Madhuri Lake and Bum La depend on permits and army clearance, and costs are usually set by the local taxi union.",
    },
    accommodation:
      "Tawang town has a range of guesthouses and hotels, from basic rooms to more comfortable properties, plus a few homestays in surrounding villages. Heating is essential from October to March, and not every room has it, so ask. Book ahead for October and for school holidays, when demand rises.",
    cuisine: [
      {
        name: "Thukpa and momos",
        note: "Tibetan-style noodle soup and dumplings, easy to find in town and well suited to the cold.",
      },
      {
        name: "Zan (millet porridge)",
        note: "A thick millet dish eaten in Monpa households, often with a vegetable or meat side.",
      },
      {
        name: "Butter tea (po cha)",
        note: "Salted tea with yak butter, a regular drink in monasteries and homes. The taste is an acquired one.",
      },
      {
        name: "Churpi",
        note: "Hard dried cheese from yak or cow milk, sold as a chew and used in soups.",
      },
    ],
    festivals: ["Losar", "Torgya", "Choksar", "Tawang Festival"],
    festivalSlugs: ["losar"],
    nearby: [
      {
        name: "Bum La Pass",
        distanceKm: 37,
        note: "Restricted border pass; permit and army clearance required, and access can change at short notice.",
      },
      {
        name: "Nuranang (Jang) Falls",
        distanceKm: 40,
        note: "Waterfall and 1962 memorial on the road towards Bomdila.",
      },
      {
        name: "Madhuri (Sangetsar) Lake",
        distanceKm: 38,
        note: "High lake reached by a rough road; permit normally required.",
      },
      {
        name: "Dirang",
        distanceKm: 140,
        note: "Valley town with hot springs, a kiwi-growing area and a common overnight stop.",
      },
      {
        name: "Bomdila",
        distanceKm: 180,
        note: "Larger town with monasteries and a viewpoint; the usual night halt on the way from the plains.",
      },
    ],
    precautions: [
      "Altitude sickness can affect anyone above about 2,500 metres. Ascend gradually, rest on the first day, drink water, and descend if headache, nausea or breathlessness worsens. Do not ignore symptoms at Sela or Bum La.",
      "Roads are prone to landslides, particularly from June to September, and fog and ice are common in winter. Build in spare days and avoid driving the pass at night.",
      "Mobile coverage is patchy outside Tawang town. Carry cash, since ATMs in the district can run out of notes.",
      "The area is militarily sensitive. Follow instructions at checkpoints, do not photograph military installations or personnel, and carry your permit and photo ID at all times.",
    ],
    tips: [
      "Spend a night at Dirang or Bomdila going up, and cross Sela in the morning when visibility is usually better.",
      "Use a driver with local experience; the same few hired vehicles are permitted on restricted routes.",
      "Dress in layers and bring a windproof jacket even in spring.",
      "Visit the monastery in the morning, when prayers are usually being held, and ask a monk before photographing inside.",
      "Carry some cash in small notes for monastery donations and tea stalls.",
    ],
    accessibility:
      "Tawang is difficult for wheelchair users and for anyone with limited mobility. Pavements are narrow and steep, the monastery involves stairs and uneven ground, and the long mountain road and altitude add strain. Some hotels have ground-floor rooms, but few have lifts. Contact accommodation directly about access.",
    responsibleTravel:
      "Treat monasteries as working religious sites: remove shoes and hats where asked, walk clockwise around chortens and prayer wheels, and do not touch sacred objects. Ask before photographing people, and keep to marked paths around lakes and high passes. Avoid plastic waste, which is hard to dispose of at altitude, and buy from Monpa craft sellers and local homestays where possible.",
    permits:
      "Indian citizens who are not Arunachal Pradesh Scheduled Tribe residents need an Inner Line Permit (ILP) to enter the state, normally obtained through the state's online ILP system or at designated entry points; tourists should apply before travel and carry a printed or digital copy. Foreign nationals need a Protected Area Permit (PAP) issued by the Ministry of Home Affairs and usually travel with a registered operator; group-size and routing rules have changed over time, so check with the Ministry of Home Affairs or a registered operator. Restricted places inside the district, including Bum La and Madhuri Lake, can need separate local permissions from the district administration and the army, and eligibility for foreign nationals is limited. Rules and fees change; confirm before booking.",
    faqs: [
      {
        question: "Do I need a permit to visit Tawang?",
        answer:
          "Yes. Indian visitors from outside Arunachal Pradesh need an Inner Line Permit, and foreign nationals need a Protected Area Permit. Bum La and Madhuri Lake can need additional local permission. See the permits section and confirm current rules with the state or the Ministry of Home Affairs.",
      },
      {
        question: "How long does it take to reach Tawang?",
        answer:
          "From Guwahati the drive is around 450 to 500 km and most travellers take two days, stopping at Dirang or Bomdila. Landslides or snow can add time, so keep a spare day on either side.",
      },
      {
        question: "Is the Sela Pass open all year?",
        answer:
          "The pass is generally kept open, and the Sela Tunnel, opened in 2024, has reduced dependence on the pass road. Heavy snow, landslides and military movement can still cause temporary closures, so ask your driver or the local police for current road status.",
      },
      {
        question: "Can I visit Tawang with children or older relatives?",
        answer:
          "It is possible, but the altitude and long road can be hard on young children and on people with heart or lung conditions. Take medical advice before booking, plan an acclimatisation night, and avoid Bum La unless everyone is fit.",
      },
    ],
    officialLinks: [
      { label: "Arunachal Pradesh Tourism", url: "https://arunachaltourism.com" },
    ],
    sources: [
      { label: "Arunachal Pradesh Tourism: arrival formalities (read 9 November 2026)", url: "https://arunachaltourism.com" },
      wiki("Tawang Monastery"),
      wiki("Tawang"),
      wiki("Sela Pass"),
      wiki("Inner Line Permit"),
    ],
    lastReviewed: "2026-11-09",
  },
  {
    slug: "ziro",
    name: "Ziro",
    stateSlug: "arunachal-pradesh",
    region: "northeast",
    tagline:
      "A pine-ringed plateau in Lower Subansiri where the Apatani people practise wet-rice cultivation combined with fish farming.",
    categories: ["village", "cultural", "photography", "weekend"],
    coordinates: { lat: 27.545, lng: 93.83 },
    wikipediaTitle: "Ziro",
    popular: true,
    hiddenGem: true,
    overview: [
      "Ziro is the main settlement of the Ziro valley in Lower Subansiri district, Arunachal Pradesh, at an altitude of about 1,500 metres. The valley is a broad, flat plateau surrounded by forested hills, and it is home to the Apatani people, whose villages cluster around the town of Hapoli, the district headquarters. Hari, Hong, Bulla, Dutta and Mudang Tage are among the larger Apatani villages.",
      "The Apatani are known for a form of wet-rice agriculture in which rice and fish are raised in the same terraced fields, irrigated by a network of small channels and without draught animals. Fields are managed by communities and households together, and bamboo and pine groves are tended as part of the same system. India has proposed the valley's cultural landscape for UNESCO World Heritage listing, and it appears on the country's Tentative List.",
      "Ziro is a place for slow walks, village visits and fieldwork seasons rather than set sights. Houses are traditionally built of bamboo and wood on raised floors, and many villages still have bamboo platforms and ceremonial posts. Visitors are guests in working villages, so photography and visits should be arranged politely, and respect for local rules matters more than ticking off places.",
    ],
    history: [
      "The Apatani are a Tani-speaking people with oral histories that place their settlement in the Ziro valley over many generations. Their agricultural system, social structure and village councils (bulyañ) developed within the valley, and they maintained relatively settled communities compared with some neighbouring groups.",
      "British officials had limited contact with the valley in the 19th century. After independence the area formed part of the North-East Frontier Agency and later became part of Arunachal Pradesh, which gained statehood in 1987. Ziro town developed as an administrative and market centre during this period.",
      "Traditional Apatani practices, such as the facial tattooing and nose plugs once worn by women, were discontinued by younger generations in the second half of the 20th century. Today they are mostly seen on older women, and visitors should not treat them as a spectacle or ask to photograph individuals without consent. Festivals such as Myoko and Dree remain central to community life.",
    ],
    attractions: [
      {
        name: "Hari village",
        description:
          "One of the larger Apatani villages, with traditional houses, community platforms and rice-and-fish fields at its edge. Visit with a local guide and ask before photographing people or homes.",
        visitHours: 2,
        coordinates: { lat: 27.5333, lng: 93.8167 },
        interests: ["culture", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Hong village",
        description:
          "A large Apatani village with a long street, traditional bamboo structures and nearby terraces, on the side of the valley. Visiting during field seasons gives a clearer sense of how the farming system works.",
        visitHours: 2,
        interests: ["culture", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Rice-and-fish paddy fields",
        description:
          "The terraced fields on the valley floor, where rice and fish are grown together. The rice is usually transplanted in spring and the fields are green through summer and gold in early autumn.",
        visitHours: 2,
        interests: ["nature", "photography", "culture"],
        timeOfDay: "morning",
      },
      {
        name: "Talley Valley Wildlife Sanctuary",
        description:
          "A forest sanctuary of subtropical and temperate vegetation to the south-west of Ziro, with trails through dense forest. Check conditions and entry arrangements with the forest department before going.",
        visitHours: 4,
        interests: ["nature", "wildlife", "adventure"],
        timeOfDay: "morning",
      },
      {
        name: "Meghna Cave Temple",
        description:
          "A Shiva shrine inside a cave near Ziro, visited mainly by pilgrims. The approach involves steps and a slippery floor, so wear shoes with good grip.",
        visitHours: 1,
        interests: ["spiritual"],
        timeOfDay: "any",
      },
      {
        name: "Hapoli market",
        description:
          "The main market of the valley, selling vegetables, local cane and bamboo goods and textiles, and a convenient place to arrange guides and transport.",
        visitHours: 2,
        interests: ["shopping", "photography"],
        timeOfDay: "afternoon",
      },
    ],
    bestMonths: [3, 4, 9, 10, 11],
    bestTimeNote:
      "March to April and September to November are comfortable for walking, with clearer views. Summer (June to August) is wet, though the fields are at their greenest. Winter days can be pleasant but nights are cold, and fog can reduce visibility in the morning.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 5000],
      comfort: [6000, 10000],
      assumptions:
        "Per person per day, with two people sharing a room. Budget covers basic homestays and local meals; mid-range covers a comfortable hotel and a hired car shared between two to four people; comfort covers the better hotels and a private vehicle. Excludes transport to the region, permit fees, and festival-time price surges.",
    },
    gettingThere: {
      air: "The nearest commercial airports are North Lakhimpur (Lilabari) in Assam and Itanagar's Donyi Polo airport, with Guwahati the main hub. Check schedules, since services at smaller airports change often.",
      rail: "The nearest railhead is Naharlagun, near Itanagar, with Harmutty and North Lakhimpur also used. Onward travel is by road.",
      road: "Ziro is connected to Itanagar and Naharlagun by road, a journey of around 4 to 6 hours depending on conditions. Shared Sumos and state buses run to Hapoli.",
      local:
        "Taxis and shared vehicles are available in Hapoli. Villages are close together, and walking between them is practical in good weather.",
    },
    accommodation:
      "Hapoli and Ziro have hotels and guesthouses, and Apatani families run homestays near the villages. Homestays are small, so book ahead, particularly during festivals, and be clear about arrival times. Facilities can be simple.",
    cuisine: [
      {
        name: "Pika pila",
        note: "A pickle-like preparation of bamboo shoot, commonly served as an accompaniment.",
      },
      {
        name: "Fish from the paddy fields",
        note: "Fish raised in the rice fields is eaten steamed, smoked or in light soups, depending on the household.",
      },
      {
        name: "Apong",
        note: "A rice beer of the Apatani, consumed at celebrations and offered to guests. It is mildly alcoholic.",
      },
      {
        name: "Boiled vegetables with chilli",
        note: "Simple, lightly spiced local fare, often served with rice.",
      },
    ],
    festivals: ["Myoko", "Dree", "Murung", "Ziro Festival of Music"],
    nearby: [
      {
        name: "Hapoli",
        distanceKm: 6,
        note: "District headquarters with the main market and bus stand.",
      },
      {
        name: "Talley Valley Wildlife Sanctuary",
        distanceKm: 30,
        note: "Forest reserve with trekking paths; arrangements through forest officials.",
      },
      {
        name: "Itanagar",
        distanceKm: 115,
        note: "State capital with a museum, monasteries and the nearest major services; road distance is longer.",
      },
    ],
    precautions: [
      "Roads between Ziro and the plains can be affected by landslides in the monsoon. Check conditions before setting out.",
      "Mobile coverage and ATMs are limited outside Hapoli, so carry cash.",
      "Photograph villagers only with their consent, and do not enter homes, granaries or ritual spaces without being invited.",
      "Do not walk across fish-and-rice fields. The channels and bunds are carefully maintained and easily damaged.",
    ],
    tips: [
      "Hire a local Apatani guide through your homestay for village visits. It brings income to the community and avoids awkward intrusions.",
      "Ask when seasonal work is happening; during planting or harvest, farmers may be busy.",
      "Dress for cool evenings even in summer.",
      "If a festival is planned, confirm dates with your host. Dates depend on community decisions and can shift.",
      "Carry a reusable water bottle and take your waste out of the villages.",
    ],
    accessibility:
      "The valley floor is relatively level, but village paths are often narrow, uneven or muddy, and traditional houses have steps and raised floors. Few accommodation options have ramps or accessible bathrooms. Travellers with mobility needs should speak to hosts in advance and plan private transport.",
    responsibleTravel:
      "Ziro is a working agricultural landscape, not a theme park. Go with permission, keep to paths, and accept that some places and rituals are not open to visitors. Do not ask villagers to pose in traditional dress or show ritual practices on demand. Buy craft goods directly from Apatani sellers, and avoid fees or small payments being used as a stand-in for conversation or consent.",
    permits:
      "Indian citizens who are not Arunachal Pradesh Scheduled Tribe residents need an Inner Line Permit (ILP), usually applied for online or at entry points before travel; carry a copy with photo ID. Foreign nationals need a Protected Area Permit (PAP) issued by the Ministry of Home Affairs and typically arranged through a registered operator. Rules, fees and group requirements change, so confirm with the state government or the Ministry of Home Affairs before booking.",
    faqs: [
      {
        question: "Do I need a permit for Ziro?",
        answer:
          "Yes. Indian visitors from outside Arunachal Pradesh need an Inner Line Permit, and foreign nationals need a Protected Area Permit. Confirm the current process with the state before booking.",
      },
      {
        question: "Is the Ziro Festival of Music held every year?",
        answer:
          "The independent music festival has been held in the valley in recent years, but it has not run every year and arrangements change. Confirm dates and ticketing with the organisers rather than relying on older articles.",
      },
      {
        question: "Can I visit Apatani villages as a tourist?",
        answer:
          "Yes, with courtesy. Go with a local guide or your homestay host, ask before photographing people or homes, and avoid entering ritual spaces. Payments and arrangements are best agreed with the host beforehand.",
      },
      {
        question: "How many days are enough?",
        answer:
          "Two to three full days is enough for the villages, fields and a day trip to the forest. Allow a day each way for travel from the plains.",
      },
    ],
    officialLinks: [
      { label: "Arunachal Pradesh Tourism", url: "https://arunachaltourism.com" },
    ],
    sources: [
      { label: "Arunachal Pradesh Tourism: arrival formalities (read 9 November 2026)", url: "https://arunachaltourism.com" },
      wiki("Ziro"),
      wiki("Apatani people"),
      wiki("Lower Subansiri district"),
      wiki("Inner Line Permit"),
    ],
    lastReviewed: "2026-11-09",
  },
  {
    slug: "gangtok",
    name: "Gangtok",
    stateSlug: "sikkim",
    region: "northeast",
    tagline:
      "Sikkim's capital, a hillside city of monasteries and viewpoints and the base for excursions to Tsomgo Lake and Nathu La.",
    categories: ["hill-stations", "mountains", "temples-heritage", "religious", "weekend"],
    coordinates: { lat: 27.3389, lng: 88.6065 },
    wikipediaTitle: "Gangtok",
    popular: true,
    hiddenGem: false,
    overview: [
      "Gangtok is the capital and largest city of Sikkim, on a ridge at about 1,650 metres in the eastern Himalaya. Houses and roads climb the hillside in steep tiers, with the Kangchenjunga range visible on clear mornings from several viewpoints. The city mixes Nepali, Lepcha, Bhutia and migrant communities, and Nepali is the common language of everyday life alongside Sikkimese, Lepcha, Hindi and English.",
      "The centre is compact. Mahatma Gandhi Marg, the main pedestrian street, is lined with cafés, shops and hotels and is free of vehicles, and the city is generally kept tidy, with local rules against littering and smoking in public. Monasteries such as Enchey and Rumtek, the Namgyal Institute of Tibetology and the Do Drul Chorten reflect Sikkim's Buddhist traditions.",
      "Many visitors use Gangtok as a base for day trips to Tsomgo (Changu) Lake and Nathu La, both of which need permits and registered vehicles. Further north, areas such as Lachen, Lachung and Gurudongmar need additional permits and are usually visited with an operator. The road network is mountain terrain and landslides during the monsoon can disrupt plans.",
    ],
    history: [
      "Sikkim was ruled from the 17th century by the Chogyals of the Namgyal dynasty, with Phuntsog Namgyal consecrated as the first Chogyal in 1642. The kingdom's capital moved several times, and Gangtok became the seat of government in the late 19th century. Its monasteries, including Enchey, date from the 19th century.",
      "Sikkim became a British protectorate through the 1861 Treaty of Tumlong and the 1890 Anglo-Chinese convention. After 1947 it became an Indian protectorate, with India responsible for defence and external affairs. Political change followed in the early 1970s, and in April 1975 a referendum led to the abolition of the monarchy.",
      "Sikkim joined the Indian union as its 22nd state on 16 May 1975. Gangtok has since grown quickly as a centre for administration, education and tourism. The trade route over Nathu La, closed after the 1962 war, reopened for limited border trade in 2006.",
    ],
    attractions: [
      {
        name: "Rumtek Monastery",
        description:
          "The Dharma Chakra Centre, seat of the Karmapa lineage in India, with a main temple, a monastic school and a golden stupa. It lies about 24 km from Gangtok by road and is in a military-sensitive area, so carry ID.",
        visitHours: 2,
        coordinates: { lat: 27.2886, lng: 88.5622 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Enchey Monastery",
        description:
          "A small Nyingma monastery dating from the 19th century, on a ridge above the city. The annual cham dance is held here in winter.",
        visitHours: 1,
        coordinates: { lat: 27.3384, lng: 88.6143 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning",
      },
      {
        name: "Namgyal Institute of Tibetology",
        description:
          "A research institute and museum with Tibetan manuscripts, thangka paintings and ritual objects. Hours and display areas can change, so check locally.",
        visitHours: 1.5,
        interests: ["history", "culture"],
        timeOfDay: "afternoon",
      },
      {
        name: "Do Drul Chorten",
        description:
          "A large white stupa surrounded by prayer wheels, built in 1945. Walk clockwise and avoid blocking the wheels when worshippers are present.",
        visitHours: 1,
        coordinates: { lat: 27.3292, lng: 88.6021 },
        interests: ["spiritual", "photography"],
        timeOfDay: "any",
      },
      {
        name: "Tsomgo (Changu) Lake",
        description:
          "A glacial lake at around 3,750 metres, about 38 km from Gangtok on the Nathu La road. A permit is required, access is by registered taxi, and the lake can freeze in winter. Altitude symptoms are possible.",
        visitHours: 3,
        coordinates: { lat: 27.3742, lng: 88.7619 },
        interests: ["nature", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Nathu La",
        description:
          "A border pass on the Indian side with China, about 56 km from Gangtok. Entry is limited to Indian citizens with permits, days of access are restricted and weather can close it. Foreign nationals are not allowed.",
        visitHours: 4,
        coordinates: { lat: 27.3866, lng: 88.8317 },
        interests: ["history", "adventure", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "MG Marg and the Lal Bazaar area",
        description:
          "The pedestrian promenade and the older market below it. Good for food, cafés and local crafts, particularly in the evening.",
        visitHours: 2,
        interests: ["food", "shopping"],
        timeOfDay: "evening",
      },
    ],
    bestMonths: [3, 4, 5, 10, 11],
    bestTimeNote:
      "March to May brings rhododendron flowers on higher ground, and October to November has the clearest mountain views. The monsoon (June to September) is wet, with a landslide risk on the approach roads. December to February is cold, and higher routes may be closed by snow.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 6500],
      comfort: [8000, 15000],
      assumptions:
        "Per person per day, with two people sharing a room. Budget covers simple guesthouses and local meals; mid-range covers a three-star hotel and shared taxis for excursions; comfort covers the better hotels and a private vehicle. Excludes transport to Sikkim, permit costs, and restricted-area tours to north Sikkim, which are priced separately.",
    },
    gettingThere: {
      air: "Pakyong Airport, about 30 km from Gangtok, has limited scheduled flights, so check current services. Bagdogra Airport near Siliguri in West Bengal, about 125 km away, has far more connections.",
      rail: "The nearest main railhead is New Jalpaiguri (NJP) near Siliguri, about 125 km from Gangtok. Sikkim itself has no operating passenger railway at present.",
      road: "From NJP or Bagdogra, the road along the Teesta valley takes about 4 to 5 hours, longer in rain. Shared jeeps and taxis run from Siliguri. Landslides on NH10 can cause delays.",
      local:
        "Within Gangtok, local taxis operate on fixed rates posted at stands. Shared taxis serve outlying routes. Walking is practical in the centre but hilly, and there is a ropeway across part of the city.",
    },
    accommodation:
      "Gangtok has hotels at all levels, mostly around MG Marg, Tadong and the roads above the centre, plus homestays in surrounding villages. Views and hill locations add to the price. Check whether your hotel has parking and lift access, since many are on steep slopes.",
    cuisine: [
      {
        name: "Momos and thukpa",
        note: "Steamed dumplings and noodle soup, found everywhere from street stalls to cafés.",
      },
      {
        name: "Gundruk and sinki",
        note: "Fermented leafy-green and radish-tap preparations used in soups, from Nepali-speaking households.",
      },
      {
        name: "Sel roti",
        note: "A ring-shaped rice-flour bread, associated with Nepali festivals.",
      },
      {
        name: "Chhurpi soup and Sikkimese thali",
        note: "Soup made from fermented yak cheese, and set meals with local vegetables and rice.",
      },
    ],
    festivals: ["Losoong", "Losar", "Pang Lhabsol", "Saga Dawa", "Maghey Sankranti"],
    festivalSlugs: ["losoong", "losar"],
    nearby: [
      {
        name: "Rumtek Monastery",
        distanceKm: 24,
        note: "Major Buddhist monastery and school; carry ID.",
      },
      {
        name: "Tsomgo (Changu) Lake",
        distanceKm: 38,
        note: "High lake; permit and registered vehicle required.",
      },
      {
        name: "Nathu La",
        distanceKm: 56,
        note: "Border pass open only to Indian citizens with permits, and on limited days.",
      },
      {
        name: "Darjeeling",
        distanceKm: 100,
        note: "Hill town in West Bengal, reachable by road in about 4 to 5 hours.",
        destinationSlug: "darjeeling",
      },
    ],
    precautions: [
      "Landslides can close roads in the monsoon. Avoid travelling at night and check road status with your driver or hotel.",
      "Altitude symptoms can affect visitors at Tsomgo Lake and Nathu La. Do not push on if you feel unwell.",
      "Carry photo ID. Border and military areas, including Rumtek, have checkpoints.",
      "Keep valuables safe and confirm taxi fares before leaving. Rates are posted at stands, but excursion prices vary.",
    ],
    tips: [
      "Book Tsomgo and Nathu La through a registered agent or hotel a day or two in advance, because permits depend on documents and daily limits.",
      "Carry photocopies of ID photographs for permit applications.",
      "Walk MG Marg in the evening. Respect local rules on littering and smoking.",
      "Mornings usually give the clearest Kangchenjunga views, with the best chance before cloud builds.",
      "Dress in layers, since temperatures drop sharply at higher altitudes.",
    ],
    accessibility:
      "Gangtok is steep, with many stairs and narrow pavements, so it is challenging for wheelchair users. MG Marg is level and pedestrianised, and some hotels have lifts. Monasteries often have steps and no ramps. Plan a private vehicle and ask hotels about step-free access in advance.",
    responsibleTravel:
      "Respect monastery rules on photography and dress, and keep to designated paths near lakes and high-altitude sites. Sikkim places high priority on cleanliness and limits plastic; carry reusable bottles and dispose of waste properly. Use registered operators for restricted areas and avoid overcrowded vehicles on mountain roads.",
    permits:
      "Indian citizens do not need a permit to visit Gangtok. Excursions to Tsomgo (Changu) Lake and Nathu La require permits arranged through registered travel agents or the tourism department, typically with photo ID and photographs. Nathu La is open to Indian citizens only. Foreign nationals need a Restricted Area Permit to enter Sikkim, which the state says is issued through Indian missions and Sikkim Tourism offices, plus a Protected Area Permit for Tsomgo; the state issues the Nathu La pass to Indian nationals only. Rules, fees and routes change, so confirm with the Sikkim tourism department before travel.",
    faqs: [
      {
        question: "Do I need a permit for Gangtok?",
        answer:
          "Indian citizens do not need one for the city itself, but need permits for Tsomgo Lake, Nathu La and restricted areas. Foreign nationals need a Sikkim permit. See the permits section and check current rules before travel.",
      },
      {
        question: "Can foreigners go to Nathu La?",
        answer:
          "No. Nathu La is open to Indian citizens only. Foreign nationals may be allowed to visit Tsomgo Lake with the right permit, subject to current rules.",
      },
      {
        question: "How do I reach Gangtok?",
        answer:
          "Most visitors fly to Bagdogra or take a train to New Jalpaiguri, then continue by road for 4 to 5 hours. Pakyong Airport, about 30 km away, has limited flights.",
      },
      {
        question: "Is Gangtok suitable for a long weekend?",
        answer:
          "Yes if you are within reach of Bagdogra, though the road adds hours. For anything beyond the city, such as Tsomgo or north Sikkim, allow additional days.",
      },
    ],
    officialLinks: [
      { label: "Sikkim Tourism", url: "https://sikkimtourism.gov.in" },
    ],
    sources: [
      { label: "Government of Sikkim, Tourism and Civil Aviation Department: general info and RAP/PAP guidelines (read 9 November 2026)", url: "https://www.sikkim.gov.in/department/departmentmenudetails?url=Menu%3Dtourism-civil-aviation-department%2Fgeneral-info" },
      wiki("Gangtok"),
      wiki("Sikkim"),
      wiki("Rumtek Monastery"),
      wiki("Nathu La"),
    ],
    lastReviewed: "2026-11-09",
  },
  {
    slug: "kohima",
    name: "Kohima",
    stateSlug: "nagaland",
    region: "northeast",
    tagline:
      "Nagaland's hill capital, known for its 1944 battlefield, its war cemetery and as the gateway to the Hornbill Festival and Angami villages.",
    categories: ["hill-stations", "cultural", "monuments", "village", "weekend"],
    coordinates: { lat: 25.6586, lng: 94.1053 },
    wikipediaTitle: "Kohima",
    popular: true,
    hiddenGem: false,
    overview: [
      "Kohima is the capital of Nagaland, on a ridge at about 1,260 metres in the Naga Hills near the Assam border. The city is the home area of the Angami Naga community, one of the 16 recognised Naga tribes, and it has grown around the older Kohima Village, which sits above the modern centre. Nagaland is a state with a Christian majority, and churches, Sunday services and choral singing are central to civic life.",
      "The city is known internationally for the Battle of Kohima in April 1944, a turning point of the Burma campaign, and for the Kohima War Cemetery, maintained by the Commonwealth War Graves Commission on the slopes of Garrison Hill. Visitors also use Kohima as a base for the Hornbill Festival, held each December at Kisama Heritage Village, and for visits to villages such as Khonoma and treks such as Dzükou Valley.",
      "The city is busy, with steep roads, traffic and a market selling local produce, fermented foods, shawls and handicrafts. Kohima is more of a base than a sightseeing city, and most visitors spend a day on the war sites and museum and the rest in the surrounding countryside.",
    ],
    history: [
      "The Angami and neighbouring Naga communities lived in fortified village-states, with their own councils and customary law, long before colonial rule. The British moved into the Naga Hills in the 19th century, setting up Kohima as the headquarters of the Naga Hills district in 1878 after clashes in the area, including the 1879 killing of a political officer at Khonoma.",
      "In April 1944 Japanese forces from Burma besieged British and Indian troops at Kohima and fought a close-quarters battle around Garrison Hill and the Deputy Commissioner's tennis court. Reinforcements relieved the garrison in mid-April, and the Japanese withdrew in June. The battle, together with Imphal, ended Japan's advance into India.",
      "After 1947 the Naga Hills were part of Assam. Naga political movements sought sovereignty or autonomy, and an armed conflict followed. Nagaland became a state on 1 December 1963. Political negotiations between the Government of India and Naga groups have continued for decades, with several ceasefires, and some questions remain unresolved. Short strikes and shutdowns still occur.",
    ],
    attractions: [
      {
        name: "Kohima War Cemetery",
        description:
          "A Commonwealth War Graves Commission cemetery on Garrison Hill, with more than a thousand graves and a memorial near the former tennis court. Visit quietly and with respect.",
        visitHours: 1.5,
        coordinates: { lat: 25.6574, lng: 94.1044 },
        interests: ["history"],
        timeOfDay: "morning",
      },
      {
        name: "Nagaland State Museum",
        description:
          "A museum with displays of Naga ornaments, costume, weapons and wooden artefacts, giving context for the state's communities. Check opening days before visiting.",
        visitHours: 1.5,
        interests: ["culture", "history"],
        timeOfDay: "afternoon",
      },
      {
        name: "Kisama (Naga Heritage Village)",
        description:
          "A site about 12 km from Kohima with morungs (communal houses) representing Naga communities. It hosts the Hornbill Festival in early December and is quieter at other times.",
        visitHours: 2,
        interests: ["culture", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Khonoma village",
        description:
          "An Angami village known for terraced fields, stone-paved paths and a community conservation ethic. It lies about 20 km from Kohima. Visit with a local guide and ask before photographing people or homes.",
        visitHours: 4,
        interests: ["culture", "nature", "history"],
        timeOfDay: "morning",
      },
      {
        name: "Dzükou Valley",
        description:
          "A high valley at about 2,400 metres, reached on foot from Viswema or Zakhama. The trek takes a few hours, trails can be slippery, and overnight stays require basic huts.",
        visitHours: 8,
        interests: ["nature", "adventure", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Kohima Village (Bara Basti)",
        description:
          "The older village above the city, with traditional gateways and houses. Walk respectfully and avoid intruding on residents.",
        visitHours: 1.5,
        interests: ["culture", "history"],
        timeOfDay: "afternoon",
      },
    ],
    bestMonths: [10, 11, 12, 3, 4],
    bestTimeNote:
      "October to December is dry and clear, and December brings the Hornbill Festival, when rooms and transport fill up. March to April is mild. The monsoon (June to September) brings landslides on the Dimapur road and on trails to Dzükou.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1400, 2400],
      midRange: [3200, 5500],
      comfort: [6500, 11000],
      assumptions:
        "Per person per day, with two people sharing a room. Budget covers simple lodges and local meals; mid-range covers a hotel and shared taxis for excursions; comfort covers the better hotels and a private car. Excludes transport to Nagaland, permit costs, and Hornbill Festival-week surcharges, when rates can rise sharply.",
    },
    gettingThere: {
      air: "Dimapur Airport, about 70 km from Kohima, is the nearest commercial airport. Flights are limited, so check schedules; Guwahati offers a wider range.",
      rail: "Dimapur railway station is the only major railhead in Nagaland, about 74 km from Kohima. Trains connect to Guwahati and other cities.",
      road: "Dimapur to Kohima takes around 2.5 to 3 hours on NH29, longer in rain or when the road is being widened. Shared taxis and buses run regularly.",
      local:
        "Taxis and shared Sumos operate locally. Day hire is the practical way to reach Kisama, Khonoma and trail heads.",
    },
    accommodation:
      "Kohima has hotels and lodges in the town and homestays in nearby villages. During Hornbill Festival, accommodation is booked far in advance and prices increase; consider staying in Khonoma or Dimapur and commuting. Check for hot water and heating in winter.",
    cuisine: [
      {
        name: "Smoked pork with bamboo shoot",
        note: "A staple dish of Naga cooking, often eaten with rice. Pork is common in Naga households.",
      },
      {
        name: "Axone (fermented soybean)",
        note: "A strong-smelling fermented soybean used in chutneys and stews. It is an acquired taste.",
      },
      {
        name: "Naga chilli chutney",
        note: "Made with the Naga king chilli (bhut jolokia), among the hottest chillies in cultivation. Try a small amount first.",
      },
      {
        name: "Galho",
        note: "A rice porridge cooked with vegetables and meat, popular in cold weather.",
      },
    ],
    festivals: ["Hornbill Festival", "Sekrenyi", "Moatsu", "Christmas"],
    festivalSlugs: ["hornbill", "christmas"],
    nearby: [
      {
        name: "Kisama Heritage Village",
        distanceKm: 12,
        note: "Site of the Hornbill Festival and a collection of tribal morungs.",
      },
      {
        name: "Khonoma",
        distanceKm: 20,
        note: "Angami village with terraced fields and a community conservation area.",
      },
      {
        name: "Dzükou Valley trailhead (Viswema)",
        distanceKm: 30,
        note: "Starting point for the trek to Dzükou Valley.",
      },
      {
        name: "Dimapur",
        distanceKm: 74,
        note: "Nagaland's airport and railhead, with Kachari ruins and a market.",
      },
    ],
    precautions: [
      "Check local news for bandhs, strikes or shutdowns, which can halt transport for a day or more. Keep a spare day before onward flights.",
      "Monsoon landslides can block NH29 and trail access to Dzükou. Avoid trekking in heavy rain.",
      "Pork, dog and exotic meats appear in some markets. Ask about ingredients if you have dietary restrictions.",
      "Carry your Inner Line Permit and photo ID. Foreign nationals must follow registration rules with the police.",
    ],
    tips: [
      "Visit the war cemetery early and the museum in the afternoon, to avoid clashing with Sunday closures.",
      "Most businesses close on Sundays; plan sightseeing and meals around this.",
      "Book Hornbill Festival accommodation months ahead.",
      "Arrange village visits through a guide or homestay, and ask before taking photographs.",
      "Carry cash, since cards are not accepted everywhere.",
    ],
    accessibility:
      "Kohima is hilly, with steep roads and uneven pavements, so it is difficult for wheelchair users. The war cemetery has paths and steps, and the museum has limited step-free access. Village visits and trails involve rough ground. Plan private transport and contact accommodation about lifts and ramps.",
    responsibleTravel:
      "Naga communities are not a spectacle. Ask before photographing people, dress modestly, and avoid wearing or buying items such as warrior regalia in ways that trivialise their meaning. Do not treat the 1944 battlefield as a backdrop for casual photography. Support local guides, homestays and craft sellers, and take rubbish away from villages and trails.",
    permits:
      "Anyone who is not an indigenous inhabitant of Nagaland needs an Inner Line Permit (ILP), which the state's online ILP portal issues for domestic and foreign tourists; carry it with photo ID. Foreign nationals are also reported to need a Protected Area Permit again since December 2024, and must follow police registration requirements. Rules, fees and forms change, so confirm with the Nagaland government or the Ministry of Home Affairs before travel.",
    faqs: [
      {
        question: "Do I need a permit for Kohima?",
        answer:
          "Yes. Visitors from outside Nagaland, Indian or foreign, need an Inner Line Permit, and foreign nationals are also reported to need a Protected Area Permit. See the permits section for details and confirm current rules before travel.",
      },
      {
        question: "When is the Hornbill Festival?",
        answer:
          "It is held at Kisama Heritage Village in early December, usually from 1 to 10 December. Confirm dates and entry arrangements with the state before booking.",
      },
      {
        question: "Is Kohima safe to visit?",
        answer:
          "Tourism functions normally for the most part, but strikes and shutdowns occur from time to time. Check local news and the advice of the state government before travel, and keep flexible dates.",
      },
      {
        question: "Can I trek to Dzükou Valley in one day?",
        answer:
          "It is possible as a long day trip from Kohima, but many travellers stay overnight in basic huts. Hire a guide in the monsoon and check weather and trail conditions first.",
      },
    ],
    officialLinks: [
      { label: "Government of Nagaland: Inner Line Permit portal", url: "https://ilp.nagaland.gov.in" },
    ],
    sources: [
      { label: "Government of Nagaland: Inner Line Permit portal, FAQ (read 9 November 2026)", url: "https://ilp.nagaland.gov.in/faq" },
      wiki("Kohima"),
      wiki("Battle of Kohima"),
      wiki("Kohima War Cemetery"),
      wiki("Hornbill Festival"),
      wiki("Nagaland"),
    ],
    lastReviewed: "2026-11-09",
  },
  {
    slug: "aizawl",
    name: "Aizawl",
    stateSlug: "mizoram",
    region: "northeast",
    tagline:
      "Mizoram's ridge-top capital, a church-centred hill city with markets, a state museum and a growing set of rural day trips.",
    categories: ["hill-stations", "cultural", "weekend", "village"],
    coordinates: { lat: 23.7271, lng: 92.7176 },
    wikipediaTitle: "Aizawl",
    popular: false,
    hiddenGem: true,
    overview: [
      "Aizawl is the capital of Mizoram and its largest city, built along a ridge at about 1,100 metres. Houses and apartment blocks stack down the slopes in steep tiers, and the city is often wrapped in cloud in the morning. About 87 per cent of Mizoram's people are Christian, mainly Presbyterian, Baptist and other Protestant denominations, and church life shapes the week.",
      "Sunday is quiet. Most shops, restaurants and public transport close or reduce services, and visitors should plan accordingly. Services are held across the city, and singing can be heard from many neighbourhoods. The main commercial area is around Bara Bazar and Zarkawt, and Solomon's Temple, a large church, is a recognisable landmark.",
      "Mizoram has a high literacy rate and a clean and orderly feel, with strong local civic organisations such as the Young Mizo Association. The state is not on the standard tourist trail, so services for visitors are modest. Aizawl suits a slow visit combining markets, the museum and day trips to hills and villages outside the city.",
    ],
    history: [
      "Mizo clans settled the hills over several centuries, living in villages under hereditary chiefs. After the Lushai Expedition of 1871 to 1872 and later conflicts, the British annexed the Lushai Hills in 1890 and set up a post at Aijal (Aizawl), which became the district headquarters. Baptist missionaries arrived in 1894, and Christianity spread rapidly, along with schooling and a written Mizo language.",
      "The Lushai Hills were part of Assam and later renamed Mizo Hills. A severe famine in 1959 and the grievances that followed led to the Mizo National Front (MNF) uprising in 1966, and Aizawl was struck by air attacks in March that year. The area became a Union Territory in 1972.",
      "The Mizo Accord was signed on 30 June 1986 between the Government of India and the MNF, and Mizoram became India's 23rd state on 20 February 1987. Since then the state has been stable, and its politics are dominated by regional parties.",
    ],
    attractions: [
      {
        name: "Mizoram State Museum",
        description:
          "A museum covering Mizo history, traditional costume, handicrafts and the independence-era period. Check opening days before visiting.",
        visitHours: 1.5,
        interests: ["history", "culture"],
        timeOfDay: "afternoon",
      },
      {
        name: "Solomon's Temple",
        description:
          "A large church in Aizawl, completed in the 2010s, whose services and architecture reflect the importance of Christianity in the state. Visit outside service times and dress modestly.",
        visitHours: 1,
        interests: ["spiritual", "photography"],
        timeOfDay: "any",
      },
      {
        name: "Bara Bazar and Zarkawt",
        description:
          "The main market area for local produce, textiles, bamboo goods and street food. Closed or quiet on Sundays.",
        visitHours: 2,
        interests: ["shopping", "food", "culture"],
        timeOfDay: "morning",
      },
      {
        name: "Durtlang Hills",
        description:
          "A ridge on the north of Aizawl with a church, a viewpoint and views of the city and valley on clear days.",
        visitHours: 1.5,
        interests: ["nature", "photography"],
        timeOfDay: "evening",
      },
      {
        name: "Reiek Heritage Village",
        description:
          "A hilltop village site about 30 km from Aizawl, with replicas of traditional Mizo houses and a trail to a viewpoint. A short climb is involved.",
        visitHours: 3,
        interests: ["culture", "nature"],
        timeOfDay: "morning",
      },
      {
        name: "Tamdil Lake",
        description:
          "A natural lake in a forested hollow, about 65 km from Aizawl, with walking paths and boats. Local lore is attached to the lake; heed local advice on behaviour.",
        visitHours: 2,
        interests: ["nature", "relaxation"],
        timeOfDay: "morning",
      },
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote:
      "October to March is dry and cool, with clearer views. Spring brings flowering trees. The monsoon (May to September) is heavy and can cause landslides on mountain roads, although the hills turn green.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1400, 2400],
      midRange: [3200, 5500],
      comfort: [6500, 11000],
      assumptions:
        "Per person per day, with two people sharing a room. Budget covers simple lodges and local meals; mid-range covers a hotel and shared taxis for excursions; comfort covers the better hotels and a private car. Excludes transport to Mizoram and permit costs. Prices rise at Christmas and during festivals.",
    },
    gettingThere: {
      air: "Lengpui Airport, about 35 km from Aizawl, has scheduled flights to Kolkata, Guwahati and other cities. Schedules change, so check before booking.",
      rail: "The Bairabi to Sairang railway line opened in September 2025, bringing a railhead at Sairang, roughly 20 km from Aizawl. Services and connections are still developing, so confirm timetables.",
      road: "Silchar in Assam is roughly 180 km away by road, a journey of 6 to 8 hours. Shared Sumos and buses run daily, and mountain roads can be affected by landslides.",
      local:
        "Taxis and shared vehicles serve the city, but steep, congested roads make it slow. Fares are set by taxi unions, and Aizawl is walkable only on short stretches.",
    },
    accommodation:
      "Aizawl has hotels and guesthouses in the main commercial areas, along with a small number of homestays and tourist lodges run by the state. Options are limited compared with larger cities, so book ahead, particularly around Christmas and festival dates.",
    cuisine: [
      {
        name: "Bai",
        note: "A stew of boiled vegetables, often with pork or fermented pork fat, eaten with rice.",
      },
      {
        name: "Vawksa rep",
        note: "Smoked pork, usually cooked with greens or bamboo shoot.",
      },
      {
        name: "Sawhchiar",
        note: "A rice porridge cooked with meat or chicken, widely eaten.",
      },
      {
        name: "Black tea",
        note: "Tea is usually drunk black, without milk, and served throughout the day.",
      },
    ],
    festivals: ["Chapchar Kut", "Mim Kut", "Pawl Kut", "Christmas"],
    festivalSlugs: ["christmas"],
    nearby: [
      {
        name: "Reiek Heritage Village",
        distanceKm: 30,
        note: "Hilltop village site with a viewpoint trail.",
      },
      {
        name: "Hmuifang",
        distanceKm: 50,
        note: "Forested hill with views, a tourist lodge and walking paths.",
      },
      {
        name: "Tamdil Lake",
        distanceKm: 65,
        note: "Forested lake with walking paths and boating.",
      },
    ],
    precautions: [
      "Plan around Sundays, when shops and transport close or reduce. Book meals and transport in advance.",
      "Mountain roads can be blocked by landslides in the monsoon. Avoid travelling at night.",
      "Mizoram has restrictions on alcohol. Check current rules and avoid carrying alcohol into the state.",
      "Carry your Inner Line Permit and photo ID. Foreign nationals need the relevant permit and must follow registration rules.",
    ],
    tips: [
      "Dress modestly, especially for visits to churches and on Sundays.",
      "Learn a few Mizo words such as 'Chibai' (hello), which is warmly received.",
      "Carry cash, since cards are not accepted everywhere and ATMs can be unreliable outside the city.",
      "Ask your host about church service times if you want to attend; visitors are normally welcome if respectful.",
      "Plan day trips with a driver familiar with the roads.",
    ],
    accessibility:
      "Aizawl is steep, with many stairs and uneven pavements, so it is difficult for wheelchair users. The state museum and some hotels have limited step-free access. Taxis are the only practical option for those with mobility needs; speak to accommodation about lifts and ramps.",
    responsibleTravel:
      "Respect church life and the Sunday observance. Ask before photographing people, particularly in villages and churches. Keep noise low at night and on Sundays, and avoid alcohol in public. Buy from local weavers and bamboo craftspeople, and take litter with you from forests and viewpoints.",
    permits:
      "Indian citizens who are not residents of Mizoram need an Inner Line Permit (ILP), available online or at entry points including Lengpui airport and Sairang railway station. The ILP must be applied for online through the state portal before entering, and the rules should be checked on that portal before travel. Foreign nationals need a Protected Area Permit applied for through the e-FRRO portal after arriving in India; the Mizoram tourism site gives 17 December 2024 as the start of this requirement. Confirm current requirements with the Mizoram government or the Ministry of Home Affairs.",
    faqs: [
      {
        question: "Do I need a permit for Aizawl?",
        answer:
          "Yes. Indian citizens from outside Mizoram need an Inner Line Permit, and foreign nationals need a Protected Area Permit. Confirm current rules on the state portal before travel.",
      },
      {
        question: "Is Aizawl open on Sundays?",
        answer:
          "Much of it is closed. Most shops, restaurants and public transport are shut or reduced, and church services take priority. Plan your day, buy supplies on Saturday, and enjoy a quiet city.",
      },
      {
        question: "How do I get to Aizawl?",
        answer:
          "Fly to Lengpui from Kolkata or Guwahati, take the train to Sairang, or travel by road from Silchar in Assam. Check schedules, as services are still developing.",
      },
      {
        question: "Can I drink alcohol in Mizoram?",
        answer:
          "Mizoram has restrictions on alcohol. Check current rules with the state government before travel, and respect local norms.",
      },
    ],
    officialLinks: [
      { label: "Mizoram Tourism", url: "https://mizoramtourism.com" },
    ],
    sources: [
      { label: "Mizoram Tourism: entry formalities, lists Bairabi-Sairang rail station as an entry point (read 9 November 2026)", url: "https://mizoramtourism.com/about/4" },
      { label: "PIB, Ministry of Railways: Bairabi-Sairang line inauguration (12 September 2025, read 9 November 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2166132&reg=3&lang=2" },
      wiki("Aizawl"),
      wiki("Mizoram"),
      wiki("Inner Line Permit"),
    ],
    lastReviewed: "2026-11-09",
  },
  {
    slug: "loktak",
    name: "Loktak Lake",
    stateSlug: "manipur",
    region: "northeast",
    tagline:
      "A large freshwater lake south of Imphal with floating phumdis and Keibul Lamjao, the last home of the sangai deer. Check security advice before considering travel.",
    categories: ["lakes", "national-parks", "wildlife", "photography"],
    coordinates: { lat: 24.5167, lng: 93.8 },
    wikipediaTitle: "Loktak Lake",
    popular: false,
    hiddenGem: true,
    overview: [
      "Loktak Lake is the largest freshwater lake in north-east India, in Bishnupur district of Manipur, roughly 40 to 50 km south of Imphal. It is known for phumdis, floating masses of vegetation, soil and organic matter, some thick enough to carry houses. The lake supports fishing communities, who live on and around it, and it is a designated Ramsar wetland.",
      "Keibul Lamjao National Park, on the south-east of the lake, is the only floating national park in the world and the last natural habitat of the sangai (Rucervus eldii eldii), Manipur's brow-antlered deer. The deer is endangered, and the park is managed for it. Visitors normally view the park from watchtowers at the edges rather than walking in the phumdi.",
      "The lake is also a working landscape. The Ithai Barrage, built in 1983 for the Loktak hydroelectric project, raised water levels and affected phumdi growth and the park's habitat. Fishing households, known as phumsang dwellers, use circular fishing nets and traps. Sendra Island, with a viewpoint and a tourist home, is a common vantage point.",
      "Manipur has been affected by violence since May 2023, and the districts around Loktak, including Bishnupur, have been among the places where people have been killed or displaced. This guide therefore treats the lake as a place to read about and plan carefully, not as a destination to recommend without checking current advice. See the precautions section for the situation as at the review date.",
    ],
    history: [
      "The Loktak basin has been inhabited for centuries by Meitei communities, and the lake is central to Manipuri cultural memory and ritual. Moirang, on its western side, was an early principality and is associated with the epic of Khamba and Thoibi, a Meitei tale of love, whose story is retold in Moirang Lai Haraoba rituals.",
      "During the Second World War, Moirang became a site of Indian National Army history. The INA hoisted its flag on Indian soil at Moirang on 14 April 1944, an event commemorated by a memorial there. The nearby Imphal and Kohima campaigns defined the region in 1944.",
      "In the 20th century the Loktak Hydroelectric Project and the Ithai Barrage altered the lake's hydrology. The lake was listed as a Ramsar site in 1990, and conservation efforts have focused on managing phumdis and protecting Keibul Lamjao. Manipur became a state in 1972.",
    ],
    attractions: [
      {
        name: "Loktak Lake and its phumdis",
        description:
          "The lake itself, best seen from a boat arranged through local operators. The floating phumdis, fishing nets and huts make up a distinctive landscape. Boat availability depends on conditions and local arrangements.",
        visitHours: 3,
        coordinates: { lat: 24.5167, lng: 93.8 },
        interests: ["nature", "photography", "relaxation"],
        timeOfDay: "morning",
      },
      {
        name: "Sendra Island viewpoint",
        description:
          "A hill on the lake edge with a tourist home and views over the water and phumdis. It is a popular place at sunrise and sunset.",
        visitHours: 1.5,
        coordinates: { lat: 24.5, lng: 93.82 },
        interests: ["photography", "nature"],
        timeOfDay: "evening",
      },
      {
        name: "Keibul Lamjao National Park",
        description:
          "A floating park and the last habitat of the endangered sangai. Access is regulated, and the deer are seen at a distance from watchtowers. Sightings are not guaranteed.",
        visitHours: 3,
        coordinates: { lat: 24.4833, lng: 93.85 },
        interests: ["wildlife", "nature"],
        timeOfDay: "morning",
      },
      {
        name: "INA Memorial, Moirang",
        description:
          "A memorial to the first hoisting of the Indian National Army flag in April 1944. A small museum is attached. Check access before going.",
        visitHours: 1,
        coordinates: { lat: 24.4989, lng: 93.7681 },
        interests: ["history"],
        timeOfDay: "any",
      },
      {
        name: "Thangjing Temple, Moirang",
        description:
          "A temple of the Meitei traditional religion dedicated to the deity Ebudhou Thangjing. Observe local rules on dress and conduct, and ask before photographing.",
        visitHours: 1,
        interests: ["spiritual", "culture"],
        timeOfDay: "morning",
      },
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote:
      "October to March is dry and cool, with clearer weather. The monsoon (May to September) brings heavy rain and water-level changes, and the park can be closed to visitors during parts of the year.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [1000, 2000],
      midRange: [2500, 4500],
      comfort: [5000, 8000],
      assumptions:
        "Per person per day, assuming a base in Imphal and a hired taxi shared by two to four people for a day trip, with lunch and a boat ride. Budget uses simple lodging and shared transport; mid-range uses a hotel and private taxi; comfort uses the better Imphal hotels. Excludes transport to Manipur and any permit costs.",
    },
    gettingThere: {
      air: "Bir Tikendrajit International Airport in Imphal is the nearest airport, with connections to Kolkata, Guwahati, Delhi and other cities. Schedules change, so check before booking.",
      rail: "There is no passenger railway to Imphal at present. The nearest railheads are in Assam, such as Dimapur and Silchar. A new line to Imphal is under construction; the state tourism commissioner has suggested it will reach Imphal in 2028.",
      road: "Imphal to Moirang and Loktak Lake is a drive of roughly an hour to 90 minutes by road. Road conditions and checkpoints vary, and curfews or strikes can affect movement.",
      local:
        "Taxis from Imphal are the usual way to reach the lake. Local boats operate from landings near Sendra and Thanga. Agree fares in advance.",
    },
    accommodation:
      "Most visitors base themselves in Imphal and make a day trip. Sendra has a tourist home run by the state, and a few homestays and lodges operate near the lake. Availability depends on conditions in the state; check directly.",
    cuisine: [
      {
        name: "Eromba",
        note: "A mashed dish of boiled vegetables and fermented fish (ngari), served with rice.",
      },
      {
        name: "Singju",
        note: "A salad of raw vegetables and herbs, usually with chilli and fermented fish.",
      },
      {
        name: "Ngari and fresh lake fish",
        note: "Fermented fish is widely used; fresh fish from the lake is cooked in light stews.",
      },
      {
        name: "Chak-hao kheer",
        note: "A sweet pudding made from black rice, associated with Manipuri feasts.",
      },
    ],
    festivals: ["Sangai Festival", "Lai Haraoba", "Yaoshang", "Ningol Chakouba"],
    nearby: [
      {
        name: "Moirang",
        distanceKm: 5,
        note: "Town with the INA Memorial and the Thangjing temple.",
      },
      {
        name: "Sendra Island",
        distanceKm: 10,
        note: "Hilltop viewpoint and tourist home on the lake edge.",
      },
      {
        name: "Imphal",
        distanceKm: 45,
        note: "State capital with markets, the Kangla Fort, war cemeteries and the airport.",
      },
    ],
    precautions: [
      "Manipur has seen serious ethnic violence between Meitei and Kuki-Zo communities since May 2023, with large numbers of deaths and displaced people. Reports from 2026 describe further killings, strikes and curfews in parts of the state. The state tourism commissioner, speaking at a tourism mart on 30 October 2026, was reported as saying that unrest deters casual tourists and restricts travel between districts. Treat conditions as uncertain and changeable.",
      "Check your own government's travel advice for Manipur, and for Indian visitors the latest Ministry of Home Affairs and Manipur government orders, before booking. Some foreign governments have advised against non-essential travel to Manipur, and travel insurance may not cover areas under advisory. We were not able to confirm a single current official advisory.",
      "Curfews, internet shutdowns, road blockades and shutdown strikes can start at short notice. Keep flexible plans, tell someone your itinerary, and follow local police and administration instructions.",
      "Avoid travelling between districts at night, and avoid crowds, protests and sensitive sites. Do not photograph security forces or checkpoints.",
    ],
    tips: [
      "Use a local driver and a hotel in Imphal that can give current ground information.",
      "Carry photo ID and your permit at all times.",
      "Book refundable accommodation and transport.",
      "Visit the lake in the morning, when the weather is clearer and wildlife viewing is better.",
      "Confirm with the park authorities whether Keibul Lamjao is open before travelling.",
    ],
    accessibility:
      "The lake edges and Sendra viewpoint involve steps, uneven ground and boat transfers, so access is limited for wheelchair users. Watchtowers at Keibul Lamjao involve stairs. Speak to local operators and plan private transport.",
    responsibleTravel:
      "Fishing communities live and work on the lake, and boats are not a photo opportunity. Ask before photographing people, and keep a distance from the sangai and the park's fragile phumdis. Do not litter, and follow park rules. In a region recovering from conflict, avoid commenting on political and ethnic questions in public and treat displaced communities with discretion.",
    permits:
      "Indian citizens who are not residents of Manipur need an Inner Line Permit (ILP). The ILP system was extended to Manipur in December 2019; a temporary permit for short stays and a regular permit for longer stays are available online and at entry points. Foreign nationals are reported to need a Protected Area Permit again since the Ministry of Home Affairs reimposed the requirement in December 2024, and the Manipur tourism site says foreigners register at the CID office in Imphal. The state tourism commissioner has proposed easing this for foreign tourists of Indian origin, but this was a proposal only as at 30 October 2026. Confirm current requirements with the Manipur government or the Ministry of Home Affairs.",
    faqs: [
      {
        question: "Is it safe to visit Loktak Lake now?",
        answer:
          "That depends on conditions that change quickly. Manipur has had serious violence since 2023 and further unrest in 2026, and official statements on current conditions differ. Check current official advice before booking, and be prepared to cancel.",
      },
      {
        question: "Do I need a permit?",
        answer:
          "Yes. Indian citizens from outside Manipur need an Inner Line Permit, and foreign nationals need a Protected Area Permit. See the permits section.",
      },
      {
        question: "Can I see the sangai deer?",
        answer:
          "The sangai lives in Keibul Lamjao National Park, and sightings from watchtowers are possible but not guaranteed. Binoculars help. Access is regulated, so check opening status.",
      },
      {
        question: "What is a phumdi?",
        answer:
          "A phumdi is a floating mass of vegetation, soil and organic matter. At Loktak, some are thick enough to carry houses and the national park's habitat.",
      },
    ],
    officialLinks: [
      { label: "Manipur Tourism", url: "https://manipurtourism.gov.in" },
    ],
    sources: [
      { label: "Manipur Tourism: foreign tourist formalities (read 9 November 2026)", url: "https://manipurtourism.gov.in/foreign-tourist/" },
      wiki("Loktak Lake"),
      wiki("Keibul Lamjao National Park"),
      wiki("Manipur conflict (2023–present)"),
      {
        label: "Manipur tourism commissioner on PAP norms (PTI via The Week, 30 October 2026; not re-read on 9 November)",
        url: "https://www.theweek.in/wire-updates/business/2026/10/30/manipur-tourism-commissioner-pitches-for-relaxing-pap-norms-for-indian-origin-foreign-tourists.html",
      },
    ],
    lastReviewed: "2026-11-09",
  },
  {
    slug: "unakoti",
    name: "Unakoti",
    stateSlug: "tripura",
    region: "northeast",
    tagline:
      "An archaeological site of large rock-cut Shiva and Ganesha reliefs in a forested gorge in north Tripura.",
    categories: ["temples-heritage", "monuments", "religious", "hidden-gems"],
    coordinates: { lat: 24.3167, lng: 92.0167 },
    wikipediaTitle: "Unakoti",
    popular: false,
    hiddenGem: true,
    overview: [
      "Unakoti is an archaeological site in the Kailashahar area of Unakoti district, in the north of Tripura, close to the Bangladesh border. It consists of rock-cut sculptures and stone images carved into the walls of a forested hill, along with a perennial stream and pool. The word Unakoti means one less than a crore, or ten million, referring to a local legend about the number of images.",
      "The best-known carving is a large Shiva head, called Unakotiswara Kal Bhairava, which stands several metres high and is flanked by two smaller female figures. The site also has reliefs of Ganesha, Durga and other deities, along with free-standing stone images. Scholars have debated the dating, with estimates ranging from the 7th to the 9th centuries, and the site's origins are not well documented.",
      "Unakoti is quiet for most of the year. The visit combines a short walk through forest, steps down to the main panels, and time at the pool and carved walls. A large fair, the Ashokashtami Mela, is held in April and draws pilgrims. India has proposed Unakoti for UNESCO World Heritage listing, and it is under the Archaeological Survey of India's protection.",
    ],
    history: [
      "The carvings are generally dated to the early medieval period, roughly the 7th to 9th centuries, though some scholars suggest different ages, and no firm inscription fixes the date. The site appears to have been a Shaiva pilgrimage place, and the images show influences from Buddhist and Hindu art of eastern India.",
      "According to a local legend, Shiva stopped at the site with a crore minus one gods and goddesses on the way to Varanasi, and left them behind when they overslept. Another story attributes the carvings to a sculptor named Kallu Kumhar. The legends show how the site is understood locally; they are not historical evidence.",
      "The site was brought to wider attention by archaeological surveys in the 20th century. Tripura, ruled for centuries by the Manikya dynasty, merged with India in October 1949 and became a state in January 1972. Today Unakoti is protected by the Archaeological Survey of India, and works at the site include pathways and conservation.",
    ],
    attractions: [
      {
        name: "Unakotiswara Kal Bhairava",
        description:
          "The central rock-cut Shiva head with a tall headdress, flanked by two smaller figures. It is the focus of the site and of the annual fair.",
        visitHours: 1,
        coordinates: { lat: 24.3167, lng: 92.0167 },
        interests: ["history", "spiritual", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Ganesha and other relief panels",
        description:
          "Carved images of Ganesha, Durga and other deities on the cliff, some worn by weather. Look from the viewing paths and do not touch the carvings.",
        visitHours: 1,
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Rock-cut waterfall and pool",
        description:
          "A perennial stream falls into a pool beside the carvings, adding to the setting. Pilgrims bathe or collect water; observe rules and check whether bathing is allowed.",
        visitHours: 1,
        interests: ["nature", "spiritual"],
        timeOfDay: "any",
      },
      {
        name: "Forest path and steps",
        description:
          "The approach from the entrance involves a descent on steps through forest. Wear shoes with grip, especially after rain.",
        visitHours: 1,
        interests: ["nature", "photography"],
        timeOfDay: "morning",
      },
      {
        name: "Ashokashtami Mela",
        description:
          "An annual fair held in April, when many pilgrims visit the site. The site becomes crowded, so book accommodation early if attending.",
        visitHours: 3,
        interests: ["spiritual", "culture"],
        timeOfDay: "any",
      },
    ],
    bestMonths: [11, 12, 1, 2, 3, 4],
    bestTimeNote:
      "November to March is dry and cool and suitable for the steps and forest path. April brings the Ashokashtami Mela, with large crowds. The monsoon (June to September) makes the steps slippery and roads difficult.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [1000, 1800],
      midRange: [2500, 4000],
      comfort: [5000, 8000],
      assumptions:
        "Per person per day, with two people sharing a room in Kailashahar or Dharmanagar. Budget uses simple lodges and local transport; mid-range uses a better hotel and a hired car shared by two to four; comfort assumes a private vehicle and the best available rooms. Excludes travel to Tripura and any entry fees.",
    },
    gettingThere: {
      air: "Maharaja Bir Bikram Airport in Agartala is the main airport, about 180 km away. Check whether Kailashahar's airport has scheduled services before relying on it.",
      rail: "Kumarghat is the usual railhead for the area, with services to Agartala and Guwahati. Dharmanagar is another station in North Tripura.",
      road: "Agartala to Unakoti is roughly 180 km and takes about 4 to 5 hours by road via Kumarghat and Kailashahar. Buses and shared vehicles run to Kailashahar; the last stretch to the site needs a taxi or auto.",
      local:
        "Taxis and autorickshaws are available in Kailashahar. Arrange a return ride in advance, since the site is outside town.",
    },
    accommodation:
      "Kailashahar and Dharmanagar have simple hotels and lodges, and there are tourist lodges near the site. Facilities are basic. Book ahead for April, when the fair brings crowds.",
    cuisine: [
      {
        name: "Mui borok",
        note: "A traditional Tripuri dish with fermented fish (berma), eaten with rice, found in local households.",
      },
      {
        name: "Bamboo shoot dishes",
        note: "Bamboo shoot is used in curries and pickles, a common ingredient across the state.",
      },
      {
        name: "Gudok",
        note: "A Tripuri dish of vegetables cooked with fermented fish (berma); ask about ingredients if you have dietary needs.",
      },
      {
        name: "Fish curry and rice",
        note: "Bengali-influenced fish curries are widely available in Tripura.",
      },
    ],
    festivals: ["Ashokashtami Mela", "Kharchi Puja", "Garia Puja", "Durga Puja"],
    festivalSlugs: ["durga-puja"],
    nearby: [
      {
        name: "Kailashahar",
        distanceKm: 8,
        note: "District town with markets, lodges and the nearest services.",
      },
      {
        name: "Kumarghat",
        distanceKm: 30,
        note: "The usual railhead for Unakoti.",
      },
      {
        name: "Dharmanagar",
        distanceKm: 40,
        note: "Larger town in North Tripura with a station and hotels.",
      },
      {
        name: "Agartala",
        distanceKm: 180,
        note: "Tripura's capital, with Ujjayanta Palace, airport and main services.",
      },
    ],
    precautions: [
      "The steps and forest path can be slippery, particularly after rain. Wear footwear with grip and be careful on wet stone.",
      "Bring water and sun protection, since there is little shade on parts of the approach.",
      "The site lies near the border with Bangladesh. Carry photo ID and follow instructions at any checkpoints.",
      "Monkeys are present in the area. Do not feed them, and secure food and bags.",
    ],
    tips: [
      "Go in the morning for softer light on the carvings and fewer visitors.",
      "Stay in Kailashahar rather than travelling the same day from Agartala.",
      "Do not touch or climb on the carvings. They are weathered and fragile.",
      "Carry cash, since cards are not widely accepted outside Agartala.",
      "Confirm the date of Ashokashtami Mela with local sources, since it follows the lunar calendar.",
    ],
    accessibility:
      "Unakoti involves a descent on steps and uneven forest paths, so it is challenging for wheelchair users and people with limited mobility. Some stretches have railings, but others do not. Speak to the site staff for current conditions.",
    responsibleTravel:
      "Unakoti is an active place of worship for some visitors as well as a heritage site. Remove shoes where asked, dress modestly, and keep noise low. Do not touch the carvings, and avoid leaving rubbish in the gorge. Employ local guides, who can add context beyond the legends.",
    faqs: [
      {
        question: "Do I need a permit for Unakoti or Tripura?",
        answer:
          "Indian visitors do not need a special permit to visit Tripura. Foreign nationals follow the usual visa rules and should check whether border-area restrictions apply. Carry photo ID.",
      },
      {
        question: "How old are the carvings?",
        answer:
          "They are generally dated to the 7th to 9th centuries, but the dating is debated and there is no clear inscription. The legends about their origin are not historical evidence.",
      },
      {
        question: "When is the Ashokashtami Mela?",
        answer:
          "It is held in April, on a date set by the Hindu lunar calendar. Dates vary each year, so check with local sources before planning.",
      },
      {
        question: "Can I visit as a day trip from Agartala?",
        answer:
          "It is possible but long, at roughly 180 km each way. Staying overnight in Kailashahar gives a more comfortable visit.",
      },
    ],
    officialLinks: [
      { label: "Tripura Tourism", url: "https://tripuratourism.gov.in" },
    ],
    sources: [
      wiki("Unakoti"),
      wiki("Tripura"),
      wiki("Kailashahar"),
    ],
    lastReviewed: "2026-11-09",
  },
];
