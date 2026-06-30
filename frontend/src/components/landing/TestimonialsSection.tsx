import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  testimonials,
  type Testimonial,
} from "../../mocks/testimonials";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1
          ? 0
          : prevIndex + 1
      );
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const testimonial: Testimonial =
    testimonials[currentIndex];

  return (
    <section
      id="testimonios"
      className="bg-[#F8F6F2] py-24"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#99462A]/10 px-4 py-2 text-sm font-medium text-[#99462A]">
            Comunidad App BiT
          </span>

          <h2 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Historias que inspiran
          </h2>

          <p className="mt-4 text-slate-600">
            Personas que encontraron nuevas oportunidades y
            confianza para crecer.
          </p>
        </div>

        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.article
              key={testimonial.id}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -30,
              }}
              transition={{
                duration: 0.5,
              }}
              className="rounded-3xl border border-[#E8E4DD] bg-white p-8 shadow-sm md:p-12"
            >
              <div className="mb-8 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#99462A]/10 text-xl font-semibold text-[#99462A]">
                  {testimonial.name.charAt(0)}
                </div>
              </div>

              <blockquote className="text-center">
                <p className="text-xl leading-relaxed text-slate-700 md:text-2xl">
                  "{testimonial.quote}"
                </p>

                <footer className="mt-8">
                  <p className="font-semibold text-slate-900">
                    {testimonial.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {testimonial.role}
                  </p>
                </footer>
              </blockquote>
            </motion.article>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {testimonials.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ver testimonio ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-[#99462A]"
                  : "w-2.5 bg-[#D8D3CC]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}