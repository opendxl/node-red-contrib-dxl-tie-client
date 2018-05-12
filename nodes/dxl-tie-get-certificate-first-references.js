'use strict'

var nodeRedDxl = require('@opendxl/node-red-contrib-dxl')
var MessageUtils = nodeRedDxl.MessageUtils
var NodeUtils = nodeRedDxl.NodeUtils
var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient
var Util = require('../lib/util')

module.exports = function (RED) {
  function TieGetCertificateFirstReferencesNode (nodeConfig) {
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
          var queryLimit = NodeUtils.valueToNumber(
            nodeConfig.queryLimit, Util.popKey(msg, 'queryLimit'))
          tieClient.getCertificateFirstReferences(
            function (error, agents) {
              if (agents) {
                msg.payload = MessageUtils.objectToReturnType(agents,
                  node._returnType)
                node.send(msg)
              } else {
                node.error(error.message, msg)
              }
            },
            msg.payload,
            publicKeySha1,
            queryLimit
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

  RED.nodes.registerType('dxl-tie-get-certificate-first-references',
      TieGetCertificateFirstReferencesNode)
}
