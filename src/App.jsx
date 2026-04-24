import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";
import * as store from "./lib/local-store";
import * as syncEngine from "./lib/sync";
import Auth from "./components/Auth";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import FilterBar from "./components/FilterBar";
import Stats from "./components/Stats";
import ConnectionStatus from "./components/ConnectionStatus";
import ThemePicker from "./components/ThemePicker";
import { LogOut, LogIn, User, X, ChevronDown } from "lucide-react";
import "./App.css";

const GUEST_KEY = "task-planner-guest-id";

const DEFAULT_CATEGORIES = [
  { value: "personal", label: "Personal", color: "#6c5ce7" },
  { value: "work", label: "Work", color: "#0984e3" },
  { value: "health", label: "Health", color: "#00b894" },
  { value: "finance", label: "Finance", color: "#fdcb6e" },
  { value: "learning", label: "Learning", color: "#e17055" },
];

const CATEGORY_PALETTE = [
  "#fd79a8", "#00cec9", "#a29bfe", "#55efc4", "#74b9ff",
  "#ffeaa7", "#fab1a0", "#81ecec", "#636e72", "#dfe6e9",
];

function getOrCreateGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = `guest-${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

let pushTimer = null;
function schedulePush(userId, isGuest) {
  if (isGuest) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    try {
      await syncEngine.pushLocal(userId);
    } catch (err) {
      console.error("push:", err);
    }
  }, 2000);
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [syncStatus, setSyncStatus] = useState(
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "idle"
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState("default");
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    priority: "all",
    status: "all",
  });

  const ctxRef = useRef(null);

  useEffect(() => {
    ctxRef.current = { user };
  });

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const mapRow = useCallback(
    (row) => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      category: row.category,
      priority: row.priority,
      dueDate: row.due_date || "",
      dueTime: row.due_time || "",
      completed: row.completed,
      createdAt: row.created_at,
    }),
    []
  );

  const loadTasks = useCallback(
    async (userId, isGuest) => {
      setLoading(true);

      try {
        const local = await store.getAllTasks(userId);
        setTasks(local.map(mapRow));
      } catch (err) {
        console.error("local load:", err);
      }

      setLoading(false);

      if (!isGuest && navigator.onLine) {
        try {
          setSyncStatus("syncing");
          const synced = await syncEngine.syncAll(userId);
          setTasks(synced.map(mapRow));
          setSyncStatus("idle");
        } catch (err) {
          console.error("sync:", err);
          showToast("Could not sync — working with local data");
          setSyncStatus("idle");
        }
      }
    },
    [mapRow, showToast]
  );

  useEffect(() => {
    const loadCategories = (userId) => {
      const key = `task-planner-categories-${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setCategories(JSON.parse(stored));
        } catch {
          /* keep defaults */
        }
      }
    };

    const loadTheme = (userId) => {
      const stored = localStorage.getItem(`task-planner-theme-${userId}`);
      if (stored) setTheme(stored);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (u) {
        setUser(u);
        loadTasks(u.id, false);
        loadCategories(u.id);
        loadTheme(u.id);
      } else {
        const guestId = localStorage.getItem(GUEST_KEY);
        if (guestId) {
          const guestUser = { id: guestId, isGuest: true };
          setUser(guestUser);
          loadTasks(guestId, true);
          loadCategories(guestId);
          loadTheme(guestId);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadTasks(u.id, false);
        loadCategories(u.id);
        loadTheme(u.id);
      } else {
        const guestUser = { id: getOrCreateGuestId(), isGuest: true };
        setUser(guestUser);
        setTasks([]);
        setCategories(DEFAULT_CATEGORIES);
        setTheme("default");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadTasks]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `task-planner-categories-${user.id}`,
        JSON.stringify(categories)
      );
    }
  }, [categories, user]);

  useEffect(() => {
    const goOnline = () => {
      setSyncStatus("syncing");
      const u = ctxRef.current?.user;
      if (u && !u.isGuest) {
        syncEngine.syncAll(u.id).then((synced) => {
          setTasks(synced.map(mapRow));
          setSyncStatus("idle");
        }).catch(() => setSyncStatus("idle"));
      } else {
        setSyncStatus("idle");
      }
    };
    const goOffline = () => setSyncStatus("offline");

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("online", goOffline);
    };
  }, [mapRow]);

  useEffect(() => {
    if (!user || user.isGuest) return;
    const id = setInterval(() => {
      if (!navigator.onLine) return;
      syncEngine.pullRemote(user.id).then((synced) => {
        setTasks(synced.map(mapRow));
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [user, mapRow]);

  const addTask = async (task) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const row = {
      id,
      user_id: user.id,
      title: task.title,
      description: task.description || null,
      category: task.category,
      priority: task.priority,
      due_date: task.dueDate || null,
      due_time: task.dueTime || null,
      completed: false,
      created_at: now,
      dirty: !user.isGuest,
      deleted: false,
    };

    await store.putTask(row);
    setTasks((prev) => [mapRow(row), ...prev]);

    schedulePush(user.id, user.isGuest);
  };

  const toggleTask = async (id) => {
    const row = await store.getTask(id);
    if (!row) return;

    const newCompleted = !row.completed;
    row.completed = newCompleted;
    row.dirty = true;

    await store.putTask(row);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    schedulePush(user.id, user.isGuest);
  };

  const deleteTask = async (id) => {
    const row = await store.getTask(id);
    if (!row) return;

    row.deleted = true;
    row.dirty = true;

    await store.putTask(row);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    schedulePush(user.id, user.isGuest);
  };

  const updateTask = async (id, updates) => {
    const row = await store.getTask(id);
    if (!row) return;

    if (updates.title !== undefined) row.title = updates.title;
    if (updates.description !== undefined) row.description = updates.description || null;
    if (updates.dueDate !== undefined) row.due_date = updates.dueDate || null;
    if (updates.dueTime !== undefined) row.due_time = updates.dueTime || null;
    row.dirty = true;

    await store.putTask(row);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    schedulePush(user.id, user.isGuest);
  };

  useEffect(() => {
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    if (user) {
      localStorage.setItem(`task-planner-theme-${user.id}`, theme);
    }
  }, [theme, user]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const enterGuest = useCallback(() => {
    const guestUser = { id: getOrCreateGuestId(), isGuest: true };
    setUser(guestUser);
    loadTasks(guestUser.id, true);
  }, [loadTasks]);

  const addCategory = useCallback((label) => {
    setCategories((prev) => {
      const value = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (!value || prev.some((c) => c.value === value)) return prev;
      const color = CATEGORY_PALETTE[prev.length % CATEGORY_PALETTE.length];
      return [...prev, { value, label, color }];
    });
  }, []);

  const removeCategory = useCallback((value) => {
    setCategories((prev) => prev.filter((c) => c.value !== value));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchCategory =
        filters.category === "all" || task.category === filters.category;
      const matchPriority =
        filters.priority === "all" || task.priority === filters.priority;
      const matchStatus =
        filters.status === "all" ||
        (filters.status === "completed" && task.completed) ||
        (filters.status === "pending" && !task.completed);
      return matchSearch && matchCategory && matchPriority && matchStatus;
    });
  }, [tasks, filters]);

  if (!user) return <Auth onGuest={enterGuest} />;

  const isGuest = !!user.isGuest;

  return (
    <div className="app">
      <div className="background-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <ConnectionStatus status={syncStatus} />

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <h1>
              <span className="header-gradient">Task Planner</span>
            </h1>
            <p className="header-subtitle">
              Organize your day, achieve your goals
            </p>
          </div>
          <div className="header-actions">
            <ThemePicker theme={theme} onChange={setTheme} />
            <div className="header-user">
            <button
              className="user-menu-trigger"
              onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
            >
              <div className="user-avatar">
                {isGuest ? <User size={14} /> : user.email.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">
                {isGuest ? "Guest" : user.email.split("@")[0]}
              </span>
              <ChevronDown size={14} className={`user-chevron ${userMenuOpen ? "open" : ""}`} />
            </button>
            {userMenuOpen && (
              <div className="user-dropdown">
                {!isGuest && (
                  <div className="user-dropdown-email">{user.email}</div>
                )}
                {isGuest ? (
                  <button className="user-dropdown-signout" onClick={() => { setUserMenuOpen(false); setUser(null); }}>
                    <LogIn size={14} />
                    Sign In
                  </button>
                ) : (
                  <button className="user-dropdown-signout" onClick={() => { setUserMenuOpen(false); signOut(); }}>
                    <LogOut size={14} />
                    Sign Out
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        </header>

        <Stats tasks={tasks} />

        <div className="main-card">
          {loading ? (
            <div className="loading-state">
              <div className="loader-spinner" />
              <p>Loading tasks...</p>
            </div>
          ) : (
            <>
              <TaskForm
                onAdd={addTask}
                categories={categories}
                onAddCategory={addCategory}
                onRemoveCategory={removeCategory}
              />

              {tasks.length > 0 && (
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  categories={categories}
                />
              )}

              <TaskList
                tasks={filteredTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
                categories={categories}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
