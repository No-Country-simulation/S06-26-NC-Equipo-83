# Recomendación sobre n8n — App BiT

## ¿Qué es n8n?

n8n es una herramienta de **automatización de flujos de trabajo** (workflow automation), similar a Zapier pero open-source y self-hosted. Sirve para conectar APIs entre sí sin código.

---

## ¿Sirve para App BiT?

**No es recomendable** para este proyecto. Te explico por qué:

### ❌ En contra

| Problema | Detalle |
|----------|---------|
| **Capa extra innecesaria** | Se agrega un servicio más que instalar, configurar y mantener. El backend puede llamar a OpenAI directamente. |
| **Menos control** | La lógica de negocio (gap, derivación al CVV, matching) quedaría repartida entre el backend y n8n, difícil de debuggear. |
| **Debugging complejo** | Cuando algo falle, hay que revisar backend + n8n + OpenAI. Más puntos de fallo. |
| **Performance** | n8n agrega latencia. Cada llamada a IA pasaría por n8n antes de llegar a OpenAI. |
| **Curva de aprendizaje** | Todos en el equipo tendrían que aprender n8n además del stack que ya conocen. |
| **Overkill para MVP** | Para 2 endpoints y 1 integración de IA, n8n es un martillo para una nuez. |

### ✅ A favor (pocos)

| Punto | Detalle |
|-------|---------|
| **Bajo código** | Si hubiera alguien sin experiencia técnica, podría armar flujos visualmente. |
| **Monitoreo visual** | n8n muestra logs de cada ejecución. |

---

## Alternativas recomendadas

| Opción | Por qué para el equipo |
|--------|----------------------|
| **FastAPI + OpenAI SDK** | Backend en Python (lo que saben). Llamada directa a IA desde el endpoint. Simple, rápido, control total. |
| **LangChain** | Si quieren algo más estructurado para los prompts de orientación y salud mental. |
| **Azure OpenAI** | Si el equipo quiere algo enterprise-ready. |

---

## Conclusión

> **n8n no aporta valor** para App BiT. Todo lo que hace n8n (llamar a una API) lo puede hacer el backend directamente con menos líneas de código, menos complejidad y más control.

**Recomendación:** Usar **Python + FastAPI + OpenAI SDK** directo. Si el equipo quiere flexibilidad, **LangChain** como segunda opción.

---

*Documento preparado para la primera reunión del equipo.*
