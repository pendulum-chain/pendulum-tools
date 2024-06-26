import yargs from "yargs";
import CoinGecko from "coingecko-api";

const args = yargs.options({
  decimals: { type: "string", demandOption: true, alias: "d" },
  price: { type: "string", demandOption: false, alias: "p" }, // overwrite price
  asset: { type: "string", demandOption: false, alias: "a" },
}).argv;

async function main() {

  // Decimals factor based on decimals number passed as argument
  const decimalsFactor = 10 ** args["decimals"];

  // Target price in USD for executing one XCM instruction is 2 CENTS USD
  // This is an average price for executing one XCM instruction in other chains
  const targetPrice = BigInt(decimalsFactor * 0.02); 

  // This is the estimated total weight cost for executing one XCM operation
  // The value is configured in all runtimes
  // E.g. Pendulum: https://github.com/pendulum-chain/pendulum/blob/4dda8b62489b553ace5a4ae536d240c0f7f24fd0/runtime/pendulum/src/xcm_config.rs#L212
  const xcmTotalCost = BigInt(1000000000);

  // Start CoinGecko API client
  const CoinGeckoClient = new CoinGecko();
  let tokenPrice;
  let tokenData = {} as any;

  // If token price was not provided then use CoinGecko API to get it
  if (!args["price"]) {
    if (args["asset"]) {
      tokenData = await CoinGeckoClient.simple.price({
        ids: args["asset"],
        vs_currencies: "usd",
      });
    } else {
      throw new Error(
        `Error: You need to provide either an asset name with <--a> or a fixed price with <--p>`
      );
    }
    
    if (tokenData.success && tokenData.data[args["asset"]]) {
      tokenPrice = BigInt(Math.round(decimalsFactor * tokenData.data[args["asset"]].usd));
    } else {
      throw new Error(
        `Error: Price is not available - Check https://www.coingecko.com/en/coins/${args["asset"]}`
      );
    }
  } else {
    // Use price passed as parameter if specified
    tokenPrice = BigInt(Math.trunc(decimalsFactor * args["price"]));
    tokenData.success = true;
  }

  if (!tokenData.success) {
    throw new Error(
      `Error: Token name not supported. Note that a specific CoinGecko API ID is required, not a ticker!`
    );
  }
  
  // Calculate fee per second 
  const weightRefTimePerSecond = BigInt(10 ** 12); 
  const feePerSecond =
    (targetPrice * weightRefTimePerSecond * BigInt(decimalsFactor)) / (xcmTotalCost * tokenPrice);

  console.log(`Token price is $${tokenPrice.toString() / decimalsFactor}`);
  console.log(`The fee_per_second needs to be set ${feePerSecond.toString()}`);

  return feePerSecond;
}

main()
  .catch((e) => console.error(e.message))
  .finally(() => process.exit());