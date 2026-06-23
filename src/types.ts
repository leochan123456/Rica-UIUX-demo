export interface CustomerProfile {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  suggestedEstates: string[];
  suggestedPrices: string[];
  defaultExtraDemands: string;
}

export interface SelectionState {
  profileId: string;
  estate: string;
  budget: string;
  extraDemands: string;
  tone: "WhatsApp" | "小紅書" | "Facebook";
  sizeSqFt: number;
  buildingAge: number;
}

export interface SavedCopy {
  id: string;
  estate: string;
  profileId: string;
  tone: string;
  text: string;
  timestamp: string;
}
