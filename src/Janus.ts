class Janus {
  /**
   * Find the rate of return from a set of transactions
   */
  static findReturn(transactions: Array<Transaction>) : number {
    let returns = [];
    let weights = [];
    
    const totalUnits = transactions.map(v => v.units).reduce((sum, current) => sum + current, 0);
    for (const transaction of transactions) {
      if (transaction.type == "Div") {
        continue;
      }
      returns.push(((transaction.currentPrice - transaction.price) * transaction.units) / (transaction.price * transaction.units))
      weights.push(transaction.units / totalUnits)
    }
    
    return weightedMean_(returns, weights);
  }
}