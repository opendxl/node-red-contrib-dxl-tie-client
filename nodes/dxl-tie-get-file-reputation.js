/**
 * @module DxlTieGetFileReputation
 * @description Implementation of the `dxl-tie-get-file-reputation` node
 * @private
 */

'use strict'

var nodeRedDxl = require('@opendxl/node-red-contrib-dxl')
var MessageUtils = nodeRedDxl.MessageUtils
var NodeUtils = nodeRedDxl.NodeUtils
var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient

module.exports = function (RED) {
  /**
   * @classdesc Node which retrieves the reputations for the specified
   * file (as identified by hashes).
   * @param {Object} nodeConfig - Configuration data which the node uses.
   * @param {String} nodeConfig.client - Id of the DXL client configuration
   *   node that this node should be associated with.
   * @param {String} [nodeConfig.returnType=obj] - Controls the data type for
   *   the response payload, set as `msg.payload`. If returnType is 'bin',
   *   `msg.payload` is a raw binary Buffer. If returnType is 'txt',
   *   `msg.payload` is a String (decoded as UTF-8). If returnType is 'obj', is
   *   an Object (decoded as a JSON document from the original payload). If an
   *   error occurs when attempting to convert the binary Buffer of the payload
   *   into the desired data type, the current flow is halted with an error.
   * @private
   * @constructor
   */
  function TieGetFileReputationNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

    /**
     * Controls the data type for the response payload.
     * @type {String}
     * @private
     */
    this._returnType = nodeConfig.returnType || 'obj'

    var node = this

    this.status({
      fill: 'red',
      shape: 'ring',
      text: 'node-red:common.status.disconnected'
    })

    if (this._client) {
      this._client.registerUserNode(this)
      var tieClient = new TieClient(this._client.dxlClient)
      this.on('input', function (msg) {
        var hashes = NodeUtils.extractProperty(msg, 'hashes')
        if (hashes) {
          tieClient.getFileReputation(
            function (error, reputations) {
              if (reputations) {
                msg.payload = MessageUtils.objectToReturnType(reputations,
                  node._returnType)
                node.send(msg)
              } else {
                node.error(error.message, msg)
              }
            },
            hashes
          )
        } else {
          node.error('hashes property was not specified', msg)
        }
      })
      this.on('close', function (done) {
        node._client.unregisterUserNode(node, done)
      })
      if (this._client.connected) {
        this.status({
          fill: 'green',
          shape: 'dot',
          text: 'node-red:common.status.connected'
        })
      }
    } else {
      this.error('Missing client configuration')
    }
  }

  RED.nodes.registerType('dxl-tie-get-file-reputation', TieGetFileReputationNode)
}
