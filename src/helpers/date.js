/**
 * Removes time portion of a dateTime string.
 * @param {string} dateTime DateTime string.
 * @returns {string} Date string.
 */
export const removeTime = dateTime =>
    dateTime.substring(0, dateTime.indexOf('T'))
