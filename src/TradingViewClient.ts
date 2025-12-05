import WebSocket from "ws";
import { v4 } from "uuid";
const uuidv4 = v4;

export interface TradingViewClient {
  connect(): Promise<void>;
  getCandles(
    exchange?: string,
    symbol?: string,
    resolution?: string,
    nBars?: number
  ): Promise<CandleResult[] | ErrorResult>;
}

export type RequestParams = {
  exchange: string;
  symbol: string;
  resolution: string;
  nBars: number | string;
};

interface SeriesCandle {
  v: [number, number, number, number, number, number];
}

interface ErrorResult {
  success: boolean;
  errorMsg: string;
}

type CandleResult = {
  time: Date;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export class TvDataFeed implements TradingViewClient {
  private readonly TV_SOCKET: string =
    "wss://data.tradingview.com/socket.io/websocket";

  private session: string = this.tvSessionId("qs");
  private chartSession: string = this.tvSessionId("cs");
  private ws: WebSocket | null = null;
  private candlePromise: Promise<CandleResult[] | ErrorResult> | null = null;
  private candleResolved:
    | ((value: CandleResult[] | ErrorResult) => void)
    | null = null;
  private exchangeSymbol: string | null = null;
  private auth_token: string;

  constructor(auth_token: string | null = null) {
    this.auth_token = auth_token || "unauthorized_user_token";
  }

  private tvSessionId(prefix = "qs") {
    return `${prefix}_${uuidv4().slice(0, 12).replace(/-/g, "")}`;
  }

  private encodeTVMessage(msg: { m: string; p: (string | number)[] }) {
    const str = JSON.stringify(msg);
    return `~m~${str.length}~m~${str}`;
  }

  //let's connect to tradeView right?
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.TV_SOCKET, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36",
          Origin: "https://www.tradingview.com",
          Referer: "https://www.tradingview.com/",
        },
      });

      this.ws.on("open", () => {
        // console.log("Connected to tradingview!");
        resolve(undefined);
        this.setupSession(this.auth_token);
      });

      this.ws.on("message", (data) => this.handleMessage(data));

      this.ws.on("error", (error) => {
        console.log("Something went wrong:", error);
        reject;
      });

      this.ws.on("close", () => {
        // console.log("Disconnected from TradingView");

        this.disconnect();
      });
    });
  }

  //disConnect Session

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clear promises & state
    this.candlePromise = null;
    this.candleResolved = null;
    this.exchangeSymbol = null;
  }

  //Let's Setup session :-p
  private setupSession(auth_token: string) {
    this.send({
      m: "set_auth_token",
      p: [
        //unauthorized_user_token
        //in the future we should be able to generate JWT and use it if available
        auth_token,
      ],
    });

    this.send({ m: "chart_create_session", p: [this.chartSession, ""] });
    this.send({ m: "quote_create_session", p: [this.session] });
  }

  //this is send helper
  private send(msg: { m: string; p: (string | number)[] }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Convert all parameters to string to ensure correct message format
      this.ws.send(this.encodeTVMessage(msg));
    } else {
      console.warn("WebSocket not open. Message not sent:", msg);
    }
  }

  //message helper
  private handleMessage(data: WebSocket.RawData) {
    const text = data.toString();

    const symbolError = text.split("~m~").filter((m) => {
      return m.includes("symbol_error");
    });

    const noSuchSymbolError = text.split("~m~").filter((p) => {
      return p.includes("no_such_symbol");
    });

    if (symbolError.length || noSuchSymbolError.length) {
      const candle = {
        success: false,
        errorMsg:
          "Invalid Symbol or this Symbol does not exist in this Exchange.",
      };
      if (this.candleResolved) {
        this.candleResolved(candle);
        this.candlePromise = null;
      }
    }

    const messages = text.split("~m~").filter((m) => {
      return m.match("timescale_update");
    });

    const result: CandleResult[] = [];
    messages.forEach((raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.m === "timescale_update") {
          const series = msg.p[1]?.sds_1 || msg.p[1]?.s1;

          if (series && Array.isArray(series.s)) {
            const candles: CandleResult[] = (series.s as SeriesCandle[]).map(
              (candle: SeriesCandle): CandleResult => {
                const [timestamp, open, high, low, close, volume] = candle.v;

                return {
                  time: new Date(timestamp * 1000),
                  symbol: `${this.exchangeSymbol}`,
                  open,
                  high,
                  low,
                  close,
                  volume,
                };
              }
            );

            candles.forEach((bar) => result.push(bar));
          }
          if (this.candleResolved) {
            this.candleResolved(result);
            this.candlePromise = null;
          }
        }
        return;
      } catch (err) {
        if (err && typeof err === "object" && "message" in err) {
          console.error("Parse error:", (err as { message: string }).message);
        } else {
          console.error("Parse error:", err);
        }
        return;
      }
    });
    //  console.table(this.candleResolved);
  }

  public async getCandles(
    exchange = "BINANCE",
    symbol = "BTCUSDT",
    resolution = "1",
    nBars = 300
  ): Promise<CandleResult[] | ErrorResult> {
    if (this.candlePromise) {
      return Promise.reject("Another candle request is already in progress.");
    }
    //Let start connection
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    //Get candles
    this.candlePromise = new Promise<CandleResult[] | ErrorResult>(
      (resolve) => {
        this.candleResolved = resolve;
        this.exchangeSymbol = `${exchange}:${symbol}`;

        //quote symbol sir
        this.send({
          m: "quote_add_symbols",
          p: [this.session, this.exchangeSymbol],
        });

        //resolve symbol
        this.send({
          m: "resolve_symbol",
          p: [
            this.chartSession,
            "sds_sym_1",
            `={"adjustment":"splits","symbol":"${this.exchangeSymbol}"}`,
          ],
        });

        //and create series
        this.send({
          m: "create_series",
          p: [
            this.chartSession,
            "sds_1",
            "s1",
            "sds_sym_1",
            resolution,
            nBars,
            "",
          ],
        });
      }
    );
    return this.candlePromise;
  }
}

//We wrapped up!
