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

type CsvRow = Record<string, string | undefined>;

type CsvGender = VoterImportRecord["gender"];

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getCsvValue(
  row: CsvRow,
  possibleHeaders: string[]
): string {
  const normalizedHeaders = possibleHeaders.map(normalizeHeader);

  for (const [key, value] of Object.entries(row)) {
    if (
      normalizedHeaders.includes(normalizeHeader(key)) &&
      value !== undefined &&
      value !== null
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function normalizeGender(value: string): CsvGender | null {
  const gender = value.trim().toLowerCase();

  if (gender === "male" || gender === "m") {
    return "Male";
  }

  if (gender === "female" || gender === "f") {
    return "Female";
  }

  return null;
}

export default function CsvImportButton({
  onImportComplete,
  onMessage,
  onError,
}: CsvImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    onMessage("");
    onError("");
    setIsImporting(true);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: "greedy",

      transformHeader(header) {
        return header.trim().replace(/^\uFEFF/, "");
      },

      async complete(result) {
        try {
          if (result.errors.length > 0) {
            onError(
              result.errors[0]?.message ||
                "The CSV file could not be read."
            );
            return;
          }

          const records: VoterImportRecord[] = [];
          const validationErrors: string[] = [];

          result.data.forEach((row, index) => {
            const rowNumber = index + 2;

            const name = getCsvValue(row, [
              "name",
              "fullName",
              "Full Name",
              "Voter Name",
            ]);

            const genderInput = getCsvValue(row, [
              "gender",
              "sex",
            ]);

            const location = getCsvValue(row, [
              "city",
              "location",
              "town",
            ]);

            if (!name && !genderInput && !location) {
              return;
            }

            if (!name) {
              validationErrors.push(
                `Row ${rowNumber}: Full name is missing.`
              );
              return;
            }

            const gender = normalizeGender(genderInput);

            if (!gender) {
              validationErrors.push(
                `Row ${rowNumber}: Gender must be Male or Female.`
              );
              return;
            }

            if (!location) {
              validationErrors.push(
                `Row ${rowNumber}: City is missing.`
              );
              return;
            }

            records.push({
              name,
              gender,
              location,
            });
          });

          if (validationErrors.length > 0) {
            onError(
              `CSV validation failed:\n${validationErrors
                .slice(0, 10)
                .join("\n")}${
                validationErrors.length > 10
                  ? `\n...and ${
                      validationErrors.length - 10
                    } more error(s).`
                  : ""
              }`
            );
            return;
          }

          if (records.length === 0) {
            onError(
              "No valid voters found. Your CSV must contain the columns: name, gender, city."
            );
            return;
          }

          const response = await importVoters(records);

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
        onError(
          error.message || "Unable to read the CSV file."
        );
        setIsImporting(false);
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