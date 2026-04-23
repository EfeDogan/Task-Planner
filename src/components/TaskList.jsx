import TaskItem from "./TaskItem";
import {
  Briefcase,
  Heart,
  DollarSign,
  GraduationCap,
  User,
  Tag,
  Star,
  Bookmark,
  Folder,
  Layers,
} from "lucide-react";

const ICONS = [
  User,
  Briefcase,
  Heart,
  DollarSign,
  GraduationCap,
  Tag,
  Star,
  Bookmark,
  Folder,
  Layers,
];

const FALLBACK_CONFIG = { color: "#636e72", icon: Tag };

const sortByDueDate = (a, b) => {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return new Date(a.dueDate) - new Date(b.dueDate);
};

export default function TaskList({ tasks, onToggle, onDelete, onUpdate, categories }) {
  const categoryConfig = {};
  categories.forEach((cat, i) => {
    categoryConfig[cat.value] = {
      label: cat.label,
      color: cat.color,
      icon: ICONS[i % ICONS.length],
    };
  });

  const getConfig = (catKey) => {
    return (
      categoryConfig[catKey] || {
        label: catKey.charAt(0).toUpperCase() + catKey.slice(1),
        ...FALLBACK_CONFIG,
      }
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-illustration">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="rgba(108, 92, 231, 0.1)" />
            <path
              d="M80 100 L95 115 L120 85"
              stroke="rgba(108, 92, 231, 0.4)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3>No tasks found</h3>
        <p>Add your first task to get started!</p>
      </div>
    );
  }

  const pending = tasks.filter((t) => !t.completed).sort(sortByDueDate);
  const completed = tasks.filter((t) => t.completed).sort(sortByDueDate);

  const groupedPending = {};
  pending.forEach((task) => {
    const cat = task.category;
    if (!groupedPending[cat]) groupedPending[cat] = [];
    groupedPending[cat].push(task);
  });

  const groupedCompleted = {};
  completed.forEach((task) => {
    const cat = task.category;
    if (!groupedCompleted[cat]) groupedCompleted[cat] = [];
    groupedCompleted[cat].push(task);
  });

  const allUsedCategories = [
    ...new Set([
      ...Object.keys(groupedPending),
      ...Object.keys(groupedCompleted),
    ]),
  ];

  const categoryOrder = allUsedCategories.sort((a, b) => {
    const aIdx = categories.findIndex((c) => c.value === a);
    const bIdx = categories.findIndex((c) => c.value === b);
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  const renderCategoryBlocks = (grouped) => (
    <div className="category-columns">
      {categoryOrder.map((catKey) => {
        const group = grouped[catKey];
        if (!group || group.length === 0) return null;
        const config = getConfig(catKey);
        const Icon = config.icon;
        return (
          <div
            key={catKey}
            className="category-block"
            style={{ "--cat-color": config.color }}
          >
            <div className="category-block-header">
              <div className="category-block-icon">
                <Icon size={16} />
              </div>
              <span className="category-block-title">{config.label}</span>
              <span className="category-block-count">{group.length}</span>
            </div>
            <div className="category-block-list">
              {group.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  categories={categories}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="task-list">
      {pending.length > 0 && (
        <div className="task-status-group">
          <div className="task-status-header">
            <h3 className="status-label pending-label">In Progress</h3>
            <span className="task-count">{pending.length}</span>
          </div>
          {renderCategoryBlocks(groupedPending)}
        </div>
      )}

      {completed.length > 0 && (
        <div className="task-status-group">
          <div className="task-status-header">
            <h3 className="status-label completed-label">Completed</h3>
            <span className="task-count completed-count">
              {completed.length}
            </span>
          </div>
          {renderCategoryBlocks(groupedCompleted)}
        </div>
      )}
    </div>
  );
}
