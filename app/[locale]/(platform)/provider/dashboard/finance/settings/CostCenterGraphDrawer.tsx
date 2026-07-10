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
        <div style={{ width: NODE_WIDTH }} className={`bg-white dark:bg-[#0a0a0a] border ${data.isRoot ? 'border-black dark:border-white shadow-lg' : 'border-black/30 dark:border-white/30'} text-black dark:text-white overflow-hidden`}>
            <div className={`px-3 py-1.5 flex items-center gap-2 ${data.isRoot ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-white/10'}`}>
                <Building2 className={`w-3 h-3 shrink-0 ${data.isRoot ? 'text-white dark:text-black' : 'text-gray-500'}`} strokeWidth={2} />
                <span className={`text-[9px] font-bold uppercase tracking-widest truncate ${data.isRoot ? 'text-white dark:text-black' : 'text-gray-500'}`}>{data.code}</span>
                {!data.active && <span className="ml-auto text-[8px] font-bold text-red-500 bg-red-100 px-1 shrink-0">INACT.</span>}
            </div>
            <div className="px-3 py-2">
                <p className="text-[11px] font-semibold leading-tight line-clamp-2">{data.label}</p>
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
                    style: { stroke: '#888', strokeWidth: 1.5 },
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full h-full max-w-[95vw] max-h-[92vh] bg-white dark:bg-[#050505] border border-black/20 dark:border-white/20 flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center">
                            <GitBranch className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-tight">Grafo de Centros de Costo</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                {costCenters.length} NODO{costCenters.length !== 1 ? 'S' : ''} — JERARQUÍA ORGANIZACIONAL
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="flex-1 min-h-0">
                    {costCenters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <GitBranch className="w-12 h-12 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No hay centros de costo para mostrar</p>
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
                            className="bg-gray-50 dark:bg-[#050505]"
                        >
                            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
                            <Controls />
                            <MiniMap nodeColor={(node) => (node.data.isRoot ? '#000' : '#aaa')} maskColor="rgba(0,0,0,0.04)" />
                            <Panel position="top-left">
                                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 px-3 py-2">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-black dark:bg-white inline-block" /> Raíz</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-300 dark:bg-gray-600 inline-block" /> Sub-Centro</span>
                                </div>
                            </Panel>
                        </ReactFlow>
                    )}
                </div>
            </div>
        </div>
    );
}
