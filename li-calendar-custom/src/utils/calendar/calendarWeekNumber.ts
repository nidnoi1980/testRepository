import type { Dayjs } from 'dayjs';

/** 年度首周可从 0 或 1 开始编号。 */
export type CalendarWeekNumberStart = 0 | 1;

/**
 * 返回某日期所在“周行”的周一。
 * 月历表头固定为周一至周日，因此周数也按周一切换。
 */
export function getMondayOfWeek(date: Dayjs): Dayjs {
  const daysSinceMonday = (date.day() + 6) % 7;
  return date.startOf('day').subtract(daysSinceMonday, 'day');
}

/**
 * 计算月历左侧显示的年度周序号。
 *
 * 规则：
 * - 每周从周一开始；
 * - 包含 1 月 1 日的那一整行是新年度的第一周；
 * - 用户可选择该行显示为 W0 或 W1；
 * - 之后每过一个周一递增 1；
 * - 若一行跨年并包含下一年的 1 月 1 日，则该行立即按新年度重新编号。
 */
export function getCalendarRowWeekNumber(
  dateInRow: Dayjs,
  firstWeekNumber: CalendarWeekNumberStart,
): number {
  const rowStart = getMondayOfWeek(dateInRow);
  const rowEnd = rowStart.add(6, 'day');
  // 只有跨年周才会出现 rowStart.year() !== rowEnd.year()；该周包含新年的 1 月 1 日，
  // 因而应按新年度编号。
  const jan1 = rowEnd.startOf('year');
  const firstRowStart = getMondayOfWeek(jan1);
  const civilDayNumber = (date: Dayjs): number =>
    Date.UTC(date.year(), date.month(), date.date()) / 86_400_000;
  const weekOffset = (civilDayNumber(rowStart) - civilDayNumber(firstRowStart)) / 7;

  return firstWeekNumber + weekOffset;
}
