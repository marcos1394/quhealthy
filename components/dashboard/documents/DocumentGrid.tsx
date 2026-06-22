"use client";

import React from "react";
import { DocumentCard, Document } from "./DocumentCard";

export const DocumentGrid: React.FC<{ documents: Document[]; onSelect: (doc: Document) => void; onDownload?: (doc: Document) => void; onPreview?: (doc: Document) => void }> = ({ documents, onSelect, onDownload, onPreview }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
    {documents.map((doc) => (
      <DocumentCard key={doc.id} doc={doc} onSelect={onSelect} onDownload={onDownload} onPreview={onPreview} />
    ))}
  </div>
);
