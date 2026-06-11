# Guía de uso — Datos Mock

Esto está pensado para que no tengas que pensar. Copiá, pegá, y sale andando.

---

## ¿Qué hay en cada archivo?

| Archivo | ¿Qué trae? |
|---------|-------------|
| `types/api.ts` | Tipos de TypeScript para todo (User, VacancyResponse, Mood, etc.) |
| `mocks/users.ts` | 12 usuarios falsos con datos 100% realistas |
| `mocks/orientar.ts` | Respuestas falsas del endpoint `/orientar` |
| `mocks/salud.ts` | Respuestas falsas del endpoint `/salud` |
| `mocks/index.ts` | Re-exporta todo junto para importar en una sola línea |

---

## Primer paso — Importar

### Opción 1: Importar todo junto (recomendado)

```ts
import { mockUsers, mockOrientarResponses, mockSaludResponses } from "../mocks"
```

### Opción 2: Importar solo lo que necesitás

```ts
import { mockUsers } from "../mocks/users"
import { getOrientarByUserId } from "../mocks/orientar"
```

---

## Ejemplo 1 — Mostrar lista de usuarios

Copiá esto en `App.tsx` y vas a ver los 12 usuarios en pantalla:

```tsx
import { mockUsers } from "./mocks"
import type { User } from "./mocks"

function UserCard({ user }: { user: User }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 12, margin: 8, borderRadius: 8 }}>
      <h3>{user.full_name}</h3>
      <p>📧 {user.email}</p>
      <p>📍 {user.city}, {user.country}</p>
      <p>💼 {user.tech_area} — {user.professional_level}</p>
      <p>🎯 {user.career_objective}</p>
    </div>
  )
}

export default function App() {
  return (
    <div>
      <h1>Usuarios de App BiT</h1>
      {mockUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

---

## Ejemplo 2 — Simular `/orientar` para un usuario

Cuando un usuario haga clic en "Ver mis vacantes", mostrás su gap y trayectoria:

```tsx
import { useState } from "react"
import { mockUsers, getOrientarByUserId } from "./mocks"

export default function VacanciesPage() {
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0].id)
  const orientar = getOrientarByUserId(selectedUserId)

  return (
    <div>
      {/* Selector de usuario */}
      <select
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
      >
        {mockUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.full_name}
          </option>
        ))}
      </select>

      {/* Resultado del endpoint /orientar */}
      {orientar && (
        <div>
          <h2>Resultado</h2>
          <p>
            Cumplís con el <strong>{orientar.gap_porcentual}%</strong> de los requisitos.
          </p>

          <h3>Lo que te falta</h3>
          <ul>
            {orientar.gap_items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3>Trayectoria sugerida</h3>
          <ol>
            {orientar.trayectoria_sugerida.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <h3>Vacantes compatibles</h3>
          {orientar.vacantes_compatibles.map((v) => (
            <div key={v.id}>
              <strong>{v.title}</strong> — {v.company}
              <br />
              Match: {v.match_percentage}%
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Ejemplo 3 — Simular `/salud` (check-in emocional)

El flujo del check-in diario. Primero el usuario elige un emoji, después ve la respuesta:

```tsx
import { useState } from "react"
import { mockUsers, getSaludByUserId, Mood } from "./mocks"

const EMOJIS: Record<string, string> = {
  [Mood.HAPPY]: "😊",
  [Mood.TIRED]: "😴",
  [Mood.SAD]: "😢",
  [Mood.ANXIOUS]: "😰",
  [Mood.OVERWHELMED]: "😵",
}

export default function CheckinPage() {
  const [userId] = useState(mockUsers[0].id)
  const [selectedMood, setSelectedMood] = useState("")
  const [showResponse, setShowResponse] = useState(false)

  const historial = getSaludByUserId(userId)

  return (
    <div>
      <h2>¿Cómo estás hoy, {mockUsers[0].full_name.split(" ")[0]}?</h2>

      {/* Botones de emoji */}
      <div style={{ display: "flex", gap: 12 }}>
        {Object.entries(EMOJIS).map(([key, emoji]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedMood(key)
              setShowResponse(true)
            }}
            style={{
              fontSize: 32,
              padding: 12,
              border: selectedMood === key ? "3px solid blue" : "1px solid gray",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Respuesta de la IA */}
      {showResponse && historial.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
          <p>{historial[0].mensaje}</p>
          <p>
            <strong>Sugerencia:</strong> {historial[0].accion_sugerida}
          </p>
          {historial[0].derivar_cvv && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              ⚠️ Te derivamos al CVV. Llamá al 188.
            </p>
          )}
        </div>
      )}

      {/* Historial de check-ins */}
      <h3>Tu historial</h3>
      {historial.map((entry, i) => (
        <div key={i} style={{ padding: 8, margin: 4, background: "#eee", borderRadius: 8 }}>
          <small>{new Date(entry.created_at).toLocaleDateString("es")}</small>
          <p>{entry.mensaje}</p>
          {entry.derivar_cvv && <span style={{ color: "red" }}>🔴 CVV</span>}
        </div>
      ))}
    </div>
  )
}
```

---

## Ejemplo 4 — Onboarding completo (todas las pantallas juntas)

Un mini-flujo de 3 pasos: perfil → orientación → check-in.

```tsx
import { useState } from "react"
import {
  mockUsers,
  getOrientarByUserId,
  getSaludByUserId,
} from "./mocks"

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [userId] = useState(mockUsers[0].id)
  const user = mockUsers[0]
  const orientar = getOrientarByUserId(userId)
  const salud = getSaludByUserId(userId)

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Paso 1: Tu perfil</h2>
          <p><strong>Nombre:</strong> {user.full_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Ubicación:</strong> {user.city}, {user.country}</p>
          <p><strong>Nivel:</strong> {user.professional_level}</p>
          <p><strong>Área:</strong> {user.tech_area}</p>
          <p><strong>Objetivo:</strong> {user.career_objective}</p>
          <button onClick={() => setStep(2)}>Siguiente →</button>
        </div>
      )}

      {step === 2 && orientar && (
        <div>
          <h2>Paso 2: Tus oportunidades</h2>
          <p>Cumplís con el <strong>{orientar.gap_porcentual}%</strong> de los requisitos.</p>
          <h4>Te falta:</h4>
          <ul>{orientar.gap_items.map((g, i) => <li key={i}>{g}</li>)}</ul>
          <h4>Vacantes:</h4>
          {orientar.vacantes_compatibles.map((v) => (
            <p key={v.id}>{v.title} en {v.company} — {v.match_percentage}%</p>
          ))}
          <button onClick={() => setStep(3)}>Siguiente →</button>
        </div>
      )}

      {step === 3 && salud.length > 0 && (
        <div>
          <h2>Paso 3: Check-in emocional</h2>
          <p>{salud[0].mensaje}</p>
          <p><strong>Sugerencia:</strong> {salud[0].accion_sugerida}</p>
          <p>Nota: {salud[0].nota_actual}/10</p>
          {salud[0].derivar_cvv && (
            <p style={{ color: "red" }}>⚠️ Derivación al CVV: 188</p>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## Preguntas frecuentes

### ¿Cómo cambio el usuario?

Cambiá `mockUsers[0]` por `mockUsers[1]`, `mockUsers[2]`, etc. Hay 12 disponibles.

### ¿Puedo filtrar usuarios por país?

```ts
const brasileros = mockUsers.filter((u) => u.country === "Brasil")
```

### ¿Puedo filtrar por nivel?

```ts
const juniors = mockUsers.filter(
  (u) => u.professional_level === "junior"
)
```

### ¿Cómo sé qué datos tiene cada cosa?

Abrí `types/api.ts` — ahí están todas las interfaces y sus campos. Es cortito.

### ¿Los datos de salud cambian por usuario?

Sí. `getSaludByUserId(id)` devuelve 3 registros distintos según el usuario. Probá con diferentes IDs.

### ¿Hay datos de crisis (derivación CVV)?

Sí. Los registros 13, 14 y 15 tienen `derivar_cvv: true` y `alerta: true`. Probá `getSaludByUserId(mockUsers[0].id)` y vas a ver que el tercer registro es de crisis.

---

## Tipos útiles para tus componentes

```ts
import type {
  User,
  VacancyResponse,
  OrientarResponse,
  SaludResponse,
  SaludRequest,
  UserCreateRequest,
} from "../mocks"
import {
  ProfessionalLevel,
  CareerObjective,
  Mood,
} from "../mocks"
```
