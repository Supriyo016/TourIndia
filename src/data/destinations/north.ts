import type { Destination } from "@/types/content";

export const northDestinations: Destination[] = [
  {
    slug: "agra",
    name: "Agra",
    stateSlug: "uttar-pradesh",
    region: "north",
    tagline: "The city of the Taj Mahal, Agra Fort and Akbar's abandoned capital at Fatehpur Sikri.",
    categories: ["monuments", "forts-palaces", "cultural", "photography"],
    coordinates: { lat: 27.1767, lng: 78.0081 },
    wikipediaTitle: "Agra",
    popular: true,
    hiddenGem: false,
    overview: [
      "Agra sits on the west bank of the Yamuna in western Uttar Pradesh, about 230 km by road from Delhi. It is a working city of several million people, with leather and footwear workshops, marble inlay studios and a dense old quarter around Kinari Bazaar. Most visitors come for the Mughal monuments, which are concentrated along the river and within a short drive of the centre.",
      "Three of those monuments are UNESCO World Heritage Sites: the Taj Mahal, Agra Fort and the abandoned city of Fatehpur Sikri, about 40 km to the west. Alongside them are lesser-known buildings that reward a slower visit, including the tomb of Itimad-ud-Daulah, Akbar's tomb at Sikandra and the riverside Mehtab Bagh garden, which looks across the Yamuna to the Taj.",
      "The city is hot and dry for much of the year and can be hazy in winter, when smog and fog sometimes reduce the view at dawn. Touts around the main gates and at stations are persistent, and prices quoted informally often bear little relation to official rates. Booking entry tickets through official channels and agreeing a fare before any ride makes the day easier.",
      "Many travellers treat Agra as a day trip from Delhi, which is possible but leaves little time. An overnight stay lets you see the Taj at opening time, when the complex is quieter, and fit in Agra Fort and one other site without a rush. The Taj Mahal is closed to general visitors on Fridays, so plan the calendar around that."
    ],
    history: [
      "Agra rose to prominence under the Lodi sultans, one of whom moved his base here in the early sixteenth century. After Babur's victory at Panipat in 1526 the city passed to the Mughals, and under Akbar, from the 1550s, it became the imperial capital. Akbar rebuilt the fort in red sandstone and, from about 1571, began Fatehpur Sikri, which was occupied for only a few years before the court returned to Agra and later Lahore.",
      "Shah Jahan, Akbar's grandson, made the most lasting additions. After the death of his wife Mumtaz Mahal in 1631 he commissioned the Taj Mahal as her tomb, a project that occupied thousands of workers and craftsmen for roughly two decades on the Yamuna's bank. He later spent his last years confined in Agra Fort, from where tradition says he could see the tomb.",
      "The capital moved to Shahjahanabad (Old Delhi) in 1648, and Agra declined, later falling to the Marathas, Jats and then the British East India Company in 1803. Conservation of the monuments began in earnest under the British Viceroy Lord Curzon around 1900. Today the Archaeological Survey of India (ASI) manages the major sites, and restrictions on industry and traffic around the Taj aim to reduce pollution damage to the marble."
    ],
    attractions: [
      {
        name: "Taj Mahal",
        description: "The white marble mausoleum of Mumtaz Mahal and Shah Jahan, set within a walled charbagh garden. Entry is by timed ticket and security screening is strict; large bags, tripods and food are not allowed. The complex is closed on Fridays, apart from worshippers using the mosque. Confirm ticket types, timings and any special closures on the ASI site before travelling.",
        visitHours: 3,
        coordinates: { lat: 27.1751, lng: 78.0421 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Agra Fort",
        description: "A red sandstone fortress and palace complex begun under Akbar and extended by Shah Jahan. The Diwan-i-Khas, Musamman Burj and Sheesh Mahal are the main interiors, and some viewpoints look towards the Taj. There are ramps, steps and uneven stone floors throughout.",
        visitHours: 2.5,
        coordinates: { lat: 27.1795, lng: 78.0211 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Mehtab Bagh",
        description: "A Mughal-era garden on the opposite bank of the Yamuna, laid out in line with the Taj. It gives a quieter view of the mausoleum across the river, particularly in late afternoon. River levels and haze affect the view, and the lawns can be closed or flooded after heavy rain.",
        visitHours: 1,
        coordinates: { lat: 27.1789, lng: 78.0447 },
        interests: ["photography", "relaxation"],
        timeOfDay: "evening"
      },
      {
        name: "Itimad-ud-Daulah's Tomb",
        description: "A small marble tomb built in the 1620s by Nur Jahan for her father. Its inlaid stone panels and latticed screens are often described as a forerunner of the Taj's decoration. It is far less crowded than the Taj and easy to combine with a riverside stop.",
        visitHours: 1,
        coordinates: { lat: 27.193, lng: 78.031 },
        interests: ["history", "photography"],
        timeOfDay: "any"
      },
      {
        name: "Fatehpur Sikri",
        description: "Akbar's planned city of red sandstone palaces, courtyards and the Jama Masjid, with the white marble tomb of Sufi saint Salim Chishti. The site is on a ridge with long walks between buildings, and the dargah and mosque require covered shoulders and knees and removal of shoes. Unofficial guides approach visitors at the car park; use an ASI-approved guide if you want one.",
        visitHours: 3,
        coordinates: { lat: 27.0945, lng: 77.6679 },
        interests: ["history", "spiritual", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Akbar's Tomb, Sikandra",
        description: "The mausoleum of the third Mughal emperor, set in a large garden with gateways of red sandstone and marble. It is on the route to Mathura and often has deer and langurs in the grounds. Few international visitors stop here, so it works as a calmer counterpoint to the Taj.",
        visitHours: 1.5,
        coordinates: { lat: 27.2205, lng: 77.9503 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is cooler and more comfortable for walking between monuments. December and January bring morning fog and haze that can hide the Taj at dawn, so allow flexibility. April to June is very hot and dry, with daytime temperatures commonly above 40 C, and the monsoon arrives from late June.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [1500, 2500],
      midRange: [3500, 6500],
      comfort: [9000, 20000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals, local transport and typical monument tickets for Indian residents at the budget tier. Foreign visitors face substantially higher monument fees, which are not included. Excludes intercity transport and guides; confirm current ticket prices with ASI."
    },
    gettingThere: {
      air: "Agra has a small civil enclave at Kheria airport, with limited services that change from season to season, so check before booking. Most visitors fly into Delhi (about 230 km) and continue by road or rail.",
      rail: "Agra Cantt is the main station, with fast daytime trains from New Delhi that take roughly two hours. Agra Fort and Raja ki Mandi stations are also used. Book reserved seats in advance on the IRCTC portal.",
      road: "The Yamuna Expressway links Greater Noida and Agra, and the route from Delhi typically takes three to four hours depending on traffic. Buses and taxis run from Delhi, Jaipur and Mathura.",
      local: "Auto-rickshaws, app-based cabs and e-rickshaws are the usual options. Vehicles powered by petrol or diesel are restricted near the Taj Mahal, so you walk or take an electric vehicle for the last stretch. Agree fares before setting off, or use a pre-paid booth where one exists."
    },
    accommodation: "Hotels cluster around Taj Ganj near the Taj's eastern gate for budget and guesthouse stays, and along Fatehabad Road and Mall Road for mid-range and upscale hotels. Rooftop views of the Taj are common selling points in Taj Ganj but are often partial or distant, so check recent photographs. Book ahead for October to March.",
    cuisine: [
      { name: "Petha", note: "A translucent sweet made from ash gourd, sold plain or flavoured with saffron, paan or coconut. Agra is closely associated with it." },
      { name: "Bedai and jalebi", note: "A fried, spiced bread with potato curry, traditionally eaten for breakfast and often followed by hot jalebi." },
      { name: "Mughlai curries and kebabs", note: "Meat dishes in the north Indian Mughlai style, found in the old town and around Sadar Bazaar." },
      { name: "Dalmoth", note: "A crisp, spiced lentil snack made in Agra and often bought as a gift." },
      { name: "Chaat", note: "Tikki, gol gappa and other street snacks, best taken from busy stalls with high turnover." }
    ],
    festivals: ["Taj Mahotsav (usually February)", "Holi", "Diwali", "Eid"],
    festivalSlugs: ["holi", "diwali", "eid-al-fitr"],
    nearby: [
      { name: "Mathura and Vrindavan", distanceKm: 55, note: "Pilgrimage towns linked to Krishna, with crowded temples and large Holi celebrations." },
      { name: "Keoladeo National Park, Bharatpur", distanceKm: 55, note: "A wetland bird reserve in Rajasthan, most productive in winter when migratory birds are present." },
      { name: "Gwalior", distanceKm: 120, note: "A hill fort and palaces in Madhya Pradesh, reachable by train or road." },
      { name: "Jaipur", distanceKm: 240, note: "Rajasthan's capital, commonly combined with Agra on the Golden Triangle route.", destinationSlug: "jaipur" },
      { name: "Delhi", distanceKm: 230, note: "The starting or ending point for most Agra visits.", destinationSlug: "delhi" }
    ],
    precautions: [
      "Unofficial guides, drivers and shop owners may claim that a monument is closed or a shop is government-approved to redirect you; check with the ticket counter or official site.",
      "Security rules at the Taj Mahal are strict and enforced: leave large bags, food, drones and tripods at the hotel, and expect queues at the screening point.",
      "Summer heat is intense, and marble and sandstone surfaces become very hot underfoot. Carry water, a hat and sun protection.",
      "Be wary of stray dogs and monkeys at Fatehpur Sikri and around Agra Fort; do not carry loose food or feed them.",
      "Air quality is poor in winter months, so those with asthma or heart conditions should check the forecast and bring any usual medication."
    ],
    tips: [
      "Arrive at the Taj ticket line before the gates open and book tickets online where the ASI offers that option.",
      "Visit Agra Fort in the late morning and keep Mehtab Bagh or Itimad-ud-Daulah for the late afternoon.",
      "If you want the Taj at sunrise, stay near the east or south gate to avoid early-morning traffic delays.",
      "Look at the Taj's monthly night-viewing arrangements on the ASI site; these are limited and need advance booking.",
      "Marble inlay is a local craft, but ask to see the workshop floor and compare prices before buying."
    ],
    accessibility: "Parts of the Taj Mahal complex have ramps and wheelchairs may be available at entrance points, but there are steps to the main platform and uneven paving, so step-free access to the mausoleum interior is not confirmed. Agra Fort has ramps, steep inclines and many steps. Fatehpur Sikri involves long walks on stone surfaces and shallow steps. Contact ASI or your hotel before arriving if you have specific mobility needs.",
    responsibleTravel: "Pollution and groundwater pressure are real concerns around the Taj. Use electric transport for the last stretch, avoid single-use plastic, and do not touch or lean on the marble, which is delicate. Pay fair prices to craftspeople and avoid buying items made from protected animal products. Behave respectfully at the mosque and dargah, where people come to pray, and ask before photographing individuals.",
    faqs: [
      {
        question: "Is the Taj Mahal open every day?",
        answer: "No. It is closed to general visitors on Fridays, and it can also close at short notice for security reasons or very bad weather. Check the Archaeological Survey of India's official page for current timings before you travel."
      },
      {
        question: "Can I see Agra in one day from Delhi?",
        answer: "Yes, by taking an early fast train or the expressway and seeing the Taj Mahal and Agra Fort. It is a long day with limited time for Fatehpur Sikri or other sites, so one night in Agra is more comfortable."
      },
      {
        question: "Is Fatehpur Sikri worth the extra time?",
        answer: "It suits travellers interested in Mughal architecture and urban planning. Allow half a day, including travel, and dress modestly for the mosque and dargah."
      },
      {
        question: "How early should I book Agra hotels?",
        answer: "For the October to March season, particularly Christmas and New Year, book several weeks ahead. Prices and availability vary widely, so compare options on more than one platform."
      }
    ],
    officialLinks: [
      { label: "Archaeological Survey of India", url: "https://asi.nic.in/" },
      { label: "Taj Mahal official site (visiting hours and ticketing)", url: "https://www.tajmahal.gov.in/" },
    ],
    sources: [
      { label: "Taj Mahal official site: visiting hours, closed Fridays (read 9 November 2026)", url: "https://www.tajmahal.gov.in/visiting-hours.aspx" },
      { label: "Agra on Wikipedia", url: "https://en.wikipedia.org/wiki/Agra" },
      { label: "Taj Mahal on Wikipedia", url: "https://en.wikipedia.org/wiki/Taj_Mahal" },
      { label: "Taj Mahal, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/252" },
      { label: "Fatehpur Sikri, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/255" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    stateSlug: "uttar-pradesh",
    region: "north",
    tagline: "One of the oldest continuously inhabited cities in India, built along the Ganga's western ghats.",
    categories: ["religious", "cultural", "temples-heritage", "photography"],
    coordinates: { lat: 25.3176, lng: 82.9739 },
    wikipediaTitle: "Varanasi",
    popular: true,
    hiddenGem: false,
    overview: [
      "Varanasi, also called Kashi or Banaras, stands on the western bank of the Ganga in eastern Uttar Pradesh. For Hindus it is among the holiest cities, and the river frontage is lined with roughly 80 stepped ghats where people bathe, pray, perform rites for the dead and meet. The city is also a long-standing centre for music, silk weaving and Sanskrit scholarship.",
      "Most visitors spend their time in two areas: the riverfront from Assi Ghat in the south to Raj Ghat in the north, and the dense lanes of the old city behind it. Streets here are narrow, cows and motorbikes share them with pedestrians, and navigation is easier on foot with a phone map than with a vehicle. The Kashi Vishwanath Temple, rebuilt as a wider corridor leading to the river, opened in its present form in December 2021.",
      "The experience can be intense. Funeral pyres burn day and night at Manikarnika and Harishchandra ghats, and many visitors find this affecting. It is a place of daily religious life, not a stage, so how you behave matters. Photography of cremations is not acceptable, and in practice is actively discouraged.",
      "Sarnath, where the Buddha is traditionally held to have given his first teaching, is about 10 km north and makes a calmer half-day trip. Dawn boat rides on the Ganga are the usual way to see the ghats, but the river runs high and fast in the monsoon and boats may be restricted."
    ],
    history: [
      "Archaeological finds suggest settlement in the Varanasi area from the first half of the first millennium BCE, and the city appears in Buddhist and Hindu literature as the capital of the kingdom of Kashi. Sarnath, nearby, became a major Buddhist centre, and Ashoka erected a pillar there in the third century BCE. The Chinese pilgrim Xuanzang described Varanasi in the seventh century CE as a city with many temples.",
      "Temples in the city suffered repeated destruction in the medieval period and were rebuilt more than once. The Kashi Vishwanath Temple, in particular, has a long and contested history of demolition and reconstruction, and the Gyanvapi Mosque beside it remains the subject of legal dispute. The present temple was built in the late eighteenth century by Ahilyabai Holkar of Indore.",
      "Under the nineteenth-century Maharajas of Banaras, many of the ghats and palaces along the river took their present form. Banaras Hindu University was founded in 1916, and the city remains a major seat of learning and performing arts, associated with musicians such as the shehnai player Bismillah Khan."
    ],
    attractions: [
      {
        name: "Dashashwamedh Ghat and Ganga Aarti",
        description: "The main ghat for the evening fire ritual, performed daily by priests on raised platforms. It is crowded and loud, and the best viewing positions fill early; many people watch from a boat. Keep valuables secure and be aware that some boat operators set high rates on busy evenings.",
        visitHours: 2,
        coordinates: { lat: 25.3066, lng: 83.0107 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Dawn boat ride along the ghats",
        description: "A rowing boat from Assi towards Manikarnika at sunrise shows the ghats, temples and palaces from the water. Agree the route, duration and price before boarding. Boats may be suspended when the river is in flood.",
        visitHours: 2,
        coordinates: { lat: 25.2884, lng: 83.0063 },
        interests: ["spiritual", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Kashi Vishwanath Temple and Corridor",
        description: "The most important Shiva temple in the city, approached through a wide pedestrian corridor from the river. Security checks are thorough, mobile phones and cameras may not be allowed inside, and queues are long on Mondays and festival days. Non-Hindus may have restrictions on entering the sanctum; check the temple's current rules.",
        visitHours: 2,
        coordinates: { lat: 25.3109, lng: 83.0107 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Sarnath",
        description: "The site of the Buddha's first teaching, with the Dhamek Stupa, the ruins of monasteries and an archaeological museum that holds the Ashokan lion capital, India's national emblem. It is quieter than the old city and has paved paths and level ground in most areas.",
        visitHours: 3,
        coordinates: { lat: 25.3809, lng: 83.0243 },
        interests: ["history", "spiritual"],
        timeOfDay: "morning"
      },
      {
        name: "Ramnagar Fort",
        description: "The eighteenth-century fort of the Maharajas of Banaras, on the river's east bank. It holds a museum of vintage cars, weapons and royal belongings. It can be reached by road across the pontoon bridge in dry months or by boat.",
        visitHours: 2,
        coordinates: { lat: 25.269, lng: 83.033 },
        interests: ["history"],
        timeOfDay: "afternoon"
      },
      {
        name: "Bharat Kala Bhavan, Banaras Hindu University",
        description: "A university museum with miniature paintings, sculpture and regional textiles. The BHU campus is large and green, and is often combined with a visit to the New Vishwanath Temple on campus.",
        visitHours: 2,
        coordinates: { lat: 25.2677, lng: 82.9913 },
        interests: ["culture", "history"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is comfortable for walking the ghats. November often brings Dev Deepawali, when the ghats are lit with lamps on the full moon after Diwali, but crowds are very large. Summer is extremely hot, and during the monsoon from July to September the river floods the lower ghats.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1200, 2200],
      midRange: [3000, 6000],
      comfort: [8000, 18000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals, shared local transport and one boat ride. Excludes rail or air fares to Varanasi, donations at temples and shopping."
    },
    gettingThere: {
      air: "Lal Bahadur Shastri International Airport, about 25 km from the centre, has domestic flights and some international services. Taxis and app cabs run to the city.",
      rail: "Varanasi Junction is the main station, with other stations at Manduadih (Banaras) and Kashi. Trains connect to Delhi, Kolkata, Mumbai and many regional towns; book ahead for overnight services.",
      road: "National highways link Varanasi to Lucknow, Prayagraj, Patna and Gaya. Buses are inexpensive but slow on congested sections.",
      local: "Auto-rickshaws and e-rickshaws operate in the outer city, but the old lanes are walking-only. Use a rowing boat for the ghats and agree prices in advance."
    },
    accommodation: "Guesthouses and heritage hotels line the ghats, especially around Assi, Dashashwamedh and Manikarnika, and offer river views but often have steep steps and narrow approaches. Larger hotels are in the Cantonment and Sigra areas, with easier road access. Book ahead for Dev Deepawali and other major festivals.",
    cuisine: [
      { name: "Kachori sabzi", note: "A fried stuffed bread served with potato curry and often eaten as breakfast." },
      { name: "Banarasi paan", note: "Betel leaf with a variety of fillings; the city has a long tradition of paan making." },
      { name: "Malaiyo", note: "A winter milk froth dessert flavoured with saffron and cardamom, sold from street stalls." },
      { name: "Tamatar chaat", note: "A spiced tomato chaat that is a local speciality." },
      { name: "Thandai", note: "A chilled milk drink with nuts and spices. Some versions in the city include bhang, so ask before you drink." }
    ],
    festivals: ["Dev Deepawali", "Maha Shivaratri", "Ganga Mahotsav", "Holi", "Makar Sankranti"],
    festivalSlugs: ["diwali", "holi", "makar-sankranti"],
    nearby: [
      { name: "Sarnath", distanceKm: 10, note: "The Buddhist site where the Buddha gave his first teaching, inscribed on the UNESCO World Heritage List in July 2026." },
      { name: "Prayagraj", distanceKm: 120, note: "The confluence of the Ganga and Yamuna, and a venue for the Kumbh Mela." },
      { name: "Bodh Gaya", distanceKm: 250, note: "The place of the Buddha's enlightenment, in Bihar.", destinationSlug: "bodh-gaya" },
      { name: "Jaunpur", distanceKm: 60, note: "A town with Sharqi-era mosques and a medieval fort." },
      { name: "Khajuraho", distanceKm: 400, note: "A World Heritage group of temples in Madhya Pradesh, reached by a long road or rail journey.", destinationSlug: "khajuraho" }
    ],
    precautions: [
      "Do not photograph cremations or mourners at the burning ghats. Guides who offer to take you to a viewing platform may ask for donations for firewood; treat such requests with caution.",
      "The Ganga is a sacred river and is heavily polluted in places. Do not drink the water or enter it casually, and avoid swimming.",
      "Pickpocketing and overcharging are common at crowded ghats and at the station; keep valuables in a front pocket or secure bag.",
      "Lanes can be slippery, and cattle, scooters and handcarts share the space. Wear sturdy sandals or shoes and watch your footing.",
      "Alcohol, meat and eggs are not widely available in the central temple area; check local rules if you have specific dietary needs."
    ],
    tips: [
      "Spend at least one sunrise on the river, and stay for a full day on foot between Assi and Manikarnika.",
      "Dress modestly with covered shoulders and knees, especially in temples, and carry a scarf.",
      "Book a licensed guide through your hotel or tourism office if you want explanations of ritual.",
      "Carry small change for offerings, boats and shoe storage.",
      "For music, ask guesthouses about concerts at Sankat Mochan or at ghats during festivals, as schedules change."
    ],
    accessibility: "Access is difficult. Most ghats have long flights of uneven steps with no handrails, lanes are narrow and cobbled, and the old city is largely not wheelchair accessible. Boats require stepping down from the ghat. Sarnath and BHU campus are flatter, and the temple corridor has a wider pedestrian approach, but step-free access to every part is not confirmed.",
    responsibleTravel: "Varanasi is a living religious centre, not an attraction park. Keep to the dress and etiquette rules, ask permission before taking close-up photographs of people, and do not intrude on funeral rites. Do not leave plastic or offerings in the river, and choose rowing boats over motorised ones where possible. Pay fair rates to boatmen and weavers.",
    faqs: [
      {
        question: "Is it respectful for foreign visitors to watch the cremations?",
        answer: "Watching quietly from a distance is generally tolerated, but taking photographs or video is not. Some people approach visitors with explanations or donation requests; you are not obliged to pay anything to stand and observe."
      },
      {
        question: "How many days do I need in Varanasi?",
        answer: "Two full days cover a sunrise boat ride, the evening aarti, the old lanes and Sarnath. Add a third day for the temple, the university museum or music."
      },
      {
        question: "Is it safe to eat street food?",
        answer: "Many travellers eat street food without trouble, but choose busy stalls, food that is cooked fresh and hot, and avoid water or ice of uncertain origin. If you have a sensitive stomach, favour established restaurants."
      },
      {
        question: "Can non-Hindus visit the main temples?",
        answer: "Rules vary by temple and change over time. Visitors can usually enter many temples and the corridor, but access to certain sanctums may be limited. Check on the day with the temple authorities."
      }
    ],
    officialLinks: [
      { label: "Uttar Pradesh Tourism", url: "https://uptourism.gov.in" },
    ],
    sources: [
      { label: "PIB, Ministry of Culture: Ancient Buddhist Site of Sarnath inscribed (25 July 2026, read 9 November 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2289399" },
      { label: "Varanasi on Wikipedia", url: "https://en.wikipedia.org/wiki/Varanasi" },
      { label: "Sarnath on Wikipedia", url: "https://en.wikipedia.org/wiki/Sarnath" },
      { label: "Kashi Vishwanath Temple on Wikipedia", url: "https://en.wikipedia.org/wiki/Kashi_Vishwanath_Temple" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "delhi",
    name: "Delhi",
    stateSlug: "delhi",
    region: "north",
    tagline: "India's capital, where seven centuries of Sultanate, Mughal and colonial architecture sit alongside a busy modern city.",
    categories: ["monuments", "cultural", "forts-palaces", "temples-heritage"],
    coordinates: { lat: 28.6139, lng: 77.209 },
    wikipediaTitle: "Delhi",
    popular: true,
    hiddenGem: false,
    overview: [
      "Delhi is both a city and a union territory on the Yamuna, and one of the largest urban areas in the world. It is usually divided in visitors' minds into Old Delhi, the walled Mughal city around Chandni Chowk and Jama Masjid, and New Delhi, the planned imperial capital of wide avenues, government buildings and parks. Beyond them lie the medieval ruins of Mehrauli, the villages that became neighbourhoods and the newer suburbs.",
      "Three sites are UNESCO World Heritage: the Red Fort, Humayun's Tomb and the Qutb complex. Together with Jama Masjid, Safdarjung's Tomb, Lodhi Garden and the National Museum, they give a reasonable overview of the city's past. Spread across a very large area, they are best visited in clusters instead of a single frantic day.",
      "Delhi is also where many international trips begin, and a place to eat well. Chandni Chowk's old lanes, Nizamuddin's kebab stalls, Hauz Khas's cafes and Khan Market's restaurants give very different experiences. The Metro is the most reliable way to avoid road congestion, with stations near most major monuments.",
      "Weather and air quality shape a visit. Summers are very hot, the monsoon is humid, and from roughly late October through January, air pollution can reach hazardous levels. Those sensitive to pollution should check daily air quality readings before planning outdoor days."
    ],
    history: [
      "Delhi has been inhabited for many centuries, and the sites in the city represent several successive capitals. Under the Delhi Sultanate from the late twelfth century, builders raised the Qutb Minar and the surrounding Quwwat-ul-Islam mosque, and later dynasties built new fortified cities at Siri, Tughlaqabad and elsewhere. Humayun's Tomb, finished in the 1570s, was an early example of the garden tomb that later influenced the Taj Mahal.",
      "Shah Jahan founded Shahjahanabad in 1639, with the Red Fort and Jama Masjid as its centrepieces, and moved the Mughal capital there from Agra in 1648. The city was sacked by Nadir Shah in 1739 and took part in the 1857 uprising, after which the British took direct control. At the Delhi Durbar of 1911, King George V announced that the capital would move from Calcutta to Delhi.",
      "Edwin Lutyens and Herbert Baker planned New Delhi, which was formally inaugurated in 1931. The city absorbed large numbers of refugees after the Partition of India in 1947 and grew rapidly in the following decades. It has been the capital of independent India since 1947."
    ],
    attractions: [
      {
        name: "Red Fort (Lal Qila)",
        description: "The red sandstone palace-fort of Shah Jahan, with audience halls, pavilions and a museum. It is the site of the Independence Day address each 15 August. Security is tight, bags may be restricted, and the fort has weekly closure days, so confirm timings with ASI.",
        visitHours: 2.5,
        coordinates: { lat: 28.6562, lng: 77.241 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Humayun's Tomb",
        description: "A Mughal garden tomb in red sandstone and white marble, restored by the Aga Khan Trust for Culture and ASI. The surrounding Nizamuddin area includes the dargah of Nizamuddin Auliya, which has a strong evening qawwali tradition on Thursdays, and requires modest dress and covered heads.",
        visitHours: 2,
        coordinates: { lat: 28.5933, lng: 77.2507 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Qutb Minar complex",
        description: "A fluted sandstone tower from the early thirteenth century, standing among the ruins of the Quwwat-ul-Islam mosque and the Iron Pillar. The tower itself is not open for climbing. Surfaces are uneven, with some steps and gravel paths.",
        visitHours: 2,
        coordinates: { lat: 28.5245, lng: 77.1855 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Chandni Chowk and Jama Masjid",
        description: "The old walled city's main street and one of the largest mosques in India. The lanes are crowded and best explored on foot or by cycle rickshaw. Jama Masjid has dress rules, with shoulders and knees covered and shoes removed, and non-worshippers may be asked to pay a fee for a camera.",
        visitHours: 3,
        coordinates: { lat: 28.6507, lng: 77.2334 },
        interests: ["food", "culture", "shopping", "history"],
        timeOfDay: "morning"
      },
      {
        name: "National Museum",
        description: "A large museum of Indian art and archaeology, including Harappan material, miniatures and textiles. It is on Janpath, near India Gate. Check current opening days and any gallery closures before visiting.",
        visitHours: 2.5,
        coordinates: { lat: 28.6117, lng: 77.2193 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Lodhi Garden",
        description: "A park of lawns and fifteenth- and sixteenth-century tombs of the Sayyid and Lodi dynasties, popular with walkers and photographers. It offers a free-to-enter, shaded break from monument touring.",
        visitHours: 1.5,
        coordinates: { lat: 28.5931, lng: 77.2197 },
        interests: ["relaxation", "photography", "history"],
        timeOfDay: "evening"
      },
      {
        name: "Lotus Temple",
        description: "A Baha'i House of Worship completed in 1986, shaped like a lotus flower. It is open to people of all faiths, with silent contemplation inside. Photography inside is not permitted.",
        visitHours: 1,
        coordinates: { lat: 28.5535, lng: 77.2588 },
        interests: ["spiritual", "photography"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 2, 3],
    bestTimeNote: "February and March, and October and early November, are usually comfortable for sightseeing. Winter days are pleasant but air quality can be poor from about late October to January, with fog affecting transport. April to June is very hot, and July to September is humid with monsoon rain.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2800],
      midRange: [4000, 8000],
      comfort: [10000, 25000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals, Metro and app-cab transport and typical Indian-resident monument tickets. Foreign visitors pay higher ticket rates at ASI sites, which are not included. Excludes intercity travel and shopping."
    },
    gettingThere: {
      air: "Indira Gandhi International Airport is the main gateway, with Terminal 3 handling most international services. The Airport Express Metro line links it to New Delhi station.",
      rail: "New Delhi, Old Delhi, Hazrat Nizamuddin and Anand Vihar are the main stations; Delhi is the hub for long-distance trains across India. Book through IRCTC and check which station your train uses.",
      road: "National highways connect Delhi to Agra, Jaipur, Chandigarh and the Himalayan foothills. Inter-state bus terminals at Kashmere Gate, Sarai Kale Khan and Anand Vihar serve long-distance routes.",
      local: "The Delhi Metro is the most efficient transport and covers many monuments. App cabs, autos and cycle rickshaws fill the gaps. Cycle rickshaws are best only in the old city."
    },
    accommodation: "Paharganj near New Delhi station has budget guesthouses but is noisy and crowded. Mid-range hotels are in Connaught Place, Karol Bagh, Aerocity and south Delhi. Heritage hotels and upscale international chains cluster around Lutyens' Delhi, Aerocity and Gurugram. Staying near a Metro station saves considerable time.",
    cuisine: [
      { name: "Butter chicken and dal makhani", note: "Rich, creamy north Indian dishes served in many restaurants, with versions that differ widely in quality." },
      { name: "Chaat and parathas", note: "Chandni Chowk and Paranthe Wali Gali are known for stuffed parathas, gol gappa and other snacks." },
      { name: "Kebabs and Mughlai food", note: "Old Delhi and Nizamuddin have long-established kebab and biryani stalls." },
      { name: "Chole bhature", note: "Spiced chickpeas with fried bread, commonly eaten for breakfast or lunch." },
      { name: "Daulat ki chaat", note: "A winter dessert of milk froth, found in the old city." }
    ],
    festivals: ["Republic Day parade (26 January)", "Holi", "Diwali", "Eid", "Independence Day (15 August)"],
    festivalSlugs: ["holi", "diwali", "eid-al-fitr", "christmas"],
    nearby: [
      { name: "Agra", distanceKm: 230, note: "The Taj Mahal and Agra Fort are a long day trip or an overnight stay.", destinationSlug: "agra" },
      { name: "Jaipur", distanceKm: 270, note: "The capital of Rajasthan, a standard onward stop.", destinationSlug: "jaipur" },
      { name: "Chandigarh", distanceKm: 245, note: "A planned city of Le Corbusier buildings and gardens.", destinationSlug: "chandigarh" },
      { name: "Kurukshetra", distanceKm: 160, note: "A pilgrimage town linked to the Mahabharata.", destinationSlug: "kurukshetra" },
      { name: "Rishikesh", distanceKm: 240, note: "A riverside town for yoga and rafting.", destinationSlug: "rishikesh" }
    ],
    precautions: [
      "Air pollution is a serious seasonal issue; check an air quality app and carry an N95 or similar mask if conditions are poor.",
      "Hail only licensed taxis or use app cabs to avoid overcharging and scams at the airport and railway stations.",
      "Crowded places such as Chandni Chowk and Sarojini Nagar attract pickpockets; carry little cash and keep bags closed.",
      "Women travelling alone should use app cabs with trip sharing and avoid isolated areas late at night.",
      "Check ASI monument closing days, as several major sites close on one weekday, and expect security checks."
    ],
    tips: [
      "Group sights by area: Old Delhi in one day, Lutyens' Delhi and museums in another, and Mehrauli and Humayun's Tomb in a third.",
      "Use the Metro at off-peak times and keep a smart card or the official app handy.",
      "Dress modestly for mosques, gurdwaras and temples and carry a scarf.",
      "Visit the Nizamuddin dargah in the evening for qawwali, with shoulders covered and head covered.",
      "Allow for traffic. Cross-city road journeys often take over an hour even for short distances."
    ],
    accessibility: "The Delhi Metro has lifts at stations and tactile paths in many places, but station entrances can involve long walks and crowds. Humayun's Tomb and Lodhi Garden have mostly level paths, while the Red Fort, Qutb complex and Old Delhi lanes have steps, uneven paving and crowds. Taxis and app cabs are generally more reliable than autos for wheelchair users, but accessible vehicles are limited.",
    responsibleTravel: "Delhi's air and water are under strain. Take the Metro when you can, avoid single-use plastic and tip rickshaw riders fairly. Respect worshippers at religious sites, and ask before taking portraits. Avoid buying souvenirs made from protected wildlife.",
    faqs: [
      {
        question: "How many days are enough for Delhi?",
        answer: "Three days covers the main clusters (Old Delhi, New Delhi and the south), while five lets you add markets, museums and food walks at a slower pace."
      },
      {
        question: "Is the Delhi Metro suitable for tourists?",
        answer: "Yes. It is clean, air-conditioned and has signs in English, and it serves many major sights. Avoid peak commuting hours if you have luggage, and note that the first coach is reserved for women."
      },
      {
        question: "Which Delhi monuments are UNESCO sites?",
        answer: "The Red Fort Complex, Humayun's Tomb and the Qutb Minar and its monuments are inscribed as World Heritage Sites."
      },
      {
        question: "Is Delhi safe for solo travellers?",
        answer: "Many solo travellers visit without problems, but it requires awareness of petty crime, scams and late-night safety. Women in particular should plan transport at night and share their location with a trusted contact."
      }
    ],
    officialLinks: [
      { label: "Delhi Tourism", url: "https://delhitourism.gov.in/" },
      { label: "Archaeological Survey of India", url: "https://asi.nic.in/" }
    ],
    sources: [
      { label: "Delhi on Wikipedia", url: "https://en.wikipedia.org/wiki/Delhi" },
      { label: "Red Fort Complex, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/231" },
      { label: "Humayun's Tomb, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/232" },
      { label: "Qutb Minar and its Monuments, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/233" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    stateSlug: "rajasthan",
    region: "north",
    tagline: "A planned eighteenth-century capital of palaces, observatory and hilltop forts, and the usual gateway to Rajasthan.",
    categories: ["forts-palaces", "monuments", "cultural", "photography"],
    coordinates: { lat: 26.9124, lng: 75.7873 },
    wikipediaTitle: "Jaipur",
    popular: true,
    hiddenGem: false,
    overview: [
      "Jaipur is the capital of Rajasthan and one of the corners of the Golden Triangle with Delhi and Agra. The old walled city, laid out on a grid in 1727, holds the City Palace, the Hawa Mahal and the Jantar Mantar observatory, and its main streets are lined with bazaars selling textiles, jewellery and handicrafts. The nickname Pink City comes from the colour the buildings were painted in the nineteenth century.",
      "Outside the walls, hilltop forts overlook the plain. Amer Fort, about 11 km north, is the most visited, with Jaigarh and Nahargarh on the ridge above. The old city and Amer are the focus for most visitors, but the modern city extends far beyond, with malls, cafes and traffic.",
      "Handicrafts are a major draw. Block-printing villages such as Sanganer, blue pottery, gemstone cutting and lac bangles all have local workshops. Prices vary widely, and many shops pay commission to guides or drivers, so look at a few places before buying.",
      "Jaipur is hot for much of the year, so plan outdoor sights for mornings and evenings. The busiest months are from October to March, when the weather suits sightseeing. The Jaipur Literature Festival in January brings large numbers of visitors and puts pressure on hotel availability."
    ],
    history: [
      "Before Jaipur, the Kachwaha rulers of the Dhundhar region were based at Amer, whose fort was largely built under Raja Man Singh I in the late sixteenth century. Maharaja Sawai Jai Singh II, a noted astronomer, moved the capital to a new city on the plain in 1727, partly because Amer lacked water and space.",
      "The city was planned on a grid following principles from Hindu architectural texts, with advice from the Bengali architect Vidyadhar Bhattacharya. Jai Singh also built the Jantar Mantar, one of five observatories he constructed in north India. The Hawa Mahal was added in 1799 by Maharaja Sawai Pratap Singh.",
      "Jaipur became a princely state under British protection and was painted pink in 1876 to welcome the Prince of Wales. After independence, it merged into the Union of India and became the capital of Rajasthan in 1949. UNESCO inscribed the Jantar Mantar in 2010, the hill forts of Rajasthan including Amer in 2013, and the walled city in 2019."
    ],
    attractions: [
      {
        name: "Amer Fort",
        description: "A hilltop palace-fort of red sandstone and marble above Maota Lake, reached by a steep ramp or road. It has audience halls, courtyards and the mirror-work Sheesh Mahal. The approach is steep and cobbled, and elephant rides have been criticised on animal welfare grounds, so walking, a jeep or a shuttle is a more considerate option.",
        visitHours: 3,
        coordinates: { lat: 26.9855, lng: 75.8513 },
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "City Palace",
        description: "The royal residence in the old city, partly still occupied by the former ruling family. Museum galleries display textiles, weapons and manuscripts. Opening hours and ticket categories vary, so check the official site.",
        visitHours: 2,
        coordinates: { lat: 26.9258, lng: 75.8237 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Jantar Mantar",
        description: "An observatory of large masonry instruments built in the 1720s to measure time and the positions of stars. A guide or audio explanation helps you understand how the instruments work. It is open air, and shade is limited in the middle of the day.",
        visitHours: 1.5,
        coordinates: { lat: 26.9247, lng: 75.8246 },
        interests: ["history", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Hawa Mahal",
        description: "A five-storey screen of small windows built so that royal women could watch street life unseen. The facade is best seen from the street early in the day, and many people photograph it from cafes across the road. The interior is modest.",
        visitHours: 1,
        coordinates: { lat: 26.9239, lng: 75.8267 },
        interests: ["photography", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Nahargarh Fort",
        description: "A ridge-top fort with wide views over the city, especially at sunset. It is reached by a winding road and is a popular evening stop. Rules on opening hours vary, so confirm locally.",
        visitHours: 2,
        coordinates: { lat: 26.9372, lng: 75.8156 },
        interests: ["photography", "history"],
        timeOfDay: "evening"
      },
      {
        name: "Jaigarh Fort",
        description: "A fort above Amer, built to guard it and known for its huge cannon, the Jaivana. It can be reached by a road above Amer or a walking path. Large parts are open to walk around, with uneven stone surfaces.",
        visitHours: 1.5,
        coordinates: { lat: 26.9853, lng: 75.8431 },
        interests: ["history", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Albert Hall Museum",
        description: "An Indo-Saracenic building from the 1880s that holds decorative arts, carpets and an Egyptian mummy. It is especially striking when lit at night, and the museum is a calmer break from the bazaars.",
        visitHours: 1.5,
        coordinates: { lat: 26.9115, lng: 75.8195 },
        interests: ["culture", "history"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March has cooler days that suit forts and bazaars; nights in December and January can be cold. April to June is very hot, often above 40 C, and the monsoon from July to September brings humidity and occasional heavy showers, though the surrounding hills turn green.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1500, 2800],
      midRange: [4000, 8000],
      comfort: [10000, 25000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals, auto and app-cab transport and typical Indian-resident entry tickets. Foreign visitors pay higher fees at many monuments, which are not included. Excludes intercity transport and shopping."
    },
    gettingThere: {
      air: "Jaipur International Airport (Sanganer) has domestic flights and some international services. It is about 12 km from the old city.",
      rail: "Jaipur Junction is a major station on the Delhi to Ajmer and Mumbai lines, with fast trains from Delhi. Gandhinagar Jaipur is a second, smaller station.",
      road: "National highways link Jaipur to Delhi (about 270 km), Agra and Ajmer. State and private buses run frequently, and travel times vary with traffic.",
      local: "App cabs, auto-rickshaws and cycle rickshaws operate in the city. A hired car with a driver is practical for Amer and the forts. Jaipur Metro serves limited parts of the city."
    },
    accommodation: "Heritage havelis and palace hotels are common, along with boutique guesthouses in the old city and C-Scheme. Budget hotels cluster around Sindhi Camp and the railway station. Book well ahead for the Jaipur Literature Festival and for Diwali.",
    cuisine: [
      { name: "Dal baati churma", note: "Baked wheat balls served with lentils and a sweet crumbled wheat dish; a Rajasthani staple." },
      { name: "Laal maas", note: "A fiery red mutton curry associated with Rajasthan's Rajput cuisine; vegetarian versions are also served." },
      { name: "Pyaaz kachori", note: "A fried pastry stuffed with spiced onion, a popular snack." },
      { name: "Ghewar", note: "A honeycomb-shaped sweet, particularly associated with the Teej festival season." },
      { name: "Mawa kachori", note: "A sweet pastry stuffed with dried milk and nuts and soaked in syrup." }
    ],
    festivals: ["Jaipur Literature Festival (January)", "Makar Sankranti kite flying", "Gangaur", "Teej", "Holi", "Diwali"],
    festivalSlugs: ["makar-sankranti", "holi", "diwali"],
    nearby: [
      { name: "Pushkar", distanceKm: 145, note: "A holy lake town known for the Pushkar Camel Fair in the Kartik month." },
      { name: "Ranthambore National Park", distanceKm: 180, note: "A tiger reserve with fort ruins; safaris must be booked in advance." },
      { name: "Alwar and Sariska", distanceKm: 150, note: "A fort town and a tiger reserve in the Aravalli hills." },
      { name: "Agra", distanceKm: 240, note: "The Taj Mahal and Agra Fort, the usual next stop on the Golden Triangle.", destinationSlug: "agra" },
      { name: "Udaipur", distanceKm: 395, note: "The lake city of Mewar, best reached by train or domestic flight.", destinationSlug: "udaipur" }
    ],
    precautions: [
      "Touts, unofficial guides and shop owners paying commission to drivers are common near monuments; agree prices clearly before any service.",
      "Heat in May and June can be dangerous. Carry water, cover your head and avoid midday outdoor sightseeing.",
      "Be careful with gemstones and jewellery sold to tourists; fake stones and inflated prices are well-known problems, so only buy from established shops.",
      "Elephant rides at Amer Fort raise animal welfare concerns, so consider walking or a jeep instead.",
      "Roads in the old city are crowded, and pavements are often occupied by vendors. Watch for motorbikes."
    ],
    tips: [
      "See Amer Fort at opening time to avoid the heat and coach groups.",
      "Combine City Palace, Jantar Mantar and Hawa Mahal in one morning, as they are close together.",
      "Visit Nahargarh around sunset for views of the city, and descend before it is fully dark.",
      "Ask your hotel about block-printing workshops in Sanganer or Bagru for a hands-on demonstration.",
      "Some museums close on one day of the week; check before you go."
    ],
    accessibility: "Access is mixed. Amer Fort involves a steep ramp, stairs and uneven stone, though vehicles can reach the main entrance. City Palace and Albert Hall have steps in places, and the old city's pavements are uneven and crowded. Jantar Mantar is open ground but with steps up some instruments. Step-free access is not confirmed at most sites.",
    responsibleTravel: "Choose walking or a jeep over elephant rides, buy directly from artisans where possible and avoid items made from protected wildlife. Dress modestly at temples, and ask permission before photographing people, especially women and older residents. Conserve water, as Rajasthan is dry.",
    faqs: [
      {
        question: "Why is Jaipur called the Pink City?",
        answer: "The old city's buildings were painted a terracotta pink in 1876, reportedly to welcome the Prince of Wales. The colour has been maintained since."
      },
      {
        question: "How many days do I need in Jaipur?",
        answer: "Two days cover Amer Fort, the City Palace, Jantar Mantar and Hawa Mahal. A third day allows Nahargarh, the museum, markets and a craft village."
      },
      {
        question: "Which Jaipur sites are UNESCO World Heritage Sites?",
        answer: "The Jantar Mantar was inscribed in 2010, Amer Fort as part of the Hill Forts of Rajasthan in 2013, and the walled city in 2019."
      },
      {
        question: "Are elephant rides at Amer Fort recommended?",
        answer: "Many animal welfare groups raise concerns about working elephants in hot conditions on hard surfaces. Walking, a jeep or the shuttle are alternatives that avoid the issue."
      }
    ],
    officialLinks: [{ label: "Rajasthan Tourism", url: "https://tourism.rajasthan.gov.in/" }],
    sources: [
      { label: "Jaipur on Wikipedia", url: "https://en.wikipedia.org/wiki/Jaipur" },
      { label: "Jantar Mantar, Jaipur, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/1338" },
      { label: "Hill Forts of Rajasthan, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/247" },
      { label: "Jaipur City, Rajasthan, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/1605" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    stateSlug: "rajasthan",
    region: "north",
    tagline: "A lakeside city of palaces, havelis and Aravalli hills, founded as the capital of the Mewar kingdom.",
    categories: ["lakes", "forts-palaces", "cultural", "photography"],
    coordinates: { lat: 24.5854, lng: 73.7125 },
    wikipediaTitle: "Udaipur",
    popular: true,
    hiddenGem: false,
    overview: [
      "Udaipur is in the south of Rajasthan, among low Aravalli hills and a chain of artificial lakes. The City Palace complex rises above Lake Pichola, and the lake holds the island palaces of Jag Mandir and Jag Niwas, the latter now the Taj Lake Palace hotel. The old town spreads across the east bank, its lanes narrow and its havelis converted into guesthouses, galleries and cafes.",
      "The city is known for miniature painting, puppet-making, silver work and textiles, and it hosts classical music and dance performances in the evening. It is smaller and calmer than Jaipur, and many visitors spend a couple of nights walking, boating and eating on rooftops.",
      "The city is also a base for bigger sites nearby: Kumbhalgarh fort, the Jain temples at Ranakpur, the Shrinathji temple at Nathdwara and Chittorgarh fort. These are best reached by hired car, and a day trip to one or two of them is common.",
      "Lake levels depend on the monsoon, and in dry years the lakes shrink noticeably. After good rains between August and October the city looks its freshest. Visitors in the busiest winter weeks should expect crowds on the lakeside ghats and at the City Palace."
    ],
    history: [
      "The Sisodia rulers of Mewar had their capital at Chittorgarh, which fell to sieges in 1303, 1535 and 1568. After the third siege, Maharana Udai Singh II founded a new capital in the 1550s near Lake Pichola, which had been enlarged earlier, and the city took his name. His son Maharana Pratap, remembered for his resistance to Akbar at the Battle of Haldighati in 1576, is still a figure of strong regional pride.",
      "The City Palace was built over about four centuries by successive rulers, giving it a mix of styles. Mewar gradually accepted British protection in the early nineteenth century, though the rulers kept a reputation for guarding their status. The Lake Palace was built in the eighteenth century as a summer retreat.",
      "After independence, Mewar joined the Union of India in 1949. Tourism, handicrafts and the film and hotel industries have shaped the modern city, which remains closely linked to the former ruling family's trusts that run the City Palace museum and associated hotels."
    ],
    attractions: [
      {
        name: "City Palace",
        description: "A complex of palaces, courtyards and balconies overlooking Lake Pichola, now a museum. Parts are still used by the former royal family. It involves many stairs and uneven floors, and ticket types vary for entry, cameras and boat access, so check the official site.",
        visitHours: 2.5,
        coordinates: { lat: 24.5764, lng: 73.6835 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Lake Pichola boat ride",
        description: "A short boat trip from the City Palace jetty gives views of the ghats, palaces and hills. Landing on Jag Mandir is possible on some boats, while the Lake Palace is a hotel with restricted access for non-guests. Water levels vary with the season.",
        visitHours: 1.5,
        coordinates: { lat: 24.5714, lng: 73.678 },
        interests: ["relaxation", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Jagdish Temple",
        description: "A large Indo-Aryan temple to Vishnu, built in the 1650s, reached by a steep flight of steps. Dress modestly, remove shoes and follow temple instructions about photography. Aarti times are posted locally.",
        visitHours: 1,
        coordinates: { lat: 24.5798, lng: 73.6835 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Saheliyon-ki-Bari",
        description: "An eighteenth-century garden with fountains, pools and marble kiosks, built for the women of the royal household. It is a pleasant, shaded stop away from the old town.",
        visitHours: 1,
        coordinates: { lat: 24.6021, lng: 73.6824 },
        interests: ["relaxation", "history"],
        timeOfDay: "afternoon"
      },
      {
        name: "Bagore Ki Haveli",
        description: "An eighteenth-century mansion on Gangaur Ghat, now a museum of royal life with costumes and a puppet collection. Evening dance performances are held on some days; check schedules locally.",
        visitHours: 1.5,
        coordinates: { lat: 24.5797, lng: 73.6797 },
        interests: ["culture", "history"],
        timeOfDay: "evening"
      },
      {
        name: "Sajjangarh (Monsoon Palace)",
        description: "A hilltop palace built in the 1880s for observing monsoon clouds, now a viewpoint over the lakes. It lies within a wildlife sanctuary, so access rules apply and the road is steep.",
        visitHours: 1.5,
        coordinates: { lat: 24.599, lng: 73.6518 },
        interests: ["photography", "nature"],
        timeOfDay: "evening"
      }
    ],
    bestMonths: [9, 10, 11, 12, 1, 2, 3],
    bestTimeNote: "September to March is the usual season, with the lakes fullest after the monsoon and the weather cool. Winter nights can be cold. April to June is very hot, and the lakes can be low by then. Monsoon showers from July suit visitors who like greenery over heat.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1500, 2800],
      midRange: [4000, 8500],
      comfort: [10000, 30000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals, local transport and typical Indian-resident entry tickets. Foreign visitors pay higher fees at some sites, which are not included. Lake-facing and palace hotels cost far more than the comfort range shown."
    },
    gettingThere: {
      air: "Maharana Pratap Airport at Dabok is about 22 km from the old town and has domestic flights, including to Delhi, Mumbai and Jaipur. Taxis and app cabs run to the city.",
      rail: "Udaipur City station is near the old town. Direct trains run to Jaipur, Ajmer and Delhi, and Mumbai connections go through Ahmedabad or other junctions.",
      road: "National highways connect Udaipur to Ahmedabad, Jodhpur, Chittorgarh and Mount Abu. Buses operate from the main bus stand.",
      local: "Auto-rickshaws and app cabs are widely used. The old town lanes are best explored on foot, and a hired car suits trips to Kumbhalgarh and Ranakpur."
    },
    accommodation: "Heritage havelis and small hotels sit around Lake Pichola and Gangaur Ghat, with rooftop restaurants looking to the City Palace. Budget stays are in the old town lanes, mid-range hotels around Fateh Sagar and Chandpole, and luxury palaces on islands or hills. Book early for winter and wedding season.",
    cuisine: [
      { name: "Dal baati churma", note: "A Rajasthani staple of baked wheat balls with lentils, widely served in the city." },
      { name: "Gatte ki sabzi", note: "Gram flour dumplings in a spiced yoghurt gravy, a vegetarian dish suited to a dry region." },
      { name: "Laal maas", note: "A hot red mutton curry linked to the Mewar and Rajput kitchens." },
      { name: "Mawa kachori", note: "A sweet pastry stuffed with milk solids and nuts." },
      { name: "Lakeside rooftop meals", note: "Many guesthouses serve north Indian and Rajasthani food on rooftops; quality varies, so check recent reviews." }
    ],
    festivals: ["Mewar Festival (spring, around Gangaur)", "Holi", "Diwali", "Gangaur"],
    festivalSlugs: ["holi", "diwali"],
    nearby: [
      { name: "Kumbhalgarh Fort", distanceKm: 85, note: "A fifteenth-century fort with long walls, part of the UNESCO-listed Hill Forts of Rajasthan." },
      { name: "Ranakpur Jain Temples", distanceKm: 90, note: "A marble Jain temple complex, with strict dress and photography rules." },
      { name: "Nathdwara", distanceKm: 48, note: "A temple town with a major Krishna shrine and a Pichwai painting tradition." },
      { name: "Chittorgarh Fort", distanceKm: 115, note: "The old Mewar capital, a large hilltop fort also in the Hill Forts of Rajasthan group." },
      { name: "Kutch", distanceKm: 560, note: "A far-off but striking region in Gujarat for crafts and the white desert.", destinationSlug: "kutch" }
    ],
    precautions: [
      "Boat operators and hotel touts may exaggerate lake or palace restrictions to sell packages; check official ticket counters.",
      "Steep steps and slippery stone at ghats and the Jagdish Temple can be dangerous when wet; wear shoes with grip.",
      "Roads to Sajjangarh and Kumbhalgarh are winding and used by trucks; avoid driving after dark in the hills.",
      "Swimming in the lakes is not advisable because of water quality and drowning risk; follow local signage.",
      "Observe dress rules and photography bans in temples, including the Jain temples at Ranakpur."
    ],
    tips: [
      "Visit the City Palace in the morning and take a boat ride at dusk when the light is softer.",
      "Allow a full day for Kumbhalgarh and Ranakpur together, starting early.",
      "Rooftop restaurants fill early at sunset; book a table if you want a lake view.",
      "Ask permission before photographing craftspeople, and buy miniature paintings from artists who can explain their techniques.",
      "Bring a light jacket in December and January for evenings by the water."
    ],
    accessibility: "The old town is hilly and cobbled, and many havelis have steps. City Palace has many stairs and narrow passages, with step-free access limited. Boat embarkation involves steps at the jetty. Contact hotels and the palace museum in advance if you have mobility needs, as step-free access is not confirmed.",
    responsibleTravel: "Water is scarce in Rajasthan; use it sparingly and avoid single-use plastic bottles where refill stations are available. Respect worshippers at temples, ask permission before taking photographs of people, and buy crafts directly from artisans. Avoid dumping offerings or rubbish in the lakes.",
    faqs: [
      {
        question: "Can I visit the Lake Palace hotel as a day visitor?",
        answer: "Access is generally limited to guests and restaurant bookings. Check with the hotel for current rules."
      },
      {
        question: "How many days do I need in Udaipur?",
        answer: "Two days cover the City Palace, a lake boat ride and the old town. Add another day if you plan a trip to Kumbhalgarh or Ranakpur."
      },
      {
        question: "Is Udaipur better in the monsoon?",
        answer: "The lakes and hills are greenest from August to October, but heavy rain can disrupt boating and travel. Winter is more reliable for sightseeing."
      },
      {
        question: "What should I wear at the Jain temples at Ranakpur?",
        answer: "Dress modestly with shoulders and knees covered. Leather items and, in some cases, menstruating women are restricted by temple rules, so ask on arrival."
      }
    ],
    officialLinks: [{ label: "Rajasthan Tourism", url: "https://tourism.rajasthan.gov.in/" }],
    sources: [
      { label: "Udaipur on Wikipedia", url: "https://en.wikipedia.org/wiki/Udaipur" },
      { label: "City Palace, Udaipur on Wikipedia", url: "https://en.wikipedia.org/wiki/City_Palace,_Udaipur" },
      { label: "Hill Forts of Rajasthan, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/247" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "jaisalmer",
    name: "Jaisalmer",
    stateSlug: "rajasthan",
    region: "north",
    tagline: "A golden sandstone fort-town in the Thar Desert, close to the Pakistan border.",
    categories: ["forts-palaces", "adventure", "photography", "cultural"],
    coordinates: { lat: 26.9157, lng: 70.9083 },
    wikipediaTitle: "Jaisalmer",
    popular: true,
    hiddenGem: false,
    overview: [
      "Jaisalmer is in western Rajasthan, in the Thar Desert, and is one of India's more remote tourist towns. Its centrepiece is a fort of honey-coloured sandstone, rising above the town, which still houses shops, hotels, temples and many residents' homes. Around the base are carved havelis, built by wealthy merchants in the eighteenth and nineteenth centuries.",
      "Most travellers come for two things: the fort and the desert. Sand dunes at Sam, about 40 km west, and Khuri, farther south, are the usual sites for camel rides and overnight camps. Standards of camps vary from simple tents to luxurious setups, and some have been criticised for noise and disturbance to the dunes.",
      "The town lies close to the border with Pakistan, and parts of the surrounding area are military zones. Some areas require permits for foreigners, and checkposts are common on roads. Visitors should carry identification and check current restrictions with local authorities.",
      "Summer is severe and winters are cold at night, which makes October to March the practical season. Water is scarce, and the old fort has had problems with seepage and wear; tourism infrastructure and conservation are subjects of local debate. Staying outside the fort walls and using water carefully are small ways to reduce pressure on the site."
    ],
    history: [
      "Jaisalmer was founded in 1156 by Rawal Jaisal, a Bhati Rajput, who moved his capital here from Lodhruva. The town grew prosperous on caravan trade between India, Central Asia and the Middle East, with merchants adding havelis and Jain temples inside and below the fort.",
      "The Bhati rulers resisted several sieges and accepted Mughal overlordship in the sixteenth century. Maritime trade and the British ports at Bombay later diverted trade away from the desert routes, and the town's fortunes declined. Jaisalmer joined British treaty relations in 1818 and then became part of Rajasthan after independence.",
      "The 1965 and 1971 wars with Pakistan raised the area's strategic importance, and the town reopened to tourism in earnest from the 1980s. The fort was inscribed with five other Rajasthan forts as the Hill Forts of Rajasthan in 2013. Conservation bodies have since raised concerns about water damage and structural strain in the fort."
    ],
    attractions: [
      {
        name: "Jaisalmer Fort (Sonar Qila)",
        description: "A living fort with Jain temples, lanes of shops and guesthouses, and a palace museum. Walking the ramparts at sunset is popular. Water use by hotels within the walls is a conservation concern, so consider staying outside. The lanes are cobbled and steep.",
        visitHours: 3,
        coordinates: { lat: 26.9124, lng: 70.9127 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Patwon Ki Haveli",
        description: "A cluster of five carved sandstone havelis built by a merchant family, with intricate jharokhas and painted rooms. Parts are open as museums. Details of ownership and ticketing vary between sections.",
        visitHours: 1,
        coordinates: { lat: 26.917, lng: 70.9139 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Salim Singh Ki Haveli",
        description: "An eighteenth-century mansion known for its curved roof and carved brackets. The interior is small, and the exterior is the main attraction.",
        visitHours: 0.75,
        coordinates: { lat: 26.9148, lng: 70.915 },
        interests: ["history", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Gadisar Lake",
        description: "A reservoir built in the fourteenth century that once supplied the town's water. Small shrines and an ornate gateway surround it. Paddle boats are available at times, and it is quieter in the early morning.",
        visitHours: 1,
        coordinates: { lat: 26.9033, lng: 70.9144 },
        interests: ["relaxation", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Bada Bagh",
        description: "A garden complex north of town with royal cenotaphs (chhatris) of the Bhati rulers, popular for sunset photography. Entry arrangements can change, so confirm locally.",
        visitHours: 1.5,
        coordinates: { lat: 26.9511, lng: 70.886 },
        interests: ["photography", "history"],
        timeOfDay: "evening"
      },
      {
        name: "Sam Sand Dunes",
        description: "Dunes about 40 km west of town, where camel safaris and camps operate. They are busy at sunset and rely on motorised jeeps, which damage the habitat. A quieter option is to choose a camp farther from the main dune cluster.",
        visitHours: 4,
        coordinates: { lat: 26.833, lng: 70.51 },
        interests: ["adventure", "photography", "nature"],
        timeOfDay: "evening"
      },
      {
        name: "Kuldhara",
        description: "An abandoned Paliwal Brahmin village, deserted in the early nineteenth century, with ruined houses and a small temple. Local legends about why it was abandoned vary, and are not well documented. Entry arrangements and fees are managed locally.",
        visitHours: 1,
        coordinates: { lat: 26.818, lng: 70.793 },
        interests: ["history", "photography"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2],
    bestTimeNote: "October to February is the practical window, with warm days and cold desert nights, especially in December and January. The Desert Festival is usually held around the full moon in February. From April to September the heat is extreme, with shade and water very limited, and tourism drops sharply.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1200, 2500],
      midRange: [3500, 7000],
      comfort: [9000, 25000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals, local transport and typical entry tickets. A camel safari or camp stay adds substantially and varies by operator. Excludes intercity transport and shopping."
    },
    gettingThere: {
      air: "Jaisalmer has an airport with limited, seasonal domestic services; check schedules before booking. Jodhpur (about 285 km) has a larger airport with more frequent flights.",
      rail: "Jaisalmer station is the end of the line from Jodhpur, with overnight trains from Jodhpur, Jaipur and Delhi. Check train times, as services are less frequent than on mainline routes.",
      road: "State highways link Jaisalmer to Jodhpur (about 285 km), Bikaner and Barmer. Buses run on these routes, and a driver is advisable at night.",
      local: "Autos and taxis serve the town, and the fort area is best walked. Desert camps usually arrange pick-up from town, or you can hire a taxi for Sam and Kuldhara."
    },
    accommodation: "Guesthouses and havelis operate inside and around the fort, with budget lodgings and rooftop restaurants. Mid-range and luxury hotels are on the town's outskirts and near the desert, along with seasonal camps at Sam and Khuri. Winter bookings fill quickly around Christmas and New Year.",
    cuisine: [
      { name: "Ker sangri", note: "A desert vegetable dish of berries and beans, cooked with spices and found across Rajasthan." },
      { name: "Dal baati churma", note: "The regional staple of baked wheat balls, lentils and sweet crumble." },
      { name: "Bajra roti", note: "A flatbread of pearl millet, traditionally eaten with ghee and chutney." },
      { name: "Ghotua ladoo", note: "A local sweet with nuts and ghee, often sold in the bazaar." },
      { name: "Bhang lassi", note: "Sold openly in some shops, but cannabis laws vary, and the effects can be strong. Ask what is in a drink before accepting it." }
    ],
    festivals: ["Desert Festival (usually February)", "Holi", "Diwali"],
    festivalSlugs: ["holi", "diwali"],
    nearby: [
      { name: "Kuldhara", distanceKm: 18, note: "An abandoned village of the Paliwal community." },
      { name: "Khuri", distanceKm: 45, note: "A smaller dune village with camps and a quieter feel than Sam." },
      { name: "Pokaran", distanceKm: 110, note: "A fort town on the route to Jodhpur, known for pottery." },
      { name: "Jodhpur", distanceKm: 285, note: "The blue city and Mehrangarh Fort, the usual rail and road gateway." },
      { name: "Kutch", distanceKm: 450, note: "A region of crafts and salt desert in Gujarat, reached by a long journey.", destinationSlug: "kutch" }
    ],
    precautions: [
      "Check permit and checkpost rules for border areas. Foreign visitors going beyond designated tourist sites may need permission, and photography near military facilities is prohibited.",
      "Desert nights are cold in winter and days are hot; layer clothing and carry water.",
      "Camel safari and camp operators vary in quality; choose one with clear prices, safe tents and fair treatment of animals.",
      "Cobbles and steps inside the fort are slippery; wear sturdy shoes.",
      "Take care with cannabis-containing products and unregulated alcohol; both carry legal and health risks."
    ],
    tips: [
      "Spend a night at a camp away from the busiest dunes for quieter skies and less noise.",
      "Visit the fort in the morning, when the lanes are cooler and the light is good for photographs.",
      "Choose accommodation outside the fort walls if you want to ease pressure on its drainage.",
      "Bring a torch for walking in dark lanes at night and a scarf for dust.",
      "Confirm the dates of the Desert Festival with Rajasthan Tourism, as it moves with the lunar calendar."
    ],
    accessibility: "Access is difficult. The fort has steep, uneven cobbled lanes and steps, and the havelis have narrow stairs. Desert camps involve sand and uneven terrain, though some have ground-floor tents. Step-free access is not confirmed at the main sites.",
    responsibleTravel: "Water and fragile desert ecosystems are under stress. Use water sparingly, limit jeep dune-bashing, and choose camps that manage waste and do not use loud amplified music. Buy crafts such as embroidery directly from makers, and ask before photographing local people.",
    faqs: [
      {
        question: "Is Jaisalmer safe given its proximity to the border?",
        answer: "Tourism operates normally in the town and at the main dune sites, but check government advisories before travelling and carry identification. Restricted areas near the border require permission."
      },
      {
        question: "What is the difference between Sam and Khuri dunes?",
        answer: "Sam is larger, closer and busier. Khuri is smaller and quieter, with fewer camps, and is a better choice if you want to avoid crowds."
      },
      {
        question: "Is the fort a good place to stay?",
        answer: "It is atmospheric, but hotels within the walls add pressure to ageing drainage. Many people choose to stay outside and walk in."
      },
      {
        question: "Can I do a day trip to the dunes?",
        answer: "Yes. A half-day visit to Sam or Khuri with a sunset camel ride is possible from town, though staying overnight gives a quieter experience."
      }
    ],
    officialLinks: [{ label: "Rajasthan Tourism", url: "https://tourism.rajasthan.gov.in/" }],
    sources: [
      { label: "Jaisalmer on Wikipedia", url: "https://en.wikipedia.org/wiki/Jaisalmer" },
      { label: "Jaisalmer Fort on Wikipedia", url: "https://en.wikipedia.org/wiki/Jaisalmer_Fort" },
      { label: "Hill Forts of Rajasthan, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/247" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "srinagar",
    name: "Srinagar",
    stateSlug: "jammu-and-kashmir",
    region: "north",
    tagline: "The summer capital of Jammu and Kashmir, set among lakes, Mughal gardens and snow-capped mountains.",
    categories: ["lakes", "cultural", "mountains", "photography"],
    coordinates: { lat: 34.0837, lng: 74.7973 },
    wikipediaTitle: "Srinagar",
    popular: true,
    hiddenGem: false,
    overview: [
      "Srinagar sits in the Kashmir Valley on the Jhelum River, at an altitude of around 1,600 m, with the Pir Panjal range to the south and the Zabarwan hills closer to town. It is the summer capital of the union territory of Jammu and Kashmir. Dal Lake and its houseboats, wooden shrines in the old city and Mughal gardens on the lake shore are the main draws.",
      "The old city, around Jamia Masjid and Khanqah-e-Moula, is a dense district of timber mosques, bazaars and shrines, with walnut-wood carving, papier-mache and pashmina workshops. The newer parts of town, around Lal Chowk and Rajbagh, have hotels, restaurants and government offices. Gulmarg, Sonamarg and Pahalgam are the usual onward trips, each between 50 and 100 km away.",
      "Security conditions in Kashmir have varied over the years, and visitors should check current government advisories and local news before travelling. Checkpoints and a visible security presence are routine, and access to some areas may be restricted at short notice. Many visitors travel without problems, but flexible plans and travel insurance are sensible.",
      "Practical points differ from the rest of India. Prepaid mobile SIM cards bought outside Jammu and Kashmir have historically not worked in the region, so postpaid connections are the usual option; check your operator's current policy. Internet access can also be suspended during unrest. Dress is generally conservative, particularly at shrines."
    ],
    history: [
      "Kashmir has a long recorded history that includes Buddhist and Hindu kingdoms, among them the Karkota dynasty, whose ruler Lalitaditya built the Martand Sun Temple in the eighth century. Islam spread through the region from the fourteenth century, and the Shah Mir dynasty took power in 1339. Sufi preachers such as Mir Sayyid Ali Hamadani helped shape Kashmir's Islamic culture, and the wood-and-papier-mache crafts of the valley date from this era.",
      "Akbar annexed Kashmir in 1586, and the Mughals built terraced gardens on the lakeshore, among them Shalimar Bagh (1619) under Jahangir and Nishat Bagh under Asaf Khan. Afghan rule followed from 1753, then Sikh rule from 1819. In 1846, under the Treaty of Amritsar, the British sold Kashmir to Gulab Singh of Jammu, the first of the Dogra maharajas.",
      "Following Partition in 1947, the ruler of the state acceded to India after a tribal invasion backed by Pakistan, and the region has been disputed since. In August 2019 the Indian government revoked Article 370 and reorganised the state into two union territories, Jammu and Kashmir, and Ladakh. The political situation remains contested and sensitive; this guide describes only what a visitor should know."
    ],
    attractions: [
      {
        name: "Dal Lake and shikara ride",
        description: "A large urban lake with floating gardens, houseboats and a floating vegetable market at dawn. Shikara rides are priced by the hour. Agree the price and route first, and be aware that sales boats may approach you. The lake faces pollution and shrinking, and conservation is ongoing.",
        visitHours: 2,
        coordinates: { lat: 34.11, lng: 74.87 },
        interests: ["relaxation", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Shalimar Bagh",
        description: "A terraced Mughal garden of canals, fountains and chinar trees, built in 1619. It is most striking in spring and autumn. Entry fees apply and opening hours vary by season.",
        visitHours: 1.5,
        coordinates: { lat: 34.1451, lng: 74.873 },
        interests: ["history", "relaxation", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Nishat Bagh",
        description: "The largest of the Dal Lake Mughal gardens, with twelve terraces rising towards the hills. It is on the same route as Shalimar and Chashme Shahi, so the three are often visited together.",
        visitHours: 1.5,
        coordinates: { lat: 34.1286, lng: 74.8795 },
        interests: ["history", "photography", "relaxation"],
        timeOfDay: "afternoon"
      },
      {
        name: "Jamia Masjid and old city",
        description: "A large congregational mosque with a courtyard of timber pillars, in the heart of the old city. Access for non-Muslims may be limited at prayer times, and the mosque has occasionally been closed for security reasons. Dress modestly and ask before taking photographs.",
        visitHours: 2,
        coordinates: { lat: 34.0998, lng: 74.8138 },
        interests: ["culture", "spiritual", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Hazratbal Shrine",
        description: "A white marble shrine on the west shore of Dal Lake that holds a relic revered by many Kashmiri Muslims. Visit with modest dress, and note that access can be restricted on important religious days.",
        visitHours: 1,
        coordinates: { lat: 34.1286, lng: 74.8386 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Shankaracharya Temple",
        description: "A small stone Shiva temple on a hill above the lake, reached by a stairway, with views over the city. Security checks are thorough and phones or cameras may need to be left outside; confirm on arrival.",
        visitHours: 1.5,
        coordinates: { lat: 34.075, lng: 74.843 },
        interests: ["spiritual", "history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Indira Gandhi Memorial Tulip Garden",
        description: "A large terraced garden with tulips that bloom for a few weeks in spring, usually from late March to April. It opens only for that season, with dates set by the authorities and weather, so check before planning.",
        visitHours: 2,
        coordinates: { lat: 34.091, lng: 74.878 },
        interests: ["photography", "nature"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [4, 5, 6, 9, 10],
    bestTimeNote: "April and May bring spring blossom and the tulip season, and June is pleasant before July rain. September and October bring clear skies and autumn colour on the chinar trees. Winters, from December to February, are cold with snow, and road closures can affect travel to Gulmarg, Sonamarg and passes beyond.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1500, 2800],
      midRange: [4000, 8000],
      comfort: [10000, 25000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals and shared local transport; houseboat stays vary widely. Excludes flights, day trips to Gulmarg, Pahalgam or Sonamarg by hired car, and shopping. Prices rise in peak seasons."
    },
    gettingThere: {
      air: "Sheikh ul-Alam International Airport has frequent flights from Delhi, Mumbai and other cities, and is about 12 km from the centre. Security procedures are tight and mobile or battery restrictions can apply.",
      rail: "The Kashmir Valley rail link from Banihal to Baramulla, via Srinagar, is operational. A Katra to Srinagar Vande Bharat began in 2025 and, according to the Ministry of Railways, was extended to Jammu Tawi from 30 April 2026. Check IRCTC for current timetables and booking.",
      road: "National Highway 44 links Srinagar to Jammu (about 270 km) through the Banihal tunnel. The road is closed from time to time by snow and landslides, and convoys or traffic controls can apply. The Srinagar to Leh highway reopens in late spring.",
      local: "Taxis, autos and shared Tempo Travellers serve the city, and shikaras operate on the lake. Hired cars with drivers are the practical option for day trips outside the city."
    },
    accommodation: "Houseboats on Dal and Nigeen lakes, with carved wooden interiors and meals included, are a Kashmir tradition; check recent reviews for standards and compare terms. Hotels are on Boulevard Road, in Rajbagh and near the airport. Heritage guesthouses and small homestays are also available. Book early for May to June.",
    cuisine: [
      { name: "Wazwan", note: "A multi-course ceremonial Kashmiri meal, mostly meat dishes such as rogan josh and goshtaba, usually served at weddings and in restaurants by arrangement." },
      { name: "Kahwa", note: "A green tea with saffron, almonds and spices, served hot across the valley." },
      { name: "Noon chai", note: "A pink, salted milk tea, often paired with local breads." },
      { name: "Kashmiri bread", note: "Crusty breads such as girda and lavasa, sold from bakeries in the morning." },
      { name: "Dum aloo", note: "Potatoes cooked in a yoghurt gravy, widely available in vegetarian form." }
    ],
    festivals: ["Tulip Festival (spring)", "Eid", "Navroz", "Shab-e-Qadr and other Sufi observances"],
    festivalSlugs: ["eid-al-fitr"],
    nearby: [
      { name: "Gulmarg", distanceKm: 50, note: "A meadow and ski area with a high-altitude gondola, open in summer and winter." },
      { name: "Pahalgam", distanceKm: 95, note: "A river valley town used as a base for treks; check current security and access arrangements." },
      { name: "Sonamarg", distanceKm: 80, note: "A mountain valley on the Srinagar to Leh road, with day walks to glaciers." },
      { name: "Dachigam National Park", distanceKm: 20, note: "A protected area for the Kashmir stag, with access subject to permits and seasons." },
      { name: "Leh", distanceKm: 420, note: "Across the Zoji La, on a seasonal highway to Ladakh.", destinationSlug: "leh" }
    ],
    precautions: [
      "Check current travel advisories and local news before you go, and consider travel insurance that covers disruption in the region.",
      "Expect security checkpoints and carry photo identification at all times, with foreign visitors carrying passports.",
      "Mobile connectivity can be restricted; confirm SIM policy with your operator and download maps and documents before travel.",
      "Choose houseboats and operators with a verified history, and avoid paying large sums in advance to unknown agents.",
      "Take care when travelling on mountain roads in winter and during the monsoon, when landslides are common."
    ],
    tips: [
      "Visit the Mughal gardens in the morning or late afternoon, and combine all three on one route.",
      "Go to the floating vegetable market early, around dawn, from a shikara.",
      "Dress modestly, especially in the old city and at shrines, and cover your head where asked.",
      "Ask before photographing people, military installations and checkpoints.",
      "Buy Kashmiri shawls and carpets from established shops and ask for authenticity certificates, as imitations are common."
    ],
    accessibility: "Mughal gardens have terraced paths with steps and slopes, and the old city is crowded with uneven surfaces. Shikara boarding involves steps down to the water, and houseboats are reached by gangways. Shankaracharya Temple needs a climb up many steps. Step-free access is not confirmed at most major sites.",
    responsibleTravel: "Dal Lake is under ecological stress from waste and encroachment. Choose operators that treat waste responsibly, avoid littering, and buy crafts directly from artisans. Be sensitive about political conversations, and follow local guidance on behaviour near religious sites.",
    faqs: [
      {
        question: "Is Srinagar safe to visit?",
        answer: "Many visitors travel without incident, but conditions can change at short notice. Check your government's advisory, follow local guidance, and keep plans flexible."
      },
      {
        question: "When is the Tulip Garden open?",
        answer: "It is open for a few weeks in spring, usually from late March to April. The exact dates depend on flowering and are announced locally, so check before planning."
      },
      {
        question: "Can I use my Indian prepaid SIM in Kashmir?",
        answer: "Prepaid SIM cards issued outside Jammu and Kashmir have historically not worked there. Check with your operator, and consider a local postpaid connection or a Wi-Fi-based plan."
      },
      {
        question: "Are there trains to Srinagar?",
        answer: "Yes. The rail link into the valley has opened in stages, and a Katra to Srinagar Vande Bharat began in 2025 and has since been extended to Jammu Tawi. Check IRCTC for the current timetable."
      }
    ],
    officialLinks: [
      { label: "Jammu and Kashmir Tourism", url: "https://www.jktourism.org" },
    ],
    sources: [
      { label: "PIB, Ministry of Railways: extended Srinagar-Katra Vande Bharat to Jammu Tawi (29 April 2026, read 9 November 2026)", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2256632&reg=3&lang=1" },
      { label: "Srinagar on Wikipedia", url: "https://en.wikipedia.org/wiki/Srinagar" },
      { label: "Dal Lake on Wikipedia", url: "https://en.wikipedia.org/wiki/Dal_Lake" },
      { label: "Mughal gardens in Kashmir on Wikipedia", url: "https://en.wikipedia.org/wiki/Mughal_gardens_in_Kashmir" },
      { label: "Udhampur Srinagar Baramulla Rail Link on Wikipedia", url: "https://en.wikipedia.org/wiki/Udhampur-Srinagar-Baramulla_Rail_Link" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "leh",
    name: "Leh",
    stateSlug: "ladakh",
    region: "north",
    tagline: "A high-altitude Buddhist town in the Indus valley, and the base for Ladakh's monasteries, passes and lakes.",
    categories: ["mountains", "adventure", "cultural", "religious"],
    coordinates: { lat: 34.1526, lng: 77.5771 },
    wikipediaTitle: "Leh",
    popular: true,
    hiddenGem: false,
    overview: [
      "Leh is the largest town in Ladakh, a union territory in the far north of India, at an altitude of about 3,500 m in the Indus valley. The landscape is high desert, with barren brown mountains and green strips along the river where barley and apricots grow. The old town, the former royal palace and the Tibetan Buddhist monasteries nearby give the area a distinctive character.",
      "Many of Ladakh's main sights lie within a day's drive: monasteries such as Thiksey, Hemis and Alchi, the Indus-Zanskar confluence near Nimmu, and the high-pass routes to Nubra Valley and Pangong Lake. Distances look short on the map but roads are slow, and some are rough or closed by snow for much of the year.",
      "Altitude is the main practical issue. Flying in from sea level means arriving at about 3,500 m within an hour or two, and acute mountain sickness (AMS) is common. Most operators and doctors advise resting for the first day or two, drinking water, avoiding alcohol and delaying trips to higher passes until you have adjusted.",
      "The tourist season runs roughly from late May to September, when the highways from Manali and Srinagar are open. In winter, Leh is cold and quiet, with many businesses closed, though it has a small number of visitors for festivals and winter activities. Pre-plan transport and accommodation, as supply is limited in peak months."
    ],
    history: [
      "Ladakh lay on trade routes between Central Asia, Tibet and India, and was influenced by Tibetan Buddhism from the eighth century onwards. The Namgyal dynasty rose in the fifteenth century, and King Sengge Namgyal built Leh Palace in the seventeenth century as his royal residence. Leh became a trading hub for caravans carrying pashmina, salt and silk.",
      "In 1834 the forces of Zorawar Singh, general to the Dogra ruler of Jammu, conquered Ladakh, and the region became part of the princely state of Jammu and Kashmir. After 1947 and the war that followed, part of the region came under Pakistani control, and the Line of Actual Control with China remains a source of tension, which is why the military presence is significant.",
      "Ladakh was opened to tourists in 1974. In October 2019 it became a separate union territory, administered directly by the central government and without a legislature, a status that local groups have continued to debate. The Ladakhi Buddhist, Muslim and other communities share the town, and tourism is a main source of income."
    ],
    attractions: [
      {
        name: "Leh Palace and old town",
        description: "A nine-storey palace built in the seventeenth century, partly in ruin, above the old town. Climb through the lanes behind it to the Namgyal Tsemo gompa for views. Altitude makes even short climbs tiring in the first days.",
        visitHours: 2.5,
        coordinates: { lat: 34.165, lng: 77.585 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Shanti Stupa",
        description: "A white-domed Buddhist peace stupa built in the 1990s on a ridge above Leh, reached by a road or a staircase of several hundred steps. It is well known for sunset and sunrise views, and the climb is demanding at altitude.",
        visitHours: 1.5,
        coordinates: { lat: 34.168, lng: 77.56 },
        interests: ["spiritual", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Thiksey Monastery",
        description: "A large monastery of the Gelug tradition, rising up a hillside about 20 km from Leh. Morning prayers are open to visitors who sit quietly at the back. Remove shoes and hats when asked, and avoid photographing inside prayer halls unless it is explicitly permitted.",
        visitHours: 2,
        coordinates: { lat: 34.0486, lng: 77.6702 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Hemis Monastery",
        description: "A large Drukpa Kagyu monastery in Ladakh, about 45 km from Leh, famed for its masked cham dances at the annual Hemis festival in summer. Dates follow the Tibetan lunar calendar and are announced locally.",
        visitHours: 2,
        coordinates: { lat: 33.917, lng: 77.7035 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Alchi Monastery",
        description: "A small eleventh-century monastery complex in the Indus valley with early Buddhist wall paintings. Photography inside is not allowed, and the interior is dim and small, so visits are brief.",
        visitHours: 1.5,
        coordinates: { lat: 34.2248, lng: 77.17 },
        interests: ["history", "culture", "spiritual"],
        timeOfDay: "any"
      },
      {
        name: "Nubra Valley via Khardung La",
        description: "A high-pass route north to a valley of sand dunes, villages and Diskit monastery. The road crosses a pass above 5,000 m, so acclimatise first. Permits are required and are normally arranged through the Leh administration or a travel agent.",
        visitHours: 8,
        coordinates: { lat: 34.278, lng: 77.604 },
        interests: ["adventure", "nature", "photography"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [5, 6, 7, 8, 9],
    bestTimeNote: "June to September is the main season, with the Manali and Srinagar highways open and warm days. Late May and early October can be quieter but colder, and passes may close with snow. Winters are very cold, with temperatures below minus 15 C at times, and many guesthouses close.",
    recommendedDays: { min: 5, max: 10 },
    budget: {
      budget: [1500, 3000],
      midRange: [4000, 8000],
      comfort: [10000, 25000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room, in the summer season. Covers lodging, local meals and shared local transport; private taxi hire for sightseeing adds substantially. Excludes flights, permits and environmental fees, and equipment hire."
    },
    gettingThere: {
      air: "Kushok Bakula Rimpochee Airport has daily domestic flights from Delhi in the season, with morning arrivals. Flights are weather-dependent, and at this altitude you should plan a rest day on arrival.",
      rail: "There is no rail line to Leh. The nearest railheads are Jammu Tawi and Chandigarh, far to the south; road journeys from there take two or more days.",
      road: "Two highways reach Leh: Srinagar to Leh via Zoji La, and Manali to Leh via Atal Tunnel and several high passes. Both are open only in summer, typically from around late May or June to October, and conditions change with weather. Overnight stops are required.",
      local: "Local taxis, shared vehicles and hire bikes are the main options. Taxi unions set fixed rates for sightseeing routes. Self-driving or biking requires experience on mountain roads and awareness of altitude."
    },
    accommodation: "Guesthouses and homestays in Changspa and the old town suit budget and mid-range travellers, while hotels with heaters and hot water are on Fort Road and outside town. Camps operate at Pangong and Nubra in summer. Book ahead for July and August, and check that heating and water are reliable in shoulder seasons.",
    cuisine: [
      { name: "Thukpa", note: "A noodle soup with vegetables or meat, filling in cold weather." },
      { name: "Momos", note: "Steamed or fried dumplings, widely available." },
      { name: "Skyu", note: "A hearty Ladakhi stew of wheat pasta with root vegetables." },
      { name: "Butter tea (gur gur chai)", note: "A salted tea with butter, served in homes and monasteries." },
      { name: "Apricot products", note: "Dried apricots, jam and oil are local specialities, especially in summer." }
    ],
    festivals: ["Hemis Tsechu (summer)", "Ladakh Festival (September)", "Losar (Ladakhi new year)", "Dosmoche"],
    festivalSlugs: ["hemis", "losar"],
    nearby: [
      { name: "Alchi", distanceKm: 65, note: "A small monastery complex with early wall paintings." },
      { name: "Lamayuru", distanceKm: 120, note: "A monastery with a striking moonlike landscape, on the Srinagar highway." },
      { name: "Nubra Valley (Diskit)", distanceKm: 120, note: "A high valley beyond Khardung La, with dunes and a large monastery." },
      { name: "Pangong Tso", distanceKm: 160, note: "A high-altitude lake, reached by a long and rough road; camping rules apply." },
      { name: "Spiti Valley", distanceKm: 400, note: "Another high Himalayan cold desert, reached by a Manali route.", destinationSlug: "spiti-valley" }
    ],
    precautions: [
      "Altitude sickness can be serious. Rest on arrival, drink water, avoid alcohol, and descend and seek medical help if symptoms such as severe headache, vomiting or confusion worsen.",
      "Do not go to higher passes or Pangong in your first 48 hours. Carry any medication your doctor advises, and note that hospital facilities are limited.",
      "Roads can be closed by landslides or snow, and mobile coverage is patchy. Allow buffer days in your itinerary and tell your hotel your plans.",
      "Sun exposure is strong at altitude. Wear sunscreen, sunglasses and a hat, and layer clothing for cold nights.",
      "Check permit requirements for restricted areas and carry multiple copies of your documents and photographs."
    ],
    tips: [
      "Plan at least two nights in Leh before heading to higher destinations.",
      "Ask monks before photographing inside monasteries, and dress modestly in prayer halls.",
      "Carry cash, as ATMs and card readers can fail and connectivity is limited.",
      "Bring a refillable bottle and use the water refill stations that some hotels offer to cut plastic waste.",
      "Book Nubra and Pangong permits and vehicles via the Leh authorities or an established agent."
    ],
    accessibility: "Access is difficult. Leh sits at high altitude, which affects anyone with heart, lung or mobility conditions. Monasteries often have steep stairs and uneven floors, and Shanti Stupa and Leh Palace involve climbs. Roads to higher destinations are rough. Step-free access is not confirmed at most sites.",
    responsibleTravel: "Water, waste and fragile mountain ecosystems are under strain from tourism. Use less water, avoid bottled water where possible, and take rubbish out from trekking areas. Support locally owned homestays and craftspeople. Respect monastic rules, do not touch religious objects and keep to marked trails.",
    permits: "Foreign nationals need a Protected Area Permit for restricted areas such as Nubra Valley and Pangong Tso and must typically travel through a registered agent. The Leh district permit portal says the Inner Line Permit applies to foreign tourists only; Indian visitors register on the portal and pay environmental and other fees. Rules and fees change, so apply through the Leh administration's official portal or a licensed agent, and check before you travel.",
    faqs: [
      {
        question: "How long should I rest after arriving in Leh?",
        answer: "Most guidance recommends taking it easy for at least the first day and not going to higher passes for 48 hours. Individual responses vary, and symptoms that worsen need medical attention."
      },
      {
        question: "Which road to Leh is better, from Manali or from Srinagar?",
        answer: "The Manali route is higher and rougher, and takes two days. The Srinagar route is lower and gives a gentler acclimatisation, but depends on security conditions and snow clearance at Zoji La. Both are seasonal."
      },
      {
        question: "Can I visit Leh in winter?",
        answer: "Yes, but it is very cold, many businesses close and road routes are blocked. Flights operate, though weather can disrupt them. Winter suits those interested in culture, quiet and winter treks, with proper equipment."
      },
      {
        question: "Do I need permits for Leh town itself?",
        answer: "Not for the town itself. Foreign nationals need a Protected Area Permit for areas such as Nubra and Pangong, and Indian visitors register on the Leh district portal and pay fees. Check the current system before travel."
      }
    ],
    officialLinks: [
      { label: "Leh District Tourist Management System (permits and fees)", url: "https://www.lahdclehpermit.in/" },
      { label: "District Leh, Ladakh: tourism", url: "https://leh.nic.in/tourism/" },
    ],
    sources: [
      { label: "Leh District Tourist Management System: FAQ (read 9 November 2026)", url: "https://www.lahdclehpermit.in/faq/" },
      { label: "Leh on Wikipedia", url: "https://en.wikipedia.org/wiki/Leh" },
      { label: "Ladakh on Wikipedia", url: "https://en.wikipedia.org/wiki/Ladakh" },
      { label: "Leh Palace on Wikipedia", url: "https://en.wikipedia.org/wiki/Leh_Palace" },
      { label: "Altitude sickness on Wikipedia", url: "https://en.wikipedia.org/wiki/Altitude_sickness" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "spiti-valley",
    name: "Spiti Valley",
    stateSlug: "himachal-pradesh",
    region: "north",
    tagline: "A high Himalayan cold desert of old Buddhist monasteries, small villages and thin air.",
    categories: ["mountains", "adventure", "village", "cultural", "hidden-gems"],
    coordinates: { lat: 32.2253, lng: 78.0714 },
    wikipediaTitle: "Spiti Valley",
    popular: false,
    hiddenGem: true,
    overview: [
      "Spiti is a high valley in northern Himachal Pradesh, along the Spiti River and bordering Tibet. The name is often translated as the middle land, between India and Tibet. Villages stand at altitudes between about 3,500 and 4,500 m, built of mud and stone in a landscape of steep brown cliffs, terraced barley fields and snow peaks.",
      "Kaza, the administrative town at about 3,800 m, is the base for most visitors. From it, day trips go to Key Monastery, Kibber, Langza, Komic and Hikkim, and routes continue to Dhankar, Tabo and Pin Valley National Park. Tabo Monastery, founded in 996 CE, is one of the oldest continuously operating Buddhist centres in the Himalayas.",
      "The valley can be reached by two routes. From Shimla through Kinnaur it is open for much of the year, though landslides are frequent. From Manali across Kunzum La and past Chandratal Lake it is open only from about June to October. A circuit using both is common, and travel times are long.",
      "Facilities are basic. Homestays, small guesthouses and a few hotels provide lodging, electricity may be limited and mobile coverage is patchy. Cash, warm clothing and patience are all sensible. The pace of travel is slow, and altitude sickness is a real risk for anyone who ascends quickly."
    ],
    history: [
      "Spiti has been home to Tibetan Buddhist communities for around a thousand years. Tabo Monastery was founded in 996 CE by the translator Rinchen Zangpo, and its wall paintings and sculptures are held in high regard. Dhankar, once the seat of local rulers known as nonos, is a fort-monastery perched on a cliff.",
      "The valley has historically been tied to Ladakh, Tibet and later Kullu and Bushahr. It came under Sikh and then British influence in the nineteenth century, and became part of India's Himachal Pradesh after independence. The Chinese border to the east has made the area strategically sensitive, and for decades access was restricted.",
      "Spiti opened to tourists in the early 1990s, and visitor numbers have grown quickly in recent years, bringing roads, homestays and income but also pressure on water, waste and fragile village life. The Spiti Valley's communities largely follow Tibetan Buddhism, and the lama and local councils guide many aspects of life."
    ],
    attractions: [
      {
        name: "Key Monastery",
        description: "A large Gelug monastery of whitewashed cells stacked on a hill above the Spiti River, about 14 km from Kaza. Visitors can see prayer halls and the monks' quarters. Remove shoes, dress modestly and ask before photographing inside. The monastery has been hit by earthquakes and fire in the past.",
        visitHours: 1.5,
        coordinates: { lat: 32.2987, lng: 78.0108 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Kibber and Langza",
        description: "High villages near Kaza at over 4,000 m. Langza is known for marine fossils from the ancient Tethys Sea found in the surrounding slopes. Both have homestays. Take the altitude seriously and do not collect fossils, which is illegal in protected zones.",
        visitHours: 3,
        coordinates: { lat: 32.334, lng: 78.012 },
        interests: ["nature", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Tabo Monastery",
        description: "A monastery complex founded in 996 CE, known for its painted interiors and clay sculptures. Photography inside is not allowed, and the buildings are fragile. Mud-brick structures are protected by the Archaeological Survey of India.",
        visitHours: 1.5,
        coordinates: { lat: 32.093, lng: 78.389 },
        interests: ["history", "spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Dhankar Monastery and Lake",
        description: "A cliff-top monastery above the confluence of the Spiti and Pin rivers, with a steep walk to a small lake above. Roads are narrow and cliff-edged. The old building is in poor repair, with a newer monastery below.",
        visitHours: 2,
        coordinates: { lat: 32.0967, lng: 78.2162 },
        interests: ["spiritual", "history", "photography"],
        timeOfDay: "afternoon"
      },
      {
        name: "Chandratal Lake",
        description: "A high-altitude lake at around 4,300 m, reached by a rough road from Kunzum La. It is a protected wetland, and camping rules limit use close to the shore. The road is open only in summer and gives wide views of the surrounding peaks.",
        visitHours: 4,
        coordinates: { lat: 32.476, lng: 77.618 },
        interests: ["nature", "photography", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Pin Valley National Park",
        description: "A cold desert park that is home to snow leopards and ibex, with small villages at the edge. Wildlife sightings are rare and generally need guides and winter visits. Check the forest department for any entry rules.",
        visitHours: 4,
        interests: ["wildlife", "nature"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [6, 7, 8, 9, 10],
    bestTimeNote: "June to September is the main season, with both routes open and relatively mild weather, although the Manali side can still see landslides in July and August. October is cold but clear. Winter, from November to April, is extremely cold, with heavy snow, limited services and a few visitors, mainly for snow leopard tours.",
    recommendedDays: { min: 5, max: 8 },
    budget: {
      budget: [1500, 2800],
      midRange: [3500, 6500],
      comfort: [8000, 16000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room, in the summer season, with homestay or basic hotel lodging. Covers meals and shared local transport. Hiring a private vehicle for the circuit adds considerably. Excludes transport to the valley and permit costs."
    },
    gettingThere: {
      air: "There are no commercial flights to Spiti. The nearest airports are Bhuntar (Kullu), Shimla and Chandigarh, all far away by mountain road.",
      rail: "There is no rail connection. The nearest railheads are Shimla (narrow gauge) and Chandigarh or Kalka, with long road onward journeys.",
      road: "The Shimla to Kaza route via Kinnaur is long (around 410 km) and subject to landslides. The Manali to Kaza route via Kunzum La (around 200 km) opens only in summer and is rough. Both need local drivers who know the road.",
      local: "Shared taxis and a few buses connect Kaza to villages. Private cars with local drivers are the usual way to see monasteries. Fuel is limited, with the main pump at Kaza, so plan carefully."
    },
    accommodation: "Homestays in villages such as Langza, Kibber and Komic offer shared rooms and meals, and Kaza has a range of guesthouses and a few hotels. Camps operate near Chandratal in season. Facilities are basic, with limited heating and sometimes dry toilets, so carry a sleeping bag liner and warm layers. Book ahead in July and August.",
    cuisine: [
      { name: "Thukpa and momos", note: "Noodle soup and dumplings, common in Kaza's cafes." },
      { name: "Tsampa", note: "Roasted barley flour, a traditional staple, eaten as porridge or in tea." },
      { name: "Butter tea", note: "A salted tea with butter, offered in monasteries and homes." },
      { name: "Chhang", note: "A local barley beer, usually offered at festivals and in homes. Drink in moderation, especially at altitude." },
      { name: "Siddu", note: "A steamed wheat bread, often stuffed, which is a common homestay meal." }
    ],
    festivals: ["Losar (Tibetan new year)", "Chham dance festivals at monasteries", "Ladarcha Fair (August)"],
    festivalSlugs: ["losar"],
    nearby: [
      { name: "Tabo", distanceKm: 45, note: "A thousand-year-old monastery town on the Kaza road." },
      { name: "Chandratal Lake", distanceKm: 95, note: "A high lake on the Manali route, open in summer only." },
      { name: "Nako and Kinnaur", distanceKm: 100, note: "A village and lake on the Kinnaur route to Shimla." },
      { name: "Manali", distanceKm: 200, note: "The Kullu valley town at the other end of the Kunzum route.", destinationSlug: "manali" },
      { name: "Leh", distanceKm: 400, note: "A cold-desert destination reached from Manali by a seasonal highway.", destinationSlug: "leh" }
    ],
    precautions: [
      "Altitude sickness is a serious risk. Ascend gradually, rest, drink water, avoid alcohol, and descend if symptoms worsen. Medical facilities in the valley are basic.",
      "Landslides and road closures are common, especially from July to September; keep your itinerary flexible and allow extra days.",
      "ATMs and card payment can be unreliable and fuel is scarce; carry enough cash and plan fuel stops.",
      "Mobile networks are patchy, so share your itinerary and download offline maps.",
      "Roads are narrow and exposed. Drive only with experienced local drivers and avoid night driving."
    ],
    tips: [
      "Spend a night at Kaza or lower before going to villages above 4,000 m.",
      "Ask permission before photographing monks, houses and prayer wheels, and walk clockwise around stupas and mani walls.",
      "Carry a water filter or purification tablets and a refillable bottle to reduce plastic waste.",
      "Book homestays with locally owned operators, and pay fair rates for meals.",
      "Pack layers, sunscreen and a headlamp; nights are cold even in summer."
    ],
    accessibility: "Access is very difficult. The valley is at high altitude, with long rough roads, steep monastery stairs and basic facilities. Few buildings have ramps, and step-free access is not confirmed. People with heart or lung conditions, or reduced mobility, should seek medical advice before planning a visit.",
    responsibleTravel: "Spiti is fragile. Water is scarce, waste is a serious problem and village life is under pressure from visitor numbers. Carry out your rubbish, avoid plastic bottles, respect monastery rules and do not remove fossils or rocks. Choose homestays that share income with the community and keep noise and drone use to a minimum.",
    permits: "Rules on permits for the Spiti route have changed over the years and differ for Indian and foreign nationals, especially on the Kinnaur stretch near the border. Confirm current requirements with the Himachal Pradesh authorities or the Kaza administration before travel, and carry photo identification.",
    faqs: [
      {
        question: "When is Spiti open?",
        answer: "The Shimla route is usually open for much of the year but is prone to landslides and snow. The Manali route via Kunzum La is open only from around June to October."
      },
      {
        question: "Is a permit needed for Spiti?",
        answer: "Rules have varied, particularly for foreign visitors on the Kinnaur section. Check with the Himachal Pradesh authorities before travel."
      },
      {
        question: "How many days do I need?",
        answer: "A minimum of five days lets you see Kaza, Key, Kibber and Langza with some acclimatisation. A circuit including Tabo, Dhankar and Chandratal takes about a week or more."
      },
      {
        question: "Is Spiti suitable for children or older travellers?",
        answer: "The altitude, long drives and basic facilities make it hard for young children and travellers with health conditions. Consult a doctor and allow extra time for acclimatisation."
      }
    ],
    officialLinks: [
      { label: "Himachal Pradesh Tourism", url: "https://himachaltourism.gov.in" },
    ],
    sources: [
      { label: "Spiti Valley on Wikipedia", url: "https://en.wikipedia.org/wiki/Spiti_Valley" },
      { label: "Tabo Monastery on Wikipedia", url: "https://en.wikipedia.org/wiki/Tabo_Monastery" },
      { label: "Key Monastery on Wikipedia", url: "https://en.wikipedia.org/wiki/Key_Monastery" },
      { label: "Pin Valley National Park on Wikipedia", url: "https://en.wikipedia.org/wiki/Pin_Valley_National_Park" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "manali",
    name: "Manali",
    stateSlug: "himachal-pradesh",
    region: "north",
    tagline: "A Beas valley hill town that serves as a base for mountain passes, treks and adventure sports.",
    categories: ["hill-stations", "mountains", "adventure", "weekend"],
    coordinates: { lat: 32.2396, lng: 77.1887 },
    wikipediaTitle: "Manali, Himachal Pradesh",
    popular: true,
    hiddenGem: false,
    overview: [
      "Manali is a hill town at about 2,050 m in the Kullu district of Himachal Pradesh, on the Beas River. It lies at the northern end of the Kullu valley, with deodar and pine forests on the slopes and snow peaks beyond. The town has two parts: the commercial Mall Road and new town, and Old Manali across the river, with cafes, guesthouses and apple orchards.",
      "The main activities are day trips and adventure: Solang Valley for paragliding and, in winter, snow activities, the Rohtang Pass route, Beas River rafting, treks into the Parvati and Solang valleys, and the temples and hot springs of Vashisht and Hadimba. Naggar and its castle, about 20 km south, give a more peaceful base.",
      "Since the Atal Tunnel opened in 2020, the road north to Lahaul and Spiti has become much faster. The tunnel runs under Rohtang Pass and is open through winter for most of the time, giving year-round access to Sissu and Keylong when conditions allow. Rohtang Pass itself is open only in the warmer months and needs a permit for vehicles.",
      "Manali is crowded in peak seasons, particularly May to June and December to January, when traffic, noise and prices rise. Construction on slopes and the monsoon landslides of recent years have exposed how fragile the valley is. Visitors in July and August should be ready for road closures."
    ],
    history: [
      "The Kullu valley was once the Kingdom of Kulut, a small Himalayan state with its capital at Naggar and later Sultanpur, now Kullu town. The name Manali is linked to the sage Manu, with a temple dedicated to him in Old Manali. The Hadimba Temple, a wooden shrine in a deodar forest, dates to the sixteenth century.",
      "Under the British, Kullu became a hill district in the nineteenth century, and the Mandi-Kullu road opened up the region to orchards, especially apples, which became a major part of the local economy. Manali was a small village for most of this period, visited by a few travellers and mountaineers.",
      "Tourism grew from the 1960s and 1970s, when travellers on the hippie trail and Indian honeymooners discovered it. The Manali-Leh highway was built for military reasons, opening the route to Ladakh. The area has expanded rapidly since, with the 2020 Atal Tunnel and widening of roads bringing more visitors and development pressure."
    ],
    attractions: [
      {
        name: "Hadimba Devi Temple",
        description: "A wooden temple of 1553 in a deodar forest, dedicated to Hidimbi, a figure from the Mahabharata. The pagoda-style building has carved doors and a tiered roof. It is crowded in season and photography rules vary near the sanctum.",
        visitHours: 1,
        coordinates: { lat: 32.248, lng: 77.18 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Old Manali",
        description: "A village-like area across the Beas with cafes, shops and apple orchards, reached by a bridge. It is popular with younger travellers and a good base for walks. Weekend evenings can be loud.",
        visitHours: 2,
        coordinates: { lat: 32.25, lng: 77.185 },
        interests: ["food", "relaxation", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Solang Valley",
        description: "A meadow valley about 14 km from Manali, used for paragliding, zorbing and winter sports. Activity operators are many, and quality varies. Use operators with government registration and safety equipment, and check weather before booking flights.",
        visitHours: 3,
        coordinates: { lat: 32.317, lng: 77.158 },
        interests: ["adventure", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Vashisht hot springs and temple",
        description: "A village about 3 km from Manali with sulphur springs and old stone temples. The baths are popular after treks. Public bathing arrangements are basic, and the lanes are steep and narrow.",
        visitHours: 1.5,
        coordinates: { lat: 32.264, lng: 77.191 },
        interests: ["relaxation", "spiritual"],
        timeOfDay: "any"
      },
      {
        name: "Rohtang Pass",
        description: "A high pass at about 3,980 m on the way to Lahaul. Access for vehicles is by permit, with daily limits and seasonal opening, usually from May or June to October or November. Check the current permit rules and weather before booking.",
        visitHours: 6,
        coordinates: { lat: 32.3716, lng: 77.2466 },
        interests: ["nature", "adventure", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Naggar Castle and Roerich Art Gallery",
        description: "A fifteenth-century stone-and-timber castle, now a heritage hotel, and the former home of the painter Nicholas Roerich. It sits on the east bank of the Beas, with a quieter atmosphere than Manali. Check opening days for the gallery.",
        visitHours: 2,
        coordinates: { lat: 32.1236, lng: 77.1744 },
        interests: ["history", "culture", "photography"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [3, 4, 5, 6, 9, 10, 12],
    bestTimeNote: "April to June is the main season, with mild days and open passes. September and October bring clear skies and apple harvests. December to February has snow and winter sports, but cold and road disruption. July and August bring heavy rain and landslides, and travel by road can be risky.",
    recommendedDays: { min: 3, max: 5 },
    budget: {
      budget: [1200, 2500],
      midRange: [3500, 7000],
      comfort: [9000, 22000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals and shared local transport. Adventure activities, Rohtang permits and private taxi sightseeing add to the cost. Peak-season hotel rates in May to June and December can be double those in shoulder months."
    },
    gettingThere: {
      air: "Kullu-Manali Airport at Bhuntar is about 50 km away, with limited flights from Delhi and Chandigarh. Weather can cause cancellations. Chandigarh is the main alternative.",
      rail: "There is no railway to Manali. The nearest broad-gauge stations are Chandigarh and Kiratpur Sahib, and the narrow-gauge line reaches Joginder Nagar. Most visitors arrive by overnight bus or taxi.",
      road: "Manali is about 530 km from Delhi and 310 km from Chandigarh by road. Buses, including overnight services, run from Delhi and Chandigarh. Travel through Mandi is subject to landslides in the monsoon.",
      local: "Taxis operate on fixed local rates, and local buses run to Solang and Naggar. Walking is possible within the town and Old Manali. Rohtang taxis need a permit."
    },
    accommodation: "The Mall Road and new town have hotels in every price range, while Old Manali and Vashisht have guesthouses and cafes. Naggar and Kasol offer quieter bases. Book ahead for May, June and the New Year period. In winter, check that your hotel has heating and that its access road is clear.",
    cuisine: [
      { name: "Siddu", note: "A steamed wheat bread, stuffed with poppy seeds or nuts and served with ghee." },
      { name: "Trout", note: "River trout from Himachal Pradesh farms, commonly grilled or fried." },
      { name: "Dham", note: "A traditional Himachali feast of rice, lentils and curries, usually served at festivals." },
      { name: "Tibetan food", note: "Momos and thukpa are widely available, reflecting nearby Tibetan communities." },
      { name: "Apple products", note: "Apples, cider and jam are produced in the valley and sold in shops." }
    ],
    festivals: ["Winter Carnival", "Dussehra at Kullu (October)", "Manali Fagli (February)"],
    festivalSlugs: ["makar-sankranti"],
    nearby: [
      { name: "Solang Valley", distanceKm: 14, note: "A meadow and adventure activity area." },
      { name: "Naggar", distanceKm: 21, note: "A castle village with an art gallery and quieter lodging." },
      { name: "Kasol and Parvati Valley", distanceKm: 75, note: "A river valley with treks, hot springs and busy cafes." },
      { name: "Keylong and Lahaul", distanceKm: 115, note: "A high valley reached through the Atal Tunnel." },
      { name: "Spiti Valley", distanceKm: 200, note: "A high cold desert beyond Kunzum La, open in summer.", destinationSlug: "spiti-valley" }
    ],
    precautions: [
      "Monsoon rains cause landslides and flash floods, notably in July and August; avoid travel on mountain roads in heavy rain.",
      "Check that adventure operators are registered and that safety equipment and pilots are certified before paragliding or rafting.",
      "Avoid swimming or standing near fast rivers, as the Beas is cold and swift; people have drowned and been swept away.",
      "Altitude at Rohtang and beyond can cause headaches for some travellers; ascend gradually.",
      "Hotel and taxi prices spike in peak periods; confirm rates in advance and use registered taxi counters."
    ],
    tips: [
      "Use the Atal Tunnel for Lahaul day trips if Rohtang permits are unavailable.",
      "Book Rohtang permits online through the official portal as far in advance as the system allows.",
      "Stay in Naggar or Vashisht for a calmer atmosphere than the Mall Road.",
      "Take a light waterproof and layers year-round, as weather changes quickly in the mountains.",
      "Respect local temples, remove shoes and ask before photographing worshippers."
    ],
    accessibility: "Manali's town centre has some flat stretches, but Old Manali, Vashisht and temple approaches have steps and slopes. Adventure activities need good mobility. The roads to higher destinations are rough and winding. Step-free access is not confirmed at most attractions.",
    responsibleTravel: "The valley faces waste, traffic and construction pressure. Avoid single-use plastic, do not litter on treks, and use registered operators. Buy local products, respect forest rules around camping, and keep noise and drone use down, particularly in villages and near temples.",
    permits: "Vehicles travelling to Rohtang Pass have needed a permit issued online by the Himachal Pradesh authorities, with daily limits; confirm the current rule with the Kullu district administration or Himachal Pradesh Tourism. The Atal Tunnel route to Lahaul has not used the Rohtang permit. Foreign nationals going beyond Lahaul may need additional permission, so check before travel.",
    faqs: [
      {
        question: "Do I need a permit for Rohtang Pass?",
        answer: "Vehicles have needed one, with a limited number issued per day through an online system. Rules and the pass's opening dates change, so check with the Kullu district administration before booking."
      },
      {
        question: "What is the Atal Tunnel?",
        answer: "A tunnel of about 9 km under Rohtang Pass, opened in 2020, which provides a faster, year-round route to Lahaul when roads are clear."
      },
      {
        question: "Is Manali good in winter?",
        answer: "Yes for snow, but expect cold, short days and some road closures. Check that your hotel has heating and that your route is open."
      },
      {
        question: "How do I get from Manali to Spiti or Leh?",
        answer: "Both routes use the Manali highway and are open only in summer. Allow extra days for weather delays and check road conditions locally."
      }
    ],
    officialLinks: [
      { label: "Himachal Pradesh Tourism", url: "https://himachaltourism.gov.in" },
    ],
    sources: [
      { label: "Manali, Himachal Pradesh on Wikipedia", url: "https://en.wikipedia.org/wiki/Manali,_Himachal_Pradesh" },
      { label: "Atal Tunnel on Wikipedia", url: "https://en.wikipedia.org/wiki/Atal_Tunnel" },
      { label: "Rohtang Pass on Wikipedia", url: "https://en.wikipedia.org/wiki/Rohtang_Pass" },
      { label: "Hadimba Temple on Wikipedia", url: "https://en.wikipedia.org/wiki/Hidimba_Devi_Temple" }
    ],
    lastReviewed: "2026-11-09"
  },
  {
    slug: "rishikesh",
    name: "Rishikesh",
    stateSlug: "uttarakhand",
    region: "north",
    tagline: "A Ganga town below the Himalayan foothills, known for yoga, ashrams and river rafting.",
    categories: ["religious", "adventure", "cultural", "weekend"],
    coordinates: { lat: 30.0869, lng: 78.2676 },
    wikipediaTitle: "Rishikesh",
    popular: true,
    hiddenGem: false,
    overview: [
      "Rishikesh lies where the Ganga leaves the Himalayan foothills and enters the plains, in the Dehradun district of Uttarakhand. The river is cold, clear and fast here, flowing between forested hills. Temples and ashrams line both banks, and the town is a gateway for pilgrims heading to the Char Dham shrines in the mountains.",
      "It is widely known as a centre for yoga and meditation, with many ashrams, schools and retreats. The International Yoga Festival is held each March, and teacher training courses attract students from around the world. Quality varies a great deal, so check the credentials and reviews of any school before signing up for a long course.",
      "Adventure tourism is the other pillar. White-water rafting on the Ganga runs on stretches upstream of the town, with grades from gentle to challenging, and the season generally runs from autumn to spring. Bungee jumping, camping and treks are also offered, with operators regulated by the state.",
      "The central area is compact and busy. Laxman Jhula and Ram Jhula, the two suspension bridges, have long been the focus of the tourist area, along with the evening Ganga aarti at Triveni Ghat and Parmarth Niketan. The town is considered holy, and sale of alcohol and non-vegetarian food is restricted in the central temple area."
    ],
    history: [
      "Rishikesh appears in Hindu tradition as a place of austerity and meditation, and the name is linked to Vishnu as Hrishikesha. Sages are said to have performed penance here, and the surrounding forests have long been associated with renunciation. The temples of Bharat Mandir and Laxman are among the older shrines in the area.",
      "In the nineteenth and twentieth centuries the town developed as an ashram centre. Swami Sivananda founded the Divine Life Society here in 1936, and his teachings spread yoga across the world. The Beatles' 1968 visit to the ashram of Maharishi Mahesh Yogi helped bring the town international attention, and the ashram, now abandoned, has been reopened as a tourist site.",
      "Uttarakhand was created from Uttar Pradesh in 2000, and Rishikesh has since grown fast. The Char Dham highway improvements and the planned rail line to Karnaprayag have boosted pilgrim and tourist traffic, while concerns about river pollution, waste and overcrowding have followed."
    ],
    attractions: [
      {
        name: "Laxman Jhula",
        description: "A suspension bridge across the Ganga, long a landmark of the northern part of town. The old bridge was closed to pedestrians on safety grounds in 2024; check current status and alternative crossings with local authorities before relying on it.",
        visitHours: 1,
        coordinates: { lat: 30.1264, lng: 78.3267 },
        interests: ["photography", "culture"],
        timeOfDay: "any"
      },
      {
        name: "Triveni Ghat aarti",
        description: "An evening fire ceremony on the riverbank, with singing and lamps floated on the water. It draws large crowds. Arrive early, leave footwear at the designated place and keep valuables secure.",
        visitHours: 1.5,
        coordinates: { lat: 30.1013, lng: 78.2967 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Ashrams and yoga classes",
        description: "Parmarth Niketan, Sivananda Ashram and many smaller centres offer drop-in classes, satsangs and meditation. Dress modestly, observe silence where asked, and check whether classes are open to visitors.",
        visitHours: 2,
        interests: ["spiritual", "relaxation", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "White-water rafting",
        description: "Trips on the Ganga run on stretches upstream from the town, with several grades. Rafting is generally restricted in the monsoon and operators must be registered. Wear a life jacket, follow the guide's safety briefing and confirm the stretch and grade before booking.",
        visitHours: 4,
        interests: ["adventure", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Beatles Ashram (Chaurasi Kutia)",
        description: "The abandoned ashram of Maharishi Mahesh Yogi, with domed meditation cells and graffiti murals, inside Rajaji Tiger Reserve. Entry is ticketed, and the area is part of a protected forest, so follow rules about littering and graffiti.",
        visitHours: 1.5,
        interests: ["culture", "photography", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Neer Garh Waterfall",
        description: "A forest waterfall reached by a short walk from the Laxman Jhula side. The rocks are slippery and the water can rise quickly after rain. Check conditions locally before bathing.",
        visitHours: 2,
        interests: ["nature", "relaxation"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [2, 3, 4, 9, 10, 11],
    bestTimeNote: "February to April and September to November are comfortable for sightseeing and yoga. The rafting season runs roughly from September to June, with water levels highest in spring. Summer is hot, and July to August brings monsoon rain, river floods and restrictions on rafting.",
    recommendedDays: { min: 2, max: 4 },
    budget: {
      budget: [1000, 2200],
      midRange: [3000, 6000],
      comfort: [8000, 18000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, simple vegetarian meals and local transport. Rafting, yoga courses and retreats are extra and vary widely. Excludes transport to Rishikesh."
    },
    gettingThere: {
      air: "Jolly Grant Airport near Dehradun, about 20 km from Rishikesh, has flights from Delhi and other cities. Taxis connect to the town.",
      rail: "Yog Nagari Rishikesh station has limited services, while Haridwar Junction, about 25 km away, has better connections from Delhi. Check train timetables on IRCTC.",
      road: "Rishikesh is about 240 km from Delhi, connected by national highway through Haridwar. Buses run from Delhi's Kashmere Gate and other terminals.",
      local: "Autos, shared tempos and e-rickshaws serve the town, and walking is the best way to see the ghats. Taxis are needed for rafting start points and outer attractions."
    },
    accommodation: "Ashram guesthouses, budget hostels and homestays are the main options around the ghats and Tapovan. Resorts and riverside camps operate along the highway upriver. Ashram stays often come with rules on meals, timings and dress, so check these before booking.",
    cuisine: [
      { name: "Vegetarian thalis", note: "Simple dal, vegetables and rice, widely available in ashram kitchens and small restaurants." },
      { name: "Aloo puri", note: "Potato curry with fried bread, a popular breakfast." },
      { name: "Chaat and lassi", note: "Street snacks and yoghurt drinks sold around the main bridges." },
      { name: "Garhwali dishes", note: "Local foods such as kafuli and jhangora kheer appear on some menus." },
      { name: "Cafes", note: "Many cafes serve international vegetarian food, with variable quality." }
    ],
    festivals: ["International Yoga Festival (March)", "Maha Shivaratri", "Makar Sankranti", "Kumbh Mela at nearby Haridwar"],
    festivalSlugs: ["makar-sankranti", "kumbh-mela", "diwali"],
    nearby: [
      { name: "Haridwar", distanceKm: 25, note: "A pilgrimage city on the Ganga, known for the Har Ki Pauri aarti and the Kumbh Mela." },
      { name: "Dehradun", distanceKm: 45, note: "The state capital, with forest and military institutions." },
      { name: "Mussoorie", distanceKm: 80, note: "A hill station in the lower Himalayas." },
      { name: "Devprayag", distanceKm: 70, note: "The confluence of the Bhagirathi and Alaknanda rivers, which form the Ganga." },
      { name: "Valley of Flowers", distanceKm: 300, note: "A high Himalayan valley reached via Joshimath and Govindghat.", destinationSlug: "valley-of-flowers" }
    ],
    precautions: [
      "Check that rafting and bungee operators are registered and follow safety standards. Do not raft during monsoon or high water levels.",
      "The Ganga is cold and powerful. Swim only in designated ghats and never alone, as drowning accidents occur every year.",
      "Be cautious about yoga teacher training schools with inflated claims. Read independent reviews before paying in advance.",
      "Monkeys are common around the bridges and ghats; do not carry exposed food or feed them.",
      "Alcohol and non-vegetarian food are restricted in the central area, so check local rules and dietary expectations."
    ],
    tips: [
      "Arrive early at Triveni Ghat for aarti and keep valuables secure.",
      "Dress modestly when entering ashrams and temples, with shoulders and knees covered.",
      "Book rafting through a registered operator and confirm the stretch, grade and safety equipment.",
      "Consider staying in quieter areas such as Tapovan or the hills for more peaceful surroundings.",
      "Stay on marked paths in the Rajaji Tiger Reserve and do not leave litter."
    ],
    accessibility: "Access is limited. The ghats have steep steps, the bridges are narrow and crowded, and many ashrams and cafes are reached by stairs or slopes. Rafting needs good mobility. Step-free access is not confirmed at most sites.",
    responsibleTravel: "The Ganga is a sacred and fragile river. Do not use soap or shampoo in it, do not throw waste or flowers wrapped in plastic into the water, and use refill stations. Observe the town's restrictions on alcohol and meat, and respect worshippers at the ghats. Choose rafting and trekking operators who manage waste responsibly.",
    faqs: [
      {
        question: "When can I go rafting?",
        answer: "The season runs roughly from September to June, with the monsoon months generally closed for safety. Rules are set by the local authorities, so check with your operator."
      },
      {
        question: "Is Rishikesh vegetarian only?",
        answer: "Alcohol and non-vegetarian food are restricted in the central temple area, though they may be available in surrounding areas. Check rules locally."
      },
      {
        question: "Is the Laxman Jhula open?",
        answer: "The old bridge was closed to pedestrians in 2024 for safety reasons. Check current arrangements locally before planning your route."
      },
      {
        question: "How do I choose a yoga school?",
        answer: "Look for independent reviews, teachers with documented training and clear course terms. Avoid paying large sums in advance without a refund policy."
      }
    ],
    officialLinks: [{ label: "Uttarakhand Tourism", url: "https://uttarakhandtourism.gov.in/" }],
    sources: [
      { label: "Rishikesh on Wikipedia", url: "https://en.wikipedia.org/wiki/Rishikesh" },
      { label: "Laxman Jhula on Wikipedia", url: "https://en.wikipedia.org/wiki/Lakshman_Jhula" },
      { label: "Chaurasi Kutia on Wikipedia", url: "https://en.wikipedia.org/wiki/Chaurasi_Kutia" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "valley-of-flowers",
    name: "Valley of Flowers",
    stateSlug: "uttarakhand",
    region: "north",
    tagline: "A high Himalayan valley of alpine meadows that flowers in the monsoon, reached by trek from Govindghat.",
    categories: ["national-parks", "mountains", "adventure", "photography"],
    coordinates: { lat: 30.728, lng: 79.605 },
    wikipediaTitle: "Valley of Flowers National Park",
    popular: false,
    hiddenGem: true,
    overview: [
      "The Valley of Flowers National Park is in the Chamoli district of Uttarakhand, at altitudes between about 3,200 and 6,700 m. The main valley, around 10 km long and a few kilometres wide, is a glacial valley of alpine meadows, streams and snow peaks. It is part of the Nanda Devi and Valley of Flowers National Parks, a UNESCO World Heritage Site, and sits in the Pushpawati River's catchment.",
      "The valley is known for its flowers, which bloom in a sequence from late June through September, with the peak usually in July and August. Species include primulas, anemones, geraniums, orchids and many others, and the valley is also home to Himalayan wildlife such as the Himalayan musk deer and the elusive snow leopard, though sightings are rare.",
      "Reaching the valley takes effort. From Govindghat on the Rishikesh-Badrinath highway, a trek of about 13 km leads to the village of Ghangaria, the base camp. From there, the valley entrance is another 3 to 4 km, and a day visit of several hours is the norm. There is no road, and the paths are steep and often wet in the monsoon.",
      "Only day visits are allowed in the national park, and there is no overnight camping inside it. Ghangaria has simple lodges, and the nearby Hemkund Sahib, a Sikh pilgrimage site, shares the trail, bringing many pilgrims in season. The valley is open for a limited season, and access can be closed by landslides or heavy rain, so flexibility is essential."
    ],
    history: [
      "The valley was known to local people, who regarded it as the home of fairies and avoided it. In 1931 the British mountaineer Frank Smythe, returning from an expedition to Kamet, stumbled on it and later wrote a well-known book describing its flowers. A botanist, Joan Margaret Legge, died in the valley in 1939 while collecting plants, and a memorial to her stands there.",
      "The Indian government designated the area a national park in 1982, restricting grazing and camping to protect the flora. Together with the Nanda Devi National Park, it was inscribed as a UNESCO World Heritage Site in 1988 and extended in 2005, as the Nanda Devi and Valley of Flowers National Parks.",
      "The region has faced pressure from tourism, climate change and invasive plants, and flash floods and landslides have damaged paths and bridges. The 2013 Uttarakhand floods destroyed parts of the Govindghat to Ghangaria route and the valley was closed for a period. Conservation work continues to manage visitor numbers and habitat."
    ],
    attractions: [
      {
        name: "Valley of Flowers National Park",
        description: "The main valley, reached by a trail from Ghangaria. Visitors are limited to a day trip with entry permits issued by the forest department, and are expected to stay on marked paths and leave before the afternoon. Check dates and fees with the forest department.",
        visitHours: 6,
        coordinates: { lat: 30.728, lng: 79.605 },
        interests: ["nature", "photography", "adventure"],
        timeOfDay: "morning"
      },
      {
        name: "Ghangaria",
        description: "A small trekking village at about 3,000 m with lodges, a gurdwara and tea stalls. It is the base for both the valley and Hemkund Sahib. Facilities are basic, and electricity and mobile coverage are limited.",
        visitHours: 12,
        coordinates: { lat: 30.7, lng: 79.571 },
        interests: ["nature", "adventure"],
        timeOfDay: "any"
      },
      {
        name: "Hemkund Sahib",
        description: "A Sikh pilgrimage site at about 4,300 m beside a glacial lake, reached by a steep climb of around 6 km from Ghangaria. It is open for a limited summer season, and visitors are expected to dress modestly and cover their heads.",
        visitHours: 6,
        coordinates: { lat: 30.7, lng: 79.61 },
        interests: ["spiritual", "adventure", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Govindghat to Ghangaria trail",
        description: "A trek of about 13 km along the Lakshman Ganga river, through forest, with tea stalls and mule trains on the way. The path is stone-paved but steep and shared with animals. Mules and porters are available for hire at fixed rates.",
        visitHours: 6,
        coordinates: { lat: 30.636, lng: 79.564 },
        interests: ["adventure", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Bhyundar Ganga and Pushpawati River",
        description: "The streams that run through the valley, with bridges and views of snow-capped peaks. They are crossed repeatedly on the trail, and water levels are high in the monsoon.",
        visitHours: 1,
        interests: ["nature", "photography"],
        timeOfDay: "any"
      }
    ],
    bestMonths: [7, 8, 9],
    bestTimeNote: "The valley is usually open from about June to October. Flowers peak in July and August, but this is also the heaviest rain period, and landslides can close the highway or trail. September offers clearer skies with fewer flowers. The valley is snowbound and closed in winter.",
    recommendedDays: { min: 4, max: 6 },
    budget: {
      budget: [1500, 2800],
      midRange: [3000, 5500],
      comfort: [6000, 12000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a room, covering simple lodging at Ghangaria and Joshimath, meals, and shared jeeps and porters. Mule or porter hire adds to the cost. Excludes transport to Joshimath or Govindghat and permit fees."
    },
    gettingThere: {
      air: "The nearest airport is Jolly Grant near Dehradun, about 295 km from Govindghat. Onward travel is by road.",
      rail: "The nearest main railheads are Rishikesh and Haridwar, around 270 to 295 km away. There is no railway in the Alaknanda valley beyond.",
      road: "The Rishikesh to Badrinath highway reaches Joshimath and Govindghat. The journey from Rishikesh takes a full day or more, and the road is prone to landslides, particularly in the monsoon.",
      local: "Shared jeeps run between Joshimath and Govindghat. From there, the trek to Ghangaria is on foot, or by mule or porter. Helicopter services to Ghangaria operate seasonally; check with operators."
    },
    accommodation: "Joshimath and Govindghat have hotels and guesthouses, while Ghangaria has simple lodges and a gurdwara providing basic accommodation and meals. Rooms at Ghangaria are limited and fill during pilgrim season. There is no camping inside the national park.",
    cuisine: [
      { name: "Gurdwara langar", note: "Free vegetarian meals served at the gurdwara in Ghangaria and Govindghat, run by volunteers; contributions are welcome." },
      { name: "Dal, rice and rotis", note: "Simple meals at trailside lodges and tea stalls." },
      { name: "Maggi noodles and tea", note: "Standard fuel on the trail, sold at stalls." },
      { name: "Garhwali food", note: "Dishes such as jhangora kheer may be found in Joshimath." },
      { name: "Hot chai", note: "Sold at stalls throughout the climb." }
    ],
    festivals: ["Hemkund Sahib pilgrimage season (June to October)", "Badrinath temple opening (spring)"],
    nearby: [
      { name: "Joshimath", distanceKm: 22, note: "A town on the highway, affected by land subsidence in 2023; check conditions before staying." },
      { name: "Badrinath", distanceKm: 24, note: "A major Vishnu temple and one of the Char Dham sites." },
      { name: "Auli", distanceKm: 36, note: "A ski and meadow area above Joshimath." },
      { name: "Rishikesh", distanceKm: 270, note: "The usual starting point for the highway journey.", destinationSlug: "rishikesh" },
      { name: "Nanda Devi Sanctuary", distanceKm: 100, note: "A restricted high-altitude reserve that forms part of the World Heritage Site, accessible only under tight rules." }
    ],
    precautions: [
      "Weather changes quickly and landslides are common in the monsoon; check road and trail conditions before setting out and allow spare days.",
      "Altitude sickness can affect people at Ghangaria and above; ascend slowly and descend if symptoms develop.",
      "Stay on marked paths and do not pick flowers, as the park's fragile plants and visitors' safety depend on this.",
      "Carry rain protection, warm layers, sturdy shoes and basic first aid, as there is limited medical help.",
      "Pay fixed rates to porters and mule handlers and treat animals kindly; overloaded mules are a persistent problem."
    ],
    tips: [
      "Visit the valley early in the morning and leave by early afternoon, as required by park rules.",
      "Book a lodge at Ghangaria in advance in peak season.",
      "Carry cash, as ATMs are unreliable and networks patchy.",
      "Take binoculars and a flower guide to appreciate the species.",
      "Carry out all your rubbish and avoid single-use plastic."
    ],
    accessibility: "Access is difficult. The trek from Govindghat is steep and long, and the valley trail is uneven and wet. Mules, porters and seasonal helicopters can help with the approach, but the valley itself is unlikely to be accessible for wheelchairs. Altitude is a concern for those with heart or lung conditions.",
    responsibleTravel: "The valley is a World Heritage Site and a fragile ecosystem. Follow forest department rules, do not pick plants, take your waste out and use the lodges rather than camping. Treat porters and animals fairly, and respect Sikh pilgrims on the Hemkund trail.",
    permits: "Entry to the national park requires a permit and fee from the forest department, issued at or near Ghangaria. Check the current system, fees and visiting hours with the Uttarakhand forest authorities or Uttarakhand Tourism before you go.",
    faqs: [
      {
        question: "When does the Valley of Flowers open?",
        answer: "It is usually open from about June to October, with the flowers peaking in July and August. Dates are set by the forest department and depend on weather and snow conditions."
      },
      {
        question: "Can I stay overnight in the valley?",
        answer: "No. Overnight camping inside the national park is prohibited. Visitors stay at Ghangaria and make a day trip."
      },
      {
        question: "How difficult is the trek?",
        answer: "The Govindghat to Ghangaria trek is about 13 km and moderately demanding, followed by a gentler climb into the valley. Reasonable fitness is needed, and altitude affects people differently."
      },
      {
        question: "Is it better to go in July or August?",
        answer: "Both are peak flowering months, but the rain is heaviest then and landslides are more likely. September has clearer skies but fewer flowers."
      }
    ],
    officialLinks: [{ label: "Uttarakhand Tourism", url: "https://uttarakhandtourism.gov.in/" }],
    sources: [
      { label: "Valley of Flowers National Park on Wikipedia", url: "https://en.wikipedia.org/wiki/Valley_of_Flowers_National_Park" },
      { label: "Nanda Devi and Valley of Flowers National Parks, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/335" },
      { label: "Hemkund Sahib on Wikipedia", url: "https://en.wikipedia.org/wiki/Hemkund_Sahib" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "amritsar",
    name: "Amritsar",
    stateSlug: "punjab",
    region: "north",
    tagline: "The spiritual centre of Sikhism, home to the Golden Temple, Jallianwala Bagh and a strong food culture.",
    categories: ["religious", "cultural", "temples-heritage", "monuments"],
    coordinates: { lat: 31.634, lng: 74.8723 },
    wikipediaTitle: "Amritsar",
    popular: true,
    hiddenGem: false,
    overview: [
      "Amritsar is in northwestern Punjab, close to the border with Pakistan. It is best known for Sri Harmandir Sahib, the Golden Temple, the holiest shrine in Sikhism, which draws large numbers of pilgrims and visitors every day. The temple stands in a sacred pool called the Amrit Sarovar, and the complex also includes the Akal Takht and a community kitchen that serves free meals to thousands of people.",
      "The city has other sites tied to modern history. Jallianwala Bagh, a short walk from the Golden Temple, commemorates the 1919 massacre of unarmed civilians by British troops. The Partition Museum records the 1947 division of the subcontinent through personal testimony, and Gobindgarh Fort has been restored as a heritage attraction.",
      "The ceremony at the Attari-Wagah border, about 30 km west, is a popular outing. Arrangements for public viewing have changed in recent years, including after tensions with Pakistan in 2025, so check the current status before planning a visit.",
      "Amritsar is also known for food, from kulchas and lassi to meat dishes and sweets. Visitors to the Golden Temple should cover their heads, remove shoes and wash their feet, and avoid tobacco, alcohol and meat in the complex. Staff and volunteers are generally welcoming and helpful to visitors of all faiths."
    ],
    history: [
      "The city was founded in 1577 by the fourth Sikh guru, Guru Ram Das, on land granted by Emperor Akbar, around a pool that became the Amrit Sarovar. His successor Guru Arjan Dev completed the Harmandir Sahib in the early 1600s, and in 1604 installed the Adi Granth, the Sikh scripture, in it. The temple has been attacked and rebuilt several times in its history.",
      "In the late eighteenth century, Sikh confederacies controlled the area, and Maharaja Ranjit Singh, who ruled from 1801, rebuilt and gilded the upper levels of the temple in the early nineteenth century, giving it its present name. The city was a major trading centre in the nineteenth century, with caravan routes to Central Asia.",
      "On 13 April 1919, British troops under General Dyer fired on a crowd at Jallianwala Bagh, killing hundreds, an event that deepened opposition to British rule. Partition in 1947 divided Punjab and left Amritsar a border city. In 1984, Operation Blue Star, an Indian army action against militants within the temple complex, caused deaths and damage, and remains a painful memory for many Sikhs."
    ],
    attractions: [
      {
        name: "Golden Temple (Sri Harmandir Sahib)",
        description: "The central Sikh shrine in a pool of water, reached by a causeway. Visitors cover their heads, remove shoes, wash their feet at the entrance and avoid tobacco and alcohol. Queues for the inner sanctum can be long. Photography is allowed in most outer areas but not inside the sanctum.",
        visitHours: 3,
        coordinates: { lat: 31.62, lng: 74.8765 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Guru Ka Langar",
        description: "The community kitchen of the Golden Temple, serving free vegetarian meals to all visitors regardless of faith. Sit on the floor in rows and accept what is served. Donations and volunteering are welcome, but there is no charge.",
        visitHours: 1,
        coordinates: { lat: 31.62, lng: 74.877 },
        interests: ["food", "spiritual", "culture"],
        timeOfDay: "any"
      },
      {
        name: "Jallianwala Bagh",
        description: "A walled memorial garden marking the 1919 massacre, with a well and bullet marks on the walls. It is a place of mourning, so respectful behaviour is expected. Galleries and a light show have been added in recent years.",
        visitHours: 1,
        coordinates: { lat: 31.6206, lng: 74.8802 },
        interests: ["history"],
        timeOfDay: "afternoon"
      },
      {
        name: "Partition Museum",
        description: "A museum in the old Town Hall that records the 1947 division of India through oral histories, letters and objects. It is moving and can be distressing; allow time. Check the museum's website for current opening days.",
        visitHours: 2,
        coordinates: { lat: 31.6215, lng: 74.879 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Attari-Wagah border ceremony",
        description: "A daily flag-lowering ceremony at the India-Pakistan border, about 30 km west. Public arrangements have varied, particularly after the 2025 tensions, so check the current status with local authorities. Security is strict, with bag restrictions and long queues.",
        visitHours: 3,
        coordinates: { lat: 31.6048, lng: 74.5733 },
        interests: ["culture", "history"],
        timeOfDay: "evening"
      },
      {
        name: "Gobindgarh Fort",
        description: "A restored eighteenth-century fort with museums, performances and cafes, run as a paid attraction. It was historically a military site. It suits families and offers a lighter counterpoint to the memorials.",
        visitHours: 2.5,
        coordinates: { lat: 31.6272, lng: 74.8575 },
        interests: ["history", "culture"],
        timeOfDay: "afternoon"
      },
      {
        name: "Durgiana Temple",
        description: "A Hindu temple set in a pool, modelled in appearance on the Golden Temple, about 1.5 km from it. It is a quieter place that gives a sense of the city's mixed religious life. Remove shoes and dress modestly.",
        visitHours: 1,
        coordinates: { lat: 31.6342, lng: 74.8578 },
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is the comfortable season, although December and January can be foggy and cold. November brings Gurpurab celebrations around Guru Nanak's birth anniversary. April sees Baisakhi, and summers from May to July are very hot.",
    recommendedDays: { min: 2, max: 3 },
    budget: {
      budget: [1000, 2200],
      midRange: [2800, 5500],
      comfort: [7000, 15000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals and local transport. Langar meals are free, and donations are voluntary. Excludes intercity transport and shopping."
    },
    gettingThere: {
      air: "Sri Guru Ram Dass Jee International Airport, about 11 km from the centre, has domestic and some international flights. Taxis and app cabs run to the city.",
      rail: "Amritsar Junction is a major station with fast trains from Delhi, including the Shatabdi Express. Book in advance, particularly for winter.",
      road: "The Grand Trunk Road links Amritsar to Jalandhar, Ludhiana and Delhi (about 450 km). Buses and taxis are frequent.",
      local: "Auto-rickshaws, e-rickshaws and app cabs serve the city. The Golden Temple area is pedestrian, with free shuttle services from parking areas. Cycle rickshaws are common in the old city."
    },
    accommodation: "Many hotels and guesthouses are around the Golden Temple and the railway station. The temple also operates free pilgrim lodging (sarai) for visitors, subject to availability and rules. Upscale hotels are on the outskirts and near the airport. Book ahead around Gurpurab and Baisakhi.",
    cuisine: [
      { name: "Amritsari kulcha", note: "Stuffed leavened bread, baked in a tandoor and served with chickpeas and chutney." },
      { name: "Amritsari fish", note: "Fish fried in a spiced gram flour batter, a local speciality." },
      { name: "Lassi", note: "A thick, sweet yoghurt drink, often served in large glasses." },
      { name: "Chole bhature and langar", note: "A hearty breakfast, and simple dal, roti and kheer at the community kitchen." },
      { name: "Phirni and jalebi", note: "Milk pudding and syrup-soaked sweets, found in the old city." }
    ],
    festivals: ["Baisakhi (April)", "Gurpurab", "Diwali (Bandi Chhor Divas)", "Hola Mohalla (nearby at Anandpur Sahib)"],
    festivalSlugs: ["baisakhi", "diwali", "holi"],
    nearby: [
      { name: "Wagah border", distanceKm: 28, note: "Site of the flag ceremony; check public access." },
      { name: "Tarn Taran Sahib", distanceKm: 24, note: "A Sikh shrine with a large sarovar." },
      { name: "Pathankot", distanceKm: 110, note: "A gateway to the Himachal hills." },
      { name: "Jalandhar", distanceKm: 80, note: "A city of sports goods and the Grand Trunk Road." },
      { name: "Chandigarh", distanceKm: 230, note: "A planned city with Le Corbusier architecture.", destinationSlug: "chandigarh" }
    ],
    precautions: [
      "Dress modestly and cover your head at Sikh shrines. Do not bring tobacco, alcohol or meat into the temple complex.",
      "The Golden Temple's marble floors can be very hot in summer, so wear socks if allowed or use the wet carpets, and wash feet at the entrance.",
      "Crowds are heavy on weekends and festivals; keep bags closed and watch for pickpockets.",
      "Check border ceremony access and security rules in advance, as arrangements have changed and bag restrictions are strict.",
      "The Jallianwala Bagh and Partition Museum deal with distressing events. Visit with sensitivity, and consider this with children."
    ],
    tips: [
      "Visit the Golden Temple early morning or late evening, when lighting and quietness are best.",
      "Accept the langar meal, sit in the row and finish what you take.",
      "Use free shoe storage at the temple and keep the token.",
      "Combine Jallianwala Bagh, the Partition Museum and the temple on one day, as they are close together.",
      "Ask before photographing worshippers, and do not take selfies with your back to the sanctum."
    ],
    accessibility: "The Golden Temple complex has marble flooring and ramps in some places, and volunteers often assist elderly or disabled visitors, but the causeway can be crowded and wet. Jallianwala Bagh and the Partition Museum have mostly level surfaces, although step-free access is not confirmed throughout. The old city's lanes are narrow and crowded.",
    responsibleTravel: "The Golden Temple is a working place of worship, not just a tourist site. Follow the dress and conduct rules, contribute to the langar if you can, and do not disrupt prayers. Respect victims' families at memorials, and avoid commercial photography in sensitive areas.",
    faqs: [
      {
        question: "Can non-Sikhs visit the Golden Temple?",
        answer: "Yes. Visitors of all faiths are welcome, provided they cover their heads, remove shoes, wash their feet and follow the rules of conduct."
      },
      {
        question: "Is the langar free for foreigners?",
        answer: "Yes. The community kitchen serves everyone without charge. Donations are voluntary, and some visitors volunteer to help serve or wash dishes."
      },
      {
        question: "Is the Wagah border ceremony still held?",
        answer: "A flag-lowering ceremony has been held daily for many years, but public arrangements have changed, notably after the tensions of 2025. Check the current status with local authorities before travelling."
      },
      {
        question: "How many days are needed?",
        answer: "Two days cover the Golden Temple, Jallianwala Bagh, the Partition Museum and the border. Add another day for Tarn Taran or a slower pace."
      }
    ],
    officialLinks: [{ label: "Punjab Tourism", url: "https://punjabtourism.punjab.gov.in/" }],
    sources: [
      { label: "Amritsar on Wikipedia", url: "https://en.wikipedia.org/wiki/Amritsar" },
      { label: "Golden Temple on Wikipedia", url: "https://en.wikipedia.org/wiki/Golden_Temple" },
      { label: "Jallianwala Bagh massacre on Wikipedia", url: "https://en.wikipedia.org/wiki/Jallianwala_Bagh_massacre" },
      { label: "Partition Museum on Wikipedia", url: "https://en.wikipedia.org/wiki/Partition_Museum" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "chandigarh",
    name: "Chandigarh",
    stateSlug: "chandigarh",
    region: "north",
    tagline: "A planned city designed in the 1950s, with Le Corbusier's Capitol Complex and Nek Chand's Rock Garden.",
    categories: ["monuments", "cultural", "weekend", "photography"],
    coordinates: { lat: 30.7333, lng: 76.7794 },
    wikipediaTitle: "Chandigarh",
    popular: false,
    hiddenGem: false,
    overview: [
      "Chandigarh is a union territory and the shared capital of Punjab and Haryana, in the foothills of the Shivalik range. It was planned from scratch after Partition, with a grid of numbered sectors, wide tree-lined avenues and green belts. Compared with most Indian cities it is orderly and spacious, which makes it a calm stopover on the way to Himachal Pradesh and Punjab.",
      "The Swiss-French architect Le Corbusier designed the Capitol Complex, with the High Court, the Secretariat and the Legislative Assembly, along with the Open Hand monument. The complex is part of a UNESCO World Heritage listing for his architectural work, which was inscribed in 2016. Visits are by guided tour, usually needing registration in advance, so check with Chandigarh Tourism.",
      "The city also has Nek Chand's Rock Garden, a sculpture park made from recycled and found materials, and Sukhna Lake, a reservoir beside the city that is popular for walks. The Rose Garden, the Sector 17 plaza and the Sector 22 and 35 markets give a sense of the planned city in everyday use.",
      "Chandigarh works well for a short break and as a base for Pinjore, Kasauli and Shimla. It is hot in summer, cool in winter and rainy in the monsoon. The city is among the more walkable and cyclable in the region, although distances between sectors are large."
    ],
    history: [
      "After the Partition of Punjab in 1947, the old capital Lahore went to Pakistan, and India needed a new capital for its Punjab state. Prime Minister Jawaharlal Nehru supported the idea of a modern city. The site was chosen in the Shivalik foothills, and an American planner, Albert Mayer, produced an early plan with architect Matthew Nowicki, whose death in 1950 ended that phase.",
      "Le Corbusier was then invited to lead the design, working with Pierre Jeanneret, Maxwell Fry and Jane Drew. He kept the grid of sectors and designed the Capitol Complex, while Jeanneret and others designed many of the buildings and furniture. The city was inaugurated in stages in the 1950s.",
      "In 1966, Punjab was divided into Punjab, Haryana and Himachal Pradesh, and Chandigarh became a union territory that serves as capital to both Punjab and Haryana. Its status has remained a political question. In 2016, UNESCO inscribed the Capitol Complex as part of The Architectural Work of Le Corbusier."
    ],
    attractions: [
      {
        name: "Capitol Complex",
        description: "Le Corbusier's government complex, including the High Court, Secretariat and Legislative Assembly, with the Open Hand monument. It is a working government area with security rules, so visits are by guided tour and generally require advance registration. Confirm on the Chandigarh Tourism site.",
        visitHours: 2,
        coordinates: { lat: 30.7586, lng: 76.801 },
        interests: ["history", "photography", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Rock Garden of Chandigarh",
        description: "A sculpture park made from broken ceramics, bangles, stones and industrial waste by the road inspector Nek Chand, who began it secretly in the 1950s. Paths wind through courtyards, arches and waterfalls. Narrow routes and steps make it tiring on busy days.",
        visitHours: 2,
        coordinates: { lat: 30.7525, lng: 76.8101 },
        interests: ["culture", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Sukhna Lake",
        description: "A reservoir created in 1958 by damming a seasonal stream, with a promenade and boating. It is a favourite place for early-morning walks and evening strolls. Water levels vary with the monsoon, and migratory birds visit in winter.",
        visitHours: 1.5,
        coordinates: { lat: 30.7421, lng: 76.8188 },
        interests: ["relaxation", "nature"],
        timeOfDay: "evening"
      },
      {
        name: "Zakir Hussain Rose Garden",
        description: "A large garden with thousands of rose varieties, which bloom in February and March when the Rose Festival is held. At other times it is still a green public park.",
        visitHours: 1.5,
        coordinates: { lat: 30.7459, lng: 76.7791 },
        interests: ["relaxation", "nature"],
        timeOfDay: "morning"
      },
      {
        name: "Sector 17 plaza",
        description: "The city's central pedestrian plaza, designed by Le Corbusier's team, with shops, cafes and fountains. It is a useful place to see how the city is used, and a place to eat or shop.",
        visitHours: 2,
        coordinates: { lat: 30.739, lng: 76.7826 },
        interests: ["shopping", "food"],
        timeOfDay: "evening"
      },
      {
        name: "Pinjore Gardens",
        description: "A Mughal-style terraced garden at Pinjore, about 22 km from the city, built in the seventeenth century and restored in the twentieth. It makes a pleasant half-day trip.",
        visitHours: 2,
        coordinates: { lat: 30.7942, lng: 76.917 },
        interests: ["relaxation", "history"],
        timeOfDay: "afternoon"
      }
    ],
    bestMonths: [10, 11, 2, 3],
    bestTimeNote: "October to March is the comfortable season. February and March bring the Rose Festival, and December and January can be foggy and cold. April to June is hot and the monsoon runs from July to September.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [1500, 2800],
      midRange: [3500, 7000],
      comfort: [8000, 18000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals and local transport. Excludes intercity travel, shopping and day trips by hired car."
    },
    gettingThere: {
      air: "Shaheed Bhagat Singh International Airport, at Mohali about 12 km from the centre, has flights to Delhi, Mumbai and other cities, including some international services.",
      rail: "Chandigarh Junction is on the line from Delhi, with Shatabdi and other fast trains. Kalka, about 25 km away, is the start of the Kalka-Shimla narrow-gauge line.",
      road: "The city is about 245 km from Delhi and 115 km from Shimla. Interstate bus terminals in Sector 17 and Sector 43 serve long-distance routes.",
      local: "App cabs, autos and city buses operate. The city has cycle tracks and bike hire. Walking between sectors can be long, so plan transport."
    },
    accommodation: "Hotels range from budget guesthouses near Sector 22 and 35 to mid-range and upscale hotels along Madhya Marg and near Sector 17. Mohali and Zirakpur, nearby, have more modern business hotels. Book ahead for events and peak seasons.",
    cuisine: [
      { name: "Chole bhature", note: "A popular Punjabi breakfast of chickpeas and fried bread." },
      { name: "Parathas", note: "Stuffed flatbreads served with butter, curd and pickle." },
      { name: "Butter chicken and tandoori dishes", note: "Typical Punjabi restaurant fare in Sector 17 and 35." },
      { name: "Lassi", note: "A thick yoghurt drink, widely sold." },
      { name: "Sweets and street snacks", note: "Gol gappa, jalebi and kulfi are common in the markets." }
    ],
    festivals: ["Chandigarh Carnival (November, varies)", "Rose Festival (February or March)", "Baisakhi", "Diwali"],
    festivalSlugs: ["baisakhi", "diwali"],
    nearby: [
      { name: "Pinjore", distanceKm: 22, note: "A Mughal garden and a heritage site." },
      { name: "Kasauli", distanceKm: 60, note: "A small hill station near Kalka, with a military cantonment." },
      { name: "Shimla", distanceKm: 115, note: "The former summer capital of British India, in Himachal Pradesh." },
      { name: "Morni Hills", distanceKm: 40, note: "A forested hill area in Haryana with small lakes." },
      { name: "Kurukshetra", distanceKm: 90, note: "A Mahabharata-linked pilgrimage town.", destinationSlug: "kurukshetra" }
    ],
    precautions: [
      "Capitol Complex visits require booking and are subject to security restrictions; do not turn up without checking.",
      "Distances between sectors are large and autos may overcharge, so use meters or app cabs.",
      "Summer heat can be severe from May to June, so plan outdoor visits early in the day.",
      "Take care at Sukhna Lake, which has strong smells and slippery edges after rain, and avoid swimming.",
      "Wild animals, including monkeys and occasional leopards near Shivalik edges, call for caution if you walk in forested areas."
    ],
    tips: [
      "Book the Capitol Complex visit well ahead through Chandigarh Tourism.",
      "Spend the morning at the Rock Garden and the afternoon at the lake for a full day.",
      "Rent a bicycle to explore the tree-lined sector roads.",
      "Combine a visit with the Kalka-Shimla narrow-gauge toy train if heading to the hills.",
      "Check the city's museums and Le Corbusier Centre for exhibitions on the city's history."
    ],
    accessibility: "The city's planned layout gives it wide pavements and level roads, but accessibility at individual sites varies. The Rock Garden has narrow, uneven paths and steps. The Capitol Complex tour involves walking over open ground. Sukhna Lake's promenade is largely level. Step-free access at each site is not confirmed.",
    responsibleTravel: "Chandigarh is a planned green city, with protected trees and lake ecosystems. Avoid littering at Sukhna Lake, respect the sculptures at the Rock Garden and follow the rules at the Capitol Complex. Use cycles or public transport where possible.",
    faqs: [
      {
        question: "Can I visit the Capitol Complex without a booking?",
        answer: "Access is by guided tour and generally requires advance registration, with security checks. Check the Chandigarh Tourism website for current procedures."
      },
      {
        question: "Why is Chandigarh special?",
        answer: "It is one of the few planned cities in India, designed after Partition under Le Corbusier. Its Capitol Complex is a UNESCO World Heritage Site."
      },
      {
        question: "Is Chandigarh worth more than a day?",
        answer: "One day covers the Rock Garden, the lake and the Capitol Complex. Two days allows time for the Rose Garden, markets and Pinjore."
      },
      {
        question: "How do I get to Shimla from Chandigarh?",
        answer: "By road in about 3 to 4 hours, or by train from Kalka on the narrow-gauge line, which is slow but scenic."
      }
    ],
    officialLinks: [{ label: "Chandigarh Tourism", url: "https://chandigarhtourism.gov.in/" }],
    sources: [
      { label: "Chandigarh on Wikipedia", url: "https://en.wikipedia.org/wiki/Chandigarh" },
      { label: "The Architectural Work of Le Corbusier, UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/1321" },
      { label: "Rock Garden of Chandigarh on Wikipedia", url: "https://en.wikipedia.org/wiki/Rock_Garden_of_Chandigarh" },
      { label: "Capitol Complex, Chandigarh on Wikipedia", url: "https://en.wikipedia.org/wiki/Capitol_Complex,_Chandigarh" }
    ],
    lastReviewed: "2026-11-08"
  },
  {
    slug: "kurukshetra",
    name: "Kurukshetra",
    stateSlug: "haryana",
    region: "north",
    tagline: "A pilgrimage town in Haryana associated in Hindu tradition with the Mahabharata war and the Bhagavad Gita.",
    categories: ["religious", "cultural", "temples-heritage", "weekend"],
    coordinates: { lat: 29.9695, lng: 76.8783 },
    wikipediaTitle: "Kurukshetra",
    popular: false,
    hiddenGem: true,
    overview: [
      "Kurukshetra is a town and district in northern Haryana, about 160 km north of Delhi on the Grand Trunk Road. In Hindu tradition it is the battlefield of the Mahabharata war, where Krishna is said to have delivered the Bhagavad Gita to Arjuna. The name means the field of the Kurus, and the area is dotted with sacred tanks and shrines.",
      "The main focus is Brahma Sarovar, a large rectangular tank where pilgrims bathe, especially during solar eclipses, when large fairs take place. Nearby are Sannihit Sarovar, Bhishma Kund at Narkatari and Jyotisar, where a banyan tree is said to descend from one that witnessed the Gita discourse. Not all of these claims rest on historical evidence, but they carry deep religious significance.",
      "The town also holds museums and a science centre. The Kurukshetra Panorama and Science Centre uses a large panorama to depict the war, and the Sri Krishna Museum and the Sheikh Chilli tomb at Thanesar add other perspectives. The Gita Jayanti festival, held in November or December, is the largest annual event and fills the town with visitors.",
      "Kurukshetra is a modest place with limited tourist infrastructure, best suited to a day trip from Delhi or Chandigarh or a short stopover. Visitors should bring modest clothing and be prepared for crowds at the tanks during festival times. Information at some sites mixes tradition and history, so ask guides to separate what is believed from what is documented."
    ],
    history: [
      "The area is mentioned in ancient Sanskrit texts, including the Mahabharata, as Kurukshetra, a sacred plain. Archaeological evidence from the surrounding region suggests human settlement for several thousand years, including Harappan and later sites, but the battle itself is known only from tradition and epic literature, and there is no archaeological confirmation of a single war.",
      "Thanesar, now part of the Kurukshetra area, was the capital of the Pushyabhuti dynasty in the early seventh century, under King Harshavardhana, whose court poet Banabhatta described the city. The Chinese pilgrim Xuanzang visited and noted its religious importance. In later centuries the town came under the Delhi Sultanate and the Mughals, and the Sheikh Chilli tomb, a sixteenth-century Sufi monument, dates from this era.",
      "After independence, Kurukshetra became a centre of education and tourism, with the founding of Kurukshetra University in 1956. The state government has promoted the Gita Jayanti festival since the late twentieth century, and has developed the Brahma Sarovar and other sites for pilgrims."
    ],
    attractions: [
      {
        name: "Brahma Sarovar",
        description: "A large sacred tank, one of the biggest man-made water bodies in India, where pilgrims bathe and perform rituals. An evening aarti takes place on its ghats. It draws crowds during eclipses and festivals. Observe local customs and dress modestly.",
        visitHours: 1.5,
        coordinates: { lat: 29.9588, lng: 76.8374 },
        interests: ["spiritual", "culture", "photography"],
        timeOfDay: "evening"
      },
      {
        name: "Jyotisar",
        description: "A site where, according to tradition, Krishna gave the Gita teaching, marked by a banyan tree and a chariot sculpture. It is a place of pilgrimage and quiet, away from the main town.",
        visitHours: 1.5,
        interests: ["spiritual", "history"],
        timeOfDay: "morning"
      },
      {
        name: "Sannihit Sarovar",
        description: "A pilgrimage tank that holds special importance on new moon days and during eclipses, believed to hold the waters of many holy places. It has ghats and temples around it.",
        visitHours: 1,
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      },
      {
        name: "Kurukshetra Panorama and Science Centre",
        description: "A museum with a large circular panorama of the Mahabharata war and science galleries. It is useful for families and gives context on the epic. Opening days and timings vary, so check locally.",
        visitHours: 2,
        interests: ["culture", "history"],
        timeOfDay: "afternoon"
      },
      {
        name: "Sheikh Chilli's Tomb, Thanesar",
        description: "A sixteenth-century tomb and madrasa complex of the Sufi saint Sheikh Chehli, built in red sandstone and marble, with a small ASI museum. It is a quieter complement to the Hindu pilgrimage sites.",
        visitHours: 1.5,
        interests: ["history", "photography"],
        timeOfDay: "morning"
      },
      {
        name: "Bhishma Kund, Narkatari",
        description: "A pond associated with the warrior Bhishma, who in the epic lies on a bed of arrows. It is a small pilgrimage site with a temple, reached by road from the town.",
        visitHours: 1,
        interests: ["spiritual", "culture"],
        timeOfDay: "morning"
      }
    ],
    bestMonths: [10, 11, 12, 1, 2, 3],
    bestTimeNote: "October to March is comfortable. The Gita Jayanti festival in November or December is the busiest period, with crowds and higher prices. Summers are hot, and the monsoon from July to September can leave tanks full and surroundings damp.",
    recommendedDays: { min: 1, max: 2 },
    budget: {
      budget: [900, 2000],
      midRange: [2500, 4500],
      comfort: [5500, 10000],
      assumptions: "Per person per day in INR for a solo traveller or the per-person share of a double room. Covers lodging, local meals and local transport, including auto-rickshaws between sites. Excludes intercity travel and donations. Accommodation is limited, and prices rise during Gita Jayanti."
    },
    gettingThere: {
      air: "The nearest major airports are Chandigarh (about 90 km) and Delhi (about 160 km). Taxis and buses continue onward.",
      rail: "Kurukshetra Junction is on the Delhi-Ambala line, with many trains stopping. Check which services halt at the station on IRCTC.",
      road: "The Grand Trunk Road (NH 44) passes through the area, linking Kurukshetra to Delhi, Panipat and Ambala. Buses and taxis run frequently.",
      local: "Auto-rickshaws, shared vehicles and taxis connect the main sites, which are spread over several kilometres. Agree fares before setting off."
    },
    accommodation: "Accommodation includes government and private hotels, pilgrim dharamshalas near Brahma Sarovar and Haryana Tourism properties. Quality and choice are limited compared with large cities. Many visitors stay in Karnal, Ambala or Chandigarh and visit as a day trip. Book well ahead for Gita Jayanti.",
    cuisine: [
      { name: "Haryanvi thali", note: "Bajra roti, dal, kadhi and ghee, reflecting the region's rural food." },
      { name: "Lassi and milk", note: "Dairy is central to Haryanvi food; lassi is served in large glasses." },
      { name: "Kadhi pakora", note: "A yoghurt curry with gram flour fritters." },
      { name: "Dhaba food", note: "Roadside eateries on the Grand Trunk Road serve parathas, dal and tandoori dishes." },
      { name: "Sweets", note: "Jalebi, laddoo and rabri are sold in town markets." }
    ],
    festivals: ["Gita Jayanti Mahotsav (November or December)", "Solar eclipse bathing fairs", "Somvati Amavasya", "Diwali"],
    festivalSlugs: ["diwali"],
    nearby: [
      { name: "Karnal", distanceKm: 40, note: "A city on the Grand Trunk Road with Karna Lake." },
      { name: "Panipat", distanceKm: 60, note: "The site of three major battles in Indian history." },
      { name: "Ambala", distanceKm: 45, note: "A railway junction and cantonment town." },
      { name: "Chandigarh", distanceKm: 90, note: "A planned city with Le Corbusier architecture.", destinationSlug: "chandigarh" },
      { name: "Delhi", distanceKm: 160, note: "The capital, an easy start or end point.", destinationSlug: "delhi" }
    ],
    precautions: [
      "Crowds at the tanks during eclipses and Gita Jayanti can be very large, and crowd-safety is a concern; follow instructions from officials and volunteers.",
      "Do not swim or bathe in tanks without checking water quality and local rules, as water can be dirty or deep.",
      "Dress modestly and observe temple rules about footwear and photography.",
      "Touts and unofficial guides may press for money at pilgrimage sites; agree any fee beforehand.",
      "Heat in summer is intense, and shade is limited at open sites."
    ],
    tips: [
      "Visit Brahma Sarovar in the evening for the aarti and the lit ghats.",
      "Ask local guides to distinguish tradition from archaeological evidence.",
      "Combine Kurukshetra with Chandigarh or Karnal for a longer route.",
      "Check dates of Gita Jayanti with Haryana Tourism if you wish to attend, or avoid if you prefer fewer crowds.",
      "Carry cash for small donations, shoes storage and local transport."
    ],
    accessibility: "The main tanks have wide ghats with steps, and paths around them are mostly level. Jyotisar and Bhishma Kund have uneven paths and steps. The Panorama and Science Centre is more likely to have level access, but this is not confirmed. Contact sites before visiting if you need step-free access.",
    responsibleTravel: "Kurukshetra's tanks are sacred and sensitive to pollution. Do not litter, avoid single-use plastic and follow the rules on bathing and offerings. Respect worshippers, ask permission before photographing rituals, and treat the area as a living pilgrimage site and not a stage set.",
    faqs: [
      {
        question: "Is there historical evidence for the Mahabharata war at Kurukshetra?",
        answer: "The war is known mainly from the epic and from tradition. There is no archaeological confirmation of a single great battle, but the area has been a religious centre for a very long time."
      },
      {
        question: "When is Gita Jayanti?",
        answer: "It is usually in November or December, set by the Hindu lunar calendar. The state government holds a festival with fairs and events; confirm dates with Haryana Tourism."
      },
      {
        question: "Can I do Kurukshetra as a day trip from Delhi?",
        answer: "Yes. Fast trains and the Grand Trunk Road make the journey about three hours each way, giving time for the main tanks and a museum."
      },
      {
        question: "Can non-Hindus visit?",
        answer: "Yes. The tanks, museums and most temples are open to all, though temple customs on footwear, dress and photography should be followed."
      }
    ],
    officialLinks: [
      { label: "Haryana Tourism", url: "https://haryanatourism.gov.in" },
    ],
    sources: [
      { label: "Kurukshetra on Wikipedia", url: "https://en.wikipedia.org/wiki/Kurukshetra" },
      { label: "Brahma Sarovar on Wikipedia", url: "https://en.wikipedia.org/wiki/Brahma_Sarovar" },
      { label: "Thanesar on Wikipedia", url: "https://en.wikipedia.org/wiki/Thanesar" }
    ],
    lastReviewed: "2026-11-09"
  }
];
