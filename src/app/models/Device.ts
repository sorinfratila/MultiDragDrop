import { Battery } from './Battery';
import { colorEnum } from './Channel';

export class Device {
  id?: any; // ? added only for FE mock data purposes
  deviceId?: number; // ? added only for FE mock data purposes
  isOffline?: boolean; // ? added only for FE mock data purposes
  isVirtual?: boolean;
  guid?: string;
  model?: modelEnum;
  ip?: string;
  matchingStatus?: matchingEnum; // ? added only for FE mock data purposes
  properties?: object; // ? added only for FE mock data purposes
  type?: typeEnum; // ? added only for FE mock data purposes
  channels?: any[];
  batteries?: Battery[];
  createdAt?: Date; // ? added only for FE mock data purposes
  updatedAt?: Date; // ? added only for FE mock data purposes
  color?: colorEnum;
  danteMode?: boolean;
  danteName?: string;
  protocol?: string;
  danteControl?: string;
  toMatchWithDevice?: any;
  role?: string;
  name?: string;
  ldMode?: any;

  ipv4StaticIpAddress?: string;

  // Properties added to improve FE functionality

  /**
   * Used to see weather the checkbox for this channel is checked or not.
   *
   * ( see equipment page - devices table )
   */
  checked?: boolean;

  /**
   * Used to store a device string.
   *
   * ( see equipment page - devices table )
   */
  device?: string;

  /**
   * Not used atm.
   */
  tags?: any[];

  /**
   * Used to store the mac address of the devices.
   *
   * ( see equipment page - devices table )
   */
  mac?: string;
}

// custom type for models
export type modelEnum = 'EM6000' | 'EM300-500G4' | 'SR2050-IEM' | 'SR2000-IEM' | 'SR-IEMG4' | 'L6000' | 'gap-element';

// custom type for matching status
export type matchingEnum = 'matched' | 'property_mismatched' | 'not_matched' | 'extra' | 'offline';

// custom type for device types
export type typeEnum = 'ssc' | 'bin';

export type sizeEnum = 'tiny' | 'standard';
