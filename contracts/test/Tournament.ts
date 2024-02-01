import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Tournaments", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy contracts
    const xpContractFactory = await ethers.getContractFactory("XP");
    const xpContract = await xpContractFactory.deploy(ethers.parseEther("100"));
    const tournamentContractFactory = await ethers.getContractFactory(
      "Tournament"
    );
    const tournamentContract = await tournamentContractFactory.deploy();
    // Send XP tokens to users
    xpContract.transfer(userOne, ethers.parseEther("10"));
    xpContract.transfer(userTwo, ethers.parseEther("10"));
    xpContract.transfer(userThree, ethers.parseEther("10"));
    return {
      deployer,
      userOne,
      userTwo,
      userThree,
      xpContract,
      tournamentContract,
    };
  }

  it("Should support the main flow", async function () {
    const { userOne, userTwo, userThree, xpContract, tournamentContract } =
      await loadFixture(initFixture);
    // Create tournament
    await expect(
      tournamentContract
        .connect(userOne)
        .create(
          "The Great Tournament",
          0,
          ["kiv1n"],
          ["lexus"],
          ethers.parseEther("5"),
          xpContract
        )
    ).to.be.not.reverted;
    const tokenId = (await tournamentContract.getNextTokenId()) - 1n;
    expect(tokenId).to.be.equal(0);
    // Contribute by user two
    await xpContract
      .connect(userTwo)
      .approve(tournamentContract, ethers.parseEther("5"));
    await expect(
      tournamentContract.connect(userTwo).contribute(tokenId, "kiv1n")
    ).to.be.not.reverted;
    // Contribute by user three
    await xpContract
      .connect(userThree)
      .approve(tournamentContract, ethers.parseEther("5"));
    await expect(
      tournamentContract.connect(userThree).contribute(tokenId, "lexus")
    ).to.be.not.reverted;
    // Check XP balance
    expect(await xpContract.balanceOf(tournamentContract)).to.be.equal(
      ethers.parseEther("10")
    );
    // Start tournaments
    await expect(
      tournamentContract.connect(userOne).start(tokenId, "AMG7-XXEQ")
    ).to.be.not.reverted;
    // Finish tournament
    await expect(tournamentContract.connect(userOne).finish(tokenId)).to.be.not
      .reverted;
    // Check XP balance
    expect(await xpContract.balanceOf(tournamentContract)).to.be.equal(
      ethers.parseEther("0")
    );
    expect(await xpContract.balanceOf(userTwo)).to.be.equal(
      ethers.parseEther("5")
    );
    expect(await xpContract.balanceOf(userThree)).to.be.equal(
      ethers.parseEther("15")
    );
  });
});
