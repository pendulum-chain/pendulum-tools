# Calculate `fee_per_second`

This script calculates `fee_per_second` which denotes the amount of the transacted asset charged per second of execution
of an XCM message. Target price for the XCM message execution is 0.02 USD

## Install dependencies

From the directory where the script is located, run:

`yarn install`

## Script parameters

- `--decimals` or `--d`, decimals of the token used for calculations
- `--asset` or `--a`, (optional only if `--price` provided) which specifies asset name compatible with the Coingecko API
- `--price` or `--p`, (optional only if `--asset` provided) if the asset is not supported by Coingecko, specifies the
  price to use

## Running the script

You can run the script with the following command:

```shell
$ yarn calculate-fee-per-second --d <decimals> --asset <asset>
# or
$ yarn calculate-fee-per-second --d <decimals> --price <price>
```

### Example

The following command is an example for calculating `fee_per_second` for Kusama with 12 decimals:

```shell
$ yarn calculate-fee-per-second --d 12 --asset kusama
```

This is going to have the following output:

```
Token price is $51.05
The fee_per_second needs to be set 391772771792
```

If we want to verify if the target price is 0.02 USD we can calculate the total XCM fee as follows:

```
fee = fee_per_second * (weight / weight_per_second)
```

where `weight / weight_per_second` in our case is `1000000000 / 1000000000000` which is equal to `0.001`.

Then `fee = 391772771792 * 0.001 = 391772771.792` and by adjusting the
decimals `fee = 391772771.792 / 10^12 = 0.00039177277`

Now, the target price is `0.00039177277 * 51.05 = 0.0199999999 USD` which is approximately 0.02 USD
