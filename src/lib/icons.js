// Central Material Symbols (outlined) icon map. Each entry is a raw SVG
// string imported via Vite's `?raw` so only icons actually used ship in the
// bundle. `-fill` variants are used for the active/selected nav state.
import today from '@material-symbols/svg-400/outlined/today.svg?raw';
import todayFill from '@material-symbols/svg-400/outlined/today-fill.svg?raw';
import monitoring from '@material-symbols/svg-400/outlined/monitoring.svg?raw';
import monitoringFill from '@material-symbols/svg-400/outlined/monitoring-fill.svg?raw';
import checklist from '@material-symbols/svg-400/outlined/checklist.svg?raw';
import checklistFill from '@material-symbols/svg-400/outlined/checklist-fill.svg?raw';
import timer from '@material-symbols/svg-400/outlined/timer.svg?raw';
import timerFill from '@material-symbols/svg-400/outlined/timer-fill.svg?raw';
import grading from '@material-symbols/svg-400/outlined/grading.svg?raw';
import gradingFill from '@material-symbols/svg-400/outlined/grading-fill.svg?raw';
import settings from '@material-symbols/svg-400/outlined/settings.svg?raw';
import settingsFill from '@material-symbols/svg-400/outlined/settings-fill.svg?raw';

import chevronLeft from '@material-symbols/svg-400/outlined/chevron_left.svg?raw';
import chevronRight from '@material-symbols/svg-400/outlined/chevron_right.svg?raw';
import arrowUp from '@material-symbols/svg-400/outlined/keyboard_arrow_up.svg?raw';
import arrowDown from '@material-symbols/svg-400/outlined/keyboard_arrow_down.svg?raw';
import add from '@material-symbols/svg-400/outlined/add.svg?raw';
import edit from '@material-symbols/svg-400/outlined/edit.svg?raw';
import deleteIcon from '@material-symbols/svg-400/outlined/delete.svg?raw';
import close from '@material-symbols/svg-400/outlined/close.svg?raw';
import check from '@material-symbols/svg-400/outlined/check.svg?raw';
import block from '@material-symbols/svg-400/outlined/block.svg?raw';
import eventBusy from '@material-symbols/svg-400/outlined/event_busy.svg?raw';
import warning from '@material-symbols/svg-400/outlined/warning.svg?raw';
import schedule from '@material-symbols/svg-400/outlined/schedule.svg?raw';
import verified from '@material-symbols/svg-400/outlined/verified.svg?raw';
import trendingDown from '@material-symbols/svg-400/outlined/trending_down.svg?raw';
import menuBook from '@material-symbols/svg-400/outlined/menu_book.svg?raw';
import book2 from '@material-symbols/svg-400/outlined/book_2.svg?raw';

export const NAV_ICONS = {
  today: { outlined: today, filled: todayFill },
  monitoring: { outlined: monitoring, filled: monitoringFill },
  checklist: { outlined: checklist, filled: checklistFill },
  timer: { outlined: timer, filled: timerFill },
  grading: { outlined: grading, filled: gradingFill },
  settings: { outlined: settings, filled: settingsFill },
};

export const ICONS = {
  chevronLeft,
  chevronRight,
  arrowUp,
  arrowDown,
  add,
  edit,
  delete: deleteIcon,
  close,
  check,
  block,
  eventBusy,
  warning,
  schedule,
  verified,
  trendingDown,
  menuBook,
  book2,
};
