"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  Briefcase,
  Loader2,
  AlertCircle,
  Calendar,
  Scissors,
  Heart,
  Stethoscope,
  UserPlus,
  Clock,
  Tag,
} from "lucide-react";

interface UserInfo {
  role: "paciente" | "proveedor";
  serviceType?: "salud" | "belleza";
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  // Para proveedores
  certifications?: string[];
  servicesOffered?: string[];
  professionalCategory?: string;
  specialties?: string[];
  experience?: string;
  schedule?: {
    days: string[];
    hours: string;
  };
  promotions?: {
    title: string;
    description: string;
    validUntil: string;
  }[];
  pricing?: {
    service: string;
    price: number;
  }[];
  // Para pacientes
  preferences?: {
    category: string;
    preferences: string[];
  }[];
  appointmentHistory?: {
    date: string;
    service: string;
    provider: string;
    status: string;
  }[];
}

const categories = {
  salud: [
    "Médico General",
    "Dentista",
    "Fisioterapeuta",
    "Nutriólogo",
    "Psicólogo",
  ],
  belleza: [
    "Estilista",
    "Maquillador",
    "Manicurista",
    "Masajista",
    "Especialista en Skincare",
  ],
};

export default function AccountInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [originalInfo, setOriginalInfo] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        // Datos dummy mejorados
        const dummyData: UserInfo = {
          role: "proveedor",
          serviceType: "belleza",
          name: "Ana Martínez",
          email: "ana.martinez@example.com",
          phone: "+52 555-123-4567",
          address: "Av. Reforma 234, Ciudad de México",
          bio: "Especialista en colorimetría y cortes modernos con más de 5 años de experiencia.",
          professionalCategory: "Estilista",
          specialties: ["Colorimetría", "Cortes modernos", "Peinados de novia"],
          certifications: [
            "Certificación en Colorimetría Avanzada",
            "Especialista en Técnicas de Corte Moderno",
          ],
          servicesOffered: [
            "Corte de cabello",
            "Tinte",
            "Peinado",
            "Tratamientos capilares",
          ],
          experience: "5 años",
          schedule: {
            days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            hours: "9:00 AM - 7:00 PM",
          },
          promotions: [
            {
              title: "Descuento en Coloración",
              description: "20% de descuento en servicios de coloración",
              validUntil: "2024-02-28",
            },
          ],
          pricing: [
            { service: "Corte de cabello", price: 350 },
            { service: "Tinte completo", price: 1200 },
            { service: "Peinado", price: 500 },
          ],
        };
        setUserInfo(dummyData);
        setOriginalInfo(dummyData);
        setError(null);
      } catch (error) {
        setError(
          "No se pudo cargar la información del perfil. Por favor, intente nuevamente."
        );
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simular guardado exitoso
      setEditMode(false);
      setSuccess("¡Información actualizada exitosamente!");
      setOriginalInfo(userInfo);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Error al actualizar la información. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUserInfo(originalInfo);
    setEditMode(false);
    setError(null);
  };

  if (loading && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex justify-center items-center p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
          <span>Cargando información del perfil...</span>
        </div>
      </div>
    );
  }

  if (!userInfo) return null;

  const ServiceCard = ({ title, icon: Icon, value }: any) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500/10 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-lg font-semibold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center">
                  {userInfo.profileImage ? (
                    <img
                      src={userInfo.profileImage}
                      alt={userInfo.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-teal-400" />
                  )}
                </div>
                {editMode && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-teal-400">
                  {userInfo.name}
                </h1>
                <p className="text-sm text-gray-400">
                  {userInfo.role === "proveedor"
                    ? `${userInfo.professionalCategory} - ${
                        userInfo.serviceType === "salud"
                          ? "Servicios de Salud"
                          : "Servicios de Belleza"
                      }`
                    : "Perfil de Cliente"}
                </p>
              </div>
            </div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-teal-500 hover:bg-teal-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-teal-500 hover:bg-teal-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {(error || success) && (
            <Alert
              className={`mb-6 ${
                error
                  ? "bg-red-900/50 border-red-800"
                  : "bg-green-900/50 border-green-800"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error || success}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-gray-700/50 border-gray-600">
              <TabsTrigger value="personal" className="data-[state=active]:bg-teal-500">
                Información Personal
              </TabsTrigger>
              {userInfo.role === "proveedor" && (
                <>
                  <TabsTrigger value="services" className="data-[state=active]:bg-teal-500">
                    Servicios
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="data-[state=active]:bg-teal-500">
                    Horarios y Promociones
                  </TabsTrigger>
                </>
              )}
              {userInfo.role === "paciente" && (
                <TabsTrigger value="history" className="data-[state=active]:bg-teal-500">
                  Historial y Preferencias
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceCard
                  title="Correo Electrónico"
                  icon={Mail}
                  value={userInfo.email}
                />
                <ServiceCard
                  title="Teléfono"
                  icon={Phone}
                  value={userInfo.phone}
                />
                {userInfo.address && (
                  <ServiceCard
                    title="Dirección"
                    icon={MapPin}
                    value={userInfo.address}
                  />
                )}
                {userInfo.experience && (
                  <ServiceCard
                    title="Experiencia"
                    icon={Award}
                    value={userInfo.experience}
                  />
                )}
              </div>

              {userInfo.bio && (
                <Card className="bg-gray-800/50 border-gray-700 mt-4">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Biografía</h3>
                    <p className="text-gray-300">{userInfo.bio}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {userInfo.role === "proveedor" && (
              <>
                <TabsContent value="services" className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <Accordion type="single" collapsible className="w-full">
                      {userInfo.specialties && (
                        <AccordionItem value="specialties" className="border-gray-700">
                          <AccordionTrigger className="text-teal-400 hover:text-teal-300">
                            Especialidades
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {userInfo.specialties.map((specialty, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-700 rounded-lg p-2 text-sm"
                                >
                                  {specialty}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {userInfo.servicesOffered && (
                        <AccordionItem value="services" className="border-gray-700">
                          <AccordionTrigger className="text-teal-400 hover:text-teal-300">
                            Servicios Ofrecidos
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {userInfo.pricing?.map((item, index) => (
                              <div
                              key={index}
                              className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium">{item.service}</p>
                                <p className="text-sm text-gray-400">
                                  Desde ${item.price} MXN
                                </p>
                              </div>
                              {editMode && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {userInfo.certifications && (
                    <AccordionItem value="certifications" className="border-gray-700">
                      <AccordionTrigger className="text-teal-400 hover:text-teal-300">
                        Certificaciones
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {userInfo.certifications.map((cert, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg"
                            >
                              <Award className="w-4 h-4 text-teal-400" />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-400" />
                      Horario de Atención
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Días</p>
                        <p className="font-medium">
                          {userInfo.schedule?.days.join(", ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Horario</p>
                        <p className="font-medium">{userInfo.schedule?.hours}</p>
                      </div>
                    </div>
                  </div>

                  {userInfo.promotions && userInfo.promotions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-teal-400" />
                        Promociones Activas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userInfo.promotions.map((promo, index) => (
                          <Card
                            key={index}
                            className="bg-gray-700/50 border-gray-600"
                          >
                            <CardContent className="p-4">
                              <h4 className="font-medium text-teal-400">
                                {promo.title}
                              </h4>
                              <p className="text-sm text-gray-300 mt-1">
                                {promo.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Válido hasta: {promo.validUntil}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {userInfo.role === "paciente" && (
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {userInfo.appointmentHistory && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-400" />
                    Historial de Citas
                  </h3>
                  <div className="space-y-3">
                    {userInfo.appointmentHistory.map((appointment, index) => (
                      <Card
                        key={index}
                        className="bg-gray-800/50 border-gray-700"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{appointment.service}</p>
                              <p className="text-sm text-gray-400">
                                {appointment.provider}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{appointment.date}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  appointment.status === "Completada"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}
                              >
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {userInfo.preferences && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-teal-400" />
                    Preferencias
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userInfo.preferences.map((pref, index) => (
                      <Card
                        key={index}
                        className="bg-gray-800/50 border-gray-700"
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium text-teal-400">
                            {pref.category}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pref.preferences.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-700 px-2 py-1 rounded-full"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </CardContent>
  </Card>
</div>
);
}