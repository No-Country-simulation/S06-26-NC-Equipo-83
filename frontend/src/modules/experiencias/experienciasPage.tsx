import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Wifi, WifiOff, Signal, Users,
  Video, BookOpen, Dumbbell, ExternalLink,
  Loader2, AlertCircle, Navigation, VideoOff, Plus,
} from "lucide-react";
import { useExperienciasStore } from "../../store/useExperienciasStore";
import { useAuthStore } from "../../store/useAuthStore";

const COBERTURA_STYLES: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  buena: { label: "Buena", color: "text-emerald-700", bg: "bg-emerald-100/70", icon: Signal },
  regular: { label: "Regular", color: "text-amber-700", bg: "bg-amber-100/70", icon: Wifi },
  baja: { label: "Baja", color: "text-red-700", bg: "bg-red-100/70", icon: WifiOff },
};

const TIPO_EVENTO_STYLES: Record<string, { label: string; color: string }> = {
  presencial: { label: "Presencial", color: "bg-blue-100 text-blue-700" },
  online: { label: "Online", color: "bg-purple-100 text-purple-700" },
  grabado: { label: "Grabado", color: "bg-gray-100 text-gray-600" },
};

const OFFLINE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  lectura: BookOpen,
  ejercicio: Dumbbell,
};

export const ExperienciasPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, fetchRecomendaciones, clearData } = useExperienciasStore();
  const [locationError, setLocationError] = useState<string | null>(null);

  const getLocationAndFetch = () => {
    setLocationError(null);
    clearData();

    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const hora = new Date().getHours();
        let periodo = "MANHA";
        if (hora >= 5 && hora < 12) periodo = "MANHA";
        else if (hora >= 12 && hora < 18) periodo = "TARDE";
        else if (hora >= 18 && hora < 24) periodo = "NOITE";
        else periodo = "MADRUGADA";

        fetchRecomendaciones({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          hora_actual: periodo,
          edad: user ? calcularEdad(user.birth_date) : undefined,
          area: user?.tech_area || undefined,
          objetivo: user?.career_objective || undefined,
        });
      },
      (_err) => {
        setLocationError("No pudimos obtener tu ubicación. Activá el GPS e intentá de nuevo.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    getLocationAndFetch();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#A04E2D] mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Buscando experiencias cerca de ti...</p>
          <p className="text-xs text-gray-400">Usando dataset Vísent CDRView</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={getLocationAndFetch} className="px-6 py-2.5 bg-[#A04E2D] text-white font-semibold text-sm rounded-xl shadow-sm">Reintentar</button>
        </div>
      </main>
    );
  }

  if (locationError && !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <MapPin className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-amber-700 font-medium">{locationError}</p>
          <button onClick={getLocationAndFetch} className="px-6 py-2.5 bg-[#A04E2D] text-white font-semibold text-sm rounded-xl shadow-sm">Intentar de nuevo</button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const coberturaStyle = COBERTURA_STYLES[data.cobertura.calidad] || COBERTURA_STYLES.regular;
  const CoberturaIcon = coberturaStyle.icon;

  return (
    <main className="min-h-screen py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
      <div className="max-w-[1024px] mx-auto space-y-6 md:space-y-8">

        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Experiencias</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Basado en tu ubicación y perfil</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/experiencias/crear")}
              className="px-3 py-1.5 bg-[#A04E2D] hover:bg-[#853F22] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear
            </button>
            <button onClick={getLocationAndFetch} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              Actualizar
            </button>
          </div>
        </header>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#A04E2D]" />
              <span className="font-bold text-sm md:text-base text-gray-800">{data.cluster_cercano.replace(/_/g, " ")}</span>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${coberturaStyle.bg} ${coberturaStyle.color}`}>
              <CoberturaIcon className="w-3.5 h-3.5" />
              {coberturaStyle.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <Users className="w-4 h-4 mx-auto text-gray-500 mb-1" />
              <span className="font-bold text-gray-800 block">{data.cobertura.n_usuarios.toLocaleString()}</span>
              <span className="text-gray-400">personas</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <Wifi className="w-4 h-4 mx-auto text-gray-500 mb-1" />
              <span className="font-bold text-gray-800 block">{(data.cobertura.drop_pct * 100).toFixed(1)}%</span>
              <span className="text-gray-400">caída</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <Signal className="w-4 h-4 mx-auto text-gray-500 mb-1" />
              <span className="font-bold text-gray-800 block">{(data.cobertura.congestion * 100).toFixed(0)}%</span>
              <span className="text-gray-400">congestión</span>
            </div>
          </div>
        </section>

        {data.eventos_cercanos.length > 0 && (
          <>
            <section className="space-y-3">
              <h2 className="text-base md:text-lg font-bold text-gray-900 tracking-tight px-0.5">
                Eventos {data.cobertura.calidad === "buena" ? "cerca de ti" : "recomendados"}
              </h2>
              <div className="space-y-2.5">
                {data.eventos_cercanos.map((ev, idx) => {
                  const tipoStyle = TIPO_EVENTO_STYLES[ev.tipo] || TIPO_EVENTO_STYLES.grabado;
                  const linkReal = ev.meeting_url || ev.url; // meeting_url > auto Jitsi
                  const abrirEvento = () => {
                    if (linkReal) window.open(linkReal, "_blank", "noopener,noreferrer");
                  };
                  return (
                    <article key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h3 className="font-bold text-sm md:text-base text-gray-800 leading-snug">{ev.titulo}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tipoStyle.color}`}>{tipoStyle.label}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{ev.categoria}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.asistentes_estimados.toLocaleString()}</span>
                            <span className="flex items-center gap-1">Edad: {ev.edad_recomendada}</span>
                          </div>
                        </div>
                        {linkReal ? (
                          <button
                            onClick={abrirEvento}
                            className="flex-shrink-0 px-3 py-2 bg-[#A04E2D] hover:bg-[#853F22] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" />
                            {ev.tipo === "grabado" ? "Ver" : "Unirse"}
                          </button>
                        ) : (
                          <span className="flex-shrink-0 p-2 bg-gray-50 rounded-xl">
                            <VideoOff className="w-4 h-4 text-gray-300" />
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {data.destinos_populares.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold text-gray-900 tracking-tight px-0.5">Destinos populares desde tu zona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.destinos_populares.map((dest, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{dest.cluster.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-400">{dest.municipio}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-[#A04E2D]">{dest.n_usuarios.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">{dest.dist_km.toFixed(1)} km</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.contenido_offline.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-0.5">
              <WifiOff className="w-4 h-4 text-amber-600" />
              <h2 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">Contenido offline disponible</h2>
            </div>
            <p className="text-xs text-gray-500 -mt-2 px-0.5">La cobertura en tu zona es baja. Disfrutá este contenido sin conexión.</p>
            <div className="space-y-2.5">
              {data.contenido_offline.map((item, idx) => {
                const Icon = OFFLINE_ICONS[item.tipo] || BookOpen;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
                    <div className="p-2.5 bg-amber-50 rounded-xl flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-800 truncate">{item.titulo}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.descripcion}</p>
                      <span className="text-[10px] font-medium text-gray-400 mt-1 block">{item.duracion} • {item.tipo}</span>
                    </div>
                    <button className="flex-shrink-0 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Ver
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-gray-50 rounded-2xl p-4 md:p-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Datos de concentración y cobertura del dataset Vísent CDRView
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            Antenas Anatel • Región Metropolitana de Florianópolis
          </p>
        </section>
      </div>
    </main>
  );
};

function calcularEdad(birthDate: string): number {
  const hoy = new Date();
  const nac = new Date(birthDate);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
