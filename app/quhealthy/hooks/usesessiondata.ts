import { useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface Session {
  loginTime: string;
  deviceName: ReactNode;
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActivity: string;
  browser: string;
  os: string;
}

interface UseSessionDataReturn {
  sessions: Session[];
  selectedSession: Session | null;
  loading: boolean;
  setSelectedSession: (session: Session | null) => void;
  fetchSessions: () => Promise<void>;
  handleSessionLogout: (sessionId: string) => Promise<void>;
  handleLogoutAllSessions: () => Promise<void>;
}

export default function useSessionData(): UseSessionDataReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all active sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/auth/sessions");
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logout a specific session
  const handleSessionLogout = async (sessionId: string) => {
    try {
      await axios.post(`http://localhost:3001/auth/logout-session`, { sessionId });
      setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  // Logout all sessions
  const handleLogoutAllSessions = async () => {
    try {
      await axios.post("http://localhost:3001/auth/logout-all");
      setSessions([]);
    } catch (error) {
      console.error("Error closing all sessions:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    selectedSession,
    loading,
    setSelectedSession,
    fetchSessions,
    handleSessionLogout,
    handleLogoutAllSessions,
  };
}
