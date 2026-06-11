"use client";

import type { InputHTMLAttributes } from "react";
import { FolderUp, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  selectedLabel?: string;
};

async function readDirectoryEntry(entry: FileSystemDirectoryEntry, prefix = ""): Promise<File[]> {
  const reader = entry.createReader();
  const files: File[] = [];

  const readBatch = (): Promise<FileSystemEntry[]> =>
    new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

  let entries = await readBatch();
  while (entries.length > 0) {
    for (const child of entries) {
      const childPath = prefix ? `${prefix}/${child.name}` : child.name;
      if (child.isFile) {
        const fileEntry = child as FileSystemFileEntry;
        const file = await new Promise<File>((resolve, reject) => {
          fileEntry.file(resolve, reject);
        });
        files.push(new File([file], childPath, { type: file.type }));
      } else if (child.isDirectory) {
        files.push(...(await readDirectoryEntry(child as FileSystemDirectoryEntry, childPath)));
      }
    }
    entries = await readBatch();
  }

  return files;
}

async function filesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const items = Array.from(dataTransfer.items);
  const files: File[] = [];

  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (!entry) {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
      continue;
    }

    if (entry.isDirectory) {
      files.push(...(await readDirectoryEntry(entry as FileSystemDirectoryEntry, entry.name)));
    } else if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      });
      files.push(new File([file], entry.name, { type: file.type }));
    }
  }

  return files;
}

export function DropZone({ onFilesSelected, disabled, selectedLabel }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected],
  );

  return (
    <div
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20",
        disabled && "opacity-60",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={async (event) => {
        event.preventDefault();
        setIsDragging(false);
        if (disabled) {
          return;
        }
        const files = await filesFromDataTransfer(event.dataTransfer);
        handleFiles(files);
      }}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
        <Upload className="size-5 text-muted-foreground" />
      </div>
      <p className="text-base font-medium">Drop a folder or zip here</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Static HTML, CSS, and JS only. Must include an index.html file.
      </p>
      {selectedLabel ? (
        <p className="mt-4 rounded-md border bg-background px-3 py-2 text-sm">{selectedLabel}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => folderInputRef.current?.click()}
        >
          <FolderUp className="size-4" />
          Choose folder
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => zipInputRef.current?.click()}
        >
          Choose zip
        </Button>
      </div>
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        multiple
        disabled={disabled}
        {...({ webkitdirectory: "", directory: "" } as InputHTMLAttributes<HTMLInputElement>)}
        onChange={(event) => {
          handleFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={zipInputRef}
        type="file"
        className="hidden"
        accept=".zip,application/zip"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
