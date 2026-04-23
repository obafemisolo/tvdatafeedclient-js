import { TvDataFeed } from "tvdatafeedclient-js";

(async () => {
  const tv = new TvDataFeed();
  await tv.connect(); //optional

  const candles = await tv.getCandles({
    //  exchange: "BYBIT",
    symbol: "USDNGN",
    resolution: "1H",
    nBars: 300,
  });

  if (!Array.isArray(candles)) {
    return console.log(candles);
  }
  console.table(candles);
})();
