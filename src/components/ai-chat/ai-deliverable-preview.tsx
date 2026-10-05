"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { type DeliverableFile } from "@/components/ai-chat/ai-deliverable-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AiDeliverablePreview({ file }: { file: DeliverableFile }) {
  if (file.format === "csv")
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold">{file.title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {file.rows!.length - 1} rows · {file.rows![0].length} columns
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {file.rows![0].map((cell, index) => (
                  <TableHead key={index} className="whitespace-nowrap">
                    {cell}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {file.rows!.slice(1).map((row, index) => (
                <TableRow key={index}>
                  {row.map((cell, col) => (
                    <TableCell key={col}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-muted-foreground text-xs">
          Showing the complete file. Download to continue working in a
          spreadsheet.
        </p>
      </div>
    );
  if (file.format === "json" || file.format === "text")
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold">{file.title}</h1>
        <pre className="bg-muted/40 overflow-auto rounded-lg border p-5 font-mono text-xs leading-6 break-words whitespace-pre-wrap">
          {file.content}
        </pre>
      </div>
    );
  return (
    <div className="prose prose-sm prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-th:text-foreground prose-td:text-muted-foreground prose-hr:border-border max-w-none leading-7">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{file.content}</ReactMarkdown>
    </div>
  );
}
