"use client";

import React from "react";
import { UniversalCameraModal } from "@/components/ui/UniversalCameraModal";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  return (
    <UniversalCameraModal
      isOpen={isOpen}
      onClose={onClose}
      mode="product"
      title="Fotografiar Producto"
      description="Centra el producto o medicamento para su reconocimiento con IA"
      onCapture={(_file, base64) => onCapture(base64)}
    />
  );
}