## 2.0.0 - 2025-08-21

## Changed

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

## 3.0.3 - 2026-04-23

## Added

- Added support for forex / fiat pairs by allowing `getCandles()` to accept a params object.
- Added support for raw TradingView symbols like `USDNGN` and fully-qualified symbols like `FX_IDC:USDNGN`.
- Added README usage examples for forex / fiat candle requests.

## Changed

- Improved candle parsing so instruments without volume now return `volume: 0` instead of failing.
- Updated symbol error messaging to better reflect TradingView market/provider symbols instead of only exchange-based symbols.

## Fixed

- Fixed the websocket connection keeping Node.js processes alive after candle data had already been returned.
- Fixed websocket error handling so connection failures reject properly.
