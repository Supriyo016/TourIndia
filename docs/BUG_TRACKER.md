# Bug tracker

## Fixed during the rebuild

| # | Severity | Bug | Root cause | Regression test |
|---|---|---|---|---|
| 1 | High | Crafted share link could freeze or crash the planner, or show arbitrary text | Link content trusted | Unit: `decodeShared` abuse cases |
| 2 | High | Share links failed on longer trips | Full itinerary text in the URL | Unit: encoded size limit |
| 3 | High | One attraction over 7 hours stopped scheduling for that stop | Loop halted on an item that could never fit | Unit: very long outing |
| 4 | Medium | Rate limit could be bypassed with forged headers off Vercel | Client headers trusted | API: client address tests |
| 5 | Medium | Oversized bodies buffered fully before the size check | `request.text()` read everything first | API: declared size |
| 6 | Medium | Calendar property injection | `day.id` written unescaped | Unit: calendar injection |
| 7 | Medium | Corrupt browser storage crashed pages until cleared | Stored shape never checked | Unit: storage; browser: corrupted data |
| 8 | Medium | Reopening a saved trip sent it to the server, contradicting the privacy page | Trip in the query string | Browser: saved trip request check |
| 9 | Medium | "Unsubscribe at any time" had no implementation | Promise without a feature | Copy changed to the real process |
| 10 | Medium | Itineraries came up short; no travel days; costs ignored the trip home; trains routed to places without railways | Long legs subtracted, never added | Unit: travel day, no-rail |
| 11 | Low | Renaming people produced a wrong "everyone is even" | Orphaned payers ignored | Warning added |
| 12 | Low | IP salt fell back to a public value | Silent default | Production check added |
| 13 | Low | Mobile menu stayed open after navigation; page stayed locked after resize; search had no focus trap | No route-change handling; plain div as dialog | Browser: menu test |
| 14 | Low | Region filters ignored new links on the same page | URL read once into state | Browser: region test |
| 15 | Low | "Each guide" claims weren't true for every page type | Wording | State sources now shown; copy narrowed |
| 16 | Medium | Horizontal overflow at phone widths on `/credits` | Hidden text escaped a scrolling table | Browser: overflow at 10 widths |
| 17 | Serious (a11y) | Invalid definition list on guide pages | Nested markup | Browser: axe |
| 18 | Serious (a11y) | Low contrast on locked badges | Opacity on text | Browser: axe |
| 19 | Medium | Header overflowed at 320px | Four icon buttons plus the logo | Browser: overflow |
| 20 | Medium | Map and guide lists missing or hidden in delivered HTML | Empty Suspense fallback, and a root `loading.tsx` that streamed page content hidden | Browser: no-JavaScript test |
| 21 | Medium | Mobile home page about 19,000px long | Every card shown at every width | Cards trimmed on phones |
| 22 | Medium | Unsuitable photos passed the licence filter (map of Asia, chart, protest, cannery) | Automated selection | Manual contact-sheet review; `null` overrides |

## Open

| # | Severity | Issue | Status |
|---|---|---|---|
| A | High before launch | Guide facts only partly verified | Needs human review; see `PROJECT_STATUS.md` |
| B | Medium | No confirmed 2027 festival dates | Official list could not be extracted |
| C | High | Forms can't save on the live site until a MongoDB Atlas database exists | Needs the owner's Atlas account |
| D | Low | Five subjects have no licensed photo and show a branded panel | Listed in `PROJECT_STATUS.md` |
| F | Low | Drag and drop reorders within a day; moving between days uses the day selector | By design for touch and keyboard use |
