/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/no-pass-data-to-parent */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Star,
  Search,
  X,
  Info,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
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
      // Si la diferencia es menor a 5px, se considera un tap (no un scroll)
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
      toast.success(`Sector configurado: ${categoryName}`, {
        icon: (
          <span role="img" aria-label="building">
            🏛️
          </span>
        ),
      });
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoadingSub(false);
    }
  };

  const handleSubChange = (subId: number) => {
    const subName = subCategories.find((s: any) => s.id === subId)?.name;
    onSelectionChange(selectedCategoryId || 0, subId, selectedTagIds);
    if (subName)
      toast.success(`Enfoque: ${subName}`, {
        icon: (
          <span role="img" aria-label="dart">
            🎯
          </span>
        ),
      });
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
    { label: "Sector Principal", completed: (selectedCategoryId || 0) > 0 },
    {
      label: "Enfoque Específico",
      completed: (selectedSubCategoryId || 0) > 0,
    },
    { label: "Etiquetas", completed: selectedTagIds.length > 0 },
  ];
  const progress =
    (completionSteps.filter((s) => s.completed).length / 3) * 100;

  // ---------------------------------------------------------------------------
  // EMPTY STATE (Architectural Waiting State)
  // ---------------------------------------------------------------------------
  if (categories.length === 0 && !selectedCategoryId && !error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 transition-colors"
      >
        <QhSpinner size="md" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-6 mb-2">
          Esperando Configuración de Sector
        </p>
        <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
          Selecciona tu disciplina primaria para habilitar opciones
        </p>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0a0a0a] p-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 border border-red-200 dark:border-red-900 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
              Error de Carga
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-10 px-6 text-[9px] font-bold uppercase tracking-widest"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN COMPONENT
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-white dark:bg-[#0a0a0a] p-8 md:p-10 border border-gray-200 dark:border-gray-800 space-y-10 transition-colors relative">
      {/* Background Grid Pattern (Blueprint) */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Progress Header */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="text-sm font-bold tracking-tight text-black dark:text-white uppercase">
            Configuración de Especialidad
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-100 dark:bg-gray-900 px-2 py-1">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Strict Progress Line */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 left-0 h-full bg-black dark:bg-white"
          />
        </div>

        {/* Step Indicators */}
        <div className="flex flex-wrap gap-4 pt-2">
          {completionSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 transition-all",
                step.completed
                  ? "text-black dark:text-white"
                  : "text-gray-400 dark:text-gray-600",
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 flex items-center justify-center border transition-all",
                  step.completed
                    ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                    : "border-gray-300 dark:border-gray-700 bg-transparent",
                )}
              >
                {step.completed ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : (
                  <span className="text-[8px] font-bold">{index + 1}</span>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Category */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-4"
      >
        <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
          <span className="w-5 h-5 border border-black dark:border-white flex items-center justify-center">
            1
          </span>
          Sector Principal
          {(selectedCategoryId || 0) > 0 && (
            <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-gray-400" />
          )}
        </label>
        <Popover open={openCat} onOpenChange={setOpenCat}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-controls="category-list"
              aria-expanded={openCat}
              disabled={categories.length === 0}
              className={cn(
                "w-full h-14 rounded-none text-xs font-medium transition-all justify-between px-3",
                "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#111]",
                (selectedCategoryId || 0) > 0
                  ? "border-black dark:border-white"
                  : "",
              )}
            >
              <span className="truncate">
                {selectedCategoryId && selectedCategoryId > 0
                  ? categories.find((cat) => cat.id === selectedCategoryId)
                      ?.name
                  : "Selecciona tu sector..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none border border-gray-200 dark:border-gray-800 shadow-xl"
            align="start"
            sideOffset={4}
          >
            <Command className="bg-white dark:bg-[#0a0a0a] rounded-none">
              <CommandInput
                placeholder="Buscar sector..."
                className="h-10 text-xs"
                value={catSearchQuery}
                onValueChange={setCatSearchQuery}
              />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty className="py-4 text-center text-xs flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-500">
                    No se encontraron sectores.
                  </span>
                  {onCreateCategory && catSearchQuery && (
                    <Button
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
                      className="mt-2 text-[10px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-none h-8"
                    >
                      {isCreatingItem ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      Crear "{catSearchQuery}"
                    </Button>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      disabled={false}
                      onSelect={() => {
                        handleCatChange(cat.id);
                        setOpenCat(false);
                      }}
                      className="cursor-pointer py-3 text-xs uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800/50 last:border-0 rounded-none data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategoryId === cat.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {cat.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Step 2: Subcategory */}
      <AnimatePresence>
        {(selectedCategoryId || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 space-y-4 overflow-hidden"
          >
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-2" />
            <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              <span className="w-5 h-5 border border-black dark:border-white flex items-center justify-center">
                2
              </span>
              Enfoque Específico
              {(selectedSubCategoryId || 0) > 0 && (
                <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-gray-400" />
              )}
            </label>
            <Popover open={openSub} onOpenChange={setOpenSub}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-controls="subcategory-list"
                  aria-expanded={openSub}
                  disabled={isLoadingSub}
                  className={cn(
                    "w-full h-14 rounded-none text-xs font-medium transition-all justify-between px-3",
                    "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#111]",
                    (selectedSubCategoryId || 0) > 0
                      ? "border-black dark:border-white"
                      : "",
                  )}
                >
                  <span className="truncate flex items-center gap-2">
                    {isLoadingSub ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest">
                          Sincronizando...
                        </span>
                      </>
                    ) : selectedSubCategoryId && selectedSubCategoryId > 0 ? (
                      subCategories.find(
                        (sub: any) => sub.id === selectedSubCategoryId,
                      )?.name
                    ) : (
                      "¿Cuál es tu enfoque principal?"
                    )}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none border border-gray-200 dark:border-gray-800 shadow-xl"
                align="start"
                sideOffset={4}
              >
                <Command className="bg-white dark:bg-[#0a0a0a] rounded-none">
                  <CommandInput
                    placeholder="Buscar enfoque..."
                    className="h-10 text-xs"
                    value={subSearchQuery}
                    onValueChange={setSubSearchQuery}
                  />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty className="py-4 text-center text-xs flex flex-col items-center justify-center gap-2">
                      <span className="text-gray-500">
                        No se encontraron enfoques.
                      </span>
                      {onCreateSubCategory &&
                        subSearchQuery &&
                        selectedCategoryId && (
                          <Button
                            type="button"
                            disabled={isCreatingItem}
                            onClick={async () => {
                              setIsCreatingItem(true);
                              const newSub = await onCreateSubCategory(
                                selectedCategoryId,
                                subSearchQuery,
                              );
                              if (newSub) {
                                handleSubChange(newSub.id);
                                setOpenSub(false);
                                setSubSearchQuery("");
                              }
                              setIsCreatingItem(false);
                            }}
                            className="mt-2 text-[10px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-none h-8"
                          >
                            {isCreatingItem ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-2" />
                            ) : (
                              <Plus className="w-3 h-3 mr-1" />
                            )}
                            Crear "{subSearchQuery}"
                          </Button>
                        )}
                    </CommandEmpty>
                    <CommandGroup>
                      {subCategories.map((sub: any) => (
                        <CommandItem
                          key={sub.id}
                          value={sub.name}
                          disabled={false}
                          onSelect={() => {
                            handleSubChange(sub.id);
                            setOpenSub(false);
                          }}
                          className="cursor-pointer py-3 text-xs uppercase tracking-wide hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800/50 last:border-0 rounded-none data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSubCategoryId === sub.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {sub.name}
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

      {/* Step 3: Tags */}
      <AnimatePresence>
        {(selectedSubCategoryId || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 space-y-5 overflow-hidden"
          >
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-2" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                <span className="w-5 h-5 border border-black dark:border-white flex items-center justify-center">
                  3
                </span>
                Etiquetas / Filtros
                <span className="text-gray-400 font-light lowercase tracking-normal ml-1">
                  (Opcional)
                </span>
              </label>
              <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white border border-gray-200 dark:border-gray-800 px-3 py-1 bg-gray-50 dark:bg-[#050505]">
                {selectedTagIds.length} Seleccionadas
              </span>
            </div>

            {/* Search Input (Flush) */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                strokeWidth={1.5}
              />
              <Input
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Buscar especialidades adicionales..."
                className="pl-11 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-14 text-xs focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
              />
              {tagSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTagSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tags Grid */}
            <div className="flex flex-wrap gap-2 pt-2">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <motion.button
                    key={tag.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -2 }}
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn(
                      "px-4 py-2.5 rounded-none border transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                      isSelected
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "bg-white dark:bg-[#0a0a0a] text-gray-500 border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white",
                    )}
                  >
                    {/* Indicador de color (LED Arquitectónico) si el backend lo provee */}
                    <span
                      className="w-1.5 h-1.5"
                      style={{
                        backgroundColor: isSelected
                          ? tag.color
                            ? "white"
                            : "currentColor"
                          : tag.color || "#000",
                      }}
                    />
                    {tag.name}
                  </motion.button>
                );
              })}
            </div>

            {tagSearchQuery && filteredTags.length === 0 && (
              <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center">
                <Info
                  className="w-5 h-5 text-gray-400 mb-3"
                  strokeWidth={1.5}
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                  No hay resultados para "{tagSearchQuery}"
                </p>
                {onCreateTag && (
                  <Button
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
                    className="text-[10px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-none h-9 px-4"
                  >
                    {isCreatingItem ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}
                    Crear "{tagSearchQuery}"
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Stamp (Blueprint Validation) */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 border border-black dark:border-white p-4 flex items-center gap-4 bg-gray-50 dark:bg-[#050505]"
        >
          <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <Check
              className="w-4 h-4 text-black dark:text-white"
              strokeWidth={2}
            />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              Configuración Técnica Completa
            </h4>
            <p className="text-[9px] font-light uppercase tracking-widest text-gray-500">
              Sector validado con {selectedTagIds.length} atributos.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
