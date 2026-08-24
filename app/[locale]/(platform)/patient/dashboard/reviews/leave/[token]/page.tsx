"use client";

import React, { use } from "react";
import { useLeaveReview } from "@/hooks/useLeaveReview";

import { ReviewLoader, ReviewError } from "@/components/reviews/ReviewStates";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export default function LeaveReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // 1. Extraemos el token de la URL desencapsulando la promesa (Estándar App Router)
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // 2. Inyectamos nuestro Hook de Lógica
  const {
    isValidating,
    validationError,
    rating,
    setRating,
    ratingPunctuality,
    setRatingPunctuality,
    ratingCommunication,
    setRatingCommunication,
    ratingKnowledge,
    setRatingKnowledge,
    ratingFacilities,
    setRatingFacilities,
    isAnonymous,
    setIsAnonymous,
    comment,
    setComment,
    isSubmitting,
    submitReview,
    context,
  } = useLeaveReview(token);

  // 3. Renderizado Condicional de Estados
  if (isValidating) {
    return <ReviewLoader />;
  }

  if (validationError) {
    return <ReviewError message={validationError} />;
  }

  // 4. Renderizado del Contenedor Principal (Homologado a la paleta QuHealthy)
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 flex justify-center items-center py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-2xl w-full">
        <ReviewForm
          entityType={context?.entityType}
          rating={rating}
          setRating={setRating}
          ratingPunctuality={ratingPunctuality}
          setRatingPunctuality={setRatingPunctuality}
          ratingCommunication={ratingCommunication}
          setRatingCommunication={setRatingCommunication}
          ratingKnowledge={ratingKnowledge}
          setRatingKnowledge={setRatingKnowledge}
          ratingFacilities={ratingFacilities}
          setRatingFacilities={setRatingFacilities}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          comment={comment}
          setComment={setComment}
          onSubmit={submitReview}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}