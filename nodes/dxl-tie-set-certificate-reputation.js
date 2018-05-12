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
          node.error('Certificate SHA1 not set in payload', msg)
        } else {
          var publicKeySha1 = Util.popKey(msg, 'publicKeySha1')
          var comment = NodeUtils.defaultIfEmpty(nodeConfig.comment,
            Util.popKey(msg, 'comment'))
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
            msg.payload,
            publicKeySha1,
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

  RED.nodes.registerType('dxl-tie-set-certificate-reputation', TieSetFileReputationNode)
}
