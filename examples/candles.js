import { TvDataFeed } from "tvdatafeedclient-js";

(async () => {
  const tv = new TvDataFeed();
  await tv.connect(); //optional

  const candles = await tv.getCandles("BINANCE", "ALPACAUSDT", "1", 300);
  if (!Array.isArray(candles)) {
    return console.log(candles);
  }
  console.table(candles);
})();
