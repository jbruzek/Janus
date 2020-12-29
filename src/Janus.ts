import AccountIndex from "./AccountIndex";
import Transaction from "./Transaction"

/**
 * Janus is a class that contains functions for processing and analyzing transactions
 * Each instance represents one account. 
 */
export default class Janus {
  private index: AccountIndex
  private account: string

  constructor() {
    this.index = new AccountIndex()
    this.account = ""
  }

  /**
   * Get the total return for this account
   * @returns the total return as a percent
   */
  getAccountReturn() : number {
    return this.index.getReturn()
  }

  /**
   * Process a list of transactions, indexing and storing the data
   * @param transactions a list of transactions all in the same account
   * @returns this instance for method chaining
   * @throws exception if transactions come from multiple accounts
   */
  processTransactions(transactions: Array<Transaction>) : Janus {
    transactions.forEach(trans => {
      if (this.account == "") {
        this.account = trans.account
      }
      if (this.account != trans.account) {
        throw "All transactions must be from the same account"
      }
      this.processTransaction(trans)
    })
    return this
  }

  /**
   * Process one transaction, indexing and storing the data
   * @param transaction a single transaction
   * @returns this instance for method chaining
   */
  private processTransaction(transaction: Transaction) : Janus {
    if (transaction.isPurchase()) {
      this.index.assessPurchase(transaction)
    } else if (transaction.type == "Fee") {
      this.index.assessFee(transaction)
    } else if (transaction.type == "Sell") {
      //process sell over previous lots using correct cost basis method
      //if sell splits a lot
      //  create new lot and insert into lot list at correct point
    } else if (transaction.type == "Conversion") {
      //process the conversion over previous lots
    } else if (transaction.type == "Split") {
      //split previous lots
    }
    return this
  }
}