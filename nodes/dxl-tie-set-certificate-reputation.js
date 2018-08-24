/**
 * @module DxlTieSetCertificateReputation
 * @description Implementation of the `dxl-tie-set-certificate-reputation` node
 * @private
 */

'use strict'

var NodeUtils = require('@opendxl/node-red-contrib-dxl').NodeUtils
var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient

module.exports = function (RED) {
  /**
   * @classdesc Node which sets the "Enterprise" reputation (`trust level`) of
   * a specified certificate (as identified by hashes).
   * @param {Object} nodeConfig - Configuration data which the node uses.
   * @param {String} nodeConfig.client - Id of the DXL client configuration
   *   node that this node should be associated with.
   * @param {Number} [nodeConfig.trustLevel] - New "trust level" for the
   *   certificate. If the value is empty, the trust level will be retrieved
   *   from the `msg.trustLevel` property in the input message.
   * @param {String} [nodeConfig.comment] - Comment to associate with the
   *   certificate. If the value is empty, the comment will be derived from the
   *   input message's `msg.comment` property.
   * @private
   * @constructor
   */
  function TieSetFileReputationNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

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
        var sha1 = NodeUtils.extractProperty(msg, 'sha1')
        var trustLevel = NodeUtils.valueToNumber(nodeConfig.trustLevel,
          NodeUtils.extractProperty(msg, 'trustLevel'))
        var publicKeySha1 = NodeUtils.extractProperty(msg, 'publicKeySha1')
        var comment = NodeUtils.defaultIfEmpty(nodeConfig.comment,
          NodeUtils.extractProperty(msg, 'comment'))
        if (sha1) {
          tieClient.setCertificateReputation(
            function (error) {
              if (error) {
                node.error(error.message, msg)
              } else {
                msg.payload = 'Succeeded'
                node.send(msg)
              }
            },
            trustLevel,
            sha1,
            publicKeySha1,
            comment
          )
        } else {
          node.error('sha1 property was not specified', msg)
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

  RED.nodes.registerType('dxl-tie-set-certificate-reputation', TieSetFileReputationNode)
}
