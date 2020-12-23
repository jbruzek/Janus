class Janus {
  /**
   * Find the rate of return from a set of transactions
   * 
   * @param transactions Array of transactions
   */
  static findReturnByEach(transactions: Array<Transaction>) : number {
    let returns = [];
    let weights = [];
    
    const totalUnits = transactions.map(v => v.units).reduce((sum, current) => sum + current, 0)
    for (const transaction of transactions) {
      if (transaction.type == "Dividend") {
        continue;
      }
      returns.push(((transaction.currentPrice - transaction.price) * transaction.units) / (transaction.price * transaction.units))
      weights.push(transaction.units / totalUnits)
    }
    
    return weightedMean_(returns, weights)
  }

  /**
   * Find the rate of return for a list of transactions that has multiple symbols
   * 
   * @param transactions Array of transactions
   */
  static findReturn(transactions: Array<Transaction>) : number {
    //construct the index
    let index = {}
    for (const transaction of transactions) {
      //if this symbol's record doesn't exist yet, build it
      if (!(transaction.symbol in index)) {
        index[transaction.symbol] = {
          cost: 0,
          transactions: []
        }
      }
      //add this transaction data
      if (transaction.type == "Buy") {
        index[transaction.symbol].cost += (transaction.price * transaction.units)
      }
      index[transaction.symbol].transactions.push(transaction)
    }

    //calculate returns
    let returns = []
    let weights = []
    for (const key in index) { 
      if (Object.prototype.hasOwnProperty.call(index, key)) {
        returns.push(Janus.findReturnForOneSymbol(index[key].transactions))
        weights.push(index[key].cost)
      }
    }

    return weightedMean_(returns, weights);
  }

  /**
   * Find the rate of return for a set of transactions that are all of the same symbol
   * 
   * @param transactions Array of transactions of only one symbol
   */
  static findReturnForOneSymbol(transactions: Array<Transaction>) : number {
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
}