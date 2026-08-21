"use client";

import React from "react";
import {
  UniversalCameraModal,
  UniversalCameraModalProps,
} from "@/components/ui/UniversalCameraModal";

interface SelfieCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, base64?: string) => void;
  title?: string;
  description?: string;
}

export const SelfieCameraModal: React.FC<SelfieCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  description,
}) => {
  return (
    <UniversalCameraModal
      isOpen={isOpen}
      onClose={onClose}
      onCapture={(file, base64) => onCapture(file, base64)}
      mode="selfie"
      title={title}
      description={description}
    />
  );
};
