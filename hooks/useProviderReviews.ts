import useSWR from 'swr';
import { reviewService } from '@/services/review.service';

export function useProviderReviews(providerId: number | undefined, page = 0, size = 10) {
  const { data, error, isLoading } = useSWR(
    providerId ? `/reviews/provider/${providerId}?page=${page}&size=${size}` : null,
    () => reviewService.getProviderReviews(providerId!, page, size),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    reviewsResponse: data,
    isLoading,
    isError: error,
  };
}
