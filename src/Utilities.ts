// Number of columns in a valid transaction record
const NUMBER_OF_COLUMNS = 9;
let oneYearAgo: Date

/**
 * https://gist.github.com/stekhn/a12ed417e91f90ecec14bcfa4c2ae16a
 */
export function weightedMean_(arrValues: Array<number>, arrWeights: Array<number>): number {

  var result = arrValues.map(function (value, i) {

    var weight = arrWeights[i];
    var sum = value * weight;

    return [sum, weight];
  }).reduce(function (p, c) {

    return [p[0] + c[0], p[1] + c[1]];
  }, [0, 0]);

  return result[0] / result[1];
}

/**
 * Get a date that is exactly one year ago
 */
export function oneYearAgo_() : Date {
  if (oneYearAgo == undefined) {
    oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  }
  return oneYearAgo
}

/**
 * Check a range to make sure it meets the criteria to be processed as a list of transactions
 * @param range a range of (hopefully, maybe) properly formatted transaction rows
 */
export function checkValidRange_(range: SheetRange) {
  if (range[0].length != NUMBER_OF_COLUMNS) {
    throw "Incorrect number of columns"
  }
}