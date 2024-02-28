# Calculate `fee_per_second`

This script calculates `fee_per_second` which denotes the amount of the transacted asset charged per second of execution of an XCM message.

## Install dependencies

From the directory where the script is located, run:

`yarn install`

## Script parameters

`--decimals` or `--d`, decimals of the token used for calculations
`--asset` or `--a`, (optional only if `--price` provided) which specifies asset name compatible with the Coingecko API
`--price` or `--p`, (optional only if `--asset` provided) if the asset is not supported by Coingecko, specifies the price to use

## Example

`yarn calculate-fee-per-second --d 12 --asset kusama`