"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IMPORTABLE_ENTITIES, type ImportEntityType } from "@/lib/import/registry";
import { previewImportJob, commitImportJob, type ColumnMapping } from "@/actions/import";

type Step = "upload" | "mapping" | "preview" | "done";

type PreviewRow = { rowNumber: number; data: Record<string, string>; errors: string[] };

function guessMapping(headers: string[], fieldLabels: Record<string, string>): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const header of headers) {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = Object.entries(fieldLabels).find(
      ([key, label]) =>
        key.toLowerCase() === normalized || label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized,
    );
    mapping[header] = match ? match[0] : "";
  }
  return mapping;
}

export function ImportWizard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [entityType, setEntityType] = useState<ImportEntityType>("renters");
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [counts, setCounts] = useState({ validCount: 0, errorCount: 0 });
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; failed: number } | null>(null);

  const entity = IMPORTABLE_ENTITIES[entityType];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);

    const res = await fetch("/api/import-upload", { method: "POST", body: formData });
    const body = await res.json();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!res.ok) {
      toast.error(body.error ?? "Upload failed.");
      return;
    }

    setJobId(body.jobId);
    setHeaders(body.headers);
    setMapping(guessMapping(body.headers, entity.fieldLabels));
    setStep("mapping");
  }

  async function handlePreview() {
    if (!jobId) return;
    const result = await previewImportJob(jobId, mapping);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setPreviewRows(result.data.rows);
    setCounts({ validCount: result.data.validCount, errorCount: result.data.errorCount });
    setStep("preview");
  }

  async function handleCommit() {
    if (!jobId) return;
    setCommitting(true);
    const result = await commitImportJob(jobId, mapping);
    setCommitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setResult(result.data);
    setStep("done");
    toast.success(`Imported ${result.data.inserted} rows`);
  }

  function reset() {
    setStep("upload");
    setJobId(null);
    setHeaders([]);
    setMapping({});
    setPreviewRows([]);
    setResult(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Data type</label>
            <Select
              value={entityType}
              onValueChange={(value) => setEntityType(value as ImportEntityType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IMPORTABLE_ENTITIES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            id="import-file-input"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? "Uploading..." : "Choose CSV or XLSX file"}
          </Button>
        </div>
      )}

      {step === "mapping" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Map each column from your file to a field. Columns left as &quot;Skip&quot; are ignored.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File column</TableHead>
                <TableHead>Maps to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {headers.map((header) => (
                <TableRow key={header}>
                  <TableCell>{header}</TableCell>
                  <TableCell>
                    <Select
                      value={mapping[header] || "__skip"}
                      onValueChange={(value) =>
                        setMapping((m) => ({ ...m, [header]: value === "__skip" ? "" : value ?? "" }))
                      }
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip">Skip</SelectItem>
                        {Object.entries(entity.fieldLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-2">
            <Button onClick={handlePreview}>Preview</Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge>{counts.validCount} valid</Badge>
            {counts.errorCount > 0 && <Badge variant="destructive">{counts.errorCount} with errors</Badge>}
          </div>
          <div className="max-h-96 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row) => (
                  <TableRow key={row.rowNumber}>
                    <TableCell>{row.rowNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {Object.entries(row.data)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      {row.errors.length === 0 ? (
                        <Badge>Valid</Badge>
                      ) : (
                        <span className="text-xs text-destructive">{row.errors.join("; ")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex gap-2">
            <Button disabled={committing || counts.validCount === 0} onClick={handleCommit}>
              {committing ? "Importing..." : `Import ${counts.validCount} valid rows`}
            </Button>
            <Button variant="outline" onClick={() => setStep("mapping")}>
              Back to mapping
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Imported {result.inserted} rows{result.failed > 0 ? `, ${result.failed} skipped due to errors` : ""}.
          </p>
          <Button onClick={reset}>Start another import</Button>
        </div>
      )}
    </div>
  );
}
