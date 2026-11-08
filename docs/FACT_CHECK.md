# Fact-check log

Date checked: 2026-11-09 (all "date checked" values below are this date).

Status key. **Confirmed** means the claim was read in the cited source on the date checked. **Corrected** means the data was wrong or out of date and has been changed. **Could not confirm** means no official page that I could read supports the claim; where it matters, the wording was softened or left hedged, and the authority to check is named in the text.

Method notes. Pages were fetched with curl and a browser User-Agent. whc.unesco.org returns 403 to WebFetch but loads with curl, so UNESCO was read directly. Search engine summaries were used only to find pages, never as the evidence for "Confirmed". Several state portals (Jharkhand, Chhattisgarh, Nagaland tourism, Puducherry, Daman and Diu, Ladakh tourism) did not load.

Files edited: `src/data/states.ts`, `src/data/festivals.ts`, `src/data/heritage.ts` (comment only), `src/data/stories.ts`, and the four files in `src/data/destinations/`. `npx tsc --noEmit` passes.

## 1. Permits

| Item | Status | What changed | Source | Checked |
|---|---|---|---|---|
| Arunachal Pradesh: e-ILP for Indian citizens, Protected Area Permit for foreigners | Confirmed | Wording now says the e-ILP is for Indian citizens only; added source | https://arunachaltourism.com (Arrival Formalities) | 2026-11-09 |
| Arunachal: Bum La and Madhuri Lake need extra local or army permission | Could not confirm | Softened to "can need"; not on any page I could read | none | 2026-11-09 |
| Nagaland: ILP for non-residents | Corrected | The state ILP portal says the Bengal Eastern Frontier Regulation 1873 applies to Indians and foreigners alike, with a foreign tourist category. Data said only Indian citizens | https://ilp.nagaland.gov.in/faq and https://ilp.nagaland.gov.in/about | 2026-11-09 |
| Nagaland: foreign Protected Area Permit reimposed December 2024 | Could not confirm | MHA order not found or read. Worded as "reported to need" and sent to MHA and the Nagaland Home Department | none official | 2026-11-09 |
| Manipur: ILP for non-residents (extended 2019) | Could not confirm | Manipur tourism site lists an ILP page but I did not read its terms. Wording unchanged | https://manipurtourism.gov.in | 2026-11-09 |
| Manipur: foreigners register at CID Office, Imphal | Confirmed | Added to permit note | https://manipurtourism.gov.in/foreign-tourist/ | 2026-11-09 |
| Manipur: foreign PAP reimposed December 2024 | Could not confirm | No MHA order read. Mizoram's own tourism site states the December 2024 change for Mizoram, and a PTI report mentions Manipur (not re-read, article returned Access Denied). Worded as "reported", pointing to MHA Foreigners Division and e-FRRO | https://mizoramtourism.com/about/4 (Mizoram only) | 2026-11-09 |
| Mizoram: ILP for non-Mizo visitors, applied online; Bairabi-Sairang rail station is an entry point | Confirmed | Added "applied online" | https://mizoramtourism.com/about/4 | 2026-11-09 |
| Mizoram: foreign PAP from 17 December 2024, via e-FRRO after arriving in India | Confirmed | Replaced vague wording with the state's own description | https://mizoramtourism.com/about/4 | 2026-11-09 |
| Mizoram: "state cabinet approved new ILP guidelines in 2026" | Corrected | Removed. No source found; it appeared in states.ts and in the Aizawl guide and FAQ | none | 2026-11-09 |
| Sikkim: foreigners need RAP for the whole state; PAP for border areas for Indians and foreigners; Tsomgo, Nathu La, Zuluk, Lachen and Lachung are protected areas; Nathu La pass issued to Indian nationals only | Corrected | Data said Indians need "permits" and foreigners a "Sikkim permit". Now matches the state's RAP and PAP guidelines | https://www.sikkim.gov.in/department/departmentmenudetails?url=Menu%3Dtourism-civil-aviation-department%2Fgeneral-info | 2026-11-09 |
| Ladakh: Indian citizens need an Inner Line Permit for Nubra and Pangong | Corrected | Wrong. Leh district portal says the ILP applies only to foreign tourists. Indians register on the portal and pay fees. Fixed in states.ts, the Leh permit note and the Leh FAQ | https://www.lahdclehpermit.in/faq/ and https://www.lahdclehpermit.in/ | 2026-11-09 |
| Ladakh: foreigners need Protected Area Permit for Pangong, Nubra and similar areas | Confirmed | Unchanged | https://www.lahdclehpermit.in/ (notice on the home page) | 2026-11-09 |
| Lakshadweep: entry permit required, including for Indians, issued by the administration | Confirmed | Added source; ePermit portal named | https://lakshadweep.gov.in/tourism/entry-permit/ and https://lakshadweep.gov.in | 2026-11-09 |
| Lakshadweep: sponsorship requirement relaxed; foreigners limited to fewer islands | Could not confirm | Left hedged ("recent reports") | none official | 2026-11-09 |
| Andaman: foreigners' Restricted Area Permit rules | Corrected | Data was vague. Now states the March 2026 notice: no RAP for 29 islands; 11 more islands for day visits only until 31 Dec 2027; Afghanistan, China and Pakistan nationals and persons of origin still need MHA-approved RAP and are refused entry without one; Myanmar citizens need RAP for Mayabunder and Diglipur; separate approval for reserved forests, sanctuaries, tribal reserves | https://tourism.andamannicobar.gov.in/userpages/admin/whatsnewfile/2026030570Restricted Area Permit.pdf | 2026-11-09 |
| Andaman: Nicobar Islands "closed to tourists" | Corrected | Softened to restricted and not open for ordinary tourism, with special permission needed. The notice requires a RAP for islands not designated for tourism but does not say "closed" | same notice | 2026-11-09 |
| Andaman: no photography of or contact with tribes; no entry to tribal reserves | Confirmed | Added source | https://police.andamannicobar.gov.in/index.php/en/public-information/2013-10-13-13-24-03/guidelines-for-tourist-indian-foreigner.html | 2026-11-09 |
| Andaman: North Sentinel Island off-limits | Confirmed | Unchanged; PIB says the island plus 5 km of sea is a notified tribal reserve and lists the protective laws | https://www.pib.gov.in/PressReleasePage.aspx?PRID=1562728&reg=48&lang=2 | 2026-11-09 |
| Andaman: "836 islands, about 31 inhabited" | Could not confirm | Replaced with non-numeric wording | none | 2026-11-09 |
| Andaman: "contact with Jarawa prohibited by law" | Could not confirm | The police guidelines say do not interact with tribals, and PIB lists laws for the Sentinelese. I did not read the Regulation text for the Jarawa. Statement kept, in general terms | police page above | 2026-11-09 |
| Himachal (Kinnaur, Spiti): permit rules for foreigners | Could not confirm | Already hedged in data; unchanged | none | 2026-11-09 |
| Uttarakhand: Char Dham and Hemkund Sahib registration | Confirmed | Wording now attributes it to the Uttarakhand government portal | https://registrationandtouristcare.uk.gov.in/ | 2026-11-09 |
| Meghalaya: registration under the Residents Safety and Security Act | Could not confirm | Already hedged; unchanged | none | 2026-11-09 |

## 2. Security advice

| Item | Status | What changed | Source | Checked |
|---|---|---|---|---|
| Manipur: current official advice for visitors | Could not confirm | No MHA or Manipur government advisory for tourists found. Data already tells readers to check MHA, state orders and their own government | none | 2026-11-09 |
| Manipur: commissioner said Imphal valley "largely returned to normal" | Corrected | Removed from the Loktak guide and FAQ because I could not read the article (Access Denied) and the claim was not in the search text. Now says he was reported as saying unrest deters tourists and restricts inter-district travel | none | 2026-11-09 |
| Bastar: armed Maoist activity ended in 2026 | Could not confirm | Only news reports found; no PIB or MHA release. Reworded to "news reports quote the central government" and "we could not find an official release". District police and Chhattisgarh Tourism named | none official | 2026-11-09 |
| Jammu and Kashmir: security conditions | Could not confirm | Data gives only generic advice to check advisories; no factual claim to verify. Unchanged | none | 2026-11-09 |

## 3. Closures and seasons

| Item | Status | What changed | Source | Checked |
|---|---|---|---|---|
| Taj Mahal closed Fridays | Confirmed | Added source | https://www.tajmahal.gov.in/visiting-hours.aspx | 2026-11-09 |
| Ajanta closed Monday; Ellora closed Tuesday | Confirmed | Data said "usually"; now states the ASI listing | https://asi.nic.in/pages/WorldHeritageAjantaCaves and https://asi.nic.in/pages/WorldHeritageElloraCaves | 2026-11-09 |
| Elephanta Caves closed one weekday | Confirmed | ASI lists Monday; added to guide and FAQ | https://asi.nic.in/pages/WorldHeritageElephantaCaves | 2026-11-09 |
| Kanha and other MP tiger reserves: core zones closed 1 July to 30 September | Could not confirm | Only news and a park blog found; the forest department page did not load. Text already hedged and tells readers to confirm with the MP forest department | none official | 2026-11-09 |
| Panna core zones closed in monsoon | Could not confirm | Unchanged, already hedged | none | 2026-11-09 |
| Kaziranga open about November to April | Could not confirm | Unchanged, already says dates are set yearly | none | 2026-11-09 |
| Eravikulam closed for calving (late winter) | Could not confirm | News reports give 1 February to 31 March in recent years, not an official page. Text already says "several weeks, usually late winter" and names the Kerala forest department | none official | 2026-11-09 |
| Valley of Flowers open about June to October | Could not confirm | News reports for 2026 say 1 June to 31 October. No forest department page read. Text already hedged | none official | 2026-11-09 |
| Rohtang Pass vehicle permit; Atal Tunnel route not needing it | Could not confirm | Only travel blogs found. Softened to "have needed" and "has not used", with Kullu administration named | none official | 2026-11-09 |
| Kunzum La, Spiti and Manali-Leh road seasons | Could not confirm | Already general ("about June to October"); unchanged | none | 2026-11-09 |
| Kedarnath and Char Dham season "May to November" | Corrected | Replaced with wording that temple committees announce opening and closing dates each year | none needed (removed a specific claim) | 2026-11-09 |

## 4. Renames, transport and temple entry

| Item | Status | What changed | Source | Checked |
|---|---|---|---|---|
| Port Blair renamed Sri Vijaya Puram (2024) | Confirmed | PIB release of 13 September 2024 says the Government decided to rename it. Gazette notification not read. Replaced the Deccan Herald source with PIB | https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2054647&reg=48&lang=2 | 2026-11-09 |
| Chhatrapati Sambhajinagar (city and district) | Confirmed | The Government of Maharashtra district site uses the name | https://chhatrapatisambhajinagar.maharashtra.gov.in/en/history/ | 2026-11-09 |
| Railway station and airport "names have followed" | Could not confirm | Removed the claim; now says railway, airline and map listings may use either name | none | 2026-11-09 |
| Sohra (formerly Cherrapunji) restored in official use | Could not confirm | No notification found. Meghalaya Tourism's site uses "Sohra". Wording changed to "Meghalaya government sources use the original name" | https://www.meghalayatourism.in | 2026-11-09 |
| Navi Mumbai airport "entering service in stages" | Corrected | PIB confirms inauguration on 8 October 2025. Start of commercial flights is reported only by news outlets, so the text now says it was inaugurated in October 2025 and airlines are moving flights in stages | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2176402&reg=48&lang=2 | 2026-11-09 |
| Katra-Srinagar Vande Bharat | Corrected | Data said direct services from Katra and Jammu began in 2025. PIB (29 April 2026) says the Srinagar-Katra train was extended to Jammu Tawi from 30 April 2026. Katra service itself is confirmed; its 2025 start date I did not read on a page | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2256632&reg=3&lang=1 | 2026-11-09 |
| Bairabi-Sairang rail line to Mizoram, September 2025 | Confirmed | PIB release of 12 September 2025 announces the inauguration of the line and a Sairang to New Delhi Rajdhani for the next day; Mizoram Tourism lists Bairabi Sairang rail station as an entry point. The inauguration itself I read only as an announcement | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2166132&reg=3&lang=2 and https://mizoramtourism.com/about/4 | 2026-11-09 |
| Jagannath Temple, Puri: Hindus only | Could not confirm | The temple site did not state it in text I could read. Data is unchanged and tells readers to confirm | https://www.shreejagannatha.in | 2026-11-09 |
| Lingaraj Temple | Could not confirm | Data only mentions the temple by name; no entry rule is asserted | none | 2026-11-09 |
| Meenakshi Temple, Madurai: non-Hindu entry | Could not confirm | News reports describe Madras High Court directions (2024, and a further order reported in October 2026) restricting non-Hindus beyond the flagstaff. No judgment or HR&CE page read. Data stays hedged ("subject of court orders") | none official | 2026-11-09 |

## 5. Emergency and helpline numbers

| Item | Status | What changed | Source | Checked |
|---|---|---|---|---|
| Emergency number 112 | Confirmed | Added to the first-trip guide (it was not in the data) | https://www.mha.gov.in/nirbhayaerss-section | 2026-11-09 |
| Ministry of Tourism 24x7 helpline 1800-11-1363 or 1363, multilingual | Confirmed | Added to the same guide | https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1882744 (also PRID 2240649) | 2026-11-09 |

## 6. UNESCO World Heritage List

| Item | Status | What changed | Source | Checked |
|---|---|---|---|---|
| India total of 45 properties | Confirmed | UNESCO's list (XML) has 45 entries for India, counting the transnational Le Corbusier property once. PIB calls Sarnath the 45th and gives 37 cultural, 7 natural, 1 mixed | https://whc.unesco.org/en/list/xml and https://www.pib.gov.in/PressReleasePage.aspx?PRID=2289399 | 2026-11-09 |
| Sarnath: "Ancient Buddhist Site of Sarnath", id 927, inscribed 2026, cultural | Confirmed | UNESCO page title and list entry read; PIB says inscribed 25 July 2026 at the 48th session in Busan | https://whc.unesco.org/en/list/927/ | 2026-11-09 |
| All other 44 entries: unescoId, yearInscribed, kind | Confirmed | Every id, year and category in heritage.ts was compared with the UNESCO list. No differences. Only the header comment was updated | https://whc.unesco.org/en/list/xml | 2026-11-09 |

## 7. Festival dates for 2027

Source for most rows: Government of India DoPT Office Memorandum F. No. 12/2/2023-JCA dated 16 July 2026, read from https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20list%202027Cj0HU.PDF (the listing is at https://doptcirculars.nic.in/Default.aspx?URL=dFaVfDsok83H). The memorandum is for central government offices, so it gives the day of observance. Rows marked "no isoStart" are multi-day festivals where the listed day is not the first day.

| Festival | Status | Date entered | isoStart | Checked |
|---|---|---|---|---|
| Diwali | Confirmed | 29 October 2027 (memorandum para 6 and Annexure I) | 2027-10-29 | 2026-11-09 |
| Holi | Confirmed | 23 March 2027 (Holika Dahan restricted holiday 22 March) | 2027-03-23 | 2026-11-09 |
| Durga Puja | Confirmed | Saptami 6, Ashtami 7, Navami 8 October; Dussehra 9 October 2027 | none | 2026-11-09 |
| Onam | Confirmed | Thiru Onam day 12 September 2027 | none | 2026-11-09 |
| Pongal | Confirmed | 15 January 2027 | none | 2026-11-09 |
| Makar Sankranti | Confirmed | 14 January 2027 | 2027-01-14 | 2026-11-09 |
| Navratri | Confirmed | Vijayadashami 9 October 2027; spring Navratri begins 7 April 2027. Start of autumn Navratri is not in the memorandum | none | 2026-11-09 |
| Ganesh Chaturthi | Confirmed | 4 September 2027 | 2027-09-04 | 2026-11-09 |
| Eid al-Fitr | Confirmed | 10 March 2027, subject to moon sighting as the memorandum states | none | 2026-11-09 |
| Christmas | Confirmed | 25 December 2027 | 2027-12-25 | 2026-11-09 |
| Bihu | Confirmed | Magha Bihu 14 January and Bohag Bihu 15 April 2027. Kati Bihu is not listed | none | 2026-11-09 |
| Rath Yatra | Confirmed | 5 July 2027 | 2027-07-05 | 2026-11-09 |
| Baisakhi | Confirmed | 14 April 2027 | 2027-04-14 | 2026-11-09 |
| Chhath Puja | Confirmed | 4 November 2027 (Surya Shashthi) | none | 2026-11-09 |
| Mysuru Dasara | Confirmed (final day only) | Vijayadashami 9 October 2027. The Karnataka programme is not published | none | 2026-11-09 |
| Kumbh Mela (Nashik-Trimbakeshwar) | Confirmed | Amrut Snan 2 August, 31 August, 11 September (Nashik) and 12 September (Trimbakeshwar) 2027; Mela 31 October 2026 to 24 July 2028. The site labels both September dates "Third" | none | 2026-11-09 |
| Hornbill, Pushkar, Hemis, Losar, Goa Carnival, Thrissur Pooram, Losoong, Wangala | Could not confirm | `confirmedDates` left empty. No 2027 date published by the state or organiser that I could read | none | 2026-11-09 |

Kumbh source: https://simhasthamahakumbh.maharashtra.gov.in/ (Government of Maharashtra).

## 8. Official links

Added `tourismUrl` to states, each loaded on 2026-11-09 and identifies itself as a government site or government undertaking: Andhra Pradesh (tourism.ap.gov.in), Arunachal Pradesh (arunachaltourism.com), Assam (assamtourism.gov.in), Goa (goa-tourism.com, the Goa Tourism Development Corporation, "A Government of Goa Undertaking"), Haryana, Himachal Pradesh, Manipur, Meghalaya (meghalayatourism.in; the page gives a Shillong government address but does not say "Government of Meghalaya" in text I could find), Mizoram (mizoramtourism.com, run by the Mizoram State e-Governance Society), Punjab, Rajasthan, Sikkim, Telangana, Tripura, Uttar Pradesh, Uttarakhand, Andaman and Nicobar, Chandigarh, Delhi, Jammu and Kashmir (jktourism.org, Department of Tourism J&K), Lakshadweep (lakshadweeptourism.com, SPORTS Lakshadweep).

Added `officialLinks` for: Hyderabad, Araku Valley, Gandikota, Andaman, Shillong and Sohra, Varanasi, Srinagar, Leh, Spiti, Manali, Kurukshetra, Tawang, Ziro, Gangtok, Kohima (Nagaland ILP portal), Aizawl, Loktak, Unakoti, Goa, Diu (Diu district portal of the UT administration). Ajanta and Ellora gained the two ASI pages.

Still empty because no official site loaded: states Jharkhand, Chhattisgarh, Nagaland, Puducherry, Dadra and Nagar Haveli and Daman and Diu, Ladakh (ladakh.gov.in is the UT administration, not a tourism site); destinations Puducherry, Netarhat, Bastar.

## For a human to review before publishing

1. Nagaland and Manipur foreign PAP: find the MHA order of December 2024 and any later change.
2. Closure dates (Kanha, Panna, Kaziranga, Eravikulam, Valley of Flowers, Rohtang): none was confirmed on an official forest or district page.
3. Temple entry rules (Jagannath, Lingaraj, Meenakshi): no official page was read.
4. Katra-Srinagar start date (2025) and the Navi Mumbai commercial start date rest on news, not on a page read.
5. The Sohra rename and the Sambhajinagar railway and airport names.
6. The Meghalaya, Goa and Mizoram tourism sites are government-run but not always labelled as such on the page.
7. Whether the DoPT central holiday list is a good proxy for each festival's main day, especially Eid (moon sighting) and the multi-day festivals.
8. Not checked: UNESCO intangible heritage claims in festivals.ts (Durga Puja 2021, Kumbh 2017), and claims outside the scope above, such as the Amaravati capital note in states.ts.
