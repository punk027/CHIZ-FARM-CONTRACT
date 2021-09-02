var fs = require('fs');
var MasterChef = artifacts.require("../contracts/masterchef.sol");
var ChizToken = artifacts.require("../contracts/chiz.sol");
const configs = require("../config.json");
const contracts = require("../contracts.json");
const ChizABI = require("../abi/ChizToken.json")

module.exports = async function(deployer) {
  try {
    
    let dataParse = contracts;

    if (configs.lpExist) {
      if (!configs.Farm) {
        console.log("sdf");
        const currentBlock = await web3.eth.getBlockNumber();
        const startBlock = configs.farm_param.startBlock
            || web3.utils.toBN(currentBlock).add(web3.utils.toBN(configs.farm_param.delay));
        await deployer.deploy(MasterChef, dataParse['NFTaddr1'], dataParse['NFTaddr2'], dataParse['ChizToken'], startBlock, configs.farm_param.devAddress, configs.farm_param.feeAddress, {
          gas: 5000000
        });
        const farmInstance = await MasterChef.deployed();
        dataParse['Farm'] = MasterChef.address;
        if (configs.farm_param.fund) {
          const chizTokenInstance = await ChizToken.at(dataParse['ChizToken']);
        
          await chizTokenInstance.approve(MasterChef.address, web3.utils.toBN(configs.farm_param.fund));
          await farmInstance.fund(web3.utils.toBN(configs.farm_param.fund));
        }
        console.log(configs.farm_param.lp);
        for (let i = 0; i < configs.farm_param.lp.length; i ++) {
          console.log("i=",i);
          const token = configs.farm_param.lp[i];
          if (token.address) {
            await farmInstance.add(
              token.allocPoint,
              token.address,
              token.depositFeeBP,
              token.isPoolPrivileged,
            );
          }
        }
      }
      else {
        dataParse['Farm'] = configs.Farm;
      }      
    }

    const updatedData = JSON.stringify(dataParse);
		await fs.promises.writeFile('contracts.json', updatedData);

  } catch (error) {
    console.log(error);
  }

};
