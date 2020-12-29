import Janus from "./Janus";
import Lot from "./Lot";
import SortedArray from "./SortedArray";
import Transaction from "./Transaction";
import { checkValidRange, weightedMean } from "./Utilities";

/**
 * Get the total return for the input range of transactions
 *
 * @param {range} range of transactions
 * @returns Total rate of return for this range
 * @customfunction
 */
function TOTALRETURNRATE(range: SheetRange) {
  checkValidRange(range)
  
  const transactions: Array<Transaction> = [];
  
  const byAccount = {};
  const bySymbol = {};
  for (const row of range) {
    const transaction = new Transaction(row);
    transactions.push(transaction);
    
    if (!byAccount.hasOwnProperty(transaction.account)) {
      byAccount[transaction.account] = [];
    }
    if (!bySymbol.hasOwnProperty(transaction.symbol)) {
      bySymbol[transaction.symbol] = [];
    }
    
    byAccount[transaction.account].push(transaction);
    bySymbol[transaction.symbol].push(transaction);
  }
  
  /**********************/
  const result: SheetRange = [];
  result.push(["Account/Fund", "Return w Div", "Janus Return"])
  for (const property in byAccount) {
    let content: SheetRow = [];
    content[0] = property;
    content[1] = findReturn(byAccount[property])
    content[2] = new Janus().processTransactions(byAccount[property]).getAccountReturn()
    result.push(content)
  }
  for (const property in bySymbol) {
    let content: SheetRow = [];
    content[0] = property;
    content[1] = findReturn(bySymbol[property])
    // content[2] = Janus.findReturnForOneSymbol(bySymbol[property])
    result.push(content)
  }

  return result;
  //return JSON.stringify(bySymbol);
  //return findReturn_(transactions)
  
  //return transactions.map(trans => trans.getReturn());
}

/**
 * Get cost basis lots from transactions
 * 
 * @param range range of transactions
 * @returns a table of cost basis lots with summations
 * @customfunction
 */
function COSTBASISLOTS(range: SheetRange) {
  checkValidRange(range)

  const transactions: Array<Transaction> = [];
  for (const row of range) {
    transactions.push(new Transaction(row))
  }
  const result: SheetRange = [];
  result.push(["Symbol", "Purchase Date", "Units", "Price", "Cost", "Current Price", "Value", "Short Term Gains", "Long Term Gains", "Total Gain"])

  const lots = getLots(transactions)
  let totalCost = 0
  let totalValue = 0
  let totalShort = 0
  let totalLong = 0
  let totalGain = 0
  return result
    .concat(lots.map(lot => {
      totalCost += lot.cost
      totalValue += lot.value
      totalShort += lot.shortTermGain
      totalLong += lot.longTermGain
      totalGain += lot.totalGain
      return lot.toRow()
    }))
    .concat([["", "", "", "", totalCost, "", totalValue, totalShort, totalLong, totalGain]])
}

/***************************************************************************************************
 * Functions that I made before I started getting into the Janus architecture
 ***************************************************************************************************/


/**
 * Find the rate of return for a list of transactions that has multiple symbols
 * 
 * @param transactions Array of transactions
 * @returns the total return as a percentage
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
    } else if (trans.type != "Dividend") {
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
 * @returns the total return as a percentage
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
 * @returns an array of tax lots
 */
export function getLots(transactions: Array<Transaction>) : Array<Lot> {
  return transactions
    .filter(transaction => transaction.isPurchase())
    .map(transaction => new Lot(transaction))
}