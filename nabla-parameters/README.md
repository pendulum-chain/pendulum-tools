## Calculate Nabla Curve Parameters

This script calculates the slippage curve parameters alpha and beta given requirements specified in the constant `GIVEN`. For theoretical details see [this notion page](https://www.notion.so/satoshipay/24-05-03-Slippage-Calculation-64a35d0443b2436896b8a0e8559b8f08#5cb34c2461dc41a9a3848f8145855928).

The structure of `GIVEN` is as follows:

- it contains one requirement of a swap in slippage `a` for a specific coverage ratio `r`, for a swap in amount specified either as `theta` or as `delta_b` (which is the value of Delta relative to the reserve b)
- it contains one requirement of a swap out slippage `a` for a specific coverage ratio `r`, for a swap in amount specified either as `theta`
