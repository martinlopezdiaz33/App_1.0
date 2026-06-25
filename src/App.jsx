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

function TempoScreen() {
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const [timerMinutes, setTimerMinutes] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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

  function startTimer() {
    if (timerSeconds === 0) {
      setTimerSeconds(timerMinutes * 60);
    }

    setIsTimerRunning(true);
  }

  function resetTimer() {
    setIsTimerRunning(false);
    setTimerSeconds(timerMinutes * 60);
  }

  function handleTimerMinutesChange(value) {
    const minutes = Number(value);

    setTimerMinutes(minutes);
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(false);
  }

  return (
    <section className="tempo-screen">
      <div className="tempo-card">
        <p className="eyebrow">Tempo</p>
        <h2>Cronómetro</h2>

        <div className="tempo-display">{formatTime(stopwatchSeconds)}</div>

        <div className="tempo-actions">
          <button onClick={() => setIsStopwatchRunning(true)}>Iniciar</button>
          <button onClick={() => setIsStopwatchRunning(false)}>Pausar</button>
          <button
            onClick={() => {
              setIsStopwatchRunning(false);
              setStopwatchSeconds(0);
            }}
          >
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
          <button onClick={startTimer}>Iniciar</button>
          <button onClick={() => setIsTimerRunning(false)}>Pausar</button>
          <button onClick={resetTimer}>Reiniciar</button>
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

  useEffect(() => {
    localStorage.setItem("gym-workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    setExerciseName(EXERCISES[categoryId]?.[0] || "");
    setCustomExercise("");
  }, [categoryId]);

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

    const newExercise = {
      id: crypto.randomUUID(),
      categoryId,
      exerciseName: finalExerciseName,
      weight: Number(weight),
      reps: Number(reps),
      sets: Number(sets),
    };

    setWorkouts((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newExercise],
    }));

    setWeight("");
    setReps("");
    setSets("");
    setCustomExercise("");
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
                    <button onClick={() => deleteExercise(exercise.id)}>Eliminar</button>
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
        <p className="eyebrow">Agregar ejercicio</p>
        <h2>Nueva entrada</h2>

        <form onSubmit={handleSaveExercise}>
          <label>
            Tipo de entrenamiento
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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
            Guardar ejercicio
          </button>
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
    <small>Tempo</small>
  </button>
</nav>
    </main>
  );
}

export default App;
