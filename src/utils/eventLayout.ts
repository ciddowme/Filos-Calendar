import type { CalendarEvent } from '../types/event';

export interface EventLayoutPosition {
  eventId: string;
  left: number; // percentage (0-100)
  width: number; // percentage (0-100)
  zIndex: number; // for proper stacking
  columnIndex: number; // column in the group
  totalColumns: number; // total columns in the group
}

interface EventWithTime {
  event: CalendarEvent;
  start: number; // minutes from midnight
  end: number; // minutes from midnight
}

// Convert time string (HH:MM) to minutes from midnight
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if two events overlap
function eventsOverlap(event1: EventWithTime, event2: EventWithTime): boolean {
  return event1.start < event2.end && event2.start < event1.end;
}

// Calculate layout positions for overlapping events
export function calculateEventPositions(events: CalendarEvent[]): EventLayoutPosition[] {
  if (events.length === 0) return [];

  // Convert events to include time in minutes
  const eventsWithTime: EventWithTime[] = events.map(event => {
    const start = timeToMinutes(event.startTime);
    const end = start + event.duration;
    return { event, start, end };
  });

  // Sort events by start time, then by duration (longer first)
  eventsWithTime.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return b.event.duration - a.event.duration;
  });

  // Find overlapping groups
  const groups: EventWithTime[][] = [];

  for (const event of eventsWithTime) {
    // Find if this event overlaps with any existing group
    let addedToGroup = false;
    for (const group of groups) {
      // Check if event overlaps with any event in the group
      const overlaps = group.some(groupEvent => eventsOverlap(event, groupEvent));
      if (overlaps) {
        group.push(event);
        addedToGroup = true;
        break;
      }
    }

    // If no overlapping group found, create new group
    if (!addedToGroup) {
      groups.push([event]);
    }
  }

  // Calculate positions for each group
  const positions: EventLayoutPosition[] = [];

  for (const group of groups) {
    if (group.length === 1) {
      // Single event - takes full width
      positions.push({
        eventId: group[0].event.id,
        left: 0,
        width: 100,
        zIndex: 0,
        columnIndex: 0,
        totalColumns: 1,
      });
      continue;
    }

    // For overlapping events, we need to assign columns
    const columns: EventWithTime[][] = [];

    for (const event of group) {
      // Find first available column
      let columnIndex = 0;
      while (columnIndex < columns.length) {
        const column = columns[columnIndex];
        // Check if this event overlaps with any event in this column
        const overlapsWithColumn = column.some(colEvent => eventsOverlap(event, colEvent));
        if (!overlapsWithColumn) {
          column.push(event);
          break;
        }
        columnIndex++;
      }

      // If no available column, create new one
      if (columnIndex === columns.length) {
        columns.push([event]);
      }
    }

    // Calculate positions based on columns with overlap
    const totalColumns = columns.length;
    const baseColumnWidth = 100 / totalColumns;

    // Overlap percentage - каждое событие будет перекрываться с соседним
    // Чем больше колонок, тем меньше перекрытие
    const overlapPercent = Math.min(12, baseColumnWidth * 0.25);

    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      for (const event of columns[colIndex]) {
        // Find how many columns this event can expand to
        let expandTo = colIndex + 1;
        for (let nextCol = colIndex + 1; nextCol < totalColumns; nextCol++) {
          const nextColumn = columns[nextCol];
          const overlapsWithNext = nextColumn.some(colEvent => eventsOverlap(event, colEvent));
          if (overlapsWithNext) {
            break;
          }
          expandTo = nextCol + 1;
        }

        // Calculate width and position with overlap
        const columnsSpanned = expandTo - colIndex;
        let width: number;
        let left: number;

        if (columnsSpanned === totalColumns - colIndex) {
          // Event expands to the end - take all remaining space
          width = 100 - (colIndex * (baseColumnWidth - overlapPercent));
          left = colIndex * (baseColumnWidth - overlapPercent);
        } else {
          // Event doesn't expand to the end - add overlap
          width = columnsSpanned * baseColumnWidth + overlapPercent;
          left = colIndex * (baseColumnWidth - overlapPercent);
        }

        positions.push({
          eventId: event.event.id,
          left,
          width,
          zIndex: colIndex, // Higher z-index for events on the right
          columnIndex: colIndex,
          totalColumns,
        });
      }
    }
  }

  return positions;
}
