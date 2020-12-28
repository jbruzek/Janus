import { findReturn, findReturnByEach, getLots } from "./Janus";
import SortedArray from "./SortedArray";
import Transaction from "./Transaction";
import { checkValidRange } from "./Utilities";

/**
 * Get the total return for the input range of transactions
 *
 * @param {range} range of transactions
 * @return Total rate of return for this range
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
  result.push(["Account/Fund", "Return no Div", "Return w Div"])
  for (const property in byAccount) {
    let content: SheetRow = [];
    content[0] = property;
    content[1] = findReturnByEach(byAccount[property])
    content[2] = findReturn(byAccount[property])
    result.push(content)
  }
  for (const property in bySymbol) {
    let content: SheetRow = [];
    content[0] = property;
    content[1] = findReturnByEach(bySymbol[property])
    content[2] = findReturn(bySymbol[property])
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
 * @customfunction
 */
function COSTBASISLOTS(range: SheetRange) {
  checkValidRange(range)

  const transactions: Array<Transaction> = [];
  for (const row of range) {
    transactions.push(new Transaction(row))
  }
  const result: SheetRange = [];
  result.push(["Symbol", "Purchase Date", "Units", "Price", "Cost", "Value", "Short Term Gains", "Long Term Gains", "Total Gain"])

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
    .concat([["", "", "", "", totalCost, totalValue, totalShort, totalLong, totalGain]])
}

/**
 * 
 * @param range 
 * @customfunction
 */
function SORTEDARRAYTEST(range: SheetRange) {
  const data = new SortedArray<number>((a: number, b: number) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  })
  for (const row of range) {
    data.insert(row[0])
  }

  return data.data
}