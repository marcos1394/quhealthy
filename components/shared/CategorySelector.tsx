"use client";

/* eslint-disable react-doctor/no-pass-data-to-parent */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useCallback, useRef, useReducer } from "react";
import { useTranslations } from "next-intl";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
    name: string
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
  const t = useTranslations("CategorySelector");

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
  ] = useReducer(
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
    }
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

  // Rastreo táctil para iOS Safari
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
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
        toast.success(t("toast_cat_selected", { name: categoryName }));
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
      toast.success(t("toast_sub_selected", { name: subName }));
    }
  };

  const handleTagToggle = (tagId: number) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onSelectionChange(
      selectedCategoryId || 0,
      selectedSubCategoryId || 0,
      newTags
    );
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const completionSteps = [
    { label: t("step_category"), completed: (selectedCategoryId || 0) > 0 },
    {
      label: t("step_subcategory"),
      completed: (selectedSubCategoryId || 0) > 0,
    },
    { label: t("step_tags"), completed: selectedTagIds.length > 0 },
  ];
  const progress =
    (completionSteps.filter((s) => s.completed).length / 3) * 100;

  // ── ESTADO INICIAL / CARGANDO CATEGORÍAS ──────────────────────────────
  if (categories.length === 0 && !selectedCategoryId && !error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center font-sans select-none"
      >
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400 mb-3" />
        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {t("loading_catalog")}
        </p>
        <p className="text-[11px] font-medium text-gray-400 mt-1 max-w-xs leading-relaxed">
          {t("loading_subtext")}
        </p>
      </motion.div>
    );
  }

  // ── ESTADO DE ERROR ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 shadow-2xs space-y-4 font-sans select-none">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
            <AlertCircle className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              {t("error_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer"
        >
          {t("btn_retry")}
        </button>
      </div>
    );
  }

  // ── RENDERIZADO PRINCIPAL ─────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-2xs space-y-8 font-sans transition-colors select-none">
      {/* ── BANDA DE PROGRESO DE CONFIGURACIÓN ───────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <span>{t("progress_title")}</span>
          </h3>

          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40 shadow-2xs">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-2xs">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
          />
        </div>

        {/* Indicadores de Paso */}
        <div className="flex flex-wrap gap-3 pt-1">
          {completionSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                step.completed
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-2xs",
                  step.completed
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                )}
              >
                {step.completed ? (
                  <Check className="w-3 h-3 stroke-[3]" />
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
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shadow-2xs">
              1
            </span>
            <span>{t("label_category")}</span>
          </label>

          {(selectedCategoryId || 0) > 0 && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
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
                "w-full h-11 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between shadow-2xs cursor-pointer",
                "bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                (selectedCategoryId || 0) > 0 &&
                  "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20"
              )}
            >
              <span className="truncate">
                {selectedCategoryId && selectedCategoryId > 0
                  ? categories.find((cat) => cat.id === selectedCategoryId)?.name
                  : t("placeholder_category")}
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
                placeholder={t("search_category")}
                className="h-10 text-xs font-semibold"
                value={catSearchQuery}
                onValueChange={setCatSearchQuery}
              />
              <CommandList className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                <CommandEmpty className="py-4 text-center text-xs flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-400">{t("no_categories")}</span>
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
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      {isCreatingItem ? (
                        <QhSpinner size="sm" className="text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      )}
                      <span>{t("btn_create", { name: catSearchQuery })}</span>
                    </button>
                  )}
                </CommandEmpty>

                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      disabled={false}
                      style={{ pointerEvents: "auto", opacity: 1 }}
                      onSelect={() => {
                        handleCatChange(cat.id);
                        setOpenCat(false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCatChange(cat.id);
                        setOpenCat(false);
                      }}
                      className="cursor-pointer p-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      {selectedCategoryId === cat.id && (
                        <Check
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2.5}
                        />
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-2 overflow-hidden pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shadow-2xs">
                  2
                </span>
                <span>{t("label_subcategory")}</span>
              </label>

              {(selectedSubCategoryId || 0) > 0 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
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
                    "w-full h-11 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between shadow-2xs cursor-pointer",
                    "bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                    (selectedSubCategoryId || 0) > 0 &&
                      "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20"
                  )}
                >
                  <span className="truncate flex items-center gap-2">
                    {isLoadingSub ? (
                      <>
                        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs text-gray-400 font-normal">
                          {t("loading_subcategories")}
                        </span>
                      </>
                    ) : selectedSubCategoryId && selectedSubCategoryId > 0 ? (
                      subCategories.find(
                        (sub: any) => sub.id === selectedSubCategoryId
                      )?.name
                    ) : (
                      t("placeholder_subcategory")
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
                    placeholder={t("search_subcategory")}
                    className="h-10 text-xs font-semibold"
                    value={subSearchQuery}
                    onValueChange={setSubSearchQuery}
                  />
                  <CommandList className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    <CommandEmpty className="py-4 text-center text-xs flex flex-col items-center justify-center gap-2">
                      <span className="text-gray-400">
                        {t("no_subcategories")}
                      </span>
                      {onCreateSubCategory &&
                        subSearchQuery &&
                        selectedCategoryId && (
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
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            {isCreatingItem ? (
                              <QhSpinner size="sm" className="text-white" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            )}
                            <span>{t("btn_create", { name: subSearchQuery })}</span>
                          </button>
                        )}
                    </CommandEmpty>

                    <CommandGroup>
                      {subCategories.map((sub: any) => (
                        <CommandItem
                          key={sub.id}
                          value={sub.name}
                          disabled={false}
                          style={{ pointerEvents: "auto", opacity: 1 }}
                          onSelect={() => {
                            handleSubChange(sub.id);
                            setOpenSub(false);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubChange(sub.id);
                            setOpenSub(false);
                          }}
                          className="cursor-pointer p-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center justify-between"
                        >
                          <span>{sub.name}</span>
                          {selectedSubCategoryId === sub.id && (
                            <Check
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                              strokeWidth={2.5}
                            />
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-3 overflow-hidden pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shadow-2xs">
                  3
                </span>
                <span>{t("label_tags")}</span>
                <span className="text-gray-400 text-[11px] font-medium">
                  {t("optional_suffix")}
                </span>
              </label>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40 self-start sm:self-auto shadow-2xs">
                {t("tags_selected", { count: selectedTagIds.length })}
              </span>
            </div>

            {/* Input de Búsqueda de Tags */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                strokeWidth={2}
              />
              <Input
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder={t("search_tags_placeholder")}
                className="h-10 pl-10 pr-9 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs transition-all"
              />
              {tagSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTagSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Grid de Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer",
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50"
                    )}
                  >
                    <span>{tag.name}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>

            {tagSearchQuery && filteredTags.length === 0 && (
              <div className="p-6 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-3">
                <Info className="w-5 h-5 text-gray-400 mx-auto" strokeWidth={2} />
                <p className="text-xs font-medium text-gray-400">
                  {t("no_tags_found", { query: tagSearchQuery })}
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    {isCreatingItem ? (
                      <QhSpinner size="sm" className="text-white" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    <span>{t("btn_create_tag", { name: tagSearchQuery })}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SELLO DE CONFIGURACIÓN COMPLETA ───────────────────────────── */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3 shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {t("complete_title")}
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("complete_desc")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}