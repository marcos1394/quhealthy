import { useState, useCallback } from 'react';
import axios from '@/lib/axios';

export interface ClinicStaffMember {
  id: number;
  providerId: number;
  email: string;
  name?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  permissions: string[];
}

export const useClinicStaff = () => {
  const [staff, setStaff] = useState<ClinicStaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ClinicStaffMember[]>('/api/auth/staff');
      setStaff(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching staff');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const inviteStaff = async (email: string, permissions: string[]) => {
    try {
      const response = await axios.post<ClinicStaffMember>('/api/auth/staff/invite', { email, permissions });
      setStaff((prev) => [...prev, response.data]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error inviting staff');
      return false;
    }
  };

  const updatePermissions = async (staffId: number, permissions: string[]) => {
    try {
      const response = await axios.put<ClinicStaffMember>(`/api/auth/staff/${staffId}/permissions`, { permissions });
      setStaff((prev) => prev.map((s) => (s.id === staffId ? response.data : s)));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating permissions');
      return false;
    }
  };

  const toggleStatus = async (staffId: number) => {
    try {
      const response = await axios.put<ClinicStaffMember>(`/api/auth/staff/${staffId}/toggle-status`);
      setStaff((prev) => prev.map((s) => (s.id === staffId ? response.data : s)));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error toggling status');
      return false;
    }
  };

  const revokeAccess = async (staffId: number) => {
    try {
      await axios.delete(`/api/auth/staff/${staffId}`);
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error revoking access');
      return false;
    }
  };

  return {
    staff,
    isLoading,
    error,
    fetchStaff,
    inviteStaff,
    updatePermissions,
    toggleStatus,
    revokeAccess,
  };
};
