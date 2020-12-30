import AccountIndex from "./AccountIndex";
import Lot from "./Lot";
import Transaction from "./Transaction"

/**
 * Janus is a class that contains functions for processing and analyzing transactions.
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
   * Get the tax lots for this account
   * @returns an array of Lots, in sorted order
   */
  getTaxLots() : Array<Lot> {
    let lots: Array<Lot> = []
    this.index.forEach(item => {
      lots = lots.concat(item.lots.data)
    })
    return lots.sort((a, b) => a.compareTo(b))
  }

  /**
   * Process a list of transactions, indexing and storing the data
   * @param transactions a list of transactions all in the same account
   * @returns this instance for method chaining
   * @throws exception if transactions come from multiple accounts
   */
  processTransactions(transactions: Array<Transaction>) : Janus {
    transactions.forEach(trans => {
      this.checkTransactionAccount(trans)
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
    } else if (transaction.type == "Dividend") {
      this.index.assessDividend(transaction)
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

  /**
   * Make sure that a transaction comes from the correct account
   * @param trans a Transaction to check
   * @throws exception if this transaction is from a different account
   */
  private checkTransactionAccount(trans: Transaction) {
    if (this.account == "") {
      this.account = trans.account
    }
    if (this.account != trans.account) {
      throw TRANSACTION_FROM_WRONG_ACCOUNT(trans.date, trans.account, this.account)
    }
  }
}