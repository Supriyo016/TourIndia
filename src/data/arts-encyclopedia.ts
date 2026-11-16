/**
 * Encyclopedia articles for every entry in src/data/arts.ts, written as
 * structured sections so pages can build a table of contents from them.
 *
 * Editorial rules: no invented facts. Where a date, name or claim could not be
 * stated with confidence it has been left out rather than guessed. Living
 * traditions vary from village to village and family to family, and the
 * articles say so. Practitioners are named only when they are widely documented
 * (national awards, institutions they founded, or standard histories).
 * Reviewed 2026-11-16.
 */

export interface ArtSection {
  /** Anchor id, unique within an article. */
  id: string;
  title: string;
  paragraphs: string[];
}

export interface ArtLink {
  label: string;
  url: string;
}

export interface ArtArticle {
  sections: ArtSection[];
  links: ArtLink[];
}

export const ART_ARTICLES_REVIEWED = "2026-11-16";

const s = (id: string, title: string, ...paragraphs: string[]): ArtSection => ({ id, title, paragraphs });
const overview = (...p: string[]) => s("overview", "Overview", ...p);
const history = (...p: string[]) => s("history", "Origins and history", ...p);
const where = (...p: string[]) => s("where", "Where it is practised", ...p);
const form = (title: string, ...p: string[]) => s("technique", title, ...p);
const people = (...p: string[]) => s("people", "Notable practitioners and institutions", ...p);
const seasons = (...p: string[]) => s("seasons", "Seasons and occasions to see it", ...p);
const respect = (...p: string[]) => s("respect", "How to see it respectfully", ...p);

const SNA: ArtLink = { label: "Sangeet Natak Akademi (national academy of music, dance and drama)", url: "https://sangeetnatak.gov.in" };
const MOC: ArtLink = { label: "Ministry of Culture, Government of India", url: "https://www.indiaculture.gov.in" };
const UNESCO_INDIA: ArtLink = { label: "UNESCO: India's elements on the Intangible Cultural Heritage lists", url: "https://ich.unesco.org/en/state/india-IN" };
const HANDICRAFTS: ArtLink = { label: "Office of the Development Commissioner (Handicrafts)", url: "https://handicrafts.nic.in" };
const HANDLOOMS: ArtLink = { label: "Office of the Development Commissioner (Handlooms)", url: "https://handlooms.nic.in" };
const GI: ArtLink = { label: "Intellectual Property India (home of the Geographical Indications Registry)", url: "https://ipindia.gov.in" };
const KALAKSHETRA: ArtLink = { label: "Kalakshetra Foundation, Chennai", url: "https://www.kalakshetra.in" };
const KALAMANDALAM: ArtLink = { label: "Kerala Kalamandalam, Cheruthuruthy", url: "https://www.kalamandalam.ac.in" };
const MUSIC_ACADEMY: ArtLink = { label: "The Music Academy, Madras", url: "https://musicacademymadras.in" };
const SGPC: ArtLink = { label: "Shiromani Gurdwara Parbandhak Committee (manages the Golden Temple)", url: "https://sgpc.net" };
const CIIL: ArtLink = { label: "Central Institute of Indian Languages, Mysuru", url: "https://www.ciil.org" };
const NATIONAL_MUSEUM: ArtLink = { label: "National Museum, New Delhi", url: "https://nationalmuseumindia.gov.in" };
const unesco = (label: string, path: string): ArtLink => ({ label: `UNESCO Intangible Cultural Heritage: ${label}`, url: `https://ich.unesco.org/en/RL/${path}` });

/** State tourism boards, linked from every article whose art form belongs to that state. */
const STATE_TOURISM: Record<string, ArtLink> = {
  "andhra-pradesh": { label: "Andhra Pradesh Tourism", url: "https://tourism.ap.gov.in" },
  "arunachal-pradesh": { label: "Arunachal Pradesh Tourism", url: "https://arunachaltourism.com" },
  assam: { label: "Assam Tourism", url: "https://assamtourism.gov.in" },
  bihar: { label: "Bihar Tourism", url: "https://tourism.bihar.gov.in" },
  chandigarh: { label: "Chandigarh Tourism", url: "https://chandigarhtourism.gov.in" },
  delhi: { label: "Delhi Tourism", url: "https://delhitourism.gov.in" },
  gujarat: { label: "Gujarat Tourism", url: "https://www.gujarattourism.com" },
  "himachal-pradesh": { label: "Himachal Pradesh Tourism", url: "https://himachaltourism.gov.in" },
  "jammu-and-kashmir": { label: "Jammu and Kashmir Tourism", url: "https://www.jktourism.org" },
  karnataka: { label: "Karnataka Tourism", url: "https://www.karnatakatourism.org" },
  kerala: { label: "Kerala Tourism", url: "https://www.keralatourism.org" },
  lakshadweep: { label: "Lakshadweep Tourism", url: "https://www.lakshadweeptourism.com" },
  "madhya-pradesh": { label: "Madhya Pradesh Tourism", url: "https://www.mptourism.com" },
  maharashtra: { label: "Maharashtra Tourism", url: "https://maharashtratourism.gov.in" },
  manipur: { label: "Manipur Tourism", url: "https://manipurtourism.gov.in" },
  meghalaya: { label: "Meghalaya Tourism", url: "https://www.meghalayatourism.in" },
  mizoram: { label: "Mizoram Tourism", url: "https://mizoramtourism.com" },
  odisha: { label: "Odisha Tourism", url: "https://odishatourism.gov.in" },
  punjab: { label: "Punjab Tourism", url: "https://punjabtourism.punjab.gov.in" },
  rajasthan: { label: "Rajasthan Tourism", url: "https://tourism.rajasthan.gov.in" },
  sikkim: { label: "Sikkim Tourism", url: "https://sikkimtourism.gov.in" },
  "tamil-nadu": { label: "Tamil Nadu Tourism", url: "https://www.tamilnadutourism.tn.gov.in" },
  telangana: { label: "Telangana Tourism", url: "https://tourism.telangana.gov.in" },
  tripura: { label: "Tripura Tourism", url: "https://tripuratourism.gov.in" },
  "uttar-pradesh": { label: "Uttar Pradesh Tourism", url: "https://uptourism.gov.in" },
  uttarakhand: { label: "Uttarakhand Tourism", url: "https://uttarakhandtourism.gov.in" },
  "west-bengal": { label: "West Bengal Tourism", url: "https://wbtourism.gov.in" },
};

/** The article's own links, then the tourism boards of its states, without repeats. */
export function furtherReading(slug: string, stateSlugs: string[]): ArtLink[] {
  const own = artArticles[slug]?.links ?? [];
  const states = stateSlugs.map((state) => STATE_TOURISM[state]).filter((link): link is ArtLink => link !== undefined);
  const seen = new Set<string>();
  return [...own, ...states].filter((link) => (seen.has(link.url) ? false : (seen.add(link.url), true)));
}

/** Word count of an article, used by tests and the reading-time line. */
export function articleWords(article: ArtArticle): number {
  return article.sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).filter(Boolean).length;
}

export const artArticles: Record<string, ArtArticle> = {
  // ---------------------------------------------------------------- Classical dance
  bharatanatyam: {
    sections: [
      overview(
        "Bharatanatyam is the classical dance of Tamil Nadu and one of the eight forms recognised as classical by the Sangeet Natak Akademi. It is usually performed solo, and combines three elements that Indian dance theory names separately: nritta, pure rhythmic movement; nritya, expressive dance that interprets a song; and natya, the dramatic element.",
        "To a first-time viewer the most striking features are the half-seated stance called aramandi, with the knees turned out, the crisp striking of the feet against the floor in time with spoken rhythmic syllables, the precise geometry of the arms, and the hand gestures (hastas or mudras) that carry meaning. Equally important is abhinaya, the dancer's facial expression, which can hold a single line of poetry for minutes while exploring its shades of feeling.",
      ),
      history(
        "The dance draws on a long theoretical tradition, including the Natya Shastra attributed to Bharata and later texts such as the Abhinaya Darpana. The sculpted dance poses on the gateways of the Nataraja temple at Chidambaram and at other Tamil temples show how old the movement vocabulary is.",
        "Its immediate ancestor was sadir, performed by hereditary women dancers attached to temples and courts. In the early nineteenth century four brothers at the Thanjavur court, known as the Tanjore Quartet, organised the concert sequence that dancers still follow. In the late nineteenth and early twentieth centuries the hereditary system was attacked by reformers and eventually outlawed, and the dance was renamed and recast for the public stage. Rukmini Devi Arundale, who founded Kalakshetra in 1936, and T. Balasaraswati, a dancer from a hereditary family, are the two figures most often named in this transition, and the debate about what was gained and lost remains part of the form's history.",
      ),
      where(
        "Chennai is the centre of the Bharatanatyam world, with dozens of teachers and the auditoriums of the music and dance season. Thanjavur, Chidambaram and Kanchipuram keep strong links with the temple context. The dance is taught across India and is one of the most widely learned Indian arts abroad, with large communities of students in Singapore, Malaysia, Sri Lanka, the Gulf, Britain and North America.",
      ),
      form(
        "Form, costume and music",
        "A traditional recital, called a margam, moves from abstract to expressive and back. It typically opens with alarippu, an invocation of pure movement; continues with jatiswaram and shabdam; reaches its centre in the varnam, a long piece that alternates rhythmic passages with storytelling; relaxes into padams and javalis on themes of love and devotion; and ends with the fast, joyful tillana and a short closing verse.",
        "The dancer wears a silk sari stitched into a costume with a pleated fan that opens between the knees in the deep stance, temple-style jewellery, flowers in a long braid, and red alta outlining the hands and feet. Ankle bells (salangai) make the footwork audible. The music is Carnatic: a nattuvanar who speaks the rhythmic syllables and keeps time with small cymbals, a vocalist, a mridangam drummer, and usually violin, flute or veena.",
      ),
      people(
        "Kalakshetra in Chennai, founded by Rukmini Devi Arundale, is the best-known institution. T. Balasaraswati is widely regarded as one of the great interpreters of abhinaya. Among later dancers who received major national honours are Yamini Krishnamurthy, Padma Subrahmanyam and Alarmel Valli. Many independent teachers in Chennai run schools that present their students in a formal debut called the arangetram.",
      ),
      seasons(
        "The Chennai music and dance season runs through December and into early January, with daily recitals at the sabhas. The Natyanjali festival at Chidambaram is held around Maha Shivaratri in February or March, with dancers performing in the temple precincts as an offering. Tamil Nadu Tourism's Mamallapuram Dance Festival takes place against the Shore Temple and rock carvings, usually from late December to January. Smaller festivals are held at Thanjavur's Brihadisvara temple.",
      ),
      respect(
        "Arrive before the start, since latecomers are often held at the door until a piece ends. Switch off phones and do not use flash; many venues ban photography altogether. Applause belongs at the end of each item, not during it. At temple festivals, remember you are at a place of worship: remove your shoes where asked, dress modestly and sit where the organisers indicate.",
        "Many sabha programmes in the season are ticketed, but morning lecture-demonstrations and student recitals are often free and a good introduction. If you attend an arangetram, it is an invitation-only family occasion and not a public show.",
      ),
    ],
    links: [SNA, KALAKSHETRA, MOC],
  },

  kathak: {
    sections: [
      overview(
        "Kathak is the classical dance of north India. Its name comes from katha, story, and the kathakars, storytellers who recited and danced episodes from the epics. It is recognised as classical by the Sangeet Natak Akademi and is taught across the country.",
        "Kathak is performed with the legs mostly straight, in contrast to the deep bent-knee stance of the southern forms. Its signatures are fast, flat-footed footwork that makes the dancer's ankle bells ring in exact patterns, rapid spins called chakkars that often end on a precise beat, and subtle, conversational abhinaya. Dancers often recite the rhythmic syllables of a passage aloud before dancing it, a practice called padhant, so the audience can follow the rhythm.",
      ),
      history(
        "The storytelling roots of Kathak lie in temple and devotional settings, where narrative performance of the Krishna legends was central. From the sixteenth century the form developed at Mughal and later regional courts, which brought Persian aesthetics, an emphasis on technical virtuosity and the court's taste for poetry and light classical song such as thumri.",
        "Three main schools or gharanas emerged. The Lucknow gharana, which flourished under the Nawabs of Awadh in the nineteenth century, is known for grace and expressive nuance. The Jaipur gharana is noted for powerful footwork and complex rhythmic compositions. The Banaras gharana is the third recognised school. In the twentieth century Kathak moved to the concert stage and to teaching institutions, and dancers began creating new group choreography alongside the solo tradition.",
      ),
      where(
        "Delhi, Lucknow and Jaipur are the main centres, with Varanasi, Kolkata, Mumbai, Ahmedabad and Bengaluru also home to well-known teachers. Kathak is widely taught in schools and colleges in northern India and in the Indian and Pakistani diasporas.",
      ),
      form(
        "Form, costume and music",
        "A solo recital usually begins with an invocation, followed by a long section of pure dance: thaat, slow poses and small movements of the neck and eyes; aamad, an entrance piece; and a series of rhythmic compositions such as tukda, toda and paran, the last derived from the pakhawaj drum's repertoire. Each composition usually ends with a tihai, a phrase repeated three times to land on the first beat of the cycle. The expressive half of the programme interprets a thumri, bhajan or ghazal, often with the dancer acting out several characters.",
        "Women typically wear a long flared kurta (anarkali) or a lehenga with a fitted top and dupatta; men wear a kurta or angarkha over churidar trousers. Ankle bells, sometimes more than a hundred on each foot, are central. The accompanying ensemble usually includes tabla or pakhawaj, a vocalist, harmonium or sarangi, and sometimes sitar or flute.",
      ),
      people(
        "Pandit Birju Maharaj of the Lucknow gharana was the most famous Kathak dancer of the late twentieth century. Sitara Devi and Kumudini Lakhia, who founded the Kadamb school in Ahmedabad, are among the other widely honoured figures. The Kathak Kendra in New Delhi, the national institute for the form under the Sangeet Natak Akademi, trains dancers and organises performances.",
      ),
      seasons(
        "Winter, from October to March, is the main performance season in north India. The Kathak Kendra's annual festival in Delhi, the Khajuraho Dance Festival in Madhya Pradesh in February, and the Taj Mahotsav at Agra, also in February, regularly include Kathak. Lucknow's cultural calendar and Jaipur's winter festivals are other good opportunities.",
      ),
      respect(
        "Treat a Kathak recital as a concert: arrive on time, silence your phone and keep conversation for the interval. Audiences in India often show appreciation with a quiet 'wah' after a well-placed tihai, which is welcome, but clapping along with the rhythm is not. If a dancer invites the audience to keep the beat with them, join in; otherwise listen.",
      ),
    ],
    links: [SNA, MOC],
  },

  kathakali: {
    sections: [
      overview(
        "Kathakali is the classical dance-drama of Kerala. Actors in towering headdresses, full skirts and painted faces enact stories from the Ramayana, the Mahabharata and the Puranas entirely through gesture, facial expression and movement, while two singers behind them sing the text and a percussion ensemble drives the drama.",
        "It is one of the most visually distinctive theatre forms in the world. The make-up alone takes hours, and characters are identified by its colours. A full traditional performance lasted through the night, beginning after dusk and ending at dawn, lit by a single large bronze oil lamp at the front of the stage.",
      ),
      history(
        "Kathakali took shape in the seventeenth century in the courts and temples of Kerala. It drew on earlier forms such as Krishnanattam, a dance-drama on the life of Krishna associated with the Zamorin of Kozhikode, and Ramanattam, attributed to the ruler of Kottarakkara. It also absorbed the martial training of kalaripayattu, which shows in the actors' strength and flexibility, and the ancient Sanskrit theatre of Kutiyattam.",
        "By the early twentieth century the form had lost much of its patronage. The poet Vallathol Narayana Menon founded the Kerala Kalamandalam in 1930 to revive it, and the institution, now a deemed university at Cheruthuruthy in Thrissur district, remains its most important school.",
      ),
      where(
        "Kathakali is performed across Kerala, at temple festivals, at cultural centres in Kochi and Thiruvananthapuram, and at the Kerala Kalamandalam. Several Kochi venues stage short evening performances for visitors, where you can watch the actors applying their make-up beforehand.",
      ),
      form(
        "Make-up, costume and music",
        "Make-up types identify character. Pacha (green) is used for noble heroes such as Krishna and Arjuna. Kathi (knife) marks proud, aggressive characters such as Ravana, with a green face and red patches. Thadi (beard) comes in red for fierce, evil figures, white for superhuman beings such as Hanuman, and black for hunters and forest dwellers. Kari (black) is used for demonesses, and minukku (radiant) for women and sages, with a softer yellow-orange tone. The white frame around the jaw, the chutti, was traditionally built up from rice paste and paper.",
        "Actors train for years in eye movements, facial control and a vocabulary of hand gestures codified in the text Hastalakshana Deepika. The songs are in Manipravalam, a mix of Malayalam and Sanskrit, and are sung by two vocalists, one keeping time with a gong (chengila) and the other with cymbals (ilathalam). The drums are the loud, cylindrical chenda and the horizontal maddalam. Performances are announced earlier in the evening by kelikottu, a drumming session that tells the village a play will be staged.",
      ),
      people(
        "The Kerala Kalamandalam is the leading training institution, and many of the most celebrated actors carry its name before their own, such as Kalamandalam Gopi and Kalamandalam Ramankutty Nair. Kathakali was traditionally performed only by men; women now train and perform, and there are troupes made up entirely of women.",
      ),
      seasons(
        "Temple festivals in Kerala, mostly between October and May, are the traditional setting and offer the chance to see a long performance as local audiences do. Onam in August or September brings many cultural programmes. Short tourist performances in Kochi run throughout the year, including the monsoon.",
      ),
      respect(
        "At a temple performance, you are a guest at a religious occasion: dress modestly, follow any rules about entering the temple compound, and sit where local people indicate. Not every temple admits non-Hindus to the inner areas, though performances are often held in the outer grounds.",
        "In theatre venues, ask before photographing the make-up session and do not use flash during the performance, which disturbs actors working with fine eye movements. Reading a summary of the story beforehand helps enormously, since the text is sung in Manipravalam.",
      ),
    ],
    links: [SNA, KALAMANDALAM, MOC],
  },

  kuchipudi: {
    sections: [
      overview(
        "Kuchipudi is a classical dance from Andhra Pradesh, named after the village of Kuchipudi in Krishna district where it was preserved by families of performers. It is recognised as classical by the Sangeet Natak Akademi.",
        "It combines quick, rhythmic footwork and fluid, sometimes playful movement with strong acting, speech and song. Compared with Bharatanatyam, to which it is related through shared Carnatic music and theory, Kuchipudi tends to be lighter and more dramatic, with dancers sometimes speaking or singing lines, and the movement flows between poses rather than holding them.",
      ),
      history(
        "Kuchipudi began as a dance-drama tradition performed by troupes of Brahmin men, the bhagavatulu, who travelled from village to village staging stories from the Bhagavata Purana. Tradition credits the saint-composer Siddhendra Yogi with shaping the form and composing Bhama Kalapam, a dance-drama about Krishna's consort Satyabhama that remains its signature work.",
        "In the twentieth century gurus such as Vedantam Lakshminarayana Sastry developed solo items for the concert stage, and women began to dominate the form. Vempati Chinna Satyam, who founded the Kuchipudi Art Academy in Chennai, created a large repertoire of solo and group choreography and trained many of the dancers who spread Kuchipudi internationally.",
      ),
      where(
        "Kuchipudi village, with its training institution and temple, remains a place of pilgrimage for dancers. Hyderabad, Vijayawada, Visakhapatnam and Chennai have many schools, and the form is widely taught among Telugu communities abroad.",
      ),
      form(
        "Form, costume and music",
        "A recital usually opens with an invocation and includes items of pure dance (jatiswaram), expressive pieces drawn from devotional poetry, and excerpts from the dance-dramas. Characters often introduce themselves to the audience in a short entrance dance called the daruvu. The best-known virtuoso item is the tarangam, in which the dancer performs on the rim of a brass plate, sometimes with a pot of water balanced on the head.",
        "The costume resembles that of Bharatanatyam but is often cut differently, with a fan pleat of a different length and sometimes a separate drape. The music is Carnatic, with a vocalist, a nattuvanar keeping the rhythm on cymbals, mridangam, violin and flute or veena.",
      ),
      people(
        "Vedantam Lakshminarayana Sastry and Vempati Chinna Satyam are the two gurus most associated with Kuchipudi's modern form. The dancers Yamini Krishnamurthy and the couple Raja and Radha Reddy brought it to national and international audiences. The Siddhendra Kalakshetram in Kuchipudi village is the form's traditional training centre.",
      ),
      seasons(
        "Winter is the main concert season in Andhra Pradesh and Telangana. Festivals and cultural programmes in Hyderabad and Vijayawada, and Chennai's December season, include Kuchipudi recitals. Village performances of dance-dramas are linked to temple festivals and are announced locally.",
      ),
      respect(
        "As with other classical recitals, arrive on time, switch off phones, and avoid flash photography. In Kuchipudi village, the dance is part of the community's religious and family life; ask before photographing classes and be considerate of the temple setting.",
      ),
    ],
    links: [SNA, MOC],
  },

  "manipuri-dance": {
    sections: [
      overview(
        "Manipuri dance, also called Manipuri Raas, is a classical form from Manipur in north-east India and is recognised by the Sangeet Natak Akademi. It is known for softness and restraint: the dancers' feet barely strike the floor, the knees stay relaxed, and movements flow in continuous curves without sharp accents. Facial expression is gentle and understated.",
        "The best-known works are the Raas Lilas, which depict the love of Krishna and Radha and the gopis. Manipuri also includes vigorous men's dances, above all the drum dance pung cholom, in which dancers play the drum while leaping and spinning.",
      ),
      history(
        "Dance in Manipur is far older than its Vaishnava form. Lai Haraoba, a festival for the pre-Hindu deities of the Meitei people, includes ritual dances led by priestesses called maibis that tell of creation, and many movements of Manipuri dance are traced to it.",
        "Vaishnavism became the court religion in the eighteenth century, and King Bhagyachandra (also known as Ching-Thang Khomba) is credited with composing the classical Raas Lilas and the costume used for them. In the twentieth century Rabindranath Tagore saw Manipuri dance and introduced it at Santiniketan, which helped it reach audiences across India. Sankirtana, the ritual singing, drumming and dancing of Manipur, was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2013.",
      ),
      where(
        "Imphal is the centre, with the Shree Govindajee temple as the main venue for Raas Lila performances and the Jawaharlal Nehru Manipur Dance Academy as the leading training institution. Manipuri is also taught in Kolkata, Santiniketan, Delhi and in Manipuri communities in Assam, Tripura and Bangladesh.",
      ),
      form(
        "Form, costume and music",
        "In the Raas Lilas, the gopis wear the potloi, a stiff, barrel-shaped skirt decorated with mirror work and embroidery, with a sheer veil over the head. Krishna wears yellow with a crown of peacock feathers. The dancers move in circles and lines rather than to the front of the stage, reflecting the dance's origin in temple courtyards.",
        "Music comes from a vocalist and chorus, the pung (a barrel drum played with the hands), cymbals and sometimes flute or esraj. Sankirtana performances, in which men sing and dance with drums and cymbals as an act of worship, are an important part of life-cycle ceremonies in Meitei Vaishnava homes.",
      ),
      people(
        "Guru Bipin Singh is the most widely cited twentieth-century teacher and choreographer of Manipuri dance. The Jawaharlal Nehru Manipur Dance Academy in Imphal, a unit of the Sangeet Natak Akademi, trains dancers and maintains the repertoire.",
      ),
      seasons(
        "Raas Lilas are performed on full-moon nights, especially in autumn, around Kartik Purnima in October or November, and in spring around Holi. Lai Haraoba is held in spring and early summer in many localities. The Manipur Sangai Festival, organised by the state government in late November, includes dance performances for visitors.",
      ),
      respect(
        "Raas Lila performances at the Govindajee temple are acts of worship. Remove your shoes, dress modestly, sit quietly where indicated and ask whether photography is permitted; often it is not. At Lai Haraoba and Sankirtana, which are religious rituals, watch from where you are invited to stand and follow local cues. Check current travel advisories for Manipur before planning a visit.",
      ),
    ],
    links: [SNA, unesco("Sankirtana, ritual singing, drumming and dancing of Manipur", "sankirtana-ritual-singing-drumming-and-dancing-of-manipur-00843"), MOC],
  },

  mohiniyattam: {
    sections: [
      overview(
        "Mohiniyattam is a classical solo dance from Kerala, traditionally performed by women and recognised as classical by the Sangeet Natak Akademi. Its name refers to Mohini, the enchanting female form taken by Vishnu in Hindu mythology.",
        "It is a lasya form, the graceful, feminine mode of dance in Indian theory. Its signature is a gentle swaying of the torso from side to side, often compared to palm fronds or the backwaters of Kerala, with soft footwork and delicate, sustained abhinaya.",
      ),
      history(
        "References to dancers in Kerala temples go back many centuries, but Mohiniyattam's surviving repertoire largely took shape in the nineteenth century at the court of Travancore, where the ruler and composer Swathi Thirunal wrote songs that are still danced. Like other hereditary dance traditions it declined under reform pressures in the early twentieth century.",
        "The poet Vallathol Narayana Menon included it at the Kerala Kalamandalam, founded in 1930, and Kalamandalam Kalyanikutty Amma, one of its first students, researched and reconstructed the repertoire. Later dancers have continued to expand it.",
      ),
      where(
        "Mohiniyattam is centred in Kerala, with leading schools in Thrissur, Thiruvananthapuram and Kochi, and the Kerala Kalamandalam at Cheruthuruthy. It is also taught in Chennai, Mumbai, Delhi and in Malayali communities abroad.",
      ),
      form(
        "Form, costume and music",
        "A recital commonly includes cholkettu, an invocatory piece of pure dance; jatiswaram; varnam, the central composition; padam, an expressive song; and tillana. The dancer's movements stay low and rounded, and the eyes and face carry much of the meaning.",
        "The costume is the white or cream Kerala sari with a gold border (kasavu), with the hair gathered into a bun on the left side of the head and circled with jasmine. Music is in Carnatic style, often with Sopana singing typical of Kerala temples, accompanied by mridangam, edakka (a small hourglass drum), flute, violin and veena.",
      ),
      people(
        "Kalamandalam Kalyanikutty Amma is regarded as the mother of modern Mohiniyattam. Kanak Rele, who founded the Nalanda Dance Research Centre in Mumbai, and Bharati Shivaji are among the dancers who developed and documented the form. The Kerala Kalamandalam continues to train dancers.",
      ),
      seasons(
        "Kerala Tourism's Nishagandhi Dance Festival in Thiruvananthapuram, usually held in January, presents classical dance including Mohiniyattam. Temple festivals between October and May and Onam celebrations in August or September also bring performances. The Chennai December season sometimes includes Mohiniyattam recitals.",
      ),
      respect(
        "Follow the usual classical recital etiquette: arrive on time, no flash photography, and applause at the end of each piece. If a performance is held in a temple compound, dress modestly, remove footwear where required and respect any restrictions on entry to inner areas.",
      ),
    ],
    links: [SNA, KALAMANDALAM, MOC],
  },

  odissi: {
    sections: [
      overview(
        "Odissi is the classical dance of Odisha and one of the eight forms recognised by the Sangeet Natak Akademi. It is often described as sculpture in motion: the dancer moves between poses that echo the carved figures of Odisha's temples.",
        "Two basic positions define it. Chauka is a square, grounded stance with the knees bent outward, associated with Jagannath. Tribhanga, the 'three bends', curves the body at the neck, torso and knee into an S-shape, giving the dance its fluid, sensuous quality.",
      ),
      history(
        "Carvings in the Jain caves at Udayagiri near Bhubaneswar, dated to around the second century BCE, show dancers and musicians, and dancing figures fill the walls of later temples such as Konark. Within living memory two traditions carried the dance: the maharis, women who danced in the Jagannath temple at Puri, and the gotipuas, boys dressed as girls who danced outside temples and at festivals.",
        "The twelfth-century Sanskrit poem Gita Govinda by Jayadeva, sung daily at Jagannath, became central to the repertoire. In the 1950s a group of gurus and scholars reconstructed Odissi as a concert form, drawing on the mahari and gotipua traditions, the temple sculpture and old texts. The gurus Kelucharan Mohapatra, Pankaj Charan Das, Deba Prasad Das and Mayadhar Raut are the founders of the major styles taught today.",
      ),
      where(
        "Bhubaneswar, Cuttack and Puri are the centres in Odisha, with many schools. The form is widely taught in Kolkata, Delhi, Mumbai and Bengaluru, where the dance village Nrityagram was founded by Protima Bedi in 1990, and abroad. Gotipua troupes can still be seen in villages near Puri, including Raghurajpur.",
      ),
      form(
        "Form, costume and music",
        "A traditional recital opens with mangalacharan, an invocation to Jagannath or another deity, often with a salutation to the earth. It continues with batu or sthayi, a piece of pure dance built on the basic positions; pallavi, a lyrical elaboration of a raga; abhinaya, expressive interpretation of poetry, often from the Gita Govinda or Odia devotional poets; and moksha, a concluding dance of release.",
        "Dancers wear silk saris, frequently in Odisha weaves such as Sambalpuri or Bomkai, stitched into a pleated costume; silver filigree jewellery; and a crown-like headpiece of white sola pith flowers. The music is Odissi music, with a vocalist, the mardala drum, flute, sitar or violin, and small cymbals (manjira).",
      ),
      people(
        "Kelucharan Mohapatra is the best-known guru of Odissi. Sanjukta Panigrahi was among the first Odia women to make Odissi a professional career, and Sonal Mansingh and Madhavi Mudgal are among the dancers who received major national honours. Nrityagram, near Bengaluru, is a residential dance school founded by Protima Bedi.",
      ),
      seasons(
        "The Konark Dance Festival is held in the open-air auditorium beside the Sun Temple in early December. The Mukteshwar Dance Festival, against the tenth-century Mukteshwar temple in Bhubaneswar, is held in January, and the Dhauli-Kalinga Mahotsav near Bhubaneswar in winter. Odisha Tourism publishes dates each year.",
      ),
      respect(
        "Usual classical etiquette applies. Festivals at monuments are often free and crowded; arrive early for a seat, keep paths clear and avoid flash. When visiting gotipua schools, which are training grounds for young boys, ask before photographing and support the troupe by buying a ticket or making a contribution where one is invited.",
      ),
    ],
    links: [SNA, MOC],
  },

  sattriya: {
    sections: [
      overview(
        "Sattriya is a dance tradition of the Vaishnava monasteries (satras) of Assam. The Sangeet Natak Akademi recognised it as a classical dance in 2000, making it the most recent addition to the list.",
        "It combines devotional narrative, music and movement in a vocabulary distinct from other Indian classical forms. Dances are divided into those performed in the masculine, vigorous paurashik bhangi and the graceful, feminine stri bhangi, and much of the repertoire comes from dance-dramas about Krishna and Rama.",
      ),
      history(
        "The form was created in the fifteenth and sixteenth centuries by the saint, poet and reformer Srimanta Sankardev, who founded the neo-Vaishnava movement in Assam, and his disciple Madhavdev. Sankardev wrote one-act plays called Ankiya Naat, performed in a style called Bhaona, and composed devotional songs (borgeet), and Sattriya grew out of the dance in these performances.",
        "For about five centuries it was performed within the satras by celibate male monks (bhakats) as part of daily ritual and festivals. In the twentieth century it moved onto the public stage, and women now perform it widely, though in the satras it remains a monastic practice.",
      ),
      where(
        "The satras of Majuli, the river island in the Brahmaputra, are the heartland, including Auniati, Dakhinpat, Garamur and Uttar Kamalabari. Satras elsewhere in Assam, such as at Barpeta, also maintain the tradition. Guwahati has many schools teaching Sattriya to the public.",
      ),
      form(
        "Form, costume and music",
        "The repertoire includes ritual dances that open a performance, such as Sutradhari nach, performed by the narrator-director of the Bhaona, as well as Gosai prabesh, Chali nach and Jhumura. Movements are often grounded, with strong footwork in the male style and flowing curves in the female style.",
        "Costumes are made of Assamese silk, especially white or cream pat silk, with turbans for male roles. The music comes from the khol, a clay or wooden drum, taal cymbals, flute and singing of borgeet in Brajavali, a literary language Sankardev used for his compositions. Masks made in the satras are used for some Bhaona characters, and mask-making is a notable craft in Majuli.",
      ),
      people(
        "Guru Jatin Goswami is among the most widely honoured exponents and teachers of Sattriya. The satras of Majuli, and the Uttar Kamalabari satra in particular, are known for maintaining the dance and training young monks.",
      ),
      seasons(
        "Raas Mahotsav in Majuli, held around the Kartik full moon in October or November, is the best time to see Bhaona and dance in the satras. Satras also stage performances for important dates in the Vaishnava calendar, including the anniversaries of Sankardev and Madhavdev. Guwahati hosts Sattriya festivals and recitals, mostly in winter.",
      ),
      respect(
        "Satras are monasteries and places of worship. Remove your shoes before entering the prayer hall (namghar), dress modestly, and ask before photographing monks or rituals. Some satras have rules about who may enter particular areas; follow the instructions you are given. Majuli's ferries and roads can be disrupted during the monsoon, so plan visits between October and April.",
      ),
    ],
    links: [SNA, MOC],
  },

  // ---------------------------------------------------------------- Folk dance
  bhangra: {
    sections: [
      overview(
        "Bhangra is the best-known folk dance of Punjab: an exuberant group dance of leaps, shoulder shrugs, raised arms and kicks, driven by the heavy beat of the dhol drum. It is traditionally a men's dance, and its counterpart for women is giddha, built around clapping, call-and-response song and comic verses.",
        "Bhangra today exists in two worlds. In the villages and at Punjab's festivals it remains a celebration of the harvest and of community, while in cities and across the diaspora it has become a competitive stage form and a global popular music genre.",
      ),
      history(
        "Bhangra is associated with the wheat harvest and with Vaisakhi, the spring festival in mid-April that also marks the Punjabi new year and, for Sikhs, the founding of the Khalsa in 1699. Its exact origins are not documented, and several regional dances of undivided Punjab, such as jhumar, luddi and sammi, fed into the stage form that took shape after 1947.",
        "College youth festivals in Indian Punjab from the 1950s onward standardised a competitive bhangra with set formations and costumes. From the 1970s and 1980s, Punjabi communities in Britain fused bhangra rhythms with pop and electronic music, creating the bhangra music scene that spread worldwide.",
      ),
      where(
        "Bhangra is performed throughout Punjab and in Punjabi communities in Haryana, Delhi, Himachal Pradesh, Chandigarh and Rajasthan. It is equally at home in Punjab in Pakistan, and in Britain, Canada, the United States and Australia, where university and community teams compete.",
      ),
      form(
        "Form, costume and music",
        "Dancers move in a circle or in lines, responding to the dhol player who leads them. Between bursts of dancing, a dancer often sings a boli, a short rhyming couplet, and the group answers. Props include the sapp, a wooden accordion-like clapper, and the khunda, a long stick.",
        "Performers wear a brightly coloured kurta, a waistcoat, a wrapped lower garment called a chadra or tehmat, and a starched turban with a fan-like crest (turla). Besides the dhol, music comes from the chimta (fire-tong cymbals), the single-string tumbi, the paired flutes called algoza, and singers.",
      ),
      people(
        "Bhangra has no single founding figure. College teams, cultural departments of Punjab's universities and the state's youth festivals have shaped the stage form, while singers and producers in Punjab and Britain created bhangra music.",
      ),
      seasons(
        "Vaisakhi in mid-April is the traditional occasion, with fairs across Punjab, including at Talwandi Sabo and Anandpur Sahib. Lohri in January and weddings through the winter season are the other main opportunities. Cultural shows in Amritsar and Chandigarh present bhangra year-round.",
      ),
      respect(
        "If you are invited to join the dance at a wedding or fair, it is meant warmly and you should accept. Vaisakhi is also a religious festival for Sikhs, so if you visit a gurdwara during it, cover your head, remove your shoes and follow the usual etiquette. Alcohol is common at some weddings but should never be brought near a gurdwara.",
      ),
    ],
    links: [SNA, MOC],
  },

  garba: {
    sections: [
      overview(
        "Garba is a devotional circle dance of Gujarat, performed during Navratri, the nine nights dedicated to the goddess in her many forms. Dancers move in concentric rings around a central lamp or an image of the goddess, clapping and turning in patterns that grow faster through the night.",
        "Dandiya Raas, performed in the same season, is a partner dance in which pairs strike decorated sticks together. The two are often spoken of together, and Navratri nights in Gujarat usually include both. Garba of Gujarat was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2023.",
      ),
      history(
        "The word garba is linked to garbha, womb, and to the garbo, an earthen pot pierced with holes and lit by a lamp inside, which symbolises life and the goddess. Women traditionally danced around it in courtyards and village squares. Dandiya Raas is associated with the raas of Krishna and the gopis.",
        "In the twentieth century, Navratri celebrations grew from neighbourhood gatherings into large organised events, especially in Ahmedabad, Vadodara, Surat and Mumbai, with professional singers and orchestras. Neighbourhood (sheri) garba survives alongside the big ticketed venues.",
      ),
      where(
        "Garba is danced throughout Gujarat, and in Gujarati communities in Mumbai, Rajasthan, Madhya Pradesh and abroad, particularly in Britain, the United States, Canada and East Africa.",
      ),
      form(
        "Steps, dress and music",
        "Basic garba steps are built on two-clap and three-clap patterns (be taali and tran taali), with turns and dips; regional variations are named after places and communities. In Dandiya Raas, dancers in two facing lines strike sticks with partners and move on to the next partner in rotation.",
        "Women wear chaniya choli, a flared skirt with a fitted blouse and a dupatta, often mirror-worked or embroidered; men wear kediyu, a short gathered jacket, over churidar or dhoti. The music combines dhol and singers with modern instruments, and the songs, in Gujarati, praise the goddess Amba and tell stories of Krishna.",
      ),
      people(
        "Garba is a community tradition rather than the domain of particular masters. Singers who lead the large Navratri events in Ahmedabad and Vadodara are well-known figures in Gujarat, and folk music groups preserve older garba songs.",
      ),
      seasons(
        "Navratri falls in the Hindu month of Ashvin, usually in late September or October. Dancing typically starts after the evening aarti and continues past midnight. Gujarat Tourism organises events and publishes dates, and many venues sell passes in advance.",
      ),
      respect(
        "Garba begins with worship of the goddess, and the dance is an offering. Join in once the circle opens to newcomers, follow the pattern of the ring you join, and do not cut across the centre where the lamp or image stands. Remove shoes if asked. Large venues sell passes and have dress expectations; neighbourhood garba is usually open but is a community event, so it is polite to ask.",
      ),
    ],
    links: [unesco("Garba of Gujarat", "garba-of-gujarat-01962"), SNA, MOC],
  },

  ghoomar: {
    sections: [
      overview(
        "Ghoomar is a women's folk dance of Rajasthan, named after ghoomna, to twirl. Dancers in long, heavily flared skirts (ghaghras) circle slowly, turning in place so that the skirt spreads out like a bell, while singing songs of celebration.",
        "The dance is graceful rather than vigorous. The face is often partly covered by a veil, so the hands, the turning skirts and the formation of the circle carry its beauty.",
      ),
      history(
        "Ghoomar is generally said to have originated among the Bhil community and to have been adopted by Rajput women of the princely states, where it was performed at court for festivals and weddings. Its songs and steps vary by region and community.",
        "In the twentieth century Ghoomar became one of Rajasthan's emblematic dances and is now a fixture of cultural programmes, weddings and festival performances.",
      ),
      where(
        "Ghoomar is danced across Rajasthan, with Jaipur, Udaipur, Jodhpur and the Marwar and Mewar regions all having their own styles. It is also performed by Rajasthani communities elsewhere in India.",
      ),
      form(
        "Dress and music",
        "Dancers wear a ghaghra, often of many metres of cloth, with a fitted blouse (kanchli or kurti) and a veil (odhni), along with silver or gold jewellery. Colours and fabrics, such as bandhani tie-dye or gota-patti metallic ribbon, signal festivity.",
        "Music comes from singers, often the dancers themselves, with dholak, harmonium and sometimes shehnai. The songs celebrate festivals, marriages and the goddess, and some are sung only at particular occasions.",
      ),
      people(
        "Ghoomar is a community dance. Many of the performances visitors see are given by professional folk troupes, while the dance is also performed within families, especially at weddings.",
      ),
      seasons(
        "Gangaur, in March or April, and Teej, in the monsoon month of Shravan (July or August), are festivals for the goddess Gauri at which women dance Ghoomar. Weddings in the winter season are another occasion. Hotels and cultural centres in Udaipur and Jaipur stage performances for visitors year-round.",
      ),
      respect(
        "Family and festival performances of Ghoomar are often for women's gatherings; do not photograph without permission and respect requests to stay back. At public festivals such as Gangaur in Jaipur, where processions pass through the old city, watch from the roadside and follow police and organisers' instructions.",
      ),
    ],
    links: [SNA, MOC],
  },

  lavani: {
    sections: [
      overview(
        "Lavani is a form of song and dance from Maharashtra, performed by women to the insistent rhythm of the dholki drum. It is known for its powerful rhythm, quick footwork, expressive gestures and teasing wit, and for lyrics that can be romantic, devotional, social or political.",
        "Lavani is best known as part of tamasha, the travelling popular theatre of Maharashtra, though it is also performed in concerts and has been widely adapted in Marathi films.",
      ),
      history(
        "Lavani flourished in the eighteenth century under the Peshwa rulers in Pune, when poets such as Ram Joshi and Honaji Bala composed songs for performers. Tamasha troupes then carried it through villages and towns.",
        "Many performers came from communities that were marginalised, and they faced social stigma. In the twentieth century singers and composers such as Patthe Bapurao, and later the singer Sulochana Chavan, helped bring Lavani to wider audiences and greater respect.",
      ),
      where(
        "Lavani is performed throughout Maharashtra, with Pune, Mumbai and the districts of western Maharashtra as strongholds. Tamasha theatres operate in a few towns, and troupes perform at village fairs.",
      ),
      form(
        "Form, costume and music",
        "There are two main styles. Phadachi Lavani is a public stage performance with a large audience, while baithakichi Lavani is a more intimate, seated performance where singing dominates. Performances combine dance, song and improvised exchanges with the audience.",
        "Dancers wear the nauvari, a nine-yard sari draped between the legs in the Maharashtrian style, with heavy jewellery and ankle bells. The dholki, a two-headed drum, is the essential instrument, joined by the tuntuni (a single-string instrument), harmonium, cymbals and singers.",
      ),
      people(
        "The poets Ram Joshi and Honaji Bala are associated with the form's classic period. Sulochana Chavan was celebrated as a great Lavani singer, and many tamasha troupes are family enterprises passed down through generations.",
      ),
      seasons(
        "Tamasha troupes traditionally tour from after the monsoon until the next monsoon, roughly October to May, performing at village fairs (jatras). Lavani festivals and cultural programmes in Pune and Mumbai run through the winter.",
      ),
      respect(
        "Lavani performers are artists working in a demanding profession that has long carried stigma. Treat them as you would any stage artist; do not photograph without permission, and respect the performers' boundaries. Paying for tickets or contributing to a troupe directly supports the tradition.",
      ),
    ],
    links: [SNA, MOC],
  },

  "bihu-dance": {
    sections: [
      overview(
        "Bihu dance is the folk dance of Assam's Bihu festivals, above all Rongali (or Bohag) Bihu, which marks the Assamese new year and the start of the agricultural season in mid-April. Young men and women dance in groups with brisk steps, rapid hand movements and swaying hips, to the beat of the dhol drum and the cry of the pepa, a pipe made from buffalo horn.",
        "The dance is full of energy and joy, and Bihu songs (bihugeet) celebrate love, nature and the coming of spring.",
      ),
      history(
        "Bihu is rooted in the agrarian life of the Brahmaputra valley and its communities. Its origins are not documented, though it is clearly old, and in earlier times the dance was performed in open fields and under trees rather than on stages.",
        "In the twentieth century, organised Bihu celebrations on public stages (Bihutoli) and competitions became common, and the form became a symbol of Assamese identity.",
      ),
      where(
        "Bihu dance is performed throughout Assam. Guwahati's large stage events draw big crowds, and villages across the Brahmaputra valley, including Majuli and Sivasagar, hold their own celebrations.",
      ),
      form(
        "Dress and music",
        "Women wear mekhela chador, often in muga silk with red patterns, and flowers in the hair; men wear a dhoti, a gamosa (the white woven cloth with a red border, a symbol of Assam) tied round the head or waist, and a vest or kurta.",
        "The music is played on the dhol, the pepa, the toka (a bamboo clapper), the gogona (a jaw harp) and the xutuli (a clay whistle). The husori tradition sees groups of singers and drummers visiting homes to sing blessings and receive gifts.",
      ),
      people(
        "Bihu is a community tradition. Well-known Assamese singers perform at the big stage events, but the dance belongs to everyone.",
      ),
      seasons(
        "Rongali Bihu, around 14 April, is the main time to see Bihu dance, with celebrations lasting several days or weeks. Kongali Bihu in October and Bhogali Bihu in January are quieter, with feasting more important than dancing.",
      ),
      respect(
        "Visitors are welcome at public Bihu events. If you are invited into a home during husori, a small gift or contribution is customary. The gamosa is a respected cloth, not a casual souvenir: if given one, accept it with both hands.",
      ),
    ],
    links: [SNA, MOC],
  },

  chhau: {
    sections: [
      overview(
        "Chhau is a tradition of dance-drama from eastern India, with roots in martial practice and village ritual. It has three main styles, named after their centres: Seraikella in Jharkhand, Purulia in West Bengal and Mayurbhanj in Odisha. Seraikella and Purulia Chhau are performed with masks; Mayurbhanj Chhau is performed without.",
        "Chhau dance was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2010.",
      ),
      history(
        "Chhau grew up in the former princely states of the region, whose rulers patronised troupes for spring festivals. Its movements include mock combat techniques, stylised walking styles and imitations of animals and birds, which suggest links with martial training.",
        "In the twentieth century, as royal patronage declined, the dance passed to village troupes, state academies and cultural bodies, and it now appears on stages across India and abroad.",
      ),
      where(
        "Seraikella and its surroundings in Jharkhand, Purulia district in West Bengal and Mayurbhanj district (with Baripada as its centre) in Odisha are the heartlands. Village troupes in all three areas maintain the form.",
      ),
      form(
        "Form, masks and music",
        "Performances present episodes from the Ramayana, the Mahabharata and the Puranas, as well as themes from local folklore. Purulia Chhau is energetic and acrobatic, with large, colourful masks and elaborate headdresses made from papier mache, notably in Charida village. Seraikella masks are smaller and more stylised, and the dance is more lyrical. Mayurbhanj Chhau uses facial expression and vigorous movement without masks.",
        "The music is played on the dhol, the dhamsa (a large kettledrum), the shehnai or mohuri (a reed instrument) and other drums, and the energetic rhythm drives the dancers.",
      ),
      people(
        "Gambhir Singh Mura, a Purulia Chhau dancer, received the Padma Shri, India's fourth highest civilian award. Many village troupes are family or community enterprises, and the mask-makers of Charida in Purulia are known for their craft.",
      ),
      seasons(
        "Chaitra Parva, in March or April, is the main festival in Seraikella and Mayurbhanj, with the dances performed as part of spring worship. In Purulia, Chhau is performed from winter through to summer, including around Makar Sankranti in mid-January and at the Chhau festival organised by West Bengal Tourism.",
      ),
      respect(
        "Chaitra Parva is a religious festival with rituals that precede the dances. Watch from where you are invited, ask before photographing rituals, and contribute to the troupe if you film or photograph them. Masks are made by artisans; if you buy one, buying directly in Charida supports the craft.",
      ),
    ],
    links: [unesco("Chhau dance", "chhau-dance-00337"), SNA, MOC],
  },

  kalbelia: {
    sections: [
      overview(
        "Kalbelia is the song and dance of the Kalbelia community of Rajasthan. The women's dance, with its sinuous, fluid movements, spinning in black skirts embroidered with mirrors and silver thread, evokes the serpent with which the community has long been associated.",
        "Kalbelia folk songs and dances of Rajasthan were inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2010.",
      ),
      history(
        "The Kalbelias were historically a semi-nomadic community of snake-catchers and snake-charmers, who also traded snake venom and performed. Following the Wildlife Protection Act of 1972, which outlawed snake-charming, performance became a main source of livelihood.",
        "Their songs draw on mythology and folklore and are passed down orally; performers often improvise lyrics. In the late twentieth century Kalbelia dance became one of the best-known folk forms of Rajasthan, at festivals and international events.",
      ),
      where(
        "Kalbelia communities live mainly in Rajasthan, particularly in and around Pushkar, Ajmer, Jodhpur, Jaisalmer and Chittorgarh. Performances are common at tourist venues and festivals across the state.",
      ),
      form(
        "Dress and music",
        "Women wear a black ghaghra and odhni, embroidered and decorated with mirrors, beads and silver thread, with heavy silver jewellery. Dancers move with fast spins, swaying arms and back-bends, and some perform acrobatic feats.",
        "Men play the music: the pungi (a gourd wind instrument associated with snake-charming), dafli (frame drum), khanjari (tambourine), morchang (jaw harp), dholak and khurdak (small kettledrum). Singers improvise and sing traditional songs.",
      ),
      people(
        "Gulabo Sapera, a Kalbelia dancer who received the Padma Shri, is the best-known performer of the form and has brought it to international audiences.",
      ),
      seasons(
        "The Jaisalmer Desert Festival in January or February, the Pushkar Camel Fair in October or November, and the Marwar Festival at Jodhpur in October are good occasions. Performances in hotels and cultural centres run through the winter tourist season.",
      ),
      respect(
        "Kalbelia performers rely on audiences for their living. Pay for tickets, and if you film or photograph a performance, a contribution is expected. Do not encourage snake-charming, which is illegal and harms the animals. Respect performers' dignity and ask before taking close-up portraits.",
      ),
    ],
    links: [unesco("Kalbelia folk songs and dances of Rajasthan", "kalbelia-folk-songs-and-dances-of-rajasthan-00340"), SNA, MOC],
  },

  cheraw: {
    sections: [
      overview(
        "Cheraw is the bamboo dance of Mizoram. Men sit facing each other in pairs, holding long bamboo poles horizontally near the ground, and clap them together and apart in a fast rhythm, while women dance in and out between the poles, stepping with timing and grace.",
        "It is a lively, rhythmic dance, and its skill lies in perfect timing between the pole-holders and the dancers.",
      ),
      history(
        "Cheraw is regarded as one of the oldest dances of the Mizo people. Its early history is held in oral tradition rather than written records. One often-repeated account links it with rites for a mother who had died in childbirth, performed so that her spirit could pass peacefully; whatever its first purpose, it has long since become a dance of celebration.",
        "Bamboo pole dances are found across a wide area of South and South-East Asia, from the tinikling of the Philippines to dances in Thailand, Myanmar and among other communities of north-east India, which suggests a shared heritage of bamboo cultures. In Mizoram, where most people today are Christian, Cheraw has remained a symbol of identity and is performed at secular festivals, church and community events, and state occasions.",
      ),
      where(
        "Cheraw is performed throughout Mizoram, in Aizawl and in towns and villages such as Lunglei, Champhai and Serchhip, and by Mizo communities in neighbouring Manipur, Tripura and Assam. Schools and colleges teach it, and cultural troupes present it at national festivals in Delhi and elsewhere.",
      ),
      form(
        "Form, dress and music",
        "Two long, thick bamboo poles are laid parallel on the ground as a base. Across them, pairs of thinner bamboo staves are held at each end by men squatting or sitting on the ground. The men tap the staves on the base poles and strike them together in a steady pattern of opening and closing. The dancers, usually women, step into the gaps while the poles are open and out again before they close, working through steps that change as the rhythm changes. In large performances there are many pairs of staves arranged in a grid, and the dancers move across the whole formation.",
        "The women's costume includes the puanchei, the most colourful of the Mizo striped wrap skirts, worn with the kawrchei blouse and a headdress. The rhythm comes from the clapping bamboo itself, joined by gongs and drums, and in some performances by singing.",
      ),
      people(
        "Cheraw belongs to the Mizo community as a whole rather than to particular masters. Village and church youth groups, school teams and state cultural troupes keep it alive, and large group performances are a matter of local pride.",
      ),
      seasons(
        "Chapchar Kut, the spring festival celebrated in March after the clearing of fields for cultivation, is the main occasion; Aizawl's celebrations draw thousands of dancers and spectators, with Cheraw at their centre. The harvest festivals Mim Kut and Pawl Kut, and state events through the dry season from October to April, also feature the dance.",
      ),
      respect(
        "Indian visitors to Mizoram need an Inner Line Permit, and foreign nationals must register with the authorities after arrival; check the current rules with Mizoram Tourism before travelling. Sunday is widely observed as a day of rest and worship, and most shops and events close.",
        "If you are invited to try Cheraw, follow the dancers' guidance and start slowly, since a mistimed step can bring the bamboo down on an ankle. Ask before photographing individuals, and remember that festival performances are community celebrations rather than shows staged for visitors.",
      ),
    ],
    links: [SNA, MOC],
  },

  karakattam: {
    sections: [
      overview(
        "Karakattam is a folk dance of Tamil Nadu in which dancers balance a decorated pot (karagam) on their heads while dancing to music. The pot may contain water or uncooked rice, and is decorated with flowers, leaves and a tall conical top.",
        "The dance is performed in honour of the rain goddess Mariamman and other village goddesses, and is a common feature of temple festivals.",
      ),
      history(
        "Karakattam is bound up with the worship of Mariamman, the village goddess of Tamil Nadu who is believed to bring rain and protect communities from disease, and with other mother goddesses. The pot, filled with water or grain, represents the goddess and the fertility of the land, and carrying it in procession is an act of devotion and a vow.",
        "Over time two broad forms developed. Sakthi karagam is ritual: the pot is carried by a devotee, often after fasting and purification, from a water source to the temple as part of the festival. Aatta karagam, the 'dancing karagam', is a performing art in which professional dancers show off their balance and skill to entertain festival crowds. The two often appear at the same festival.",
        "Karakattam is one of many Tamil folk arts, alongside forms such as oyilattam, kavadi attam and therukoothu, which flourished in village festival culture. Their history is mainly oral, carried by performing families and festival committees.",
      ),
      where(
        "Karakattam is found across Tamil Nadu, and is especially common in the southern and central districts around Madurai, Thanjavur, Tiruchirappalli and Tirunelveli. Tamil communities in Sri Lanka, Malaysia and Singapore also perform it at temple festivals. In Chennai it appears at folk festivals and state cultural programmes.",
      ),
      form(
        "Form, dress and music",
        "The karagam is a brass or clay pot, often topped with a tall cone of flowers, leaves or coloured paper and sometimes a parrot figure. Dancers balance it on the head without using their hands while performing steps, turns and squats, and in the Aatta karagam style add acrobatics such as bending backwards to pick up objects from the floor, dancing on a wooden plank or climbing and descending ladders.",
        "Performers wear bright costumes, often a short sari or a skirt and blouse for women and a dhoti or shorts with a vest for men, with ankle bells. The music is loud and festive, played on the nadaswaram, a long double-reed pipe, and the thavil, a barrel drum, or by a naiyandi melam, a folk band of pipes and drums.",
      ),
      people(
        "Karakattam is practised mostly by hereditary village troupes and folk performers, often within families who travel the festival circuit. The Tamil Nadu state academy for the arts, Tamil Nadu Eyal Isai Nataka Mandram, supports folk performers and stages folk festivals.",
      ),
      seasons(
        "Temple festivals for Mariamman and other goddesses, especially in the Tamil month of Aadi (mid-July to mid-August) and in the hot season from March to May, are the main occasions. Pongal in mid-January and Chennai's folk arts festivals, often held around the same time, bring performances to the city.",
      ),
      respect(
        "Sakthi karagam processions are religious rites: stand aside to let them pass, do not touch the pot or the bearer, and ask before photographing. At temple festivals dress modestly and remove footwear in the temple precincts.",
        "Aatta karagam performers are professionals who rely on payment from festival committees and audiences. If you film or photograph a performance closely, a contribution to the troupe is a courteous way to say thank you.",
      ),
    ],
    links: [SNA, MOC],
  },

  "dollu-kunitha": {
    sections: [
      overview(
        "Dollu Kunitha is a vigorous drum dance from Karnataka, performed by men who sling large drums (dollu) from their shoulders and beat them while dancing in synchronised patterns. It is loud, energetic and spectacular.",
        "The dance is associated with the Kuruba community and with the worship of Beereshwara, a form of Shiva.",
      ),
      history(
        "Dollu Kunitha belongs to the devotional life of the Kuruba community, traditionally shepherds and weavers of woollen blankets, and to the worship of Beereshwara (also called Beeralingeshwara), a deity associated with Shiva. Drumming accompanies festivals at Beereshwara shrines, and the songs sung between drumming passages tell religious and heroic stories.",
        "A legend told in the community explains the drum itself: the deity is said to have defeated a demon and used its skin to make the first dollu. Whether or not they know the story, audiences recognise the dance as an expression of strength and devotion. In the twentieth century Dollu Kunitha became one of Karnataka's emblematic folk arts and now represents the state at national parades and festivals.",
      ),
      where(
        "The dance is performed across Karnataka, and is especially strong in the central and southern districts, such as Shivamogga, Chitradurga, Tumakuru and the area around Bengaluru and Mysuru. Troupes perform at village festivals, state events and processions, and are often hired for celebrations.",
      ),
      form(
        "Form, dress and music",
        "A troupe usually has around ten to sixteen drummers. Each carries a large barrel drum hung from the shoulder or neck by a strap and beats it with sticks or the hands while dancing. A leader at the centre, often with cymbals or a whistle, sets the tempo and calls the changes. The group moves in lines, circles and semicircles, with sudden leaps, spins and squats, and at the climax may form a human pyramid while still drumming.",
        "Dancers typically wear a dhoti or a short lower garment with a sash or a jacket, and sometimes a turban; many troupes now have matching costumes. There are no melodic instruments in the drumming passages; the songs, sung by the group in Kannada between bursts of drumming, carry the narrative.",
      ),
      people(
        "Dollu Kunitha is a community tradition kept alive by village troupes, mostly from the Kuruba community, though men from other communities now also perform. The Karnataka Janapada Academy, the state body for folk arts, supports troupes and records the repertoire.",
      ),
      seasons(
        "The Mysuru Dasara procession on Vijayadashami, in September or October, includes Dollu Kunitha troupes among the folk groups that accompany the caparisoned elephants. Karnataka Rajyotsava on 1 November, Hampi Utsav (usually held in winter) and village festivals for Beereshwara are other good occasions.",
      ),
      respect(
        "Dollu Kunitha is extremely loud at close quarters; keep a little distance, especially with children. During processions, stay behind barriers and follow police instructions, since crowds at Mysuru Dasara are very large.",
        "At village festivals, the drumming is part of worship. Ask before photographing, dress modestly near the shrine, and if you film a troupe for long, offer a contribution.",
      ),
    ],
    links: [SNA, MOC],
  },

  // ---------------------------------------------------------------- Music
  "hindustani-music": {
    sections: [
      overview(
        "Hindustani music is the classical music of northern, central and eastern India, and of Pakistan, Bangladesh and Nepal. It is built on two ideas. A raga is a melodic framework, more than a scale and less than a tune, with its own ascending and descending movement, characteristic phrases, important notes and mood; many ragas are traditionally associated with a time of day or a season. A tala is a cycle of beats, such as the sixteen-beat teentaal, within which the musicians improvise.",
        "A performance is largely improvised within these rules. The soloist develops a raga slowly and then with increasing speed and rhythmic complexity, in dialogue with the drummer, so that no two performances are the same.",
      ),
      history(
        "Indian music theory goes back to the Natya Shastra and to later treatises such as Sharngadeva's thirteenth-century Sangita Ratnakara. From around that time the music of north India developed in a distinct direction from the south, absorbing influences from Persian and Central Asian music at the Delhi Sultanate and Mughal courts. Tansen, the sixteenth-century singer at Akbar's court, is the most famous musician of the period.",
        "Dhrupad, a grave and austere vocal style, was the dominant classical form of the Mughal era. Khayal, more flexible and ornate, rose to prominence in the eighteenth century and is now the main vocal form. Lighter classical forms such as thumri, dadra and tappa developed at courts and in the salons of courtesans. Musical knowledge was passed on within families and lineages called gharanas, such as the Gwalior, Agra, Kirana, Jaipur-Atrauli and Patiala gharanas in vocal music, each with its own style. In the twentieth century, radio, recordings, music colleges and public concerts took the music to mass audiences.",
      ),
      where(
        "The music is performed throughout northern India. Major centres include Delhi, Mumbai, Pune, Kolkata, Varanasi, Gwalior, Lucknow and Jaipur. It also has a large following in Pakistan and Bangladesh, and an international audience.",
      ),
      form(
        "Forms and instruments",
        "A raga performance usually begins with an alap, a slow, unmetred exploration of the raga's notes without drum accompaniment. In instrumental music this is followed by jor and jhala, which introduce pulse and speed, and then by compositions (gats) with the tabla. In khayal singing, a slow composition (vilambit) is followed by a faster one (drut), with improvised passages of melodic phrases and rapid runs called taans.",
        "Principal instruments include the sitar and sarod (plucked lutes), the sarangi (a bowed instrument close to the voice), the santoor (hammered dulcimer), the bansuri (bamboo flute), the shehnai (double-reed pipe), the harmonium, the tabla and the pakhawaj (barrel drum, used mainly with dhrupad). The tanpura, a long-necked lute, provides a continuous drone behind the music.",
      ),
      people(
        "Among the most celebrated twentieth-century musicians are the sitarist Ravi Shankar, the sarod player Ali Akbar Khan, the shehnai player Bismillah Khan, the vocalists Bhimsen Joshi, Kishori Amonkar and Gangubai Hangal, the flautist Hariprasad Chaurasia, the santoor player Shivkumar Sharma and the tabla player Zakir Hussain. Leading institutions include the ITC Sangeet Research Academy in Kolkata and the music faculties of several universities.",
      ),
      seasons(
        "The concert season runs mainly from October to March. Major festivals include the Sawai Gandharva Bhimsen Mahotsav in Pune in December, the Tansen Samaroh in Gwalior in December, the Dover Lane Music Conference in Kolkata in January, the Harivallabh Sangeet Sammelan in Jalandhar in December, and the Sankat Mochan Sangeet Samaroh in Varanasi, held in spring around Hanuman Jayanti. Many are free or inexpensive and continue through the night.",
      ),
      respect(
        "Listeners are expected to be quiet during the music. Phones should be silent, and photography is often not allowed. Indian audiences show appreciation with 'wah' or 'kya baat' after a fine phrase, and with applause at the end of a piece or after a striking passage. It is polite to stay until the end of a performance rather than leave in the middle of a raga. All-night festivals are informal: people come and go between performers, eat at stalls, and settle on durries and cushions on the floor.",
      ),
    ],
    links: [SNA, MOC],
  },

  "carnatic-music": {
    sections: [
      overview(
        "Carnatic music is the classical music of south India, centred in Tamil Nadu, Karnataka, Andhra Pradesh, Telangana and Kerala. Like Hindustani music it is built on raga (melodic framework) and tala (rhythmic cycle), but it places more weight on composed songs, and its improvisation grows from and around them.",
        "The heart of the repertoire is the kriti, a composition of several sections with devotional lyrics in Telugu, Sanskrit, Tamil or Kannada. Performers interpret these compositions with ornaments (gamakas) that bend and shake notes in ways typical of the south.",
      ),
      history(
        "Carnatic music developed in the temples and courts of south India, with theory drawn from texts shared with the north. The composer Purandara Dasa (sixteenth century) organised a method of teaching that is still used, and is often called the 'father' of Carnatic music. Three composers of the late eighteenth and early nineteenth centuries, Tyagaraja, Muthuswami Dikshitar and Syama Sastri, known as the Trinity, created the core of the concert repertoire.",
        "In the twentieth century, Madras (Chennai) became the music's capital. The Music Academy, founded in 1928, and many other organisations (sabhas) created a concert season that remains the most important in the Carnatic world. The concert format, with a sequence of compositions and improvisations, was standardised by the vocalist Ariyakudi Ramanuja Iyengar.",
      ),
      where(
        "Chennai is the centre, but Carnatic music is performed and taught across the south, in Bengaluru, Mysuru, Hyderabad, Thiruvananthapuram, Thrissur and many smaller towns, and in Tamil, Telugu, Kannada and Malayali communities around the world.",
      ),
      form(
        "Forms and instruments",
        "A concert often begins with a varnam, an étude-like composition that warms up the voice or instrument, then moves through several kritis in different ragas and talas. The centrepiece may be a ragam-tanam-pallavi, a long improvisation in which a single line of text is developed in many ways. The percussionists usually take a solo (tani avartanam) in the middle of the concert. Lighter pieces, such as bhajans, padams and the fast tillana, close the programme.",
        "Instruments include the veena (plucked lute), the violin (adopted in the eighteenth century and now central), the flute, the nadaswaram (long double-reed pipe, used in temples), the mridangam (double-headed drum), the ghatam (clay pot), the kanjira (small frame drum) and the morsing (jaw harp). A tambura or electronic drone provides the background.",
      ),
      people(
        "Celebrated figures include the vocalists M. S. Subbulakshmi, the first musician to receive the Bharat Ratna, India's highest civilian honour, Semmangudi Srinivasa Iyer and M. Balamuralikrishna; the violinist Lalgudi Jayaraman; and the mridangam player Palghat Mani Iyer. The Music Academy in Chennai awards the title Sangita Kalanidhi each year to a leading musician.",
      ),
      seasons(
        "The Chennai music season, called the Margazhi season after the Tamil month, runs from late November to January, with hundreds of concerts every day. The Tyagaraja Aradhana at Thiruvaiyaru, near Thanjavur, is held in January, and the Chembai Sangeetholsavam at Guruvayur in Kerala in November and December. Many other temple and town festivals have concerts throughout the year.",
      ),
      respect(
        "Carnatic audiences often keep time with their hands, counting the tala, which is normal and welcome. Applause comes at the end of a piece and after the percussion solo. Silence phones and avoid flash. In the Chennai season, many morning and afternoon concerts are free, and sabha canteens are a famous part of the experience. At temple festivals, follow dress and entry rules.",
      ),
    ],
    links: [SNA, MUSIC_ACADEMY, MOC],
  },

  baul: {
    sections: [
      overview(
        "The Bauls are mystic minstrels of Bengal, in both West Bengal in India and Bangladesh. They sing songs of a spiritual path that rejects caste and religious division and seeks the divine within the human body, which they call the moner manush, the 'person of the heart'.",
        "Bauls are usually itinerant, travelling from village to village and fair to fair, singing and accompanying themselves on the ektara and other instruments. 'Baul songs' were proclaimed by UNESCO as a Masterpiece of the Oral and Intangible Heritage of Humanity in 2005 and inscribed on the Representative List in 2008, as an element of Bangladesh; the tradition is shared on both sides of the border.",
      ),
      history(
        "The origins of the Baul tradition are uncertain, but it is generally traced to the fifteenth to seventeenth centuries and draws on Vaishnava devotion, Sufi mysticism and Tantric practice. Bauls come from both Hindu and Muslim backgrounds.",
        "Lalon Fakir (also known as Lalon Shah), who lived in the late eighteenth and nineteenth centuries in Kushtia, now in Bangladesh, is the most celebrated Baul poet, and his songs are sung across Bengal. Rabindranath Tagore admired Baul songs and was influenced by them in his own work.",
      ),
      where(
        "In India, Bauls are concentrated in Birbhum, Bardhaman, Nadia and Murshidabad districts of West Bengal. Santiniketan, Kenduli and the surrounding areas have many Baul communities, and Bauls often perform at village fairs and in akhras (gathering places).",
      ),
      form(
        "Songs and instruments",
        "Baul songs are lyrical and allegorical, using images of rivers, boats, birds and the body to describe spiritual seeking. A recurring theme is the 'unknown bird' that comes and goes from the cage of the body, a metaphor for the soul. The songs are sung in Bengali, often in a rustic dialect, and are passed down orally from guru to disciple; many Bauls also compose their own. Performers dance and twirl as they sing, so a Baul performance is as much movement as music.",
        "Baul life traditionally involves initiation by a guru, a simple, often wandering existence supported by alms and performance, and a spiritual discipline that is not usually explained to outsiders. Many Bauls today are householders who also perform professionally.",
        "Instruments include the ektara (a one-stringed drone instrument made from a gourd and bamboo), the dotara (a long-necked lute), the dubki (a small tambourine), the khamak (a plucked drum) and ankle bells. Bauls typically wear saffron or patchwork robes.",
      ),
      people(
        "Lalon Fakir is the most famous Baul poet. In the twentieth century, Purna Das Baul brought Baul music to international audiences. Many Bauls today perform at festivals and record their music.",
      ),
      seasons(
        "Joydev Kenduli Mela in Birbhum, held around Makar Sankranti in mid-January, is the largest gathering of Bauls, with performances in akhras through the night. Poush Mela at Santiniketan, held in late December, also features Baul singing.",
      ),
      respect(
        "Bauls are spiritual seekers as well as performers, and for many of them singing is a form of practice rather than entertainment. Listen respectfully, offer a contribution to the singers, and ask before photographing or recording. At akhras, you are a guest: sit where you are shown, accept tea or food if it is offered, and follow the hosts' customs.",
        "Kenduli is extremely crowded around Makar Sankranti, and accommodation nearby is basic and fills up quickly; many visitors stay in Santiniketan or Bolpur and travel in for the evening. Romanticised ideas of Baul life can obscure the poverty many singers live in, so buying recordings or paying for performances directly is the best support.",
      ),
    ],
    links: [unesco("Baul songs", "baul-songs-00107"), SNA, MOC],
  },

  qawwali: {
    sections: [
      overview(
        "Qawwali is the devotional music of the Sufis of South Asia. A group of singers and musicians, led by one or two lead vocalists, sings poetry in praise of God, the Prophet Muhammad and Sufi saints, building from a calm opening to a powerful, rhythmic climax intended to bring listeners closer to a state of spiritual ecstasy.",
        "It is performed at dargahs, the shrines of Sufi saints, especially at the gatherings called mehfil-e-sama, as well as on the concert stage.",
      ),
      history(
        "Qawwali is associated with the Chishti Sufi order, which became prominent in north India from the thirteenth century. Amir Khusrau, the poet and musician who was a disciple of the Sufi saint Nizamuddin Auliya in Delhi, is traditionally credited with shaping the form, and his compositions are still sung.",
        "Qawwali spread with the Chishti order across north India and later to what is now Pakistan. In the twentieth century, recordings and films made it popular well beyond the shrines.",
      ),
      where(
        "Qawwali is performed at Sufi shrines across north India, including Nizamuddin Dargah in Delhi, Ajmer Sharif in Rajasthan, and dargahs in Uttar Pradesh, Hyderabad and elsewhere. It is also performed widely in Pakistan.",
      ),
      form(
        "Form and instruments",
        "A qawwali performance usually begins with an instrumental prelude and a short sung introduction, followed by poetry in Persian, Urdu, Hindavi, Braj or Punjabi. The repertoire includes hamd (praise of God), naat (praise of the Prophet), manqabat (praise of the saints, especially Ali and the saint of the shrine) and ghazals with a mystical meaning. The lead singer improvises around the lyrics, often inserting lines from other poems that deepen the meaning, while the chorus repeats key phrases and claps, gradually raising the tempo and intensity.",
        "Instruments include the harmonium, the tabla and the dholak. Hand-clapping by the chorus is an essential part of the rhythm. At shrines, a session usually ends with a closing composition, and at Nizamuddin the annual Urs of Amir Khusrau and of Nizamuddin Auliya are occasions for special repertoire.",
        "The aim of sama, the Sufi practice of listening, is spiritual. Listeners may be visibly moved, and the qawwals respond to the mood of the gathering, repeating a line that has touched someone. This interplay is the heart of qawwali at a shrine, and is different from a staged concert.",
      ),
      people(
        "Amir Khusrau is regarded as the father of qawwali. In the twentieth century, Nusrat Fateh Ali Khan of Pakistan brought it to international fame. At Nizamuddin Dargah, the Nizami Brothers are among the families who have sung for generations.",
      ),
      seasons(
        "At Nizamuddin Dargah in Delhi, qawwali is sung most evenings, especially on Thursdays after sunset prayers. The Urs (death anniversary) of major saints draws large gatherings: the Urs of Moinuddin Chishti at Ajmer is held in the Islamic month of Rajab, so its date moves through the solar year.",
      ),
      respect(
        "Dargahs are places of worship. Cover your head (scarves are often available), remove your shoes, dress modestly, and sit quietly. Some areas of shrines may be restricted, including, at some dargahs, the innermost chamber for women; follow the signs and the shrine's staff. It is customary to offer money to the qawwals, passed to them during the performance, but this is not required.",
        "Do not film the qawwals at close quarters or use a flash, and avoid standing in front of listeners. Nizamuddin's lanes are narrow and crowded on Thursday evenings, so arrive before sunset, keep valuables secure, and be wary of anyone who insists you must pay them to enter. Entry to the dargah is free.",
      ),
    ],
    links: [SNA, MOC],
  },

  "gurbani-kirtan": {
    sections: [
      overview(
        "Gurbani kirtan is the singing of hymns (shabads) from the Guru Granth Sahib, the scripture of the Sikhs, as an act of worship. It is a central part of Sikh devotional life, and is performed in gurdwaras, at home and at special gatherings.",
        "The Guru Granth Sahib itself is organised by raga: its hymns are arranged under thirty-one main ragas, and the scripture specifies the musical setting for each hymn.",
      ),
      history(
        "Kirtan began with Guru Nanak, the founder of Sikhism, who sang his compositions accompanied by his companion Bhai Mardana on the rabab. The later Gurus continued the tradition, and the compilation of the Guru Granth Sahib preserved the hymns and their musical settings.",
        "Over the centuries, professional musicians known as ragis and rababis performed kirtan in gurdwaras. In the colonial period the harmonium became the main accompanying instrument, and in recent decades there has been a revival of traditional string instruments such as the rabab, saranda, taus and dilruba.",
      ),
      where(
        "Kirtan is performed in gurdwaras across India and the world, wherever there are Sikh communities. The Golden Temple (Harmandir Sahib) in Amritsar is the most important, with continuous kirtan from early morning to late at night.",
      ),
      form(
        "Form and instruments",
        "A group of ragis, usually three, sings shabads in the prescribed ragas, with a lead singer, a second voice and a tabla player. The text matters above all: kirtan is understood as a way of hearing and absorbing the Guru's word, so the singing is clear and devotional rather than showy. The congregation listens seated on the floor and often joins in refrains.",
        "Different times of day have their own kirtan. At the Golden Temple, the day begins in the early hours with Asa di Var, a long composition sung at dawn, and other hymns follow through the day until the scripture is ceremonially carried to its resting place at night. Gurmat sangeet, the study of the classical raga-based tradition of Sikh music, has been revived by teachers and institutions in Punjab.",
        "The harmonium and tabla are the most common instruments today. Traditional string instruments, such as the rabab associated with Bhai Mardana, the saranda, the taus (a bowed instrument with a peacock-shaped body) and the dilruba, are played by groups working to restore older practice.",
      ),
      people(
        "Bhai Mardana, Guru Nanak's companion, is the first musician of the Sikh tradition. In modern times, ragis such as Bhai Nirmal Singh Khalsa, who received the Padma Shri, have been widely respected.",
      ),
      seasons(
        "Kirtan is performed daily in gurdwaras. Gurpurabs, the anniversaries of the births and deaths of the Gurus, and Vaisakhi in April bring special programmes, including all-night kirtan.",
      ),
      respect(
        "Gurdwaras welcome people of every faith. Cover your head (scarves are available at the entrance), remove your shoes, wash your hands and feet, and do not bring tobacco, alcohol or drugs onto the premises. Sit on the floor, cross-legged or with legs folded, and do not point your feet towards the Guru Granth Sahib or turn your back on it when sitting close to it.",
        "Photography is not allowed inside the sanctum of the Golden Temple, and should be discreet elsewhere in the complex; never photograph people at prayer without permission. Live kirtan from the Golden Temple is broadcast every day, so you can listen before you go. Kirtan is worship, not a performance, so do not applaud.",
      ),
    ],
    links: [SGPC, MOC],
  },

  manganiyar: {
    sections: [
      overview(
        "The Manganiyars and Langas are hereditary communities of Muslim musicians in the Thar desert of western Rajasthan. For centuries they have sung for patrons at births, weddings and other occasions, preserving a large repertoire of folk songs, ballads and devotional music.",
        "Their music is powerful and haunting, with soaring vocals and intricate rhythms.",
      ),
      history(
        "The Manganiyars traditionally sang for Hindu Rajput patrons, while the Langas sang for Muslim Sindhi-Sipahi patrons. This relationship of patronage, in which musicians were supported by particular families over generations, shaped their music and repertoire.",
        "In the twentieth century, as traditional patronage declined, folklorists such as Komal Kothari documented their music and helped them find new audiences at festivals and concerts.",
      ),
      where(
        "The Manganiyars and Langas live mainly in the Barmer and Jaisalmer districts of Rajasthan. They perform at festivals across Rajasthan and internationally.",
      ),
      form(
        "Music and instruments",
        "Their songs cover many themes: songs for births and weddings, ballads of heroes and lovers such as Moomal and Mahendra or Dhola and Maru, songs that praise the patron's lineage, songs of the desert and the longed-for rain, and devotional songs including the poetry of Sufi saints and of Kabir and Mirabai. Songs are in Marwari, Sindhi and other dialects of the region, and many are performed in long, improvised forms in which the singers trade phrases.",
        "The music sits between folk and classical: it uses melodic modes the musicians call raags, with names sometimes shared with Hindustani music and sometimes their own, and its singers are trained from childhood within the family. A performance often moves from a slow, free-rhythm opening to fast, driving rhythms with khartal solos.",
        "The Manganiyars play the kamaicha, a bowed instrument with a large round body, while the Langas play the Sindhi sarangi. Other instruments include the dholak, khartal (wooden clappers), morchang (jaw harp) and algoza (double flute).",
      ),
      people(
        "Sakar Khan, a kamaicha player, received the Padma Shri. Komal Kothari, the folklorist who founded Rupayan Sansthan in Jodhpur, worked closely with the communities.",
      ),
      seasons(
        "The Rajasthan International Folk Festival at Mehrangarh Fort in Jodhpur, usually held in October, is one of the best occasions to hear them. The Jaisalmer Desert Festival in January or February and many cultural programmes also feature their music.",
      ),
      respect(
        "Musicians rely on audiences and patrons for their living. Pay for tickets, and if you are invited to a village performance, a contribution is customary. Performances in hotels and at desert camps around Jaisalmer are often given by young members of musician families; tips go directly to them.",
        "The relationship between musicians and their hereditary patrons is a long-standing social bond, and the communities themselves are the best guides to its meaning. Ask before photographing at weddings or family occasions, and treat the musicians as professionals rather than as a picturesque backdrop.",
      ),
    ],
    links: [SNA, MOC],
  },

  // ---------------------------------------------------------------- Handicrafts
  pashmina: {
    sections: [
      overview(
        "Pashmina is the fine, soft wool combed from the undercoat of the Changthangi goat, which lives on the high, cold Changthang plateau of eastern Ladakh, and the shawls woven from it in Kashmir. The fibre is extremely fine, typically around 12 to 16 microns in diameter, which gives the shawls their lightness and warmth.",
        "Genuine handmade pashmina passes through many hands: the herders who raise the goats, the people who clean and sort the fibre, the spinners, usually women, who spin it by hand, and the weavers and embroiderers in Srinagar and the Kashmir valley. Kashmir Pashmina is registered as a Geographical Indication.",
      ),
      history(
        "Fine shawls from Kashmir were prized at the Mughal court and later in Europe, where they inspired the paisley pattern. The trade linked Ladakh's nomadic herders with Kashmir's weavers and merchants for centuries.",
        "The term pashmina comes from the Persian word pashm, wool. Shahtoosh, an even finer fibre from the endangered Tibetan antelope (chiru), was also once woven in Kashmir; its trade is now banned under Indian law and the CITES convention because the animals must be killed to obtain it.",
      ),
      where(
        "The goats are raised by Changpa nomads in Changthang, in eastern Ladakh, at altitudes above 4,000 metres. The fibre is processed, spun and woven mainly in Srinagar and surrounding areas of the Kashmir valley.",
      ),
      form(
        "Materials and technique",
        "In spring, as the goats begin to moult, herders comb out the fine undercoat. The raw fibre is cleaned of coarse guard hair by hand, then spun on a traditional spinning wheel (yinder) into an extremely fine yarn. Weaving is done on a handloom, and a plain shawl can take several days; finer or patterned pieces take much longer.",
        "Shawls may be plain, embroidered or woven with patterns. Sozni is fine needle embroidery, often with paisley and floral motifs; kani shawls are woven in a tapestry technique using small wooden bobbins (kanis), and a complex kani shawl can take many months.",
      ),
      people(
        "The Craft Development Institute in Srinagar and the state's handicraft department work with artisans. A testing and certification centre in Srinagar issues the GI label for genuine Kashmir Pashmina, which carries a unique number.",
      ),
      seasons(
        "Srinagar's workshops and showrooms are open year-round. Combing season in Ladakh is spring, around May and June, but the high plateau is remote and visits need permits and planning.",
      ),
      respect(
        "Much of what is sold as pashmina is blended or machine-made. Ask for the GI label and certificate, buy from reputable cooperatives or government emporia, and be cautious of unusually low prices. Never buy shahtoosh, which is illegal. Bargaining is normal, but remember the many weeks of skilled work in a handmade shawl.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  "banarasi-silk": {
    sections: [
      overview(
        "Banarasi silk refers to the silk brocades and saris woven in Varanasi (Banaras) and its surroundings in Uttar Pradesh. They are known for rich patterns woven in gold and silver thread (zari), and for designs that combine Mughal motifs, such as intertwining floral and leaf patterns, with Indian elements.",
        "A Banarasi sari is a classic choice for weddings in many parts of India. Banaras Brocades and Sarees are registered as a Geographical Indication.",
      ),
      history(
        "Varanasi has been a weaving centre for centuries, and brocade weaving flourished under Mughal patronage, when craftsmen brought designs and techniques from Persia and Central Asia. Many weavers belong to the Ansari community of Muslim weavers, and the trade involves both Hindu and Muslim families.",
        "The jacquard loom, introduced in the colonial period, transformed production. In recent decades handloom weavers have faced competition from powerlooms and cheaper imitations.",
      ),
      where(
        "Weaving is concentrated in Varanasi and nearby areas, including Madanpura, Lallapura, Pili Kothi and villages around the city.",
      ),
      form(
        "Materials and technique",
        "Banarasi saris are woven from fine silk, often with zari, and may take from a couple of weeks to several months, depending on the complexity of the design. Types include katan (pure silk), organza (kora) with zari, georgette and shattir, and designs include jangla (all-over floral), tanchoi, butidar (with small motifs) and cutwork.",
        "Designs are first drawn on graph paper and transferred to punched cards for the jacquard loom, or set up as a naksha (pattern harness) on traditional looms.",
      ),
      people(
        "The weavers' families of Varanasi, many of whom have practised the craft for generations, are the heart of the tradition. Cooperatives and government bodies such as the Office of the Development Commissioner (Handlooms) support them.",
      ),
      seasons(
        "Workshops can be visited year-round. The wedding season, from October to February, is the busiest time for the trade.",
      ),
      respect(
        "Be wary of touts who offer to take you to 'weavers' houses' and earn commission on sales. Buy from cooperatives, reputable shops or directly from weavers, and look for the handloom mark and GI label to ensure authenticity.",
      ),
    ],
    links: [GI, HANDLOOMS, MOC],
  },

  "blue-pottery": {
    sections: [
      overview(
        "Jaipur blue pottery is a craft of glazed decorative ceramics in cobalt blue and turquoise on a white ground, painted with flowers, vines, birds and geometric borders. Unusually for pottery, it is not made from clay. The body is a paste of ground quartz, powdered glass, fuller's earth (multani mitti), borax and a gum binder, and it is fired at a relatively low temperature.",
        "The result is a bright, glassy surface with a slightly translucent depth. Typical pieces are vases, plates, bowls, tiles, door knobs, beads, coasters and lamp bases, and the craft has become one of the most recognisable souvenirs of Jaipur.",
      ),
      history(
        "The technique belongs to the family of quartz-based glazed wares of Persia and Central Asia, whose blue-and-white tiles decorate mosques and tombs across the Islamic world, and it reached north India through those connections. In Jaipur the craft was patronised in the nineteenth century by Maharaja Sawai Ram Singh II, who is credited with bringing craftsmen to the city and encouraging the work at the art school he founded.",
        "By the mid-twentieth century the craft had almost died out. It was revived from the 1950s and 1960s by the painter Kripal Singh Shekhawat, with encouragement from the crafts reformer Kamaladevi Chattopadhyay and from Gayatri Devi, the Rajmata of Jaipur. New designs and colours were introduced, and workshops multiplied as the market grew with tourism.",
      ),
      where(
        "Workshops are concentrated in and around Jaipur, especially along the road to Amer and in villages on the city's outskirts. Sanganer, south of Jaipur, also has workshops. Shops in the old city and government emporia stock a wide range.",
      ),
      form(
        "Materials and technique",
        "The dry ingredients are mixed with water into a dough, which is rolled flat and pressed into moulds; the moulds are filled with a sand and ash backing so the thin shell keeps its shape while it dries. Pieces made in two halves are joined, and the surface is smoothed with sandpaper and coated with a slip of the same quartz mixture.",
        "Decoration is painted freehand with brushes, using colours prepared from metal oxides: cobalt oxide for the deep blue, copper oxide for turquoise and green, and others for yellow and brown. A clear glaze is applied, and the pieces are fired once in a kiln, traditionally charcoal or wood fired, at a temperature well below that of stoneware. The low firing makes the pieces brittle, so breakage is part of the craft's economics.",
      ),
      people(
        "Kripal Singh Shekhawat, who received the Padma Shri, is credited with reviving the craft and training a generation of artisans. Many workshops in Jaipur are run by families who learned from him or from the master potters he worked with.",
      ),
      seasons(
        "Workshops can be visited year-round, but the cooler months from October to March are the most comfortable time in Jaipur. Craft fairs such as Dilli Haat in Delhi and state handicraft fairs often have blue pottery stalls.",
      ),
      respect(
        "Many workshops welcome visitors and will show the stages of production; buying something there directly supports the artisans. Check pieces for cracks or crazing before buying, ask for careful packing, and carry fragile items in hand luggage. Blue pottery is decorative: because of the low firing it is not suitable for oven or microwave use, and many artisans advise against using it for food.",
        "Be cautious of guides or drivers who insist on taking you to a particular shop, since commission is often added to the price.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  bidriware: {
    sections: [
      overview(
        "Bidriware is metalware from Bidar in north-eastern Karnataka, made of a zinc alloy that is inlaid with silver and then blackened, so that bright silver patterns stand out against a deep, matt black. The name comes from the town. Bidriware is registered as a Geographical Indication.",
        "Typical pieces are boxes, vases, bowls, trays, hookah bases, jewellery, buttons and decorative plates, with floral scrolls, vines, poppies, geometric patterns and sometimes calligraphy.",
      ),
      history(
        "Bidar was the capital of the Bahmani sultanate in the fifteenth century and later of the Barid Shahi dynasty, and the craft developed there under their patronage, with strong influences from Persian metalwork. Hookah bases with Bidri decoration were made for the courts of the Deccan and for the Mughals, and fine examples are held in museums in India and abroad.",
        "In later centuries Hyderabad became an important centre of production and trade. The craft declined with the loss of court patronage but survived through family workshops, and in the twentieth century government support and the souvenir market helped sustain it.",
      ),
      where(
        "Bidar remains the main centre, with workshops in the old town near the fort. Hyderabad, in Telangana, has many craftsmen and is the largest market. Pieces are sold in government emporia across India.",
      ),
      form(
        "Materials and technique",
        "Objects are cast in moulds from an alloy that is mainly zinc with a small proportion of copper. The cast piece is filed and smoothed, then coated temporarily with a solution that darkens it so the design can be scratched onto the surface. The craftsman engraves the pattern with fine chisels and hammers silver wire or thin silver sheet into the grooves. Names for the main inlay styles include tarkashi, inlay of wire, and teh-nishan, inlay of sheet.",
        "After the inlay is filed flush and polished, the piece is coated with a paste of a special soil and ammonium chloride mixed with water, and gently heated. The paste turns the zinc alloy a permanent black without affecting the silver. The soil traditionally comes from the old, unexposed parts of Bidar fort, and craftsmen say it is essential to the colour. Finally the piece is rubbed with oil to deepen the black.",
      ),
      people(
        "Bidri work is carried on by family workshops in Bidar and Hyderabad, many of which have practised it for generations, and several craftsmen have received national awards for master craftsmanship.",
      ),
      seasons(
        "Bidar can be visited year-round, but October to February is the most comfortable season. The town also has notable monuments, including the fort and the Mahmud Gawan madrasa, which make a visit to the workshops part of a wider trip.",
      ),
      respect(
        "Visit workshops rather than only shops if you can, and ask before photographing craftsmen at work. Genuine Bidri pieces have a uniform black that does not rub off and silver that is set into the metal rather than painted on; buy from artisans, cooperatives or government emporia if you are unsure. Clean pieces with a soft cloth and a little oil, not metal polish.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  "channapatna-toys": {
    sections: [
      overview(
        "Channapatna toys are lacquered wooden toys and objects made in and around Channapatna, a town between Bengaluru and Mysuru in Karnataka. Turned on a lathe and coloured with lacquer, they are smooth and bright, with rounded shapes that make them suitable for small children. Channapatna toys and dolls are registered as a Geographical Indication.",
        "Channapatna is often called the town of toys, gombegala ooru in Kannada. Rocking horses, spinning tops, rattles, stacking rings, toy trains, dolls, kitchen sets and beads are among the many products, alongside newer items such as pen stands and jewellery.",
      ),
      history(
        "Tradition links the craft with Tipu Sultan, the eighteenth-century ruler of Mysore, who is said to have invited lacquer craftsmen from Persia to teach local artisans. Whether or not the story is exact, lacquer turnery has long been practised in the area.",
        "In the twentieth century the craftsman Bavas Miyan is credited with adapting Japanese wood-turning techniques to improve the toys, and the Karnataka government set up support and training. In recent decades competition from cheap plastic and imported toys hurt the craft, and designers and cooperatives have worked with artisans to develop new products and revive the use of natural dyes.",
      ),
      where(
        "Workshops are spread across Channapatna and nearby villages in Ramanagara district, and shops line the Bengaluru-Mysuru road through the town. The toys are also sold at Karnataka's state emporia (Cauvery) and at craft fairs across India.",
      ),
      form(
        "Materials and technique",
        "The traditional wood is from the ivory-wood tree, known locally as aale mara (Wrightia tinctoria), which is light, fine-grained and easy to turn; other woods such as rubber wood and sycamore are now also used. The wood is seasoned, cut into blocks, and shaped on a lathe with hand-held chisels.",
        "Colour comes from sticks of lacquer pressed against the spinning piece. The heat of the friction softens the lacquer so that it spreads into an even, glossy coat, which is then polished with a dried leaf of screw pine (kedige) or a similar material. Natural colours include yellow from turmeric, red from kumkum and other plant dyes, and indigo, and many workshops advertise toys made only with vegetable colours.",
      ),
      people(
        "Bavas Miyan is the craftsman most often credited with modernising Channapatna toys. Today the craft is carried on by several thousand artisans, many in family workshops, and by cooperatives and social enterprises that market their work.",
      ),
      seasons(
        "Workshops can be visited year-round. Channapatna is about 60 kilometres from Bengaluru, so it is easy to stop there on the road to Mysuru, particularly during Mysuru Dasara in September or October.",
      ),
      respect(
        "Ask before photographing artisans at the lathe, and buy directly from workshops or cooperatives when you can, since roadside shops sometimes sell factory-made imitations. Toys finished with natural lacquer colours are a good choice for young children; ask the maker which colours were used.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  dhokra: {
    sections: [
      overview(
        "Dhokra (also spelt Dokra) is metal casting by the lost-wax method, practised by several hereditary communities of metalsmiths in eastern and central India. The figures are cast in brass and bell metal and have a distinctive textured surface, created by the fine threads of wax used to model them.",
        "Typical subjects are animals, especially elephants, horses and owls; deities; figures from village life such as drummers, dancers and women carrying water; and lamps, bowls and jewellery. Because each mould is broken to release the casting, every piece is unique.",
      ),
      history(
        "Lost-wax casting is among the oldest metalworking techniques in the world, and the celebrated bronze 'dancing girl' from Mohenjo-daro shows that it was known in South Asia more than four thousand years ago. Dhokra traditions continue that ancient technique, though their own history is mostly oral.",
        "The name Dhokra is generally linked to the Dhokra Damar communities of metalsmiths, who historically travelled between villages in the forested regions of eastern India. Many groups now live in settled villages, and the craft has passed through difficult periods as demand for traditional household items fell. Interest from collectors, designers and the tourist market has helped sustain it.",
      ),
      where(
        "Major centres include Bastar in Chhattisgarh, especially around Kondagaon; Bankura district (Bikna) and Purba Bardhaman district (Dariapur) in West Bengal; parts of Odisha, including Mayurbhanj, Dhenkanal and Keonjhar; and areas of Jharkhand. Each region has its own style.",
      ),
      form(
        "Materials and technique",
        "The process begins with a core of clay mixed with rice husk, shaped roughly into the final form. Over this the artisan models the figure in wax, traditionally beeswax or a resin mixed with oil, often by winding fine threads of wax around the core to create the texture. The wax model is coated in layers of fine clay, with a channel left for the metal, and dried.",
        "The mould is heated so that the wax melts and runs out, leaving a hollow. Molten brass or bell metal, often made from recycled scrap, is poured in. When the metal has cooled, the clay is broken away, revealing the casting, which is then cleaned and sometimes polished. The whole process can take days, and a piece may take longer if it is large or complex.",
      ),
      people(
        "Dhokra is practised by communities rather than individual celebrities, though a number of artisans have received national awards. Village cooperatives and non-profit groups in Bastar and West Bengal help artisans reach markets.",
      ),
      seasons(
        "Craft villages can be visited year-round, but the cooler months from October to March are most comfortable. State handicraft fairs, such as the West Bengal State Handicrafts Expo in Kolkata in winter, and Dilli Haat in Delhi often have Dhokra artisans selling directly.",
      ),
      respect(
        "Visiting a craft village is a chance to see a remarkable process, but these are homes and workplaces. Go with a local guide or cooperative where possible, ask before photographing, and buy something if you have been shown the work. Prices reflect the many hours of labour and the cost of metal; very cheap pieces are often machine cast.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  ajrakh: {
    sections: [
      overview(
        "Ajrakh is a cloth printed by hand with carved wooden blocks in geometric and floral patterns, using natural dyes, particularly deep indigo blue and madder red, with black and white accents. The best ajrakh is printed on both sides, so that the pattern matches front and back.",
        "In India ajrakh is closely associated with the Khatri community of Kutch in Gujarat, and it is also made in Barmer and around Balotra in Rajasthan. Across the border in Sindh, where the spelling ajrak is used, it is a symbol of Sindhi identity.",
      ),
      history(
        "Ajrakh has roots in the lower Indus region, which has a long history of cotton cultivation and dyeing. The Khatri families who practise it in Kutch trace their arrival from Sindh to the sixteenth or seventeenth century, when they settled in Kutch at the invitation of the local ruler. In Kutch, ajrakh was worn by the Maldhari herders and other communities as turbans, waist cloths and shoulder cloths.",
        "In the twentieth century, synthetic dyes and changing tastes threatened the craft, but the Khatri family of the late Dr Ismail Mohammad Khatri revived natural dyeing. After the 2001 Kutch earthquake and water problems in their old village of Dhamadka, many printers moved to a new settlement near Bhuj named Ajrakhpur, which is now the main centre.",
      ),
      where(
        "Ajrakhpur and Dhamadka in Kutch are the main centres in Gujarat. In Rajasthan, the craft is practised in Barmer and around Balotra.",
      ),
      form(
        "Materials and technique",
        "Making ajrakh involves many stages, often described as around sixteen, over several weeks. The cloth is first washed and softened with a mixture that traditionally includes camel dung, soda ash and castor oil, then treated with myrobalan (harde), which prepares it to take colour. Patterns are printed with wooden blocks: a resist paste of lime and gum arabic protects areas that will stay white; an iron-based solution produces black; and alum mordant fixes red where madder or alizarin will take.",
        "Between printings the cloth is dyed in indigo, washed, dried in the sun and sometimes printed again, until the full design emerges. Some of the patterns have names and meanings, and the motifs often echo the geometry of Islamic art. Blocks are carved by specialist block-makers, often in Pethapur in Gujarat.",
      ),
      people(
        "Dr Ismail Mohammad Khatri, a master printer, is credited with leading the revival of natural-dye ajrakh in Kutch. Many families in Ajrakhpur continue the craft, and some have received national awards.",
      ),
      seasons(
        "The cooler months from October to March are the best time to visit Kutch. The Rann Utsav, organised by Gujarat Tourism in the winter, brings many visitors and craft markets to the area.",
      ),
      respect(
        "Workshops in Ajrakhpur are working spaces; ask before entering dyeing areas and before photographing. Buying directly from the printers supports the craft. Genuine hand-printed ajrakh with natural dyes is more expensive than screen-printed imitations; look for slight irregularities in the print, which are signs of hand work.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  "sanganer-block-printing": {
    sections: [
      overview(
        "Sanganer and Bagru are two villages near Jaipur in Rajasthan that are famous for hand block printing on cotton. Sanganer, now part of Jaipur's southern suburbs, is known for fine floral and paisley motifs printed on white or light backgrounds. Bagru, about thirty kilometres from the city, is known for earthy colours and for dabu, a mud-resist technique.",
        "Both crafts are practised mainly by the Chhipa community of printers, and both are registered as Geographical Indications.",
      ),
      history(
        "Block printing in Rajasthan has a long history and developed under the patronage of the courts of Jaipur and other princely states. Sanganer's fine prints were traded widely, and the town's location on the river and its water were important for washing and dyeing.",
        "In the twentieth century, competition from mill-printed textiles reduced demand, but the craft survived and was revived through support from designers, government programmes and businesses that worked with local printers. The Anokhi Museum of Hand Printing in Amer, near Jaipur, documents the history and techniques of block printing.",
      ),
      where(
        "Sanganer and Bagru, both near Jaipur, are the main centres. The craft is also practised in other parts of Rajasthan, Gujarat and Madhya Pradesh.",
      ),
      form(
        "Materials and technique",
        "Carved wooden blocks are dipped in dye and pressed onto cloth by hand. In Sanganer, the designs are delicate, often small flowers and buds (butis), printed in multiple colours with separate blocks for each colour. In Bagru, the dabu technique uses a paste of mud, lime and gum, applied with blocks to resist dye, followed by dyeing in indigo or other natural colours.",
        "Natural dyes include indigo, madder, turmeric and pomegranate rind, though synthetic dyes are now also common.",
      ),
      people(
        "Chhipa families in Sanganer and Bagru have practised printing for generations. Several printers have received national awards.",
      ),
      seasons(
        "Workshops can be visited year-round, but the cooler months from October to March are the most comfortable time in Rajasthan.",
      ),
      respect(
        "Ask before photographing printers at work, and buy directly from workshops or cooperatives when you can. Hand-printed textiles show small irregularities, which are signs of genuine hand work.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  zardozi: {
    sections: [
      overview(
        "Zardozi is heavy embroidery in metallic thread, worked with coiled wire, sequins, beads and sometimes pearls and semi-precious stones on silk, velvet and satin. The word comes from Persian: zar, gold, and dozi, sewing. Real gold and silver thread were once used; today most work uses copper or other wire with a gold or silver finish.",
        "Zardozi decorates bridal clothing, sherwanis, saris, lehengas, shawls, caps, cushions, bags and ceremonial textiles. The raised, glittering surface gives it a sculptural quality quite different from flat embroidery.",
      ),
      history(
        "Embroidery with metal thread is mentioned in early Indian texts, but zardozi as a distinct craft flourished at the Mughal court, especially from the time of Akbar, when it decorated royal garments, tent hangings, saddle cloths and the trappings of elephants and horses. After the decline of Mughal patronage, regional courts such as Awadh continued to employ zardozi workers.",
        "Industrial production of cheaper thread in the nineteenth and twentieth centuries made the craft affordable to more buyers, and today it is closely tied to the wedding and fashion industries. Lucknow Zardozi is registered as a Geographical Indication.",
      ),
      where(
        "Major centres include Lucknow, Bareilly, Agra, Farrukhabad and Varanasi in Uttar Pradesh, Delhi, Hyderabad, Bhopal and parts of Gujarat and Rajasthan. Many workshops are small family units in old city neighbourhoods.",
      ),
      form(
        "Materials and technique",
        "The fabric is stretched tight on a wooden frame called an adda, and the design is transferred onto it, traditionally by pouncing chalk or kerosene-mixed powder through a perforated tracing. Artisans sit around the frame and work with a fine needle or a hooked awl (aari), couching the metallic elements onto the cloth.",
        "The vocabulary of materials includes salma (springy coiled wire), dabka (a tighter coil), gijai (fine coil), kora (matt coil), sitara (sequins), badla (flat metal wire) and kasab (metallic thread). Padding with cotton threads underneath creates the raised effect. A bridal garment may involve weeks of work by several artisans.",
      ),
      people(
        "Zardozi is produced mainly by male artisans in workshops, many from Muslim families who have practised the craft for generations, though women increasingly do the work at home. Fashion designers commission much of the high-end work, and craft organisations run training and fair-trade programmes.",
      ),
      seasons(
        "Workshops operate year-round; demand peaks before the winter wedding season from October to February. Lucknow's old city, particularly around Chowk and Aminabad, is a good place to see and buy zardozi.",
      ),
      respect(
        "Zardozi work is close, demanding and often low-paid. When buying, pay a fair price, ask whether the work is hand-done, and favour cooperatives or artisans who sell directly. If you visit a workshop, ask before photographing workers, and do not touch frames in progress.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  "bankura-terracotta": {
    sections: [
      overview(
        "Bankura terracotta is the fired-clay craft of the Bankura district of West Bengal, best known for the Bankura horse: a stylised horse with a long, upright neck, alert ears and a hollow body, made in sizes from a few centimetres to over a metre. Terracotta elephants, figures of deities, plaques and decorative tiles are also made.",
        "The Bankura horse is one of the most recognisable symbols of Bengali folk craft. The nearby temple town of Bishnupur is famous for its temples of the seventeenth and eighteenth centuries clad in carved terracotta panels, which shows how deep the tradition of fired clay runs in the region.",
      ),
      history(
        "Terracotta horses and elephants have long been offered at village shrines in Bengal, particularly to local deities such as Dharmaraj and Manasa, in fulfilment of vows. Offerings can be seen piled up beneath trees and around shrines in the area.",
        "The Malla kings of Bishnupur built brick temples with elaborate terracotta decoration from around 1600, including the Rasmancha, the Jor Bangla and the Shyamrai temple. In the twentieth century the Bankura horse became widely known as a decorative object, and it was taken up as a symbol of Indian handicrafts.",
      ),
      where(
        "The best-known village for Bankura horses is Panchmura, about twenty kilometres from Bishnupur, where many families of potters (kumbhakars) work. Other villages in Bankura district, such as Sonamukhi and Rajagram, have their own styles.",
      ),
      form(
        "Materials and technique",
        "The potters use local clay mixed with sand and other materials. The body of a horse is made in separate parts: the legs, neck and head are thrown on the wheel as hollow cylinders, then joined and finished by hand. The ears, mane and other details are added afterwards.",
        "Pieces are coated with a clay slip and fired in a kiln. The colour depends on firing: an oxidising fire gives the familiar red-orange, while a reducing fire, with the kiln sealed, gives black. Some pieces are painted after firing.",
      ),
      people(
        "The potters of Panchmura are the craft's main practitioners, and several have received national awards for their work.",
      ),
      seasons(
        "Bankura and Bishnupur are most pleasant from October to March. The Bishnupur Mela, held in late December, includes crafts and music. Poush Mela at Santiniketan and Kolkata's handicraft fairs in winter also have terracotta sellers.",
      ),
      respect(
        "When visiting Panchmura, remember you are in a village of homes and workshops; ask before photographing and avoid blocking courtyards where pieces are drying. Terracotta is fragile and heavy, so ask about packing and transport before buying large pieces. Terracotta offerings at shrines are sacred and should not be touched or taken.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  "northeast-cane-bamboo": {
    sections: [
      overview(
        "Cane and bamboo are woven into an enormous range of everyday and ceremonial objects across north-east India: baskets for carrying, storing and fishing; mats; hats; furniture; screens; utensils; musical instruments; and parts of houses and bridges. Each community has its own forms and patterns, and the craft is part of daily life rather than a separate art.",
        "The region is rich in bamboo species and in rattan cane, a climbing palm, and both are used. Bamboo is valued for its strength and flexibility, and cane for its toughness and ability to be bent and tied.",
      ),
      history(
        "Cane and bamboo craft is as old as settlement in the region, though its history is mostly unrecorded. Different communities developed distinct designs for particular uses, such as conical carrying baskets, fish traps and rice storage baskets.",
        "In the twentieth century, as industrial products replaced many traditional items, cane and bamboo crafts were adapted for new markets, including furniture and decorative goods, with support from government programmes.",
      ),
      where(
        "Cane and bamboo crafts are practised across the north-east: in Assam, Tripura, Manipur, Meghalaya, Mizoram, Nagaland, Arunachal Pradesh and Sikkim. Tripura and Assam are particularly known for cane furniture and bamboo products.",
      ),
      form(
        "Materials and technique",
        "Bamboo is split into strips, scraped and sometimes dried or smoked to protect it from insects. Weaving uses many techniques, including plaiting, twining and coiling, and patterns may be created by using strips of different colours or textures.",
        "In Assam, the jaapi, a conical hat made of bamboo and palm leaves, is a symbol of the state and is often presented to guests. Fishing traps such as the jakoi and khaloi are common in rural Assam.",
      ),
      people(
        "Cane and bamboo craft is practised by many communities and families across the region, often as part of household work.",
      ),
      seasons(
        "Weekly markets across the north-east sell cane and bamboo goods year-round. The Hornbill Festival in Nagaland in early December and state handicraft fairs are good places to see and buy them.",
      ),
      respect(
        "Buying from cooperatives and weekly markets supports craftspeople. Some items have ceremonial uses; ask about their meaning before buying.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  "kutch-embroidery": {
    sections: [
      overview(
        "Kutch, in western Gujarat, is one of the richest centres of embroidery in the world. Women of many communities embroider clothing, dowry textiles, wall hangings and animal trappings, each community with its own stitches, motifs and colours. Small mirrors (abhla) sewn into the work are a common feature.",
        "The embroidery is a language of identity: a skilled eye can tell from a woman's garment which community she belongs to, and sometimes her age or marital status.",
      ),
      history(
        "Embroidery has long been part of the material culture of the pastoral and farming communities of Kutch, many of whom came from Sindh, Rajasthan and further afield. Girls traditionally learned embroidery from their mothers and prepared textiles for their dowries.",
        "In the late twentieth century, organisations such as Shrujan, Kala Raksha and Khamir began working with embroiderers to develop markets, preserve traditional styles and ensure fair payment. After the 2001 earthquake, craft became an important source of income for many families.",
      ),
      where(
        "Embroidery is practised throughout Kutch, particularly in the Banni grasslands north of Bhuj and in villages around Bhuj, Hodka, Dhordo, Sumrasar and Bhujodi.",
      ),
      form(
        "Styles and stitches",
        "Rabari embroidery features chain stitch and mirrors in bold patterns. Ahir work uses chain stitch with mirrors in floral and geometric patterns. Jat women do very fine cross-stitch. Mutwa embroidery is extremely fine, with tiny mirrors. Sodha, Meghwal and other communities each have their own styles.",
        "Common stitches include suf (a fine satin stitch worked from the back), khaarek (a geometric satin stitch), paako (a dense chain and buttonhole stitch), and various forms of mirror work.",
      ),
      people(
        "Shrujan, Kala Raksha and Khamir are among the organisations that work with Kutch embroiderers. Shrujan's Living and Learning Design Centre near Bhuj has a museum of Kutch crafts.",
      ),
      seasons(
        "The cooler months from October to March are the best time to visit Kutch. The Rann Utsav in winter brings many craft markets.",
      ),
      respect(
        "Many villages welcome visitors, but they are homes; go with a local guide or cooperative, ask before photographing women, and buy directly when you can.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  // ---------------------------------------------------------------- Clothing
  sari: {
    sections: [
      overview(
        "The sari is an unstitched length of cloth, usually between five and nine metres long, draped around the body. It is worn by women throughout India and in Bangladesh, Nepal and Sri Lanka, with a fitted blouse (choli or ravike) and a petticoat underneath in most modern styles.",
        "The sari is at once a single garment and hundreds of traditions. There are many ways to drape it, and India's handloom weaving centres each produce saris with their own fibres, techniques, colours and motifs, many of them registered as Geographical Indications.",
      ),
      history(
        "Draped, unstitched garments are among the oldest forms of dress in South Asia, and early sculpture shows women and men wearing lengths of cloth wrapped around the body. Words related to the sari appear in early Buddhist and Jain literature. The blouse and petticoat became widespread in the nineteenth and twentieth centuries.",
        "In the struggle for independence, handspun and handwoven cloth (khadi) became a political symbol, and the sari became part of a national idea of dress. Today the sari remains everyday wear for many women and is formal wear for many more, while handloom weavers compete with powerlooms and changing fashions.",
      ),
      where(
        "The sari is worn across India. Notable weaving traditions include Kanjivaram silk from Kanchipuram in Tamil Nadu; Banarasi brocade from Varanasi; Paithani from Maharashtra; Patola double ikat from Patan in Gujarat; Pochampally ikat from Telangana; Chanderi and Maheshwari from Madhya Pradesh; Jamdani, Tant and Baluchari from West Bengal; Sambalpuri and Bomkai from Odisha; muga and pat silk from Assam; and Kasavu from Kerala.",
      ),
      form(
        "Draping styles",
        "The nivi style, with pleats tucked in at the front and the end (pallu) draped over the left shoulder, is the most widespread today. Bengali drapes often have box pleats and the pallu brought over both shoulders. In the Gujarati style, the pallu comes over the right shoulder to the front. The Maharashtrian nauvari, a nine-yard sari draped between the legs, allows freedom of movement. Kodava women of Karnataka pleat the sari at the back, and the two-piece mundum neriyathum of Kerala is related to the sari.",
        "Handloom techniques include extra-weft patterning, as in Jamdani and Banarasi; ikat, in which the threads are resist-dyed before weaving, as in Patola and Pochampally; and contrast borders woven separately and joined, as in some Kanjivaram saris.",
      ),
      people(
        "Millions of handloom weavers, many in family workshops, produce India's saris. Cooperatives, state handloom corporations and the Office of the Development Commissioner (Handlooms) support them, and National Handloom Day is observed on 7 August.",
      ),
      seasons(
        "Weaving centres can be visited year-round. Festivals and the wedding season, from October to February, are when saris are most visible and most in demand.",
      ),
      respect(
        "Visitors are welcome to wear a sari, and many shops will help with draping. Weavers' cooperatives and state emporia are good places to buy genuine handloom; look for the Handloom Mark or GI label. Be wary of touts offering visits to 'weavers' homes', where commissions are often added.",
      ),
    ],
    links: [HANDLOOMS, GI, MOC],
  },

  "salwar-kameez": {
    sections: [
      overview(
        "The salwar kameez is a set of a long tunic (kameez) worn over loose trousers (salwar), usually with a long scarf (dupatta). It is widely worn by women across northern India and has become everyday wear throughout the country, as well as in Pakistan, Bangladesh and the South Asian diaspora.",
        "It is often called a 'suit' in India. For visitors it is a practical, comfortable and modest choice, especially in conservative areas and at religious sites.",
      ),
      history(
        "Tunics and trousers came into South Asia with Central Asian and Persian influences, and were worn at the courts of the Delhi Sultanate and the Mughals. The salwar kameez became strongly associated with Punjab, where it remains the typical dress.",
        "In the twentieth century, the salwar kameez spread across India, becoming popular among students and working women, and its styles have changed with fashion.",
      ),
      where(
        "The salwar kameez is worn throughout India, especially in Punjab, Haryana, Delhi, Jammu and Kashmir and Uttar Pradesh. It is also common in cities across the south and east.",
      ),
      form(
        "Styles",
        "The Patiala salwar has deep pleats and a lot of fabric; the churidar is tight-fitting and gathers at the ankle; and palazzos and straight pants are modern variants. The kameez may be short or long, straight or flared; the anarkali is a long, flared style.",
        "Phulkari, the embroidered dupattas of Punjab, are a famous accompaniment.",
      ),
      people(
        "Tailors across India make salwar kameez to measure, and readymade suits are available everywhere.",
      ),
      seasons(
        "The salwar kameez is worn year-round, in cotton in summer and wool in winter.",
      ),
      respect(
        "Salwar kameez is suitable for most occasions. At gurdwaras, temples and mosques, cover your head with the dupatta.",
      ),
    ],
    links: [MOC],
  },

  "dhoti-mundu": {
    sections: [
      overview(
        "The dhoti and the mundu are unstitched cloths worn by men around the waist and legs. The dhoti, common in northern and eastern India, is usually wrapped and tucked between the legs. The mundu of Kerala and the veshti of Tamil Nadu are worn wrapped around the waist like a sarong.",
        "They are worn for daily use, especially in villages and smaller towns, and for formal and ritual occasions, including temple visits and weddings.",
      ),
      history(
        "Draped lower garments for men are among the oldest forms of dress in South Asia. The dhoti was widely worn in India before trousers became common in the twentieth century, and was associated with Mahatma Gandhi, who wore a simple dhoti as a symbol of solidarity with India's poor.",
      ),
      where(
        "The dhoti is worn across India. Regional names include veshti in Tamil Nadu, mundu in Kerala, panche in Karnataka, pancha in Andhra Pradesh and Telangana, and dhuti in West Bengal.",
      ),
      form(
        "Styles",
        "In Kerala, the kasavu mundu, cream or white with a gold border, is worn for formal occasions such as Onam and weddings. Coloured mundus and lungis are everyday wear. In Tamil Nadu, the veshti is often worn with a shirt and an angavastram (shoulder cloth).",
        "The mundu may be folded up at the knee (madakki kuthu) for work or heat, and unfolded as a sign of respect when meeting elders.",
      ),
      people(
        "Handloom weavers produce many traditional dhotis and mundus, including the Balaramapuram weavers near Thiruvananthapuram.",
      ),
      seasons(
        "The dhoti and mundu are worn year-round, and especially at festivals such as Onam and Pongal.",
      ),
      respect(
        "Many temples in Kerala require men to wear a mundu, and some require men to remove their shirts. Mundus can often be rented or bought near temple entrances.",
      ),
    ],
    links: [HANDLOOMS, MOC],
  },

  turban: {
    sections: [
      overview(
        "The turban is a long cloth wound around the head, worn in many parts of India. Two traditions are especially visible to visitors. In Rajasthan, the pagri or safa is a mark of region, community and occasion, and its colour, pattern, size and style of tying can say a great deal about the wearer. For Sikhs, the dastar is an article of faith: it covers the uncut hair (kesh) that is one of the five articles of the Sikh faith, and it carries religious meaning, dignity and responsibility.",
        "Turbans are also worn in many other forms across India, from the Mysore peta of Karnataka, a formal silk headdress with a gold border, to the colourful turbans of Gujarat and Maharashtra worn at weddings and festivals.",
      ),
      history(
        "Head wraps have been worn in South Asia for millennia, and sculpture and painting show many forms. Under the Rajput courts, turbans became elaborate symbols of status, and their styles were codified by region. A well-known Rajasthani saying holds that the style of turban changes every few kilometres.",
        "In Sikhism, the turban became an essential part of the faith's identity. Guru Gobind Singh, the tenth Guru, established the Khalsa in 1699 and the five articles of faith, and the turban, which keeps the uncut hair covered and tidy, became obligatory for Sikh men according to the Sikh code of conduct and is worn by many Sikh women as well. Sikh soldiers in the British Indian Army and later the Indian Army wore turbans in uniform, and Sikhs have campaigned in many countries for the right to wear the turban at work and in public life.",
      ),
      where(
        "Rajasthani turbans are seen across the state, especially at fairs, weddings and festivals, and among older men in villages. Sikh turbans are seen throughout Punjab, Haryana, Delhi and Chandigarh, and wherever Sikh communities live in India and abroad.",
      ),
      form(
        "Styles, colours and tying",
        "In Rajasthan, the safa is a shorter, broader turban, while the pagri is longer and narrower and is wound in more elaborate styles. Patterns such as leheriya, a diagonal wave design dyed in bright stripes, are worn in the monsoon, while saffron (kesariya) is associated with courage and ceremony. Jodhpuri safas and Mewari pagris are among the most recognisable styles, and the tie and the arrangement of the loose end (turra) vary by region.",
        "Sikh turbans are tied fresh each day and come in many colours, with some colours carrying particular associations, such as saffron and navy blue among the Nihangs and for religious occasions. Common styles include the dumalla, worn by many Nihangs, and the peaked dastar. Children often wear a patka, a smaller head covering, before they learn to tie a full turban.",
      ),
      people(
        "Turban-tying is a skill passed down within families. At fairs such as Pushkar and festivals in Rajasthan, turban-tying competitions are a popular attraction, and specialist turban-tiers dress grooms and guests at weddings.",
      ),
      seasons(
        "Rajasthani fairs and festivals in the cooler months, such as the Pushkar Camel Fair in October or November and the Desert Festival in Jaisalmer in January or February, are good opportunities to see turbans. Gurpurabs and Vaisakhi are occasions when Sikh turbans in bright colours fill the gurdwaras of Punjab.",
      ),
      respect(
        "In Rajasthan, visitors are often invited to try on a turban at festivals or at hotels, and it is a friendly gesture. The Sikh turban is different: it is an article of faith and should never be touched, pulled or treated as a costume. Do not ask a Sikh to remove their turban, and do not wear a Sikh-style turban for fun.",
        "At gurdwaras, everyone covers their head; scarves are provided, and you do not need to wear a turban. If you are unsure what is appropriate, ask politely.",
      ),
    ],
    links: [MOC, SGPC],
  },

  pheran: {
    sections: [
      overview(
        "The pheran is a long, loose woollen gown worn by men and women in Kashmir in winter. Reaching to the shins or below, with wide sleeves, it is practical for the cold months: worn over other layers, it traps heat and leaves room to carry a kangri, a small clay pot of embers in a wicker casing, held beneath it for warmth.",
        "It is one of the most recognisable symbols of Kashmiri dress. Summer pherans in lighter cotton are also worn.",
      ),
      history(
        "The pheran has been worn in Kashmir for centuries, and its loose cut has been linked to Central Asian and Persian garments. Accounts from the Mughal period onwards describe Kashmiris wearing long gowns.",
        "In the twentieth century the pheran became associated with Kashmiri identity, and in recent decades designers have adapted it for fashion, with shorter and more fitted versions.",
      ),
      where(
        "The pheran is worn throughout the Kashmir valley and in parts of the Chenab valley and other areas of Jammu and Kashmir.",
      ),
      form(
        "Styles and materials",
        "Men's pherans are usually plain wool, tweed or cashmere blends in muted colours. Women's pherans are often decorated with embroidery, especially tilla (metallic thread embroidery) or aari (hook embroidery) around the neck, cuffs and pockets.",
        "The kangri, carried beneath, is a clay pot set in a wicker basket, filled with hot embers. Kangris are made by local craftsmen and are an essential part of winter life.",
      ),
      people(
        "Tailors and embroiderers in Srinagar and across the valley make pherans, and many families have their own preferred styles.",
      ),
      seasons(
        "Pherans are worn from late autumn through to spring, especially during Chillai Kalan, the forty coldest days of winter from late December to late January.",
      ),
      respect(
        "Visitors can buy pherans in Srinagar's markets; they are a practical purchase for a winter visit. Kashmir has particular security and travel considerations, so check current advisories before planning a trip.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  "mekhela-chador": {
    sections: [
      overview(
        "The mekhela chador is the traditional dress of Assamese women. It has two main pieces: the mekhela, a cylindrical skirt pleated and tucked at the waist, and the chador, a long length of cloth draped over the upper body, with one end tucked in and the other over the shoulder. A blouse is worn underneath.",
        "It is worn at Bihu, weddings, religious ceremonies and formal events, and in more everyday versions for daily use.",
      ),
      history(
        "Weaving is deeply rooted in Assamese culture, and in the past nearly every household had a loom. Assam is the home of muga silk, a golden silk produced only in the state, and of eri silk.",
      ),
      where(
        "The mekhela chador is worn throughout Assam. Sualkuchi, a weaving village near Guwahati, is the most famous centre of silk weaving.",
      ),
      form(
        "Materials and motifs",
        "Muga silk, from the semi-domesticated silkworm Antheraea assamensis, has a natural golden sheen that grows deeper with age; Muga Silk of Assam is a Geographical Indication. Pat silk, a white or cream mulberry silk, is also popular. Eri silk is known as 'ahimsa silk' because it is traditionally spun without killing the silkworm. Motifs include flowers, birds, animals and geometric designs, often in red.",
      ),
      people(
        "Weavers in Sualkuchi and across Assam produce mekhela chadors on handlooms.",
      ),
      seasons(
        "Bihu, especially Rongali Bihu in April, is when mekhela chadors are most visible.",
      ),
      respect(
        "Buy muga and pat silk from reputable shops or cooperatives, as imitations are common.",
      ),
    ],
    links: [GI, HANDLOOMS, MOC],
  },

  "chaniya-choli": {
    sections: [
      overview(
        "The chaniya choli of Gujarat and the ghagra choli of Rajasthan are three-piece outfits made up of a long, flared skirt (chaniya or ghagra), a fitted blouse (choli or kanchli) and a scarf or veil (dupatta or odhni). They are typically richly decorated with embroidery, mirror work, appliqué and tie-dye.",
        "They are traditional dress for many communities and are especially associated with festivals such as Navratri and with weddings. The related lehenga choli is the bridal and festive dress across much of northern India.",
      ),
      history(
        "Skirts, blouses and veils have long been worn by women in western India, and the ensemble varies widely between communities. Pastoral and farming communities in Kutch, Saurashtra and western Rajasthan developed distinctive embroidery traditions for their clothing.",
      ),
      where(
        "The chaniya choli is worn throughout Gujarat, and the ghagra choli throughout Rajasthan. Both are also worn in neighbouring regions and among Gujarati and Rajasthani communities elsewhere.",
      ),
      form(
        "Materials and decoration",
        "Common decorations include abhla (mirror work), bandhani (tie-dye with tiny dots), leheriya (wave-pattern tie-dye), gota-patti (metallic ribbon appliqué) and various embroidery styles.",
      ),
      people(
        "Embroiderers, tie-dyers and tailors across Gujarat and Rajasthan make these garments.",
      ),
      seasons(
        "Navratri, usually in September or October, is when chaniya cholis are most visible in Gujarat. Weddings in the winter season and festivals such as Teej and Gangaur in Rajasthan are other occasions.",
      ),
      respect(
        "Visitors are welcome to wear chaniya choli for Navratri; many shops rent them. Law Garden in Ahmedabad has a famous evening market for Navratri clothing.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  "naga-shawls": {
    sections: [
      overview(
        "Naga shawls are the woven shawls of the Naga communities of Nagaland and neighbouring areas. Each community, such as the Angami, Ao, Sumi, Lotha, Chakhesang, Konyak, Chang, Yimkhiung and others, has its own patterns and colours, and within a community different shawls can mark gender, age, clan, status and achievements.",
        "The shawls are woven by women on the backstrap loin loom and are among the most important textiles of the region.",
      ),
      history(
        "Weaving has long been part of Naga life. Shawls once signalled achievements such as success in war or the hosting of feasts of merit, and the right to wear certain designs was earned. With the arrival of Christianity and changes in society, many of these customs have changed, but the shawls remain important symbols of identity.",
      ),
      where(
        "Naga shawls are woven across Nagaland and in Naga areas of Manipur, Arunachal Pradesh and Assam.",
      ),
      form(
        "Materials and patterns",
        "The shawls are woven in cotton, traditionally dyed with natural dyes, though synthetic yarns are now common. Patterns are usually horizontal stripes and bands, with motifs such as lozenges, triangles and animal figures in some shawls.",
        "The loin loom produces narrow pieces, which are joined to make a full shawl.",
      ),
      people(
        "Women weavers across Nagaland continue the tradition, and cooperatives help them reach markets.",
      ),
      seasons(
        "The Hornbill Festival, held from 1 to 10 December at Kisama Heritage Village near Kohima, is the best occasion to see Naga shawls and other crafts.",
      ),
      respect(
        "Some shawls are reserved for people of particular status or achievement, so ask before buying or wearing one. Buy from cooperatives or directly from weavers.",
      ),
    ],
    links: [HANDLOOMS, MOC],
  },

  // ---------------------------------------------------------------- Painting
  madhubani: {
    sections: [
      overview(
        "Madhubani painting, also called Mithila painting, comes from the Mithila region of northern Bihar and adjoining parts of Nepal. It is known for bold outlines, bright colours, densely filled surfaces with no empty space, and subjects drawn from Hindu mythology, nature and village ritual, especially marriage.",
        "For generations it was painted by women on the mud walls and floors of their homes for festivals and weddings. Since the 1960s it has also been painted on paper and cloth, and it is now one of India's best-known folk arts. Madhubani painting is registered as a Geographical Indication.",
      ),
      history(
        "Local tradition traces the art to the Ramayana, saying that King Janaka of Mithila had the city painted for the wedding of his daughter Sita to Rama. Whatever its origins, the practice of painting walls, especially the kohbar ghar, the room where a newly married couple spends their first nights, is old.",
        "The wider world learned of the paintings after the Bihar earthquake of 1934, when a British official, William G. Archer, saw them on damaged walls and later wrote about them. During a severe drought in the late 1960s, the All India Handicrafts Board encouraged women to paint on paper so that they could earn an income, and the art moved onto portable surfaces and into markets.",
      ),
      where(
        "The heartland is Madhubani district, especially the villages of Jitwarpur, Ranti and Rasidpur, and the surrounding Mithila region, including Darbhanga. Madhubani railway station's walls are covered with paintings by local artists.",
      ),
      form(
        "Styles and technique",
        "Several styles are recognised. Bharni (filling) uses solid areas of bright colour; kachni (line) uses fine lines and hatching, often in one or two colours; tantrik depicts deities and symbols associated with Tantric worship; godna draws on tattoo motifs; and kohbar refers to the paintings made for the marriage chamber, with symbols of fertility such as lotuses, bamboo, fish and parrots.",
        "Traditional colours were made from natural sources: lamp black, turmeric, pollen, indigo, flowers and leaves, and the paintings were made with twigs, fingers, matchsticks and nib pens. Many artists today use acrylics or poster colours, though some still prepare natural pigments. Borders are usually decorated with geometric or floral patterns.",
      ),
      people(
        "Jagdamba Devi was the first Madhubani artist to receive the Padma Shri, in 1975, followed by artists such as Sita Devi, Ganga Devi, Mahasundari Devi and Baua Devi. Their work brought the form to national and international attention.",
      ),
      seasons(
        "The cooler months from October to March are the best time to visit Bihar. Festivals such as Chhath, in October or November, and weddings bring wall and floor paintings to the villages. State craft fairs in Patna and Dilli Haat in Delhi often have Madhubani artists selling directly.",
      ),
      respect(
        "Visiting Jitwarpur or Ranti is best arranged through a local contact or cooperative. Ask before photographing artists and their homes, and buy directly to support them. Genuine hand-painted works show slight irregularities; printed reproductions are common in markets.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  warli: {
    sections: [
      overview(
        "Warli painting is the art of the Warli people, an Adivasi (indigenous) community who live in the hills and coastal plains on the border of Maharashtra and Gujarat. It uses a simple vocabulary of circles, triangles and lines, painted in white on a red-brown ground of mud and cow dung, to show people farming, dancing, hunting, fishing and celebrating.",
        "Figures are made of two triangles joined at the tip, with a circle for the head and lines for limbs. The best-known motif is the tarpa dance, in which a ring of dancers spirals around a musician playing the tarpa, a long wind instrument made from a gourd. Warli painting is registered as a Geographical Indication.",
      ),
      history(
        "The Warli tradition of wall painting is old, though its early history is not documented. Women traditionally painted the walls of their homes for weddings and harvest festivals, especially the chauk, a square enclosing an image of Palaghata, a goddess of fertility.",
        "In the 1970s, the Warli artist Jivya Soma Mashe began painting on paper and cloth, and his work drew national and international attention. He received the Padma Shri in 2011. Today many Warli artists paint for exhibitions and markets.",
      ),
      where(
        "Warli communities live mainly in Palghar district of Maharashtra, especially around Dahanu, Jawhar, Talasari and Vikramgad, and in neighbouring areas of Gujarat and Dadra and Nagar Haveli.",
      ),
      form(
        "Technique and motifs",
        "Traditionally, the paint is made from rice paste mixed with water and gum, applied with a bamboo stick chewed at the end to make a brush. The background is a wall plastered with mud and cow dung, which gives the red-brown colour.",
        "Motifs show daily life and rituals: farming, the harvest, weddings, the tarpa dance, trees, animals and birds. The circle and triangle are said to come from observation of nature: the circle from the sun and moon, and the triangle from mountains and trees.",
      ),
      people(
        "Jivya Soma Mashe is the best-known Warli artist and is credited with bringing the art to the wider world. His sons and many other artists continue the tradition.",
      ),
      seasons(
        "The cooler months from October to March are the most comfortable time to visit. The harvest season and weddings are when traditional wall paintings are made.",
      ),
      respect(
        "Warli villages are home to communities with their own customs; visit with a local guide, ask before photographing homes and people, and buy directly from artists to support them.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  pattachitra: {
    sections: [
      overview(
        "Pattachitra is the name given to painting on cloth in Odisha and West Bengal. The word comes from the Sanskrit patta, cloth, and chitra, picture. In Odisha, pattachitra is closely tied to the worship of Jagannath at Puri, while in West Bengal it is a tradition of narrative scrolls painted and sung by the patuas.",
        "Odisha's pattachitra is registered as a Geographical Indication.",
      ),
      history(
        "In Odisha, the chitrakars, hereditary painters, have long painted images of Jagannath, Balabhadra and Subhadra. During the anasara period each year, when the deities of the Jagannath temple are withdrawn from public view after their ritual bath (Snana Purnima), painted images are worshipped in their place. Pilgrims took pattachitra home as souvenirs.",
        "In West Bengal, the patuas paint long scrolls (pat) with stories, and sing songs (pater gaan) as they unroll them, frame by frame. Their themes include mythology, local legends and contemporary events.",
      ),
      where(
        "In Odisha, Raghurajpur, a heritage crafts village near Puri, is the most famous centre, with nearly every household engaged in painting. In West Bengal, the village of Naya in Pingla, Paschim Medinipur district, is the best-known centre of patua scroll painting.",
      ),
      form(
        "Materials and technique",
        "In Odisha, the canvas is prepared by coating cotton cloth with a paste of tamarind seed and chalk, then polishing it. Colours are traditionally natural: white from conch shells, black from lamp soot, red from hingula (cinnabar), yellow from haritala (orpiment) and others. Brushes are made from animal hair. The paintings have bold outlines, decorated borders and densely filled backgrounds.",
        "Raghurajpur artists also make tala pattachitra, palm-leaf engravings, in which the design is incised with a stylus and darkened with soot.",
      ),
      people(
        "The chitrakars of Raghurajpur and the patuas of Naya are the main practitioners, and several have received national awards.",
      ),
      seasons(
        "Raghurajpur can be visited year-round, but the cooler months from October to March are most comfortable. Rath Yatra in Puri, in June or July, is a major festival. In Naya, the annual Pot Maya festival, held in November, brings together patuas and visitors.",
      ),
      respect(
        "Raghurajpur and Naya are villages of homes and workshops; visit respectfully, ask before photographing, and buy directly from artists.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  kalamkari: {
    sections: [
      overview(
        "Kalamkari is the hand-painting or block-printing of cotton with natural dyes, practised in Andhra Pradesh. The name comes from the Persian kalam, pen, and kari, craftsmanship. There are two main styles: the Srikalahasti style, in which designs are drawn freehand with a pen, and the Machilipatnam style, in which designs are printed with carved wooden blocks.",
        "Both Srikalahasti Kalamkari and Machilipatnam Kalamkari are registered as Geographical Indications.",
      ),
      history(
        "Painted and printed cotton from the Coromandel coast was a major export for centuries, and was prized in Europe as chintz in the seventeenth and eighteenth centuries. The Machilipatnam style developed under the patronage of the Golconda sultans, with Persian motifs.",
        "The Srikalahasti style developed around temples, especially the Srikalahasti Shiva temple, and depicts stories from the Ramayana, the Mahabharata and the Puranas, often on large temple hangings.",
      ),
      where(
        "Srikalahasti, in Tirupati district, is the centre of the pen style. Machilipatnam and Pedana, in Krishna district, are the centres of the block-printed style.",
      ),
      form(
        "Materials and technique",
        "The process involves many steps, often described as around seventeen, over several weeks. The cloth is first soaked in a mixture of myrobalan and buffalo milk, which helps it take dye. Designs are drawn with charcoal from tamarind twigs, then outlined with an iron-based black dye (kasimi). Alum is applied as a mordant for red, which comes from madder or chay root. Indigo gives blue, and yellow comes from myrobalan flowers or pomegranate rind. Between steps, the cloth is washed in running water and dried in the sun.",
        "The pen (kalam) is a sharpened bamboo stick with a felt or cotton pad that holds the dye.",
      ),
      people(
        "Families of artisans in Srikalahasti and Pedana continue the craft, and several have received national awards.",
      ),
      seasons(
        "The workshops can be visited year-round. The cooler months from October to February are most comfortable.",
      ),
      respect(
        "Buy directly from artisans or cooperatives. Genuine kalamkari uses natural dyes; screen-printed imitations are common.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  "pahari-painting": {
    sections: [
      overview(
        "Pahari painting refers to the miniature painting of the Himalayan foothill states (pahari means 'of the hills') of what are now Himachal Pradesh, Jammu and Uttarakhand, made from the late seventeenth to the nineteenth century. It is celebrated for its delicate line, lyrical mood and romantic and devotional subjects.",
        "The Kangra school is the most famous, but there are many others, including Basohli, Guler, Chamba, Mandi, Kullu, Nurpur and Garhwal.",
      ),
      history(
        "The earliest Pahari paintings, from Basohli in the late seventeenth century, are bold and intense, with strong colours and stylised figures. In the eighteenth century, a family of painters from Guler, including Pandit Seu and his sons Manaku and Nainsukh, developed a more naturalistic and refined style, which spread to other courts.",
        "The Kangra school flourished under Raja Sansar Chand in the late eighteenth and early nineteenth centuries, producing some of the most celebrated works of Indian painting. The decline of the hill courts in the nineteenth century ended the tradition, though some artists today revive it.",
      ),
      where(
        "Pahari paintings are held in museums across India and abroad. Important collections include the Bhuri Singh Museum in Chamba, the Kangra Art Museum in Dharamshala, the Government Museum and Art Gallery in Chandigarh, and the National Museum in New Delhi.",
      ),
      form(
        "Themes and technique",
        "Common themes include the love of Radha and Krishna, from texts such as the Gita Govinda and the Bhagavata Purana; the Rasikapriya and other works of poetry; the Baramasa (the twelve months); ragamala (paintings of musical modes); and portraits of rulers.",
        "The paintings are made on handmade paper with mineral and vegetable pigments and fine brushes, often with gold and silver highlights.",
      ),
      people(
        "Nainsukh of Guler is one of the most celebrated Indian painters. Manaku, his brother, and the later family workshop shaped the Kangra style. Mola Ram was a notable painter of the Garhwal school.",
      ),
      seasons(
        "Museums in Himachal Pradesh are open year-round. Dharamshala and Chamba are most pleasant from March to June and September to November.",
      ),
      respect(
        "Follow museum rules on photography. When buying contemporary Pahari-style paintings, ask about the artist and materials.",
      ),
    ],
    links: [NATIONAL_MUSEUM, MOC],
  },

  "rajput-painting": {
    sections: [
      overview(
        "Rajput painting is the court painting of the Rajput kingdoms of Rajasthan and parts of central India, made from about the sixteenth to the nineteenth century. It is not a single style but a family of schools, each tied to a court: Mewar (Udaipur), Bundi, Kota, Kishangarh, Marwar (Jodhpur), Amber and Jaipur, Bikaner and others.",
        "The paintings, mostly small works on paper meant to be held in the hand and viewed in albums or sets, show the life of Krishna and other religious themes, illustrated poetry, ragamala sets that personify musical modes, portraits of rulers, court ceremonies, hunts and festivals. Their colour is often bold and flat, with stylised landscapes and architecture.",
      ),
      history(
        "Rajput painting grew out of earlier western Indian manuscript painting and was shaped from the late sixteenth century by contact with the Mughal court, where many Rajput princes served. Some courts, such as Bikaner and Amber, absorbed much Mughal naturalism, while others, such as Mewar, kept a more conservative, vividly coloured idiom.",
        "Mewar produced landmark works such as the Chawand Ragamala of 1605, painted by Nasiruddin, and large illustrated Ramayana manuscripts in the mid-seventeenth century associated with the painter Sahibdin. Bundi and Kota became known for lush vegetation, monsoon skies and, at Kota, dramatic hunting scenes. At Kishangarh in the eighteenth century, under the poet-prince Savant Singh, the painter Nihal Chand created idealised images of Radha and Krishna with elongated eyes and profiles, of which the portrait known as Bani Thani is the most famous. In the early nineteenth century Marwar produced vivid paintings for Maharaja Man Singh, including works for the Nath sect he followed.",
      ),
      where(
        "The best places to see Rajput painting are the City Palace Museum in Udaipur, the Mehrangarh Museum in Jodhpur, the City Palace museum and the Albert Hall Museum in Jaipur, and the Chitrashala of Bundi Palace, a gallery of eighteenth-century wall paintings. The National Museum in New Delhi has a major collection. Contemporary miniature painters work in Udaipur, Jaipur, Bikaner, Kishangarh and Nathdwara, where large cloth paintings (pichhwai) are made to hang behind the image of Shrinathji.",
      ),
      form(
        "Materials and technique",
        "Traditional painters work on wasli, sheets of handmade paper pasted together into a firm card. The drawing is made in a light colour, covered with a thin white ground, and the paper is burnished with a smooth stone so that the surface is hard and smooth. Colours are built up in layers and burnished again between them.",
        "Pigments were ground from minerals and plants: lapis lazuli for the finest blue, malachite for green, cinnabar and red lead for reds, orpiment for yellow, and lamp black. Gold and silver were applied as powdered metal or leaf and burnished to a shine. Brushes were made from squirrel hair, sometimes with a single hair for the finest lines.",
      ),
      people(
        "Nasiruddin and Sahibdin of Mewar and Nihal Chand of Kishangarh are among the few Rajput painters whose names are known; most painters worked anonymously in court workshops (chitrashalas), often in hereditary families. A number of contemporary miniature painters in Rajasthan have received national awards.",
      ),
      seasons(
        "The palace museums of Rajasthan are open year-round, but the cooler months from October to March are the best time to visit. Some museums close or change hours on certain days, so check before you go.",
      ),
      respect(
        "Follow museum rules on photography, which are often strict for fragile paintings. When buying contemporary miniatures, ask who painted the work and with what materials; many shop pieces are prints or quickly made copies. Genuine antiques more than a hundred years old cannot legally be taken out of India without permission, and claims that a cheap piece is old should be treated with caution.",
      ),
    ],
    links: [NATIONAL_MUSEUM, MOC],
  },

  "thanjavur-painting": {
    sections: [
      overview(
        "Thanjavur painting, also known as Tanjore painting, is a classical style of devotional painting from Thanjavur in Tamil Nadu. It is known for jewel-like colours, raised relief work, and the lavish use of gold foil, glass beads and gemstones, which catch the light of oil lamps in a home shrine.",
        "The subjects are almost always Hindu deities and saints, shown frontally in a central position with attendants and an arch-like frame. Krishna, especially as the child Balakrishna, is the most popular figure. Thanjavur painting is registered as a Geographical Indication.",
      ),
      history(
        "The style developed at Thanjavur under the Nayaka rulers in the seventeenth century and flourished under the Maratha rulers who followed them, particularly in the late eighteenth and early nineteenth centuries. Paintings were made for palaces, temples, monasteries and the shrines of wealthy homes.",
        "The painters belonged to communities of artisans, including the Rajus of Thanjavur and Tiruchirappalli, who worked in family workshops. With the end of royal patronage the tradition became a domestic and commercial art, and it remains popular as a devotional object and a wedding gift.",
      ),
      where(
        "Thanjavur and Tiruchirappalli are the main centres, with workshops and shops in and around both cities. Chennai and Bengaluru have many practitioners. Older paintings can be seen in museums, including the Thanjavur Palace complex.",
      ),
      form(
        "Materials and technique",
        "The base is a wooden board, traditionally of jackfruit or teak, over which a cotton cloth is pasted with gum. The cloth is coated several times with a paste of powdered limestone or chalk and gum, and smoothed. The design is drawn on, and areas such as crowns, jewellery, pillars and thrones are built up in relief with a thicker paste.",
        "Pieces of glass, beads and semi-precious stones are set into the relief, and gold foil is pressed over the raised areas. The rest of the painting is coloured in bright, flat tones, often deep red, green and blue, with dark outlines. A finished painting can take from days to many weeks, depending on its size and detail.",
      ),
      people(
        "Thanjavur painting is carried on by family workshops and by many trained artists, some of whom have received national awards. Tamil Nadu's state handicrafts corporation (Poompuhar) and other bodies support artisans.",
      ),
      seasons(
        "Thanjavur can be visited year-round, but the cooler months from November to February are most comfortable. The city's other attractions, including the Brihadisvara temple and the Saraswathi Mahal library in the palace complex, make a visit to the workshops part of a wider trip.",
      ),
      respect(
        "Ask about the quality of the gold foil and stones when buying, since prices vary greatly with materials; reputable sellers will explain what was used. Paintings are heavy and are usually framed behind glass, so arrange packing and shipping carefully. Keep them away from damp, which can damage the gesso.",
        "Thanjavur paintings are devotional images. Many families keep them in a shrine, so treat them with care when handling them in a shop or home.",
      ),
    ],
    links: [GI, HANDICRAFTS, MOC],
  },

  "gond-art": {
    sections: [
      overview(
        "Gond painting is a contemporary art form of the Gond people of central India, one of the country's largest Adivasi (indigenous) communities. It is recognisable by its vivid colours and by figures filled with patterns of dots, dashes, lines and fine textures, depicting animals, birds, trees, deities and stories from Gond myth and everyday life.",
        "The style that is now internationally known developed from the 1980s among Pardhan Gond artists, a community of bards who traditionally sang the genealogies and myths of the Gond.",
      ),
      history(
        "Gond communities have long decorated the walls and floors of their homes with paintings and patterns, called digna and bhittichitra, especially for festivals. The contemporary art began when the artist Jangarh Singh Shyam, from the village of Patangarh in Dindori district, was encouraged by the artist J. Swaminathan to paint for Bharat Bhavan, the arts centre in Bhopal, in the early 1980s.",
        "Jangarh Singh Shyam's work was exhibited in India and abroad, and he inspired many relatives and neighbours to paint. After his death in 2001, his family and other artists continued and expanded the tradition, and today there is a large community of Gond artists, many based in Bhopal.",
      ),
      where(
        "Bhopal and the village of Patangarh in Dindori district, Madhya Pradesh, are the main centres. Gond artists also work in other parts of Madhya Pradesh, Chhattisgarh and Maharashtra.",
      ),
      form(
        "Technique and themes",
        "Artists first draw the outline of the figure and then fill it with patterns, which are often an artist's signature. Common motifs include the mahua and saja trees, peacocks, tigers, elephants, fish and the deity Bada Dev. Paintings often illustrate myths about the creation of the world and the origin of the Gond people.",
        "Traditional colours came from charcoal, coloured soil, plant sap, leaves and cow dung, but most artists now use acrylic on canvas or paper.",
      ),
      people(
        "Jangarh Singh Shyam is the founder of the contemporary Gond style. Bhajju Shyam, Durga Bai Vyam and Venkat Raman Singh Shyam are among the many artists who have received national and international recognition; Bhajju Shyam and Durga Bai Vyam have both received the Padma Shri.",
      ),
      seasons(
        "Bhopal is pleasant from October to March. The Madhya Pradesh Tribal Museum and Bharat Bhavan in Bhopal, and the Indira Gandhi Rashtriya Manav Sangrahalaya (National Museum of Humankind), all display Gond art.",
      ),
      respect(
        "Buy directly from artists or reputable galleries to support them. Gond art draws on sacred myths; ask artists about the stories behind their work.",
      ),
    ],
    links: [HANDICRAFTS, MOC],
  },

  // ---------------------------------------------------------------- Languages and scripts
  "hindi-devanagari": {
    sections: [
      overview(
        "Hindi is the most widely spoken language in India and is the main language of a broad belt of the north and centre, from Rajasthan and Madhya Pradesh to Uttar Pradesh, Bihar, Jharkhand, Chhattisgarh, Uttarakhand, Himachal Pradesh, Haryana and Delhi. It is written in the Devanagari script, which is also used for Sanskrit, Marathi, Nepali, Konkani, Maithili, Bodo, Dogri and other languages.",
        "Under the Constitution, Hindi in Devanagari is the official language of the Union government, with English also used for official purposes. It is one of the twenty-two languages listed in the Eighth Schedule of the Constitution.",
      ),
      history(
        "Hindi developed from the medieval spoken languages of north India, which descend from Sanskrit through the Prakrits and Apabhramsha. The everyday speech of the Delhi region, called Khari Boli, became the basis of both modern standard Hindi and Urdu, which share most of their grammar and core vocabulary. Hindi draws more on Sanskrit for higher vocabulary, Urdu more on Persian and Arabic.",
        "Literature in languages and dialects now grouped under Hindi has a long history: the devotional poetry of Kabir, Surdas in Braj Bhasha, Tulsidas, whose Ramcharitmanas is in Awadhi, and Mirabai. Modern Hindi prose and poetry flourished from the nineteenth century, with writers such as Bharatendu Harishchandra, Premchand, Jaishankar Prasad, Suryakant Tripathi 'Nirala' and Mahadevi Varma. On 14 September 1949 the Constituent Assembly adopted Hindi in Devanagari as the official language of the Union, and the date is marked as Hindi Diwas.",
      ),
      where(
        "Hindi is the main language across the Hindi-speaking states, and is widely understood as a second language elsewhere, especially in cities and in Maharashtra, Gujarat, Punjab and the north-east. Many people in the Hindi belt also speak a regional language such as Bhojpuri, Maithili, Awadhi, Rajasthani or Haryanvi at home.",
      ),
      form(
        "The script and useful words",
        "Devanagari is written from left to right, and most letters hang from a horizontal line along the top called the shirorekha. Each consonant carries an inherent 'a' sound, and other vowels are shown by marks attached to the consonant. Letters are arranged in a logical order by where they are pronounced in the mouth.",
        "Learning a few words helps everywhere. Namaste is a greeting; dhanyavaad or shukriya mean thank you; haan and nahin are yes and no; kitna? asks 'how much?'; paani is water; and ruko means stop. Learning the Devanagari numerals and the names of the towns on your route makes it much easier to read bus boards and railway signs.",
      ),
      people(
        "The Central Hindi Directorate and the Kendriya Hindi Sansthan, based in Agra, promote and teach the language. The Central Institute of Indian Languages in Mysuru supports research and teaching of all Indian languages.",
      ),
      seasons(
        "Hindi Diwas, on 14 September, is marked by events in schools and government offices. Literary festivals, such as the Jaipur Literature Festival in January, include sessions in Hindi, and kavi sammelans, gatherings of poets reading to large audiences, are held in many towns.",
      ),
      respect(
        "Attempts to speak Hindi are almost always welcomed. Use aap, the polite form of 'you', with strangers and elders, and add ji to a name or title to show respect. Remember that Hindi is not the first language of every Indian: in the south, the east and the north-east, it is courteous to learn a word or two of the local language too.",
      ),
    ],
    links: [CIIL, MOC],
  },

  bengali: {
    sections: [
      overview(
        "Bengali (Bangla) is the language of West Bengal and Tripura, and of the Barak valley in southern Assam, and the national language of Bangladesh. With roughly a quarter of a billion speakers across the two countries, it is one of the most widely spoken languages in the world. In India it is the second most widely spoken language after Hindi.",
        "It is written in the Bengali script, which is closely related to the script used for Assamese, and has an exceptionally rich literary tradition.",
      ),
      history(
        "Bengali developed from the Magadhi Prakrit of eastern India. The Charyapada, a collection of Buddhist mystical songs from roughly the tenth to twelfth centuries, is often cited as the earliest literature in a form of the language. Medieval Bengali literature includes Krittibas's Ramayana, the poetry of Chandidas, and the Mangal-kavya narratives.",
        "In the nineteenth century, Calcutta (Kolkata) was the centre of the Bengal Renaissance, a period of literary, social and intellectual change. Writers such as Bankim Chandra Chattopadhyay, Michael Madhusudan Dutt and Rabindranath Tagore, who in 1913 became the first non-European to win the Nobel Prize in Literature, transformed the language. Tagore wrote the national anthems of both India and Bangladesh. In Bangladesh, the language movement of 1952 led UNESCO to declare 21 February International Mother Language Day.",
      ),
      where(
        "Bengali is the main language of West Bengal, Tripura and the Barak valley in Assam, and is spoken by communities in Jharkhand, Odisha, Bihar, the Andaman and Nicobar Islands and elsewhere in India.",
      ),
      form(
        "The script and useful words",
        "The Bengali script is written from left to right, with a horizontal line along the top of most letters, like Devanagari, but with different letter shapes. Like other Indian scripts, consonants carry an inherent vowel, and other vowels are written with marks.",
        "Useful words: nomoshkar is a respectful greeting, dhonnobad is thank you, and kemon achhen? means 'how are you?'. In Kolkata, metro stations, road signs and most shop signs are in Bengali and English.",
      ),
      people(
        "Rabindranath Tagore, Kazi Nazrul Islam, Sarat Chandra Chattopadhyay, Jibanananda Das, Mahasweta Devi and Satyajit Ray, who also wrote fiction, are among the many celebrated figures of Bengali culture. Visva-Bharati at Santiniketan, founded by Tagore, and the Paschimbanga Bangla Akademi in Kolkata are important institutions.",
      ),
      seasons(
        "The International Kolkata Book Fair, held in January or February, is one of the largest book fairs in the world. Pohela Boishakh, the Bengali New Year in mid-April, and Durga Puja in the autumn are major cultural occasions.",
      ),
      respect(
        "Bengali speakers are proud of their language and literature. A greeting in Bengali is warmly received, and asking about Tagore or the poets of the region is a good conversation starter.",
      ),
    ],
    links: [CIIL, MOC],
  },

  tamil: {
    sections: [
      overview(
        "Tamil is the language of Tamil Nadu and Puducherry, and an official language of Sri Lanka and Singapore. It has a continuous literary history of more than two thousand years, and in 2004 it became the first language to be declared a classical language by the Government of India.",
        "Tamil belongs to the Dravidian family, with Telugu, Kannada and Malayalam, and is written in its own script. Spoken Tamil differs considerably from the formal written language, so the Tamil you hear in a shop is not quite the Tamil you read on a sign.",
      ),
      history(
        "The earliest Tamil literature, known as Sangam literature, is generally dated to the early centuries BCE and CE. It includes anthologies of poems on love (akam) and on war and public life (puram), and the grammar Tolkappiyam. The Thirukkural, a work of 1,330 couplets on ethics, politics and love attributed to Thiruvalluvar, is among the most widely read works in any Indian language. The epics Silappatikaram and Manimekalai followed.",
        "From around the sixth to the ninth centuries, the devotional hymns of the Nayanmars, saints devoted to Shiva, and the Alvars, saints devoted to Vishnu, shaped temple worship across the south; their hymns are still sung in temples. Kambar's Tamil Ramayana dates from the medieval period. In the twentieth century the poet Subramania Bharati wrote powerful nationalist and reformist verse, and novelists such as Kalki Krishnamurthy and Jayakanthan reached a mass readership.",
      ),
      where(
        "Tamil is spoken throughout Tamil Nadu and Puducherry and by communities in Karnataka, Kerala, Andhra Pradesh, Telangana and the Andaman and Nicobar Islands, as well as in Sri Lanka, Singapore, Malaysia, Mauritius, South Africa and a large global diaspora.",
      ),
      form(
        "The script and useful words",
        "The Tamil script has twelve vowels, eighteen consonants and a special letter called the aytham, which combine into 247 letters. It has fewer consonants than most Indian scripts, so one letter can stand for sounds that other scripts distinguish, and a few additional Grantha letters are used for words borrowed from Sanskrit. Tamil has its own numerals, but everyday writing uses the international digits.",
        "Useful words: vanakkam is a respectful greeting; nandri is thank you, and romba nandri is thank you very much; aamaa and illai are yes and no; evvalavu? asks 'how much?'; and konjam means 'a little'. Many people in Tamil Nadu prefer Tamil or English to Hindi, so these words go further than Hindi phrases.",
      ),
      people(
        "Thiruvalluvar, Kambar, the poet Avvaiyar and Subramania Bharati are among the most revered figures of Tamil literature. The 133-foot statue of Thiruvalluvar at Kanyakumari, one foot for each chapter of the Thirukkural, is a symbol of the language. Universities such as Tamil University in Thanjavur and the Central Institute of Classical Tamil in Chennai support research.",
      ),
      seasons(
        "Pongal, the harvest festival in mid-January, and Puthandu, the Tamil New Year in mid-April, are the main cultural occasions. The Chennai Book Fair, held in January, is one of the largest in India, and the December music season in Chennai is a showcase for Tamil song.",
      ),
      respect(
        "Tamil speakers are proud of their language, and greeting people with vanakkam is warmly received. Bus destination boards in Tamil Nadu are often only in Tamil, so ask staff or fellow passengers at the bus stand and confirm the destination before boarding. Road and railway signs are generally in Tamil and English.",
      ),
    ],
    links: [CIIL, MOC],
  },

  urdu: {
    sections: [
      overview(
        "Urdu is spoken by tens of millions of people in India, especially in Uttar Pradesh, Bihar, Telangana, Maharashtra, Karnataka, Delhi and Jammu and Kashmir, and is the national language of Pakistan. It is written from right to left in a Perso-Arabic script, usually in the flowing Nastaliq style.",
        "In everyday speech Urdu and Hindi are very close: they share their grammar and most common words and are mutually intelligible in conversation. They differ most in script and in formal and literary vocabulary, where Urdu draws on Persian and Arabic and Hindi on Sanskrit.",
      ),
      history(
        "Urdu developed in north India from the twelfth and thirteenth centuries onwards, on the base of the Khari Boli speech of the Delhi region, with a large vocabulary from Persian, the language of the courts, and from Arabic and Turkic. It was long called Hindavi, Rekhta or Hindustani, and its literature developed first in the Deccan and then in Delhi and Lucknow.",
        "Urdu poetry reached great heights in the eighteenth and nineteenth centuries with poets such as Mir Taqi Mir and Mirza Ghalib, and later Muhammad Iqbal. In the twentieth century, writers such as Premchand, who wrote in both Urdu and Hindi, Saadat Hasan Manto, Ismat Chughtai and Faiz Ahmad Faiz shaped modern Urdu literature, and Urdu was the language of much of the Hindi film song tradition.",
      ),
      where(
        "Urdu is an official language in several Indian states and territories, including Telangana, Uttar Pradesh, Bihar, Delhi and Jammu and Kashmir. You will see it on signs in Old Delhi, Lucknow, Hyderabad's old city, Srinagar and Bhopal, and on railway station boards in some regions.",
      ),
      form(
        "The script and useful words",
        "Urdu is written right to left, with letters that change shape depending on their position in a word. Short vowels are usually not written. Numerals, however, are written left to right.",
        "Useful words: adaab and assalamu alaikum are greetings; shukriya is thank you; ji haan and ji nahin are polite yes and no; and khuda hafiz is a farewell.",
      ),
      people(
        "Mir Taqi Mir, Mirza Ghalib, Muhammad Iqbal, Firaq Gorakhpuri and Faiz Ahmad Faiz are among the great poets. The National Council for Promotion of Urdu Language supports the language in India, and the Rekhta Foundation maintains a large online archive of Urdu poetry.",
      ),
      seasons(
        "Mushairas, gatherings of poets reciting to an audience, are held throughout the year, especially in Lucknow, Delhi and Hyderabad. The Jashn-e-Rekhta festival in Delhi, usually in December, celebrates Urdu language and culture.",
      ),
      respect(
        "Urdu is part of the shared heritage of India, used by people of many faiths. At a mushaira, audiences respond with 'wah' and 'mukarrar' (again!) after a fine couplet, and it is fine to join in.",
      ),
    ],
    links: [CIIL, MOC],
  },

  "punjabi-gurmukhi": {
    sections: [
      overview(
        "Punjabi is the language of Punjab, spoken by more than a hundred million people across India and Pakistan and a large diaspora. In India it is written in the Gurmukhi script, while in Pakistan it is usually written in a Perso-Arabic script called Shahmukhi.",
        "Gurmukhi, meaning 'from the mouth of the Guru', is also the script of the Guru Granth Sahib, the scripture of the Sikhs, though the scripture contains hymns in several languages.",
      ),
      history(
        "Punjabi developed from the Prakrits of north-western India. Its literature includes the verses of Baba Farid, the thirteenth-century Sufi poet whose hymns are included in the Guru Granth Sahib, and the hymns of Guru Nanak and the later Gurus.",
        "Gurmukhi was standardised by Guru Angad, the second Sikh Guru, in the sixteenth century. Waris Shah's eighteenth-century Heer, the tragic romance of Heer and Ranjha, and the Sufi poetry of Bulleh Shah are classics. Modern writers include Bhai Vir Singh, Amrita Pritam and Shiv Kumar Batalvi.",
      ),
      where(
        "Punjabi is the official language of Punjab and is an additional official language in Delhi and Haryana. It is spoken by Punjabi communities across India, and in the diaspora in the UK, Canada, the United States and Australia.",
      ),
      form(
        "The script and useful words",
        "Gurmukhi has thirty-five basic letters (the painti), written left to right, with a line along the top. Punjabi is a tonal language, so the pitch of a syllable can change its meaning.",
        "Useful words: Sat Sri Akal is the common Sikh greeting; dhanvaad or shukriya means thank you; and ji is a respectful suffix.",
      ),
      people(
        "Baba Farid, Guru Nanak, Waris Shah, Bulleh Shah, Bhai Vir Singh, Amrita Pritam and Shiv Kumar Batalvi are among the great figures of Punjabi literature.",
      ),
      seasons(
        "Vaisakhi in April, Lohri in January and Gurpurabs are major cultural occasions.",
      ),
      respect(
        "Greeting Sikhs with Sat Sri Akal is warmly received. At gurdwaras, signs are often in Gurmukhi with English and Hindi.",
      ),
    ],
    links: [CIIL, MOC],
  },

  malayalam: {
    sections: [
      overview(
        "Malayalam is the language of Kerala and of Lakshadweep and the Mahe area of Puducherry. A Dravidian language closely related to Tamil, it was declared a classical language by the Government of India in 2013.",
        "It is written in its own rounded script, and Kerala's very high literacy rate means that Malayalam newspapers, books and films have an unusually large readership.",
      ),
      history(
        "Malayalam developed from a western dialect of early Tamil, with a large Sanskrit vocabulary, and emerged as a distinct literary language by around the ninth to twelfth centuries. Thunchaththu Ezhuthachan, the sixteenth-century poet who wrote a Malayalam version of the Ramayana, is called the father of modern Malayalam.",
        "In the twentieth century, the poets Kumaran Asan, Vallathol Narayana Menon and Ulloor S. Parameswara Iyer modernised Malayalam poetry. G. Sankara Kurup received the first Jnanpith Award, India's highest literary award, in 1965. Prose writers such as Vaikom Muhammad Basheer, Thakazhi Sivasankara Pillai, M. T. Vasudevan Nair, Kamala Das and O. V. Vijayan made Malayalam literature famous across India.",
      ),
      where(
        "Malayalam is spoken throughout Kerala, Lakshadweep and Mahe, and by Malayali communities across India, the Gulf states and the global diaspora.",
      ),
      form(
        "The script and useful words",
        "The Malayalam script is written left to right, with rounded letters. A script reform in 1971 simplified many letter forms, but older forms are still seen on some signs.",
        "Useful words: namaskaram is a respectful greeting; nanni is thank you; and enthaanu? means 'what is it?'.",
      ),
      people(
        "Thunchaththu Ezhuthachan, Kumaran Asan, Vallathol, Basheer and M. T. Vasudevan Nair are among the many celebrated figures. The Kerala Sahitya Akademi in Thrissur supports Malayalam literature.",
      ),
      seasons(
        "Onam, in August or September, is the great festival of Kerala. The Kerala Literature Festival in Kozhikode, held in January, is a major literary event.",
      ),
      respect(
        "Greeting people with namaskaram is warmly received. English is widely understood in Kerala, especially in tourist areas.",
      ),
    ],
    links: [CIIL, MOC],
  },

  // ---------------------------------------------------------------- Regional customs
  namaste: {
    sections: [
      overview(
        "Namaste is the most familiar greeting in India: the palms are pressed together in front of the chest, fingers pointing up, often with a slight bow of the head, while saying 'namaste' or 'namaskar'. It is used for hello and goodbye, to strangers and friends, and works in almost every situation.",
        "India has many other greetings, which reflect its languages and faiths, and knowing a few of them is a simple way to show respect.",
      ),
      s(
        "history",
        "Origins and meaning",
        "Namaste comes from Sanskrit: namah, meaning a bow or salutation, and te, 'to you'. The joined-palm gesture, called anjali mudra or pranamasana, appears in ancient Indian sculpture and is used in prayer as well as greeting. Many people understand it as acknowledging the presence of the divine in the other person, though in everyday use it is simply a courteous hello.",
        "Touching the feet of elders (pranam or charan sparsh), or bending to touch the ground near them, is a mark of deep respect in many Hindu, Sikh and Jain families. The elder typically responds with a blessing, touching the younger person's head or back.",
      ),
      s(
        "where",
        "Greetings across India",
        "Namaste and namaskar are understood everywhere. Regional and religious greetings include vanakkam in Tamil Nadu, namaskara in Karnataka, namaskaram in Kerala and Andhra Pradesh, nomoshkar in Bengal and Assam, and Ram Ram or Jai Shri Krishna in parts of the north and west. Sikhs greet one another with Sat Sri Akal. Many Muslims greet with assalamu alaikum (peace be upon you), answered with walaikum assalam, or adaab, often with the right hand raised to the forehead. In Ladakh the greeting is julley, in Sikkim and among Tibetan Buddhists tashi delek, and in Meghalaya khublei among Khasi speakers.",
      ),
      form(
        "How to do it",
        "Press your palms together at chest height, fingers pointing upward, and bow your head slightly while saying 'namaste'. For an elder or someone you wish to honour, you can bow a little more or raise your hands a little higher. You do not need to say anything if the gesture alone feels more natural.",
        "Handshakes are common among men in business and in cities. Between men and women, wait to see whether a woman offers her hand; namaste is always a safe alternative, and many people prefer it. Hugging and kissing on the cheek are uncommon outside close friends and family, especially in public.",
      ),
      s(
        "people",
        "Forms of address",
        "Respect is shown with words as well as gestures. In Hindi and many other languages, adding ji to a name or title (Sharma-ji, Aunty-ji) is polite. Older people are often called uncle and aunty by younger people even if they are not related, and in the south, anna (elder brother) and akka (elder sister) are used in Tamil and Kannada. Using the polite form of 'you', such as aap in Hindi, is courteous with strangers.",
      ),
      seasons(
        "Greetings change with festivals: people wish one another 'Happy Diwali', 'Eid Mubarak', 'Merry Christmas', 'Happy Holi', 'Gurpurab di lakh lakh vadhaiyan' or 'Pongal vazhthukkal' as the season comes. Joining in with a festival greeting is warmly received.",
      ),
      respect(
        "Use namaste confidently: no one will mind if it is not perfect. Return a greeting in the form it was given if you can, for instance Sat Sri Akal to a Sikh or walaikum assalam to assalamu alaikum. Do not touch someone's head, which is considered sacred in many communities, and avoid pointing at people with a finger; an open hand is more polite.",
      ),
    ],
    links: [MOC],
  },

  "shoes-off": {
    sections: [
      overview(
        "In India, shoes are taken off before entering temples, gurdwaras, mosques, Jain temples, most Buddhist monasteries and many homes, and sometimes at shops, offices, clinics and other places. The custom is so widespread that it is worth assuming you will remove your shoes unless you see others keeping theirs on.",
        "Removing shoes is about cleanliness and respect: footwear carries dirt from the street, and sacred and domestic spaces are kept clean.",
      ),
      s(
        "history",
        "Origins and meaning",
        "The custom is ancient and shared by many faiths in India. In Hindu temples, the inner spaces are sacred, and shoes are left outside. In Sikh gurdwaras, visitors also wash their feet before entering. In mosques, the prayer hall is a clean space for prostration. At Jain temples, leather items such as belts and bags may also be prohibited.",
      ),
      s(
        "where",
        "Where you will meet it",
        "Expect to remove your shoes at all religious sites, from the Golden Temple in Amritsar to the Meenakshi temple in Madurai, at many museums housed in temples or palaces, at homes, and at some guesthouses and shops. In homes, look at the doorway: if there is a pile of shoes, add yours.",
      ),
      form(
        "How it works",
        "Most religious sites have a place to leave shoes, often a counter where you hand them in and receive a token. At gurdwaras this is a free service run by volunteers; at temples there may be a small fee. Socks are usually allowed, and are helpful on hot stone floors in summer. At some sites you will walk barefoot over long distances, so plan accordingly.",
      ),
      s(
        "people",
        "Common mistakes",
        "Do not step on doorsteps or thresholds in temples. Avoid placing shoes on top of others' shoes or near sacred objects. Do not touch sacred objects with your feet, and do not point your feet at people or deities.",
      ),
      seasons(
        "In summer, stone floors can become extremely hot; visit early in the morning or late in the afternoon, or wear socks.",
      ),
      respect(
        "Carry a pair of socks, use the shoe deposit, and follow the example of those around you.",
      ),
    ],
    links: [MOC],
  },

  "right-hand": {
    sections: [
      overview(
        "In much of India, food is eaten with the fingers of the right hand, and the right hand is used for giving and receiving things, especially food, money and gifts. The left hand is traditionally associated with washing and personal hygiene, so using it to eat from a shared dish or to hand food to someone can seem impolite.",
        "Eating with the hand is not a lack of cutlery: many people say food tastes better that way, and it lets you mix rice and curries, feel the temperature and pick out bones. Spoons and forks are always available in restaurants if you prefer them.",
      ),
      s(
        "history",
        "Origins and meaning",
        "The distinction between the hands is old and is found across South Asia and in many other parts of the world. In Hindu, Muslim, Sikh and Jain households alike, the right hand is used for eating, offering and blessing. Closely linked is the idea of jutha, food or utensils that have touched someone's mouth, which are considered unclean for others. This is why people pour water into their mouths from a bottle without touching their lips, and why food is not usually tasted from a shared dish and then offered around.",
      ),
      s(
        "where",
        "Where you will meet it",
        "Eating by hand is common everywhere, but especially at home meals, in thali restaurants, at temple and gurdwara meals, and at south Indian meals served on a banana leaf, such as the Kerala sadya or a Tamil wedding feast. In north India, rotis are torn with the right hand and used to scoop up dal and vegetables.",
      ),
      form(
        "How to do it",
        "Wash your hands before the meal; restaurants have washbasins for this. With rice dishes, mix a little rice with curry using your fingertips, gather it into a small ball, and push it into your mouth with your thumb. With bread, tear a piece using only the right hand, holding it down with the fingers while pulling with the thumb and forefinger, then fold it around some food. Try to keep food to your fingers rather than the palm.",
        "The left hand can hold a glass of water, a serving spoon or a dish passed to you, as long as it does not touch your food. At a banana-leaf meal, the server will move along the row and refill; to decline more, hold your hand over the leaf. Wash your hands again at the end.",
      ),
      s(
        "people",
        "Giving and receiving",
        "Use your right hand, or both hands together, when handing someone money, a gift, a business card or food, and when accepting them. Offering or accepting something with both hands is especially respectful with elders. In temples and gurdwaras, prasad (blessed food) is received in the right hand, often cupped by the left beneath it.",
      ),
      seasons(
        "The custom applies all year. Festivals and weddings, which often involve large communal meals, are the most likely occasions for visitors to eat with their hands among locals.",
      ),
      respect(
        "No one expects visitors to be expert, and many hosts will offer a spoon. If you would like to try, ask your host to show you; it is often appreciated. Avoid licking your fingers in formal settings, do not offer food from your own plate to others, and avoid wasting food, especially at religious meals.",
      ),
    ],
    links: [MOC],
  },

  "kerala-temple-dress": {
    sections: [
      overview(
        "Many of Kerala's major Hindu temples have dress codes. At the strictest, men must wear a mundu (a white or cream cloth wrapped at the waist) and enter with the upper body bare, and women must wear a sari, a long skirt and blouse, or a traditional two-piece dress. Some temples admit only Hindus.",
        "Rules vary from temple to temple and can change, so check before you go.",
      ),
      s(
        "history",
        "Origins and meaning",
        "Traditional temple dress codes in Kerala reflect long-standing customs of ritual purity and simplicity before the deity. The bare upper body for men is a sign of humility and openness before the god.",
      ),
      s(
        "where",
        "Where you will meet it",
        "Strict dress codes apply at temples such as Sree Padmanabhaswamy in Thiruvananthapuram, Guruvayur Sri Krishna temple, and many temples in Thrissur and other towns. The Padmanabhaswamy and Guruvayur temples admit only Hindus.",
      ),
      form(
        "What to wear",
        "Men: a mundu or dhoti, with no shirt in the inner areas. Women: a sari, a long skirt and blouse, or the Kerala mundum neriyathum. Some temples now allow women to wear churidar. Mundus can often be hired or bought near the entrance, sometimes worn over trousers.",
      ),
      s(
        "people",
        "Other rules",
        "Phones and cameras are often not allowed inside temple premises; lockers are usually provided. Footwear must be removed. Some areas may be restricted.",
      ),
      seasons(
        "Temple festivals in Kerala are held throughout the year, especially from October to May.",
      ),
      respect(
        "Follow the rules at each temple, ask staff if unsure, and respect restrictions on entry. Many smaller temples have more relaxed rules.",
      ),
    ],
    links: [MOC],
  },

  langar: {
    sections: [
      overview(
        "Langar is the community kitchen of the Sikh gurdwara, where a free vegetarian meal is served to anyone who comes, regardless of religion, caste, gender, nationality or status. Everyone sits together on the floor in rows (pangat) and is served the same simple food by volunteers.",
        "Every gurdwara has a langar, from a village gurdwara feeding a few dozen people to the Golden Temple in Amritsar, which serves tens of thousands of meals every day and many more on festival days.",
      ),
      s(
        "history",
        "Origins and meaning",
        "Langar was begun by Guru Nanak, the founder of Sikhism, in the fifteenth and sixteenth centuries, and was institutionalised by the third Guru, Guru Amar Das, who is remembered for asking that all visitors, even rulers, eat in the langar before meeting him. Sikh tradition tells that the Mughal emperor Akbar sat in the pangat when he visited.",
        "Langar expresses core Sikh values: the equality of all people, seva (selfless service) and sharing what one has (vand chhakna). The kitchen is run entirely by volunteers and funded by donations.",
      ),
      s(
        "where",
        "Where you will meet it",
        "Every gurdwara in India and abroad runs a langar. The Guru Ram Das Langar at the Golden Temple in Amritsar is the largest and most famous, with enormous kitchens where volunteers cook dal and rotis around the clock. Bangla Sahib and Sis Ganj Sahib in Delhi, Hazur Sahib at Nanded and Patna Sahib also serve large numbers.",
      ),
      form(
        "How it works",
        "Before entering, cover your head (scarves are provided), remove your shoes and wash your hands. You will be guided to sit cross-legged in a row on mats on the floor. Volunteers hand out plates and walk along the rows serving roti, dal, a vegetable dish and sometimes rice and kheer (rice pudding). Hold out cupped hands, one over the other, to receive roti. You can ask for more, or decline politely with a raised hand.",
        "When you have finished, carry your plate to the washing area, where volunteers collect them. Try not to leave food: take only what you will eat.",
      ),
      s(
        "people",
        "Volunteering",
        "Anyone, Sikh or not, can volunteer in the langar, and many visitors find it the most memorable part of a visit. You can help peel vegetables, roll rotis, serve food or wash dishes. Ask a volunteer or a gurdwara official where help is needed.",
      ),
      seasons(
        "Langar runs every day of the year. On Gurpurabs, the anniversaries of the Gurus, and on Vaisakhi, langars are especially large, and roadside langars may be set up to serve passers-by.",
      ),
      respect(
        "Langar is free, and no one will ask you to pay. You may make a donation at the gurdwara if you wish. Do not bring tobacco, alcohol or meat into the gurdwara. Do not take photos of people eating without permission. Dress modestly, keep your head covered throughout and follow the guidance of the volunteers.",
      ),
    ],
    links: [SGPC, MOC],
  },

  "buddhist-circumambulation": {
    sections: [
      overview(
        "At Buddhist monasteries, stupas (chortens) and prayer walls in the Himalaya, visitors walk around sacred structures in a clockwise direction, keeping them on their right. Prayer wheels, cylinders filled with prayers and inscribed with the mantra Om mani padme hum, are turned clockwise as you walk past.",
        "The practice, called kora in Tibetan and pradakshina in Sanskrit, is a form of devotion and meditation, and it is one of the simplest ways for visitors to show respect at Buddhist sites.",
      ),
      s(
        "history",
        "Origins and meaning",
        "Circumambulation is an ancient practice in Indian religions, found in Hinduism and Jainism as well as Buddhism. It honours the sacred object at the centre and, for Buddhists, generates merit. Prayer wheels are believed to have the same effect as reciting the prayers they contain.",
        "Followers of the Bon religion, the pre-Buddhist faith of Tibet, circle sacred sites anticlockwise, but at Buddhist sites the direction is always clockwise. Buddhist chanting of Ladakh, the recitation of sacred texts in the monasteries and villages of the region, was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2012.",
      ),
      s(
        "where",
        "Where you will meet it",
        "The practice is followed at Buddhist sites across the Himalaya: monasteries such as Hemis, Thiksey, Alchi and Lamayuru in Ladakh, Key and Tabo in Spiti, Rumtek and Pemayangtse in Sikkim, Tawang in Arunachal Pradesh, and the Tsuglagkhang complex in McLeod Ganj, Dharamshala. It is also followed at Bodh Gaya in Bihar, where the Buddha attained enlightenment.",
      ),
      form(
        "How to do it",
        "Walk around stupas, chortens, monasteries and mani walls (walls of stones carved with prayers) with the structure on your right. Turn prayer wheels clockwise with your right hand as you pass. You may see pilgrims prostrating as they go, or counting prayers on a string of beads (mala).",
        "Inside prayer halls, walk clockwise around the room, remove your hat and shoes, and do not touch statues, paintings or ritual objects. Sit with your feet tucked under you, not pointing towards the altar or images.",
      ),
      s(
        "people",
        "Etiquette in monasteries",
        "Monks and nuns are often happy to talk with visitors, but be considerate. Do not sit on raised seats reserved for lamas. Ask before photographing people or the interiors of prayer halls, where photography is sometimes forbidden. A small donation is welcome but never required.",
      ),
      seasons(
        "Monastery festivals with masked cham dances are held throughout the year: Hemis Tsechu in Ladakh in June or July, and Losoong and Pang Lhabsol in Sikkim. Losar, the new year, falls in December or January in Ladakh and in February or March in most Tibetan communities. Saga Dawa, marking the Buddha's birth, enlightenment and death, is in May or June. Ladakh is mostly visited from May to September.",
      ),
      respect(
        "Dress modestly when visiting monasteries, with shoulders and knees covered. Be quiet during prayers. Never climb on stupas or mani walls, and do not take stones from them. If you join a kora, follow the flow of pilgrims and keep to the clockwise direction.",
      ),
    ],
    links: [unesco("Buddhist chanting of Ladakh", "buddhist-chanting-of-ladakh-recitation-of-sacred-buddhist-texts-in-the-trans-himalayan-ladakh-region-jammu-and-kashmir-india-00839"), UNESCO_INDIA, MOC],
  },
};

/**
 * Further paragraphs added in the second editing pass, appended to the named
 * section of each article. Kept separate so the first-pass text stays easy to
 * review against its sources.
 */
const extra: Record<string, Record<string, string[]>> = {
  "mekhela-chador": {
    history: [
      "Assamese tradition held weaving to be an essential skill, and the Ahom kingdom, which ruled the Brahmaputra valley for some six centuries until the early nineteenth century, patronised muga silk, which was reserved at times for the nobility. Mahatma Gandhi, visiting Assam in the 1920s, remarked on the skill of its women weavers, a comment that is still quoted with pride in the state.",
      "The mekhela chador remains everyday dress for many Assamese women, especially in cotton, and silk sets are kept for festivals and weddings. A bride often receives a set of muga and pat silk, and the riha, a narrower cloth wrapped around the upper body, is worn with it on ceremonial occasions.",
    ],
    technique: [
      "A mekhela is woven as a long rectangle and stitched into a tube, then wrapped with deep pleats at the front, unlike a sari, which is pleated from a single length. The chador is draped across the upper body, tucked at the waist and thrown over the left shoulder. Borders and the ends of the chador carry the richest patterns, woven in extra weft on the handloom.",
      "Other communities of Assam have their own garments, such as the dokhona of the Bodo, the rignai of some Tripuri communities and the gale and ribi of the Mising. These are distinct traditions, not variants of the mekhela chador.",
    ],
    respect: [
      "Muga is costly because the silkworm is raised outdoors on the som and sualu trees, and production is small. A genuine muga garment has a natural golden lustre without dye; ask for the GI or Silk Mark label and buy from Sualkuchi workshops, Assam government emporia or reputable cooperatives. Visitors to Sualkuchi can usually watch weavers at work, but ask before photographing inside homes.",
    ],
  },
  "chaniya-choli": {
    history: [
      "The skirt-blouse-veil ensemble is shared, with variations, by many communities of Gujarat and Rajasthan, including Rabari, Ahir, Charan and Rajput women, and the cut, colour and embroidery of a garment can tell others the wearer's community and sometimes her marital status. In the courts of Rajasthan, the poshak, a formal version in fine silk and brocade, became a mark of rank.",
      "In the twentieth century, Navratri celebrations in Gujarat's cities turned the chaniya choli into a festive fashion, with new designs every year. Bridal lehengas, worn across north India and in the diaspora, are its most elaborate descendants.",
    ],
    technique: [
      "The chaniya is cut from many triangular panels (kali) to give a wide flare that swirls in the dance; some festival skirts use several metres of cloth. Bandhani is made by tying thousands of tiny knots in the cloth before dyeing, so that each knot leaves a small undyed dot; Jamnagar in Gujarat and Jaipur and Jodhpur in Rajasthan are major centres. Leheriya is made by rolling and tying the cloth diagonally before dyeing to create waves.",
      "Mirror work uses small pieces of mirrored glass held in place by a frame of stitches. Gota-patti, a Rajasthani technique, appliqués ribbons of gold or silver-coloured metallic lace onto the fabric in floral and geometric shapes.",
    ],
    people: [
      "Tie-dye households in Jamnagar, Bhuj and Jaipur, embroiderers of Kutch and Saurashtra, and gota workers in Jaipur and Ajmer are among the many artisans behind these garments. Cooperatives in Kutch sell embroidered blouses and skirts made by village women.",
    ],
  },
  "kerala-temple-dress": {
    history: [
      "For much of Kerala's history the bare upper body was simply normal dress in the heat for men of many communities, and the temple rule preserves that older custom. Rules for women have changed several times: some temples that once insisted on the sari now allow churidar or salwar, especially with a mundu worn over it, after decisions by temple boards.",
      "Entry rules have also been the subject of reform. The Temple Entry Proclamation of 1936 in Travancore opened state temples to Hindus of all castes, a landmark of Kerala's social reform movement. Questions about entry continue to be debated, so the rules at a given temple reflect both tradition and the decisions of its administrators.",
    ],
    technique: [
      "A plain white or cream mundu with a narrow border is ideal; a coloured lungi is not usually accepted. Tie it by wrapping it around the waist from right to left and tucking the end in firmly. At temples where shirts are not allowed, men may carry a thin shoulder cloth (melmundu) but should remove it in the inner areas if asked.",
      "Women should avoid sleeveless tops, short skirts and jeans. At Padmanabhaswamy, a mundu can usually be rented at the entrance and wrapped over other clothes. Leave leather items and large bags in the lockers provided.",
    ],
    people: [
      "Temples are administered by devaswom boards and trusts, which set and post the rules. Staff at the entrance will tell you what is permitted, and their decision is final. Queues at major temples can be very long on festival days and weekends; early morning visits are usually quieter.",
    ],
    respect: [
      "If you are not admitted to a temple, you can often still see its gateway and tank, attend the festival processions outside, and visit nearby museums. Kerala also has a great many temples, churches and mosques with no such restrictions, and festivals such as Thrissur Pooram take place in public grounds open to all.",
    ],
  },
  "naga-shawls": {
    history: [
      "Before the twentieth century, textiles were among the most important forms of wealth and honour in Naga societies. A man's shawl could show that he had taken a head in war or that he had given a feast of merit, a series of increasingly lavish feasts for the village that raised the host's standing. Women wove these shawls for their families, and some designs could be woven only by women of particular clans.",
      "Missionaries arrived from the late nineteenth century, and most Nagas are now Christian. Head-hunting ended, and the old feasts declined, but many shawl designs remain bound to community identity, and wearing the right shawl is still important at festivals and ceremonies.",
    ],
    technique: [
      "The backstrap loin loom is a simple frame of bamboo and wood, with one end tied to a post or wall and the other attached to a strap around the weaver's back; she controls the tension by leaning. Because the cloth is narrow, a shawl is usually made of three panels sewn together. Some shawls carry painted bands, such as the Ao warrior shawl, whose central white band was traditionally painted with animal and human figures.",
      "Colours carry meaning: red, black and white dominate, with yellow and green in some shawls. Synthetic acrylic yarn is now widely used because it is bright and cheap, but some weavers and cooperatives have returned to cotton and natural dyes.",
    ],
    respect: [
      "Shawls with designs that signify earned status should not be worn casually by outsiders. Weavers and cooperatives will tell you which shawls are general designs suitable for anyone. Buying at the Hornbill Festival, at cooperatives in Kohima and Dimapur, or directly in villages helps weavers earn a fair price. Indian visitors need an Inner Line Permit to enter Nagaland; foreign nationals must register.",
    ],
  },
  "salwar-kameez": {
    history: [
      "The word salwar comes from Persian, and kameez from Arabic, through Persian. Loose trousers and long tunics were worn by both men and women in the north-west of the subcontinent, and men in Punjab, Kashmir and Pakistan still wear a kurta-pyjama or shalwar kameez.",
      "Women's salwar kameez spread across India from the mid-twentieth century, partly through Punjabi migration after Partition, partly through cinema, and above all because it is practical: it allows free movement, is easy to wear on buses, bikes and trains, and can be modest or fashionable. In many states it is the most common dress of college students and working women.",
    ],
    technique: [
      "Fabrics range from cotton and khadi for summer to silk and brocade for weddings and wool for winter. Unstitched 'suit pieces' are sold in sets of three lengths of cloth, which a tailor makes up in a day or two; tailoring is inexpensive and fittings are quick.",
      "Phulkari, the 'flower work' embroidery of Punjab, covers a cloth with darn stitches in silk floss, traditionally in golden yellow and orange on a red or brown ground. The bagh, a densely embroidered phulkari, was once part of a bride's trousseau.",
    ],
    seasons: [
      "Markets such as Lajpat Nagar and Sarojini Nagar in Delhi, Hall Bazaar in Amritsar and Aminabad in Lucknow have huge choices of readymade suits and fabric. Festivals such as Karva Chauth, Lohri and Eid see new suits bought and stitched.",
    ],
    respect: [
      "For visitors, a cotton salwar kameez is a comfortable choice for travel in conservative areas, at religious sites, and in heat, since it covers the legs and shoulders while staying cool. Keep the dupatta handy: you will need it to cover your head in gurdwaras, many dargahs and some temples.",
    ],
  },
  "dhoti-mundu": {
    history: [
      "Ancient sculpture shows men wearing a draped lower cloth with a separate upper cloth, and this remains the basis of ritual dress for many Hindu priests and for festival wear. In the nineteenth and twentieth centuries, as Western dress spread, the dhoti became a statement for some: worn by Gandhi as a sign of solidarity with India's poor, and by leaders and writers who wished to keep Indian dress.",
      "In Kerala and Tamil Nadu, the mundu and veshti remain everyday dress for millions of men, worn to work, in markets and at home, and in the formal white-and-gold version at weddings and festivals.",
    ],
    technique: [
      "In north India the dhoti, often around four to five metres long, is wrapped round the waist and one end passed between the legs and tucked at the back, giving a trouser-like drape. In Bengal the dhuti is worn with long pleats at the front for festivals and weddings. The mundu and veshti are shorter, usually about two metres, and wrapped around the waist without passing between the legs; a double mundu (double veshti) is a longer cloth folded in two for a heavier drape.",
      "Lungis, coloured or checked cloths sewn into a tube, are informal everyday wear across the south and east. Balaramapuram near Thiruvananthapuram is known for fine handloom mundus and saris, and Balaramapuram handloom is registered as a Geographical Indication.",
    ],
    respect: [
      "Wearing a mundu or veshti is welcomed and is required at some temples. Shopkeepers will happily show you how to tie it. In formal situations, and when meeting elders or entering a home, unfold a mundu that has been folded up at the knee; it is considered polite. A lungi is home and street wear, not suitable for formal occasions.",
    ],
  },
  malayalam: {
    history: [
      "Inscriptions in old Malayalam appear from around the ninth century, written in the Vatteluttu and Kolezhuthu scripts, and the modern Malayalam script developed from the Grantha script used for Sanskrit. Manipravalam, a literary mix of Malayalam and Sanskrit, was used for court poetry and is still the language of Kathakali songs.",
      "Kerala's literacy movement, its public libraries and its newspapers, some among the most widely read in India, have given Malayalam a vigorous modern literature. The state has produced several winners of the Jnanpith Award, and Malayalam cinema has a strong reputation for realism.",
    ],
    technique: [
      "Malayalam has a large inventory of letters, including sounds not found in Tamil, and uses special marks called chillu for consonants that end a syllable without a vowel. Because many people use both the traditional and the reformed spellings, the same word may look different on an old shop sign and in a new textbook.",
      "Other useful words: alle? is a tag like 'isn't it?'; ethra? asks 'how much?'; venda means 'not needed'; and sheri means 'all right'.",
    ],
    respect: [
      "Malayalis are often bilingual or trilingual, with English, Hindi or Tamil, and many have worked in the Gulf, so you may hear Arabic loanwords too. Attempts to say even a few words, such as nanni or namaskaram, are appreciated, and reading a newspaper headline with a local is a good way to start a conversation.",
    ],
  },
  pheran: {
    history: [
      "Travellers' accounts and photographs from the nineteenth century show the pheran as the near-universal winter garment of the valley, worn by Hindus and Muslims, rich and poor, in different fabrics and lengths. Kashmiri Pandit women's pherans traditionally had distinctive long sleeves and were worn with a headdress called the taranga, while Muslim women's pherans were often worn with a headscarf; both traditions continue in changing forms.",
    ],
    technique: [
      "The pheran is cut straight, without a waist, and is pulled over the head. It has a side slit and wide sleeves, and in cold weather people often draw their arms inside to hold the kangri close to the body. Winter pherans are made of wool, tweed, pashmina blends or felted fabrics; summer ones of cotton. Women's pherans for weddings are richly embroidered in tilla, a couched metallic thread, around the neck and sleeves.",
      "Kangris are made of an earthen bowl woven around with wicker, with a handle, and are filled with embers from the household hearth. Charar-e-Sharief and other towns are known for kangri making. Because of the fire risk, people take care with kangris, and visitors should handle them with caution.",
    ],
    respect: [
      "A pheran is a practical buy for a winter trip to Kashmir and is readily available in Srinagar's markets, including Lal Chowk and the old city. Kashmiris generally take it kindly when visitors wear one. Ask before photographing people in their homes or at shrines, and be considerate of the region's sensitivities.",
    ],
  },
  "punjabi-gurmukhi": {
    history: [
      "Before Gurmukhi was standardised, Punjabi was written in several scripts, including Landa scripts used by traders. The Sikh Gurus' adoption of Gurmukhi made it the script of scripture and of Sikh learning, and printing in Gurmukhi spread in the nineteenth century. After Partition in 1947, Punjabi in India came to be written mainly in Gurmukhi and in Pakistan in Shahmukhi.",
      "The Punjabi Suba movement led in 1966 to the reorganisation of Punjab as a Punjabi-speaking state, and Punjabi became its official language. Punjabi University, Patiala, founded in 1962, was established with a mandate to develop the language.",
    ],
    technique: [
      "Gurmukhi has vowel signs that attach to consonants, and a few special marks: the addhak doubles the following consonant, and the tippi and bindi mark nasal sounds. The script is phonetic, so once the letters are learnt, words can be read as they are spoken.",
      "Punjabi has many regional dialects, including Majhi, spoken around Amritsar and Lahore and the basis of the standard language, Doabi, Malwai and Puadhi. Punjabi music, from bhangra songs to Sufi kafis, has made the language familiar far beyond Punjab.",
    ],
    respect: [
      "Address elders with ji and use tusi, the respectful 'you'. Gurmukhi on gurdwara signs and in scripture is treated with reverence; do not place books or papers with Gurbani on the floor or take them into washrooms.",
    ],
  },
  kalamkari: {
    where: [
      "Pedana, a few kilometres from Machilipatnam, has the largest concentration of block-printing workshops, and its prints are sold across India as dress fabric, bedspreads and table linen. Srikalahasti, near Tirupati, has smaller workshops that make large narrative hangings and smaller painted panels, often of temple themes and epic scenes arranged in rows of panels with Telugu captions.",
    ],
    people: [
      "Kalamkari was given new life in the twentieth century with the support of the All India Handicrafts Board under Kamaladevi Chattopadhyay, which helped set up training centres at Srikalahasti. Several Srikalahasti and Pedana craftsmen have since received national awards.",
    ],
    respect: [
      "Natural-dye kalamkari has soft, slightly uneven colours and a faint smell of the dyes when new; colours mellow with washing. Wash it separately in cold water the first few times. In Srikalahasti and Pedana, workshops often welcome visitors who want to see the drawing, dyeing and washing, but they are working spaces, so ask first and avoid stepping on cloth drying in the sun.",
    ],
  },
  "shoes-off": {
    where: [
      "Many Hindu temples ask you to remove shoes well outside the main gate, so you may walk barefoot across large courtyards and through queues. Mosques usually have a shoe rack at the entrance to the prayer hall, while the courtyard itself may be entered in shoes at some sites; follow the signs. Some museums in palaces or temples, Jain and Bahá'í places of worship such as the Lotus Temple in Delhi, and many yoga studios and Ayurvedic clinics also ask for shoes to be left outside.",
    ],
    technique: [
      "Slip-on shoes or sandals make the custom much easier, since you may take them off and on many times a day. Keep valuables out of shoes you leave in racks. At large sites, note the number of the counter where you left your shoes, as there may be several entrances. Some temples have shoe stands run by private contractors who charge a small fee; at gurdwaras the service is free and you may tip or donate if you wish.",
    ],
    people: [
      "In homes, slippers are often worn indoors but taken off before entering the kitchen or the prayer room. Never step over someone's legs or food laid out on the floor; walk around them. If your foot accidentally touches someone or a book, many Indians will touch the person or object and then their own eyes or chest as a gesture of apology, and you can do the same.",
    ],
    respect: [
      "If you have medical reasons for keeping shoes on, explain politely; some sites can make exceptions or provide covers, but many cannot. In winter, thick socks help on cold stone in north India and the hills. When in doubt, look at what local visitors do at the entrance and follow them.",
    ],
  },
  "banarasi-silk": {
    history: [
      "Varanasi's textiles are mentioned in early Buddhist literature, which describes fine cloth from Kashi. The brocade tradition grew richer under the Mughals, when designs such as the intertwining floral jaal and the kalga or paisley motif were popularised. In the nineteenth century, Banarasi saris became essential to weddings across north India.",
    ],
    technique: [
      "Weaving a heavy brocade sari is usually a two-person task: the weaver at the loom and an assistant who manages the pattern harness or jacquard. Zari was originally made from silver thread coated with gold; today most is 'tested zari', silver-coloured copper or a synthetic metallic yarn, which is cheaper and lighter. A good weaver can tell the difference by touch, and so can the price.",
      "The kadhua technique, in which each motif is woven separately with its own thread so the back is neat, is slower and more prized than the fekua technique, in which the extra-weft thread runs across the back and is then cut.",
    ],
    respect: [
      "Pure silk Banarasi saris carry the Silk Mark, and handloom pieces may carry the Handloom Mark and GI tag. Ask to see the reverse of the sari: handwoven kadhua work has a clean back, while powerloom pieces show regular, mechanical floats. Visiting a weaver's workshop through a cooperative or a trusted contact is the best way to understand the craft and pay the weaver directly.",
    ],
  },
  "kutch-embroidery": {
    history: [
      "Many of the communities of Kutch came there as herders and traders from Sindh, Baluchistan and Rajasthan over the centuries, bringing their own embroidery styles. Embroidery once served the home and the dowry: girls began stitching their wedding textiles years in advance, and the quality of the work reflected on the family. Commercial embroidery grew from the 1960s and 1970s, sometimes threatening older styles with simplified work.",
    ],
    technique: [
      "Each tradition has a distinctive visual language. Rabari women stitch bold outlines in chain stitch with many mirrors and use colourful designs on dark grounds. Ahir embroidery features peacocks, parrots and flowers. The Sodha Rajputs and Meghwal communities have their own styles, and soof, practised by Sodha and Meghwal women, is a counted-thread satin stitch worked in triangles from the back of the cloth so that each motif is perfectly geometric.",
      "Embroiderers work without drawings for many designs, counting the threads of the cloth. Traditional textiles include women's blouses (kanjari and choli), skirts, wall hangings (toran), quilt covers and bags.",
    ],
    seasons: [
      "Shrujan's Living and Learning Design Centre museum, at Ajrakhpur near Bhuj, explains the region's embroidery traditions, with galleries organised by community. Bhujodi, a weaving village near Bhuj, and the villages of Banni on the way to the White Rann are often combined with a visit during the Rann Utsav season.",
    ],
    respect: [
      "When buying, ask which community's style a piece is, who made it and how long it took. Organisations that work directly with embroiderers, such as Shrujan, Kala Raksha and Khamir, pay artisans fairly and can explain the work. In villages, many women embroider at home and may prefer not to be photographed; a smile and a question go a long way.",
    ],
  },
  kalbelia: {
    history: [
      "Kalbelia identity is tied to the Nath tradition of yogis, and the community traces its origin to Kanipa, a figure in that tradition. Their songs draw on these religious traditions and on the oral literature of the desert, and new songs are composed during performance.",
      "UNESCO's inscription noted the dance as an expression of the community's identity and of their adaptation to a changing way of life. As the Kalbelias became famous as performers, younger women began touring internationally, while many families continued to live in difficult conditions on the margins of villages.",
    ],
    technique: [
      "Dancers move with quick spins and serpentine undulations of the arms and body, often bending far back to pick up a coin or ring with the mouth or eyelids. The pace of the music rises steadily, and the dancers' black skirts, with their red, yellow and silver embroidery, open like a fan as they spin.",
    ],
    where: [
      "Kalbelia dancers perform in the evening at desert camps around Jaisalmer and in Pushkar, Jodhpur, Udaipur and Jaipur, and are invited to festivals around the world. Many families live in settlements near Pushkar, Ajmer and Jaisalmer, in the Chittorgarh area and in villages across western and central Rajasthan.",
    ],
  },
  "sanganer-block-printing": {
    technique: [
      "A typical workshop has long padded tables on which the cloth is stretched and pinned. The printer dips the block into a tray of colour laid over a cushion of fabric, positions it by eye against guide marks, and strikes it with the heel of the hand. For a multi-colour print, an outline block (rekh) is printed first, followed by blocks for the filling colours (datta and gadh). A skilled printer can make thousands of impressions a day, keeping the pattern continuous across the cloth.",
      "In Bagru, cloth is often first treated with harda (myrobalan), which turns it a pale yellow; printing with an iron solution then gives black, and alum gives red after the cloth is boiled with alizarin. The dabu resist creates patterns that stay pale when the cloth is dyed in indigo. Cloth is dried in the sun in open fields, a striking sight in Bagru.",
      "The blocks themselves are carved from seasoned teak or sheesham by specialist block-makers, many in Sanganer, Bagru and Pethapur in Gujarat. A single design may need several blocks, and a fine block can take days to carve.",
    ],
    respect: [
      "Synthetic dyes and screen printing are widely used, and screen-printed cloth is often sold as hand block printed. Look for small breaks and overlaps where blocks meet, which are signs of hand work, and ask whether natural dyes were used. Many workshops in Bagru welcome visitors for a demonstration, and some offer short workshops where you can print your own fabric.",
    ],
  },
  "pahari-painting": {
    technique: [
      "Pahari painters prepared their pigments themselves, grinding minerals such as lapis lazuli, malachite and cinnabar and mixing them with gum. Under-drawings were made in red or black, and many unfinished drawings survive, showing the painters' fluent line. The Kangra style is admired for its soft colour, flowing lines and lyrical landscapes, with rolling hills, rivers, flowering trees and lightning in monsoon skies.",
      "Many paintings were made in sets illustrating a text, such as the Bhagavata Purana or the Gita Govinda, and viewers would read the text and look at the images together, often in the company of a reciter or musician.",
    ],
    history: [
      "Scholars such as B. N. Goswamy have reconstructed the lives of Pahari painters from family records kept by priests at pilgrimage sites such as Haridwar, where families recorded visits over generations. This research identified Nainsukh and Manaku as individual artists, rather than anonymous workshop painters, and transformed the study of Indian painting.",
    ],
    respect: [
      "A number of artists in Kangra, Chamba and Dharamshala revive the style today and sell their work from studios and shops. Ask whether a painting is hand-painted on paper with natural pigments or a print, and expect prices to reflect the many hours fine miniature work takes.",
    ],
  },
  "northeast-cane-bamboo": {
    history: [
      "Bamboo is central to the material culture of the region's many communities, from Khasi, Garo and Jaintia in Meghalaya to Mizo, Naga, Adi, Apatani, Bodo, Mising and Tripuri communities. Houses, granaries and bridges were built of bamboo, and the same skills shaped tools, musical instruments, mats and containers. Patterns were passed down within families and villages.",
    ],
    technique: [
      "The khoh, a conical carrying basket worn on the back with a strap across the forehead, is a common sight in Meghalaya's markets. In Tripura, craftsmen are known for fine split-bamboo mats, screens and lampshades, and Tripura cane furniture is sold across India. Naga and Arunachali communities make baskets with tight twill weaves, and cane is used to make rainproof hats and bands for wrists and legs.",
      "Smoking bamboo items above the kitchen hearth, a practice in many homes, darkens and hardens them and helps keep insects away, giving old baskets their deep brown sheen.",
    ],
    people: [
      "Government institutions, including the Cane and Bamboo Technology Centre in Guwahati, and state handicraft corporations work with artisans on new products and markets, and many self-help groups of women produce for sale. Specific crafts are often associated with particular villages, so ask locally where a style is made.",
    ],
    respect: [
      "Weekly markets, such as those in Meghalaya and Nagaland, are a good place to see baskets in everyday use. Bulky items can be difficult to carry; many sellers will help with packing or shipping. Never remove items from village shrines or graves, where bamboo objects may have a ritual role.",
    ],
  },
  pattachitra: {
    technique: [
      "Raghurajpur painters work in a set order: first the borders, then the outlines of the figures, then the colours, one at a time, and finally the fine details and the black outlines. Faces are usually shown in profile with large, elongated eyes, and the backgrounds are filled with flowers and foliage. The finished painting is coated with lacquer for protection, giving it a soft sheen.",
      "The Bengali scrolls of the patuas are long, narrow vertical strips of paper, often backed with cloth, painted in panels that are revealed one by one while the patua sings the story. Subjects range from the Ramayana and Mangal-kavya narratives to recent events, public health campaigns and floods.",
    ],
    history: [
      "The patuas of Bengal include both Hindu and Muslim families, and many patuas have Muslim names while singing Hindu stories, a sign of the tradition's long, shared history. Raghurajpur was developed as a heritage crafts village by the state government, and it is also home to gotipua dance troupes.",
    ],
    respect: [
      "In Raghurajpur, almost every house is a studio, and artists will invite you in to see their work. It is fine to look without buying, but remember that you are in someone's home. Prices vary widely; fine paintings with natural pigments take weeks to make. In Naya, ask a patua to sing a scroll for you, and pay for the performance as well as for anything you buy.",
    ],
  },
  ghoomar: {
    technique: [
      "The basic movement is a slow, continuous turn on the spot, with the arms raised and the hands moving in graceful gestures, while the dancers move together around a circle. As the music quickens, the turns become faster and the skirts fly out. In court versions the dance was restrained and stately; in village versions it is freer, and women may sing as they dance, with the steps changing to suit each song.",
      "Some performances include feats such as dancing with a lamp or a stack of pots on the head, though these belong more to the stage than to family occasions.",
    ],
    history: [
      "In the princely states, Ghoomar was danced by the women of royal households on festive days, and songs such as 'Mhari Ghoomar Chhe Nakhrali' became famous across Rajasthan. At weddings, the bride is often welcomed into her new home with Ghoomar, and in many families the dance is a way of including the newcomer in the women's community.",
    ],
    respect: [
      "At cultural shows and hotels, performers welcome applause and often invite guests to join the final circle. Rajasthan's festival processions, such as Gangaur in Jaipur, Udaipur and Bikaner, and Teej in Jaipur, are public events where Ghoomar is often seen; arrive early to find a good place, and keep a respectful distance from women's groups in procession.",
    ],
  },
  "bihu-dance": {
    history: [
      "Bihu songs and dances were once performed mainly by young people in the fields and groves, away from the village, and were considered too flirtatious for respectable homes. In the twentieth century, Bihu was brought onto public stages in Guwahati and other towns, and organised celebrations by Bihu committees became central to Assamese cultural life. In April 2023, more than ten thousand dancers and drummers performed together in Guwahati in a celebrated mass performance.",
    ],
    technique: [
      "Women dance in lines or circles with small, quick steps and swaying hips, the hands moving in graceful gestures at waist and shoulder height. Men drum, play the pepa and dance with vigorous steps, sometimes squatting and leaping. Bihu songs have a distinctive melody and are full of images of nature and love; the dhol rhythm accelerates through a performance to an exciting climax.",
      "The jeng Bihu and other women's forms, and the Bihu of communities such as the Mising and Deori, show the variety within the tradition.",
    ],
    respect: [
      "Rongali Bihu stages in Guwahati and towns across Assam often run late into the night, with famous singers drawing large crowds. Entry is usually free. Assamese people are proud of Bihu and welcome visitors; a small gamosa, available in every market, is a good gift if you are invited to a home.",
    ],
  },
  lavani: {
    technique: [
      "A Lavani performance is driven by the dholki, whose sharp, rolling beats are answered by the dancer's footwork and the ring of her ankle bells. The dancer uses quick turns of the head, flicks of the eyes, and gestures to act out the lyrics, often teasing and flirting with the audience, and the singer's voice is strong and full-throated. Many songs are composed in a dialogue between a woman and her lover or husband.",
      "In tamasha, a Lavani number usually follows the gan (an invocation to Ganesh) and gaulan (a comic episode about Krishna and the milkmaids), and precedes the vag, a folk drama.",
    ],
    history: [
      "In the twentieth century, Marathi cinema took Lavani to a mass audience. Some critics campaigned against what they saw as vulgarity, while others defended Lavani as a great popular art with a strong tradition of social and political comment. Women performers today have more control over their careers, and some Lavani shows are staged in auditoriums for middle-class audiences.",
    ],
    respect: [
      "In traditional tamasha theatres, audiences call out and whistle, and it is customary to give money to performers during the show. If you attend, sit in the general audience, follow the lead of local spectators, and treat performers with the respect owed to any artist.",
    ],
  },
  warli: {
    history: [
      "Ethnographers and art historians noted Warli paintings from the mid-twentieth century, and the government's handicrafts programmes in the 1970s encouraged painting on paper. The Warli are one of many Adivasi communities in western India with their own languages, deities and festivals, and the paintings are only one expression of a rich culture.",
    ],
    technique: [
      "Warli paintings often show a whole landscape in one picture: a village with its houses, people working in fields, animals, birds, trees and the sun and moon, all arranged in a circular or spiralling composition. The tarpa dance, a spiral of joined figures, is one of the most recognisable images. Contemporary artists also paint in acrylic on canvas and in large murals.",
      "Because the figures are so simple, Warli imagery is often copied by designers. Real Warli paintings show the rhythm and life of the community's own subjects, rather than decorative patterns.",
    ],
    respect: [
      "Warli motifs appear on many goods sold in cities, often without benefit to Warli artists. To support the community, buy paintings signed by Warli artists, from cooperatives or from artists' families directly, and ask about the stories in the painting.",
    ],
  },
  chhau: {
    technique: [
      "Chhau dancers train in a set of basic steps and movements: walks (chali), leaps, turns and specific gaits (topka) that imitate animals, birds and the daily work of villagers. Seraikella dancers learn a vocabulary of stylised movements called uflis. The dance places great weight on the torso and the legs, since masked dancers cannot use facial expression, so feeling is conveyed through the angle of the head and the body.",
      "Performances are often held at night in an open space, and typically last several hours with many short items. Heroes, gods and demons appear in turn, with fights between Durga and Mahishasura, scenes from the Ramayana and stories of Shiva among the favourites.",
    ],
    history: [
      "In Seraikella, the royal family maintained Chhau and performed it in the Chaitra Parva festival; members of the family were themselves dancers and choreographers. In Mayurbhanj, the dance was supported by the rulers at Baripada. Purulia Chhau developed among village communities and remains a more rustic, energetic form.",
    ],
    respect: [
      "Village Chhau performances often draw large local crowds; sit where the organisers show you and avoid blocking the view of others. Masks for sale in Charida range from small souvenirs to full performance masks; ask the maker to explain the character a mask represents.",
    ],
  },
  "gond-art": {
    history: [
      "In the Pardhan tradition, bards sang the stories of the Gond gods and heroes to the accompaniment of the bana, a stringed instrument, and Pardhan artists today often say their painting translates those sung stories into images. When Jangarh Singh Shyam began to paint, he drew directly on these myths, creating a visual language that his community has continued and transformed.",
    ],
    technique: [
      "Each artist develops a signature pattern for filling forms, such as dots, fine lines, fish scales or tiny seeds, which can identify their work. Many paintings show the relationship between humans, animals and the natural world, and the tree, often the life-giving mahua, appears again and again. Some artists paint on large canvases, others illustrate books, and Gond artists have painted murals for public buildings and stations.",
    ],
    respect: [
      "Contemporary Gond paintings range widely in price and quality. Galleries and cooperatives that work directly with artists can tell you about the painter and the story. Ask before photographing artists' homes in Patangarh, which remains a working village.",
    ],
  },
  "bankura-terracotta": {
    technique: [
      "The finest Panchmura horses have a polished, glowing surface created by coating them with a slip of fine clay before firing. Each family has its own way of finishing the face, ears and decorations, and connoisseurs can tell which workshop made a horse. Large horses are built in sections over several days and must be dried slowly before firing to prevent cracking.",
    ],
    respect: [
      "Bishnupur's temples, protected by the Archaeological Survey of India, require a ticket; do not touch or climb on the terracotta panels, which are fragile and irreplaceable. Many visitors combine a trip to Panchmura with Bishnupur, and local guides can arrange visits to potters' workshops.",
    ],
  },
  mohiniyattam: {
    technique: [
      "The basic stance is a softer version of the half-seated position used in other classical dances, with the feet turned out and the knees bent, and the body sways gently from side to side. Eye movements are especially important, and the dancer's gaze follows the hands. Mohiniyattam uses many of the hand gestures of Kathakali, though they are performed more softly.",
      "Expressive pieces often explore the moods of a heroine in love, waiting for or longing for her beloved, or devotion to Krishna and other deities. Some contemporary dancers have created works on new themes using the Mohiniyattam vocabulary.",
    ],
    history: [
      "In the twentieth century, Mohiniyattam was carried forward by several schools of teaching, associated with the Kerala Kalamandalam and with dancers who developed their own approaches. Kalamandalam Kalyanikutty Amma's research and her book on the form were especially influential.",
    ],
  },
  bengali: {
    history: [
      "Bengali prose and print grew rapidly in the nineteenth century, aided by presses in Serampore and Calcutta, and by reformers such as Ishwar Chandra Vidyasagar, who wrote primers that are still used. The language played a central role in the cultural identity of Bengal, and in what is now Bangladesh the movement to recognise Bengali as a state language in 1952 became a foundation of national identity.",
    ],
    technique: [
      "Bengali has a soft, rhythmic pronunciation; the inherent vowel is pronounced closer to 'o' than 'a', so Hindi 'namaskar' becomes 'nomoshkar' in Bengali. Standard written Bengali is based on the speech of the Kolkata region, while dialects in Bangladesh and in other parts of West Bengal can be quite different. Other useful words: haan or hyan is yes, na is no, and koto? asks 'how much?'.",
    ],
    respect: [
      "Bengali culture places high value on literature, music, film and adda, long conversations among friends. Tagore's songs (Rabindrasangeet) are known by heart by many people, and asking someone about their favourite poet or film is a welcome way to start a conversation.",
    ],
  },
  pashmina: {
    technique: [
      "Kani shawls are woven on a loom with dozens of small wooden bobbins, each carrying a different colour, which the weaver passes back and forth following a coded pattern (talim) read out or written in a special notation. A complex kani shawl can take a year or more to weave. Sozni embroidery is done with a fine needle in silk or wool thread, often so fine that the design looks woven. Dorukha shawls are made so that both sides are finished, with no reverse.",
      "Kashmir Pashmina testing involves measuring fibre diameter under a microscope and checking for blends, since nylon and other wool are often mixed in.",
    ],
    history: [
      "In the eighteenth and nineteenth centuries, Kashmir shawls became fashionable in Europe, especially in France and Britain, where they were imitated on mechanical looms in Paisley, Scotland, giving the teardrop motif its English name. In Kashmir, the shawl trade was heavily taxed and the weavers often worked in hard conditions, and the craft declined in the later nineteenth century when European fashions changed.",
    ],
  },
  urdu: {
    technique: [
      "The Nastaliq style of the Perso-Arabic script slopes from upper right to lower left, giving Urdu writing its distinctive cascading look. Some sounds are written with letters borrowed from Arabic and Persian, and extra letters were created for sounds specific to Indian languages. Calligraphy in Urdu, as in Persian and Arabic, is a respected art.",
      "Many common words in everyday Hindi are of Persian and Arabic origin and are shared with Urdu, such as kitab (book), dost (friend), duniya (world) and zindagi (life).",
    ],
    seasons: [
      "In Lucknow and Hyderabad, the evenings of Ramzan and Eid bring a festive atmosphere to the old cities, and poetry gatherings often accompany cultural events. The Urs of Sufi saints, at shrines where qawwali is sung in Urdu, Persian and Hindavi, is another occasion to hear the language in performance.",
    ],
  },
  garba: {
    technique: [
      "A garba circle often begins slowly, with simple steps and claps, and speeds up gradually so that by the end of the night the dancers are whirling. Several rings may move at the same time, with the inner circle dancing in one direction and the outer in the other. Popular steps have names, such as dodhiyu and hinch, and many people learn new steps each year from classes held before the festival.",
      "In Dandiya Raas, the sticks are struck in rhythm with a partner, then with the next dancer as the lines rotate, so that everyone dances with many partners in turn.",
    ],
    history: [
      "Garba songs, called garbas, include old devotional songs and folk songs, as well as songs by poets such as Vallabh Bhatt Mewada, an eighteenth-century poet whose garbas to the goddess are still sung. In recent decades, film music and new compositions have joined the repertoire, and live bands playing garba have become stars in Gujarat.",
    ],
  },
  manganiyar: {
    people: [
      "Many Manganiyar and Langa musicians have toured internationally, and musicians such as Lakha Khan, a sarangi player who received the Padma Shri, have been recognised nationally. Theatre productions, such as Roysten Abel's The Manganiyar Seduction, presented the music to new audiences on world stages.",
    ],
  },
};

for (const [slug, bySection] of Object.entries(extra)) {
  const article = artArticles[slug];
  if (!article) continue;
  for (const [id, paragraphs] of Object.entries(bySection)) {
    article.sections.find((section) => section.id === id)?.paragraphs.push(...paragraphs);
  }
}
