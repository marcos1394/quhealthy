"use client";

import React from "react";
import { DocumentCard, Document } from "./DocumentCard";

interface DocumentListProps {
  documents: Document[];
  onSelect: (doc: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelect,
}) => (
  <div className="grid grid-cols-1 gap-3 font-sans">
    {documents.map((doc) => (
      <DocumentCard
        key={doc.id}
        doc={doc}
        onSelect={onSelect}
        showActions={false}
        compact={true}
      />
    ))}
  </div>
);