import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FileSignature, Trash2, Clock, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { providerNotesService, ProviderPatientNoteDto } from "@/services/providerNotes.service";
import { handleApiError } from "@/lib/handleApiError";

interface ProviderInternalNotesTabProps {
  patientDirectoryId: number;
}

export function ProviderInternalNotesTab({ patientDirectoryId }: ProviderInternalNotesTabProps) {
  const t = useTranslations("DashboardPatientDetail");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const [notes, setNotes] = useState<ProviderPatientNoteDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await providerNotesService.getNotes(patientDirectoryId);
      setNotes(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [patientDirectoryId]);

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    setIsSubmitting(true);
    try {
      await providerNotesService.createNote(patientDirectoryId, { content: newNoteContent.trim() });
      toast.success(t("toast_note_created", { defaultValue: "Nota privada guardada." }));
      setNewNoteContent("");
      await fetchNotes();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await providerNotesService.deleteNote(patientDirectoryId, noteId);
      toast.success(t("toast_note_deleted", { defaultValue: "Nota eliminada." }));
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505] p-6 gap-6">
      {/* Caja de Nueva Nota */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
            <FileSignature className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {t("internal_notes_title", { defaultValue: "Notas Privadas" })}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("internal_notes_desc", { defaultValue: "Solo visibles para ti. No forman parte del expediente clínico del paciente." })}
            </p>
          </div>
        </div>

        <Textarea
          placeholder={t("internal_notes_placeholder", { defaultValue: "Escribe tus observaciones confidenciales aquí..." })}
          className="min-h-[120px] resize-y text-sm bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-indigo-500 rounded-2xl"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleCreateNote}
            disabled={isSubmitting || !newNoteContent.trim()}
            className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm border-0 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <QhSpinner className="text-white" size="sm" />
            ) : (
              <PlusCircle className="w-4 h-4" strokeWidth={2} />
            )}
            {t("save_note", { defaultValue: "Guardar Nota" })}
          </Button>
        </div>
      </div>

      {/* Historial de Notas */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <QhSpinner size="md" className="text-indigo-500" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xs font-medium text-gray-400">
            {t("no_internal_notes", { defaultValue: "No hay notas privadas para este paciente." })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="text-[11px] font-bold font-mono">
                      {format(new Date(note.createdAt), "dd MMM yyyy, HH:mm", { locale: dateLocale })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
