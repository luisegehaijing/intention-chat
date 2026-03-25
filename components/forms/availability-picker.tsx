import { TimeSlot } from "@/lib/types";

interface Props {
  slots: TimeSlot[];
  selected: string[];
  onToggle: (slotId: string) => void;
}

export function AvailabilityPicker({ slots, selected, onToggle }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isOn = selected.includes(slot.id);
        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => onToggle(slot.id)}
            className={`rounded-xl border px-3 py-3 text-left ${
              isOn ? "border-pine bg-pine/10 text-pine" : "border-moss/20 bg-paper text-ink"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-moss">{slot.day}</p>
            <p className="text-sm font-medium">{slot.label}</p>
          </button>
        );
      })}
    </div>
  );
}
