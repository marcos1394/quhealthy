import { useState, useEffect } from 'react';
import { intelligenceService } from '@/services/intelligence.service';
import { DistributionDTO, ExecutiveSummaryDTO, HealthcareMapDTO } from '@/types/intelligence';
import { useBIStore } from '@/store/intelligence.store';

export function useIntelligenceSummary() {
  const [data, setData] = useState<ExecutiveSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const filters = useBIStore((state) => state.filters);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    intelligenceService.getSummary(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters]);

  return { data, loading, error };
}

export function useIntelligenceAggregate(groupByOverride?: string) {
  const [data, setData] = useState<DistributionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const filters = useBIStore((state) => state.filters);
  const globalGroupBy = useBIStore((state) => state.groupBy);
  
  const groupBy = groupByOverride || globalGroupBy;

  const [prevDeps, setPrevDeps] = useState({ groupBy, filters });
  if (groupBy !== prevDeps.groupBy || filters !== prevDeps.filters) {
    setPrevDeps({ groupBy, filters });
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    intelligenceService.getAggregate(groupBy, filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [groupBy, filters]);

  return { data, loading, error };
}

export function useIntelligenceMap() {
  const [data, setData] = useState<HealthcareMapDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const filters = useBIStore((state) => state.filters);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    intelligenceService.getMap(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters]);

  return { data, loading, error };
}
