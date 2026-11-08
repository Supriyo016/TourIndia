import type { Circuit } from "@/types/content";

/** Editorial route suggestions. Each can be opened directly in the trip planner. */
export const circuits: Circuit[] = [
  {
    slug: "golden-triangle-plus",
    name: "Delhi, Agra and Jaipur",
    summary: "The classic first trip, with short rail or road links and plenty of architecture for the time spent.",
    days: 7,
    destinationSlugs: ["delhi", "agra", "jaipur"],
    bestMonths: [10, 11, 12, 1, 2, 3],
    theme: "Mughal and Rajput history",
  },
  {
    slug: "kerala-hills-and-backwaters",
    name: "Kerala hills and backwaters",
    summary: "Tea country around Munnar, then a slower few days on the canals of Alappuzha.",
    days: 6,
    destinationSlugs: ["munnar", "alappuzha"],
    bestMonths: [9, 10, 11, 12, 1, 2, 3],
    theme: "Landscape and food",
  },
  {
    slug: "rajasthan-desert-line",
    name: "Rajasthan: lakes to dunes",
    summary: "From Udaipur's lakes to Jaisalmer's living fort, with Jaipur as the gateway.",
    days: 10,
    destinationSlugs: ["jaipur", "udaipur", "jaisalmer"],
    bestMonths: [10, 11, 12, 1, 2, 3],
    theme: "Forts and desert",
  },
  {
    slug: "buddhist-trail",
    name: "Ganga and the Buddhist trail",
    summary: "Varanasi's ghats paired with Bodh Gaya, where the Buddha is said to have attained enlightenment.",
    days: 6,
    destinationSlugs: ["varanasi", "bodh-gaya"],
    bestMonths: [10, 11, 12, 1, 2, 3],
    theme: "Pilgrimage",
  },
  {
    slug: "deccan-stone",
    name: "Deccan in stone",
    summary: "Rock-cut caves at Ajanta and Ellora, then the ruined capital at Hampi.",
    days: 8,
    destinationSlugs: ["ajanta-ellora", "hampi", "mysuru"],
    bestMonths: [10, 11, 12, 1, 2],
    theme: "Archaeology",
  },
  {
    slug: "northeast-rivers-and-root-bridges",
    name: "Assam and Meghalaya",
    summary: "Rhinos at Kaziranga, the river island of Majuli and the wet plateau of Meghalaya.",
    days: 9,
    destinationSlugs: ["kaziranga", "majuli", "shillong-sohra"],
    bestMonths: [11, 12, 1, 2, 3, 4],
    theme: "Nature and living culture",
  },
];
