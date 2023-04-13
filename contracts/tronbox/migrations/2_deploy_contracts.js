var TrustScoreRegistry = artifacts.require("./TrustScoreRegistry.sol");

module.exports = function (deployer) {
  deployer.deploy(TrustScoreRegistry);
};
