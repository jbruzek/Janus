// Number of columns in a valid transaction record
const NUMBER_OF_COLUMNS = 9;

/**
 * https://gist.github.com/stekhn/a12ed417e91f90ecec14bcfa4c2ae16a
 */
function weightedMean_(arrValues: Array<number>, arrWeights: Array<number>): number {

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
 * Check a range to make sure it meets the criteria to be processed as a list of transactions
 * @param range a range of (hopefully, maybe) properly formatted transaction rows
 */
function checkValidRange_(range: SheetRange) {
  if (range[0].length != NUMBER_OF_COLUMNS) {
    throw "Incorrect number of columns"
  }
}