export interface FolderData {
  id: string;
  label: string;
  content: string;
  tabColor: string;
  folderColor: string;
  rotation: number;
}

export interface LandingData {
  name: string;
  role: string;
  folders: FolderData[];
}

export const landingData: LandingData = {
  name: "Florencia Acevedo",
  role: "Locutora Nacional",
  folders: [
    {
      id: "bio",
      label: "Bio",
      content:
        "Florencia Acevedo es una locutora profesional con formación en el ISER. Su voz ha acompañado campañas publicitarias, documentales, y eventos en vivo. Apasionada por la comunicación, combina técnica vocal con sensibilidad artística para dar vida a cada proyecto.",
      tabColor: "sage",
      folderColor: "sage",
      rotation: 0,
    },
    {
      id: "demos",
      label: "Demos",
      content: "",
      tabColor: "avocado",
      folderColor: "avocado",
      rotation: 0,
    },
    {
      id: "samples",
      label: "Samples",
      content: "",
      tabColor: "blush",
      folderColor: "blush",
      rotation: 0,
    },
    {
      id: "works",
      label: "Works",
      content: "",
      tabColor: "peach",
      folderColor: "peach",
      rotation: 0,
    },
    {
      id: "social",
      label: "Social",
      content: "",
      tabColor: "oat",
      folderColor: "oat",
      rotation: 0,
    },
  ],
};

export default landingData;
