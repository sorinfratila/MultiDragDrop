import { Device, matchingEnum, sizeEnum } from './Device';
export class Channel {
  // Channel Properties comming from BE
  id?: string;
  orderNumber?: number;
  deviceId?: string;
  rx?: number;
  name?: string;
  ip?: string;
  frequency?: number;
  band?: string;
  matchingStatus?: matchingEnum;
  bank?: string;
  channel?: string;
  autoLock?: number;
  warningAfPeak?: number;
  warningRfMute?: number;
  sensitivity?: number;
  mode?: number;
  equalizer?: number;
  rfMute?: number;
  rfPower?: number;
  rxSetValAutoLock?: number;
  rxSetValBalance?: number;
  rxSetValMode?: number;
  rxSetValLimiter?: number;
  rxSetValHiBoost?: number;
  rxSetValSquelch?: number;
  afOut?: number;
  squelch?: number;
  pilot?: number;
  warningLowBattery?: number;
  warningLowRfSignal?: number;
  warningTxMute?: number;
  warningRxMute?: number;
  txSetValSkAutoLock?: number;
  txSetValSkSensitivity?: number;
  txSetValSkRfPower?: number;
  txSetValSkMuteMode?: number;
  txSetValSkCableEmulation?: number;
  txSetValSkmAutoLock?: number;
  txSetValSkmSensitivity?: number;
  txSetValSkmRfPower?: number;
  txSetValSkmMuteMode?: number;
  txSetValSkmLowCut?: number;
  txSetValSkpAutoLock?: number;
  txSetValSkpSensitivity?: number;
  txSetValSkpRfPower?: number;
  txSetValSkpMuteMode?: number;
  txSetValSkpP48?: number;
  txActualAutoLock?: number;
  txActualPilot?: number;
  txActualRfPower?: number;
  txActualP48?: number;
  txActualMuteMode?: number;
  txActualLowCut?: number;
  txActualName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: Array<string>;
  skxBatteryTime?: string;
  skxBatteryLevel?: string;

  /**
   * Channel Properties only in the FE
   * [matchedWith] - the selected extra channel for the virtual device in matching table
   * TODO: to be continued...
   */
  draggable?: boolean;
  matchedWith?: string;
  isHighlighted?: boolean;
  canMatchWith?: Array<any>;
  disabled?: boolean;
  checked?: boolean;
  fromChecked?: boolean;
  toChecked?: boolean;
  toggled?: boolean;
  preToggled?: boolean;
  size?: sizeEnum;
  color?: colorEnum;

  // Device object comming from BE with Device Properties
  device?: Device;
  toMatchWithChannel?: any;

  constructor(data: any) {
    data.name = this.name;
    data.band = this.band;
    data.frequency = this.frequency;
    data.bank = this.bank;
    data.channel = this.channel;
    data.tags = this.tags;
    data.afOut = this.afOut;
    data.color = this.color;
    data.rfMute = this.rfMute;
    data.matchingStatus = this.matchingStatus;
  }
}

export type colorEnum = 'grey' | 'light-blue' | 'yellow' | 'rose';
