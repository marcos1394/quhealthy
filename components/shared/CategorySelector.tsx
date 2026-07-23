"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/no-pass-data-to-parent */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Star,
  Search,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import {
  CategoryResponse,
  SubCategoryResponse,
  TagResponse,
} from "@/types/onboarding";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { handleApiError } from "@/lib/handleApiError";

interface CategorySelectorProps {
  categories: CategoryResponse[];
  tags: TagResponse[];
  selectedCategoryId?: number;
  selectedSubCategoryId?: number;
  selectedTagIds?: number[];
  onGetSubCategories: (catId: number) => Promise<SubCategoryResponse[]>;
  onSelectionChange: (catId: number, subId: number, tagIds: number[]) => void;
  error?: string | null;
  onCreateCategory?: (name: string) => Promise<CategoryResponse | null>;
  onCreateSubCategory?: (
    categoryId: number,
    name: string,
  ) => Promise<SubCategoryResponse | null>;
  onCreateTag?: (name: string) => Promise<TagResponse | null>;
}

const EMPTY_TAGS: number[] = [];

export default function CategorySelector({
  categories,
  tags,
  selectedCategoryId,
  selectedSubCategoryId,
  selectedTagIds = EMPTY_TAGS,
  onGetSubCategories,
  onSelectionChange,
  error,
  onCreateCategory,
  onCreateSubCategory,
  onCreateTag,
}: CategorySelectorProps) {
  const [
    {
      subCategories,
      isLoadingSub,
      tagSearchQuery,
      openCat,
      openSub,
      catSearchQuery,
      subSearchQuery,
      isCreatingItem,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_SUBCATEGORIES":
          return {
            ...state,
            subCategories:
              typeof action.payload === "function"
                ? action.payload(state.subCategories)
                : action.payload,
          };
        case "SET_ISLOADINGSUB":
          return {
            ...state,
            isLoadingSub:
              typeof action.payload === "function"
                ? action.payload(state.isLoadingSub)
                : action.payload,
          };
        case "SET_TAGSEARCHQUERY":
          return {
            ...state,
            tagSearchQuery:
              typeof action.payload === "function"
                ? action.payload(state.tagSearchQuery)
                : action.payload,
          };
        case "SET_OPENCAT":
          return {
            ...state,
            openCat:
              typeof action.payload === "function"
                ? action.payload(state.openCat)
                : action.payload,
          };
        case "SET_OPENSUB":
          return {
            ...state,
            openSub:
              typeof action.payload === "function"
                ? action.payload(state.openSub)
                : action.payload,
          };
        case "SET_CATSEARCHQUERY":
          return {
            ...state,
            catSearchQuery:
              typeof action.payload === "function"
                ? action.payload(state.catSearchQuery)
                : action.payload,
          };
        case "SET_SUBSEARCHQUERY":
          return {
            ...state,
            subSearchQuery:
              typeof action.payload === "function"
                ? action.payload(state.subSearchQuery)
                : action.payload,
          };
        case "SET_ISCREATINGITEM":
          return {
            ...state,
            isCreatingItem:
              typeof action.payload === "function"
                ? action.payload(state.isCreatingItem)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      subCategories: [],
      isLoadingSub: false,
      tagSearchQuery: "",
      openCat: false,
      openSub: false,
      catSearchQuery: "",
      subSearchQuery: "",
      isCreatingItem: false,
    },
  );

  const setSubCategories = (val: any) =>
    dispatch({ type: "SET_SUBCATEGORIES", payload: val });
  const setIsLoadingSub = (val: any) =>
    dispatch({ type: "SET_ISLOADINGSUB", payload: val });
  const setTagSearchQuery = (val: any) =>
    dispatch({ type: "SET_TAGSEARCHQUERY", payload: val });
  const setOpenCat = (val: any) =>
    dispatch({ type: "SET_OPENCAT", payload: val });
  const setOpenSub = (val: any) =>
    dispatch({ type: "SET_OPENSUB", payload: val });
  const setCatSearchQuery = (val: any) =>
    dispatch({ type: "SET_CATSEARCHQUERY", payload: val });
  const setSubSearchQuery = (val: any) =>
    dispatch({ type: "SET_SUBSEARCHQUERY", payload: val });
  const setIsCreatingItem = (val: any) =>
    dispatch({ type: "SET_ISCREATINGITEM", payload: val });

  // iOS Safari touch tracking
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEndCat = (e: React.TouchEvent, id: number) => {
    if (touchStartY.current !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = Math.abs(touchStartY.current - touchEndY);
      if (diff < 5) {
        e.preventDefault();
        handleCatChange(id);
        setTimeout(() => setOpenCat(false), 50);
      }
    }
  };

  const handleTouchEndSub = (e: React.TouchEvent, id: number) => {
    if (touchStartY.current !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = Math.abs(touchStartY.current - touchEndY);
      if (diff < 5) {
        e.preventDefault();
        handleSubChange(id);
        setTimeout(() => setOpenSub(false), 50);
      }
    }
  };

  const loadInitialSubCategories = useCallback(async () => {
    if (selectedCategoryId && selectedCategoryId > 0) {
      setIsLoadingSub(true);
      const subs = await onGetSubCategories(selectedCategoryId);
      setSubCategories(subs);
      setIsLoadingSub(false);
    }
  }, [selectedCategoryId, onGetSubCategories]);

  useEffect(() => {
    loadInitialSubCategories();
  }, [loadInitialSubCategories]);

  const handleCatChange = async (catId: number) => {
    if (catId === selectedCategoryId) return;
    setIsLoadingSub(true);
    const categoryName = categories.find((c) => c.id === catId)?.name;
    onSelectionChange(catId, 0, selectedTagIds);
    try {
      const subs = await onGetSubCategories(catId);
      setSubCategories(subs);
      if (categoryName) {
        toast.success(`Categoría configurada: ${categoryName}`);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoadingSub(false);
    }
  };

  const handleSubChange = (subId: number) => {
    const subName = subCategories.find((s: any) => s.id === subId)?.name;
    onSelectionChange(selectedCategoryId || 0, subId, selectedTagIds);
    if (subName) {
      toast.success(`Enfoque seleccionado: ${subName}`);
    }
  };

  const handleTagToggle = (tagId: number) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onSelectionChange(
      selectedCategoryId || 0,
      selectedSubCategoryId || 0,
      newTags,
    );
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()),
  );

  const completionSteps = [
    { label: "Categoría Principal", completed: (selectedCategoryId || 0) > 0 },
    {
      label: "Enfoque Específico",
      completed: (selectedSubCategoryId || 0) > 0,
    },
    { label: "Etiquetas Especializadas", completed: selectedTagIds.length > 0 },
  ];
  const progress =
    (completionSteps.filter((s) => s.completed).length / 3) * 100;

  // ── ESTADO INICIAL / ESPERANDO CATEGORÍAS ───────────────────────────────
  if (categories.length === 0 && !selectedCategoryId && !error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center font-sans"
      >
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400 mb-3" />
        <p className="text-xs font-bold text-gray-900 dark:text-white">
          Cargando catálogo de disciplinas...
        </p>
        <p className="text-[11px] font-medium text-gray-400 mt-1">
          Selecciona previamente tu sector para desplegar las categorías disponibles.
        </p>
      </motion.div>
    );
  }

  // ── ESTADO DE ERROR ───────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-6 shadow-sm space-y-4 font-sans">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 shrink-0">
            <AlertCircle className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Error al consultar catálogo
            </h3>
            <p className="text-xs font-medium text-gray-500 leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-9 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── RENDERIZADO PRINCIPAL ──────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-8 font-sans transition-all">
      
      {/* ── BANDA DE PROGRESO DE CONFIGURACIÓN ───────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            <span>Configuración de Especialidad</span>
          </h3>

          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Linea de Progreso */}
        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-emerald-600 rounded-full"
          />
        </div>

        {/* Indicadores de Paso */}
        <div className="flex flex-wrap gap-3 pt-1">
          {completionSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold transition-all",
                step.completed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                  step.completed
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                )}
              >
                {step.completed ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PASO 1: CATEGORÍA PRINCIPAL ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span>Categoría Médica / Disciplina Principal *</span>
          </label>

          {(selectedCategoryId || 0) > 0 && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          )}
        </div>

        <Popover open={openCat} onOpenChange={setOpenCat}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={openCat}
              disabled={categories.length === 0}
              className={cn(
                "w-full h-11 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between shadow-sm",
                "bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                (selectedCategoryId || 0) > 0 && "border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10"
              )}
            >
              <span className="truncate">
                {selectedCategoryId && selectedCategoryId > 0
                  ? categories.find((cat) => cat.id === selectedCategoryId)?.name
                  : "Selecciona una categoría..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden font-sans"
            align="start"
            sideOffset={6}
          >
            <Command className="bg-white dark:bg-[#0a0a0a]">
              <CommandInput
                placeholder="Buscar categoría..."
                className="h-10 text-xs font-semibold"
                value={catSearchQuery}
                onValueChange={setCatSearchQuery}
              />
              <CommandList className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                <CommandEmpty className="py-4 text-center text-xs flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-400">No se encontraron categorías.</span>
                  {onCreateCategory && catSearchQuery && (
                    <button
                      type="button"
                      disabled={isCreatingItem}
                      onClick={async () => {
                        setIsCreatingItem(true);
                        const newCat = await onCreateCategory(catSearchQuery);
                        if (newCat) {
                          handleCatChange(newCat.id);
                          setOpenCat(false);
                          setCatSearchQuery("");
                        }
                        setIsCreatingItem(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                    >
                      {isCreatingItem ? (
                        <QhSpinner size="sm" className="text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      )}
                      <span>Crear "{catSearchQuery}"</span>
                    </button>
                  )}
                </CommandEmpty>

                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      onSelect={() => {
                        handleCatChange(cat.id);
                        setOpenCat(false);
                      }}
                      className="cursor-pointer p-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      {selectedCategoryId === cat.id && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* ── PASO 2: ENFOQUE ESPECÍFICO (SUBCATEGORÍA) ────────────────────── */}
      <AnimatePresence>
        {(selectedCategoryId || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5 overflow-hidden pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Enfoque Específico / Subespecialidad *</span>
              </label>

              {(selectedSubCategoryId || 0) > 0 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              )}
            </div>

            <Popover open={openSub} onOpenChange={setOpenSub}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={openSub}
                  disabled={isLoadingSub}
                  className={cn(
                    "w-full h-11 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between shadow-sm",
                    "bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                    (selectedSubCategoryId || 0) > 0 && "border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/10"
                  )}
                >
                  <span className="truncate flex items-center gap-2">
                    {isLoadingSub ? (
                      <>
                        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs text-gray-400 font-normal">Sincronizando subcategorías...</span>
                      </>
                    ) : selectedSubCategoryId && selectedSubCategoryId > 0 ? (
                      subCategories.find((sub: any) => sub.id === selectedSubCategoryId)?.name
                    ) : (
                      "Selecciona un enfoque o área específica..."
                    )}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden font-sans"
                align="start"
                sideOffset={6}
              >
                <Command className="bg-white dark:bg-[#0a0a0a]">
                  <CommandInput
                    placeholder="Buscar subespecialidad..."
                    className="h-10 text-xs font-semibold"
                    value={subSearchQuery}
                    onValueChange={setSubSearchQuery}
                  />
                  <CommandList className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    <CommandEmpty className="py-4 text-center text-xs flex flex-col items-center justify-center gap-2">
                      <span className="text-gray-400">No se encontraron enfoques.</span>
                      {onCreateSubCategory && subSearchQuery && selectedCategoryId && (
                        <button
                          type="button"
                          disabled={isCreatingItem}
                          onClick={async () => {
                            setIsCreatingItem(true);
                            const newSub = await onCreateSubCategory(
                              selectedCategoryId,
                              subSearchQuery
                            );
                            if (newSub) {
                              handleSubChange(newSub.id);
                              setOpenSub(false);
                              setSubSearchQuery("");
                            }
                            setIsCreatingItem(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                        >
                          {isCreatingItem ? (
                            <QhSpinner size="sm" className="text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                          )}
                          <span>Crear "{subSearchQuery}"</span>
                        </button>
                      )}
                    </CommandEmpty>

                    <CommandGroup>
                      {subCategories.map((sub: any) => (
                        <CommandItem
                          key={sub.id}
                          value={sub.name}
                          onSelect={() => {
                            handleSubChange(sub.id);
                            setOpenSub(false);
                          }}
                          className="cursor-pointer p-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center justify-between"
                        >
                          <span>{sub.name}</span>
                          {selectedSubCategoryId === sub.id && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PASO 3: ETIQUETAS Y FILTROS ──────────────────────────────────── */}
      <AnimatePresence>
        {(selectedSubCategoryId || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
                <span>Etiquetas y Filtros de Búsqueda</span>
                <span className="text-gray-400 text-[11px] font-medium lowercase">(opcional)</span>
              </label>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40 self-start sm:self-auto">
                {selectedTagIds.length} seleccionadas
              </span>
            </div>

            {/* Input de Búsqueda de Tags */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              <Input
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Filtrar etiquetas o agregar palabras clave..."
                className="h-10 pl-10 pr-9 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-sm"
              />
              {tagSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTagSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Grid de Tags (Pills) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50"
                    )}
                  >
                    <span>{tag.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>

            {tagSearchQuery && filteredTags.length === 0 && (
              <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-3">
                <Info className="w-5 h-5 text-gray-400 mx-auto" strokeWidth={2} />
                <p className="text-xs font-medium text-gray-400">
                  No se encontraron etiquetas que coincidan con "{tagSearchQuery}"
                </p>

                {onCreateTag && (
                  <button
                    type="button"
                    disabled={isCreatingItem}
                    onClick={async () => {
                      setIsCreatingItem(true);
                      const newTag = await onCreateTag(tagSearchQuery);
                      if (newTag) {
                        handleTagToggle(newTag.id);
                        setTagSearchQuery("");
                      }
                      setIsCreatingItem(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    {isCreatingItem ? (
                      <QhSpinner size="sm" className="text-white" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    <span>Crear etiqueta "{tagSearchQuery}"</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stamp de Configuración Completa */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Check className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              Especialidad Configurada Correctamente
            </h4>
            <p className="text-[11px] font-medium text-gray-500">
              Categoría y subespecialidades asociadas a tu perfil comercial.
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
}