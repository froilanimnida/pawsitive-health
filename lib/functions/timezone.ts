import { addHours } from "date-fns";

/**
 * Converts a UTC date to a specific timezone (UTC+8)
 * Timezone List:
 * - UTC+0: GMT
 * - UTC+1: GMT+1
 * - UTC+2: GMT+2
 * - UTC+3: GMT+3
 * - UTC+4: GMT+4
 * - UTC+5: GMT+5
 * - UTC+6: GMT+6
 * - UTC+7: GMT+7
 * - UTC+8: GMT+8
 * - UTC+9: GMT+9
 * - UTC+10: GMT+10
 * - UTC+11: GMT+11
 * - UTC+12: GMT+12
 * - UTC-1: GMT-1
 * - UTC-2: GMT-2
 * - UTC-3: GMT-3
 * - UTC-4: GMT-4
 * - UTC-5: GMT-5
 * - UTC-6: GMT-6
 * - UTC-7: GMT-7
 * - UTC-8: GMT-8
 * - UTC-9: GMT-9
 * - UTC-10: GMT-10
 * - UTC-11: GMT-11
 * - UTC-12: GMT-12
 * - UTC+13: GMT+13
 * - UTC+14: GMT+14
 * @param date The UTC date to convert
 * @param amount The number of hours to add (8 for UTC+8)
 * @returns Date adjusted to the specified timezone
 */
const convertToTimezone = (date: Date, amount: number): Date | null => addHours(date, amount);

export { convertToTimezone };
