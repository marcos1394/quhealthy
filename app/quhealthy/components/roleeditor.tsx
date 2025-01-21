import React, { useState } from "react";

interface RoleEditorProps {
  onSubmit: (name: string, permissions: string[]) => void;
}

export default function RoleEditor({ onSubmit }: RoleEditorProps) {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError("El nombre del rol no puede estar vacío.");
      return;
    }
    if (permissions.length === 0) {
      setError("Debe agregar al menos un permiso.");
      return;
    }

    onSubmit(roleName, permissions);
    setRoleName("");
    setPermissions([]);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500 text-white py-2 px-4 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm mb-2">Nombre del Rol</label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="Ejemplo: Moderador"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-teal-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-2">Permisos</label>
        <input
          type="text"
          value={permissions.join(", ")}
          onChange={(e) =>
            setPermissions(e.target.value.split(",").map((p) => p.trim()))
          }
          placeholder="Ejemplo: Gestionar usuarios, Ver reportes"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:ring-2 focus:ring-teal-400"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-6 rounded font-semibold"
      >
        Guardar Rol
      </button>
    </form>
  );
}
