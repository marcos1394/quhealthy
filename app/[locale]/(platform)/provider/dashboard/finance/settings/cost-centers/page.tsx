"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Plus,
  Network,
  ChevronRight,
  ChevronDown,
  Edit2,
  FolderTree,
} from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { accountingService } from "@/services/accounting.service";
import { CostCenterDTO } from "@/types/accounting";
import { CreateCostCenterDrawer } from "../CreateCostCenterDrawer";
import { CostCenterGraphDrawer } from "../CostCenterGraphDrawer";

// Definición corregida para omitir la propiedad 'children' opcional de CostCenterDTO
type TreeNode = Omit<CostCenterDTO, "children"> & { children: TreeNode[] };

export default function CostCentersPage() {
  const t = useTranslations("CostCenters");

  const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Estado del Drawer de Edición / Creación
  const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);
  const [drawerParentId, setDrawerParentId] = useState<string | null>(null);
  const [drawerParentName, setDrawerParentName] = useState<string>("");
  const [drawerEditNode, setDrawerEditNode] = useState<CostCenterDTO | null>(null);

  // Estado del Drawer del Grafo
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    accountingService
      .listCostCenters()
      .then((data) => {
        const centers = data || [];
        setCostCenters(centers);
        // Expandir todos por defecto
        const allIds = new Set(centers.map((cc) => cc.id));
        setExpandedIds(allIds);
      })
      .catch((error) => {
        console.error(error);
        toast.error(t("toasts.load_error"));
      })
      .finally(() => setIsLoading(false));
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  // Algoritmo para construir la jerarquía en árbol
  const buildTree = (centers: CostCenterDTO[]): TreeNode[] => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    centers.forEach((cc) => {
      map.set(cc.id, { ...cc, children: [] });
    });

    centers.forEach((cc) => {
      if (cc.parentId && map.has(cc.parentId)) {
        map.get(cc.parentId)!.children.push(map.get(cc.id)!);
      } else {
        roots.push(map.get(cc.id)!);
      }
    });

    return roots;
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="w-full">
        <div
          className="flex items-center p-3.5 border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group"
          style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        >
          {/* Icono de expansión o guía */}
          <div
            className="w-6 flex items-center justify-center cursor-pointer select-none"
            onClick={() => hasChildren && toggleExpand(node.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
              )
            ) : (
              <div className="w-3 h-3 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-md -ml-2 -mt-2 opacity-40" />
            )}
          </div>

          {/* Información del nodo */}
          <div className="flex-1 ml-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xs text-gray-900 dark:text-white">
                {node.name}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md">
                {node.code}
              </span>
              {!node.active && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-full">
                  {t("status_inactive")}
                </span>
              )}
            </div>
            {node.description && (
              <p className="text-[11px] font-medium text-gray-400 mt-0.5 line-clamp-1">
                {node.description}
              </p>
            )}
          </div>

          {/* Acciones por nodo */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors"
              onClick={() => {
                setDrawerParentId(null);
                setDrawerParentName("");
                setDrawerEditNode(node as CostCenterDTO);
                setIsCostCenterDrawerOpen(true);
              }}
            >
              <Edit2 className="w-3.5 h-3.5" strokeWidth={2} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
              onClick={() => {
                setDrawerParentId(node.id);
                setDrawerParentName(node.name);
                setDrawerEditNode(null);
                setIsCostCenterDrawerOpen(true);
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Nodos hijos recursivos */}
        {isExpanded && hasChildren && (
          <div className="flex flex-col w-full">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  const tree = buildTree(costCenters);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <FolderTree className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              className="rounded-xl h-11 px-5 text-xs font-bold border-gray-200 dark:border-gray-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-all shadow-sm flex items-center gap-2"
              onClick={() => setIsGraphOpen(true)}
            >
              <Network className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_view_graph")}</span>
            </Button>
            <Button
              onClick={() => {
                setDrawerParentId(null);
                setDrawerParentName("");
                setDrawerEditNode(null);
                setIsCostCenterDrawerOpen(true);
              }}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_new_root")}</span>
            </Button>
          </div>
        </div>

        {/* ── ARBOL DE CENTROS DE COSTO ────────────────────────────────── */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {t("th_hierarchy")}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center pr-4">
              {t("th_actions")}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60">
            {tree.length > 0 ? (
              tree.map((root) => renderNode(root, 0))
            ) : (
              <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                  <Network className="w-7 h-7" strokeWidth={2} />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("empty_state")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDrawerParentId(null);
                    setDrawerParentName("");
                    setDrawerEditNode(null);
                    setIsCostCenterDrawerOpen(true);
                  }}
                  className="rounded-xl text-xs font-bold border-gray-200 dark:border-gray-800 shadow-sm mt-1"
                >
                  {t("btn_create_first")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── DRAWERS ─────────────────────────────────────────────────── */}
        <CreateCostCenterDrawer
          open={isCostCenterDrawerOpen}
          onOpenChange={setIsCostCenterDrawerOpen}
          onSuccess={fetchData}
          parentId={drawerParentId}
          parentName={drawerParentName}
          editNode={drawerEditNode}
        />

        <CostCenterGraphDrawer
          open={isGraphOpen}
          onClose={() => setIsGraphOpen(false)}
          costCenters={costCenters}
        />

      </div>
    </div>
  );
}