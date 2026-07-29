"use client";

import React from "react";
import { DocumentCard, Document } from "./DocumentCard";

interface DocumentGridProps {
  documents: Document[];
  onSelect: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  onSelect,
  onDownload,
  onPreview,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
    {documents.map((doc) => (
      <DocumentCard
        key={doc.id}
        doc={doc}
        onSelect={onSelect}
        onDownload={onDownload}
        onPreview={onPreview}
      />
    ))}
  </div>
);