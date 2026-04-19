import { countToStatus } from '../src/lib/prediction-engine';

describe('ZoneHealth', () => {
  test('countToStatus returns critical above 85% capacity', () => {
    expect(countToStatus(860, 1000)).toBe('critical');
    expect(countToStatus(1000, 1000)).toBe('critical');
  });

  test('countToStatus returns clear below 40% capacity', () => {
    expect(countToStatus(390, 1000)).toBe('clear');
    expect(countToStatus(0, 1000)).toBe('clear');
  });

  test('countToStatus returns moderate for 40-65% capacity', () => {
    expect(countToStatus(500, 1000)).toBe('moderate');
  });

  test('countToStatus returns busy for 65-85% capacity', () => {
    expect(countToStatus(700, 1000)).toBe('busy');
  });
});
