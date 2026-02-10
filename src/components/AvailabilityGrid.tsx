"use client";

interface AvailabilityGridProps {
  value: Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
}

const days = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const slots = [
  { key: "morning", label: "Morning", time: "8–12" },
  { key: "afternoon", label: "Afternoon", time: "12–17" },
  { key: "evening", label: "Evening", time: "17–21" },
];

export function AvailabilityGrid({ value, onChange }: AvailabilityGridProps) {
  const toggleSlot = (day: string, slot: string) => {
    const key = `${day}_${slot}`;
    onChange({ ...value, [key]: !value[key] });
  };

  const toggleDay = (day: string) => {
    const daySlots = slots.map((s) => `${day}_${s.key}`);
    const allActive = daySlots.every((k) => value[k]);
    const updated = { ...value };
    daySlots.forEach((k) => {
      updated[k] = !allActive;
    });
    onChange(updated);
  };

  const toggleSlotColumn = (slot: string) => {
    const slotKeys = days.map((d) => `${d.key}_${slot}`);
    const allActive = slotKeys.every((k) => value[k]);
    const updated = { ...value };
    slotKeys.forEach((k) => {
      updated[k] = !allActive;
    });
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-3">
        Availability
      </label>
      <p className="text-xs text-text-tertiary mb-3">
        Click cells to toggle when you&apos;re available. Click a day or time
        header to toggle an entire row/column.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="py-2 pr-2" />
              {slots.map((s) => (
                <th key={s.key} className="py-2 px-1 text-center">
                  <button
                    type="button"
                    onClick={() => toggleSlotColumn(s.key)}
                    className="text-text-secondary hover:text-brand-500 transition-colors"
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-text-tertiary font-normal">
                      {s.time}
                    </div>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.key} className="border-t border-surface-border">
                <td className="py-2 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className="font-medium text-text-primary hover:text-brand-500 transition-colors w-full text-left"
                  >
                    {day.label}
                  </button>
                </td>
                {slots.map((slot) => {
                  const key = `${day.key}_${slot.key}`;
                  const active = value[key] || false;
                  return (
                    <td key={slot.key} className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSlot(day.key, slot.key)}
                        className={`w-full h-10 rounded-button transition-all ${
                          active
                            ? "bg-brand-500 text-white shadow-sm"
                            : "bg-surface-secondary text-text-tertiary hover:bg-surface-hover"
                        }`}
                      >
                        {active ? "✓" : "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
