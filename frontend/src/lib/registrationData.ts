// Situación actual (3 opciones)
export const CURRENT_SITUATION_OPTIONS = [
  { value: "student", label: "Estudiante", labelKey: "auth:data.currentSituation.student" },
  { value: "unemployed", label: "Desempleado", labelKey: "auth:data.currentSituation.unemployed" },
  { value: "employed", label: "Actualmente trabajando", labelKey: "auth:data.currentSituation.employed" },
] as const;

// Sectores laborales (14 opciones — para CreatableSelect)
export const WORK_SECTORS = [
  { value: "it", label: "Informática / IT", labelKey: "auth:data.workSectors.it" },
  { value: "education", label: "Educación", labelKey: "auth:data.workSectors.education" },
  { value: "health", label: "Salud", labelKey: "auth:data.workSectors.health" },
  { value: "finance", label: "Finanzas", labelKey: "auth:data.workSectors.finance" },
  { value: "commerce", label: "Comercio", labelKey: "auth:data.workSectors.commerce" },
  { value: "industry", label: "Industria", labelKey: "auth:data.workSectors.industry" },
  { value: "construction", label: "Construcción", labelKey: "auth:data.workSectors.construction" },
  { value: "logistics", label: "Logística", labelKey: "auth:data.workSectors.logistics" },
  { value: "marketing", label: "Marketing", labelKey: "auth:data.workSectors.marketing" },
  { value: "hr", label: "Recursos Humanos", labelKey: "auth:data.workSectors.hr" },
  { value: "administration", label: "Administración", labelKey: "auth:data.workSectors.administration" },
  { value: "telecom", label: "Telecomunicaciones", labelKey: "auth:data.workSectors.telecom" },
  { value: "government", label: "Gobierno", labelKey: "auth:data.workSectors.government" },
  { value: "tourism", label: "Turismo y Hotelería", labelKey: "auth:data.workSectors.tourism" },
];

// Seniority (3 opciones)
export const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior", labelKey: "auth:data.seniority.junior" },
  { value: "semi_senior", label: "Semi Senior", labelKey: "auth:data.seniority.semi_senior" },
  { value: "senior", label: "Senior", labelKey: "auth:data.seniority.senior" },
] as const;

// ¿Qué estás buscando? (4 opciones — single select)
export const CURRENT_SEARCH_OPTIONS = [
  { value: "study", label: "Estudiar", labelKey: "auth:data.currentSearch.study" },
  { value: "define_path", label: "Definir mi camino profesional", labelKey: "auth:data.currentSearch.define_path" },
  { value: "find_job", label: "Buscar empleo", labelKey: "auth:data.currentSearch.find_job" },
  { value: "change_job", label: "Cambiar de empleo", labelKey: "auth:data.currentSearch.change_job" },
] as const;

// Áreas de interés (15 opciones — multiselect + creatable)
export const INTEREST_AREAS = [
  { value: "frontend", label: "Frontend", labelKey: "auth:data.interestAreas.frontend" },
  { value: "backend", label: "Backend", labelKey: "auth:data.interestAreas.backend" },
  { value: "fullstack", label: "Full Stack", labelKey: "auth:data.interestAreas.fullstack" },
  { value: "mobile", label: "Mobile", labelKey: "auth:data.interestAreas.mobile" },
  { value: "ai_ml", label: "IA / ML", labelKey: "auth:data.interestAreas.ai_ml" },
  { value: "data_science", label: "Ciencia de datos", labelKey: "auth:data.interestAreas.data_science" },
  { value: "devops", label: "DevOps", labelKey: "auth:data.interestAreas.devops" },
  { value: "cloud", label: "Cloud", labelKey: "auth:data.interestAreas.cloud" },
  { value: "cybersecurity", label: "Ciberseguridad", labelKey: "auth:data.interestAreas.cybersecurity" },
  { value: "qa_testing", label: "QA / Testing", labelKey: "auth:data.interestAreas.qa_testing" },
  { value: "ux_ui", label: "UI / UX", labelKey: "auth:data.interestAreas.ux_ui" },
  { value: "product_management", label: "Product Mgmt", labelKey: "auth:data.interestAreas.product_management" },
  { value: "blockchain", label: "Blockchain", labelKey: "auth:data.interestAreas.blockchain" },
  { value: "iot", label: "IoT", labelKey: "auth:data.interestAreas.iot" },
  { value: "game_development", label: "Game Dev", labelKey: "auth:data.interestAreas.game_development" },
];

// Tecnologías predefinidas (~50 opciones — multiselect + creatable)
export const PREDEFINED_TECHNOLOGIES = [
  "frontend", "backend", "mobile", "fullstack",
  "react", "angular", "vue", "svelte", "nextjs",
  "javascript", "typescript",
  "node", "java", "python", "csharp", "kotlin", "swift",
  "rust", "php", "ruby", "go", "dart", "scala", "cpp", "r",
  "sql", "nosql", "database",
  "api", "rest", "graphql",
  "css", "uiux",
  "git", "linux", "docker", "kubernetes",
  "devops", "cloud", "cicd", "testing", "security",
  "ai", "data_science", "blockchain", "game_development",
  "product_management", "iot"
];
