'use strict'

var tieClient = require('@opendxl/dxl-tie-client')
var TieClient = tieClient.TieClient

module.exports = function (RED) {
  function TieFileReputationChangeInNode (nodeConfig) {
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
      var callback = function (repChangeObj) {
        var msg = {payload: repChangeObj}
        node.send(msg)
      }
      tieClient.addFileReputationChangeCallback(callback)
      this.on('close', function (done) {
        tieClient.removeFileReputationChangeCallback(callback)
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

  RED.nodes.registerType('dxl-tie-file-reputation-change in',
    TieFileReputationChangeInNode)
}
