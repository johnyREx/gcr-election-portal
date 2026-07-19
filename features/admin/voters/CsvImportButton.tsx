"use client";

import { ChangeEvent, useRef, useState } from "react";
import Papa from "papaparse";

import {
  AdminVoter,
  importVoters,
  VoterImportRecord,
} from "@/services/electionService";

interface CsvImportButtonProps {
  onImportComplete: (voters: AdminVoter[]) => void;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
}

type CsvRow = {
  name?: string;
  Name?: string;
  fullName?: string;
  "Full Name"?: string;
  dateOfBirth?: string;
  DateOfBirth?: string;
  dob?: string;
  DOB?: string;
  "Date of Birth"?: string;
};

export default function CsvImportButton({
  onImportComplete,
  onMessage,
  onError,
}: CsvImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    onMessage("");
    onError("");

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,

      transformHeader(header) {
        return header.trim().replace(/^\uFEFF/, "");
      },

      async complete(result) {
        if (result.errors.length > 0) {
          onError(
            result.errors[0]?.message || "The CSV file could not be read."
          );
          return;
        }

        const records: VoterImportRecord[] = result.data
          .map((row) => ({
            name: String(
              row.name ||
                row.Name ||
                row.fullName ||
                row["Full Name"] ||
                ""
            ).trim(),

            dateOfBirth: String(
              row.dateOfBirth ||
                row.DateOfBirth ||
                row.dob ||
                row.DOB ||
                row["Date of Birth"] ||
                ""
            ).trim(),
          }))
          .filter((row) => row.name || row.dateOfBirth);

        if (records.length === 0) {
          onError(
            "No voters were found. Use the columns name and dateOfBirth."
          );
          return;
        }

        try {
          setIsImporting(true);

          const response = await importVoters(records);

          if (!response.success) {
            onError(response.message || "Unable to import voters.");
            return;
          }

          onImportComplete(response.voters || []);

          onMessage(
            `${response.importedCount} imported, ` +
              `${response.duplicateCount} duplicates skipped, ` +
              `${response.errorCount} invalid rows.`
          );
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : "Unable to import voters."
          );
        } finally {
          setIsImporting(false);
        }
      },

      error(error) {
        onError(error.message || "Unable to read the CSV file.");
      },
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isImporting}
        className="rounded-md border border-green-700 px-5 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isImporting ? "Importing..." : "Upload CSV"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        disabled={isImporting}
        className="hidden"
      />
    </>
  );
}