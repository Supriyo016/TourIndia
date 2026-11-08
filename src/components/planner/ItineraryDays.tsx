"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, TrainFront, Utensils, Hotel, Trash2 } from "lucide-react";
import type { TripDay, TripItem } from "@/features/itinerary/generate";
import { formatDate, formatINR } from "@/lib/utils";

function ItemRow({
  item,
  day,
  days,
  onMove,
  onRemove,
}: {
  item: TripItem;
  day: TripDay;
  days: TripDay[];
  onMove: (dayId: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      className={`print-break flex gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-3 ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="no-print -ml-1 flex w-7 shrink-0 cursor-grab touch-none items-center justify-center text-muted hover:text-brand"
        aria-label={`Reorder ${item.title}. Press space, then use the arrow keys.`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-semibold">
          {item.kind === "travel" && <TrainFront className="size-4 text-accent-ink" aria-hidden />}
          {item.title}
        </p>
        <p className="text-[0.95rem] leading-snug text-ink-2">{item.note}</p>
        <p className="mt-1 text-sm text-muted">About {item.hours} h</p>
      </div>
      <div className="no-print flex shrink-0 flex-col items-end gap-1">
        <label className="sr-only" htmlFor={`mv-${item.id}`}>Move {item.title} to another day</label>
        <select
          id={`mv-${item.id}`}
          className="h-8 cursor-pointer rounded border border-line bg-surface px-1 text-sm text-ink-2"
          value={day.id}
          onChange={(event) => onMove(event.target.value)}
        >
          {days.map((option) => (
            <option key={option.id} value={option.id}>Day {option.number}</option>
          ))}
        </select>
        <button type="button" className="icon-btn !size-8" aria-label={`Remove ${item.title}`} onClick={onRemove}>
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

export function ItineraryDays({
  days,
  onChange,
  moveItem,
}: {
  days: TripDay[];
  onChange: (days: TripDay[]) => void;
  moveItem: (days: TripDay[], itemId: string, toDayId: string, toIndex?: number) => TripDay[];
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const target = days.find((day) => day.items.some((item) => item.id === over.id));
    if (!target) return;
    onChange(moveItem(days, String(active.id), target.id, target.items.findIndex((item) => item.id === over.id)));
  };

  return (
    <DndContext id="itinerary-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <ol className="space-y-5">
        {days.map((day) => (
          <li key={day.id} className="print-break rounded-[var(--radius-lg)] bg-surface-2 p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3>
                Day {day.number}: {day.place}
              </h3>
              <p className="text-sm text-muted">
                {day.date && <>{formatDate(day.date)} · </>}about {formatINR(day.costPerPerson)} per person
              </p>
            </div>
            <SortableContext items={day.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {day.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    day={day}
                    days={days}
                    onMove={(dayId) => onChange(moveItem(days, item.id, dayId))}
                    onRemove={() =>
                      onChange(days.map((entry) => (entry.id === day.id ? { ...entry, items: entry.items.filter((other) => other.id !== item.id) } : entry)))
                    }
                  />
                ))}
                {day.items.length === 0 && <li className="p-2 text-ink-2">Nothing planned. Move something here from another day.</li>}
              </ul>
            </SortableContext>
            <dl className="mt-3 grid gap-2 text-[0.95rem] sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 font-semibold"><Utensils className="size-4 text-accent-ink" aria-hidden /> Try</dt>
                <dd className="text-ink-2">{day.food}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-semibold"><Hotel className="size-4 text-accent-ink" aria-hidden /> Stay</dt>
                <dd className="line-clamp-3 text-ink-2">{day.stay}</dd>
              </div>
              {day.alternative && (
                <div className="sm:col-span-2">
                  <dt className="inline font-semibold">If you have time: </dt>
                  <dd className="inline text-ink-2">{day.alternative}</dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ol>
    </DndContext>
  );
}
