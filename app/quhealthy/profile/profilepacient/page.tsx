"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  HeartPulse, 
  Activity,
  Clock,
  AlertCircle,
  Pill,
  Target,
  Sparkles,
  Loader2
} from "lucide-react";

interface PatientProfileForm {
  fullName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  healthGoals: string[];
  servicePreferences: string[];
  preferredSchedule: string;
  interestInActivities: Record<string, number>;
}

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

const PatientProfile: React.FC = () => {
  const [form, setForm] = useState<PatientProfileForm>({
    fullName: "",
    birthDate: "",
    gender: "",
    phoneNumber: "",
    address: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    healthGoals: [],
    servicePreferences: [],
    preferredSchedule: "",
    interestInActivities: { exercise: 5, diet: 5, cosmetics: 5 },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { title: "Información Personal", icon: User },
    { title: "Historial Médico", icon: HeartPulse },
    { title: "Preferencias", icon: Sparkles },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (Array.isArray(form[name as keyof PatientProfileForm])) {
      setForm((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name as keyof PatientProfileForm] as string[]), value]
          : (prev[name as keyof PatientProfileForm] as string[]).filter((v) => v !== value),
      }));
    }
  };

  const handleInterestChange = (activity: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      interestInActivities: {
        ...prev.interestInActivities,
        [activity]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/patients/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Error al guardar el perfil");

      toast.success("¡Perfil guardado exitosamente!");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al guardar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Completa tu Perfil de Salud
          </h1>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 h-0.5 w-full bg-gray-700 -z-10"></div>
            {sections.map((section, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`flex flex-col items-center space-y-2 relative ${
                  currentSection === index ? "text-teal-400" : "text-gray-400"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentSection === index ? "bg-teal-500" : "bg-gray-700"
                }`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{section.title}</span>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-xl"
            variants={fadeIn}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentSection === 0 && (
                  <motion.div
                    key="personal"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleInputChange}
                        placeholder="Nombre completo"
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="date"
                        name="birthDate"
                        value={form.birthDate}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <Activity className="absolute left-3 top-3 text-gray-400" />
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all appearance-none"
                      >
                        <option value="">Selecciona tu género</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Número de teléfono"
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        placeholder="Dirección"
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                {currentSection === 1 && (
                  <motion.div
                    key="medical"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="relative">
                      <HeartPulse className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="medicalHistory"
                        value={form.medicalHistory}
                        onChange={handleInputChange}
                        placeholder="Historial médico"
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all min-h-[100px]"
                      />
                    </div>

                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="allergies"
                        value={form.allergies}
                        onChange={handleInputChange}
                        placeholder="Alergias conocidas"
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all min-h-[100px]"
                      />
                    </div>

                    <div className="relative">
                      <Pill className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="currentMedications"
                        value={form.currentMedications}
                        onChange={handleInputChange}
                        placeholder="Medicamentos actuales"
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all min-h-[100px]"
                      />
                    </div>
                  </motion.div>
                )}

                {currentSection === 2 && (
                  <motion.div
                    key="preferences"
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Objetivos de Salud
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Bajar de peso", "Mejorar belleza", "Incrementar energía", "Relajación y bienestar", "Mejorar rendimiento físico"].map((goal) => (
                          <motion.label
                            key={goal}
                            className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="checkbox"
                              value={goal}
                              checked={form.healthGoals.includes(goal)}
                              onChange={handleCheckboxChange}
                              name="healthGoals"
                              className="form-checkbox text-teal-500 rounded"
                            />
                            <span className="text-white">{goal}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Servicios Preferidos
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {["Spa", "Tratamientos de piel", "Terapias de masaje", "Nutrición", "Estética"].map((service) => (
                          <motion.label
                            key={service}
                            className="flex items-center space-x-2 bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="checkbox"
                              value={service}
                              checked={form.servicePreferences.includes(service)}
                              onChange={handleCheckboxChange}
                              name="servicePreferences"
                              className="form-checkbox text-teal-500 rounded"
                            />
                            <span className="text-white">{service}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Horario Preferido
                      </h3>
                      <select
                        name="preferredSchedule"
                        value={form.preferredSchedule}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all appearance-none"
                      >
                        <option value="">Selecciona tu horario preferido</option>
                        <option value="morning">Mañana (8:00 - 12:00)</option>
                        <option value="afternoon">Tarde (12:00 - 17:00)</option>
                        <option value="evening">Noche (17:00 - 21:00)</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Nivel de Interés
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(form.interestInActivities).map(([activity, value]) => (
                          <div key={activity} className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-300">
                              <span className="capitalize">{activity}</span>
                              <span>{value}/10</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={value}
                              onChange={(e) => handleInterestChange(activity, parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-6">
                <motion.button
                  type="button"
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentSection === 0
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: currentSection === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: currentSection === 0 ? 1 : 0.95 }}
                  disabled={currentSection === 0}
                >
                  Anterior
                </motion.button>

                {currentSection < sections.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                    className="px-6 py-2 rounded-lg font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Siguiente
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors disabled:bg-teal-700 disabled:cursor-not-allowed flex items-center gap-2"
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Perfil"
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientProfile;
