// src/utils/calendar.ts
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
} from 'date-fns';

export function generateCalendarMatrix(month: Date): Date[][] {
    const startM = startOfMonth(month);
    const endM = endOfMonth(month);

    const startDate = startOfWeek(startM, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(endM, { weekStartsOn: 0 });       // Saturday

    const weeks: Date[][] = [];
    let current = startDate;

    while (current <= endDate) {
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(current);
            current = addDays(current, 1);
        }
        weeks.push(week);
    }

    return weeks;
}

/** Move to the previous month */
export function getPreviousMonth(date: Date): Date {
    return addMonths(date, -1);
}

/** Move to the next month */
export function getNextMonth(date: Date): Date {
    return addMonths(date, 1);
}