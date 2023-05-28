const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { networkConfig } = require("../helper-hardhat-config");
require("dotenv").config();

network.config.chainId == 31337
    ? describe.skip
    : describe("Donate", function () {
          let DonateContract;
          let Deployer;
          const sendValue = ethers.utils.parseEther("0.01");
          //const OneWeek = 7 * 24 * 60 * 60;
          const name = "Donation 1";
          const limitInUSD = 100;

          beforeEach(async () => {
              Deployer = (await getNamedAccounts()).deployer;
              DonateContract = await ethers.getContract("Donate", Deployer);
          });
          describe("Constructor", function () {
              it("set pricefeed address", async () => {
                  const Donate_priceFeed = await DonateContract.getPriceFeed();
                  assert.equal(
                      Donate_priceFeed,
                      networkConfig[network.config.chainId]["ethTousdpricefeed"]
                  );
              });
          });

          describe("Create", function () {
              it("create the donation with the correct donation owner", async () => {
                  const Create = await DonateContract.create(name, limitInUSD);
                  await Create.wait(1);
                  GetDonation = await DonateContract.getDonation(0);
                  //   await GetDonation.wait(1);

                  assert.equal(Deployer, GetDonation._address);
              });
          });

          describe("Participate", function () {
              it("update the amount of wei according to the value entered", async () => {
                  //await DonateContract.create(name, limitInUSD);
                  GetDonation_before = await DonateContract.getDonation(0);
                  Donate_to_fundRaiser = await DonateContract.participate(0, {
                      value: sendValue,
                  });
                  await Donate_to_fundRaiser.wait(1);
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
                  //await DonateContract.create(name, limitInUSD);
                  const Wallet_Member = await new ethers.Wallet(
                      process.env.PRIVATE_KEY_2,
                      ethers.getDefaultProvider(process.env.ALCHEMY_URL)
                  );
                  const balance_before =
                      await DonateContract.provider.getBalance(Deployer);
                  const Account1_connect = await DonateContract.connect(
                      Wallet_Member
                  );
                  const Member_participate = await Account1_connect.participate(
                      0,
                      {
                          value: sendValue,
                      }
                  );
                  await Member_participate.wait(1);
                  getDonation = await DonateContract.getDonation(0);
                  //await ethers.provider.send("evm_increaseTime", [OneWeek]); (this line is to set the time into now+1 week)
                  const fundraiser_withdraw = await DonateContract.withdraw(0);
                  const transactionReceipt = await fundraiser_withdraw.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
                  const balance_after =
                      await DonateContract.provider.getBalance(Deployer);
                  assert.equal(
                      getDonation.AmountInWEI.toString(),
                      balance_after
                          .add(withdrawGasCost)
                          .sub(balance_before)
                          .toString()
                  );
              });
          });
      });
