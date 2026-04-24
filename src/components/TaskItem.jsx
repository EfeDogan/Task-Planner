import { useState } from "react";
import {
  Check,
  Trash2,
  Calendar,
  Flag,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";

const priorityConfig = {
  low: { color: "#00b894", label: "Low" },
  medium: { color: "#fdcb6e", label: "Medium" },
  high: { color: "#e17055", label: "High" },
};

export default function TaskItem({ task, onToggle, onDelete, onUpdate, categories }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editDate, setEditDate] = useState(task.dueDate);
  const [editTime, setEditTime] = useState(task.dueTime);

  const getCategoryColor = (catValue) => {
    const cat = categories?.find((c) => c.value === catValue);
    return cat ? cat.color : "#636e72";
  };

  const getCategoryLabel = (catValue) => {
    const cat = categories?.find((c) => c.value === catValue);
    return cat ? cat.label : catValue;
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditDate(task.dueDate);
    setEditTime(task.dueTime);
    setEditing(true);
    if (!expanded) setExpanded(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      dueDate: editDate,
      dueTime: editTime,
    });
    setEditing(false);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    const hour = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split("-").map(Number);
    const t = new Date();
    return d === t.getDate() && m === t.getMonth() + 1 && y === t.getFullYear();
  };

  const formatDueLabel = () => {
    if (!task.dueDate) return null;
    if (isToday(task.dueDate)) return "Today";
    const [y, m, d] = task.dueDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDueTimestamp = () => {
    if (!task.dueDate) return null;
    const [y, m, d] = task.dueDate.split("-").map(Number);
    if (task.dueTime) {
      const [th, tm] = task.dueTime.split(":").map(Number);
      return new Date(y, m - 1, d, th, tm);
    }
    return new Date(y, m - 1, d, 23, 59);
  };

  const isOverdue = (() => {
    if (!task.dueDate || task.completed) return false;
    const due = getDueTimestamp();
    return due < new Date();
  })();

  const isUrgent = (() => {
    if (!task.dueDate || task.completed) return false;
    const due = getDueTimestamp();
    const diff = due - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  })();

  const catColor = getCategoryColor(task.category);

  return (
    <div
      className={`task-item ${task.completed ? "completed" : ""} ${expanded ? "expanded" : ""} ${isUrgent ? "urgent" : ""} ${isOverdue ? "overdue-task" : ""}`}
    >
      <div className="task-item-main">
        <button
          className={`task-checkbox ${task.completed ? "checked" : ""}`}
          onClick={() => onToggle(task.id)}
          style={{ "--check-color": catColor }}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        <div
          className="task-item-content"
          onClick={() => {
            if (expanded) {
              setExpanded(false);
              cancelEdit();
            } else {
              startEdit();
            }
          }}
        >
          <div className="task-item-header">
            <span className="task-title">{task.title}</span>
            <div className="task-item-badges">
              <span
                className="task-badge category-badge"
                style={{ background: catColor }}
              >
                <Tag size={10} />
                {getCategoryLabel(task.category)}
              </span>
              <span
                className="task-badge priority-badge"
                style={{ color: priorityConfig[task.priority].color }}
              >
                <Flag size={10} />
                {priorityConfig[task.priority].label}
              </span>
            </div>
          </div>

          {task.dueDate && (
            <div
              className={`task-due ${isOverdue ? "overdue" : ""} ${isUrgent ? "urgent-due" : ""} ${isToday(task.dueDate) ? "due-today" : ""}`}
            >
              <Calendar size={12} />
              {formatDueLabel()}
              {task.dueTime && (
                <span className="due-time">{formatTime(task.dueTime)}</span>
              )}
              {isOverdue && (
                <span className="overdue-label">Overdue</span>
              )}
              {isUrgent && !isOverdue && (
                <span className="urgent-label">
                  <AlertTriangle size={10} />
                  Due soon
                </span>
              )}
            </div>
          )}
        </div>

        <div className="task-item-actions">
          <button
            className="task-expand-btn"
            onClick={() => {
              if (expanded) {
                setExpanded(false);
                cancelEdit();
              } else {
                startEdit();
              }
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            className="task-delete-btn"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && editing && (
        <div className="task-edit-form">
          <input
            type="text"
            className="task-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            className="task-edit-textarea"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="task-edit-row">
            <div className="task-edit-field">
              <label>Due Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="task-edit-date"
              />
            </div>
            <div className="task-edit-field">
              <label>Due Time</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="task-edit-date"
              />
            </div>
          </div>
          <div className="task-edit-actions">
            <button
              type="button"
              className="task-edit-save"
              onClick={saveEdit}
              disabled={!editTitle.trim()}
            >
              <Save size={14} />
              Save
            </button>
            <button type="button" className="task-edit-cancel" onClick={cancelEdit}>
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div
        className="task-item-accent"
        style={{ background: catColor }}
      />
    </div>
  );
}
