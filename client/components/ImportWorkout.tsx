import { useState } from "react";
import Button from "./Button";

interface ImportWorkoutProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (exercises: any[]) => void;
}

export default function ImportWorkout({
  isOpen,
  onClose,
  onImport,
}: ImportWorkoutProps) {
  const [importData, setImportData] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      if (!Array.isArray(parsed)) {
        throw new Error("Imported data must be an array");
      }

      // Validate each exercise has the required fields
      parsed.forEach((ex) => {
        if (
          !ex.id ||
          !ex.name ||
          ex.defaultLoad === undefined ||
          ex.sets === undefined
        ) {
          throw new Error(
            "Each exercise must have id, name, defaultLoad, and sets",
          );
        }
      });

      onImport(parsed);
      onClose();
      setImportData("");
      setError("");
    } catch (err) {
      setError(
        `Invalid JSON format: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Import Workout</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Paste a workout JSON to import a new workout plan. This will replace
          your current workout.
        </p>

        <textarea
          className="w-full border-gray-200 dark:border-gray-700 border rounded p-2 text-sm dark:bg-gray-900 h-32 mb-4"
          placeholder="Paste JSON here..."
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
        />

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            className="!bg-transparent !text-gray-700 dark:!text-gray-300 border border-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button onClick={handleImport}>Import</Button>
        </div>
      </div>
    </div>
  );
}
