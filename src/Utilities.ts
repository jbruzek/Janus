import { SheetRange } from "./Types";

// Number of columns in a valid transaction record
const NUMBER_OF_COLUMNS = 9;
let oneYearAgo_: Date

/**
 * https://gist.github.com/stekhn/a12ed417e91f90ecec14bcfa4c2ae16a
 * @param arrValues an array of values to average
 * @param arrWeights an array of weights to assign to the values. Must match arrValues in length
 * @returns the average of the values with the assigned weights
 */
export function weightedMean(arrValues: Array<number>, arrWeights: Array<number>): number {

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
 * @returns a date one year ago
 */
export function oneYearAgo() : Date {
  if (oneYearAgo_ == undefined) {
    oneYearAgo_ = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  }
  return oneYearAgo_
}

/**
 * Check a range to make sure it meets the criteria to be processed as a list of transactions
 * @param range a range of (hopefully, maybe) properly formatted transaction rows
 * @throws exceptions if the range is invalid
 */
export function checkValidRange(range: SheetRange) {
  if (range[0].length != NUMBER_OF_COLUMNS) {
    throw "Incorrect number of columns"
  }
}