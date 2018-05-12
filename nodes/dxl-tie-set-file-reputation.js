'use strict'

var NodeUtils = require('@opendxl/node-red-contrib-dxl').NodeUtils
var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient
var Util = require('../lib/util')

module.exports = function (RED) {
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
        var trustLevel = NodeUtils.valueToNumber(nodeConfig.trustLevel,
          Util.popKey(msg, 'trustLevel'))
        if (!msg.payload) {
          node.error('Hashes not set in payload', msg)
        } else {
          var fileName = Util.popKey(msg, 'fileName')
          var comment = NodeUtils.defaultIfEmpty(nodeConfig.comment,
            Util.popKey(msg, 'comment'))
          tieClient.setFileReputation(
            function (error) {
              if (error) {
                node.error(error.message, msg)
              } else {
                msg.payload = 'Succeeded'
                node.send(msg)
              }
            },
            trustLevel,
            msg.payload,
            fileName,
            comment
          )
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

  RED.nodes.registerType('dxl-tie-set-file-reputation', TieSetFileReputationNode)
}
