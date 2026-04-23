import { useState } from "react";
import { Plus, X } from "lucide-react";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function TaskForm({ onAdd, categories, onAddCategory, onRemoveCategory }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const safeCategory = categories.some((c) => c.value === category)
    ? category
    : categories[0]?.value || "personal";

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed) {
      onAddCategory(trimmed);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (value) => {
    onRemoveCategory(value);
    if (safeCategory === value) {
      const remaining = categories.filter((c) => c.value !== value);
      setCategory(remaining[0]?.value || "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: safeCategory,
      priority,
      dueDate,
      dueTime,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setTitle("");
    setDescription("");
    setCategory(categories[0]?.value || "personal");
    setPriority("medium");
    setDueDate("");
    setDueTime("");
    setIsExpanded(false);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-main">
        <div className="task-form-input-wrapper">
          <Plus size={20} className="task-form-icon" />
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="task-form-input"
          />
        </div>
        <button type="submit" className="task-form-submit" disabled={!title.trim()}>
          Add Task
        </button>
      </div>

      {isExpanded && (
        <div className="task-form-details">
          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="task-form-textarea"
            rows={2}
          />
          <div className="task-form-row">
            <div className="task-form-field">
              <label>Category</label>
              <div className="category-pills">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.value}
                    className={`category-pill ${safeCategory === cat.value ? "active" : ""}`}
                    style={{ "--pill-color": cat.color }}
                    onClick={() => setCategory(cat.value)}
                  >
                    {cat.label}
                    <span
                      className="category-pill-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCategory(cat.value);
                      }}
                    >
                      <X size={10} />
                    </span>
                  </button>
                ))}
                <div className="category-add">
                  <input
                    type="text"
                    placeholder="New..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    className="category-add-input"
                  />
                  <button
                    type="button"
                    className="category-add-btn"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
            <div className="task-form-field">
              <label>Priority</label>
              <div className="priority-pills">
                {PRIORITIES.map((p) => (
                  <button
                    type="button"
                    key={p.value}
                    className={`priority-pill priority-${p.value} ${priority === p.value ? "active" : ""}`}
                    onClick={() => setPriority(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="task-form-field">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="task-form-date"
              />
            </div>
            <div className="task-form-field">
              <label>Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="task-form-date"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
