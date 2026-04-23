import { Target, CheckCircle2, TrendingUp, Flame } from "lucide-react";

export default function Stats({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const stats = [
    {
      icon: Target,
      label: "Total",
      value: total,
      color: "#6c5ce7",
      bg: "rgba(108, 92, 231, 0.12)",
    },
    {
      icon: Flame,
      label: "Pending",
      value: pending,
      color: "#e17055",
      bg: "rgba(225, 112, 85, 0.12)",
    },
    {
      icon: CheckCircle2,
      label: "Done",
      value: completed,
      color: "#00b894",
      bg: "rgba(0, 184, 148, 0.12)",
    },
    {
      icon: TrendingUp,
      label: "Progress",
      value: `${percentage}%`,
      color: "#0984e3",
      bg: "rgba(9, 132, 227, 0.12)",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card" style={{ "--stat-color": stat.color, "--stat-bg": stat.bg }}>
          <div className="stat-icon-wrapper" style={{ background: stat.bg }}>
            <stat.icon size={20} style={{ color: stat.color }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
