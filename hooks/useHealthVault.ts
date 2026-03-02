"use client";

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { ConsumerDocument } from '@/types/healthVault';
import { healthVaultService } from '@/services/healthVault.service'; // Asegúrate de que la ruta sea correcta

export function useHealthVault() {
    const t = useTranslations('HealthVault.Notifications');
    
    const [documents, setDocuments] = useState<ConsumerDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // 📥 1. Cargar documentos
    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await healthVaultService.getDocuments();
            setDocuments(data);
        } catch (error: any) {
            console.error('Error fetching vault docs:', error);
            toast.error(t('error_fetch', { defaultValue: 'No pudimos cargar tus documentos seguros.' }));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // 📤 2. Subir documento
    const uploadDocument = async (file: File, documentType: string = 'GENERAL') => {
        setIsUploading(true);
        
        // Validación básica de tamaño (ej. max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.warn(t('error_size', { defaultValue: 'El archivo excede el límite de 10MB.' }));
            setIsUploading(false);
            return null;
        }

        try {
            toast.info(t('info_analyzing', { defaultValue: 'Subiendo y analizando con IA...' }));
            
            const newDoc = await healthVaultService.uploadDocument(file, documentType);
            
            // Actualizamos la UI inmediatamente agregando el doc al inicio
            setDocuments(prev => [newDoc, ...prev]);
            
            if (newDoc.aiStatus === 'PROCESSED') {
                toast.success(t('success_upload_ai', { defaultValue: 'Documento procesado exitosamente por IA.' }));
            } else {
                toast.success(t('success_upload', { defaultValue: 'Documento encriptado y guardado.' }));
            }
            
            return newDoc;
        } catch (error: any) {
            console.error('Error uploading document:', error);
            toast.error(t('error_upload', { defaultValue: 'Hubo un error al subir el archivo.' }));
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // 🔗 3. Ver/Descargar documento (Presigned URL)
    const viewDocument = async (documentId: string) => {
        try {
            const url = await healthVaultService.getDocumentUrl(documentId);
            // Abrimos la URL temporal segura en una nueva pestaña
            window.open(url, '_blank');
        } catch (error: any) {
            console.error('Error generating presigned URL:', error);
            toast.error(t('error_url', { defaultValue: 'El enlace seguro expiró o no es válido.' }));
        }
    };

    return {
        documents,
        isLoading,
        isUploading,
        fetchDocuments,
        uploadDocument,
        viewDocument
    };
}