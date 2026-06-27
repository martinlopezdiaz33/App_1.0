import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  { id: "pierna", name: "Pierna", color: "#2563eb" },
  { id: "pecho", name: "Pecho", color: "#dc2626" },
  { id: "espalda", name: "Espalda", color: "#ca8a04" },
  { id: "hombro", name: "Hombro", color: "#16a34a" },
  { id: "brazos", name: "Brazos", color: "#9333ea" },
  { id: "abdomen", name: "Abdomen", color: "#ea580c" },
  { id: "cardio", name: "Cardio", color: "#0891b2" },
  { id: "fullbody", name: "Full Body", color: "#111827" },
  { id: "descanso", name: "Descanso", color: "#6b7280" },
];

const EXERCISES = {
  pierna: [
    "Sentadilla",
    "Prensa",
    "Extensión de cuádriceps",
    "Curl femoral",
    "Peso muerto rumano",
    "Hip thrust",
    "Gemelos",
  ],
  pecho: [
    "Press banca",
    "Press inclinado con mancuerna",
    "Press plano con mancuerna",
    "Aperturas",
    "Fondos en paralelas",
    "Cruce de poleas",
  ],
  espalda: [
    "Jalón al pecho",
    "Remo sentado",
    "Remo con barra",
    "Dominadas",
    "Peso muerto",
    "Pull over en polea",
  ],
  hombro: [
    "Press militar",
    "Elevaciones laterales",
    "Elevaciones frontales",
    "Pájaros",
    "Face pull",
  ],
  brazos: [
    "Curl bíceps",
    "Curl martillo",
    "Extensión tríceps polea",
    "Press francés",
    "Fondos tríceps",
  ],
  abdomen: ["Crunch", "Plancha", "Elevación de piernas", "Abdominal en máquina"],
  cardio: ["Caminadora", "Bicicleta", "Elíptica", "Escaladora"],
  fullbody: ["Circuito full body", "Funcional", "Cross training"],
  descanso: ["Descanso activo", "Movilidad", "Caminata suave"],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDate(new Date());
}

function getCategoryById(id) {
  return CATEGORIES.find((category) => category.id === id);
}

const KG_TO_LB = 2.2046226218;

function getDisplayWeight(weightKg, unit) {
  const numericWeight = Number(weightKg) || 0;
  return unit === "lb" ? numericWeight * KG_TO_LB : numericWeight;
}

function formatWeightNumber(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function formatWeight(weightKg, unit) {
  const displayWeight = getDisplayWeight(weightKg, unit);
  return `${formatWeightNumber(displayWeight)} ${unit}`;
}

function formatInputWeight(weightKg, unit) {
  const displayWeight = getDisplayWeight(weightKg, unit);
  return formatWeightNumber(displayWeight);
}

function inputWeightToKg(value, unit) {
  const numericWeight = Number(value);

  if (Number.isNaN(numericWeight)) return 0;

  const weightKg = unit === "lb" ? numericWeight / KG_TO_LB : numericWeight;

  return Number(weightKg.toFixed(2));
}

function formatDuration(totalSeconds) {
  const numericSeconds = Number(totalSeconds) || 0;
  const minutes = Math.floor(numericSeconds / 60);
  const seconds = numericSeconds % 60;

  if (minutes <= 0) {
    return `${seconds} s`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")} min`;
}

function getExerciseMeasurementType(exercise) {
  return exercise.measurementType || (exercise.durationSeconds ? "time" : "weight");
}

function createSetRow(weight = "", reps = "", completed = false, durationSeconds = "") {
  return {
    id: crypto.randomUUID(),
    weight,
    reps,
    durationSeconds,
    completed,
  };
}

function buildSetRows(
  count,
  baseWeight = "",
  baseReps = "",
  existingRows = [],
  baseDurationSeconds = ""
) {
  const safeCount = Math.max(Number(count) || 0, 0);

  return Array.from({ length: safeCount }, (_, index) => {
    const existingRow = existingRows[index];

    if (existingRow) {
      return existingRow;
    }

    return createSetRow(baseWeight, baseReps, false, baseDurationSeconds);
  });
}

function getSetDetails(exercise) {
  if (Array.isArray(exercise.setsDetails) && exercise.setsDetails.length > 0) {
    return exercise.setsDetails.map((set, index) => ({
      id: set.id || `set-${exercise.id}-${index}`,
      weight: Number(set.weight) || 0,
      reps: Number(set.reps) || 0,
      durationSeconds: Number(set.durationSeconds) || 0,
      completed: Boolean(set.completed),
    }));
  }

  const legacySetCount = Number(exercise.sets) || 0;
  const measurementType = getExerciseMeasurementType(exercise);

  return Array.from({ length: legacySetCount }, (_, index) => ({
    id: `legacy-${exercise.id}-${index}`,
    weight: measurementType === "weight" ? Number(exercise.weight) || 0 : 0,
    reps: measurementType === "weight" ? Number(exercise.reps) || 0 : 0,
    durationSeconds:
      measurementType === "time" ? Number(exercise.durationSeconds) || 0 : 0,
    completed: true,
  }));
}

function getCompletedSetDetails(exercise) {
  return getSetDetails(exercise).filter((set) => set.completed);
}

function getBestSet(exercise) {
  const measurementType = getExerciseMeasurementType(exercise);
  const completedSets = getCompletedSetDetails(exercise);
  const allSets = getSetDetails(exercise);
  const setsToReview = completedSets.length > 0 ? completedSets : allSets;

  if (setsToReview.length === 0) {
    return {
      weight: Number(exercise.weight) || 0,
      reps: Number(exercise.reps) || 0,
      durationSeconds: Number(exercise.durationSeconds) || 0,
    };
  }

  if (measurementType === "time") {
    return setsToReview.reduce((best, current) => {
      return Number(current.durationSeconds) > Number(best.durationSeconds)
        ? current
        : best;
    }, setsToReview[0]);
  }

  return setsToReview.reduce((best, current) => {
    if (Number(current.weight) > Number(best.weight)) return current;

    if (
      Number(current.weight) === Number(best.weight) &&
      Number(current.reps) > Number(best.reps)
    ) {
      return current;
    }

    return best;
  }, setsToReview[0]);
}

function getExerciseSummary(exercise, weightUnit) {
  const measurementType = getExerciseMeasurementType(exercise);
  const allSets = getSetDetails(exercise);
  const completedSets = getCompletedSetDetails(exercise);
  const bestSet = getBestSet(exercise);

  if (measurementType === "time") {
    return `${completedSets.length}/${allSets.length} series completadas · Máx ${formatDuration(
      bestSet.durationSeconds
    )}`;
  }

  return `${completedSets.length}/${allSets.length} series completadas · Máx ${formatWeight(
    bestSet.weight,
    weightUnit
  )} · ${bestSet.reps} reps`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function getExerciseHistory(workouts, exerciseName, selectedDate) {
  if (!exerciseName) return [];

  const normalizedExerciseName = normalizeText(exerciseName);
  const history = [];

  Object.entries(workouts).forEach(([date, exercises]) => {
    if (date >= selectedDate) return;

    exercises.forEach((exercise) => {
      if (normalizeText(exercise.exerciseName) === normalizedExerciseName) {
        const measurementType = getExerciseMeasurementType(exercise);
        const bestSet = getBestSet(exercise);
        const completedSets = getCompletedSetDetails(exercise);
        const completedSetCount = completedSets.length;

        history.push({
          date,
          measurementType,
          weight: bestSet.weight,
          reps: bestSet.reps,
          durationSeconds: bestSet.durationSeconds,
          sets: completedSetCount,
          volume:
            measurementType === "time"
              ? bestSet.durationSeconds * Math.max(completedSetCount, 1)
              : bestSet.weight * bestSet.reps * Math.max(completedSetCount, 1),
        });
      }
    });
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

function ExerciseHistory({ history, weightUnit }) {
  if (history.length === 0) return null;

  const measurementType = history[0]?.measurementType || "weight";
  const isTimeExercise = measurementType === "time";

  const maxEntry = history.reduce((max, item) => {
    if (isTimeExercise) {
      return Number(item.durationSeconds) > Number(max.durationSeconds)
        ? item
        : max;
    }

    return Number(item.weight) > Number(max.weight) ? item : max;
  }, history[0]);

  const previousSession = history[history.length - 1];
  const chartData = history;

  const chartWidth = Math.max(300, chartData.length * 72);

  function getChartValue(item) {
    return isTimeExercise
      ? Number(item.durationSeconds) || 0
      : getDisplayWeight(item.weight, weightUnit);
  }

  const maxChartValue = Math.max(...chartData.map((item) => getChartValue(item)), 1);

  const points = chartData
    .map((item, index) => {
      const x =
        chartData.length === 1
          ? chartWidth / 2
          : 24 + (index * (chartWidth - 56)) / (chartData.length - 1);

      const y = 145 - (getChartValue(item) / maxChartValue) * 105;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="history-card">
      <div className="history-header">
        <div>
          <p className="eyebrow">Historial</p>
          <h3>Progreso anterior</h3>
        </div>
        <span className="history-count">{history.length} registros</span>
      </div>

      <div className="history-stats">
        <div>
          <span>{isTimeExercise ? "Mayor tiempo" : "Máximo peso"}</span>
          <strong>
            {isTimeExercise
              ? formatDuration(maxEntry.durationSeconds)
              : formatWeight(maxEntry.weight, weightUnit)}
          </strong>
          <small>{formatDisplayDate(maxEntry.date)}</small>
        </div>

        <div>
          <span>Sesión anterior</span>
          <strong>
            {isTimeExercise
              ? formatDuration(previousSession.durationSeconds)
              : formatWeight(previousSession.weight, weightUnit)}
          </strong>
          <small>
            {isTimeExercise
              ? `${previousSession.sets} series completadas`
              : `${previousSession.reps} reps · ${previousSession.sets} series`}
          </small>
        </div>
      </div>

      <div className="history-chart">
        <svg
          viewBox={`0 0 ${chartWidth} 190`}
          role="img"
          aria-label="Gráfico de historial completo"
        >
          <line x1="24" y1="145" x2={chartWidth - 24} y2="145" />
          <line x1="24" y1="30" x2="24" y2="145" />

          <polyline points={points} />

          {chartData.map((item, index) => {
            const x =
              chartData.length === 1
                ? chartWidth / 2
                : 24 + (index * (chartWidth - 56)) / (chartData.length - 1);

            const y = 145 - (getChartValue(item) / maxChartValue) * 105;

            return (
              <g key={`${item.date}-${index}`}>
                <circle cx={x} cy={y} r="5" />

                <text x={x} y={y - 10} textAnchor="middle">
                  {isTimeExercise
                    ? formatDuration(item.durationSeconds)
                    : formatWeight(item.weight, weightUnit)}
                </text>

                <text x={x} y="170" textAnchor="middle" className="history-date-label">
                  {formatDisplayDate(item.date).slice(0, 5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="history-note">
        Último registro:{" "}
        {isTimeExercise
          ? formatDuration(previousSession.durationSeconds)
          : formatWeight(previousSession.weight, weightUnit)}
        {isTimeExercise
          ? ` · ${previousSession.sets} series completadas`
          : ` · ${previousSession.reps} reps · ${previousSession.sets} series`}{" "}
        el {formatDisplayDate(previousSession.date)}.
      </p>
    </div>
  );
}

function TempoScreen() {
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const [timerMinutes, setTimerMinutes] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [countdown, setCountdown] = useState(3);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(null);

  useEffect(() => {
    if (!isStopwatchRunning) return;

    const interval = setInterval(() => {
      setStopwatchSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!isCountdownActive) return;

    const timeout = setTimeout(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsCountdownActive(false);

          if (countdownTarget === "stopwatch") {
            setIsStopwatchRunning(true);
          }

          if (countdownTarget === "timer") {
            setIsTimerRunning(true);
          }

          setCountdownTarget(null);
          return 3;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isCountdownActive, countdown, countdownTarget]);

  function startCountdown(target) {
    if (isCountdownActive) return;

    if (target === "stopwatch" && isStopwatchRunning) return;
    if (target === "timer" && isTimerRunning) return;

    if (target === "timer" && timerSeconds === 0) {
      setTimerSeconds(timerMinutes * 60);
    }

    setCountdown(3);
    setCountdownTarget(target);
    setIsCountdownActive(true);
  }

  function pauseStopwatch() {
    setIsStopwatchRunning(false);

    if (countdownTarget === "stopwatch") {
      setIsCountdownActive(false);
      setCountdownTarget(null);
      setCountdown(3);
    }
  }

  function resetStopwatch() {
    setIsStopwatchRunning(false);
    setIsCountdownActive(false);
    setCountdownTarget(null);
    setStopwatchSeconds(0);
    setCountdown(3);
  }
  
  function startTimer() {
    if (isTimerRunning) return;

    if (timerSeconds === 0) {
      setTimerSeconds(timerMinutes * 60);
    }

    setIsTimerRunning(true);
  }
  
  function pauseTimer() {
    setIsTimerRunning(false);

    if (countdownTarget === "timer") {
      setIsCountdownActive(false);
      setCountdownTarget(null);
      setCountdown(3);
    }
  }

  function resetTimer() {
    setIsTimerRunning(false);
    setIsCountdownActive(false);
    setCountdownTarget(null);
    setTimerSeconds(timerMinutes * 60);
    setCountdown(3);
  }

  function handleTimerMinutesChange(value) {
    const minutes = Number(value);

    setTimerMinutes(minutes);
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(false);
    setIsCountdownActive(false);
    setCountdownTarget(null);
    setCountdown(3);
  }

  return (
    <section className="tempo-screen">
      {isCountdownActive && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdown}</div>
          <p>
            {countdownTarget === "timer"
              ? "Comienza el descanso"
              : "Prepárate para entrenar"}
          </p>
        </div>
      )}

      <div className="tempo-card">
        <p className="eyebrow">Tiempo</p>
        <h2>Cronómetro</h2>

        <div className="tempo-display">{formatTime(stopwatchSeconds)}</div>

        <div className="tempo-actions">
          <button type="button" onClick={() => startCountdown("stopwatch")}>
            Iniciar
          </button>
          <button type="button" onClick={pauseStopwatch}>
            Pausar
          </button>
          <button type="button" onClick={resetStopwatch}>
            Reiniciar
          </button>
        </div>
      </div>

      <div className="tempo-card">
        <p className="eyebrow">Descanso</p>
        <h2>Temporizador</h2>

        <label>
          Minutos
          <select
            value={timerMinutes}
            onChange={(event) => handleTimerMinutesChange(event.target.value)}
          >
            <option value="1">1 minuto</option>
            <option value="2">2 minutos</option>
            <option value="3">3 minutos</option>
            <option value="4">4 minutos</option>
            <option value="5">5 minutos</option>
          </select>
        </label>

        <div className="tempo-display">{formatTime(timerSeconds)}</div>

        <div className="tempo-actions">
          <button type="button" onClick={startTimer}>
            Iniciar
          </button>
          <button type="button" onClick={pauseTimer}>
            Pausar
          </button>
          <button type="button" onClick={resetTimer}>
            Reiniciar
          </button>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("entreno");
  const [trainingView, setTrainingView] = useState("calendar");
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem("gym-workouts");
    return saved ? JSON.parse(saved) : {};
  });

  const [categoryId, setCategoryId] = useState("pierna");
  const [exerciseName, setExerciseName] = useState(EXERCISES.pierna[0]);
  const [customExercise, setCustomExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [setRows, setSetRows] = useState([]);
  const [measurementType, setMeasurementType] = useState("weight");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem("gym-weight-unit") || "kg";
  });

  useEffect(() => {
    localStorage.setItem("gym-workouts", JSON.stringify(workouts));
  }, [workouts]);

    useEffect(() => {
    localStorage.setItem("gym-weight-unit", weightUnit);
  }, [weightUnit]);

  useEffect(() => {
    if (editingExerciseId) return;

    setExerciseName(EXERCISES[categoryId]?.[0] || "");
    setCustomExercise("");
  }, [categoryId, editingExerciseId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let startWeekDay = firstDay.getDay();
    startWeekDay = startWeekDay === 0 ? 6 : startWeekDay - 1;

    const days = [];

    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month]);

  const selectedWorkouts = workouts[selectedDate] || [];

  const currentExerciseName =
    exerciseName === "otro" ? customExercise.trim() : exerciseName;

  const currentExerciseHistory = getExerciseHistory(
    workouts,
    currentExerciseName,
    selectedDate
  );

  function toggleWeightUnit() {
    const nextUnit = weightUnit === "kg" ? "lb" : "kg";

    if (weight) {
      const currentWeightKg = inputWeightToKg(weight, weightUnit);
      setWeight(formatInputWeight(currentWeightKg, nextUnit));
    }

    setWeightUnit(nextUnit);
  }

  function updateMeasurementType(newMeasurementType) {
    setMeasurementType(newMeasurementType);
    setWeight("");
    setReps("");
    setDurationSeconds("");

    const count = Number(sets) || 0;
    setSetRows(buildSetRows(count, "", "", [], ""));
  }

  function updatePlannedSets(value) {
    setSets(value);

    const count = Number(value) || 0;

    if (measurementType === "time") {
      setSetRows((prevRows) =>
        buildSetRows(count, "", "", prevRows, durationSeconds)
      );
      return;
    }

    setSetRows((prevRows) => buildSetRows(count, weight, reps, prevRows, ""));
  }

  function updateSetRow(rowId, field, value) {
    setSetRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          [field]: value,
        };
      })
    );
  }

  function applyBaseValuesToSeries() {
    const count = Number(sets) || 1;

    setSets(String(count));

    if (measurementType === "time") {
      setSetRows(
        Array.from({ length: count }, () =>
          createSetRow("", "", false, durationSeconds)
        )
      );
      return;
    }

    setSetRows(
      Array.from({ length: count }, () => createSetRow(weight, reps, false, ""))
    );
  }  
  function openTrainingDay(dateKey) {
    setSelectedDate(dateKey);
    setTrainingView("day");
    setShowExerciseForm(false);
    setEditingExerciseId(null);
  }

  function backToCalendar() {
    setTrainingView("calendar");
    setShowExerciseForm(false);
    setEditingExerciseId(null);
  }

  function openExerciseForm() {
    setShowExerciseForm(true);
  }
  
  function changeMonth(direction) {
    setCurrentDate(new Date(year, month + direction, 1));
  }
  
  function handleSaveExercise(event) {
    event.preventDefault();

    const finalExerciseName =
      exerciseName === "otro" ? customExercise.trim() : exerciseName;

    if (!finalExerciseName || !sets) {
      alert("Completa ejercicio y series planificadas.");
      return;
    }

    if (measurementType === "weight" && setRows.length === 0 && (!weight || !reps)) {
      alert("Completa peso, repeticiones y series.");
      return;
    }

    if (measurementType === "time" && setRows.length === 0 && !durationSeconds) {
      alert("Completa el tiempo en segundos y las series.");
      return;
    }

    const rowsToSave =
      setRows.length > 0
        ? setRows
        : buildSetRows(Number(sets) || 1, weight, reps, [], durationSeconds);

    const normalizedSetRows = rowsToSave.map((row, index) => {
      if (measurementType === "time") {
        return {
          id: row.id || `set-${index + 1}`,
          weight: 0,
          reps: 0,
          durationSeconds: Number(row.durationSeconds),
          completed: Boolean(row.completed),
        };
      }

      return {
        id: row.id || `set-${index + 1}`,
        weight: inputWeightToKg(row.weight, weightUnit),
        reps: Number(row.reps),
        durationSeconds: 0,
        completed: Boolean(row.completed),
      };
    });

    const hasInvalidSet =
      measurementType === "time"
        ? normalizedSetRows.some((row) => !row.durationSeconds || row.durationSeconds <= 0)
        : normalizedSetRows.some((row) => row.weight < 0 || !row.reps);

    if (normalizedSetRows.length === 0 || hasInvalidSet) {
      alert(
        measurementType === "time"
          ? "Completa el tiempo de cada serie."
          : "Completa las series con peso y repeticiones."
      );
      return;
    }

    const completedRows = normalizedSetRows.filter((row) => row.completed);
    const rowsForSummary = completedRows.length > 0 ? completedRows : normalizedSetRows;

    const bestRow =
      measurementType === "time"
        ? rowsForSummary.reduce((best, current) => {
            return current.durationSeconds > best.durationSeconds ? current : best;
          }, rowsForSummary[0])
        : rowsForSummary.reduce((best, current) => {
            if (current.weight > best.weight) return current;

            if (current.weight === best.weight && current.reps > best.reps) {
              return current;
            }

            return best;
          }, rowsForSummary[0]);

    const exerciseData = {
      categoryId,
      exerciseName: finalExerciseName,
      measurementType,
      weight: measurementType === "weight" ? bestRow.weight : 0,
      reps: measurementType === "weight" ? bestRow.reps : 0,
      durationSeconds:
        measurementType === "time" ? bestRow.durationSeconds : 0,
      sets: normalizedSetRows.length,
      setsDetails: normalizedSetRows,
    };
    if (editingExerciseId) {
      setWorkouts((prev) => {
        const updatedDay = (prev[selectedDate] || []).map((exercise) => {
          if (exercise.id !== editingExerciseId) return exercise;

          return {
            ...exercise,
            ...exerciseData,
          };
        });

        return {
          ...prev,
          [selectedDate]: updatedDay,
        };
      });
    } else {
      const newExercise = {
        id: crypto.randomUUID(),
        ...exerciseData,
      };

      setWorkouts((prev) => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newExercise],
      }));
    }

    setWeight("");
    setReps("");
    setSets("");
    setSetRows([]);
    setDurationSeconds("");
    setCustomExercise("");
    setEditingExerciseId(null);
    setShowExerciseForm(false);
  }
  
  function deleteExercise(exerciseId) {
    setWorkouts((prev) => {
      const updatedDay = (prev[selectedDate] || []).filter(
        (exercise) => exercise.id !== exerciseId
      );

      return {
        ...prev,
        [selectedDate]: updatedDay,
      };
    });

    if (editingExerciseId === exerciseId) {
      cancelEditExercise();
    }
  }

  function handleCategoryChange(newCategoryId) {
    setCategoryId(newCategoryId);
    setExerciseName(EXERCISES[newCategoryId]?.[0] || "");
    setCustomExercise("");
  }

  function startEditExercise(exercise) {
    const exercisesForCategory = EXERCISES[exercise.categoryId] || [];
    const isDefaultExercise = exercisesForCategory.includes(exercise.exerciseName);

    setShowExerciseForm(true);

    setEditingExerciseId(exercise.id);
    setCategoryId(exercise.categoryId);

    if (isDefaultExercise) {
      setExerciseName(exercise.exerciseName);
      setCustomExercise("");
    } else {
      setExerciseName("otro");
      setCustomExercise(exercise.exerciseName);
    }

    const exerciseMeasurementType = getExerciseMeasurementType(exercise);
    const exerciseSets = getSetDetails(exercise);
    const bestSet = getBestSet(exercise);

    setMeasurementType(exerciseMeasurementType);

    if (exerciseMeasurementType === "time") {
      setWeight("");
      setReps("");
      setDurationSeconds(String(bestSet.durationSeconds || ""));
    } else {
      setWeight(formatInputWeight(bestSet.weight, weightUnit));
      setReps(String(bestSet.reps));
      setDurationSeconds("");
    }

    setSets(String(exerciseSets.length));
    setSetRows(
      exerciseSets.map((set) => ({
        id: set.id || crypto.randomUUID(),
        weight:
          exerciseMeasurementType === "weight"
            ? formatInputWeight(set.weight, weightUnit)
            : "",
        reps: exerciseMeasurementType === "weight" ? String(set.reps) : "",
        durationSeconds:
          exerciseMeasurementType === "time"
            ? String(set.durationSeconds)
            : "",
        completed: Boolean(set.completed),
      }))
    );
  }

  function cancelEditExercise() {
    setEditingExerciseId(null);
    setWeight("");
    setReps("");
    setSets("");
    setSetRows([]);
    setDurationSeconds("");
    setCustomExercise("");
    setShowExerciseForm(false);
  }

  function getDotsForDate(date) {
    const dayWorkouts = workouts[date] || [];
    const uniqueCategories = [...new Set(dayWorkouts.map((item) => item.categoryId))];

    return uniqueCategories.slice(0, 4).map((catId) => getCategoryById(catId));
  }

  const monthName = currentDate.toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="app">
    <div className={activeTab === "entreno" ? "tab-panel active" : "tab-panel"}>
        <section className="header">
          <div>
            <p className="eyebrow">Gym Tracker</p>
            <h1>
              {trainingView === "calendar"
                ? "Calendario de entrenamiento"
                : "Día de entrenamiento"}
            </h1>
          </div>

          <div className="header-actions">
            <button className="unit-toggle" type="button" onClick={toggleWeightUnit}>
              {weightUnit === "kg" ? "kg → lb" : "lb → kg"}
            </button>

            {trainingView === "calendar" ? (
              <button
                className="today-button"
                type="button"
                onClick={() => openTrainingDay(getToday())}
              >
                Hoy
              </button>
            ) : (
              <button
                className="today-button"
                type="button"
                onClick={backToCalendar}
              >
                Calendario
              </button>
            )}
          </div>
        </section>
    {trainingView === "calendar" && (
      <section className="calendar-card">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>←</button>
          <h2>{monthName}</h2>
          <button onClick={() => changeMonth(1)}>→</button>
        </div>

        <div className="weekdays">
          <span>L</span>
          <span>M</span>
          <span>M</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </div>

        <div className="calendar-grid">
          {calendarDays.map((date, index) => {
            if (!date) return <div key={index} className="empty-day" />;

            const dateKey = formatDate(date);
            const isSelected = selectedDate === dateKey;
            const dots = getDotsForDate(dateKey);

            return (
              <button
                key={dateKey}
                className={`day ${isSelected ? "selected" : ""}`}
                onClick={() => openTrainingDay(dateKey)}
              >
                <span>{date.getDate()}</span>
                <div className="dots">
                  {dots.map((category) => (
                    <span
                      key={category.id}
                      className="dot"
                      style={{ backgroundColor: category.color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>
      )}

  {trainingView === "day" && (
    <>
      <section className="detail-card">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Día seleccionado</p>
              <h2>{formatDisplayDate(selectedDate)}</h2>
            </div>

            <button
              type="button"
              className="add-exercise-button"
              onClick={openExerciseForm}
            >
              + Agregar
            </button>
          </div>

        {selectedWorkouts.length === 0 ? (
          <p className="empty-message">Todavía no hay ejercicios registrados para este día.</p>
        ) : (
          <div className="exercise-list">
            {selectedWorkouts.map((exercise) => {
              const category = getCategoryById(exercise.categoryId);

              return (
                <div className="exercise-item" key={exercise.id}>
                  <div className="exercise-top">
                    <span
                      className="category-pill"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>

                    <div className="exercise-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => startEditExercise(exercise)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteExercise(exercise.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <h3>{exercise.exerciseName}</h3>
                  <p>{getExerciseSummary(exercise, weightUnit)}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
      
    {showExerciseForm && (
      <section className="form-card">
        <p className="eyebrow">
          {editingExerciseId ? "Editar ejercicio" : "Agregar ejercicio"}
        </p>
        <h2>{editingExerciseId ? "Modificar entrada" : "Nueva entrada"}</h2>

        <form onSubmit={handleSaveExercise}>
          <label>
            Tipo de entrenamiento
            <select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ejercicio
            <select value={exerciseName} onChange={(e) => setExerciseName(e.target.value)}>
              {(EXERCISES[categoryId] || []).map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
              <option value="otro">Agregar otro ejercicio</option>
            </select>
          </label>

          {exerciseName === "otro" && (
            <label>
              Nombre del ejercicio
              <input
                type="text"
                value={customExercise}
                onChange={(e) => setCustomExercise(e.target.value)}
                placeholder="Ej: Press inclinado máquina"
              />
            </label>
          )}

          {currentExerciseHistory.length > 0 && (
            <ExerciseHistory history={currentExerciseHistory} weightUnit={weightUnit} />
          )}

          <label>
            Tipo de registro
            <select
              value={measurementType}
              onChange={(event) => updateMeasurementType(event.target.value)}
            >
              <option value="weight">Peso + repeticiones</option>
              <option value="time">Tiempo</option>
            </select>
          </label>

          {measurementType === "weight" ? (
            <div className="form-row">
            <label>
              Peso ({weightUnit})
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="20"
                min="0"
              />
            </label>

            <label>
              Reps
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                min="0"
              />
            </label>

            <label>
              Series planificadas
              <input
                type="number"
                value={sets}
                onChange={(e) => updatePlannedSets(e.target.value)}
                placeholder="4"
                min="0"
              />
            </label>
          </div>
          ) : (
            <div className="form-row time-form-row">
              <label>
                Tiempo por serie (segundos)
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="45"
                  min="0"
                />
              </label>

              <label>
                Series planificadas
                <input
                  type="number"
                  value={sets}
                  onChange={(e) => updatePlannedSets(e.target.value)}
                  placeholder="3"
                  min="0"
                />
              </label>
            </div>
          )}

          {setRows.length > 0 && (
            <div className="sets-editor">
              <div className="sets-editor-header">
                <div>
                  <strong>Series del ejercicio</strong>
                  <small>Marca cada serie cuando la completes.</small>
                </div>

                <button type="button" onClick={applyBaseValuesToSeries}>
                  Aplicar base
                </button>
              </div>

                  <div
                    className={`set-row ${
                      measurementType === "time" ? "time-set-row" : ""
                    }`}
                    key={row.id}
                  >
                    <label className="set-check">
                      <input
                        type="checkbox"
                        checked={row.completed}
                        onChange={(event) =>
                          updateSetRow(row.id, "completed", event.target.checked)
                        }
                      />
                      <span>Serie {index + 1}</span>
                    </label>

                    {measurementType === "weight" ? (
                      <>
                        <label>
                          Peso ({weightUnit})
                          <input
                            type="number"
                            value={row.weight}
                            onChange={(event) =>
                              updateSetRow(row.id, "weight", event.target.value)
                            }
                            min="0"
                          />
                        </label>

                        <label>
                          Reps
                          <input
                            type="number"
                            value={row.reps}
                            onChange={(event) =>
                              updateSetRow(row.id, "reps", event.target.value)
                            }
                            min="0"
                          />
                        </label>
                      </>
                    ) : (
                      <label>
                        Tiempo (segundos)
                        <input
                          type="number"
                          value={row.durationSeconds}
                          onChange={(event) =>
                            updateSetRow(
                              row.id,
                              "durationSeconds",
                              event.target.value
                            )
                          }
                          min="0"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="save-button" type="submit">
            {editingExerciseId ? "Guardar cambios" : "Guardar ejercicio"}
          </button>

          {editingExerciseId && (
            <button
              type="button"
              className="cancel-edit-button"
              onClick={cancelEditExercise}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </section>
    )}
  </>
 )}
    </div>

    <div className={activeTab === "tempo" ? "tab-panel active" : "tab-panel"}>
      <TempoScreen />
    </div>
<nav className="bottom-nav">
  <button
    className={activeTab === "entreno" ? "nav-item active" : "nav-item"}
    onClick={() => setActiveTab("entreno")}
  >
    <span>🏋️</span>
    <small>Entreno</small>
  </button>

  <button
    className={activeTab === "tempo" ? "nav-item active" : "nav-item"}
    onClick={() => setActiveTab("tempo")}
  >
    <span>⏱️</span>
    <small>Tiempo</small>
  </button>
</nav>
    </main>
  );
}

export default App;
