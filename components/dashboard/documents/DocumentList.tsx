"use client";

import React from "react";
import { DocumentCard, Document } from "./DocumentCard";

export const DocumentList: React.FC<{ documents: Document[]; onSelect: (doc: Document) => void }> = ({ documents, onSelect }) => (
 <div className="grid grid-cols-1 gap-0 border-t border-l border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
 {documents.map((doc) => (
 <DocumentCard key={doc.id} doc={doc} onSelect={onSelect} showActions={false} compact={true} />
 ))}
 </div>
);
