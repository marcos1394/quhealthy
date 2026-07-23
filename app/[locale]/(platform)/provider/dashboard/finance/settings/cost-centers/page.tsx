"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Plus, Network, ChevronRight, ChevronDown, Edit2 } from "lucide-react";
import { accountingService } from "@/services/accounting.service";
import { CostCenterDTO } from "@/types/accounting";
import { CreateCostCenterDrawer } from "../CreateCostCenterDrawer";
import { CostCenterGraphDrawer } from "../CostCenterGraphDrawer";

export default function CostCentersPage() {
    const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);
    const [drawerParentId, setDrawerParentId] = useState<string | null>(null);
    const [drawerParentName, setDrawerParentName] = useState<string>("");
    const [drawerEditNode, setDrawerEditNode] = useState<CostCenterDTO | null>(null);
    const [isGraphOpen, setIsGraphOpen] = useState(false);

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
                    className="flex items-center p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
                >
                    <div className="w-6 flex items-center justify-center cursor-pointer" onClick={() => hasChildren && toggleExpand(node.id)}>
                        {hasChildren ? (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-600" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
                        ) : (
                            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-lg -ml-2 -mt-4 opacity-50" />
                        )}
                    </div>
                    
                    <div className="flex-1 ml-3">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{node.name}</span>
                            <span className="px-2 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {node.code}
                            </span>
                            {!node.active && (
                                <span className="px-2.5 py-0.5 text-xs font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 rounded-full">Inactivo</span>
                            )}
                        </div>
                        {node.description && (
                            <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">{node.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" onClick={() => {
                            setDrawerParentId(null);
                            setDrawerParentName("");
                            setDrawerEditNode(node as CostCenterDTO);
                            setIsCostCenterDrawerOpen(true);
                        }}>
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" onClick={() => {
                            setDrawerParentId(node.id);
                            setDrawerParentName(node.name);
                            setDrawerEditNode(null);
                            setIsCostCenterDrawerOpen(true);
                        }}>
                            <Plus className="w-4 h-4" />
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
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando árbol de centros...</p>
            </div>
        );
    }

    const tree = buildTree(costCenters);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Centros de Costo</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Estructura jerárquica para la asignación de presupuesto
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="rounded-xl h-11 px-4 font-bold border-gray-200 shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors gap-2" onClick={() => setIsGraphOpen(true)}>
                        <Network className="w-4 h-4" />
                        Ver Grafo
                    </Button>
                    <Button 
                        onClick={() => {
                            setDrawerParentId(null);
                            setDrawerParentName("");
                            setDrawerEditNode(null);
                            setIsCostCenterDrawerOpen(true);
                        }}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-xl h-11 px-4 font-bold shadow-sm gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Centro Raíz
                    </Button>
                </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50 flex items-center">
                    <div className="w-6" />
                    <div className="flex-1 ml-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Jerarquía Organizacional
                    </div>
                    <div className="w-20 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
                        Acciones
                    </div>
                </div>
                
                <div className="flex flex-col">
                    {tree.length > 0 ? (
                        tree.map(root => renderNode(root, 0))
                    ) : (
                        <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
                                <Network className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-500">No hay centros de costo configurados</p>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setDrawerParentId(null);
                                    setDrawerParentName("");
                                    setDrawerEditNode(null);
                                    setIsCostCenterDrawerOpen(true);
                                }}
                                className="mt-2 rounded-xl"
                            >
                                Crear el primer centro de costo
                            </Button>
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
                editNode={drawerEditNode}
            />
            <CostCenterGraphDrawer
                open={isGraphOpen}
                onClose={() => setIsGraphOpen(false)}
                costCenters={costCenters}
            />
        </div>
    );
}
