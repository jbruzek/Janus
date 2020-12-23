/**
 * Object representing a transaction
 */
class Transaction {
  account: string;
  date: number;
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

  toRow(): SheetRow {
    return [this.account, this.date, this.type, this.symbol, this.units, this.price, this.fee, this.split, this.currentPrice]; 
  }

  /** Get the return for this transaction assuming buy and hold */
  getReturn(): number {
    return ((this.currentPrice - this.price) * this.units) / (this.price * this.units);
  }
}