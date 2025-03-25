"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import TestimonialCard from "../cards/TestimonialCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Define la interfaz para las props
interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

// Define el tipo 'Testimonial'
interface Testimonial {
  name: string;
  role: string;
  image: string;
  text: string;
  product: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerView = { mobile: 1, tablet: 2, desktop: 3 };
  const maxIndex = testimonials.length - itemsPerView.desktop;

  const handleNext = () => {
    setActiveIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setActiveIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Lo Que Dicen Nuestros Usuarios
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Profesionales que han transformado su práctica utilizando nuestra suite completa.
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div 
              className="flex gap-6"
              animate={{ x: `-${activeIndex * 33.33}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full md:min-w-[50%] lg:min-w-[33.33%]">
                  <TestimonialCard
                    name={testimonial.name}
                    role={testimonial.role}
                    image={testimonial.image}
                    text={testimonial.text}
                    product={testimonial.product}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <button 
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={`p-3 rounded-full ${activeIndex === 0 ? 'bg-gray-700 text-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'} transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              disabled={activeIndex >= maxIndex}
              className={`p-3 rounded-full ${activeIndex >= maxIndex ? 'bg-gray-700 text-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'} transition-colors`}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;