"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function Carousel({ slides, autoSlide = true, interval = 4000 }) {
  const [[current, direction], setCurrent] = useState([0, 0]);
  const timeoutRef = useRef(null);

  const paginate = (newDirection) => {
    setCurrent(([prev]) => [
      (prev + newDirection + slides.length) % slides.length,
      newDirection,
    ]);
  };

  useEffect(() => {
    if (!autoSlide) return;

    timeoutRef.current = setTimeout(() => {
      paginate(1);
    }, interval);

    return () => clearTimeout(timeoutRef.current);
  }, [current, autoSlide, interval]);

  return (
    <div className="w-full relative overflow-hidden rounded-3xl h-[260px]">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => clearTimeout(timeoutRef.current)}
          onDragEnd={(e, info) => {
            if (info.offset.x < -50) paginate(1);
            if (info.offset.x > 50) paginate(-1);
          }}
          className="w-full h-full bg-[#1a1a1f] border border-[#C6A75E]/30 rounded-3xl flex flex-col items-center justify-center text-white p-10 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-3 text-[#C6A75E]">
            {slides[current].title}
          </h3>
          <p className="text-zinc-400 text-center">
            {slides[current].description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() =>
              setCurrent([index, index > current ? 1 : -1])
            }
            className={`w-3 h-3 rounded-full transition ${
              index === current ? "bg-[#C6A75E]" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}