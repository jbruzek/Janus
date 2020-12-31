/**
 * String resources for the Janus project.
 * 
 * Due to issue with exports not being supported properly in CLASP, strings are added to the global namespace instead of a module.
 * This is a small project so far and I don't want to put the effort into finding a better solution
 * https://github.com/google/clasp/blob/master/docs/typescript.md#modules-exports-and-imports
 * 
 * @packageDocumentation
 */

const TOTAL_RETURN_HEADERS = ["Account/Fund", "Return w Div", "Janus Return"]
const TAX_LOT_HEADERS = ["Symbol", "Purchase Date", "Units", "Price", "Cost", "Current Price", "Value", "Short Term Gains", "Long Term Gains", "Total Gain"]

const TRANSACTION_NOT_PURCHASE = "Transaction must be a purchase"
const TRANSACTION_TO_LOT_NOT_PURCHASE = "Transaction must be a purchase in order to create a new Lot"
const TRANSACTION_NOT_DIVIDEND = "Transaction must be a dividend"
const TRANSACTION_NOT_FEE = "Transaction must be a fee"
const TRANSACTION_NOT_CONVERSION = "Transaction must be a conversion"
const CONVERSION_OUT_OF_ORDER = "Must process outgoing fund conversion before incoming conversion"

function NOT_ENOUGH_DIVIDEND_INCOME(date: Date, dividendIncome: number, amount: number) { return "Transaction on date " + date + " is reinvesting more money than available. Dividend income: $" + dividendIncome + ". Reinvestment cost: $" + amount }
function TRANSACTION_FROM_WRONG_ACCOUNT(date: Date, tAccount: string, iAccount: string) { return "Transaction on date " + date + " is from account " + tAccount + " and cannot be added to the index for account " + iAccount }
function INCORRECT_NUMBER_OF_COLUMNS(num: number) { return "Incorrect number of columns. Required format is " + num + " columns with headers: Account | Date | Type | Symbol | Units | Price | Fees | Stock Split Ratio | Current Price" }