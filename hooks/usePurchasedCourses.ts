import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ConsumerCourseService, PurchasedCourseDetails } from '@/services/consumer-course.service';

export const usePurchasedCourses = () => {
  const [courses, setCourses] = useState<PurchasedCourseDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ConsumerCourseService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching purchased courses:", error);
      toast.error("No se pudieron cargar tus cursos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    isLoading,
    fetchCourses,
  };
};
