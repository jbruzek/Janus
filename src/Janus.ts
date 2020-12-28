import Lot from "./Lot";
import SortedArray from "./SortedArray";
import Transaction from "./Transaction"
import { weightedMean } from "./Utilities";

class Janus {
  private lots: SortedArray<Lot>

  constructor() {
    this.lots = new SortedArray<Lot>((a, b) => a.compareTo(b))
  }

  processTransaction(transaction: Transaction) {
    /*
      if the transaction creates a new lot (buy, reinvest)
        create the new lot. Add to lot list (in sorted order)
      if fee
        process fee over previous lots using correct cost basis method
      if sell
        process sell over previous lots using correct cost basis method
        if sell splits a lot
          create new lot and insert into lot list at correct point
      if conversion
        update previous lots to handle conversion
      if split
        update previous lots to handle split
    */
  }
}

/**
 * Find the rate of return from a set of transactions
 * 
 * @param transactions Array of transactions
 */
export function findReturnByEach(transactions: Array<Transaction>) : number {
  let returns = [];
  let weights = [];
  
  const totalUnits = transactions.map(v => v.units).reduce((sum, current) => sum + current, 0)
  for (const transaction of transactions) {
    if (transaction.type == "Dividend" || transaction.type == "Conversion") {
      continue;
    }
    returns.push(((transaction.currentPrice - transaction.price) * transaction.units) / (transaction.price * transaction.units))
    weights.push(transaction.units / totalUnits)
  }
  
  return weightedMean(returns, weights)
}

/**
 * Find the rate of return for a list of transactions that has multiple symbols
 * 
 * @param transactions Array of transactions
 */
export function findReturn(transactions: Array<Transaction>) : number {
  //construct the index
  let index = {}
  let conversionCost = 0

  for (const trans of transactions) {
    //if this symbol's record doesn't exist yet, build it
    if (!(trans.symbol in index)) {
      index[trans.symbol] = {
        cost: 0,
        units: 0,
        currentPrice: 0,
        transactions: []
      }
    }
    //add this transaction data
    if (trans.type == "Buy") {
      index[trans.symbol].cost += (trans.price * trans.units)
    }
    if (trans.type == "Fee") {
      index[trans.symbol].units -= trans.units
    } else {
      index[trans.symbol].units += trans.units
    }
    index[trans.symbol].currentPrice = trans.currentPrice

    //handle a share conversion
    if (trans.isConverstion() && conversionCost === 0) {
      conversionCost = index[trans.symbol].cost
      delete index[trans.symbol]
    } else if (trans.isConverstion() && conversionCost != 0) {
      index[trans.symbol].cost = conversionCost
      conversionCost = 0
    }
  }

  //calculate returns
  let returns = []
  let weights = []
  for (const key in index) { 
    if (Object.prototype.hasOwnProperty.call(index, key)) {
      let ret = ((index[key].units * index[key].currentPrice) - index[key].cost) / index[key].cost;
      returns.push(ret)
      weights.push(index[key].cost)
    }
  }

  return weightedMean(returns, weights);
}

/**
 * Find the rate of return for a set of transactions that are all of the same symbol
 * 
 * @param transactions Array of transactions of only one symbol
 */
export function findReturnForOneSymbol(transactions: Array<Transaction>) : number {
  if (transactions.length <= 0) {
    throw "Transactions array must not be empty"
  }
  let symbol = transactions[0].symbol
  let cost = 0
  let units = 0
  let currentPrice = 0
  for (const transaction of transactions) {
    if (transaction.symbol != symbol) {
      throw "All transactions must have the same symbol"
    }
    if (transaction.type == "Buy") {
      cost += (transaction.price * transaction.units)
    }
    units += transaction.units
    currentPrice = transaction.currentPrice
  }

  return ((units * currentPrice) - cost) / cost
}

/**
 * Get cost basis lot details for a list of transactions
 * 
 * @param transactions Array of Transactions
 */
export function getLots(transactions: Array<Transaction>) : Array<Lot> {
  return transactions
    .filter(transaction => transaction.isPurchase())
    .map(transaction => new Lot(transaction))
}