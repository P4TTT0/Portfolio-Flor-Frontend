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

export interface SampleData {
  title: string;
  category: string;
  audioUrl: string;
  duration?: number;
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

export const SAMPLES_DATA: SampleData[] = [
  {
    title: "Voz Institucional",
    category: "Institucional",
    audioUrl: "/samples/voz-institucional.mp3",
    duration: 45,
  },
  {
    title: "Presentación Corporativa",
    category: "Institucional",
    audioUrl: "/samples/presentacion-corporativa.mp3",
    duration: 60,
  },
  {
    title: "Spot Publicitario",
    category: "Comercial",
    audioUrl: "/samples/spot-publicitario.mp3",
    duration: 30,
  },
  {
    title: "Cuña Radial",
    category: "Comercial",
    audioUrl: "/samples/cuna-radial.mp3",
    duration: 20,
  },
  {
    title: "Relato Documental",
    category: "Narración",
    audioUrl: "/samples/relato-documental.mp3",
    duration: 90,
  },
  {
    title: "Cuento Infantil",
    category: "Narración",
    audioUrl: "/samples/cuento-infantil.mp3",
    duration: 75,
  },
  {
    title: "Conducción de Eventos",
    category: "Eventos",
    audioUrl: "/samples/conduccion-eventos.mp3",
    duration: 55,
  },
  {
    title: "Ceremonia Protocolar",
    category: "Eventos",
    audioUrl: "/samples/ceremonia-protocolar.mp3",
    duration: 40,
  },
  {
    title: "Mensaje de Bienvenida",
    category: "Institucional",
    audioUrl: "/samples/mensaje-bienvenida.mp3",
    duration: 25,
  },
  {
    title: "Jingle Publicitario",
    category: "Comercial",
    audioUrl: "/samples/jingle-publicitario.mp3",
    duration: 15,
  },
];

export default landingData;
