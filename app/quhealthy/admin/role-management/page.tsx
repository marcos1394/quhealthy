"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Shield,
  UserPlus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  User,
  Lock
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

const rolesData = [
  { id: 1, name: "Paciente", permissions: ["Ver servicios", "Agendar citas"] },
  { id: 2, name: "Proveedor", permissions: ["Gestionar citas", "Ver historial"] },
  { id: 3, name: "Administrador", permissions: ["Gestionar roles", "Modificar configuración"] },
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(rolesData);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3001/admin/roles");
        setRoles(response.data.roles);
        toast.success("Roles cargados exitosamente", {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />
        });
      } catch (err) {
        console.error(err);
        toast.error("No se pudieron cargar los roles", {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/admin/roles", {
        name: newRole,
        permissions,
      });

      if (response.data.success) {
        setRoles([...roles, response.data.role]);
        setNewRole("");
        setPermissions([]);
        toast.success("Rol agregado exitosamente", {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo agregar el rol", {
        icon: <X className="w-5 h-5 text-red-400" />
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3001/admin/roles/${roleToDelete.id}`);
      setRoles(roles.filter((role) => role.id !== roleToDelete.id));
      setIsDeleteModalVisible(false);
      toast.success("Rol eliminado exitosamente", {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el rol", {
        icon: <X className="w-5 h-5 text-red-400" />
      });
    } finally {
      setLoading(false);
      setRoleToDelete(null);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Shield className="w-8 h-8" />
            Gestión de Roles
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Roles List Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-semibold text-teal-400 mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6" />
                Roles Existentes
              </h2>

              <div className="space-y-4">
                {roles.map((role) => (
                  <motion.div
                    key={role.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-white">{role.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.map((permission, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-teal-500/20 text-teal-300 text-sm rounded-full"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => confirmDeleteRole(role)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Add Role Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-semibold text-teal-400 mb-6 flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Agregar Nuevo Rol
              </h2>

              <form onSubmit={handleAddRole} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre del Rol
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      placeholder="Ejemplo: Moderador"
                      required
                    />
                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Permisos
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={permissions.join(", ")}
                      onChange={(e) => setPermissions(e.target.value.split(",").map((p) => p.trim()))}
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      placeholder="Ejemplo: Gestionar usuarios, Ver reportes"
                      required
                    />
                    <Settings className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  <Plus className="w-5 h-5" />
                  {loading ? "Agregando..." : "Agregar Rol"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <AlertCircle className="w-16 h-16 text-red-400" />
                  </motion.div>
                </div>
                
                <h3 className="text-2xl font-bold text-red-400">
                  Confirmar Eliminación
                </h3>
                
                <p className="text-gray-300">
                  ¿Estás seguro que deseas eliminar el rol "{roleToDelete?.name}"?
                  Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-4 justify-center mt-6">
                  <motion.button
                    onClick={() => setIsDeleteModalVisible(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteRole}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleManagement;