import { Tooltip } from 'antd';
import classNames from 'classnames';
import type { Dayjs } from 'dayjs';
import { Fragment, type ReactElement } from 'react';
import { useCalendarViewContext } from '../../../hooks/calender/CalendarViewContext.tsx';
import type { CalendarViewClassNames } from '../../../styles/useCalendarViewStyles.ts';
import type { CalendarCellViewModel } from '../../../utils/calendar/calendarCellModel.ts';
import { weekdays } from '../../../utils/calendar/calendarFestivals.ts';
import {
  getCalendarRowWeekNumber,
  type CalendarWeekNumberStart,
} from '../../../utils/calendar/calendarWeekNumber.ts';

export interface CalendarMonthGridProps {
  /** antd-style 生成的 className 映射 */
  styles: CalendarViewClassNames;
  /** 已由逻辑层算好的 42 格展示模型 */
  cellModels: CalendarCellViewModel[];
  /** 是否在每一行左侧显示周数 */
  showWeekNumbers: boolean;
  /** 包含 1 月 1 日的第一周从 0 还是 1 开始编号 */
  firstWeekNumber: CalendarWeekNumberStart;
  /** 用户点击某一格时回传该格公历日期 */
  onSelectDate: (date: Dayjs) => void;
}

/**
 * 月历主体：周数列（可选）+ 星期表头 + 日期格子（数据来自 `CalendarViewContext`）。
 */
function CalendarMonthGrid(): ReactElement {
  const { gridProps } = useCalendarViewContext();
  const { styles, cellModels, showWeekNumbers, firstWeekNumber, onSelectDate } = gridProps;
  const weekRows = Array.from({ length: 6 }, (_, rowIndex) => {
    const firstCell = cellModels[rowIndex * 7];
    return firstCell
      ? getCalendarRowWeekNumber(firstCell.date, firstWeekNumber)
      : firstWeekNumber;
  });

  return (
    <div className={styles.calendarGrid}>
      {showWeekNumbers && <div className={styles.weekNumberHeader}>周</div>}
      {weekdays.map((day) => (
        <div className={styles.weekday} key={day}>
          {day}
        </div>
      ))}

      {cellModels.map((cell, index) => {
        /** 「休」「班」角标对应不同背景色 class */
        const badgeClass =
          cell.badgeVariant === 'rest'
            ? styles.tagRest
            : cell.badgeVariant === 'work'
              ? styles.tagWork
              : '';
        const rowIndex = Math.floor(index / 7);
        const isFirstCellOfRow = index % 7 === 0;

        return (
          <Fragment key={`row-cell-${cell.dateKey}`}>
            {showWeekNumbers && isFirstCellOfRow && (
              <div className={styles.weekNumberCell} key={`week-${cell.dateKey}`}>
                W{weekRows[rowIndex]}
              </div>
            )}
            <Tooltip key={cell.dateKey} title={cell.tooltipTitle} mouseEnterDelay={0.5}>
              <button
                type="button"
                className={classNames(styles.cell, {
                  [styles.otherMonth]: cell.isOtherMonth,
                  [styles.today]: cell.isToday,
                  [styles.selected]: cell.isSelected && !cell.isToday,
                })}
                onClick={() => onSelectDate(cell.date)}
              >
                {cell.badgeText && (
                  <span className={classNames(styles.tag, badgeClass)}>{cell.badgeText}</span>
                )}
                <span className={styles.dateText}>{cell.date.date()}</span>
                <span className={classNames(styles.lunar, { [styles.term]: cell.hasJieQi })}>
                  {cell.displayText}
                </span>
              </button>
            </Tooltip>
          </Fragment>
        );
      })}
    </div>
  );
}

export default CalendarMonthGrid;
