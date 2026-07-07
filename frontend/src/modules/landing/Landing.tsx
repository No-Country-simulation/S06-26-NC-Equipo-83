import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Play, BookOpen, Briefcase, Users, HeartHandshake, Heart, User, Compass, MessageCircle, Trophy, Sparkles, Quote } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Aprende",
    description: "Rutas de aprendizaje personalizadas para desarrollar tus habilidades.",
    color: "#7C3AED",
    bgColor: "#F3EAFF",
  },
  {
    icon: Briefcase,
    title: "Oportunidades",
    description: "Encuentra empleos que se ajusten a tus habilidades.",
    color: "#006D34",
    bgColor: "#E8F8EE",
  },
  {
    icon: Users,
    title: "Mentorías",
    description: "Conecta con mentores que te inspiran y te guían.",
    color: "#D97706",
    bgColor: "#FEF3C7",
  },
  {
    icon: HeartHandshake,
    title: "Comunidad",
    description: "Comparte, aprende y crece junto a otras personas.",
    color: "#2F75DC",
    bgColor: "#E8F1FC",
  },
  {
    icon: Heart,
    title: "Bienestar",
    description: "Cuida tu salud emocional con ayuda y recursos pensados para ti",
    color: "#DB2777",
    bgColor: "#FCE7F3",
  },
];

const testimonials = [
  {
    quote: "BiT me ayudó a entender qué habilidades necesitaba mejorar y me dio una ruta clara para avanzar. Hoy me siento mucho más segura y motivada para alcanzar mi primer empleo.",
    name: "Julia",
    location: "Brasil",
    role: "Desarrolladora Frontend",
    avatar: "julia.svg",
  },
  {
    quote: "No solo encontré cursos y oportunidades, también recuperé la confianza en mí mismo. Tener una guía personalizada hizo que cada paso fuera mucho más fácil.",
    name: "José",
    location: "Perú",
    role: "Desarrollador Full Stack",
    avatar: "jose.svg",
  },
  {
    quote: "Con BiT dejé de sentir que estaba avanzando sin rumbo. Ahora sé exactamente cuál es mi siguiente objetivo y cada día estoy más cerca de conseguir el trabajo que quiero.",
    name: "Ousmane",
    location: "Angola",
    role: "Estudiante",
    avatar: "ousmande.svg",
  },
];

export default function Landing() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [sectionVisible, setSectionVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fullTitle = "¡Craa! Soy BiT";
  const fullSubtitle = "Voy a acompañarte durante todo el camino para ayudarte a alcanzar tus objetivos.";

  const typewriterStartedRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.scrollIntoView();
          });
        });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 477);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!sectionVisible) return;
    const timer = setTimeout(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [sectionVisible, currentTestimonial]);

  useEffect(() => {
    if (!sectionVisible || typewriterStartedRef.current) return;
    typewriterStartedRef.current = true;
    let titleIndex = 0;
    let subtitleIndex = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const typeTitle = () => {
      if (titleIndex < fullTitle.length) {
        const t = setTimeout(() => {
          setDisplayedTitle(fullTitle.slice(0, titleIndex + 1));
          titleIndex++;
          typeTitle();
        }, 40);
        timeouts.push(t);
      } else {
        const typeSubtitle = () => {
          if (subtitleIndex < fullSubtitle.length) {
            const t = setTimeout(() => {
              setDisplayedSubtitle(fullSubtitle.slice(0, subtitleIndex + 1));
              subtitleIndex++;
              typeSubtitle();
            }, 25);
            timeouts.push(t);
          }
        };
        typeSubtitle();
      }
    };

    typeTitle();
    return () => timeouts.forEach(clearTimeout);
  }, [sectionVisible]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-on-surface" style={{ backgroundColor: "#fffffe" }}>
      {/* Hero */}
      <section className="relative w-full overflow-hidden md:h-[90vh]">
        {/* Fondo */}
        <img
          src="/landing-bg3.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface/40 via-transparent to-surface-low/50" />

        {/* Contenido */}
        <div className="relative z-10 mx-auto flex h-full max-w-[1650px] items-center px-6 pb-[15%] pt-16 md:px-12 md:py-0 lg:px-20">
          <div className="grid w-full grid-cols-1 items-center gap-8 min-[950px]:grid-cols-2">
            {/* Columna derecha (arriba en mobile): ave volando */}
            <div className="relative hidden h-full items-center justify-center min-[950px]:order-2 min-[950px]:flex min-[950px]:justify-end">
              <motion.div
                initial={{ x: "120vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  x: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
                  opacity: { duration: 0.4, delay: 0.1 },
                }}
                className="relative"
              >
                <motion.img
                  src="/pet-hero.webp"
                  alt="Mascota guacamaya"
                  animate={{ y: [0, -20, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.3,
                  }}
                  className="w-[280px] max-w-full select-none object-contain drop-shadow-[0_24px_40px_rgba(30,41,59,0.18)] sm:w-[360px] md:w-[570px] lg:w-[660px]"
                />
              </motion.div>
            </div>

            {/* Columna izquierda (abajo en mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="w-full md:order-1"
            >
              <h1 className="font-display font-bold leading-[1.1] tracking-tight text-4xl md:text-5xl min-[1110px]:text-[64px]" style={{ color: "#002F68", letterSpacing: "-0.02em" }}>
                Cada pequeño paso te acerca a tu <span style={{ color: "#2F75DC" }}>futuro</span>.
              </h1>
              <p className="mt-8 font-sans leading-[1.6] text-base md:text-lg min-[1100px]:text-xl" style={{ color: "#002F68" }}>
                Te acompañamos con aprendizaje, mentorías, oportunidades y
                bienestar para que crezcas a tu ritmo.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2F75DC] px-7 py-3.5 text-base font-semibold text-white shadow-ambient transition-all hover:bg-[#004A9E] hover:shadow-ambient-lg"
                >
                  Comienza tu camino
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold shadow-[inset_0_0_0_1px_#2F75DC] transition-all hover:bg-[#2F75DC]/10"
                  style={{ color: "#2F75DC" }}
                >
                  <Play className="h-5 w-5 text-[#2F75DC]" />
                  Ver cómo funciona
                </a>
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <div className="flex -space-x-5">
                  {[
                    "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&clotheColor=Blue01&eyeType=Default&eyebrowType=Default&mouthType=Smile&skinColor=Light",
                    "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription01&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Heather&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=DarkBrown",
                    "https://avataaars.io/?avatarStyle=Circle&topType=CurlyHair&accessoriesType=Blank&hairColor=Blonde&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Red&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Brown",
                    "https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Blank&hairColor=Brown&facialHairType=BeardMedium&clotheType=ShirtVNeck&clotheColor=PastelBlue&eyeType=Default&eyebrowType=FlatNatural&mouthType=Twinkle&skinColor=Pale",
                  ].map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-10 w-10 rounded-full sm:h-[54px] sm:w-[54px]"
                    />
                  ))}
                </div>
                <div className="text-sm leading-snug sm:max-w-[260px]" style={{ color: "#002F68" }}>
                  Miles de personas ya están transformando su futuro con{" "}
                  <span style={{ color: "#2F75DC" }} className="font-semibold">BiT</span>.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="pilares" className="w-full scroll-mt-32 bg-[#fffffe]">
        <div className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-center text-xl font-bold md:text-2xl lg:text-3xl"
            style={{ color: "#002F68", letterSpacing: "-0.02em" }}
          >
            Todo lo que necesitas, en un solo lugar
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -6, boxShadow: "0 12px 32px -8px rgba(30,41,59,0.18)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center rounded-2xl bg-white px-4 py-6 text-center shadow-[0_4px_20px_-4px_rgba(30,41,59,0.12)]"
              >
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20 md:h-24 md:w-24"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" style={{ color: feature.color }} />
                </div>
                <h3
                  className="font-display text-base font-bold sm:text-lg md:text-xl lg:text-base min-[1350px]:text-xl"
                  style={{ color: "#002F68" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-3 max-w-[20ch] font-sans text-xs leading-relaxed sm:text-sm md:text-base lg:text-xs min-[1350px]:text-base"
                  style={{ color: "#424753" }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Support & Testimonials */}
      <section id="sobre-bit" className="mt-12 w-full scroll-mt-32 bg-[#fffffe] md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
          onViewportEnter={() => setSectionVisible(true)}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20"
        >
          <div className="sobre-bit-container">
            <div className="grid h-full grid-cols-1 min-[1000px]:grid-cols-2 sobre-bit-grid">
              {/* Columna 1: No estás solo */}
              <div className={`flex ${isMobile ? 'aspect-[18/16]' : 'aspect-video'} flex-col overflow-hidden rounded-3xl sb-dialog-bubble`} style={{ backgroundColor: "#F5F0FF" }}>
                {isMobile ? (
                  <div className="grid h-full w-full" style={{ gridTemplateRows: 'auto 1fr' }}>
                    <div className="flex flex-col px-4 pt-4">
                      <div className="relative rounded-2xl bg-white sb-dialog" style={{ boxShadow: "0 4px 20px -2px rgba(30, 41, 59, 0.15)" }}>
                        <h2 className="font-display font-bold sb-title" style={{ color: "#002F68", letterSpacing: "-0.02em" }}>
                          {displayedTitle}
                        </h2>
                        <p className="mt-1 font-sans leading-relaxed sb-body" style={{ color: "#424753" }}>
                          {displayedSubtitle}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src="/pet-2.webp"
                        alt="Mascota de apoyo"
                        className="absolute bottom-0 left-0 h-full w-full object-contain object-left-bottom"
                      />
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                        <div className="inline-flex items-center rounded-2xl sb-badge" style={{ backgroundColor: "#E5DAFF" }}>
                          <Sparkles className="shrink-0" style={{ color: "#7C3AED", width: "clamp(0.875rem, 2.2cqi, 1.25rem)", height: "clamp(0.875rem, 2.2cqi, 1.25rem)" }} />
                          <p className="text-left sb-body" style={{ color: "#7C3AED" }}>
                            BiT es un asistente de IA especializado en garantizar tu bienestar y ayudarte a cumplir tus metas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full w-full items-end" style={{ gridTemplateAreas: '"pet dialog"', gridTemplateColumns: '45% 55%' }}>
                    <img
                      src="/pet-2.webp"
                      alt="Mascota de apoyo"
                      className="h-full w-full object-contain object-left-bottom"
                      style={{ gridArea: "pet" }}
                    />
                    <div className="flex flex-col justify-center self-center px-4 py-2 md:px-[8%]" style={{ gridArea: "dialog" }}>
                      <div className="relative rounded-2xl bg-white sb-dialog" style={{ boxShadow: "0 4px 20px -2px rgba(30, 41, 59, 0.15)" }}>
                        {isDesktop && (
                          <div
                            className="absolute bottom-3 left-[-8px]"
                            style={{
                              width: 0,
                              height: 0,
                              borderTop: "8px solid transparent",
                              borderBottom: "8px solid transparent",
                              borderRight: "8px solid white",
                            }}
                          />
                        )}
                        <h2 className="font-display font-bold sb-title" style={{ color: "#002F68", letterSpacing: "-0.02em" }}>
                          {displayedTitle}
                        </h2>
                        <p className="mt-1 font-sans leading-relaxed sb-body" style={{ color: "#424753" }}>
                          {displayedSubtitle}
                        </p>
                      </div>
                      <div className="mt-4 inline-flex items-center rounded-2xl sb-badge" style={{ backgroundColor: "#E5DAFF" }}>
                        <Sparkles className="shrink-0" style={{ color: "#7C3AED", width: "clamp(0.875rem, 2.2cqi, 1.25rem)", height: "clamp(0.875rem, 2.2cqi, 1.25rem)" }} />
                        <p className="text-left sb-body" style={{ color: "#7C3AED" }}>
                          BiT es un asistente de IA especializado en garantizar tu bienestar y ayudarte a cumplir tus metas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Columna 2: Testimonios */}
              <div className="flex aspect-video flex-col rounded-3xl sb-testimonial-col" style={{ backgroundColor: "#FFFBEB" }}>
                <div className="flex-1 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTestimonial}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col text-left"
                    >
                      <Quote className="sb-quote-icon" style={{ color: "#D97706" }} />
                      <p className="font-sans italic leading-relaxed sb-testimonial-quote" style={{ color: "#002F68" }}>
                        {testimonials[currentTestimonial].quote}
                      </p>
                      <div className="mt-6 flex items-center" style={{ gap: "clamp(0.5rem, 2cqi, 1rem)" }}>
                        <img
                          src={`/${testimonials[currentTestimonial].avatar}`}
                          alt={testimonials[currentTestimonial].name}
                          className="rounded-full sb-avatar object-cover"
                        />
                        <div className="text-left">
                          <p className="font-display font-bold sb-testimonial-name" style={{ color: "#002F68" }}>
                            {testimonials[currentTestimonial].name}, {testimonials[currentTestimonial].location}
                          </p>
                          <p className="sb-testimonial-role" style={{ color: "#424753" }}>
                            {testimonials[currentTestimonial].role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex items-center justify-center" style={{ gap: "clamp(0.25rem, 1cqi, 0.75rem)" }}>
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonial(i)}
                      className={`rounded-full transition-all duration-300 ${i === currentTestimonial ? 'sb-dot-active' : 'sb-dot-inactive'}`}
                      style={{ backgroundColor: i === currentTestimonial ? "#D97706" : "#FDE68A" }}
                      aria-label={`Testimonio ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Roadmap Section */}
      <section id="como-funciona" className="mt-12 w-full scroll-mt-32 bg-[#fffffe] md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20"
        >
          <div className="rounded-3xl bg-[#EBF3FF] px-6 py-4 md:px-4 md:py-6 min-[836px]:px-12">
            <h2
              className="font-display text-center text-xl font-bold md:text-2xl lg:text-3xl"
              style={{ color: "#002F68", letterSpacing: "-0.02em" }}
            >
              Usar BiT es muy fácil
            </h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
              variants={{ visible: { transition: { staggerChildren: 0.5 } } }}
              className="mx-auto mt-8 flex w-full flex-col items-center gap-6 md:flex-row md:justify-between md:gap-0"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 bg-[#E5DAFF]">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-10 lg:w-10 text-[#7C3AED]" />
                </div>
                <span className="mt-3 block w-24 text-center font-display text-sm font-bold sm:text-sm md:text-xs lg:text-base min-h-[1.75rem]" style={{ color: "#002F68" }}>
                  Crea tu<br />perfil
                </span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} className="hidden md:flex md:h-16 md:flex-1 md:items-center">
                <svg className="h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
                  <path
                    d="M4 32 Q30 6, 60 32 Q80 54, 96 32"
                    fill="none"
                    stroke="#c2c6d5"
                    strokeWidth="4"
                    strokeDasharray="5 12"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 bg-[#C8EDD5]">
                  <Compass className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-10 lg:w-10 text-[#006D34]" />
                </div>
                <span className="mt-3 block w-28 text-center font-display text-sm font-bold sm:text-sm md:text-xs lg:text-base min-h-[1.75rem]" style={{ color: "#002F68" }}>
                  Descubre tu<br />camino
                </span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} className="hidden md:flex md:h-16 md:flex-1 md:items-center">
                <svg className="h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
                  <path
                    d="M4 32 Q30 58, 60 32 Q80 10, 96 32"
                    fill="none"
                    stroke="#c2c6d5"
                    strokeWidth="4"
                    strokeDasharray="5 12"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 bg-[#C4DDFB]">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-10 lg:w-10 text-[#2F75DC]" />
                </div>
                <span className="mt-3 block w-28 text-center font-display text-sm font-bold sm:text-sm md:text-xs lg:text-base min-h-[1.75rem]" style={{ color: "#002F68" }}>
                  Aprende y<br />desarrolla
                </span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} className="hidden md:flex md:h-16 md:flex-1 md:items-center">
                <svg className="h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
                  <path
                    d="M4 32 Q50 8, 96 32"
                    fill="none"
                    stroke="#c2c6d5"
                    strokeWidth="4"
                    strokeDasharray="5 12"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 bg-[#FDE68A]">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-10 lg:w-10 text-[#D97706]" />
                </div>
                <span className="mt-3 block w-28 text-center font-display text-sm font-bold sm:text-sm md:text-xs lg:text-base min-h-[1.75rem]" style={{ color: "#002F68" }}>
                  Conecta con<br />mentores
                </span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} className="hidden md:flex md:h-16 md:flex-1 md:items-center">
                <svg className="h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
                  <path
                    d="M4 32 Q50 56, 96 32"
                    fill="none"
                    stroke="#c2c6d5"
                    strokeWidth="4"
                    strokeDasharray="5 12"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 bg-[#C4DDFB]">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-10 lg:w-10 text-[#2F75DC]" />
                </div>
                <span className="mt-3 block w-24 text-center font-display text-sm font-bold sm:text-sm md:text-xs lg:text-base min-h-[1.75rem]" style={{ color: "#002F68" }}>
                  Aplica a<br />trabajos
                </span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }} className="hidden md:flex md:h-16 md:flex-1 md:items-center">
                <svg className="h-full w-full" viewBox="0 0 100 64" preserveAspectRatio="none">
                  <path
                    d="M4 32 Q25 6, 48 32 Q70 58, 96 32"
                    fill="none"
                    stroke="#c2c6d5"
                    strokeWidth="4"
                    strokeDasharray="5 12"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-20 lg:w-20 bg-[#C8EDD5]">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-10 lg:w-10 text-[#006D34]" />
                </div>
                <span className="mt-3 block w-28 text-center font-display text-sm font-bold sm:text-sm md:text-xs lg:text-base min-h-[1.75rem]" style={{ color: "#002F68" }}>
                  Celebra tus<br />logros
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Final */}
      <section className="mt-12 w-full bg-[#fffffe] md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20"
        >
          <div className="flex flex-col items-center gap-8 rounded-3xl bg-gradient-to-b from-[#E0F0FF] to-[#FFF5E0] px-6 py-8 md:flex-row md:gap-12 md:px-16 md:py-4">
          <motion.div
            initial={{ x: -120, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: isDesktop ? 0.4 : 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden flex-shrink-0 md:block"
          >
            <motion.img
              src="/pet-3.webp"
              alt="Mascota BiT"
              className="h-auto w-[160px] object-contain sm:w-[200px] md:w-[260px] lg:w-[320px] min-[1261px]:w-[400px]"
              whileHover={{ rotate: -6, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            />
          </motion.div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h2
              className="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-4xl min-[1261px]:text-5xl"
              style={{ color: "#002F68", letterSpacing: "-0.02em" }}
            >
              Tu camino empieza ahora.
            </h2>
            <p
              className="mt-4 max-w-md leading-relaxed text-sm sm:text-base md:text-base min-[1261px]:text-lg"
              style={{ color: "#424753" }}
            >
              ¿Qué estás esperando? Comienza ahora y descubre todo lo que tenemos preparado para ti.
            </p>
            <a
              href="/register"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#2F75DC] px-8 py-3.5 text-sm font-semibold text-white shadow-ambient transition-all hover:bg-[#004A9E] hover:shadow-ambient-lg sm:text-base"
            >
              Comenzar mi camino
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}