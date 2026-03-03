
// src/services/chat.service.ts
import axiosInstance from '@/lib/axios';
import { Conversation, ChatMessage } from '@/types/chat';

// Ajusta este prefijo según tu API Gateway o proxy en Next.js
// Basado en tu backend: @RequestMapping("/v1/conversations")
const BASE_URL = '/api/v1/conversations'; 

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/**
 * Servicio encargado de la gestión del historial de Mensajería Clínica
 * (Bandeja de entrada y carga de historial previo).
 */
export const chatService = {
  
  /**
   * 📥 Obtiene el Inbox del usuario autenticado (Paciente o Doctor)
   * Retorna la lista de conversaciones ordenadas por el mensaje más reciente.
   */
  getInbox: async (): Promise<Conversation[]> => {
    const response = await axiosInstance.get<Conversation[]>(`${BASE_URL}`);
    return response.data;
  },

  /**
   * 💬 Inicia o recupera una conversación entre un Paciente y un Proveedor.
   * Útil cuando se pulsa "Enviar mensaje" desde el perfil de un médico.
   */
  startConversation: async (patientId: number, providerId: number): Promise<Conversation> => {
    const response = await axiosInstance.post<Conversation>(
      `${BASE_URL}`, 
      null, // Body vacío, usamos query params según el controlador Spring
      { 
        params: { patientId, providerId } 
      }
    );
    return response.data;
  },

  /**
   * 📜 Obtiene el historial paginado de mensajes de una conversación.
   * Ideal para implementar scroll infinito (Infinite Scroll).
   */
  getMessageHistory: async (conversationId: string, page = 0, size = 50): Promise<PageResponse<ChatMessage>> => {
    const response = await axiosInstance.get<PageResponse<ChatMessage>>(
      `${BASE_URL}/${conversationId}/messages`, 
      {
        params: {
          page,
          size,
          sort: 'createdAt,desc'
        }
      }
    );
    return response.data;
  }
};