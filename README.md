# TradingView Data Feed JS

A lighweight websocket client for accessing tradingView candlestick data via Node.js.
Inspired by `tvdatafeed` for python - But made for JavaScript Devs, crypto traders and bot builders.
This is just what could be.

---

## What This Project Solves

I build a lot of bots and tools that rely on TradingView data, and honestly, it's always been a pain. Every time I needed that data, I had to switch over to Python just to use tvdatafeed. It felt like a long detour for something that should've been simple — especially since most of my projects are in JavaScript or Node.js.

There wasn’t a solid npm package (at least not that I could find) that gave me what I needed. That always forced me to either rewrite parts of my project in Python or come up with ugly workarounds.

The day I finally used this package to fetch TradingView data directly from Node.js, it just clicked. I felt at peace. No hacks, no switching languages — just clean JavaScript doing what I needed it to do.

---

## Features

- Retrieve historical candles (open, high, low, close and volume)
- Binance, Bybit, Mexc and others
- Forex / fiat pairs like `USDNGN`, `EURUSD` and more
- No TradingView Account Needed
- Clean Promise-based API

---

## Features in Pipline

- Add TradingView account to unlock private access and remove unauthorized user limits
- cache user JWT to avoid repeated script login.
- Convert package to type script || Achieved
- live data access
- more

---

## Installation

```bash
npm install tvdatafeedclient-js
```

`js const { TvDataFeed } = require("tvdatafeedclient-js")`

`js import { TvDataFeed } from "tvdatafeedclient-js";`

---

## Usage

### Crypto

```js
import { TvDataFeed } from "tvdatafeedclient-js";

const tv = new TvDataFeed();
const candles = await tv.getCandles("BYBIT", "TONUSDT", "1", 300);
const candles = await tv.getCandles({
  exchange: "BYBIT",
  symbol: "TONUSDT",
  resolution: "1D",
  nBars: 300,
});
```

### Forex / Fiat Pairs

```js
import { TvDataFeed } from "tvdatafeedclient-js";

const tv = new TvDataFeed();

// Raw TradingView symbol
const candles = await tv.getCandles({
  symbol: "USDNGN",
  resolution: "1D",
  nBars: 300,
});

// Or provider-qualified TradingView symbol when needed
const candlesWithProvider = await tv.getCandles({
  symbol: "FX_IDC:USDNGN",
  resolution: "1D",
  nBars: 300,
});
```

If a forex pair needs a TradingView market/provider prefix, pass the full symbol in `symbol` like `FX_IDC:USDNGN`, or pass `exchange` separately and the package will build `exchange:symbol` for you.

The websocket is safe to leave open in short scripts because it will no longer keep the Node.js process alive by itself. If you are done with the client in a long-running app, you can still call `tv.disconnect()`.

---

## Contribution

This package is open to contributions and suggestions.

Check out the Features in Pipeline section — there are lots of ways this project can be improved for better usability and more powerful data access. If you’re interested in fixing bugs, adding new features, or just making things cleaner, you’re more than welcome to jump in.

Before contributing, please keep the following in mind:

- Keep your pull requests focused — smaller PRs are easier to review and merge.

- Always test your changes before opening a PR.

- Don’t push directly to main.

- If you’re introducing a new feature or a breaking change, open an issue first so we can discuss it.

Let’s build something better together.

---

## Change Log

# 2.0.0 - 2025-08-21

- Migrated project to TypeScript.
- Changed module format from commonJS to ES Modules.
- **Breaking Change:** You now need to destructure imports: `js const { TradingViewClient } = require("tvdatafeedclient-js")`

`js import { TradingViewClient } from "tvdatafeedclient-js";`

- Project is properly typed and better DX.

## 3.0.0 - 2025-09-05

## Changed

- Rename class export to TvDataFeed
- Make connect method Optional
- getCandle() method now call connect before fetching candle.
- Added disconnect() public method
- **Breaking Change:** You now need to destructure imports: `js const { TvDataFeed } = require("tvdatafeedclient-js")`

`js import { TvDataFeed } from "tvdatafeedclient-js";`

- More improvements

## 3.0.2 - 2025-12-05

## Changed

- Added Error Message
- Return Error object wgen symbol does not exist or match the exchange
- getCandle() method now call connect before fetching candle.
- Other Bug fix

---

## Stack

Node.js V22^
