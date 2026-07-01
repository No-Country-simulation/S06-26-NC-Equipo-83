// Situación actual (3 opciones)
export const CURRENT_SITUATION_OPTIONS = [
  { value: "student", label: "Estudiante" },
  { value: "unemployed", label: "Desempleado" },
  { value: "employed", label: "Actualmente trabajando" },
] as const;

// Sectores laborales (14 opciones — para CreatableSelect)
export const WORK_SECTORS = [
  { value: "it", label: "Informática / IT" },
  { value: "education", label: "Educación" },
  { value: "health", label: "Salud" },
  { value: "finance", label: "Finanzas" },
  { value: "commerce", label: "Comercio" },
  { value: "industry", label: "Industria" },
  { value: "construction", label: "Construcción" },
  { value: "logistics", label: "Logística" },
  { value: "marketing", label: "Marketing" },
  { value: "hr", label: "Recursos Humanos" },
  { value: "administration", label: "Administración" },
  { value: "telecom", label: "Telecomunicaciones" },
  { value: "government", label: "Gobierno" },
  { value: "tourism", label: "Turismo y Hotelería" },
];

// Seniority (3 opciones)
export const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "semi_senior", label: "Semi Senior" },
  { value: "senior", label: "Senior" },
] as const;

// ¿Qué estás buscando? (4 opciones — single select)
export const CURRENT_SEARCH_OPTIONS = [
  { value: "study", label: "Estudiar" },
  { value: "define_path", label: "Definir mi camino profesional" },
  { value: "find_job", label: "Buscar empleo" },
  { value: "change_job", label: "Cambiar de empleo" },
] as const;

// Áreas de interés (15 opciones — multiselect + creatable)
export const INTEREST_AREAS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "ai_ml", label: "IA/Machine Learning" },
  { value: "data_science", label: "Ciencia de Datos" },
  { value: "devops", label: "DevOps" },
  { value: "cloud", label: "Cloud" },
  { value: "cybersecurity", label: "Ciberseguridad" },
  { value: "qa_testing", label: "QA/Testing" },
  { value: "ux_ui", label: "UX/UI" },
  { value: "product_management", label: "Product Management" },
  { value: "blockchain", label: "Blockchain" },
  { value: "iot", label: "IoT" },
  { value: "game_development", label: "Game Development" },
];

// Tecnologías predefinidas (~50 opciones — multiselect + creatable)
export const PREDEFINED_TECHNOLOGIES = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
  "Ruby", "PHP", "Kotlin", "Swift", "Dart", "Scala", "R", "SQL",
  "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt",
  "Django", "Flask", "FastAPI", "Spring Boot", ".NET",
  "Express", "NestJS", "Laravel", "Ruby on Rails",
  "Flutter", "React Native", "Electron",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
  "Firebase", "DynamoDB", "Elasticsearch",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "Terraform", "Ansible", "CI/CD", "Linux", "Git",
  "Figma", "Jira", "Notion", "GraphQL", "REST API",
  "Webpack", "Vite", "Tailwind CSS", "Sass",
];