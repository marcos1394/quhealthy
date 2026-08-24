import useSWR from 'swr';
import { reviewService } from '@/services/review.service';
import { ProviderReviewStats, Review } from '@/types/reviews';
import { PageResponse } from '@/services/review.service';

export function useProviderReviews(providerId: number | undefined, page = 0, size = 10) {
  const {
    data: reviewsResponse,
    error: reviewsError,
    isLoading: isReviewsLoading,
    mutate: mutateReviews,
  } = useSWR<PageResponse<Review>>(
    providerId ? `/reviews/provider/${providerId}?page=${page}&size=${size}` : null,
    () => reviewService.getProviderReviews(providerId!, page, size),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const {
    data: stats,
    error: statsError,
    isLoading: isStatsLoading,
    mutate: mutateStats,
  } = useSWR<ProviderReviewStats>(
    providerId ? `/reviews/provider/${providerId}/stats` : null,
    () => reviewService.getProviderStats(providerId!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    reviewsResponse,
    stats,
    isLoading: isReviewsLoading && !reviewsResponse,
    isReviewsLoading,
    isStatsLoading,
    isError: reviewsError || statsError,
    mutate: () => {
      mutateReviews();
      mutateStats();
    },
  };
}

