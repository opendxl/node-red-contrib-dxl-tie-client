/**
 * @module Util
 * @private
 */

'use strict'

module.exports = {
  popKey: function (obj, key) {
    var returnValue = obj[key]
    delete obj[key]
    return returnValue
  }
}
