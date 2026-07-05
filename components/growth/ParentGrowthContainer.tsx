"use client";

import React, { useEffect, useState } from 'react';
import ParentGrowthView from './ParentGrowthView';
import { growthService } from '@/services/growth.service';
import { GrowthMeasurementResponse } from '@/types/growth';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface ParentGrowthContainerProps {
  dependentId: number;
}

export function ParentGrowthContainer({ dependentId }: ParentGrowthContainerProps) {
  const [latestMeasurement, setLatestMeasurement] = useState<GrowthMeasurementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const history = await growthService.getConsumerHistory(dependentId);
        if (isMounted && history && history.length > 0) {
          setLatestMeasurement(history[0]);
        } else if (isMounted) {
          setLatestMeasurement(null);
        }
      } catch (error) {
        console.error("Error fetching growth history:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [dependentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0a0a0a]">
        <QhSpinner size="sm" />
      </div>
    );
  }

  return <ParentGrowthView latestMeasurement={latestMeasurement} />;
}
