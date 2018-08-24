The McAfee Threat Intelligence Exchange (TIE) DXL Node-RED client package
includes JSON documents with sample Node-RED flows. To import samples into
Node-RED, perform the following steps:

1. In the upper-right corner of the Node-RED UI, press the side menu button.

1. Select one of examples under
   `Import → Examples → dxl tie-client` in the menu drop-down list.

In order for the sample flows to execute properly, Node-RED must be able to
connect to a DXL fabric. For more information on connecting to a DXL fabric
from Node-RED, see the
[Client Configuration](https://opendxl.github.io/node-red-contrib-dxl/jsdoc/tutorial-configuration.html)
section in the OpenDXL Node-RED package documentation.

See the following sections for an overview of each sample.

### Operation Samples

#### Basic Get Certificate First References (basic-get-cert-first-ref-example)

This sample invokes the TIE DXL service to retrieve the set of systems which
have referenced a certificate (as identified by hashes).

#### Basic Get Certificate Reputation (basic-get-cert-reputation-example)

This sample invokes the TIE DXL service to retrieve the reputation of a
certificate (as identified by hashes).

#### Basic Get File First References (basic-get-file-first-ref-example)

This sample invokes the TIE DXL service to retrieve the set of systems which
have referenced a file (as identified by hashes).

#### Basic Get File Reputation (basic-get-file-reputation-example)

This sample invokes the TIE DXL service to retrieve the reputation of a file
(as identified by hashes).

#### Basic Set Certificate Reputation (basic-set-cert-reputation-example)

This sample invokes the TIE DXL service to set the enterprise-specific
`trust level` of a certificate (as identified by hashes).

#### Basic Set File Reputation (basic-set-file-reputation-example)

This sample invokes the TIE DXL service to set the enterprise-specific
`trust level` of a file (as identified by hashes).

### Notification Samples

#### Basic Detection Event (basic-detection-event-example)

This sample registers with the DXL fabric to receive detection events from
TIE when detections occur on managed systems.

#### Basic First Instance Event (basic-first-instance-event-example)

This sample registers with the DXL fabric to receive first instance events from
TIE when files are encountered for the first time within the local enterprise.
