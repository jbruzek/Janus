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
  for (const property in byAccount) {
    let content = [];
    content[0] = property;
    content[1] = Janus.findReturn(byAccount[property])
    result.push(content)
  }
  for (const property in bySymbol) {
    let content = [];
    content[0] = property;
    content[1] = Janus.findReturn(bySymbol[property])
    result.push(content)
  }
  
  return result;
  //return JSON.stringify(bySymbol);
  //return findReturn_(transactions)
  
  //return transactions.map(trans => trans.getReturn());
}