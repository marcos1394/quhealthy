"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { X, Building2, GitBranch } from "lucide-react";

import { CostCenterDTO } from "@/types/accounting";

// Definición corregida para evitar conflictos con la propiedad opcional children de CostCenterDTO
type TreeNode = Omit<CostCenterDTO, "children"> & { children: TreeNode[] };

function buildTree(flatList: CostCenterDTO[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  flatList.forEach((cc) => map.set(cc.id, { ...cc, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
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
  const childrenWidth = node.children.reduce(
    (acc, child) => acc + measureWidth(child) + H_GAP,
    -H_GAP
  );
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
  const childWidths = node.children.map((c) => measureWidth(c));
  const total =
    childWidths.reduce((a, b) => a + b, 0) +
    H_GAP * (node.children.length - 1);
  let childX = x + NODE_WIDTH / 2 - total / 2;
  node.children.forEach((child, i) => {
    placeNodes(child, childX, y + NODE_HEIGHT + V_GAP, positions);
    childX += childWidths[i] + H_GAP;
  });
  const firstPos = positions.get(node.children[0].id);
  const lastPos = positions.get(
    node.children[node.children.length - 1].id
  );
  if (firstPos && lastPos) {
    positions.set(node.id, {
      x: (firstPos.x + lastPos.x + NODE_WIDTH) / 2 - NODE_WIDTH / 2,
      y,
    });
  } else {
    positions.set(node.id, { x, y });
  }
}

function CostCenterNode({
  data,
}: {
  data: { label: string; code: string; active: boolean; isRoot: boolean; inactiveLabel?: string };
}) {
  return (
    <div
      style={{ width: NODE_WIDTH }}
      className={`bg-white dark:bg-[#0a0a0a] rounded-2xl border shadow-sm overflow-hidden font-sans transition-all ${
        data.isRoot
          ? "border-emerald-500/50 shadow-emerald-500/10"
          : "border-gray-200 dark:border-gray-800"
      }`}
    >
      <div
        className={`px-3.5 py-2 flex items-center gap-2 border-b ${
          data.isRoot
            ? "bg-emerald-50/60 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40"
            : "bg-gray-50/80 border-gray-100 dark:bg-[#050505] dark:border-gray-800"
        }`}
      >
        <Building2
          className={`w-3.5 h-3.5 shrink-0 ${
            data.isRoot
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
          strokeWidth={2}
        />
        <span
          className={`text-xs font-mono font-bold truncate ${
            data.isRoot
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {data.code}
        </span>
        {!data.active && (
          <span className="ml-auto text-[9px] font-bold text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded-full shrink-0">
            {data.inactiveLabel || "Inactivo"}
          </span>
        )}
      </div>
      <div className="px-3.5 py-3">
        <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
          {data.label}
        </p>
      </div>
    </div>
  );
}

const nodeTypes = { costCenter: CostCenterNode };

interface CostCenterGraphDrawerProps {
  open: boolean;
  onClose: () => void;
  costCenters: CostCenterDTO[];
}

export function CostCenterGraphDrawer({
  open,
  onClose,
  costCenters,
}: CostCenterGraphDrawerProps) {
  const t = useTranslations("CostCenterGraphDrawer");

  const { initialNodes, initialEdges } = useMemo(() => {
    const tree = buildTree(costCenters);
    const positions = new Map<string, { x: number; y: number }>();
    let curX = 0;
    tree.forEach((root) => {
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
        type: "costCenter",
        position: pos,
        data: {
          label: node.name,
          code: node.code,
          active: node.active,
          isRoot: !node.parentId,
          inactiveLabel: t("status_inactive"),
        },
      });
      node.children.forEach((child) => {
        rfEdges.push({
          id: `e-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: "smoothstep",
          style: { stroke: "#10b981", strokeWidth: 1.5, opacity: 0.6 },
        });
        traverse(child);
      });
    }
    tree.forEach(traverse);
    return { initialNodes: rfNodes, initialEdges: rfEdges };
  }, [costCenters, t]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200 font-sans text-gray-900 dark:text-white">
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col shadow-2xl overflow-hidden">
        
        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
              <GitBranch className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                {t("subtitle", { count: costCenters.length })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── CANVA REACT FLOW ──────────────────────────────────── */}
        <div className="flex-1 min-h-0 relative bg-gray-50/50 dark:bg-[#050505]">
          {costCenters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 shadow-sm">
                <GitBranch className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {t("empty_state")}
              </p>
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
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1.5}
                className="opacity-40 dark:opacity-20"
              />
              <Controls className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden" />
              <MiniMap
                nodeColor={(node) =>
                  node.data.isRoot ? "#10b981" : "#94a3b8"
                }
                maskColor="rgba(0,0,0,0.05)"
                className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm"
              />
              <Panel position="top-left">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {t("legend.root")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                    {t("legend.sub_center")}
                  </span>
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>

      </div>
    </div>
  );
}