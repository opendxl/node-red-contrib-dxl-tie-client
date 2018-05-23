'use strict'

var NodeUtils = require('@opendxl/node-red-contrib-dxl').NodeUtils
var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient

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
