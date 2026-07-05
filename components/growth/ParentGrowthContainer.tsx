"use client";

import React, { useEffect, useState } from 'react';
import ParentGrowthView from './ParentGrowthView';
import { growthService } from '@/services/growth.service';
import { GrowthMeasurementRequest, GrowthMeasurementResponse } from '@/types/growth';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import GrowthMeasurementForm from './GrowthMeasurementForm';

interface ParentGrowthContainerProps {
  dependentId: number;
}

export function ParentGrowthContainer({ dependentId }: ParentGrowthContainerProps) {
  const [latestMeasurement, setLatestMeasurement] = useState<GrowthMeasurementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const history = await growthService.getConsumerHistory(dependentId);
      if (history && history.length > 0) {
        setLatestMeasurement(history[0]);
      } else {
        setLatestMeasurement(null);
      }
    } catch (error) {
      console.error("Error fetching growth history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [dependentId]);

  const handleSubmit = async (request: GrowthMeasurementRequest) => {
    setIsSubmitting(true);
    try {
      await growthService.recordMeasurementConsumer(dependentId, request);
      toast.success("Medición registrada con éxito.");
      fetchHistory();
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar la medición.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0a0a0a]">
        <QhSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <GrowthMeasurementForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>

      <ParentGrowthView latestMeasurement={latestMeasurement} />
    </div>
  );
}
