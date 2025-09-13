/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Save, Loader2, 
  Plus, Trash2, GripVertical, Users,
   Zap, Crown, CheckCircle2,
  Video, FileText, Settings, Brush} from 'lucide-react';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/app/quhealthy/components/Fleupload';
import { EnhancedMarketplacePreview } from '@/app/quhealthy/components/EnhancedMarketplacePreview';


interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  serviceType?: 'online' | 'in_person' | 'hybrid';
}

// Añade esto cerca de tus otros imports
interface StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image?: string;
}


// Componente Principal
export default function QuHealthyBrandEditor() {
  const router = useRouter();
  const { data: statusData, isLoading: pageLoading } = useOnboardingStatus();
  
  // Estado para manejar la configuración general de la tienda
  const [settings, setSettings] = useState({
    storeName: '',
    storeSlug: '',
    storeLogoUrl: '',
    bannerImageUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    customDescription: '',
    welcomeVideoUrl: '',
    customDomain: '',
      videoUrl: '', 
      typography:''// <-- AÑADE ESTA LÍNEA
 // Asegúrate que este campo coincida con el modelo
  });
  
  // Estados para manejar el catálogo (inician vacíos, se llenarán desde la API)
  const [services, setServices] = useState<Service[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [loading, setLoading] = useState(false); // Para el botón de "Guardar Cambios"
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    // --- INICIO DE LA CORRECCIÓN ---
    // Usamos la ruta correcta para acceder a los datos del marketplace
    if (statusData?.onboardingStatus?.marketplace) {
      const { marketplace } = statusData.onboardingStatus;
      setSettings(prev => ({
        ...prev,
        storeName: marketplace.storeName || '',
        storeSlug: marketplace.storeSlug || '',
        storeLogoUrl: marketplace.storeLogo || '',
        bannerImageUrl: marketplace.storeBanner || '',
        primaryColor: marketplace.primaryColor || '#8B5CF6',
        secondaryColor: marketplace.secondaryColor || '#EC4899',
        customDescription: marketplace.customDescription || '',
        welcomeVideoUrl: marketplace.welcomeVideo || '',
      }));
    }
    // --- FIN DE LA CORRECCIÓN ---
  }, [statusData]);

  // Función para manejar cambios en los inputs del formulario
  const handleSettingsChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Guarda la configuración general de la tienda (apariencia, contenido, SEO, etc.)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Llama al endpoint que actualiza la configuración general
      await axios.put('/api/marketplace/settings', settings, { withCredentials: true });
      
      setShowSaveSuccess(true);
      toast.success("¡Cambios guardados exitosamente!");
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
      // Opcional: si este es el último paso del onboarding, redirigir
      router.push('/quhealthy/authentication/providers/onboarding/checklist');

    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("No se pudieron guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    // Datos por defecto para un nuevo servicio
    const newServiceData = {
      name: 'Nuevo Servicio (Haz clic para editar)',
      description: 'Describe tu nuevo servicio aquí...',
      duration: 60,
      price: 50.00,
      serviceType: 'in_person'
    };
    
    try {
      // Llamamos al endpoint POST para crear el recurso
      const response = await axios.post('/api/marketplace/services', newServiceData, { withCredentials: true });
      
      // Añadimos el nuevo servicio (devuelto por la API con su ID real) al estado para actualizar la UI
      setServices(prev => [...prev, response.data]);
      toast.success("Nuevo servicio añadido exitosamente.");

    } catch (error) {
      console.error('Error al añadir el servicio:', error);
      toast.error("No se pudo añadir el nuevo servicio.");
    }
  };

  const updateService = async (id: number, updates: object) => {
    // Guardamos el estado original en caso de que la API falle
    const originalServices = [...services];
    
    // 1. Actualización optimista: Actualizamos la UI al instante
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === id ? { ...service, ...updates } : service
      )
    );
    
    try {
      // 2. Llamada a la API en segundo plano
      await axios.put(`/api/marketplace/services/${id}`, updates, { withCredentials: true });
      // Podemos usar un toast sutil para confirmar el guardado en segundo plano
      // toast.info("Cambio guardado.", { autoClose: 1000 });

    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
      toast.error("No se pudo guardar el cambio. Revirtiendo.");
      // 3. Reversión: Si la API falla, restauramos el estado original de la UI
      setServices(originalServices);
    }
  };    

  const removeService = async (id: number) => {
    const originalServices = [...services];
    
    // 1. Eliminación optimista en la UI
    setServices(prevServices => prevServices.filter(service => service.id !== id));
    
    try {
      // 2. Llamada a la API en segundo plano
      await axios.delete(`/api/marketplace/services/${id}`, { withCredentials: true });
      toast.success("Servicio eliminado.");

    } catch (error) {
      console.error('Error al eliminar el servicio:', error);
      toast.error("No se pudo eliminar el servicio. Restaurando.");
      // 3. Reversión: Si la API falla, restauramos el servicio
      setServices(originalServices);
    }
  };




  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Cargando editor...</p>
        </div>
      </div>
    );
  }

  const planStatus = statusData?.planDetails?.planStatus || 'premium';
  const isPremium = planStatus === 'premium';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <Brush className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Editor de Marca QuHealthy</h1>
                <p className="text-sm text-gray-400">Crea una experiencia única para tus clientes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <Crown className="w-4 h-4" />
                Plan Premium
              </div>
              
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : showSaveSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? 'Guardando...' : showSaveSuccess ? '¡Guardado!' : 'Guardar Cambios'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Panel de Configuración */}
          <div className="lg:col-span-3 space-y-6">
            {/* Identidad Visual */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Identidad Visual</h2>
                    <p className="text-sm text-gray-400">Define la apariencia de tu marca</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Nombre de la tienda */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de tu Tienda
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleSettingsChange('storeName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Ej: Clínica Wellness Premium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL Personalizada
                    </label>
                    <div className="flex">
                      <span className="px-4 py-3 bg-gray-600 border border-r-0 border-gray-600 rounded-l-xl text-gray-400 text-sm">
                        quhealthy.com/
                      </span>
                      <input
                        type="text"
                        value={settings.storeSlug}
                        onChange={(e) => handleSettingsChange('storeSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-r-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="mi-clinica"
                      />
                    </div>
                  </div>
                </div>

                {/* Subida de archivos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    label="Logo de la Tienda"
                    currentUrl={settings.storeLogoUrl}
                    onChange={(url) => handleSettingsChange('storeLogoUrl', url)}
                  />
                  
                  <FileUpload
                    label="Imagen de Portada"
                    currentUrl={settings.bannerImageUrl}
                    onChange={(url) => handleSettingsChange('bannerImageUrl', url)}
                  />
                </div>

                {/* Colores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color Principal
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                        className="w-12 h-12 bg-transparent border-2 border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color Secundario
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingsChange('secondaryColor', e.target.value)}
                        className="w-12 h-12 bg-transparent border-2 border-gray-600 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingsChange('secondaryColor', e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Dominio personalizado - Premium */}
                <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Función Premium</span>
                  </div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dominio Personalizado
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={settings.customDomain}
                      onChange={(e) => handleSettingsChange('customDomain', e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                      placeholder="mi-clinica"
                      disabled={!isPremium}
                    />
                    <span className="px-4 py-3 bg-gray-600 border border-l-0 border-gray-600 rounded-r-xl text-gray-400 text-sm">
                      .quhealthy.com
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contenido */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Contenido y Multimedia</h2>
                    <p className="text-sm text-gray-400">Cuenta tu historia y conecta con tus clientes</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Descripción personalizada */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción de tu Práctica
                  </label>
                  <textarea
                    value={settings.customDescription}
                    onChange={(e) => handleSettingsChange('customDescription', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Cuéntanos sobre tu práctica, tu filosofía, tu experiencia y lo que te hace único. Esto ayudará a los clientes a conocerte mejor y generar confianza."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {settings.customDescription.length}/500 caracteres
                    </p>
                    <div className="flex gap-2">
                      <button className="text-xs text-gray-400 hover:text-white transition-colors">
                        <strong>Negrita</strong>
                      </button>
                      <button className="text-xs text-gray-400 hover:text-white transition-colors">
                        <em>Cursiva</em>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video de bienvenida - Premium */}
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Función Premium</span>
                  </div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video de Bienvenida
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={settings.videoUrl}
                      onChange={(e) => handleSettingsChange('videoUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="https://youtube.com/watch?v=..."
                      disabled={!isPremium}
                    />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Video className="w-4 h-4" />
                      <span>Sube un video personal para conectar mejor con tus clientes</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Servicios */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Configuración de Servicios</h2>
                      <p className="text-sm text-gray-400">Gestiona tu catálogo de servicios</p>
                    </div>
                  </div>
                  <button
                    onClick={addService}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Servicio
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2 cursor-grab">
                            <GripVertical className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                          </div>
                          <div className="flex-1" />
                          <button
                            onClick={() => removeService(service.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Nombre del Servicio</label>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => updateService(service.id, { name: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">Duración (min)</label>
                              <input
                                type="number"
                                value={service.duration}
                                onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">Precio ($)</label>
                              <input
                                type="number"
                                value={service.price}
                                onChange={(e) => updateService(service.id, { price: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-400 mb-1">Descripción</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => updateService(service.id, { description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Equipo - Business Plan */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Equipo de Trabajo</h2>
                      <p className="text-sm text-gray-400">Presenta a tu equipo profesional</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      Plan Business
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staff.map((member, index) => (
                    <motion.div
                      key={member.id}
                      className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-500">
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white text-sm">{member.name}</h3>
                          <p className="text-xs text-gray-400">{member.specialty}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300">{member.bio}</p>
                      <div className="flex gap-2 mt-3">
                        <button className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors">
                          Editar
                        </button>
                        <button className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-xl text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Agregar Miembro del Equipo
                </button>
              </div>
            </motion.div>

            {/* Configuración Avanzada */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Configuración Avanzada</h2>
                    <p className="text-sm text-gray-400">Opciones adicionales de personalización</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Tipografía - Premium */}
                <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-400">Función Premium</span>
                  </div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Estilo de Tipografía
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { key: 'modern', label: 'Moderna', preview: 'Aa' },
                      { key: 'classic', label: 'Clásica', preview: 'Aa' },
                      { key: 'elegant', label: 'Elegante', preview: 'Aa' }
                    ].map(({ key, label, preview }) => (
                      <button
                        key={key}
                        onClick={() => handleSettingsChange('typography', key)}
                        disabled={!isPremium}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          settings.typography === key
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        } ${!isPremium && 'opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="text-2xl font-bold mb-1">{preview}</div>
                        <div className="text-xs text-gray-400">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SEO y Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meta Descripción (SEO)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm"
                      placeholder="Descripción que aparecerá en Google (160 caracteres máximo)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Palabras Clave
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm"
                      placeholder="nutrición, bienestar, salud integral..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Vista Previa */}
          <div className="lg:col-span-2">
           <EnhancedMarketplacePreview 
  settings={settings} 
  services={services} 
  staff={staff} 
  viewMode={viewMode}
  setViewMode={setViewMode} // <-- AÑADE ESTA LÍNEA
/>
          </div>
        </div>
      </div>

      {/* Floating Action Button para móvil */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {loading ? (
            <Loader2 className="animate-spin w-6 h-6" />
          ) : showSaveSuccess ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Save className="w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 transform bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">¡Cambios guardados exitosamente!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    )}