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
        history.push({
          date,
          weight: exercise.weight,
          reps: exercise.reps,
          sets: exercise.sets,
          volume: exercise.weight * exercise.reps * exercise.sets,
        });
      }
    });
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

function ExerciseHistory({ history }) {
  if (history.length === 0) return null;

  const maxWeightEntry = history.reduce((max, item) => {
    return item.weight > max.weight ? item : max;
  }, history[0]);

  const previousSession = history[history.length - 1];
  const chartData = history.slice(-8);

  const maxChartWeight = Math.max(...chartData.map((item) => item.weight), 1);

  const points = chartData
    .map((item, index) => {
      const x =
        chartData.length === 1
          ? 150
          : 20 + (index * 260) / (chartData.length - 1);

      const y = 150 - (item.weight / maxChartWeight) * 110;

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
          <span>Máximo peso</span>
          <strong>{maxWeightEntry.weight} kg</strong>
          <small>{formatDisplayDate(maxWeightEntry.date)}</small>
        </div>

        <div>
          <span>Sesión anterior</span>
          <strong>{previousSession.weight} kg</strong>
          <small>
            {previousSession.reps} reps · {previousSession.sets} series
          </small>
        </div>
      </div>

      <div className="history-chart">
        <svg viewBox="0 0 300 170" role="img" aria-label="Gráfico de historial de peso">
          <line x1="20" y1="150" x2="285" y2="150" />
          <line x1="20" y1="25" x2="20" y2="150" />

          <polyline points={points} />

          {chartData.map((item, index) => {
            const x =
              chartData.length === 1
                ? 150
                : 20 + (index * 260) / (chartData.length - 1);

            const y = 150 - (item.weight / maxChartWeight) * 110;

            return (
              <g key={`${item.date}-${index}`}>
                <circle cx={x} cy={y} r="5" />
                <text x={x} y={y - 10} textAnchor="middle">
                  {item.weight}kg
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="history-note">
        Último registro: {previousSession.weight} kg · {previousSession.reps} reps ·{" "}
        {previousSession.sets} series el {formatDisplayDate(previousSession.date)}.
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
          <button type="button" onClick={() => startCountdown("timer")}>
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
  const [editingExerciseId, setEditingExerciseId] = useState(null);

  useEffect(() => {
    localStorage.setItem("gym-workouts", JSON.stringify(workouts));
  }, [workouts]);

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

  function changeMonth(direction) {
    setCurrentDate(new Date(year, month + direction, 1));
  }

  function handleSaveExercise(event) {
    event.preventDefault();

    const finalExerciseName =
      exerciseName === "otro" ? customExercise.trim() : exerciseName;

    if (!finalExerciseName || !weight || !reps || !sets) {
      alert("Completa ejercicio, peso, repeticiones y series.");
      return;
    }

    const exerciseData = {
      categoryId,
      exerciseName: finalExerciseName,
      weight: Number(weight),
      reps: Number(reps),
      sets: Number(sets),
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
    setCustomExercise("");
    setEditingExerciseId(null);
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

    setEditingExerciseId(exercise.id);
    setCategoryId(exercise.categoryId);

    if (isDefaultExercise) {
      setExerciseName(exercise.exerciseName);
      setCustomExercise("");
    } else {
      setExerciseName("otro");
      setCustomExercise(exercise.exerciseName);
    }

    setWeight(String(exercise.weight));
    setReps(String(exercise.reps));
    setSets(String(exercise.sets));
  }

  function cancelEditExercise() {
    setEditingExerciseId(null);
    setWeight("");
    setReps("");
    setSets("");
    setCustomExercise("");
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
      {activeTab === "entreno" && (
  <> 
      <section className="header">
        <div>
          <p className="eyebrow">Gym Tracker</p>
          <h1>Registro de entrenamiento</h1>
        </div>
        <button className="today-button" onClick={() => setSelectedDate(getToday())}>
          Hoy
        </button>
      </section>

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
                onClick={() => setSelectedDate(dateKey)}
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

      <section className="detail-card">
        <div className="detail-header">
          <div>
            <p className="eyebrow">Día seleccionado</p>
            <h2>{selectedDate}</h2>
          </div>
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
                  <p>
                    {exercise.weight} kg · {exercise.reps} reps · {exercise.sets} series
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
            <ExerciseHistory history={currentExerciseHistory} />
          )}

          <div className="form-row">
            <label>
              Peso kg
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
              Series
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="4"
                min="0"
              />
            </label>
          </div>

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
      </>
)}
      {activeTab === "tempo" && <TempoScreen />}
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
