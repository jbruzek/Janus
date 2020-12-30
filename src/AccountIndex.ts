import Lot from "./Lot";
import SortedArray from "./SortedArray";
import Transaction from "./Transaction";

/**
 * An index for one symbol
 */
interface SymbolIndex {
  symbol: string
  cost: number
  units: number
  currentPrice: number
  lots: SortedArray<Lot>
}

/**
 * Enum representing the cost basis method used to execute a sale of funds.
 * https://investor.vanguard.com/taxes/cost-basis/methods
 */
enum CostBasisMethod {
  AVERAGE_COST,
  FIFO,
  HIFO
}

/**
 * Index of funds in an account with summations and lot tracking
 */
export default class AccountIndex {
  private index: Map<string, SymbolIndex>
  private dividendIncome: number
  private saleMethod: CostBasisMethod
  private feeMethod: CostBasisMethod
  private conversionRollover: SymbolIndex

  constructor() {
    this.index = new Map<string, SymbolIndex>()
    this.dividendIncome = 0
    this.saleMethod = CostBasisMethod.AVERAGE_COST
    this.feeMethod = CostBasisMethod.AVERAGE_COST
    this.conversionRollover = this.symbolIndexFactory("Rollover")
  }

  /**
   * Index and store the data for a purchase transaction
   * @param transaction transaction to process. Must be a purchase
   * @throws exception if transaction is not a purchase
   * @throws exception if a reinvestment is being attempted when there is no dividend income to reinvest
   */
  processPurchase(transaction: Transaction) {
    if (!transaction.isPurchase()) {
      throw TRANSACTION_NOT_PURCHASE
    }
    const bucket = this.getOrCreate(transaction.symbol)
    if (transaction.type == "Buy") {
      bucket.cost += (transaction.price * transaction.units)
    }
    if (transaction.type == "Reinvestment") {
      const amount = transaction.price * transaction.units
      if (amount > this.dividendIncome) {
        throw NOT_ENOUGH_DIVIDEND_INCOME(transaction.date, this.dividendIncome, amount)
      }
      this.dividendIncome -= amount
    }
    bucket.units += transaction.units
    bucket.currentPrice = transaction.currentPrice
    bucket.lots.insert(new Lot(transaction))
  }

  /**
   * Index and store the data for a Dividend transaction
   * @param transaction transaction to process. Must be a Dividend
   * @throws exception if transaction is not a dividend
   */
  processDividend(transaction: Transaction) {
    if (transaction.type != "Dividend") {
      throw TRANSACTION_NOT_DIVIDEND
    }
    this.dividendIncome += transaction.units * transaction.price
  }

  /**
   * Index and store the data for a Fee transaction
   * @param transaction transaction to process. Must be a Fee
   * @throws exception if transaction is not a fee
   */
  processFee(transaction: Transaction) {
    if (transaction.type != "Fee") {
      throw TRANSACTION_NOT_FEE
    }
    //TODO: if dividend income exists to cover this fee, take from there, else...
    const bucket = this.getOrCreate(transaction.symbol)
    bucket.units -= transaction.units
    bucket.currentPrice = transaction.currentPrice
    //TODO: transact over previous lots using feeMethod to determine sold units
  }

  /**
   * Index and store the data for a Conversion transaction (outgoing or incoming).
   * Conversions take place over two different transactions, one outgoing and one incoming.
   * An outgoing conversion transaction has a negative units value, and must be processed before it's 
   * incoming couterpart transaction. After an outgoing conversion transaction has been processed, 
   * an incoming conversion transaction (one with positive units value) can be processed.
   * @param transaction transaction to process. Must be a conversion
   * @throws exception if conversion is happening out of order.
   */
  processConversion(transaction: Transaction) {
    if (this.conversionRollover.cost == 0) {
      //outgoing conversion
      if (transaction.units > 0) {
        throw CONVERSION_OUT_OF_ORDER
      }
      const bucket = this.getOrCreate(transaction.symbol)
      this.conversionRollover = bucket
      this.index.delete(transaction.symbol)
    } else {
      if (transaction.units < 0) {
        throw CONVERSION_OUT_OF_ORDER
      }
      //incoming conversion
      const bucket = this.getOrCreate(transaction.symbol)
      bucket.cost = this.conversionRollover.cost
      bucket.units = transaction.units
      bucket.currentPrice = transaction.currentPrice
      const ratio = transaction.units / this.conversionRollover.units
      this.conversionRollover.lots.data.forEach(lot => {
        //update the tax lots to have the correct units and cost as the new fund
        bucket.lots.insert(
          new Lot(
            new Transaction([transaction.account, lot.purchaseDate, "Buy", transaction.symbol, lot.units * ratio, lot.price / ratio, 0, 1, transaction.currentPrice])
          )
        )
      })
      this.conversionRollover = this.symbolIndexFactory("Rollover")
    }
  }

  /**
   * Get the total return for this account
   * @returns the total return as a percent
   */
  getReturn(): number {
    let totalCost = 0
    let totalValue = this.dividendIncome
    this.index.forEach((value, key, map) => {
      totalCost += value.cost
      totalValue += (value.units * value.currentPrice)
    })
    return (totalValue - totalCost) / totalCost
  }

  /**
   * Execute a function once per SymbolIndex item in the AccountIndex
   * @param op The function to execute for each entry in the AccountIndex
   */
  forEach(op: (item: SymbolIndex) => void) {
    this.index.forEach(op)
  }

  /**
   * Get this element in the index, or create it if it does not exist yet
   * @param symbol lookup value
   * @returns the SymbolIndex for this symbol
   */
  private getOrCreate(symbol: string) : SymbolIndex {
    if (!this.index.has(symbol)) {
      this.index.set(symbol, this.symbolIndexFactory(symbol))
    }
    return this.index.get(symbol)
  }

  /**
   * Create a SymbolIndex with provided or default values
   * @param symbol initial value for symbol. (required)
   * @param cost initial value for cost. Default value: 0
   * @param units initial value for units. Default value: 0
   * @param currentPrice initial value for currentPrice. Default value: 0
   * @returns the created SymbolIndex
   */
  private symbolIndexFactory(symbol: string, cost?: number, units?: number, currentPrice?: number) : SymbolIndex {
    return {
      symbol: symbol || "",
      cost: cost || 0,
      units: units || 0,
      currentPrice: currentPrice || 0,
      lots: new SortedArray<Lot>((a, b) => a.compareTo(b))
    }
  }
}