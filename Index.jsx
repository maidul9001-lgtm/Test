import { useState, useEffect } from "react";

const HABITS = [
  { id: "namaz", label: "নামাজ", icon: "🕌", type: "count", max: 5, unit: "ওয়াক্ত", color: "#10b981" },
  { id: "exercise", label: "ব্যায়াম", icon: "🏃", type: "number", unit: "মিনিট", color: "#3b82f6" },
  { id: "fruits", label: "ফলমূল", icon: "🍎", type: "number", unit: "গ্রাম", color: "#f59e0b" },
  { id: "water", label: "পানি", icon: "💧", type: "number", unit: "গ্লাস", color: "#06b6d4" },
  { id: "quran", label: "কুরআন তেলাওয়াত", icon: "📖", type: "number", unit: "পৃষ্ঠা", color: "#8b5cf6" },
  { id: "sleep", label: "ঘুম", icon: "🌙", type: "number", unit: "ঘন্টা", color: "#6366f1" },
  { id: "vegetables", label: "শাক-সবজি", icon: "🥦", type: "number", unit: "গ্রাম", color: "#22c55e" },
  { id: "steps", label: "হাঁটাহাঁটি", icon: "👟", type: "number", unit: "কদম", color: "#f97316" },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
  const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function toBengaliNum(n) {
  return String(n).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[d]);
}

export default function DailyTracker() {
  const [activeTab, setActiveTab] = useState("today");
  const [todayData, setTodayData] = useState({});
  const [history, setHistory] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customHabits, setCustomHabits] = useState([]);
  const [addingHabit, setAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ label: "", icon: "⭐", unit: "" });

  const today = getTodayKey();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await window.storage.get("dailytracker-history");
      if (res) {
        const all = JSON.parse(res.value);
        setHistory(all);
        if (all[today]) setTodayData(all[today]);
      }
      const ch = await window.storage.get("dailytracker-customhabits");
      if (ch) setCustomHabits(JSON.parse(ch.value));
    } catch (e) {}
  }

  async function saveDay() {
    setSaving(true);
    try {
      const updated = { ...history, [today]: todayData };
      await window.storage.set("dailytracker-history", JSON.stringify(updated));
      setHistory(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  }

  async function addCustomHabit() {
    if (!newHabit.label.trim()) return;
    const habit = {
      id: "custom_" + Date.now(),
      label: newHabit.label,
      icon: newHabit.icon || "⭐",
      type: "number",
      unit: newHabit.unit || "টি",
      color: "#a855f7",
    };
    const updated = [...customHabits, habit];
    setCustomHabits(updated);
    await window.storage.set("dailytracker-customhabits", JSON.stringify(updated));
    setNewHabit({ label: "", icon: "⭐", unit: "" });
    setAddingHabit(false);
  }

  async function removeCustomHabit(id) {
    const updated = customHabits.filter(h => h.id !== id);
    setCustomHabits(updated);
    await window.storage.set("dailytracker-customhabits", JSON.stringify(updated));
  }

  const allHabits = [...HABITS, ...customHabits];

  function setHabitValue(id, val) {
    setTodayData(prev => ({ ...prev, [id]: val }));
  }

  const historyDays = Object.keys(history).sort((a, b) => b.localeCompare(a)).slice(0, 14);

  function getScore(data) {
    let score = 0, total = 0;
    if (data.namaz != null) { score += Math.min(data.namaz, 5); total += 5; }
    if (data.exercise != null) { score += data.exercise >= 30 ? 1 : 0.5; total += 1; }
    if (data.fruits != null) { score += data.fruits >= 200 ? 1 : 0.5; total += 1; }
    if (data.water != null) { score += data.water >= 8 ? 1 : 0.5; total += 1; }
    if (data.sleep != null) { score += data.sleep >= 7 ? 1 : 0.5; total += 1; }
    return total > 0 ? Math.round((score / total) * 100) : 0;
  }

  const todayScore = getScore(todayData);

  const scoreColor = todayScore >= 80 ? "#10b981" : todayScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = todayScore >= 80 ? "চমৎকার! 🌟" : todayScore >= 50 ? "ভালো 👍" : "আরো ভালো করতে পারো 💪";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #1e1b4b, #312e81)",
        padding: "24px 20px 16px",
        borderBottom: "1px solid #334155",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>📊</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#a5b4fc" }}>দৈনিক হেলথ ট্র্যাকার</h1>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{formatDate(today)}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
        {[["today", "আজকের লগ"], ["history", "ইতিহাস"], ["manage", "ব্যবস্থাপনা"]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "12px 8px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: activeTab === tab ? "#1e293b" : "transparent",
            color: activeTab === tab ? "#a5b4fc" : "#64748b",
            borderBottom: activeTab === tab ? "2px solid #a5b4fc" : "2px solid transparent",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* Today Tab */}
      {activeTab === "today" && (
        <div style={{ padding: "16px" }}>
          {/* Score */}
          <div style={{
            background: "#1e293b", borderRadius: 16, padding: "16px", marginBottom: 16,
            border: `1px solid ${scoreColor}40`, display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%", border: `3px solid ${scoreColor}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              fontSize: 22, fontWeight: 800, color: scoreColor,
            }}>{toBengaliNum(todayScore)}%</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>আজকের স্কোর</div>
              <div style={{ color: scoreColor, fontSize: 14, marginTop: 4 }}>{scoreLabel}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>নামাজ, ঘুম, পানি, খাদ্য ও ব্যায়ামের উপর ভিত্তি করে</div>
            </div>
          </div>

          {/* Habits */}
          {allHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              value={todayData[habit.id] ?? ""}
              onChange={v => setHabitValue(habit.id, v)}
            />
          ))}

          {/* Save Button */}
          <button onClick={saveDay} disabled={saving} style={{
            width: "100%", padding: "15px", marginTop: 8, borderRadius: 14, border: "none",
            background: saved ? "#10b981" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
            color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer",
            transition: "all 0.3s",
          }}>
            {saving ? "সেভ হচ্ছে..." : saved ? "✅ সেভ হয়েছে!" : "💾 আজকের ডেটা সেভ করো"}
          </button>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div style={{ padding: "16px" }}>
          <h3 style={{ color: "#a5b4fc", marginTop: 0, fontSize: 16 }}>গত ১৪ দিনের রেকর্ড</h3>
          {historyDays.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748b", marginTop: 40, fontSize: 15 }}>
              এখনো কোনো ডেটা নেই।<br/>আজকের লগ থেকে শুরু করো!
            </div>
          ) : historyDays.map(day => {
            const data = history[day];
            const score = getScore(data);
            const sc = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <div key={day} style={{
                background: "#1e293b", borderRadius: 14, padding: "14px", marginBottom: 10,
                border: "1px solid #334155",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{formatDate(day)}</div>
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{day}</div>
                  </div>
                  <div style={{
                    width: 50, height: 50, borderRadius: "50%", border: `2px solid ${sc}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: sc,
                  }}>{toBengaliNum(score)}%</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {allHabits.filter(h => data[h.id] != null && data[h.id] !== "").map(h => (
                    <div key={h.id} style={{
                      background: "#0f172a", borderRadius: 8, padding: "4px 10px",
                      fontSize: 12, color: "#cbd5e1",
                    }}>
                      {h.icon} {h.label}: <span style={{ color: h.color, fontWeight: 600 }}>
                        {h.id === "namaz" ? toBengaliNum(data[h.id]) + " ওয়াক্ত" : toBengaliNum(data[h.id]) + " " + h.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === "manage" && (
        <div style={{ padding: "16px" }}>
          <h3 style={{ color: "#a5b4fc", marginTop: 0, fontSize: 16 }}>কাস্টম হ্যাবিট যোগ করো</h3>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: -8 }}>নিজের পছন্দমতো নতুন ট্র্যাকিং আইটেম যোগ করো।</p>

          {customHabits.map(h => (
            <div key={h.id} style={{
              background: "#1e293b", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              border: "1px solid #334155",
            }}>
              <span style={{ fontSize: 15 }}>{h.icon} {h.label} <span style={{ color: "#64748b", fontSize: 12 }}>({h.unit})</span></span>
              <button onClick={() => removeCustomHabit(h.id)} style={{
                background: "#ef444420", border: "1px solid #ef4444", color: "#ef4444",
                borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12,
              }}>মুছো</button>
            </div>
          ))}

          {!addingHabit ? (
            <button onClick={() => setAddingHabit(true)} style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "2px dashed #334155",
              background: "transparent", color: "#a5b4fc", fontSize: 15, cursor: "pointer", marginTop: 8,
            }}>+ নতুন হ্যাবিট যোগ করো</button>
          ) : (
            <div style={{ background: "#1e293b", borderRadius: 14, padding: "16px", marginTop: 8, border: "1px solid #334155" }}>
              <input
                placeholder="হ্যাবিটের নাম (যেমন: মেডিটেশন)"
                value={newHabit.label}
                onChange={e => setNewHabit(p => ({ ...p, label: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="আইকন (emoji, যেমন: 🧘)"
                value={newHabit.icon}
                onChange={e => setNewHabit(p => ({ ...p, icon: e.target.value }))}
                style={inputStyle}
              />
              <input
                placeholder="একক (যেমন: মিনিট, টি)"
                value={newHabit.unit}
                onChange={e => setNewHabit(p => ({ ...p, unit: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={addCustomHabit} style={{
                  flex: 1, padding: "11px", borderRadius: 10, border: "none",
                  background: "#6366f1", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
                }}>যোগ করো</button>
                <button onClick={() => setAddingHabit(false)} style={{
                  padding: "11px 16px", borderRadius: 10, border: "1px solid #334155",
                  background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 14,
                }}>বাতিল</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, background: "#1e293b", borderRadius: 14, padding: "16px", border: "1px solid #334155" }}>
            <h4 style={{ margin: "0 0 8px", color: "#a5b4fc", fontSize: 14 }}>ডিফল্ট হ্যাবিট সমূহ</h4>
            {HABITS.map(h => (
              <div key={h.id} style={{ padding: "7px 0", borderBottom: "1px solid #0f172a", fontSize: 14, display: "flex", gap: 8 }}>
                <span>{h.icon}</span>
                <span style={{ color: "#cbd5e1" }}>{h.label}</span>
                <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>({h.unit})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #334155",
  background: "#0f172a", color: "#e2e8f0", fontSize: 14, marginBottom: 8, boxSizing: "border-box",
  outline: "none",
};

function HabitCard({ habit, value, onChange }) {
  function handleIncrement(delta) {
    const cur = parseInt(value) || 0;
    const next = Math.max(0, Math.min(habit.max ?? 9999, cur + delta));
    onChange(next);
  }

  return (
    <div style={{
      background: "#1e293b", borderRadius: 14, padding: "14px", marginBottom: 10,
      border: `1px solid ${habit.color}30`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{habit.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{habit.label}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{habit.unit}</div>
          </div>
        </div>
        {habit.id === "namaz" && (
          <div style={{ fontSize: 13, color: habit.color, fontWeight: 600 }}>
            {value ? toBengaliNum(value) + "/৫ ওয়াক্ত" : "০/৫"}
          </div>
        )}
      </div>

      {habit.type === "count" ? (
        <div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: habit.max }).map((_, i) => (
              <button key={i} onClick={() => onChange(i + 1 === parseInt(value) ? i : i + 1)} style={{
                flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                background: parseInt(value) > i ? habit.color : "#0f172a",
                color: parseInt(value) > i ? "white" : "#475569",
                fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              }}>{toBengaliNum(i + 1)}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#475569" }}>
            <span>ফজর</span><span>যোহর</span><span>আসর</span><span>মাগরিব</span><span>এশা</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => handleIncrement(-1)} style={{
            width: 36, height: 36, borderRadius: 8, border: "1px solid #334155",
            background: "#0f172a", color: "#a5b4fc", fontSize: 20, cursor: "pointer",
          }}>−</button>
          <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="০"
            style={{
              flex: 1, padding: "9px 12px", borderRadius: 8, border: `1px solid ${habit.color}50`,
              background: "#0f172a", color: "#e2e8f0", fontSize: 16, fontWeight: 700,
              textAlign: "center", outline: "none",
            }}
          />
          <button onClick={() => handleIncrement(1)} style={{
            width: 36, height: 36, borderRadius: 8, border: "1px solid #334155",
            background: "#0f172a", color: "#a5b4fc", fontSize: 20, cursor: "pointer",
          }}>+</button>
          <span style={{ color: "#64748b", fontSize: 12, minWidth: 35 }}>{habit.unit}</span>
        </div>
      )}

      {/* Progress bar */}
      {habit.id !== "namaz" && value !== "" && (
        <ProgressBar value={parseInt(value) || 0} habit={habit} />
      )}
    </div>
  );
}

function ProgressBar({ value, habit }) {
  const goals = { exercise: 30, fruits: 200, water: 8, quran: 5, sleep: 8, vegetables: 200, steps: 8000 };
  const goal = goals[habit.id];
  if (!goal) return null;
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
        <span>লক্ষ্য: {goal} {habit.unit}</span>
        <span style={{ color: pct >= 100 ? "#10b981" : "#94a3b8" }}>
          {pct >= 100 ? "✅ লক্ষ্য পূরণ!" : toBengaliNum(pct) + "% সম্পন্ন"}
        </span>
      </div>
      <div style={{ height: 5, background: "#0f172a", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: pct + "%", borderRadius: 4,
          background: pct >= 100 ? "#10b981" : habit.color,
          transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}

function toBengaliNum(n) {
  return String(n).replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[d]);
}
