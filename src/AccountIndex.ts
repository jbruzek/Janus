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
  private saleMethod: CostBasisMethod
  private feeMethod: CostBasisMethod

  constructor() {
    this.index = new Map<string, SymbolIndex>()
    this.saleMethod = CostBasisMethod.AVERAGE_COST
    this.feeMethod = CostBasisMethod.AVERAGE_COST
  }

  /**
   * Index and store the data for a purchase transaction
   * @param transaction transaction to process. Must be a purchase
   * @throws exception if transaction is not a purchase
   */
  assessPurchase(transaction: Transaction) {
    if (!transaction.isPurchase()) {
      throw "Transaction must be a purchase"
    }
    let bucket = this.getOrCreate(transaction.symbol)
    if (transaction.type == "Buy") {
      bucket.cost += (transaction.price * transaction.units)
    }
    bucket.units += transaction.units
    bucket.currentPrice = transaction.currentPrice
    bucket.lots.insert(new Lot(transaction))
  }

  /**
   * Index and store the data for a Fee transaction
   * @param transaction transaction to process. Must be a Fee
   * @throws exception if transaction is not a fee
   */
  assessFee(transaction: Transaction) {
    if (transaction.type != "Fee") {
      throw "Transaction must be a Fee"
    }
    let bucket = this.getOrCreate(transaction.symbol)
    bucket.units -= transaction.units
    bucket.currentPrice = transaction.currentPrice
  }

  /**
   * Get the total return for this account
   * @returns the total return as a percent
   */
  getReturn(): number {
    let totalCost = 0
    let totalValue = 0
    this.index.forEach((value, key, map) => {
      totalCost += value.cost
      totalValue += (value.units * value.currentPrice)
    })
    return (totalValue - totalCost) / totalCost
  }

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