const AWS = require("aws-sdk");

const ec2 = new AWS.EC2({
  region: process.env.AWS_REGION || "eu-north-1",
});

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    const action = event.action || "discoverTopology";

    if (action === "health") {
      return response(200, {
        success: true,
        service: "topology-intelligence",
        status: "healthy",
      });
    }

    const instancesResult = await ec2.describeInstances().promise();
    const vpcsResult = await ec2.describeVpcs().promise();
    const subnetsResult = await ec2.describeSubnets().promise();

    const nodes = [];
    const edges = [];

    for (const vpc of vpcsResult.Vpcs || []) {
      nodes.push({
        id: vpc.VpcId,
        label: vpc.VpcId,
        type: "VPC",
        status: "ACTIVE",
      });
    }

    for (const subnet of subnetsResult.Subnets || []) {
      nodes.push({
        id: subnet.SubnetId,
        label: subnet.SubnetId,
        type: "SUBNET",
        status: "ACTIVE",
      });

      edges.push({
        source: subnet.VpcId,
        target: subnet.SubnetId,
        relation: "contains",
      });
    }

    for (const reservation of instancesResult.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        nodes.push({
          id: instance.InstanceId,
          label: instance.InstanceId,
          type: "EC2",
          status: instance.State?.Name || "unknown",
        });

        if (instance.SubnetId) {
          edges.push({
            source: instance.SubnetId,
            target: instance.InstanceId,
            relation: "hosts",
          });
        }
      }
    }

    return response(200, {
      success: true,
      topology: {
        nodes,
        edges,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return response(500, {
      success: false,
      message: "Topology discovery failed",
      error: error.message,
    });
  }
};