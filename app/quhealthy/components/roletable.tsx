import React from "react";

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

interface RoleTableProps {
  roles: Role[];
  onDelete: (roleId: number) => void;
}

export default function RoleTable({ roles, onDelete }: RoleTableProps) {
  return (
    <div className="overflow-x-auto mb-8">
      <table className="table-auto w-full text-sm bg-gray-700 text-white rounded-md">
        <thead>
          <tr className="bg-teal-500 text-left">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Nombre del Rol</th>
            <th className="px-4 py-2">Permisos</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={role.id} className="border-b border-gray-600">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{role.name}</td>
              <td className="px-4 py-2">
                {role.permissions.length > 0
                  ? role.permissions.join(", ")
                  : "Sin permisos asignados"}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onDelete(role.id)}
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
