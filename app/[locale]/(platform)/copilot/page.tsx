'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHealthOSStore } from '@/stores/useHealthOSStore';
import { healthOSService } from '@/services/healthOS.service';
import { WidgetRenderer } from '@/components/engine/WidgetRenderer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CopilotPage() {
  const [inputText, setInputText] = useState('');
  const { 
    conversation, 
    streamingState, 
    addUserMessage, 
    updateAssistantStream, 
    finalizeStream 
  } = useHealthOSStore();

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    
    // 1. Add user message
    addUserMessage(text);

    try {
      // 2. Call backend (simulate streaming by manually setting processing -> streaming -> complete)
      const response = await healthOSService.sendIntent(text);
      
      // Simulate network delay and streaming
      updateAssistantStream({ text: 'Analizando tu petición...' });
      
      setTimeout(() => {
        // En una implementación real de SSE, los widgets llegarían en chunks
        updateAssistantStream(response);
        finalizeStream();
      }, 1500);

    } catch (error) {
      console.error('Error fetching intent:', error);
      updateAssistantStream({ text: 'Hubo un error procesando tu solicitud.' });
      finalizeStream();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full p-4 gap-4">
      <div className="flex-1 border rounded-lg bg-background/50 backdrop-blur shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-card flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg">Health OS Copilot</h1>
            <p className="text-xs text-muted-foreground">Tu asistente de salud inteligente</p>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {conversation.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
                <Bot className="w-12 h-12 mb-4 opacity-50" />
                <p>Hola Marcos, ¿Cómo puedo ayudarte hoy?</p>
              </div>
            )}
            
            {conversation.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.content && (
                    <div className={`px-4 py-2 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                  
                  {msg.response?.text && (
                    <div className="px-4 py-2 rounded-2xl bg-muted text-foreground rounded-tl-sm mb-2">
                      {msg.response.text}
                    </div>
                  )}

                  {msg.response?.widgets && msg.response.widgets.length > 0 && (
                    <div className="mt-2 w-full">
                      <WidgetRenderer widgets={msg.response.widgets} />
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-1 border">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {streamingState === 'processing' && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1 border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="px-4 py-2 rounded-2xl bg-muted text-foreground rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input 
              placeholder="Buscar un médico, programar una cita, revisar mis resultados..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streamingState !== 'idle'}
              className="flex-1 rounded-full px-4"
            />
            <Button 
              onClick={handleSend} 
              disabled={!inputText.trim() || streamingState !== 'idle'}
              className="rounded-full w-10 h-10 p-0 shrink-0"
            >
              {streamingState !== 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
