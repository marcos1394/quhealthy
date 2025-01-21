"use client";
import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Globe,
  Bell,
  Save,
  X,
  Settings,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Moon,
  Sun,
  Volume2,
  DollarSign,
  Clock,
  Shield,
  Smartphone,
  Languages,
  MapPin,
} from "lucide-react";

interface PreferencesProps {
  role: "paciente" | "proveedor";
}

const languages = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const currencies = [
  { code: "MXN", label: "Peso Mexicano (MXN)", symbol: "$" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
];

const timeFormats = [
  { code: "12", label: "12 horas (AM/PM)" },
  { code: "24", label: "24 horas" },
];

const Preferences: React.FC<PreferencesProps> = ({ role }) => {
  const [preferences, setPreferences] = useState({
    notifications: {
      enabled: true,
      email: true,
      push: true,
      sms: false,
      appointments: true,
      messages: true,
      updates: true,
      requests: true,
      promotions: true,
      reminders: true,
    },
    appearance: {
      theme: "system",
      fontSize: "medium",
      reduceMotion: false,
      highContrast: false,
    },
    language: "es",
    currency: "MXN",
    timeFormat: "12",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sound: {
      enabled: true,
      volume: 80,
      messageSound: true,
      notificationSound: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showProfile: "all", // all, contacts, none
      allowMessages: "all",
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState(preferences);
  const [activeTab, setActiveTab] = useState("notifications");

  type NotificationKeys = keyof typeof preferences.notifications;

  const notificationTypes: Record<
    "paciente" | "proveedor",
    { id: NotificationKeys; label: string; icon: React.ElementType; description: string }[]
  > = {
    paciente: [
      {
        id: "appointments",
        label: "Recordatorios de citas",
        icon: Calendar,
        description: "Recibe notificaciones sobre tus próximas citas",
      },
      {
        id: "messages",
        label: "Mensajes nuevos",
        icon: Mail,
        description: "Notificaciones de mensajes de proveedores",
      },
      {
        id: "updates",
        label: "Actualizaciones de servicio",
        icon: Bell,
        description: "Cambios y actualizaciones en los servicios",
      },
      {
        id: "promotions",
        label: "Promociones y ofertas",
        icon: DollarSign,
        description: "Ofertas especiales de tus proveedores favoritos",
      },
    ],
    proveedor: [
      {
        id: "requests",
        label: "Solicitudes de servicio",
        icon: Calendar,
        description: "Nuevas solicitudes de citas",
      },
      {
        id: "messages",
        label: "Mensajes de pacientes",
        icon: Mail,
        description: "Mensajes de tus pacientes",
      },
      {
        id: "updates",
        label: "Actualizaciones de plataforma",
        icon: Bell,
        description: "Novedades y cambios importantes",
      },
      {
        id: "reminders",
        label: "Recordatorios",
        icon: Clock,
        description: "Recordatorios de citas próximas",
      },
    ],
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        // Simulación de datos
        setTimeout(() => {
          setPreferences(preferences);
          setOriginalPreferences(preferences);
          setError(null);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("No se pudieron cargar las preferencias. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditMode(false);
      setSuccess("¡Preferencias actualizadas exitosamente!");
      setOriginalPreferences(preferences);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al actualizar las preferencias. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreferences(originalPreferences);
    setEditMode(false);
    setError(null);
  };

  const PreferenceCard = ({ 
    icon: Icon, 
    title, 
    description, 
    children,
    className = "" 
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-teal-500/10 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-teal-400">{title}</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4">{description}</p>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex justify-center items-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
          <span>Cargando preferencias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500/10 p-3 rounded-full">
                <Settings className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-teal-400">
                  Preferencias
                </h1>
                <p className="text-sm text-gray-400">
                  Personaliza tu experiencia en la plataforma
                </p>
              </div>
            </div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-teal-500 hover:bg-teal-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar Preferencias
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

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-gray-700/50 border-gray-600">
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-teal-500"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notificaciones
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-teal-500"
              >
                <Sun className="w-4 h-4 mr-2" />
                Apariencia
              </TabsTrigger>
              <TabsTrigger
                value="language"
                className="data-[state=active]:bg-teal-500"
              >
                <Globe className="w-4 h-4 mr-2" />
                Idioma y Región
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="data-[state=active]:bg-teal-500"
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacidad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              <PreferenceCard
                icon={Bell}
                title="Notificaciones generales"
                description="Administra tus notificaciones y alertas"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activar notificaciones</p>
                      <p className="text-sm text-gray-400">
                        Recibe alertas importantes
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications.enabled}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            enabled: checked,
                          },
                        })
                      }
                      disabled={!editMode}
                    />
                  </div>
                  {preferences.notifications.enabled && (
  <>
    <Separator className="my-4" />
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          Canales de notificación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-teal-400" />
              <div>
                <p className="text-sm">Correo electrónico</p>
                <p className="text-xs text-gray-400">
                  Notificaciones por email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications.email}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    email: checked,
                  },
                })
              }
              disabled={!editMode}
            />
          </div>
          <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-teal-400" />
              <div>
                <p className="text-sm">Push</p>
                <p className="text-xs text-gray-400">
                  Notificaciones en el navegador
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications.push}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    push: checked,
                  },
                })
              }
              disabled={!editMode}
            />
          </div>
          <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-teal-400" />
              <div>
                <p className="text-sm">SMS</p>
                <p className="text-xs text-gray-400">
                  Notificaciones por mensaje de texto
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.notifications.sms}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    sms: checked,
                  },
                })
              }
              disabled={!editMode}
            />
          </div>
        </div>
      </div>
    </div>
  </>
)}


                 
                </div>

              </PreferenceCard>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <PreferenceCard
                icon={Moon}
                title="Tema y visualización"
                description="Personaliza la apariencia de la aplicación"
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Tema</h4>
                    <Select
                      value={preferences.appearance.theme}
                      onValueChange={(value) =>
                        setPreferences({
                          ...preferences,
                          appearance: {
                            ...preferences.appearance,
                            theme: value,
                          },
                        })
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Oscuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Reducir movimiento</p>
                        <p className="text-xs text-gray-400">
                          Minimiza las animaciones
                        </p>
                      </div>
                      <Switch
                        checked={preferences.appearance.reduceMotion}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            appearance: {
                              ...preferences.appearance,
                              reduceMotion: checked,
                            },
                          })
                        }
                        disabled={!editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Alto contraste</p>
                        <p className="text-xs text-gray-400">
                          Mejora la legibilidad
                        </p>
                      </div>
                      <Switch
                        checked={preferences.appearance.highContrast}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            appearance: {
                              ...preferences.appearance,
                              highContrast: checked,
                            },
                          })
                        }
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                </div>
              </PreferenceCard>
            </TabsContent>

            <TabsContent value="language" className="space-y-4">
              <PreferenceCard
                icon={Languages}
                title="Idioma"
                description="Selecciona tu idioma preferido"
              >
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      language: value,
                    })
                  }
                  disabled={!editMode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PreferenceCard>

              <PreferenceCard
                icon={DollarSign}
                title="Moneda"
                description="Configura tu moneda preferida"
              >
                <Select
                  value={preferences.currency}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      currency: value,
                    })
                  }
                  disabled={!editMode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PreferenceCard>

              <PreferenceCard
                icon={Clock}
                title="Formato de hora"
                description="Elige cómo se muestra la hora"
              >
                <Select
                  value={preferences.timeFormat}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      timeFormat: value,
                    })
                  }
                  disabled={!editMode}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFormats.map((format) => (
                      <SelectItem key={format.code} value={format.code}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PreferenceCard>

              <PreferenceCard
                icon={MapPin}
                title="Zona horaria"
                description="Tu zona horaria actual"
                className="opacity-50"
              >
                <p className="text-sm text-gray-400">
                  {preferences.timeZone}
                  <span className="text-xs ml-2">(Detectada automáticamente)</span>
                </p>
              </PreferenceCard>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <PreferenceCard
                icon={Shield}
                title="Privacidad"
                description="Configura tus ajustes de privacidad"
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mostrar estado en línea</p>
                        <p className="text-xs text-gray-400">
                          Otros pueden ver cuando estás activo
                        </p>
                      </div>
                      <Switch
                        checked={preferences.privacy.showOnlineStatus}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            privacy: {
                              ...preferences.privacy,
                              showOnlineStatus: checked,
                            },
                          })
                        }
                        disabled={!editMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mostrar última vez visto</p>
                        <p className="text-xs text-gray-400">
                          Otros pueden ver tu última actividad
                        </p>
                      </div>
                      <Switch
                        checked={preferences.privacy.showLastSeen}
                        onCheckedChange={(checked) =>
                          setPreferences({
                            ...preferences,
                            privacy: {
                              ...preferences.privacy,
                              showLastSeen: checked,
                            },
                          })
                        }
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Visibilidad del perfil
                    </h4>
                    <Select
                      value={preferences.privacy.showProfile}
                      onValueChange={(value) =>
                        setPreferences({
                          ...preferences,
                          privacy: {
                            ...preferences.privacy,
                            showProfile: value,
                          },
                        })
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona la visibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="contacts">Solo contactos</SelectItem>
                        <SelectItem value="none">Nadie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Mensajes directos
                    </h4>
                    <Select
                      value={preferences.privacy.allowMessages}
                      onValueChange={(value) =>
                        setPreferences({
                          ...preferences,
                          privacy: {
                            ...preferences.privacy,
                            allowMessages: value,
                          },
                        })
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona quién puede enviarte mensajes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="contacts">Solo contactos</SelectItem>
                        <SelectItem value="none">Nadie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PreferenceCard>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Preferences;