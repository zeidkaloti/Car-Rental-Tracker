import { desc } from "drizzle-orm";
import { db } from "@/db";
import { importJobs } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportWizard } from "@/components/import/import-wizard";

export default async function ImportPage() {
  const jobs = await db.query.importJobs.findMany({
    orderBy: [desc(importJobs.createdAt)],
    limit: 20,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Import data</h1>
        <p className="text-sm text-muted-foreground">
          Bulk-add renters or cars from a CSV or Excel file exported from your spreadsheet.
        </p>
      </div>

      <ImportWizard />

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Import history</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No imports yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.originalFileName}</TableCell>
                  <TableCell className="capitalize">{job.entityType}</TableCell>
                  <TableCell>
                    {job.successRows ?? 0} / {job.totalRows ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "completed"
                          ? "default"
                          : job.status === "completed_with_errors"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
