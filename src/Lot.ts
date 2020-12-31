import Transaction from './Transaction';
import { SheetRow } from './util/Types';
import { oneYearAgo } from './util/Utilities'

/**
 * Class representing one tax lot. 
 * https://www.investopedia.com/terms/t/taxlotaccounting.asp
 */
export default class Lot {
  symbol: string;
  purchaseDate: Date;
  units: number;
  price: number;
  currentPrice: number;
  cost: number;
  value: number;
  shortTermGain: number;
  longTermGain: number;
  totalGain: number;

  constructor(symbol: string, purchaseDate: Date, units: number, price: number, currentPrice: number) {
    this.symbol = symbol
    this.purchaseDate = purchaseDate
    this.units = units
    this.price = price
    this.currentPrice = currentPrice
    this.cost = this.units * this.price
    this.value = this.units * this.currentPrice
    this.totalGain = (this.units * this.currentPrice) - this.cost

    if (this.purchaseDate > oneYearAgo()) {
      this.shortTermGain = this.totalGain
      this.longTermGain = 0
    } else {
      this.shortTermGain = 0
      this.longTermGain = this.totalGain
    }
  }

  /**
   * Get a Lot from a transaction. The transaction must be a purchase transaction in order to create a lot
   * @param transaction The source of the lot data
   * @throws exception if transaction is not a purchase
   */
  static fromTransaction(transaction: Transaction) : Lot {
    if (!transaction.isPurchase()) {
      throw TRANSACTION_TO_LOT_NOT_PURCHASE
    }
    return new Lot(transaction.symbol, transaction.date, transaction.units, transaction.price, transaction.currentPrice)
  }

  /**
   * Convert this Lot into a SheetRow representing the Lot
   */
  toRow() : SheetRow {
    return [this.symbol, this.purchaseDate, this.units, this.price, this.cost, this.currentPrice, this.value, this.shortTermGain, this.longTermGain, this.totalGain]
  }

  /**
   * Compare Lots by their purchase date. Returns negative if this Lot is older than the compared Lot
   * @param other a Lot to be compared to
   */
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