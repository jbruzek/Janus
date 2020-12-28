/**
 * An array that always remains sorted by the given comparator
 */
export default class SortedArray<T> {
  private comparator: (a: T, b: T) => number
  data: Array<T>

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator
    this.data = []
  }

  /**
   * Insert an item into the sorted array, maintaining sorted order 
   * https://stackoverflow.com/a/33697671/3682482
   * 
   * @param item the item to be inserted
   */
  insert(item: T) {
    // get the index we need to insert the item at
    var min = 0;
    var max = this.data.length;
    var index = Math.floor((min + max) >> 1);
    while (max > min) {
        if (this.comparator(item, this.data[index]) < 0) {
            max = index;
        } else {
            min = index + 1;
        }
        index = Math.floor((min + max) >> 1);
    }

    // insert the item
    this.data.splice(index, 0, item);
  }

  get(index: number): T {
    return this.data[index]
  }
}