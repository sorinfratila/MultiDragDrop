export class Battery {
  id: number;
  deviceId: number;
  slot: number;
  subSlot: number;
  ip?: string;
  macAddress?: string;
  properties?: object;
  detected: boolean;
  temperature: number;
  voltage: number;
  electricCurrent: number;
  capacity: number;
  power: number;
  operatingHours: number;
  operatingMinutes: number;
  percentage: number;
  cycles: number;
  healthState: number;
  hoursToFull: number;
  minutesToFull: number;
  slotType?: any;

}

// custom type for battery led
export type ledEnum =
  | 'OFF'
  | 'GREEN'
  | 'GREEN_FLASHING'
  | 'YELLOW'
  | 'YELLOW_FLASHING'
  | 'RED'
  | 'RED_FLASHING'
  | 'GREEN_RED_FLASHING'
  | 'YELLOW_RED_FLASHING'
  | 'YELLOW_GREEN_FLASHING'
  | 'DEV_IDENTIFY';
