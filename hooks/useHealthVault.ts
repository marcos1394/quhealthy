"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { ConsumerDocument, VaultFolder } from '@/types/healthVault';
import { healthVaultService } from '@/services/healthVault.service';

export function useHealthVault() {
    const t = useTranslations('HealthVault.Notifications');
    
    const [documents, setDocuments] = useState<ConsumerDocument[]>([]);
    const [folders, setFolders] = useState<VaultFolder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // 📥 1. Cargar documentos y carpetas
    const fetchDocuments = useCallback(async (dependentId?: number) => {
        setIsLoading(true);
        try {
            const docsData = await healthVaultService.getDocuments();
            setDocuments(docsData);
            
            const foldersData = await healthVaultService.getFolders(dependentId);
            setFolders(foldersData);
        } catch (error: any) {
            console.error('Error fetching vault data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // 📤 2. Subir documento
    const uploadDocument = async (file: File, title?: string, documentType: string = 'GENERAL', dependentId?: number, folderId?: string) => {
        setIsUploading(true);
        
        // Validación básica de tamaño (ej. max 10MB)
        if (file.size > 20 * 1024 * 1024) {
            toast.warn(t('error_size', { defaultValue: 'El archivo excede el límite de 10MB.' }));
            setIsUploading(false);
            return null;
        }

        try {
            toast.info(t('info_analyzing', { defaultValue: 'Subiendo y analizando con IA...' }));
            
            const newDoc = await healthVaultService.uploadDocument(file, title, documentType, dependentId, folderId);
            
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
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // 📝 3. Crear nota
    const createNote = async (title: string, noteContent: string, dependentId?: number, folderId?: string) => {
        setIsUploading(true);
        try {
            const newNote = await healthVaultService.createNote(title, noteContent, dependentId, folderId);
            setDocuments(prev => [newNote, ...prev]);
            toast.success(t('success_note', { defaultValue: 'Nota guardada exitosamente.' }));
            return newNote;
        } catch (error: any) {
            console.error('Error creating note:', error);
            toast.error(t('error_note', { defaultValue: 'Ocurrió un error al guardar la nota.' }));
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // 🔗 4. Ver/Descargar documento (Presigned URL)
    const viewDocument = async (documentId: string) => {
        try {
            const url = await healthVaultService.getDocumentUrl(documentId);
            // Abrimos la URL temporal segura en una nueva pestaña
            window.open(url, '_blank');
        } catch (error: any) {
            console.error('Error generating presigned URL:', error);
        }
    };

    // ✏️ 5. Actualizar documento
    const updateDocument = async (
        documentId: string, 
        data: { title?: string; noteContent?: string; documentType?: string; aiExtractedData?: any; folderId?: string | null; clearFolder?: boolean }
    ) => {
        try {
            const updatedDoc = await healthVaultService.updateDocument(documentId, data);
            
            // Actualizar el estado local sin recargar
            setDocuments(prev => prev.map(doc => doc.id === documentId ? updatedDoc : doc));
            
            toast.success(t('success_update', { defaultValue: 'Documento actualizado correctamente.' }));
            return updatedDoc;
        } catch (error: any) {
            console.error('Error updating document:', error);
            toast.error(t('error_update', { defaultValue: 'No se pudo actualizar el documento.' }));
            return null;
        }
    };

    // 🧠 6. Generar Panorama Clínico
    const generatePanorama = async (dependentId?: number) => {
        try {
            return await healthVaultService.generatePanorama(dependentId);
        } catch (error: any) {
            console.error('Error generating panorama:', error);
            toast.error(t('error_panorama', { defaultValue: 'Error al generar el panorama clínico.' }));
            return null;
        }
    };

    // 🗑️ 7. Eliminar documento
    const deleteDocument = async (documentId: string) => {
        try {
            await healthVaultService.deleteDocument(documentId);
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            toast.success(t('success_delete', { defaultValue: 'Documento eliminado.' }));
            return true;
        } catch (error: any) {
            console.error('Error deleting document:', error);
            toast.error(t('error_delete', { defaultValue: 'No se pudo eliminar el documento.' }));
            return false;
        }
    };

    // 🗂️ 8. Gestión de Carpetas
    const createFolder = async (name: string, parentFolderId?: string, dependentId?: number) => {
        try {
            const newFolder = await healthVaultService.createFolder(name, parentFolderId, dependentId);
            setFolders(prev => [...prev, newFolder]);
            toast.success('Carpeta creada exitosamente.');
            return newFolder;
        } catch (error: any) {
            console.error('Error creating folder:', error);
            toast.error('Error al crear la carpeta.');
            return null;
        }
    };

    const renameFolder = async (folderId: string, name: string) => {
        try {
            const updatedFolder = await healthVaultService.renameFolder(folderId, name);
            setFolders(prev => prev.map(f => f.id === folderId ? updatedFolder : f));
            toast.success('Carpeta renombrada.');
            return updatedFolder;
        } catch (error: any) {
            console.error('Error renaming folder:', error);
            toast.error('Error al renombrar la carpeta.');
            return null;
        }
    };

    const deleteFolder = async (folderId: string) => {
        try {
            await healthVaultService.deleteFolder(folderId);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            // También deberíamos quitar o actualizar documentos que estaban dentro si el backend los elimina/mueve.
            // Lo más seguro es refrescar todo:
            fetchDocuments();
            toast.success('Carpeta eliminada.');
            return true;
        } catch (error: any) {
            console.error('Error deleting folder:', error);
            toast.error('No se pudo eliminar la carpeta.');
            return false;
        }
    };

    return {
        documents,
        folders,
        isLoading,
        isUploading,
        fetchDocuments,
        uploadDocument,
        createNote,
        viewDocument,
        updateDocument,
        generatePanorama,
        deleteDocument,
        createFolder,
        renameFolder,
        deleteFolder
    };
}