import { useState, useEffect } from 'react';
import { intelligenceService } from '@/services/intelligence.service';
import { DistributionDTO, ExecutiveSummaryDTO, HealthcareMapDTO } from '@/types/intelligence';

export function useIntelligenceSummary() {
  const [data, setData] = useState<ExecutiveSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    intelligenceService.getSummary()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useIntelligenceStates() {
  const [data, setData] = useState<DistributionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    intelligenceService.getStates()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useIntelligenceInstitutions() {
  const [data, setData] = useState<DistributionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    intelligenceService.getInstitutions()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useIntelligenceMap(params?: { estado?: string; municipio?: string; institucion?: string; nivel?: string; tipo?: string }) {
  const [data, setData] = useState<HealthcareMapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    intelligenceService.getMap(params)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [params?.estado, params?.municipio, params?.institucion, params?.nivel, params?.tipo]);

  return { data, loading, error };
}
