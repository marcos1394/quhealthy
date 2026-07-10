"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Plus, Network, ChevronRight, ChevronDown, Edit2 } from "lucide-react";
import { accountingService } from "@/services/accounting.service";
import { CostCenterDTO } from "@/types/accounting";
import { CreateCostCenterDrawer } from "../CreateCostCenterDrawer";

export default function CostCentersPage() {
    const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);
    const [drawerParentId, setDrawerParentId] = useState<string | null>(null);
    const [drawerParentName, setDrawerParentName] = useState<string>("");

    const fetchData = () => {
        setIsLoading(true);
        accountingService.listCostCenters()
            .then(data => {
                setCostCenters(data);
                // Expand all by default
                const allIds = new Set(data.map(cc => cc.id));
                setExpandedIds(allIds);
            })
            .catch(() => toast.error("Error al cargar centros de costo", { theme: "colored" }))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedIds(next);
    };

    // Helper para construir el árbol
    type TreeNode = CostCenterDTO & { children: TreeNode[] };

    const buildTree = (centers: CostCenterDTO[]): TreeNode[] => {
        const map = new Map<string, TreeNode>();
        const roots: TreeNode[] = [];

        centers.forEach(cc => {
            map.set(cc.id, { ...cc, children: [] });
        });

        centers.forEach(cc => {
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
                    className="flex items-center p-3 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
                >
                    <div className="w-6 flex items-center justify-center cursor-pointer" onClick={() => hasChildren && toggleExpand(node.id)}>
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-sm -ml-2 -mt-4 opacity-50" />
                        )}
                    </div>
                    
                    <div className="flex-1 ml-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{node.name}</span>
                            <span className="px-2 py-0.5 text-[9px] font-mono bg-black/5 dark:bg-white/10 rounded">
                                {node.code}
                            </span>
                            {!node.active && (
                                <span className="px-2 py-0.5 text-[9px] text-red-600 bg-red-100 rounded">Inactivo</span>
                            )}
                        </div>
                        {node.description && (
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{node.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black dark:hover:text-white" onClick={() => toast.info("Funcionalidad en construcción", { theme: "colored" })}>
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-black dark:hover:text-white" onClick={() => {
                            setDrawerParentId(node.id);
                            setDrawerParentName(node.name);
                            setIsCostCenterDrawerOpen(true);
                        }}>
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {isExpanded && hasChildren && (
                    <div className="flex flex-col w-full">
                        {node.children.map(child => renderNode(child as TreeNode, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando árbol de centros...</p>
            </div>
        );
    }

    const tree = buildTree(costCenters);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Centros de Costo</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Estructura jerárquica para la asignación de presupuesto
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2">
                        <Network className="w-3.5 h-3.5" />
                        Ver Grafo
                    </Button>
                    <Button 
                        onClick={() => {
                            setDrawerParentId(null);
                            setDrawerParentName("");
                            setIsCostCenterDrawerOpen(true);
                        }}
                        className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nuevo Centro Raíz
                    </Button>
                </div>
            </div>

            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-hidden">
                <div className="p-3 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center">
                    <div className="w-6" />
                    <div className="flex-1 ml-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Jerarquía Organizacional
                    </div>
                    <div className="w-16 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">
                        Acciones
                    </div>
                </div>
                
                <div className="flex flex-col">
                    {tree.length > 0 ? (
                        tree.map(root => renderNode(root, 0))
                    ) : (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                            <Network className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No hay centros de costo configurados</p>
                        </div>
                    )}
                </div>
            </div>
            <CreateCostCenterDrawer 
                open={isCostCenterDrawerOpen}
                onOpenChange={setIsCostCenterDrawerOpen}
                onSuccess={fetchData}
                parentId={drawerParentId}
                parentName={drawerParentName}
            />
        </div>
    );
}
