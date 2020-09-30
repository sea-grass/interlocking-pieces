/* helpers.js */

const filterByType = (array, Type) => array.filter(item => item instanceof Type);
/**
 * 
 * @param {any[]} array 
 * @param {any} needle 
 */
const contains = (array, needle) => {
    const found = array.find(hay => needle === hay)
    if (found)
        return found
    return -1;
}

/**
 * 
 * @param  {...any[]} arrs 
 */
const joinArray = (...arrs) => arrs.flatMap(x => x);
const x = [[1, 2]];

export {
    filterByType,
    contains,
    joinArray
}