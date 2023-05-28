const { network, ethers, deployments } = require("hardhat");
const { assert, expect } = require("chai");

network.config.chainId != 31337
    ? describe.skip
    : describe("Donate", function () {
          let DonateContract;
          let MockV3Aggregator;
          let account;
          const sendValue = ethers.utils.parseEther("1");
          //const OneWeek = 7 * 24 * 60 * 60;
          const name = "Donation 1";
          const limitInUSD = 100;

          beforeEach(async () => {
              account = await ethers.getSigners();
              await deployments.fixture(["all"]);
              DonateContract = await ethers.getContract("Donate", account[0]);

              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  account[0]
              );
          });

          describe("Constructor", function () {
              it("set pricefeed address", async () => {
                  const Donate_priceFeed = await DonateContract.getPriceFeed();
                  assert.equal(Donate_priceFeed, MockV3Aggregator.address);
              });
          });

          describe("Create", function () {
              it("create the donation with the correct donation owner", async () => {
                  await DonateContract.create(name, limitInUSD);
                  GetDonation = await DonateContract.getDonation(0);

                  assert.equal(account[0].address, GetDonation._address);
              });
          });

          describe("Participate", function () {
              it("update the amount of wei according to the value entered", async () => {
                  await DonateContract.create(name, limitInUSD);
                  GetDonation_before = await DonateContract.getDonation(0);
                  await DonateContract.participate(0, {
                      value: sendValue,
                  });
                  GetDonation_after = await DonateContract.getDonation(0);
                  assert.equal(
                      GetDonation_after.AmountInWEI.sub(
                          GetDonation_before.AmountInWEI
                      ).toString(),
                      sendValue.toString()
                  );
              });
          });

          describe("Withdraw", function () {
              it("allow fundraisers to take ethers", async () => {
                  await DonateContract.create(name, limitInUSD);
                  const balance_before =
                      await DonateContract.provider.getBalance(
                          account[0].address
                      );
                  const Account1_connect = await DonateContract.connect(
                      account[1]
                  );
                  await Account1_connect.participate(0, {
                      value: sendValue,
                  });
                  getDonation = await DonateContract.getDonation(0);
                  //await ethers.provider.send("evm_increaseTime", [OneWeek]); (this line is to set the time into now+1 week)
                  const fundraiser_withdraw = await DonateContract.withdraw(0);
                  const transactionReceipt = await fundraiser_withdraw.wait();
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
                  const balance_after =
                      await DonateContract.provider.getBalance(
                          account[0].address
                      );
                  assert.equal(
                      getDonation.AmountInWEI.toString(),
                      balance_after
                          .add(withdrawGasCost)
                          .sub(balance_before)
                          .toString()
                  );
              });
              it("Cannot take ethers if sender is not the fund raiser", async () => {
                  await DonateContract.create(name, limitInUSD);
                  Account1_connect = await DonateContract.connect(account[1]);
                  await Account1_connect.participate(0, { value: sendValue });
                  await expect(
                      Account1_connect.withdraw(0)
                  ).to.be.revertedWithCustomError(
                      Account1_connect,
                      "NotFunder"
                  );
              });
              it("Cannot withdraw ethers if the withdrawal conditions are not met", async () => {
                  await DonateContract.create(name, limitInUSD);
                  Account1_connect = await DonateContract.connect(account[1]);
                  await Account1_connect.participate(0, {
                      value: ethers.utils.parseEther("0.01"),
                  }); //0.01 eth = 18 usd
                  await expect(
                      DonateContract.withdraw(0)
                  ).to.be.revertedWithCustomError(
                      DonateContract,
                      "AcceptanceRequirements"
                  );
              });
          });
      });
