"""Servicio de Experiencias Estructurantes — basado en dataset Vísent CDRView.

Carga los CSVs en memoria (sin DB) para geo-localizar al usuario, evaluar
cobertura de red, buscar destinos populares y segmentar por perfil demográfico.
"""

from __future__ import annotations

import csv
import math
import os
from typing import Any

from app.schemas.experiencias import (
    ExperienciasRequest,
    ExperienciasResponse,
    CoberturaInfo,
    EventoCercano,
    DestinoPopular,
    ContenidoOffline,
)

# ── Ruta base del dataset ──────────────────────────────────────────────────
DATASET_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data",
)


# ── Carga de CSVs (una vez, en memoria) ────────────────────────────────────
def _load_csv(filename: str) -> list[dict[str, Any]]:
    path = os.path.join(DATASET_DIR, filename)
    if not os.path.isfile(path):
        return []
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


antenas: list[dict[str, Any]] = _load_csv("antenas_flp.csv")
concentracao: list[dict[str, Any]] = _load_csv("tensor_concentracao.csv")
tensor_od: list[dict[str, Any]] = _load_csv("tensor_od.csv")
tensor_fluxo: list[dict[str, Any]] = _load_csv("tensor_fluxo_vias.csv")
assinantes: list[dict[str, Any]] = _load_csv("assinantes.csv")


# ── Helpers ─────────────────────────────────────────────────────────────────
def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _parse_float(val: Any) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0


def _parse_int(val: Any) -> int:
    try:
        return int(val)
    except (TypeError, ValueError):
        return 0


# ── Eventos mock (catalogo de experiencias) ────────────────────────────────
def _slugificar(titulo: str) -> str:
    return titulo.lower().replace(":", "").replace("ñ", "n").replace(" ", "-")[:40]

def _jitsi_url(titulo: str) -> str:
    return f"https://meet.jit.si/AppBiT-{_slugificar(titulo)}"

def _video_url(titulo: str) -> str:
    return f"https://meet.jit.si/AppBiT-{_slugificar(titulo)}?recording=true"

# ── Eventos mock (fallback cuando no hay eventos en DB) ──────────────────────
EVENTOS_MOCK = [
    {"titulo": "Charla: De Junior a SSR en 6 meses", "tipo": "presencial", "categoria": "crecimiento", "edad_min": 20, "edad_max": 35},
    {"titulo": "Mujeres en Tech: Historias de Resiliencia", "tipo": "grabado", "categoria": "diversidad", "edad_min": 18, "edad_max": 99},
    {"titulo": "Workshop: Cómo preparar tu primer tech talk", "tipo": "presencial", "categoria": "habilidades", "edad_min": 22, "edad_max": 40},
    {"titulo": "Mentoría grupal: Liderazgo en tecnología", "tipo": "online", "categoria": "liderazgo", "edad_min": 25, "edad_max": 50},
    {"titulo": "Mi historia: de bootcamp a líder de equipo", "tipo": "grabado", "categoria": "crecimiento", "edad_min": 18, "edad_max": 99},
    {"titulo": "Networking: Conectá con profesionales LATAM", "tipo": "presencial", "categoria": "networking", "edad_min": 18, "edad_max": 45},
    {"titulo": "Taller de CV y entrevistas técnicas", "tipo": "online", "categoria": "carrera", "edad_min": 20, "edad_max": 40},
    {"titulo": "Testimonio: Cómo cambié de rubro a los 35", "tipo": "grabado", "categoria": "cambio", "edad_min": 28, "edad_max": 55},
]

CONTENIDO_OFFLINE_MOCK = [
    {"titulo": "Mi historia: cómo entré a tecnología sin experiencia", "tipo": "video", "duracion": "12 min", "descripcion": "Testimonio inspirador de un desarrollador autodidacta."},
    {"titulo": "Guía rápida: primeros pasos en programación", "tipo": "lectura", "duracion": "8 min", "descripcion": "Recursos gratuitos para empezar desde cero."},
    {"titulo": "Ejercicio: identificá tus fortalezas profesionales", "tipo": "ejercicio", "duracion": "15 min", "descripcion": "Autoevaluación guiada para descubrir tu perfil."},
    {"titulo": "Charla TED: El poder de las segundas oportunidades", "tipo": "video", "duracion": "18 min", "descripcion": "Historia real de superación profesional."},
]


# ── Servicio principal ──────────────────────────────────────────────────────
class ExperienciasService:
    """Sin dependencia de base de datos — solo dataset CSVs en memoria."""

    @staticmethod
    def recomendar(request: ExperienciasRequest, eventos_db: list[Any] | None = None) -> ExperienciasResponse:
        lat_usuario = request.lat
        lng_usuario = request.lng
        periodo = request.hora_actual.upper()

        # 1. Encontrar cluster más cercano vía Haversine
        cluster_cercano, dist_antena = _encontrar_cluster(lat_usuario, lng_usuario)

        # 2. Obtener cobertura y concentración
        cobertura = _evaluar_cobertura(cluster_cercano, periodo)

        # 3. Generar eventos desde DB (o mock si no hay)
        calidad = cobertura.calidad

        eventos = _generar_eventos_desde_db(
            eventos_db=eventos_db or [],
            cluster=cluster_cercano,
            cobertura=cobertura,
            edad=request.edad,
            area=request.area,
            lat=lat_usuario,
            lng=lng_usuario,
        )

        destinos = _destinos_populares(cluster_cercano) if calidad != "baja" else []

        offline = _contenido_offline(calidad, edad=request.edad, objetivo=request.objetivo)

        return ExperienciasResponse(
            cluster_cercano=cluster_cercano,
            cobertura=cobertura,
            eventos_cercanos=eventos,
            destinos_populares=destinos,
            contenido_offline=offline,
        )


# ── Funciones internas ──────────────────────────────────────────────────────

def _encontrar_cluster(lat: float, lng: float) -> tuple[str, float]:
    if not antenas:
        return "DESCONOCIDO", 999.0

    mejor = None
    menor_dist = float("inf")

    for ant in antenas:
        d = _haversine_km(
            lat, lng,
            _parse_float(ant.get("lat")),
            _parse_float(ant.get("lon")),
        )
        if d < menor_dist:
            menor_dist = d
            mejor = ant.get("cluster", "DESCONOCIDO")

    return (mejor or "DESCONOCIDO"), menor_dist


def _evaluar_cobertura(cluster: str, periodo: str) -> CoberturaInfo:
    filas = [
        c for c in concentracao
        if c.get("cluster") == cluster and c.get("periodo", "").upper() == periodo
    ]
    if not filas:
        filas = [c for c in concentracao if c.get("cluster") == cluster]
    if not filas:
        return CoberturaInfo(
            calidad="regular", drop_pct=0.0, congestion=0.0,
            n_usuarios=0, periodo=periodo,
        )

    n_usuarios = sum(_parse_int(f.get("n_usuarios")) for f in filas) // len(filas)
    drop_pct = sum(_parse_float(f.get("drop_pct_medio")) for f in filas) / len(filas)
    congest = sum(_parse_float(f.get("congestionamento_medio")) for f in filas) / len(filas)

    if n_usuarios > 2000 and drop_pct < 0.07:
        calidad = "buena"
    elif drop_pct > 0.10 or n_usuarios < 500:
        calidad = "baja"
    else:
        calidad = "regular"

    return CoberturaInfo(
        calidad=calidad, drop_pct=round(drop_pct, 4),
        congestion=round(congest, 4), n_usuarios=n_usuarios,
        periodo=periodo,
    )


def _generar_eventos_desde_db(
    eventos_db: list[Any], cluster: str, cobertura: CoberturaInfo,
    edad: int | None, area: str | None, lat: float, lng: float,
) -> list[EventoCercano]:
    if cobertura.calidad == "baja":
        return []

    eventos: list[EventoCercano] = []
    n_est = max(cobertura.n_usuarios, 100)

    # Prioridad 1: eventos reales de la DB
    for ev in eventos_db:
        if ev.tipo == "presencial" and cobertura.calidad == "regular":
            continue
        if ev.cluster and ev.cluster != cluster:
            continue
        url = _jitsi_url(ev.title) if ev.tipo in ("online", "presencial") else _video_url(ev.title)
        participantes = n_est + (hash(ev.title) % 500)
        eventos.append(EventoCercano(
            titulo=ev.title,
            tipo=ev.tipo,
            cluster=cluster,
            lat=round(lat + (hash(ev.title) % 100) / 1000, 4),
            lon=round(lng + (hash(ev.title + "x") % 100) / 1000, 4),
            asistentes_estimados=participantes,
            categoria=ev.categoria,
            edad_recomendada="18-99",
            url=url,
            meeting_url=ev.meeting_url,
        ))

    # Prioridad 2: si hay pocos eventos reales, completar con mock
    if len(eventos) < 3:
        for ev in EVENTOS_MOCK:
            if cobertura.calidad == "regular" and ev["tipo"] == "presencial":
                continue
            if edad is not None and (edad < ev["edad_min"] or edad > ev["edad_max"]):
                continue
            rango = f"{ev['edad_min']}-{ev['edad_max']}"
            url = _jitsi_url(ev["titulo"]) if ev["tipo"] in ("online", "presencial") else _video_url(ev["titulo"])
            eventos.append(EventoCercano(
                titulo=ev["titulo"],
                tipo=ev["tipo"],
                cluster=cluster,
                lat=round(lat + (hash(ev["titulo"]) % 100) / 1000, 4),
                lon=round(lng + (hash(ev["titulo"] + "x") % 100) / 1000, 4),
                asistentes_estimados=n_est + (hash(ev["titulo"]) % 500),
                categoria=ev["categoria"],
                edad_recomendada=rango,
                url=url,
            ))

    return eventos[:6]


def _destinos_populares(cluster: str) -> list[DestinoPopular]:
    if not tensor_od:
        return []

    salidas = [o for o in tensor_od if o.get("cluster_origem") == cluster]
    salidas.sort(key=lambda x: _parse_int(x.get("n_viagens")), reverse=True)

    return [
        DestinoPopular(
            cluster=d.get("cluster_destino", ""),
            municipio=d.get("municipio_destino", ""),
            n_usuarios=_parse_int(d.get("n_viagens")),
            dist_km=_parse_float(d.get("dist_media_km")),
            periodo_predominante=d.get("periodo_predominante", ""),
        )
        for d in salidas[:4]
    ]


def _contenido_offline(
    calidad: str, edad: int | None, objetivo: str | None,
) -> list[ContenidoOffline]:
    if calidad != "baja":
        return []

    items = list(CONTENIDO_OFFLINE_MOCK)

    if objetivo == "find_job":
        items.insert(0, {
            "titulo": "Guía de búsqueda laboral para principiantes",
            "tipo": "lectura",
            "duracion": "10 min",
            "descripcion": "Pasos concretos para encontrar tu primer empleo en tech.",
        })

    return [
        ContenidoOffline(**it) for it in items
    ]
