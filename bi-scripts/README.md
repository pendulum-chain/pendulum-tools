# BI Scripts for Pendulum/Amplitude

This repository contains scripts and tools for determining different statistics about Pendulum or Amplitude.

## Total Issuance

This tool determines:

- the total amount of tokens
- the total amount of transferable tokens (tokens in circulation)
- the total locked amount of tokens
- the total reserved amount of tokens

The total amount of tokens is the sum of the last three amounts (transferable, locked, reserved).

To use, first install NodeJs, then execute

```
npm install
node totalIssuance.js
```

You can run `node totalIssuance.js amplitude` in order to determine issuances on Amplitude instead of Pendulum.

### Example output

```
Determine issuance on Pendulum ...

Total issuance: 160,007,535.972 PEN
Total transferable (in circulation): 34,987,389.809 PEN
Total locked: 125,020,080.237 PEN
Total reserved: 65.925 PEN
```