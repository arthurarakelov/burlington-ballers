import {
  compareGamesByStartTime,
  isGameCompleted,
  parseGameDateTime,
  shouldAutoDeleteGame
} from './dateUtils';

describe('game date utilities', () => {
  test('parses stored 12-hour game times as local dates', () => {
    const date = parseGameDateTime('2026-05-09', '11:00 AM');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(9);
    expect(date.getHours()).toBe(11);
    expect(date.getMinutes()).toBe(0);
  });

  test('treats games as completed after the configured game window', () => {
    expect(isGameCompleted('2026-05-09', '11:00 AM', new Date(2026, 4, 9, 13, 59))).toBe(false);
    expect(isGameCompleted('2026-05-09', '11:00 AM', new Date(2026, 4, 9, 14, 0))).toBe(true);
  });

  test('waits two days after completion before auto-delete cleanup', () => {
    expect(shouldAutoDeleteGame('2026-05-09', '11:00 AM', new Date(2026, 4, 11, 13, 59))).toBe(false);
    expect(shouldAutoDeleteGame('2026-05-09', '11:00 AM', new Date(2026, 4, 11, 14, 0))).toBe(true);
  });

  test('sorts games by actual start time instead of time string order', () => {
    const morning = { date: '2026-05-09', time: '9:00 AM' };
    const afternoon = { date: '2026-05-09', time: '2:00 PM' };

    expect([afternoon, morning].sort(compareGamesByStartTime)).toEqual([morning, afternoon]);
  });
});
