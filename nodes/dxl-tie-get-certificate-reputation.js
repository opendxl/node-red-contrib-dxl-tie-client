'use strict'

var MessageUtils = require('@opendxl/node-red-contrib-dxl').MessageUtils
var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient
var Util = require('../lib/util')

module.exports = function (RED) {
  function TieGetCertificateReputationNode (nodeConfig) {
    RED.nodes.createNode(this, nodeConfig)

    /**
     * Handle to the DXL client node used to make requests to the DXL fabric.
     * @type {Client}
     * @private
     */
    this._client = RED.nodes.getNode(nodeConfig.client)

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
        if (msg.payload) {
          var publicKeySha1 = Util.popKey(msg, 'publicKeySha1')
          tieClient.getCertificateReputation(
            function (error, reputations) {
              if (reputations) {
                msg.payload = MessageUtils.objectToReturnType(reputations,
                  node._returnType)
                node.send(msg)
              } else {
                node.error(error.message, msg)
              }
            },
            msg.payload,
            publicKeySha1
          )
        } else {
          node.error('Certificate SHA1 not set in payload', msg)
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

  RED.nodes.registerType('dxl-tie-get-certificate-reputation',
      TieGetCertificateReputationNode)
}
