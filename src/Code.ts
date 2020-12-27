import { findReturn, findReturnByEach, getLots } from "./Janus";
import Transaction from "./Transaction";
import { checkValidRange_ } from "./Utilities";

/**
 * Get the total return for the input range of transactions
 *
 * @param {range} range of transactions
 * @return Total rate of return for this range
 * @customfunction
 */
function TOTALRETURNRATE(range: SheetRange) {
  checkValidRange_(range)
  
  const transactions = [];
  
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
  const result = [];
  result.push(["Account/Fund", "Return no Div", "Return w Div"])
  for (const property in byAccount) {
    let content = [];
    content[0] = property;
    content[1] = findReturnByEach(byAccount[property])
    content[2] = findReturn(byAccount[property])
    result.push(content)
  }
  for (const property in bySymbol) {
    let content = [];
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
  checkValidRange_(range)

  const transactions: Array<Transaction> = [];
  for (const row of range) {
    transactions.push(new Transaction(row))
  }
  const result = [];
  result.push(["Symbol", "Purchase Date", "Units", "Price", "Cost", "Value", "Short Term Gains", "Long Term Gains", "Total Gain"])

  const lots = getLots(transactions)
  let totalCost = 0
  let totalValue = 0
  let totalShort = 0
  let totalLong = 0
  let totalGain = 0
  lots.forEach(lot => {
    totalCost += lot.cost
    totalValue += lot.value
    totalShort += lot.shortTermGain
    totalLong += lot.longTermGain
    totalGain += lot.totalGain
  })
  return result
    .concat(lots.map(lot => lot.toRow()))
    .concat([["", "", "", "", totalCost, totalValue, totalShort, totalLong, totalGain]])
}