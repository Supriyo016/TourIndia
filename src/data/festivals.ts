import type { Festival, SourceLink } from "@/types/content";

/**
 * Review note (2026-11-09): confirmedDates for 2027 are filled only where an
 * official source was read on 2026-11-09: the Government of India (DoPT)
 * Office Memorandum of 16 July 2026 on 2027 central government holidays
 * (read from the PDF on documents.doptcirculars.nic.in), and the Government of
 * Maharashtra's official Simhastha Kumbh Mela website. The DoPT list is for
 * central government offices and names the day of observance, not always the
 * first day of a multi-day festival, so isoStart is set only where the listed
 * day is a single-day observance or the first day. Dates for Eid are subject
 * to moon sighting, as the memorandum itself says. Festivals with no entry
 * below are those for which no official 2027 date was found: check the state
 * government or organiser. Lunar dates are never inferred here.
 */

const dopt: SourceLink = {
  label: "DoPT Office Memorandum of 16 July 2026: holidays in Central Government offices, 2027 (read 9 November 2026)",
  url: "https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20list%202027Cj0HU.PDF",
};

const ntkma: SourceLink = {
  label: "Government of Maharashtra: Nashik-Trimbakeshwar Simhastha Mahakumbh Mela 2027, official website (read 9 November 2026)",
  url: "https://simhasthamahakumbh.maharashtra.gov.in/",
};

const wiki = (title: string): SourceLink => ({
  label: `Wikipedia: ${title}`,
  url: `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`,
});

export const festivals: Festival[] = [
  {
    slug: "diwali",
    name: "Diwali",
    theme: "religious",
    months: [10, 11],
    dateRule:
      "The new-moon night (amavasya) of the lunar month of Ashvin or Kartika, depending on the regional calendar, so it falls in October or November. Celebrations run for several days around it.",
    confirmedDates: [
      { label: "29 October 2027 (Diwali day, central government holiday)", year: 2027, isoStart: "2027-10-29", source: dopt },
    ],
    stateSlugs: [],
    panIndian: true,
    summary:
      "The festival of lights, marked by rows of oil lamps, fireworks, sweets and the cleaning and decorating of homes. Hindus, Jains, Sikhs and some Buddhist communities observe it, each for their own reasons.",
    history:
      "Hindu traditions link the festival to the return of Rama to Ayodhya, to the defeat of Narakasura, or to Lakshmi, depending on region. Jains remember the nirvana of Mahavira, and Sikhs mark Bandi Chhor Divas, the release of Guru Hargobind from Gwalior fort.",
    significance:
      "A time for family visits, gifts, new accounts for many business communities and the exchange of sweets. The common thread across faiths is the triumph of light over darkness.",
    places: [
      { place: "Varanasi", note: "Lamps line the ghats, and Dev Deepawali follows a fortnight later.", destinationSlug: "varanasi" },
      { place: "Amritsar", note: "The Golden Temple is lit for Bandi Chhor Divas.", destinationSlug: "amritsar" },
      { place: "Jaipur", note: "The old city markets are illuminated and crowded in the days before.", destinationSlug: "jaipur" },
      { place: "Kolkata", note: "Kali Puja is the main observance on the Diwali night in Bengal.", destinationSlug: "kolkata" },
    ],
    travelAdvice:
      "Trains and flights are heavily booked in the fortnight around Diwali, so reserve early. Many shops close for one to three days, and air quality in northern cities often worsens because of fireworks and crop-burning season. Be careful near firecrackers.",
    wikipediaTitle: "Diwali",
    sources: [dopt, wiki("Diwali")],
  },
  {
    slug: "holi",
    name: "Holi",
    theme: "seasonal",
    months: [3],
    dateRule:
      "The full-moon day (Phalguna Purnima) of the Hindu lunisolar calendar, usually in March. A bonfire (Holika Dahan) is lit the evening before the colour day.",
    confirmedDates: [
      { label: "23 March 2027 (Holi, central government holiday; Holika Dahan is listed for 22 March)", year: 2027, isoStart: "2027-03-23", source: dopt },
    ],
    stateSlugs: [],
    panIndian: true,
    summary:
      "A spring festival in which people throw coloured powder and water at one another, share sweets and light bonfires the night before.",
    history:
      "Tradition ties the bonfire to the story of Prahlada and Holika, and the colour play to the youthful games of Krishna and Radha. The festival is also a welcome for spring and the coming wheat harvest.",
    significance:
      "Social barriers of age and standing are relaxed for the day. It is celebrated most energetically in northern and central India, and more quietly in much of the south.",
    places: [
      { place: "Mathura and Vrindavan", note: "Celebrations last about a week, with distinct local customs such as Lathmar Holi in nearby Barsana." },
      { place: "Delhi", note: "Public gatherings and private parties are widespread.", destinationSlug: "delhi" },
      { place: "Jaipur", note: "The city holds organised celebrations, often with a Holika Dahan ceremony.", destinationSlug: "jaipur" },
    ],
    travelAdvice:
      "Powder and water are thrown at strangers in many places. Wear old clothes, protect phones and cameras in sealed bags, and use oil on hair and skin first. Women travelling alone may prefer organised events or a hotel celebration. Many businesses close for the day.",
    wikipediaTitle: "Holi",
    sources: [dopt, wiki("Holi")],
  },
  {
    slug: "durga-puja",
    name: "Durga Puja",
    theme: "religious",
    months: [9, 10],
    dateRule:
      "The sixth to tenth days of the bright fortnight of Ashvin, which fall in late September or October. The key days are Shashthi, Saptami, Ashtami, Navami and Dashami.",
    confirmedDates: [
      { label: "Saptami 6 October to Navami 8 October 2027, with Vijaya Dashami (Dussehra) on 9 October (central government lists)", year: 2027, source: dopt },
    ],
    stateSlugs: ["west-bengal", "assam", "odisha", "tripura", "jharkhand", "bihar"],
    panIndian: false,
    summary:
      "Neighbourhood committees build large temporary pavilions (pandals) housing clay images of the goddess Durga, and visitors move between them for several days. It is the largest annual festival in West Bengal.",
    history:
      "The worship of Durga as the slayer of the buffalo demon Mahishasura is old, but the community-sponsored pandal form developed in Bengal over the eighteenth and nineteenth centuries. UNESCO added Durga Puja in Kolkata to its list of Intangible Cultural Heritage of Humanity in 2021.",
    significance:
      "Religious worship, art, theatre, food and reunion of families all overlap. Image-makers, lighting craftspeople and drummers (dhakis) work for months beforehand.",
    places: [
      { place: "Kolkata", note: "Hundreds of pandals, with the Kumartuli potters' quarter preparing the images.", destinationSlug: "kolkata" },
      { place: "Guwahati and Assam towns", note: "Large community pujas follow Bengali patterns." },
      { place: "Delhi", note: "Chittaranjan Park and other Bengali neighbourhoods hold well-known pujas.", destinationSlug: "delhi" },
    ],
    travelAdvice:
      "Roads in central Kolkata are closed to vehicles on the busiest evenings, and pandal queues can last hours. Book hotels and trains well ahead. Visiting on a weekday morning is calmer. Shoes are removed at the entrance of many pandals. The immersion processions on Dashami are crowded.",
    wikipediaTitle: "Durga Puja",
    sources: [dopt, wiki("Durga Puja"), { label: "UNESCO: Durga Puja in Kolkata", url: "https://ich.unesco.org/en/RL/durga-puja-in-kolkata-01580" }],
  },
  {
    slug: "onam",
    name: "Onam",
    theme: "harvest",
    months: [8, 9],
    dateRule:
      "The Thiruvonam nakshatra in the Malayalam month of Chingam, which falls in August or September. The celebration runs for about ten days, ending with Thiruvonam.",
    confirmedDates: [
      { label: "Thiru Onam day, 12 September 2027 (central government restricted holiday)", year: 2027, source: dopt },
    ],
    stateSlugs: ["kerala"],
    panIndian: false,
    summary:
      "Kerala's main harvest festival, marked by floral carpets (pookalam), a large vegetarian feast on banana leaf (sadya), boat races and dances such as Thiruvathirakali.",
    history:
      "The festival is associated with the legend of the king Mahabali, who is believed to visit his people each year. It is observed by Malayalis of all religions.",
    significance:
      "Often treated as a festival of the whole state rather than one community. Families gather, buy new clothes and cook a feast of many dishes.",
    places: [
      { place: "Alappuzha", note: "Snake-boat races are held in the backwaters around this time.", destinationSlug: "alappuzha" },
      { place: "Thrissur", note: "Pulikali, a tiger-costume procession, takes place on the fourth day." },
      { place: "Thiruvananthapuram", note: "State-organised cultural programmes run through the week." },
    ],
    travelAdvice:
      "Many restaurants close on Thiruvonam day and on the first Onam day, and domestic travel is heavy. Book houseboats and homestays early. Monsoon rain can linger into August, so carry rain cover.",
    wikipediaTitle: "Onam",
    sources: [dopt, wiki("Onam")],
  },
  {
    slug: "pongal",
    name: "Pongal",
    theme: "harvest",
    months: [1],
    dateRule:
      "Set by the solar calendar: it begins on the first day of the Tamil month of Thai, usually 14 or 15 January. The festival lasts four days.",
    confirmedDates: [
      { label: "Pongal day, 15 January 2027 (central government restricted holiday)", year: 2027, source: dopt },
    ],
    stateSlugs: ["tamil-nadu", "puducherry"],
    panIndian: false,
    summary:
      "A four-day harvest festival centred on boiling the season's new rice with milk and jaggery until it overflows, a sign of abundance.",
    history:
      "Thanksgiving to the sun and to cattle has long been part of the farming year in Tamil regions. The four days are Bhogi, Thai Pongal, Mattu Pongal and Kaanum Pongal.",
    significance:
      "The festival honours farmers and their cattle. Homes are cleaned, doorways are decorated with kolam designs and families cook the pongal dish outdoors.",
    places: [
      { place: "Madurai", note: "Villages near the city, such as Alanganallur, are known for jallikattu, a bull-taming event that is contested in courts and controversial.", destinationSlug: "madurai" },
      { place: "Puducherry", note: "Public celebrations and kolam competitions.", destinationSlug: "puducherry" },
    ],
    travelAdvice:
      "Government offices and many shops close for three to four days, and long-distance buses and trains to and from Chennai are very full. Jallikattu involves injury risk to spectators; keep well back from the arena.",
    wikipediaTitle: "Pongal (festival)",
    sources: [dopt, wiki("Pongal (festival)")],
  },
  {
    slug: "makar-sankranti",
    name: "Makar Sankranti",
    theme: "harvest",
    months: [1],
    dateRule:
      "Set by the solar calendar, when the sun enters Capricorn (Makara), usually 14 or occasionally 15 January.",
    confirmedDates: [
      { label: "14 January 2027 (Makar Sankranti, central government restricted holiday)", year: 2027, isoStart: "2027-01-14", source: dopt },
    ],
    stateSlugs: [],
    panIndian: true,
    summary:
      "A solar and harvest festival observed under many names, among them Pongal in Tamil Nadu, Uttarayan in Gujarat, Lohri in Punjab on the previous evening, and Magh Bihu in Assam.",
    history:
      "The day marks the sun's northward movement and the lengthening of days. Regional customs developed locally, such as kite flying in Gujarat and sesame-jaggery sweets in Maharashtra.",
    significance:
      "Ritual bathing in rivers, charity, bonfires and shared sweets are common. Several of the regional festivals are covered separately on this site.",
    places: [
      { place: "Ahmedabad", note: "The International Kite Festival and rooftop kite flying fill the sky." },
      { place: "Prayagraj", note: "Pilgrims bathe at the confluence during the Magh Mela." },
      { place: "Gangasagar, West Bengal", note: "A large fair is held where the Ganges meets the sea." },
    ],
    travelAdvice:
      "Gujarat's kite season brings sharp glass-coated string to the streets: avoid riding two-wheelers without a face guard and keep an eye on the sky. Pilgrim sites are crowded and accommodation is tight.",
    wikipediaTitle: "Makar Sankranti",
    sources: [dopt, wiki("Makar Sankranti")],
  },
  {
    slug: "navratri",
    name: "Navratri",
    theme: "religious",
    months: [9, 10],
    dateRule:
      "Nine nights beginning on the first day of the bright fortnight of Ashvin, in late September or October, ending with Dussehra (Vijayadashami) on the tenth day. A shorter spring Navratri occurs in Chaitra.",
    confirmedDates: [
      { label: "Vijayadashami (Dussehra), the tenth day, 9 October 2027; the start date of the autumn Navratri is not given in the central list", year: 2027, source: dopt },
      { label: "Spring (Chaitra) Navratri begins 7 April 2027, listed with Gudi Padwa and Ugadi", year: 2027, source: dopt },
    ],
    stateSlugs: [],
    panIndian: true,
    summary:
      "Nine nights dedicated to the goddess in her various forms. Observances differ widely: garba and dandiya dances in Gujarat, Ramlila plays in the north, doll displays (golu) in the south and Durga Puja in the east.",
    history:
      "The festival draws on the Devi Mahatmya and on the Ramayana, and is observed with different emphases in each region. The tenth day is linked to Rama's victory over Ravana in the north and to Durga's victory over Mahishasura elsewhere.",
    significance:
      "Many devotees fast or eat only particular foods for the nine days. Community dancing and neighbourhood theatre are as central as temple worship.",
    places: [
      { place: "Ahmedabad", note: "Large organised garba nights take place across the city." },
      { place: "Delhi", note: "Ramlila performances and the burning of Ravana effigies on Dussehra.", destinationSlug: "delhi" },
      { place: "Mysuru", note: "The royal Dasara celebrations run in parallel.", destinationSlug: "mysuru" },
    ],
    travelAdvice:
      "Garba venues often sell tickets or require passes; decide in advance whether you wish to join or watch. Meat and alcohol are unavailable in some places during the nine days. Dussehra is a public holiday.",
    wikipediaTitle: "Navaratri",
    sources: [dopt, wiki("Navaratri")],
  },
  {
    slug: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    theme: "religious",
    months: [8, 9],
    dateRule:
      "The fourth day (chaturthi) of the bright fortnight of Bhadrapada, which falls in August or September. Public celebrations last up to eleven days, ending with immersion.",
    confirmedDates: [
      { label: "4 September 2027 (Ganesh Chaturthi, central government restricted holiday)", year: 2027, isoStart: "2027-09-04", source: dopt },
    ],
    stateSlugs: ["maharashtra", "goa", "karnataka", "telangana", "andhra-pradesh", "tamil-nadu"],
    panIndian: false,
    summary:
      "The birthday of the elephant-headed god Ganesha, marked by installing clay images in homes and large public pavilions, followed by processions to immerse them in water.",
    history:
      "Domestic worship is older, but the large public form was popularised in Maharashtra at the end of the nineteenth century, when Bal Gangadhar Tilak promoted community gatherings.",
    significance:
      "A household festival of sweets such as modak, and a civic one with committee-run installations. The immersion procession on the final day is the highlight.",
    places: [
      { place: "Mumbai", note: "Lalbaugcha Raja and thousands of other installations, with immersion at Girgaon Chowpatty.", destinationSlug: "mumbai" },
      { place: "Hyderabad", note: "Immersion in Hussain Sagar draws very large processions.", destinationSlug: "hyderabad" },
      { place: "Goa", note: "Chavath is a family festival with home displays.", destinationSlug: "goa" },
    ],
    travelAdvice:
      "Road closures and heavy crowds are normal near immersion points. Where possible choose eco-friendly clay images, which many cities now require. Keep valuables secure in the crowds.",
    wikipediaTitle: "Ganesh Chaturthi",
    sources: [dopt, wiki("Ganesh Chaturthi")],
  },
  {
    slug: "eid-al-fitr",
    name: "Eid al-Fitr",
    theme: "religious",
    months: [3],
    dateRule:
      "The first day of Shawwal in the Islamic lunar calendar, after Ramadan, confirmed by sighting of the new moon. It moves about ten to eleven days earlier each year and is expected in the second week of March in 2027; the exact day in India is announced locally after the moon is sighted.",
    confirmedDates: [
      { label: "10 March 2027 (central government holiday; the memorandum says the date can change with the sighting of the moon)", year: 2027, source: dopt },
    ],
    stateSlugs: [],
    panIndian: true,
    summary:
      "The end of the month of fasting, marked by communal prayers, charity, new clothes and shared meals. Sweet vermicelli (sheer khurma) is common in many homes.",
    history:
      "Eid al-Fitr has been observed since the early years of Islam. In India it has long been a shared occasion, with neighbours of other faiths often invited.",
    significance:
      "Muslims give zakat al-fitr to the poor before the Eid prayer. The day is a gazetted holiday in India.",
    places: [
      { place: "Delhi", note: "Large gatherings at Jama Masjid and the Old Delhi food lanes after the fast.", destinationSlug: "delhi" },
      { place: "Hyderabad", note: "The Charminar area is lit and busy during Ramadan evenings.", destinationSlug: "hyderabad" },
      { place: "Kolkata", note: "Zakaria Street and Park Circus hold night markets in Ramadan.", destinationSlug: "kolkata" },
      { place: "Srinagar", note: "Prayers are held at mosques and Eidgah.", destinationSlug: "srinagar" },
    ],
    travelAdvice:
      "Visit Muslim neighbourhoods modestly dressed, and do not photograph worshippers without asking. Food stalls open late during Ramadan and many close for a day at Eid. As the exact day depends on the moon, keep plans flexible by a day.",
    wikipediaTitle: "Eid al-Fitr",
    sources: [dopt, wiki("Eid al-Fitr")],
  },
  {
    slug: "christmas",
    name: "Christmas",
    theme: "religious",
    months: [12],
    dateRule: "Fixed on 25 December in the Gregorian calendar.",
    confirmedDates: [
      { label: "25 December 2027 (central government holiday)", year: 2027, isoStart: "2027-12-25", source: dopt },
    ],
    stateSlugs: [],
    panIndian: true,
    summary:
      "Christians, who are a significant minority across India and a majority in Nagaland, Mizoram and Meghalaya, mark Christmas with midnight Mass, carols, cribs and family meals.",
    history:
      "Christianity has existed on the Kerala coast for many centuries, and Portuguese, British and other missions later established communities elsewhere. Christmas customs vary: Goa has Portuguese-influenced sweets, while the north-east emphasises choirs.",
    significance:
      "A public holiday across the country. Churches decorate with stars and lights, and many non-Christian neighbours join in the celebrations.",
    places: [
      { place: "Goa", note: "Midnight Mass at old churches in Panaji and Old Goa.", destinationSlug: "goa" },
      { place: "Kolkata", note: "Park Street is lit, and St Paul's Cathedral holds services.", destinationSlug: "kolkata" },
      { place: "Kohima", note: "Choirs and community events fill the week.", destinationSlug: "kohima" },
      { place: "Aizawl", note: "A week of feasts, carols and neighbourhood programmes.", destinationSlug: "aizawl" },
    ],
    travelAdvice:
      "This is peak season in Goa, Kerala and Kolkata, so prices rise and rooms sell out. At church services dress modestly, stay quiet and follow local guidance on photography.",
    wikipediaTitle: "Christmas",
    sources: [dopt, wiki("Christmas")],
  },
  {
    slug: "hornbill",
    name: "Hornbill Festival",
    theme: "tribal",
    months: [12],
    dateRule:
      "Held every year from 1 to 10 December at Kisama Heritage Village near Kohima, on the anniversary of Nagaland's statehood month.",
    confirmedDates: [],
    stateSlugs: ["nagaland"],
    panIndian: false,
    summary:
      "A state-organised festival at which the Naga communities present dance, song, crafts, food and sports at a purpose-built site. It also hosts music events and a rock contest.",
    history:
      "The Government of Nagaland began the festival in 2000 to bring Naga communities together and to present their traditions to visitors. It is named after the hornbill, a bird important in Naga folklore.",
    significance:
      "Each community has its own dances and dress, and the festival is a stage where they appear together. The agricultural festivals of individual communities are held separately in their villages at other times of year.",
    places: [
      { place: "Kisama Heritage Village", note: "The main venue, about 12 km from Kohima.", destinationSlug: "kohima" },
      { place: "Kohima", note: "The War Cemetery and the State Museum are within easy reach.", destinationSlug: "kohima" },
    ],
    travelAdvice:
      "Book rooms in Kohima months ahead. Indian citizens from outside Nagaland generally need an Inner Line Permit, and foreign nationals have separate rules, so confirm the current requirements with the state government. Ask before photographing performers, and treat the event as a living cultural presentation, not a costume show.",
    wikipediaTitle: "Hornbill Festival",
    sources: [wiki("Hornbill Festival")],
  },
  {
    slug: "bihu",
    name: "Bihu",
    theme: "harvest",
    months: [1, 4, 10],
    dateRule:
      "Three festivals follow Assam's solar-agricultural calendar: Bohag or Rongali Bihu in mid-April (around the Assamese new year), Kati or Kongali Bihu in mid-October, and Magh or Bhogali Bihu in mid-January.",
    confirmedDates: [
      { label: "Magha (Bhogali) Bihu, 14 January 2027 (central government restricted holiday)", year: 2027, source: dopt },
      { label: "Bohag (Rongali) Bihu, 15 April 2027 (central government restricted holiday)", year: 2027, source: dopt },
    ],
    stateSlugs: ["assam"],
    panIndian: false,
    summary:
      "Assam's agricultural festivals. Rongali Bihu in April is the liveliest, with Bihu dance, dhol, pepa and gamosa-giving; Magh Bihu centres on feasts and bonfires; Kati Bihu is a quiet one of lamps in the fields.",
    history:
      "The festivals mark stages of the farming year and are shared across communities in Assam, with variants among groups such as the Mising, Deori and Tiwa.",
    significance:
      "Bohag Bihu is both a new year and a spring festival. Houses are cleaned, cattle are washed on the first day and relatives exchange gifts.",
    places: [
      { place: "Guwahati", note: "Large public Bihu stages and competitions." },
      { place: "Majuli", note: "Village celebrations alongside the island's satra traditions.", destinationSlug: "majuli" },
    ],
    travelAdvice:
      "Book Kaziranga and Guwahati stays well ahead for mid-April. Local transport may be reduced on the main days. Heat and early rain affect April travel.",
    wikipediaTitle: "Bihu",
    sources: [dopt, wiki("Bihu")],
  },
  {
    slug: "pushkar-fair",
    name: "Pushkar Camel Fair",
    theme: "fair",
    months: [11],
    dateRule:
      "Timed to Kartik Purnima, the full moon of the lunar month of Kartika, usually in November, with the livestock trading in the days before.",
    confirmedDates: [],
    stateSlugs: ["rajasthan"],
    panIndian: false,
    summary:
      "An annual livestock fair and pilgrimage at Pushkar, where camels and horses are traded, with sports, folk performances and ritual bathing in the lake.",
    history:
      "Pushkar is an ancient pilgrimage town with one of the few temples to Brahma. The fair grew from the seasonal gathering of herders and traders and the lake bathing at Kartik Purnima.",
    significance:
      "It combines devotion with commerce, and many families of the Rebari and other herding communities attend. The number of camels in Rajasthan has fallen in recent decades.",
    places: [
      { place: "Pushkar", note: "The fairground lies on the dunes beside the town; the lake ghats are the focus of ritual bathing." },
    ],
    travelAdvice:
      "Accommodation, including tented camps, books out months ahead and rates rise sharply. The town is a pilgrimage site, so avoid alcohol and meat, dress modestly and take care with the garlands and offerings sold at the ghats. Be firm and polite with touts.",
    wikipediaTitle: "Pushkar Camel Fair",
    sources: [wiki("Pushkar Camel Fair")],
  },
  {
    slug: "rath-yatra",
    name: "Rath Yatra",
    theme: "religious",
    months: [6, 7],
    dateRule:
      "The second day (dwitiya) of the bright fortnight of Ashadha in the Hindu lunisolar calendar, falling in late June or July.",
    confirmedDates: [
      { label: "5 July 2027 (central government restricted holiday)", year: 2027, isoStart: "2027-07-05", source: dopt },
    ],
    stateSlugs: ["odisha"],
    panIndian: false,
    summary:
      "The deities Jagannath, Balabhadra and Subhadra are drawn on enormous wooden chariots along Puri's Grand Road (Bada Danda) to the Gundicha Temple. Rath Yatras are also held in many other cities.",
    history:
      "The Jagannath tradition is centuries old, and the festival is recorded in Odia and Sanskrit texts. The English word juggernaut derives from Jagannath, a legacy of colonial-era accounts.",
    significance:
      "Hundreds of thousands pull the ropes. Entry to the Jagannath Temple is restricted to Hindus, but the chariot festival offers a rare chance for everyone to see the deities in public.",
    places: [
      { place: "Puri", note: "The main festival, on the Grand Road between the Jagannath and Gundicha temples.", destinationSlug: "puri-konark" },
    ],
    travelAdvice:
      "The crowd is extreme, and heat and humidity are high. Reserve accommodation and trains well ahead, keep to the edge of the road and expect road closures. Non-Hindus are not admitted to the temple itself, though they may watch the procession.",
    wikipediaTitle: "Ratha Yatra",
    sources: [dopt, wiki("Ratha Yatra")],
  },
  {
    slug: "hemis",
    name: "Hemis Festival",
    theme: "religious",
    months: [6, 7],
    dateRule:
      "Held over two days at Hemis Monastery around the tenth day of the fifth month of the Tibetan lunar calendar, usually in June or July. The monastery announces the dates each year.",
    confirmedDates: [],
    stateSlugs: ["ladakh"],
    panIndian: false,
    summary:
      "A monastic festival of masked cham dances performed in the courtyard of Hemis Monastery, one of the largest in Ladakh. A giant thangka is displayed on certain years.",
    history:
      "The festival is tied to Padmasambhava, who is revered in the Drukpa tradition, and the monastery dates from the seventeenth century in its present form.",
    significance:
      "The dances are a religious practice, not a stage show. They are said to dispel obstacles and evil influences and are watched by local families in festive dress.",
    places: [
      { place: "Hemis Monastery", note: "About 45 km from Leh on the Indus valley road.", destinationSlug: "leh" },
    ],
    travelAdvice:
      "Allow time for altitude acclimatisation in Leh first. Dress modestly, do not walk through the dance space, ask before photographing monks and keep to the seating areas. Rooms in Leh sell out in peak summer.",
    wikipediaTitle: "Hemis Monastery",
    sources: [wiki("Hemis Monastery")],
  },
  {
    slug: "losar",
    name: "Losar",
    theme: "religious",
    months: [2, 3, 12],
    dateRule:
      "The Tibetan Buddhist new year, set by regional lunar calendars. Dates differ by community and region: Ladakh's observance is often held earlier than Tibetan Losar in Sikkim and Arunachal Pradesh, so check with the local monastery or tourism office.",
    confirmedDates: [],
    stateSlugs: ["ladakh", "sikkim", "arunachal-pradesh", "himachal-pradesh"],
    panIndian: false,
    summary:
      "The new year of Tibetan Buddhist communities, with prayers, cleaning of homes, offerings, special foods such as guthuk soup and family gatherings.",
    history:
      "Pre-Buddhist and Buddhist elements combine in the observances, which are practised by Tibetan, Monpa, Sherpa and Himalayan communities with local variations.",
    significance:
      "Monasteries hold prayers and dances, and families visit one another over a number of days.",
    places: [
      { place: "Leh", note: "Households and monasteries mark the new year in winter.", destinationSlug: "leh" },
      { place: "Tawang", note: "Monpa communities observe Losar at Tawang Monastery.", destinationSlug: "tawang" },
      { place: "Gangtok", note: "Celebrations in the Tibetan and Bhutia communities.", destinationSlug: "gangtok" },
      { place: "Spiti", note: "Monasteries at Key and Tabo hold ceremonies.", destinationSlug: "spiti-valley" },
    ],
    travelAdvice:
      "Winter access to Ladakh and Spiti is limited by snow and extreme cold. Many shops close for several days. Observances are largely private or monastic, so ask before attending.",
    wikipediaTitle: "Losar",
    sources: [wiki("Losar")],
  },
  {
    slug: "kumbh-mela",
    name: "Kumbh Mela",
    theme: "religious",
    months: [1, 2, 3, 4, 5, 8, 9],
    dateRule:
      "Held in rotation at Prayagraj, Haridwar, Nashik-Trimbakeshwar and Ujjain, each roughly every twelve years, with timing fixed by the positions of Jupiter and the sun. Bathing dates (snans) are announced by the authorities and the akharas, and the month differs by site. Nashik-Trimbakeshwar is next in the cycle after the 2025 Maha Kumbh at Prayagraj, with its main bathing days in 2027.",
    confirmedDates: [
      { label: "Nashik-Trimbakeshwar Simhastha: Amrut Snan on 2 August, 31 August and 11 September 2027 at Nashik, and 12 September at Trimbakeshwar; the Mela runs from 31 October 2026 to 24 July 2028", year: 2027, source: ntkma },
    ],
    stateSlugs: ["uttar-pradesh", "uttarakhand", "maharashtra", "madhya-pradesh"],
    panIndian: false,
    summary:
      "A mass pilgrimage in which Hindus bathe at sacred river sites for spiritual merit. It is among the largest gatherings of people anywhere.",
    history:
      "Traditional accounts link the four sites to drops of nectar from a pot (kumbha) in a Puranic story. The organisation of the akharas, ascetic orders whose members lead processions, is a distinct tradition. UNESCO inscribed the Kumbh Mela on the Representative List of the Intangible Cultural Heritage of Humanity in 2017.",
    significance:
      "Pilgrims, ascetics and families from all over India attend. The processions of the akharas on principal bathing days are the main public spectacle.",
    places: [
      { place: "Prayagraj", note: "The confluence of the Ganga, Yamuna and the mythical Saraswati." },
      { place: "Haridwar", note: "Bathing at Har ki Pauri." },
      { place: "Nashik", note: "The Godavari ghats at Ramkund and the sacred source at Trimbakeshwar." },
      { place: "Ujjain", note: "The Shipra river." },
    ],
    travelAdvice:
      "Official camps, transport and entry controls are set up for each Mela. Follow police and organiser instructions on bathing days, when crowd crush is a real risk, and avoid the main dates if you are not attending as a pilgrim. Check the host state's official announcements for dates.",
    wikipediaTitle: "Kumbh Mela",
    sources: [wiki("Kumbh Mela"), { label: "UNESCO: Kumbh Mela", url: "https://ich.unesco.org/en/RL/kumbh-mela-01258" }, ntkma],
  },
  {
    slug: "baisakhi",
    name: "Baisakhi (Vaisakhi)",
    theme: "harvest",
    months: [4],
    dateRule:
      "Set by the solar calendar on the first day of the month of Vaisakh, normally 13 or 14 April.",
    confirmedDates: [
      { label: "14 April 2027 (Vaisakhi, central government restricted holiday)", year: 2027, isoStart: "2027-04-14", source: dopt },
    ],
    stateSlugs: ["punjab", "haryana", "himachal-pradesh", "delhi"],
    panIndian: false,
    summary:
      "The wheat-harvest festival of Punjab and the day on which Sikhs remember the founding of the Khalsa in 1699 at Anandpur Sahib. Gurdwaras hold processions and langar, and farmers celebrate with bhangra.",
    history:
      "Guru Gobind Singh created the Khalsa on Vaisakhi in 1699. The date is also a solar new year observed in other parts of India under different names, such as Puthandu, Pohela Boishakh and Rongali Bihu.",
    significance:
      "A double occasion, one agricultural and one religious. Nagar kirtan processions with the Panj Pyare lead through towns.",
    places: [
      { place: "Anandpur Sahib", note: "The birthplace of the Khalsa, with the Takht Sri Keshgarh Sahib." },
      { place: "Amritsar", note: "Celebrations at the Golden Temple, Harmandir Sahib.", destinationSlug: "amritsar" },
      { place: "Talwandi Sabo", note: "The Vaisakhi fair at Damdama Sahib." },
    ],
    travelAdvice:
      "Gurdwaras expect covered heads and removal of shoes, and tobacco and alcohol are not permitted on the premises. Crowds at Amritsar are large, so go early. April heat in Punjab can reach the high thirties Celsius.",
    wikipediaTitle: "Vaisakhi",
    sources: [dopt, wiki("Vaisakhi")],
  },
  {
    slug: "goa-carnival",
    name: "Goa Carnival",
    theme: "cultural",
    months: [2, 3],
    dateRule:
      "Held over about three days before Ash Wednesday and the start of Lent in the Christian calendar. Because Easter moves, the dates shift between February and early March.",
    confirmedDates: [],
    stateSlugs: ["goa"],
    panIndian: false,
    summary:
      "Parades with floats, costumes, music and dancing, led by the mythical King Momo, take place in Panaji and other towns before Lent.",
    history:
      "The Carnival came to Goa during Portuguese rule. After a period of decline it was revived as a state-supported event from the 1960s.",
    significance:
      "A mainly secular community festival that sits alongside Goa's Catholic calendar. Smaller local carnivals and balls are held in towns across the state.",
    places: [
      { place: "Panaji", note: "The main parade runs through the capital.", destinationSlug: "goa" },
      { place: "Margao, Vasco and Mapusa", note: "Separate local parades follow." },
    ],
    travelAdvice:
      "Book hotels early, because the Carnival coincides with the high season. Check that the parade route is open before travelling, as roads in Panaji are closed during parades.",
    wikipediaTitle: "Goa Carnival",
    sources: [wiki("Goa Carnival")],
  },
  {
    slug: "thrissur-pooram",
    name: "Thrissur Pooram",
    theme: "religious",
    months: [4, 5],
    dateRule:
      "Held on the day the Pooram star (nakshatra) occurs in the Malayalam month of Medam, in April or May.",
    confirmedDates: [],
    stateSlugs: ["kerala"],
    panIndian: false,
    summary:
      "Decorated elephants, percussion ensembles (panchavadyam and the ensemble known as chenda melam), parasol displays and fireworks gather at the Vadakkunnathan Temple in Thrissur.",
    history:
      "Sakthan Thampuran, the Maharaja of Cochin, is said to have established the festival in the late eighteenth century to bring local temples together.",
    significance:
      "Two groups, from the Paramekkavu and Thiruvambady temples, compete in an exchange of parasols and music. The event takes place on the grounds of the temple (the Thekkinkadu Maidan).",
    places: [
      { place: "Thrissur", note: "The Vadakkunnathan Temple grounds and the surrounding maidan." },
    ],
    travelAdvice:
      "The pooram is hot, loud and extremely crowded, and the viewing areas fill hours ahead. Keep clear of elephants and the fireworks area, wear a hat and drink water. Non-Hindus are generally not allowed inside the temple but may watch from the grounds.",
    wikipediaTitle: "Thrissur Pooram",
    sources: [wiki("Thrissur Pooram")],
  },
  {
    slug: "chhath",
    name: "Chhath Puja",
    theme: "religious",
    months: [10, 11],
    dateRule:
      "Observed on the sixth day (shashthi) of the bright fortnight of Kartika, six days after Diwali, in October or November. The rituals last four days.",
    confirmedDates: [
      { label: "Chhath Puja (Surya Shashthi), 4 November 2027 (central government restricted holiday); the rituals run over four days", year: 2027, source: dopt },
    ],
    stateSlugs: ["bihar", "jharkhand", "uttar-pradesh", "delhi"],
    panIndian: false,
    summary:
      "Devotees stand in rivers, ponds or tanks and offer arghya to the setting and rising sun, after a fast, most notably a waterless one on the main day.",
    history:
      "Sun worship is ancient in the Gangetic plain, and the vrat has been maintained by families over generations. It is observed at home, in cities and abroad by migrants from Bihar and eastern Uttar Pradesh.",
    significance:
      "One of the most disciplined fasts in the Hindu calendar. Bamboo baskets with fruit, thekua sweets and sugarcane are offered. Women lead the observance in many families, though many men also keep the fast.",
    places: [
      { place: "Patna", note: "The ghats along the Ganga are filled with devotees." },
      { place: "Delhi", note: "The Yamuna banks and temporary ponds in neighbourhoods.", destinationSlug: "delhi" },
      { place: "Ranchi", note: "Lakes and rivers are set up with ghats." },
    ],
    travelAdvice:
      "Trains to Bihar and eastern Uttar Pradesh are among the most crowded of the year. Observe from a respectful distance, ask before taking photographs of devotees in the water, and expect road closures near ghats.",
    wikipediaTitle: "Chhath",
    sources: [dopt, wiki("Chhath")],
  },
  {
    slug: "losoong",
    name: "Losoong",
    theme: "harvest",
    months: [12],
    dateRule:
      "The Sikkimese new year of the Bhutia and Lepcha communities, held in the tenth month of the Tibetan lunar calendar, usually around December. The Sikkim government and the monasteries announce the exact day.",
    confirmedDates: [],
    stateSlugs: ["sikkim"],
    panIndian: false,
    summary:
      "A harvest and new-year festival marked by archery contests, masked dances at monasteries and feasts. The Namsoong festival that follows is celebrated by the Lepcha community.",
    history:
      "The festival marks the end of the harvest and the beginning of a new agricultural year. Local practices differ among the communities.",
    significance:
      "Families visit relatives and monasteries, and the winter archery competition is a major social occasion.",
    places: [
      { place: "Gangtok", note: "Public events and monastery ceremonies.", destinationSlug: "gangtok" },
      { place: "Rumtek and Phodong monasteries", note: "Monastic observances take place in the Gangtok area." },
    ],
    travelAdvice:
      "December is cold in Sikkim and the high passes can be closed by snow. Some restricted-area permits are required for the north of the state. Check dates locally, as they are set by the lunar calendar.",
    wikipediaTitle: "Losoong",
    sources: [wiki("Losoong")],
  },
  {
    slug: "wangala",
    name: "Wangala",
    theme: "tribal",
    months: [11],
    dateRule:
      "A post-harvest festival of the Garo people, held in the Garo Hills of Meghalaya in around November. Villages choose their own days, and the organisers of the public festival at Asanang announce the dates each year.",
    confirmedDates: [],
    stateSlugs: ["meghalaya"],
    panIndian: false,
    summary:
      "A thanksgiving to Misi Saljong (Saljong), the Garo deity of fertility, marked by drums, gongs, flutes and a line dance. It is sometimes known as the Hundred Drums Festival.",
    history:
      "Traditionally a farming festival in the Garo community, with the dances performed in the open. Many Garos are now Christian, and observances vary between households.",
    significance:
      "The public festival at Asanang near Tura presents the dance and music to visitors and to the community, while village celebrations are held more privately.",
    places: [
      { place: "Asanang, near Tura", note: "The site of the large public celebration in the West Garo Hills." },
    ],
    travelAdvice:
      "Tura is a long journey from Shillong, so allow a full day each way. Ask before photographing dancers and treat the event as an observance of the community, not as a show.",
    wikipediaTitle: "Wangala",
    sources: [wiki("Wangala")],
  },
  {
    slug: "mysuru-dasara",
    name: "Mysuru Dasara",
    theme: "cultural",
    months: [9, 10],
    dateRule:
      "Ten days of Navratri ending on Vijayadashami, in late September or October. The state government announces the programme.",
    confirmedDates: [
      { label: "Vijayadashami, the final day, 9 October 2027 (central government Dussehra holiday); the Karnataka government announces the full programme", year: 2027, source: dopt },
    ],
    stateSlugs: ["karnataka"],
    panIndian: false,
    summary:
      "The state festival of Karnataka. Mysuru Palace is lit each evening and cultural programmes run through the ten days, ending with the Jamboo Savari procession on Vijayadashami.",
    history:
      "The festival is traced to the Vijayanagara kings, and the Wadiyar rulers of Mysore continued and expanded it from the seventeenth century.",
    significance:
      "The palace conducts ceremonies, and the procession carries an idol of the goddess Chamundeshwari on the day. Crafts, food and sports events accompany the main programme.",
    places: [
      { place: "Mysuru Palace", note: "Illuminated on festival evenings; the procession begins at the palace.", destinationSlug: "mysuru" },
      { place: "Chamundi Hill", note: "The temple of Chamundeshwari above the city.", destinationSlug: "mysuru" },
    ],
    travelAdvice:
      "Hotels are heavily booked and prices rise. Tickets for the procession are sold in advance by the district administration. Allow extra time for travel around the palace on event days.",
    wikipediaTitle: "Mysore Dasara",
    sources: [dopt, wiki("Mysore Dasara")],
  },
];
