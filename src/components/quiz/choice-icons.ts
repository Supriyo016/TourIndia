import {
  Armchair,
  Baby,
  CalendarDays,
  CalendarRange,
  CloudRain,
  CloudSun,
  Coffee,
  Coins,
  Drama,
  Feather,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Heart,
  Landmark,
  Leaf,
  Mountain,
  PawPrint,
  Plane,
  Sailboat,
  Shuffle,
  Snowflake,
  Star,
  Sun,
  Sunrise,
  Tent,
  User,
  UtensilsCrossed,
  Wallet,
  Waves,
  Wheat,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { QuestionId } from "@/features/quiz/questions";

const monthIcons: Record<string, LucideIcon> = {
  "12": Snowflake,
  "1": Snowflake,
  "2": Snowflake,
  "3": Flower2,
  "4": Flower2,
  "5": Sun,
  "6": Sun,
  "7": CloudRain,
  "8": CloudRain,
  "9": CloudRain,
  "10": Leaf,
  "11": Leaf,
  any: Shuffle,
};

const icons: Record<Exclude<QuestionId, "month">, Record<string, LucideIcon>> = {
  length: { "3": Sunrise, "7": CalendarRange, "14": Plane },
  budget: { shoestring: Wallet, mid: Coins, comfort: Gem },
  styles: {
    mountains: Mountain,
    beaches: Waves,
    heritage: Landmark,
    wildlife: PawPrint,
    food: UtensilsCrossed,
    spiritual: Flame,
    adventure: Tent,
    lakes: Sailboat,
    culture: Drama,
    villages: Wheat,
  },
  pace: { relaxed: Coffee, balanced: Footprints, active: Zap },
  group: { solo: User, couple: Heart, family: Baby, seniors: Armchair },
  climate: { cool: Snowflake, warm: Sun, any: CloudSun },
  crowd: { popular: Star, mixed: Shuffle, quiet: Feather },
};

export function choiceIcon(question: QuestionId, value: string): LucideIcon {
  if (question === "month") return monthIcons[value] ?? CalendarDays;
  return icons[question][value] ?? CalendarDays;
}
