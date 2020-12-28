import Transaction from './Transaction';
import { oneYearAgo } from './Utilities'

export default class Lot {
  symbol: string;
  purchaseDate: Date;
  units: number;
  price: number;
  cost: number;
  value: number;
  shortTermGain: number;
  longTermGain: number;
  totalGain: number;

  constructor(transaction: Transaction) {
    this.symbol = transaction.symbol
    this.purchaseDate = transaction.date
    this.units = transaction.units
    this.price = transaction.price
    this.cost = this.units * this.price
    this.value = this.units * transaction.currentPrice
    this.totalGain = (this.units * transaction.currentPrice) - this.cost

    if (this.purchaseDate > oneYearAgo()) {
      this.shortTermGain = this.totalGain
      this.longTermGain = 0
    } else {
      this.shortTermGain = 0
      this.longTermGain = this.totalGain
    }
  }

  toRow() : SheetRow {
    return [this.symbol, this.purchaseDate, this.units, this.price, this.cost, this.value, this.shortTermGain, this.longTermGain, this.totalGain]
  }

  compareTo(other: Lot) {
    if (this.purchaseDate < other.purchaseDate) {
      return -1
    }
    if (this.purchaseDate > other.purchaseDate) {
      return 1
    }
    return 0
  }
}