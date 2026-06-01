import { describe, it, expect } from 'vitest';
import {
  calculateMatchResults,
  calculateAtpBonus,
  calculateSessionResults,
} from './calculations';
import type { Match, Session, Player } from '@/types';

describe('calculateMatchResults', () => {
  const players: Player[] = [
    { id: 'cuong', name: 'Cường', isFixed: true },
    { id: 'trung', name: 'Trung', isFixed: true },
    { id: 'long', name: 'Long', isFixed: true },
    { id: 'quang', name: 'A Quang', isFixed: true },
  ];

  it('should calculate normal match winnings correctly', () => {
    const match: Match = {
      id: 'm1',
      sessionId: 's1',
      teamA: ['cuong', 'trung'],
      teamB: ['long', 'quang'],
      matchType: 'normal',
      winnerId: 'teamA',
      atps: [],
      createdAt: new Date().toISOString(),
    };

    const results = calculateMatchResults(match);

    expect(results['cuong']).toBe(50000);
    expect(results['trung']).toBe(50000);
    expect(results['long']).toBe(-50000);
    expect(results['quang']).toBe(-50000);
  });

  it('should calculate star match winnings correctly', () => {
    const match: Match = {
      id: 'm1',
      sessionId: 's1',
      teamA: ['cuong', 'trung'],
      teamB: ['long', 'quang'],
      matchType: 'star',
      winnerId: 'teamB',
      atps: [],
      createdAt: new Date().toISOString(),
    };

    const results = calculateMatchResults(match);

    expect(results['cuong']).toBe(-100000);
    expect(results['trung']).toBe(-100000);
    expect(results['long']).toBe(100000);
    expect(results['quang']).toBe(100000);
  });
});

describe('calculateAtpBonus', () => {
  it('should give bonus to hitter team when ATP not returned (normal match)', () => {
    const match: Match = {
      id: 'm1',
      sessionId: 's1',
      teamA: ['cuong', 'trung'],
      teamB: ['long', 'quang'],
      matchType: 'normal',
      winnerId: 'teamA',
      atps: [{ id: 'atp1', hitterId: 'cuong', wasReturned: false }],
      createdAt: new Date().toISOString(),
    };

    const results = calculateAtpBonus(match);

    expect(results['cuong']).toBe(25000);
    expect(results['trung']).toBe(25000);
    expect(results['long']).toBe(-25000);
    expect(results['quang']).toBe(-25000);
  });

  it('should give bonus to returning team when ATP was returned', () => {
    const match: Match = {
      id: 'm1',
      sessionId: 's1',
      teamA: ['cuong', 'trung'],
      teamB: ['long', 'quang'],
      matchType: 'normal',
      winnerId: 'teamA',
      atps: [{ id: 'atp1', hitterId: 'cuong', wasReturned: true }],
      createdAt: new Date().toISOString(),
    };

    const results = calculateAtpBonus(match);

    expect(results['cuong']).toBe(-25000);
    expect(results['trung']).toBe(-25000);
    expect(results['long']).toBe(25000);
    expect(results['quang']).toBe(25000);
  });

  it('should accumulate multiple ATPs in same match', () => {
    const match: Match = {
      id: 'm1',
      sessionId: 's1',
      teamA: ['cuong', 'trung'],
      teamB: ['long', 'quang'],
      matchType: 'normal',
      winnerId: 'teamA',
      atps: [
        { id: 'atp1', hitterId: 'cuong', wasReturned: false },
        { id: 'atp2', hitterId: 'long', wasReturned: false },
      ],
      createdAt: new Date().toISOString(),
    };

    const results = calculateAtpBonus(match);

    expect(results['cuong']).toBe(0);
    expect(results['trung']).toBe(0);
    expect(results['long']).toBe(0);
    expect(results['quang']).toBe(0);
  });

  it('should use higher bonus for star matches', () => {
    const match: Match = {
      id: 'm1',
      sessionId: 's1',
      teamA: ['cuong', 'trung'],
      teamB: ['long', 'quang'],
      matchType: 'star',
      winnerId: 'teamA',
      atps: [{ id: 'atp1', hitterId: 'cuong', wasReturned: false }],
      createdAt: new Date().toISOString(),
    };

    const results = calculateAtpBonus(match);

    expect(results['cuong']).toBe(50000);
    expect(results['trung']).toBe(50000);
    expect(results['long']).toBe(-50000);
    expect(results['quang']).toBe(-50000);
  });
});

describe('calculateSessionResults', () => {
  it('should calculate final balance with court fee split', () => {
    const session: Session = {
      id: 's1',
      date: '2026-06-01',
      participantIds: ['cuong', 'trung', 'long', 'quang'],
      courtFee: 200000,
      isSettled: true,
      createdAt: new Date().toISOString(),
    };

    const matches: Match[] = [
      {
        id: 'm1',
        sessionId: 's1',
        teamA: ['cuong', 'trung'],
        teamB: ['long', 'quang'],
        matchType: 'normal',
        winnerId: 'teamA',
        atps: [{ id: 'atp1', hitterId: 'cuong', wasReturned: false }],
        createdAt: new Date().toISOString(),
      },
    ];

    const results = calculateSessionResults(session, matches);

    const cuong = results.find((r) => r.playerId === 'cuong')!;
    expect(cuong.matchWinnings).toBe(50000);
    expect(cuong.atpBonus).toBe(25000);
    expect(cuong.courtShare).toBe(50000);
    expect(cuong.finalBalance).toBe(25000);

    const long = results.find((r) => r.playerId === 'long')!;
    expect(long.matchWinnings).toBe(-50000);
    expect(long.atpBonus).toBe(-25000);
    expect(long.courtShare).toBe(50000);
    expect(long.finalBalance).toBe(-125000);
  });
});
