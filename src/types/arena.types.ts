import type { MatchPhase, MatchEvent, MatchState } from './match.types';

export type ZoneId = 
  | 'north-stand' 
  | 'south-stand' 
  | 'east-stand' 
  | 'west-stand'
  | 'north-concourse'
  | 'south-concourse'
  | 'gate-a' 
  | 'gate-b' 
  | 'gate-c' 
  | 'gate-d'
  | 'concession-n1' | 'concession-n2' | 'concession-n3'
  | 'concession-s1' | 'concession-s2'
  | 'medical-bay'
  | 'vip-lounge';

export type ZoneStatus = 'clear' | 'moderate' | 'busy' | 'critical';

export type { MatchPhase, MatchEvent, MatchState };

export interface Zone {
  id: ZoneId;
  name: string;
  capacity: number;
  current: number;
  status: ZoneStatus;
  queueMinutes: number;
  staffDeployed: number;
  staffRequired: number;
  lastUpdated: number;
}

export interface CrowdPrediction {
  zoneId: ZoneId;
  predictedStatus: ZoneStatus;
  predictedCount: number;
  confidencePercent: number;
  minutesAhead: number;
  triggerEvent: string;
}

export interface CascadeAction {
  id: string;
  type: 'open-concession' | 'deploy-staff' | 'push-notification' | 'close-gate' | 'open-gate' | 'alert-security' | 'medical-alert';
  targetZone: ZoneId;
  message?: string;
  scheduledAt?: number;
  executedAt?: number;
  status: 'pending' | 'executing' | 'done' | 'failed';
}

export interface Cascade {
  id: string;
  name: string;
  trigger: MatchPhase | 'manual' | 'threshold';
  actions: CascadeAction[];
  createdAt: number;
  lastFiredAt?: number;
}

export interface FanMessage {
  id: string;
  targetZone: ZoneId | 'all';
  headline: string;
  body: string;
  actionLabel?: string;
  actionRoute?: string;
  sentAt: number;
  expiresAt: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'security' | 'concession' | 'medical' | 'steward';
  currentZone: ZoneId;
  status: 'active' | 'break' | 'responding';
}

export interface ArenaState {
  zones: Record<ZoneId, Zone>;
  matchState: MatchState;
  predictions: CrowdPrediction[];
  activeCascades: Cascade[];
  staff: StaffMember[];
  incidents: Incident[];
  fanMessages: FanMessage[];
}

export interface Incident {
  id: string;
  zone: ZoneId;
  type: 'medical' | 'security' | 'crowd-surge' | 'facility';
  severity: 'low' | 'medium' | 'high';
  description: string;
  reportedAt: number;
  resolvedAt?: number;
}
