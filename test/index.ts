const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { utils } = require('ethers');
const {
  address,
  minerStart,
  minerStop,
  unlockedAccount,
  encodeParameters,
  mineBlock,
  etherMantissa
} = require('./Utils/Ethereum');

describe("Voting contract", function () {
  let contract;
  let mainContract: any, governorAlpha: any, comp: any, timelock: any, nameRegistry:any;
  let owner: any, user1: any, user2: any, user3: any;

  before(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const MainContract = await ethers.getContractFactory('MainContract');
    mainContract = await upgrades.deployProxy(MainContract, []);
    await mainContract.deployed();
    console.log('MotingContract deployed to:', mainContract.address);

    const Token = await ethers.getContractFactory("Comp");
    comp = await upgrades.deployProxy(Token, [owner.address]);
    await comp.deployed();
    console.log('CompContract deployed to:', comp.address);

    const TimeLock = await ethers.getContractFactory("Timelock");
    timelock = await upgrades.deployProxy(TimeLock, [owner.address]);
    await timelock.deployed();
    console.log('TimelockContract deployed to:', timelock.address);

    const NameRegistry = await ethers.getContractFactory('NameRegistry');
    nameRegistry = await NameRegistry.deploy();
    await nameRegistry.deployed();
    console.log('NameRegistry Contract deployed to:', nameRegistry.address);
    await nameRegistry.set(1, "Governance", mainContract.address);

    const GOV = await ethers.getContractFactory("GovernorAlpha");
    governorAlpha = await upgrades.deployProxy(GOV, [nameRegistry.address, timelock.address, comp.address, owner.address]);
    await governorAlpha.deployed();
    console.log('GovernorAlphaContract deployed to:', governorAlpha.address);
  })
  
  it("full test voting system", async function () {
    
    //add new project to contract
    await mainContract.createProject("nft sample project", "Creabo Tokenpp7", "Creaboui7", 1000000, "1VPM", "AllMembers");

    //get project count of contract
    const projectCount = await mainContract.projectCount();

    //check project count is 1
    expect(projectCount.toNumber()).to.equal(1); 

    //set token allocation of first project
    const tokentype = ["governance", "utility", "fundraising"];
    const amount = [40, 40, 20];
    await mainContract.setTokenAllocation(1, tokentype, amount, "percent");

    const tokenCategory = await mainContract.getProjectTokenCategory(1);
    const allocationRes = [];
    console.log("************** Allocation **************");
    for(let i = 0; i < tokenCategory.length; ++ i) {
      const allocation = await mainContract.getTokenAllocation(1, tokenCategory[i]);
      const node = {
        amount: allocation[0].toNumber(),
        category: allocation[1]
      }
      allocationRes.push(node);
    }
    console.log(allocationRes);

    //set token distribution of first project
    await mainContract.setTokenDistribution(1, "governance", [owner.getAddress(), user1.getAddress()], [50, 50]);
    await mainContract.setTokenDistribution(1, "utility", [owner.getAddress(), user1.getAddress()], [60, 40]);
    await mainContract.setTokenDistribution(1, "fundraising", [owner.getAddress(), user1.getAddress(), user2.getAddress()], [40, 40, 20]);

    console.log("************** Distribution **************");
    for(let category of tokenCategory) {
      const distributionCount = await mainContract.getTokenDistributionCount(1, category);
      const distributions = [];
      for(let i = 0; i < distributionCount; ++ i) {
        const distribution = await mainContract.getTokenDistribution(1, category, i);
        const node = {
          eoa : distribution[0],
          percentage : distribution[1].toNumber(),
          amount : distribution[2].toNumber()
        };
        distributions.push(node);
      }
      console.log(category, distributions);
    }
    
    //get user1's token amount in project 1
    
    console.log("************** User's token amount in Project **************");
    const tokenAmount = await mainContract.getProjectUserTokenAmount(1, user1.getAddress());
    console.log(user1.address, tokenAmount.toNumber());

    
    console.log("************** User's weight in Project **************");
    const weight = await mainContract.getVotingPower(1, user1.getAddress());
    console.log(user1.address, weight.toNumber());
    // //register first project
    // await contract.register(1);

    console.log("************** ERC20 token address of Project **************");
    const tokenAddress = await mainContract.getTokenAddress();
    console.log(tokenAddress);

    console.log("************** ERC20 token totalsupply of Project **************");
    const totalSupply = await mainContract.getTokenTotalSupply();
    console.log(totalSupply / (10 ** 18));

    // //add new proposal to first project
    // await contract.addProposal(1, "aaaa");

    // let date = new Date();
    // let startTime = new Date(date).getTime();
    // let endTime = new Date(date.setDate(date.getDate() + 1)).getTime();

    // //set time to first proposal in first project
    // await contract.setTime(1, 1, startTime, endTime);

    // //for vote to first proposal in first project
    // await contract.addVote(1, 1, utils.formatBytes32String("for"));
  });

  
  it("test set token allocation double time", async function () {
    
    //add new project to contract
    await mainContract.createProject("nft sample project", "Creabo Tokenpp7", "Creaboui7", 1000000, "1VPM", "AllMembers");

    //get project count of contract
    const projectCount = await mainContract.projectCount();

    //set token allocation of first project
    let tokentype, amount, allocation, allocationRes, tokenCategory;
    tokentype = ["governance", "utility", "fundraising"];
    amount = [40, 40, 20];
    await mainContract.setTokenAllocation(projectCount, tokentype, amount, "percent");

    console.log("************** First Allocation **************");
    tokenCategory = await mainContract.getProjectTokenCategory(projectCount);
    allocationRes = [];
    for(let i = 0; i < tokenCategory.length; ++ i) {
      allocation = await mainContract.getTokenAllocation(projectCount, tokenCategory[i]);
      const node = {
        amount: allocation[0].toNumber(),
        category: allocation[1]
      }
      allocationRes.push(node);
    }
    console.log(allocationRes);

    
    tokentype = ["governance", "utility", "fundraising", "other"];
    amount = [40, 30, 20, 10];
    await mainContract.setTokenAllocation(projectCount, tokentype, amount, "percent");

    console.log("************** Second Allocation **************");
    
    tokenCategory = await mainContract.getProjectTokenCategory(projectCount);
    allocationRes = [];
    for(let i = 0; i < tokenCategory.length; ++ i) {
      allocation = await mainContract.getTokenAllocation(projectCount, tokenCategory[i]);
      const node = {
        amount: allocation[0].toNumber(),
        category: allocation[1]
      }
      allocationRes.push(node);
    }
    console.log(allocationRes);

  });

  it("Create a proposal", async () => {
    try {
      const targets = [user1.address];
      const values = ["0"];
      const signatures = ["getBalanceOf(address)"];
      const callDatas = [encodeParameters(['address'], [user2.address])];
      await comp.delegate(owner.address);
      await governorAlpha.propose(1, targets, values, signatures, callDatas, "do nothing");
      const proposalId = await governorAlpha.latestProposalIds(1, owner.address);
    } catch (error: any) {
      // console.log(error.message);
      expect(error.message).equal('VM Exception while processing transaction: revert GovernorAlpha::propose: one live proposal per proposer, found an already active proposal');
    }
  });

  it("get the status of the current proposal", async () => {
    try {
      const latestProposalId = await governorAlpha.latestProposalIds(1, owner.address);
      const testProposalStatus = await governorAlpha.state(1, latestProposalId);
    } catch (error:any) {
      console.log(error.message);
    }
  });

  it("There does not exist a proposal with matching proposal id where the current block number is between the proposal's start block (exclusive) and end block (inclusive)", async () => {
    try {
      const proposalId = await governorAlpha.latestProposalIds(1, owner.address);
      const testCastVote = await governorAlpha.castVote(1, proposalId, true);
    } catch (error: any) {
      // console.log(error.message);
      expect(error.message).equal('VM Exception while processing transaction: reverted with reason string \'GovernorAlpha::_castVote: voting is closed\'');
    }
  });

  it("execute proposal", async () => {
    try {
      const proposalId = await governorAlpha.latestProposalIds(1, owner.address);
      await governorAlpha.queue(1, proposalId);
      await governorAlpha.execute(1, proposalId);
    } catch (error: any) {
      // console.log(error.message);
      expect(error.message).equal('VM Exception while processing transaction: reverted with reason string \'GovernorAlpha::queue: proposal can only be queued if it is succeeded\'');
    }
  });

  it("vote current proposal from owner", async () => {
    try {
      const proposalId = await governorAlpha.latestProposalIds(1, owner.address);
      await governorAlpha.castVote(1, proposalId, true);
    } catch (error: any) {
      console.log(error.message);
      // expect(error.message).equal('VM Exception while processing transaction: reverted with reason string \'GovernorAlpha::_castVote: you are not owner\'');
    }
  });

  it("vote current proposal from not member", async () => {
    try {
      const proposalId = await governorAlpha.latestProposalIds(1, owner.address);
      await governorAlpha.connect(user3).castVote(1, proposalId, true);
    } catch (error: any) {
      // console.log(error.message);
      expect(error.message).equal('VM Exception while processing transaction: reverted with reason string \'GovernorAlpha::_castVote: you are not member of this project\'');
    }
  });

  it("Such proposal already has an entry in its voters set matching the sender", async () => {
    try {
      const proposalId = await governorAlpha.latestProposalIds(1, owner.address);
      await governorAlpha.connect(user1).castVote(1, proposalId, true);
      await governorAlpha.connect(user1).castVote(1, proposalId, true);
    } catch (error: any) {
      // console.log(error.message);
      expect(error.message).equal('VM Exception while processing transaction: reverted with reason string \'GovernorAlpha::_castVote: voter already voted\'');
    }
  });
});