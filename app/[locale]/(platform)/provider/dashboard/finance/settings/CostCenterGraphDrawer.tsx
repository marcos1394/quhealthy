"use client";

import React, { useMemo } from 'react';
import {
    ReactFlow,
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    ConnectionLineType,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Building2, GitBranch } from 'lucide-react';
import { CostCenterDTO } from '@/types/accounting';

interface TreeNode extends CostCenterDTO {
    children: TreeNode[];
}

function buildTree(flatList: CostCenterDTO[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    flatList.forEach(cc => map.set(cc.id, { ...cc, children: [] }));
    const roots: TreeNode[] = [];
    map.forEach(node => {
        if (node.parentId && map.has(node.parentId)) {
            map.get(node.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const H_GAP = 50;
const V_GAP = 70;

function measureWidth(node: TreeNode): number {
    if (node.children.length === 0) return NODE_WIDTH;
    const childrenWidth = node.children.reduce((acc, child) => acc + measureWidth(child) + H_GAP, -H_GAP);
    return Math.max(NODE_WIDTH, childrenWidth);
}

function placeNodes(
    node: TreeNode,
    x: number,
    y: number,
    positions: Map<string, { x: number; y: number }>
): void {
    if (node.children.length === 0) {
        positions.set(node.id, { x, y });
        return;
    }
    const childWidths = node.children.map(c => measureWidth(c));
    const total = childWidths.reduce((a, b) => a + b, 0) + H_GAP * (node.children.length - 1);
    let childX = x + NODE_WIDTH / 2 - total / 2;
    node.children.forEach((child, i) => {
        placeNodes(child, childX, y + NODE_HEIGHT + V_GAP, positions);
        childX += childWidths[i] + H_GAP;
    });
    const firstPos = positions.get(node.children[0].id);
    const lastPos = positions.get(node.children[node.children.length - 1].id);
    if (firstPos && lastPos) {
        positions.set(node.id, { x: (firstPos.x + lastPos.x + NODE_WIDTH) / 2 - NODE_WIDTH / 2, y });
    } else {
        positions.set(node.id, { x, y });
    }
}

function CostCenterNode({ data }: { data: { label: string; code: string; active: boolean; isRoot: boolean } }) {
    return (
        <div style={{ width: NODE_WIDTH }} className={`bg-white dark:bg-[#0a0a0a] rounded-xl border shadow-sm overflow-hidden ${data.isRoot ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
            <div className={`px-4 py-2 flex items-center gap-2 border-b ${data.isRoot ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800'}`}>
                <Building2 className={`w-3.5 h-3.5 shrink-0 ${data.isRoot ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`text-xs font-bold truncate ${data.isRoot ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-300'}`}>{data.code}</span>
                {!data.active && <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">Inactivo</span>}
            </div>
            <div className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">{data.label}</p>
            </div>
        </div>
    );
}

const nodeTypes = { costCenter: CostCenterNode };

interface Props {
    open: boolean;
    onClose: () => void;
    costCenters: CostCenterDTO[];
}

export function CostCenterGraphDrawer({ open, onClose, costCenters }: Props) {
    const { initialNodes, initialEdges } = useMemo(() => {
        const tree = buildTree(costCenters);
        const positions = new Map<string, { x: number; y: number }>();
        let curX = 0;
        tree.forEach(root => {
            const w = measureWidth(root);
            placeNodes(root, curX, 0, positions);
            curX += w + H_GAP;
        });

        const rfNodes: Node[] = [];
        const rfEdges: Edge[] = [];

        function traverse(node: TreeNode) {
            const pos = positions.get(node.id) ?? { x: 0, y: 0 };
            rfNodes.push({
                id: node.id,
                type: 'costCenter',
                position: pos,
                data: { label: node.name, code: node.code, active: node.active, isRoot: !node.parentId },
            });
            node.children.forEach(child => {
                rfEdges.push({
                    id: `e-${node.id}-${child.id}`,
                    source: node.id,
                    target: child.id,
                    type: 'smoothstep',
                    style: { stroke: '#d1d5db', strokeWidth: 2 }, // gray-300
                });
                traverse(child);
            });
        }
        tree.forEach(traverse);
        return { initialNodes: rfNodes, initialEdges: rfEdges };
    }, [costCenters]);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grafo de Centros de Costo</h2>
                            <p className="text-sm font-medium text-gray-500">
                                {costCenters.length} nodo{costCenters.length !== 1 ? 's' : ''} — Jerarquía organizacional
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 min-h-0 relative bg-gray-50/50 dark:bg-[#050505]">
                    {costCenters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <GitBranch className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm font-bold text-gray-400">No hay centros de costo para mostrar</p>
                        </div>
                    ) : (
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            nodeTypes={nodeTypes}
                            connectionLineType={ConnectionLineType.SmoothStep}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            proOptions={{ hideAttribution: true }}
                            className="bg-transparent"
                        >
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} className="opacity-40" />
                            <Controls className="bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden" />
                            <MiniMap nodeColor={(node) => (node.data.isRoot ? '#10b981' : '#cbd5e1')} maskColor="rgba(0,0,0,0.05)" className="bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800 rounded-xl shadow-sm" />
                            <Panel position="top-left">
                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm px-4 py-2.5">
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Raíz</span>
                                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" /> Sub-Centro</span>
                                </div>
                            </Panel>
                        </ReactFlow>
                    )}
                </div>
            </div>
        </div>
    );
}
