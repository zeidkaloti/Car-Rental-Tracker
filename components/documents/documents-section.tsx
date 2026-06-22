"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/actions/documents";

type DocumentRow = {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  createdAt: string | Date;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsSection({
  entityType,
  entityId,
  documents,
}: {
  entityType: "renter" | "car" | "rental";
  entityId: string;
  documents: DocumentRow[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);
    formData.append("entityId", entityId);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Upload failed.");
      return;
    }

    toast.success("Document uploaded");
    router.refresh();
  }

  async function handleDelete(documentId: string) {
    const result = await deleteDocument(documentId);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Documents</h2>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            id={`document-upload-${entityId}`}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Upload document"}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <a
                href={`/api/files/${doc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {doc.fileName}
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{formatSize(doc.fileSizeBytes)}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
