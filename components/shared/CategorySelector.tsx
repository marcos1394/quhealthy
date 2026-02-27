/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Loader2, Check, Star, Search, X, Info, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { CategoryResponse, SubCategoryResponse, TagResponse } from "@/types/onboarding";

interface CategorySelectorProps {
  categories: CategoryResponse[];
  tags: TagResponse[];
  selectedCategoryId?: number;
  selectedSubCategoryId?: number;
  selectedTagIds?: number[];
  onGetSubCategories: (catId: number) => Promise<SubCategoryResponse[]>;
  onSelectionChange: (catId: number, subId: number, tagIds: number[]) => void;
  error?: string | null;
}

export default function CategorySelector({
  categories, tags, selectedCategoryId, selectedSubCategoryId,
  selectedTagIds = [], onGetSubCategories, onSelectionChange, error
}: CategorySelectorProps) {
  const [subCategories, setSubCategories] = useState<SubCategoryResponse[]>([]);
  const [isLoadingSub, setIsLoadingSub] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  const loadInitialSubCategories = useCallback(async () => {
    if (selectedCategoryId && selectedCategoryId > 0) {
      setIsLoadingSub(true);
      const subs = await onGetSubCategories(selectedCategoryId);
      setSubCategories(subs);
      setIsLoadingSub(false);
    }
  }, [selectedCategoryId, onGetSubCategories]);

  useEffect(() => { loadInitialSubCategories(); }, [loadInitialSubCategories]);

  const handleCatChange = async (catId: number) => {
    if (catId === selectedCategoryId) return;
    setIsLoadingSub(true);
    const categoryName = categories.find(c => c.id === catId)?.name;
    onSelectionChange(catId, 0, selectedTagIds);
    try {
      const subs = await onGetSubCategories(catId);
      setSubCategories(subs);
      toast.success(`Specialty: ${categoryName}`);
    } catch { toast.error("Could not load subcategories."); }
    finally { setIsLoadingSub(false); }
  };

  const handleSubChange = (subId: number) => {
    const subName = subCategories.find(s => s.id === subId)?.name;
    onSelectionChange(selectedCategoryId || 0, subId, selectedTagIds);
    if (subName) toast.success(`Focus: ${subName}`);
  };

  const handleTagToggle = (tagId: number) => {
    const newTags = selectedTagIds.includes(tagId) ? selectedTagIds.filter(id => id !== tagId) : [...selectedTagIds, tagId];
    onSelectionChange(selectedCategoryId || 0, selectedSubCategoryId || 0, newTags);
  };

  const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()));

  const completionSteps = [
    { label: "Specialty", completed: (selectedCategoryId || 0) > 0 },
    { label: "Focus", completed: (selectedSubCategoryId || 0) > 0 },
    { label: "Tags", completed: selectedTagIds.length > 0 }
  ];
  const progress = (completionSteps.filter(s => s.completed).length / 3) * 100;

  if (categories.length === 0 && !selectedCategoryId && !error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-medical-600 dark:text-medical-400 mb-3" />
        <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">Waiting for sector selection...</p>
        <p className="text-slate-500 text-sm font-light">Choose Health or Beauty to see options</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-600 dark:text-red-400 font-semibold mb-1">Loading Error</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-light">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-none">Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Configure Your Specialty</h3>
          <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
        <div className="flex gap-3">
          {completionSteps.map((step, index) => (
            <div key={index} className={cn("flex items-center gap-1.5 text-xs font-medium transition-all", step.completed ? "text-medical-600 dark:text-medical-400" : "text-slate-400 dark:text-slate-500")}>
              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                step.completed ? "bg-medical-600 dark:bg-medical-500 border-medical-500 text-white" : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700")}>
                {step.completed ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px]">{index + 1}</span>}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              {index < completionSteps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Category */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 text-[10px] font-semibold">1</span>
            Main Specialty
          </label>
          {(selectedCategoryId || 0) > 0 && <CheckCircle2 className="w-4 h-4 text-medical-600 dark:text-medical-400" />}
        </div>
        <Select value={selectedCategoryId?.toString()} onValueChange={(val) => handleCatChange(Number(val))} disabled={categories.length === 0}>
          <SelectTrigger className={cn("w-full h-12 text-sm transition-all rounded-xl",
            "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white",
            (selectedCategoryId || 0) > 0 ? "border-medical-500/30 ring-1 ring-medical-500/10" : "")}>
            <SelectValue placeholder="Select your specialty area..." />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()} className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-medical-50 dark:bg-medical-500/10 rounded-lg"><Star className="w-3 h-3 text-medical-600 dark:text-medical-400" /></div>
                  <span className="font-medium">{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Step 2: Subcategory */}
      <AnimatePresence>
        {(selectedCategoryId || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">2</span>
                Specific Focus
              </label>
              {(selectedSubCategoryId || 0) > 0 && <CheckCircle2 className="w-4 h-4 text-medical-600 dark:text-medical-400" />}
            </div>
            <Select value={selectedSubCategoryId?.toString()} onValueChange={(val) => handleSubChange(Number(val))} disabled={isLoadingSub}>
              <SelectTrigger className={cn("w-full h-12 text-sm transition-all rounded-xl",
                "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white",
                (selectedSubCategoryId || 0) > 0 ? "border-medical-500/30 ring-1 ring-medical-500/10" : "")}>
                {isLoadingSub ? <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading...</span></div> : <SelectValue placeholder="What is your main focus?" />}
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200">
                {subCategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id.toString()} className="py-2.5"><span className="font-medium">{sub.name}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Tags */}
      <AnimatePresence>
        {(selectedSubCategoryId || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">3</span>
                Tags
                <span className="text-slate-400 text-xs font-light">(Optional)</span>
              </label>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 text-xs">
                {selectedTagIds.length} selected
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={tagSearchQuery} onChange={(e) => setTagSearchQuery(e.target.value)} placeholder="Search tags..."
                className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 text-slate-900 dark:text-white rounded-xl" />
              {tagSearchQuery && (
                <button type="button" onClick={() => setTagSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <motion.button key={tag.id} type="button" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn("px-3 py-1.5 rounded-lg transition-all text-sm font-medium border",
                      isSelected ? "text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500")}
                    style={{ backgroundColor: isSelected ? (tag.color ?? "#0ea5e9") : undefined, borderColor: isSelected ? (tag.color ?? "#0ea5e9") : undefined }}>
                    {isSelected && <Check className="w-3 h-3 mr-1 inline-block" />}{tag.name}
                  </motion.button>
                );
              })}
            </div>
            {tagSearchQuery && filteredTags.length === 0 && (
              <div className="text-center py-6">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-light">No tags found for &quot;{tagSearchQuery}&quot;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Summary */}
      {progress === 100 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-medical-600 dark:text-medical-400 mb-0.5">Configuration Complete!</h4>
            <p className="text-xs text-medical-600/80 dark:text-medical-400/80 font-light">Your specialty is configured with {selectedTagIds.length} tags.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}