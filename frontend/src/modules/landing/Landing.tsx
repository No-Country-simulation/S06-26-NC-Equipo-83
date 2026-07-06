import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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

  const fullTitle = "¡Craa! Soy BiT";
  const fullSubtitle = "Voy a acompañarte durante todo el camino para ayudarte a alcanzar tus objetivos.";

  const typewriterStartedRef = useRef(false);

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
      <section className="relative h-[90vh] w-screen overflow-hidden">
        {/* Fondo */}
        <img
          src="/landing-bg3.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface/40 via-transparent to-surface-low/50" />

        {/* Contenido */}
        <div className="relative z-10 mx-auto flex h-full max-w-[1650px] items-center px-6 md:px-12 lg:px-20">
          <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2">
            {/* Columna izquierda */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="w-full"
            >
              <h1 className="font-display font-bold leading-[1.1] tracking-tight text-4xl md:text-6xl lg:text-[64px]" style={{ color: "#002F68", letterSpacing: "-0.02em" }}>
                Cada pequeño paso te acerca a tu <span style={{ color: "#2F75DC" }}>futuro</span>.
              </h1>
              <p className="mt-6 font-sans text-lg leading-[1.6] md:text-xl" style={{ color: "#002F68" }}>
                Te acompañamos con aprendizaje, mentorías, oportunidades y
                bienestar para que crezcas a tu ritmo.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2F75DC] px-7 py-3.5 text-base font-semibold text-white shadow-ambient transition-all hover:bg-[#004A9E] hover:shadow-ambient-lg"
                >
                  Comienza tu camino
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c2c6d5] bg-white px-7 py-3.5 text-base font-semibold transition-all hover:bg-gray-50"
                  style={{ color: "#1E293B" }}
                >
                  <Play className="h-5 w-5 text-[#2F75DC]" />
                  Ver cómo funciona
                </a>
              </div>
            </motion.div>

            {/* Columna derecha: ave volando */}
            <div className="relative flex h-full items-center justify-end">
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
                  className="w-[420px] select-none object-contain drop-shadow-[0_24px_40px_rgba(30,41,59,0.18)] md:w-[570px] lg:w-[660px]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-[#fffffe]">
        <div className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20">
          <h2
            className="font-display text-center text-xl font-bold md:text-2xl lg:text-3xl"
            style={{ color: "#002F68", letterSpacing: "-0.02em" }}
          >
            Todo lo que necesitas, en un solo lugar
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-2xl bg-white px-4 py-6 text-center shadow-[0_4px_20px_-4px_rgba(30,41,59,0.12)] transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(30,41,59,0.16)]"
              >
                <div
                  className="mb-5 flex h-24 w-24 items-center justify-center rounded-full"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon className="h-12 w-12" style={{ color: feature.color }} />
                </div>
                <h3
                  className="font-display text-xl font-bold"
                  style={{ color: "#002F68" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-3 max-w-[20ch] font-sans text-base leading-relaxed"
                  style={{ color: "#424753" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="como-funciona" className="mt-10 w-full scroll-mt-32 bg-[#fffffe]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20"
        >
          <div className="rounded-3xl bg-[#EBF3FF] px-6 py-4 md:px-12 md:py-6">
            <h2
              className="font-display text-center text-xl font-bold md:text-2xl lg:text-3xl"
              style={{ color: "#002F68", letterSpacing: "-0.02em" }}
            >
              Usar BiT es muy fácil
            </h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={{ visible: { transition: { staggerChildren: 0.5 } } }}
              className="mx-auto mt-8 flex w-full flex-col items-center gap-0 md:flex-row md:justify-between"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E5DAFF]">
                  <User className="h-10 w-10 text-[#7C3AED]" />
                </div>
                <span className="mt-3 w-24 text-center font-display text-sm font-bold md:text-base" style={{ color: "#002F68" }}>
                  Crea tu perfil
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C8EDD5]">
                  <Compass className="h-10 w-10 text-[#006D34]" />
                </div>
                <span className="mt-3 w-28 text-center font-display text-sm font-bold md:text-base" style={{ color: "#002F68" }}>
                  Descubre tu camino
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C4DDFB]">
                  <BookOpen className="h-10 w-10 text-[#2F75DC]" />
                </div>
                <span className="mt-3 w-28 text-center font-display text-sm font-bold md:text-base" style={{ color: "#002F68" }}>
                  Aprende y desarrolla
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FDE68A]">
                  <MessageCircle className="h-10 w-10 text-[#D97706]" />
                </div>
                <span className="mt-3 w-28 text-center font-display text-sm font-bold md:text-base" style={{ color: "#002F68" }}>
                  Conecta con mentores
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C4DDFB]">
                  <Briefcase className="h-10 w-10 text-[#2F75DC]" />
                </div>
                <span className="mt-3 w-24 text-center font-display text-sm font-bold md:text-base" style={{ color: "#002F68" }}>
                  Aplica a trabajos
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C8EDD5]">
                  <Trophy className="h-10 w-10 text-[#006D34]" />
                </div>
                <span className="mt-3 w-28 text-center font-display text-sm font-bold md:text-base" style={{ color: "#002F68" }}>
                  Celebra tus logros
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Support & Testimonials */}
      <section className="mt-10 w-full bg-[#fffffe]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          onViewportEnter={() => setSectionVisible(true)}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Columna 1: No estás solo */}
            <div
              className="relative flex min-h-[360px] flex-col justify-center overflow-hidden rounded-3xl md:min-h-[440px]"
              style={{ backgroundColor: "#F5F0FF" }}
            >
              <img
                src="/pet-2.webp"
                alt="Mascota de apoyo"
                className="absolute bottom-0 left-0 h-[80%] w-auto object-contain md:h-[90%]"
              />
              <div className="relative z-10 flex flex-col justify-center px-8 py-4 text-center md:ml-auto md:max-w-[55%] md:px-12 md:text-left">
                <div
                  className="relative rounded-2xl bg-white px-5 py-4"
                  style={{ boxShadow: "0 4px 20px -2px rgba(30, 41, 59, 0.15)" }}
                >
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
                  <h2
                    className="font-display text-xl font-bold md:text-2xl lg:text-3xl"
                    style={{ color: "#002F68", letterSpacing: "-0.02em" }}
                  >
                    {displayedTitle}
                  </h2>
                  <p
                    className="mt-1 font-sans text-sm leading-relaxed md:text-base"
                    style={{ color: "#424753" }}
                  >
                    {displayedSubtitle}
                  </p>
                </div>
                <div
                  className="mt-6 inline-flex items-center gap-3 rounded-2xl px-4 py-2"
                  style={{ backgroundColor: "#E5DAFF" }}
                >
                  <Sparkles className="h-5 w-5 shrink-0" style={{ color: "#7C3AED" }} />
                  <p className="text-left text-sm leading-relaxed" style={{ color: "#7C3AED" }}>
                    BiT es un asistente de IA especializado en garantizar tu bienestar y ayudarte a cumplir tus metas.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna 2: Testimonios */}
            <div className="flex h-full flex-col rounded-3xl px-10 py-6 md:px-20 md:py-10" style={{ backgroundColor: "#FFFBEB" }}>
              <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col text-left"
                >
                  <Quote className="mb-3 h-6 w-6" style={{ color: "#D97706" }} />
                  <p
                    className="font-sans text-base leading-relaxed italic md:text-lg"
                    style={{ color: "#002F68" }}
                  >
                    {testimonials[currentTestimonial].quote}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <img
                      src={`/${testimonials[currentTestimonial].avatar}`}
                      alt={testimonials[currentTestimonial].name}
                      className="h-20 w-20 rounded-full"
                    />
                    <div className="text-left">
                      <p
                        className="font-display text-lg font-bold"
                        style={{ color: "#002F68" }}
                      >
                        {testimonials[currentTestimonial].name}, {testimonials[currentTestimonial].location}
                      </p>
                      <p className="text-base" style={{ color: "#424753" }}>
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              </div>

              {/* Dots */}
              <div className="mt-8 flex items-center justify-center gap-3">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === currentTestimonial ? "24px" : "10px",
                      height: "10px",
                      backgroundColor: i === currentTestimonial ? "#D97706" : "#FDE68A",
                    }}
                    aria-label={`Testimonio ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}