import { SheetRow, Type } from "./util/Types";

/**
 * Object representing a transaction
 */
export default class Transaction {
  account: string;
  date: Date;
  type: Type;
  symbol: string;
  units: number;
  price: number;
  fee: number;
  split: number;
  currentPrice: number;

  constructor(row: SheetRow) {
    this.account = row[0];
    this.date = row[1];
    this.type = row[2];
    this.symbol = row[3];
    this.units = row[4];
    this.price = row[5];
    this.fee = row[6];
    this.split = row[7];
    this.currentPrice = row[8];
  }

  /**
   * Is this a purchase transaction? i.e. did we gain units of a fund with this transaction
   * @returns whether it is a purchase
   */
  isPurchase(): boolean {
    return this.type == "Buy" || this.type == "Reinvestment"
  }

  /**
   * Is this a conversion transaction? 
   * @returns whether it is a conversion
   */
  isConverstion(): boolean {
    return this.type == "Conversion"
  }

  /**
   * Convert this transaction into a sheetrow
   * @returns SheetRow with the data of this transaction
   */
  toRow(): SheetRow {
    return [this.account, this.date, this.type, this.symbol, this.units, this.price, this.fee, this.split, this.currentPrice]; 
  }

  /** 
   * Get the return for this transaction assuming buy and hold
   * @returns the total return as a percentage
   */
  getReturn(): number {
    return ((this.currentPrice - this.price) * this.units) / (this.price * this.units);
  }
}