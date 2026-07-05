export const SEMESTERS = [
  { id: 1, name: "Semester 1" },
  { id: 2, name: "Semester 2" },
  { id: 3, name: "Semester 3" },
  { id: 4, name: "Semester 4" },
  { id: 5, name: "Semester 5" },
  { id: 6, name: "Semester 6" },
];

export const SUBJECTS = [
  { id: "c-programming", name: "C Programming", icon: "code-slash", semester: 1 },
  { id: "html", name: "HTML", icon: "logo-html5", semester: 1 },
  { id: "css", name: "CSS", icon: "logo-css3", semester: 1 },
  { id: "javascript", name: "JavaScript", icon: "logo-javascript", semester: 2 },
  { id: "git-github", name: "GitHub/Git", icon: "git-branch", semester: 2 },
  { id: "python", name: "Python", icon: "logo-python", semester: 3 },
  { id: "sql", name: "SQL", icon: "server", semester: 3 },
  { id: "java", name: "Java", icon: "cafe", semester: 4 },
];

export const FREE_PLAYLISTS = [
  { id: "web-dev", name: "Web Development Course", icon: "globe", playlistId: "PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w", specialization: "web-dev" },
  { id: "gen-ai", name: "Gen AI Course", icon: "hardware-chip", playlistId: "PLu0W_9lII9aiS4rUVp2jXwIvCruo27sG6", specialization: "ai-ml" },
  { id: "html", name: "HTML Course", icon: "logo-html5", playlistId: "PLZPZq0r_RZOOxqHgOzPyCzIl4AJjXbCYt", specialization: "web-dev" },
  { id: "css", name: "CSS Course", icon: "logo-css3", playlistId: "PLZPZq0r_RZOONc3kkuRmBOlj67YAG6jqo", specialization: "web-dev" },
  { id: "html-css", name: "HTML + CSS Course", icon: "code-slash", playlistId: "PLZPZq0r_RZOPP5Yjt6IqgytMRY5uLt4y3", specialization: "web-dev" },
  { id: "js", name: "JS Course", icon: "logo-javascript", playlistId: "PLZPZq0r_RZOO1zkgO4bIdfuLpizCeHYKv", specialization: "web-dev" },
  { id: "python", name: "Python Course", icon: "logo-python", playlistId: "PLZPZq0r_RZOOkUQbat8LyQii36cJf2SWT", specialization: "ai-ml" },
  { id: "c-programming", name: "C Course", icon: "code", playlistId: "PLZPZq0r_RZOOzY_vR4zJM32SqsSInGMwe", specialization: "cybersecurity" },
];

export const SPECIALIZATIONS = [
  { id: "data-science", name: "Data Science", description: "Data Science & Analytics", icon: "bar-chart" },
  { id: "cloud", name: "Cloud Computing", description: "Cloud Architecture & DevOps", icon: "cloud" },
  { id: "ai-ml", name: "AI & ML", description: "Artificial Intelligence & Machine Learning", icon: "hardware-chip" },
  { id: "cybersecurity", name: "Cybersecurity", description: "Network Security & Ethical Hacking", icon: "shield-checkmark" },
  { id: "web-dev", name: "Web Development", description: "Full Stack Web Development", icon: "globe" },
  { id: "app-dev", name: "App Development", description: "Mobile App Development", icon: "phone-portrait" },
  { id: "networking", name: "Networking", description: "Computer Networks & protocols", icon: "git-network" },
];

export const NOTES_PRICE = 19;
export const PYQ_PRICE = 29;
export const PDF_PRICE = 19;
export const MEMBERSHIP_PRICE = 199;

export const COLORS = {
  primary: "#674bb5",
  onPrimary: "#ffffff",
  primaryContainer: "#a78bfa",
  onPrimaryContainer: "#3c1989",
  primaryFixed: "#e8ddff",
  primaryFixedDim: "#cebdff",
  secondary: "#5d5d67",
  onSecondary: "#ffffff",
  secondaryContainer: "#e3e1ed",
  onSecondaryContainer: "#64636d",
  tertiary: "#732ee4",
  onTertiary: "#ffffff",
  tertiaryContainer: "#ae87ff",
  onTertiaryContainer: "#430097",
  tertiaryFixed: "#eaddff",
  background: "#f9f9ff",
  onBackground: "#111c2d",
  surface: "#f9f9ff",
  surfaceDim: "#cfdaf2",
  surfaceBright: "#f9f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f0f3ff",
  surfaceContainer: "#e7eeff",
  surfaceContainerHigh: "#dee8ff",
  surfaceContainerHighest: "#d8e3fb",
  onSurface: "#111c2d",
  onSurfaceVariant: "#494552",
  outline: "#7a7583",
  outlineVariant: "#cac4d4",
  inverseSurface: "#263143",
  inverseOnSurface: "#ecf1ff",
  inversePrimary: "#cebdff",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  surfaceTint: "#674bb5",
  onPrimaryFixed: "#21005e",
  onPrimaryFixedVariant: "#4f319c",
  onSecondaryFixed: "#1a1b23",
  onSecondaryFixedVariant: "#46464f",
  onTertiaryFixed: "#25005a",
  onTertiaryFixedVariant: "#5a00c6",
  secondaryFixed: "#e3e1ed",
  secondaryFixedDim: "#c7c5d1",
  tertiaryFixedDim: "#d2bbff",
  backgroundOld: "#F5F7FA",
  textOld: "#1A1A2E",
  premium: "#FFD700",
  border: "#cac4d4",
  accent: "#732ee4",
  text: "#111c2d",
  textSecondary: "#494552",
  textLight: "#7a7583",
  locked: "#cac4d4",
};

export const FONTS = {
  display: 32,
  displayMobile: 28,
  headlineLg: 24,
  headlineMd: 20,
  bodyLg: 16,
  bodyMd: 14,
  labelLg: 14,
  labelSm: 12,
  heading: 24,
  large: 18,
  regular: 16,
  small: 14,
  tiny: 12,
  title: 28,
};

export const FONT_WEIGHTS = {
  display: "700" as const,
  headlineLg: "600" as const,
  headlineMd: "600" as const,
  bodyLg: "400" as const,
  bodyMd: "400" as const,
  labelLg: "600" as const,
  labelSm: "500" as const,
};

export const SPACING = {
  containerMargin: 20,
  sectionGap: 32,
  stackGap: 16,
  inlinePillGap: 8,
  gridGutter: 12,
};

export const BORDER_RADIUS = {
  sm: 8,
  DEFAULT: 16,
  md: 24,
  lg: 32,
  xl: 48,
  full: 9999,
};

export const CONTENT_TYPE_LABELS = {
  notes: "Notes",
  pyq: "PYQ",
  video: "Free Video",
};

export const CURRENCY_SYMBOL = "₹";
