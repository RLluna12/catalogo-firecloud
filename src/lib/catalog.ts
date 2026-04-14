export interface CatalogCategory {
  id: string;
  sectionId: string;
  title: string;
  emoji: string;
  jsonPath: string;
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  {
    id: "paraArmazenar",
    sectionId: "armazenar",
    title: "Para Armazenar",
    emoji: "🎒",
    jsonPath: "/json/paraArmazenar.json",
  },
  {
    id: "cuias",
    sectionId: "cuias",
    title: "Cuias",
    emoji: "🥣",
    jsonPath: "/json/cuias.json",
  },
  {
    id: "sedas",
    sectionId: "sedas",
    title: "Sedas",
    emoji: "📜",
    jsonPath: "/json/sedas.json",
  },
  {
    id: "piteiras",
    sectionId: "piteiras",
    title: "Piteiras",
    emoji: "🔹",
    jsonPath: "/json/piteiras.json",
  },
  {
    id: "tabaco",
    sectionId: "tabaco",
    title: "Tabaco",
    emoji: "🌿",
    jsonPath: "/json/tabaco.json",
  },
  {
    id: "tesouras",
    sectionId: "tesouras",
    title: "Tesouras",
    emoji: "✂️",
    jsonPath: "/json/tesouras.json",
  },
  {
    id: "isqueiros",
    sectionId: "isqueiros",
    title: "Isqueiros",
    emoji: "🔥",
    jsonPath: "/json/isqueiros.json",
  },
  {
    id: "cinzeiros",
    sectionId: "cinzeiros",
    title: "Cinzeiros",
    emoji: "🗑️",
    jsonPath: "/json/cinzeiros.json",
  },
  {
    id: "bandejas",
    sectionId: "bandejas",
    title: "Bandejas",
    emoji: "📥",
    jsonPath: "/json/bandejas.json",
  },
  {
    id: "slicks",
    sectionId: "slicks",
    title: "Slicks",
    emoji: "📦",
    jsonPath: "/json/slicks.json",
  },
];

export const getCategoryLabel = (category: CatalogCategory) =>
  `${category.emoji} ${category.title}`;