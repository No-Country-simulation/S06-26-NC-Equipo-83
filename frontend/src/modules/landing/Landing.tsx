import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Play, BookOpen, Briefcase, Users, HeartHandshake, Heart, User, Compass, MessageCircle, Trophy, Sparkles, Quote } from "lucide-react";

const features = [
  { icon: BookOpen,  title: "Aprende",       description: "Rutas de aprendizaje personalizadas para desarrollar tus habilidades.", color: "#7C3AED", bgColor: "#F3EAFF" },
  { icon: Briefcase, title: "Oportunidades",  description: "Encuentra empleos que se ajusten a tus habilidades.",                       color: "#006D34", bgColor: "#E8F8EE" },
  { icon: Users,     title: "Mentorías",      description: "Conecta con mentores que te inspiran y te guían.",                          color: "#D97706", bgColor: "#FEF3C7" },
  { icon: HeartHandshake, title: "Comunidad", description: "Comparte, aprende y crece junto a otras personas.",                        color: "#2F75DC", bgColor: "#E8F1FC" },
  { icon: Heart,     title: "Bienestar",      description: "Cuida tu salud emocional con ayuda y recursos pensados para ti",           color: "#DB2777", bgColor: "#FCE7F3" },
];

const testimonials = [
  { quote: "BiT me ayudó a entender qué habilidades necesitaba mejorar y me dio una ruta clara para avanzar. Hoy me siento mucho más segura y motivada para alcanzar mi primer empleo.", name: "Julia",    location: "Brasil", role: "Desarrolladora Frontend",  avatar: "julia.svg" },
  { quote: "No solo encontré cursos y oportunidades, también recuperé la confianza en mí mismo. Tener una guía personalizada hizo que cada paso fuera mucho más fácil.",                          name: "José",     location: "Perú",   role: "Desarrollador Full Stack", avatar: "jose.svg" },
  { quote: "Con BiT dejé de sentir que estaba avanzando sin rumbo. Ahora sé exactamente cuál es mi siguiente objetivo y cada día estoy más cerca de conseguir el trabajo que quiero.",            name: "Ousmane",  location: "Angola", role: "Estudiante",                 avatar: "ousmande.svg" },
];

export default function Landing() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [sectionVisible, setSectionVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const fullTitle = "¡Craa! Soy BiT";
  const fullSubtitle = "Voy a acompañarte durante todo el camino para ayudarte a alcanzar tus objetivos.";
  const typewriterStartedRef = useRef(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!sectionVisible) return;
    const timer = setTimeout(() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearTimeout(timer);
  }, [sectionVisible, currentTestimonial]);

  useEffect(() => {
    if (!sectionVisible || typewriterStartedRef.current) return;
    typewriterStartedRef.current = true;
    let titleIndex = 0, subtitleIndex = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const typeTitle = () => {
      if (titleIndex < fullTitle.length) {
        timeouts.push(setTimeout(() => { setDisplayedTitle(fullTitle.slice(0, titleIndex + 1)); titleIndex++; typeTitle(); }, 40));
      } else {
        const typeSubtitle = () => {
          if (subtitleIndex < fullSubtitle.length) {
            timeouts.push(setTimeout(() => { setDisplayedSubtitle(fullSubtitle.slice(0, subtitleIndex + 1)); subtitleIndex++; typeSubtitle(); }, 25));
          }
        };
        typeSubtitle();
      }
    };
    typeTitle();
    return () => timeouts.forEach(clearTimeout);
  }, [sectionVisible]);

  const vp = (amount = 0.4) => ({ once: true, amount: isDesktop ? amount : 0.1 });

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface-page font-sans">
      {/* ═══════════════════════════════════════════════════════════ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden md:h-[90vh]">
        <img src="/landing-bg3.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-bottom" />
        <div className="absolute inset-0 bg-gradient-to-br from-surface/40 via-transparent to-surface-low/50" />

        <div className="relative z-10 mx-auto flex h-full max-w-container-wide items-center px-6 pb-[15%] pt-16 md:px-12 md:py-0 lg:px-20">
          <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2">
            {/* Bird (desktop only) */}
            <div className="relative hidden h-full items-center justify-center md:order-2 md:flex md:justify-end">
              <motion.div initial={{ x: "120vw", opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ x: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }, opacity: { duration: 0.4, delay: 0.1 } }}>
                <motion.img src="/pet-hero.webp" alt="Mascota guacamaya" animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
                  className="w-[280px] max-w-full select-none object-contain sm:w-[360px] md:w-[570px] lg:w-[660px]" style={{ filter: "drop-shadow(var(--shadow-hero-bird))" }} />
              </motion.div>
            </div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="w-full md:order-1">
              <h1 className="font-display font-bold leading-tight tracking-tight text-4xl text-text-primary md:text-6xl lg:text-[64px]">
                Cada pequeño paso te acerca a tu <span className="text-brand">futuro</span>.
              </h1>
              <p className="mt-8 font-sans leading-normal text-base text-text-primary md:text-xl">
                Te acompañamos con aprendizaje, mentorías, oportunidades y bienestar para que crezcas a tu ritmo.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base shadow-ambient hover:bg-brand-hover hover:shadow-ambient-lg">
                  Comienza tu camino <ArrowRight className="h-5 w-5" />
                </a>
                <a href="#como-funciona" className="btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base">
                  <Play className="h-5 w-5" /> Ver cómo funciona
                </a>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <div className="flex -space-x-5">
                  {["https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&clotheColor=Blue01&eyeType=Default&eyebrowType=Default&mouthType=Smile&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription01&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=DarkBrown",
                    "https://avataaars.io/?avatarStyle=Circle&topType=CurlyHair&accessoriesType=Blank&hairColor=Blonde&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Red&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Brown",
                    "https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Blank&hairColor=Brown&facialHairType=BeardMedium&clotheType=ShirtVNeck&clotheColor=PastelBlue&eyeType=Default&eyebrowType=FlatNatural&mouthType=Twinkle&skinColor=Pale",
                  ].map((url, i) => <img key={i} src={url} alt="" className="h-10 w-10 rounded-full sm:h-[54px] sm:w-[54px]" />)}
                </div>
                <p className="text-sm text-text-primary leading-snug sm:max-w-[260px]">
                  Miles de personas ya están transformando su futuro con <span className="font-semibold text-brand">BiT</span>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FEATURES ══════════════════════════════════════════════════════ */}
      <section id="pilares" className="w-full scroll-mt-32 bg-surface-page">
        <div className="mx-auto max-w-container-wide px-6 md:px-12 lg:px-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp(0.4)} transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-center text-xl font-bold text-text-primary md:text-2xl lg:text-3xl">
            Todo lo que necesitas, en un solo lugar
          </motion.h2>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp()} transition={{ duration: 0.6 }}
            className="mx-auto mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {features.map((feature) => (
              <motion.div key={feature.title} whileHover={{ y: -6, boxShadow: "var(--shadow-card-hover)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center rounded-2xl bg-surface-card px-4 py-6 text-center shadow-card">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20 md:h-24 md:w-24" style={{ backgroundColor: feature.bgColor }}>
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" style={{ color: feature.color }} />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">{feature.title}</h3>
                <p className="mt-3 max-w-[20ch] font-sans text-base leading-relaxed text-text-body">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════ SUPPORT & TESTIMONIALS ════════════════════════════════════════════════ */}
      <section id="sobre-bit" className="mt-12 w-full scroll-mt-32 bg-surface-page md:mt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp()} onViewportEnter={() => setSectionVisible(true)} transition={{ duration: 0.6 }}
          className="mx-auto max-w-container-wide px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Columna 1: "¡Craa! Soy BiT" */}
            <div className="relative flex min-h-[360px] flex-col items-center overflow-hidden rounded-3xl bg-secondary-soft md:min-h-[440px] md:justify-center">

              {/* ── Mobile layout ── */}
              <div className="relative flex w-full flex-col items-center px-6 pb-[270px] pt-4 sm:pb-[370px] md:hidden">
                <div className="w-full rounded-2xl bg-surface-card px-5 py-4 shadow-speech">
                  <h2 className="font-display text-xl font-bold text-text-primary">{displayedTitle}</h2>
                  <p className="mt-1 font-sans text-sm leading-relaxed text-text-body">{displayedSubtitle}</p>
                </div>
                <img src="/pet-2.webp" alt="Mascota de apoyo" className="absolute bottom-0 left-0 h-[260px] w-auto object-contain sm:h-[360px]" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-center">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-secondary-badge px-4 py-2">
                    <Sparkles className="h-5 w-5 shrink-0" style={{ color: "#7C3AED" }} />
                    <p className="text-left text-sm leading-relaxed" style={{ color: "#7C3AED" }}>
                      BiT es un asistente de IA especializado en garantizar tu bienestar y ayudarte a cumplir tus metas.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Desktop layout ── */}
              <div className="hidden md:flex md:h-full md:w-full">
                <img src="/pet-2.webp" alt="Mascota de apoyo" className="absolute bottom-0 left-0 h-[90%] w-auto object-contain" />
                <div className="relative z-10 flex w-full flex-col justify-center px-8 py-4 md:ml-auto md:max-w-[55%] md:px-12 md:text-left">
                  <div className="relative rounded-2xl bg-surface-card px-5 py-4 shadow-speech">
                    <div className="absolute bottom-3 left-[-8px]" style={{ width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid white" }} />
                    <h2 className="font-display text-xl font-bold text-text-primary md:text-2xl lg:text-3xl">{displayedTitle}</h2>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-text-body md:text-base">{displayedSubtitle}</p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-secondary-badge px-4 py-2">
                    <Sparkles className="h-5 w-5 shrink-0" style={{ color: "#7C3AED" }} />
                    <p className="text-left text-sm leading-relaxed" style={{ color: "#7C3AED" }}>
                      BiT es un asistente de IA especializado en garantizar tu bienestar y ayudarte a cumplir tus metas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Testimonios */}
            <div className="flex h-full flex-col rounded-3xl bg-accent-soft px-6 py-6 sm:px-10 md:px-20 md:py-10">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div key={currentTestimonial} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="flex flex-col text-left">
                    <Quote className="mb-3 h-6 w-6" style={{ color: "#D97706" }} />
                    <p className="font-sans text-base italic leading-relaxed text-text-primary md:text-lg">{testimonials[currentTestimonial].quote}</p>
                    <div className="mt-6 flex items-center gap-4">
                      <img src={`/${testimonials[currentTestimonial].avatar}`} alt={testimonials[currentTestimonial].name} className="h-16 w-16 rounded-full sm:h-20 sm:w-20" />
                      <div className="text-left">
                        <p className="font-display text-lg font-bold text-text-primary">{testimonials[currentTestimonial].name}, {testimonials[currentTestimonial].location}</p>
                        <p className="text-base leading-relaxed text-text-body">{testimonials[currentTestimonial].role}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-8 flex items-center justify-center gap-3">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setCurrentTestimonial(i)} className="rounded-full transition-all duration-300"
                    style={{ width: i === currentTestimonial ? "24px" : "10px", height: "10px", backgroundColor: i === currentTestimonial ? "#D97706" : "#FDE68A" }}
                    aria-label={`Testimonio ${i + 1}`} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════ ROADMAP ═══════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="mt-12 w-full scroll-mt-32 bg-surface-page md:mt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp()} transition={{ duration: 0.6 }}
          className="mx-auto max-w-container-wide px-6 md:px-12 lg:px-20">
          <div className="rounded-3xl bg-primary-soft px-6 py-4 md:px-12 md:py-6">
            <h2 className="font-display text-center text-xl font-bold text-text-primary md:text-2xl lg:text-3xl">Usar BiT es muy fácil</h2>

            <motion.div initial="hidden" whileInView="visible" viewport={vp()} variants={{ visible: { transition: { staggerChildren: 0.5 } } }}
              className="mx-auto mt-8 flex w-full flex-col items-center gap-6 md:flex-row md:justify-between md:gap-0">
              {[
                { Icon: User,          label: "Crea tu perfil",          bg: "bg-[var(--color-secondary-badge)]", color: "text-[#7C3AED]" },
                { Icon: Compass,       label: "Descubre tu camino",     bg: "bg-success-soft",                    color: "text-[#006D34]" },
                { Icon: BookOpen,      label: "Aprende y desarrolla",   bg: "bg-info-soft",                       color: "text-brand" },
                { Icon: MessageCircle, label: "Conecta con mentores",   bg: "bg-accent-badge",                    color: "text-[#D97706]" },
                { Icon: Briefcase,     label: "Aplica a trabajos",      bg: "bg-info-soft",                       color: "text-brand" },
                { Icon: Trophy,        label: "Celebra tus logros",     bg: "bg-success-soft",                    color: "text-[#006D34]" },
              ].map(({ Icon, label, bg, color }, idx, arr) => (
                <span key={label}>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20 ${bg}`}>
                      <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${color}`} />
                    </div>
                    <span className="mt-3 w-28 text-center font-display text-sm font-bold text-text-primary md:text-base">{label}</span>
                  </motion.div>
                  {idx < arr.length - 1 && (
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} className="hidden md:flex md:h-16 md:flex-1 md:items-center">
                      <svg className="h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
                        <path d="M4 32 Q30 6, 60 32 Q80 54, 96 32" fill="none" stroke="#c2c6d5" strokeWidth="4" strokeDasharray="5 12" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  )}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════ CTA ════════════════════════════════════════════════════════ */}
      <section className="mt-12 w-full bg-surface-page md:mt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={vp()} transition={{ duration: 0.6 }}
          className="mx-auto max-w-container-wide px-6 md:px-12 lg:px-20">
          <div className="flex flex-col items-center gap-8 rounded-3xl bg-gradient-to-b from-[var(--color-brand-light)] to-accent-soft px-6 py-8 md:flex-row md:gap-12 md:px-16 md:py-4">
            <motion.div initial={{ x: -120, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={vp()} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden flex-shrink-0 md:block">
              <motion.img src="/pet-3.webp" alt="Mascota BiT" className="h-auto w-[320px] object-contain lg:w-[400px]"
                whileHover={{ rotate: -6, scale: 1.05 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} />
            </motion.div>
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">Tu camino empieza ahora.</h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-text-body md:text-lg">¿Qué estás esperando? Comienza ahora y descubre todo lo que tenemos preparado para ti.</p>
              <a href="/register" className="btn-primary mt-6 inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base shadow-ambient hover:bg-brand-hover hover:shadow-ambient-lg">
                Comenzar mi camino <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
