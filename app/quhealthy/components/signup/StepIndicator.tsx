"use client";
import React from 'react';

export const StepIndicator: React.FC<{ step: number }> = ({ step }) => (
  <div className="mb-8 flex justify-center">
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === 1 ? "bg-purple-500" : "bg-purple-500/20"}`}>1</div>
      <div className={`w-16 h-1 ${step === 2 ? "bg-purple-500" : "bg-purple-500/20"}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === 2 ? "bg-purple-500" : "bg-purple-500/20"}`}>2</div>
    </div>
  </div>
);