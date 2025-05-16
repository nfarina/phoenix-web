import { useEffect, useRef, useState } from "react";
import { Sun } from "react-feather";
import { useLocalStorage } from "../utils/useLocalStorage";
import { useWakeLock } from "../utils/useWakeLock";
import Button from "./Button";
import ImportWorkout from "./ImportWorkout";
import InstallDialog from "./InstallDialog";
import logoWhite from "/assets/logo-horizontal-white.png";
import logo from "/assets/logo-horizontal.png";

// Check if the app is already installed
const isInstalled =
  typeof window !== "undefined" &&
  "standalone" in window.navigator &&
  (window.navigator as any).standalone;

interface Exercise {
  id: number;
  name: string;
  defaultLoad: number;
  sets: number;
  completedSets: { load: number; reps: string }[];
  note: string;
}

const DEFAULT_EXERCISES: Omit<Exercise, "completedSets">[] = [
  { id: 1, name: "Double‑DB Front Squat", defaultLoad: 40, sets: 3, note: "" },
  { id: 2, name: "Dumbbell Bench Press", defaultLoad: 40, sets: 3, note: "" },
  { id: 3, name: "Seated Overhead Press", defaultLoad: 20, sets: 4, note: "" },
];

const LS_KEY = "WorkoutTracker:exercises";
const BEEP_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

const initState = () =>
  DEFAULT_EXERCISES.map((ex) => ({
    ...ex,
    completedSets: Array(ex.sets).fill({ reps: "", load: ex.defaultLoad }),
    note: "",
  }));

export default function App() {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>(
    LS_KEY,
    initState,
  );
  const [rest, setRest] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const timerRef = useRef<number>(0);
  const beepRef = useRef<HTMLAudioElement>(new Audio(BEEP_URL));

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.classList.contains("dark")
    );
  });

  const { isSupported, isActive, requestWakeLock, releaseWakeLock } =
    useWakeLock();

  // Rest timer effect
  useEffect(() => {
    if (!restActive) return;
    if (rest === 0) {
      stopRest();
      beepRef.current.play().catch(() => {});
      alert("Rest complete – back to work!");
      return;
    }
    timerRef.current = window.setTimeout(() => setRest((s) => s - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [rest, restActive]);

  const startRest = (seconds = 60) => {
    setRest(seconds);
    setRestActive(true);
  };
  const stopRest = () => {
    clearTimeout(timerRef.current);
    setRestActive(false);
    setRest(0);
  };
  const toggleRest = () => (restActive ? stopRest() : startRest());

  const updateSet = (
    id: number,
    idx: number,
    field: "load" | "reps",
    val: number | string,
  ) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              completedSets: ex.completedSets.map((s, i) =>
                i === idx ? { ...s, [field]: val } : s,
              ),
            }
          : ex,
      ),
    );
  };

  const updateNote = (id: number, val: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, note: val } : ex)),
    );
  };

  const resetWorkout = () => setExercises(initState());

  const importWorkout = (workoutData: Omit<Exercise, "completedSets">[]) => {
    // Transform imported data to include completedSets
    const newExercises = workoutData.map((ex) => ({
      ...ex,
      completedSets: Array(ex.sets).fill({ reps: "", load: ex.defaultLoad }),
      note: ex.note || "",
    }));
    setExercises(newExercises);
  };

  const exportReport = () => {
    const date = new Date().toLocaleDateString();
    const lines = exercises.map((ex) => {
      const sets = ex.completedSets
        .map((s) => `${s.load}lb x${s.reps || "?"}`)
        .join(", ");
      return `${ex.name}: ${sets}${ex.note ? ` (${ex.note})` : ""}`;
    });
    navigator.clipboard
      .writeText(`${date}\n${lines.join("\n")}`)
      .then(() => alert("Report copied to clipboard!"));
  };

  return (
    <main className="h-full flex flex-col dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <nav className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-xs px-5">
        <div className="flex items-center">
          <img
            style={{
              width: "125px",
              height: "auto",
            }}
            src={isDarkMode ? logoWhite : logo}
            alt="Phoenix Workout Logo"
          />
        </div>
        <div className="flex gap-2 p-2 items-center">
          {!isInstalled && (
            <button
              onClick={() => setShowInstallDialog(true)}
              className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 !py-1 !px-3 rounded-full"
            >
              Install app
            </button>
          )}
          <Button onClick={() => setShowImportDialog(true)}>Import</Button>
          <Button onClick={exportReport}>Export</Button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {exercises.map((ex) => (
          <section
            key={ex.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{ex.name}</span>
              <Button
                onClick={toggleRest}
                className={`!py-1 !px-3 !text-sm ${
                  restActive
                    ? "!bg-orange-500 hover:!bg-orange-600"
                    : "!bg-gray-200 dark:!bg-gray-700 !text-gray-700 dark:!text-gray-200"
                }`}
              >
                {restActive ? `Rest: ${rest}s` : "Rest 60s"}
              </Button>
            </div>

            {ex.completedSets.map((set, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[80px_80px_1fr] gap-2 items-center"
              >
                <input
                  type="number"
                  value={set.load}
                  onChange={(e) =>
                    updateSet(ex.id, idx, "load", Number(e.target.value))
                  }
                  className="border-gray-200 dark:border-gray-700 border rounded p-1 text-center dark:bg-gray-900"
                />
                <input
                  type="number"
                  value={set.reps}
                  onChange={(e) =>
                    updateSet(ex.id, idx, "reps", e.target.value)
                  }
                  className="border-gray-200 dark:border-gray-700 border rounded p-1 text-center dark:bg-gray-900"
                />
                <span className="text-sm text-gray-500">Set {idx + 1}</span>
              </div>
            ))}

            <textarea
              className="w-full border-gray-200 dark:border-gray-700 border rounded p-2 text-sm dark:bg-gray-900"
              placeholder="Notes…"
              value={ex.note}
              onChange={(e) => updateNote(ex.id, e.target.value)}
            />
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-700 px-5 py-3 flex flex-row gap-2 shadow-inner justify-between">
        <Button onClick={toggleRest} className="!p-2 !px-6">
          {restActive ? "Stop rest" : "Start rest"}
        </Button>
        {isSupported && (
          <Button
            onClick={() => (isActive ? releaseWakeLock() : requestWakeLock())}
            className={`!p-3 aspect-square ${
              isActive
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`}
            aria-label={isActive ? "Turn screen lock off" : "Keep screen on"}
            title={isActive ? "Turn screen lock off" : "Keep screen on"}
          >
            <Sun size={20} />
          </Button>
        )}
      </footer>

      <InstallDialog
        isOpen={showInstallDialog}
        onClose={() => setShowInstallDialog(false)}
      />

      <ImportWorkout
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={importWorkout}
      />
    </main>
  );
}
