// hooks/useBillingHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/services/payment.service';
import { TransactionHistory } from '@/types/payment';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useBillingHistory = () => {
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchHistory = useCallback(async (pageNumber: number = 0) => {
    setIsLoading(true);
    try {
      const data = await paymentService.getBillingHistory(pageNumber);
      setTransactions(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (error) {
      console.error("❌ Error al cargar historial de facturación:", error);
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar la primera página al montar el componente
  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  return {
    transactions,
    isLoading,
    page,
    totalPages,
    totalElements,
    fetchPage: fetchHistory, // Para botones de "Siguiente" o "Anterior"
    refetch: () => fetchHistory(page) // Para recargar la página actual
  };
};