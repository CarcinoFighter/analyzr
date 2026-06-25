import { MetricKey, AVAILABLE_METRICS, MetricDefinition } from "@/lib/analytics";

type MetricSelectorProps = {
  selected: MetricKey[];
  onChange: (selected: MetricKey[]) => void;
};

export default function MetricSelector({ selected, onChange }: MetricSelectorProps) {
  const toggle = (key: MetricKey) => {
    if (selected.includes(key)) {
      // Prevent removing the last selected metric
      if (selected.length === 1) return;
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {AVAILABLE_METRICS.map((metric: MetricDefinition) => {
        const isActive = selected.includes(metric.key);
        return (
          <button
            key={metric.key}
            onClick={() => toggle(metric.key)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium
              border transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? "bg-ink-black text-snow border-ink-black dark:bg-snow dark:text-ink-black dark:border-snow"
                  : "bg-transparent text-slate border-pebble hover:border-graphite hover:text-ink-black"
              }
            `}
            aria-pressed={isActive}
          >
            <metric.icon size={14} strokeWidth={1.75} />
            <span>{metric.label}</span>
          </button>
        );
      })}
    </div>
  );
}
