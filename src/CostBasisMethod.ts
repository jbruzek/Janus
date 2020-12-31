/**
 * Enum representing the cost basis method used to execute a sale of funds.
 * https://investor.vanguard.com/taxes/cost-basis/methods
 */
enum CostBasisMethod {
  /**
   * Average Cost.
   * https://investor.vanguard.com/taxes/cost-basis/average-cost
   */
  AVERAGE_COST,

  /**
   * First In, First Out.
   * https://investor.vanguard.com/taxes/cost-basis/first-in-first-out
   */
  FIFO,

  /**
   * Highest In, First Out.
   * https://investor.vanguard.com/taxes/cost-basis/highest-in-first-out
   */
  HIFO
}

export default CostBasisMethod