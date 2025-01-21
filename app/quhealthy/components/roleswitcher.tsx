import React, { useState } from "react";
import axios from "axios";

export default function RoleSwitcher() {
  const [role, setRole] = useState("patient"); // Rol actual
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleRoleChange = async (newRole: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/change-role", { role: newRole });
      if (response.data.success) {
        setRole(newRole);
        setSuccess("Rol cambiado exitosamente.");
      } else {
        setError("No se pudo cambiar el rol. Intenta nuevamente.");
      }
    } catch (err) {
      setError("Error al cambiar el rol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Rol Actual: {role}</h3>
      <button
        onClick={() => handleRoleChange(role === "patient" ? "provider" : "patient")}
        className="bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600"
        disabled={loading}
      >
        {loading ? "Cambiando..." : `Cambiar a ${role === "patient" ? "Proveedor" : "Paciente"}`}
      </button>
      {success && <p className="mt-2 text-green-500">{success}</p>}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
