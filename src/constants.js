export const EVENT_NAME = {
  BID_ASK: "bid-ask",
  MATCH_PRICE: "match-price",
  BID_ASK_BUY_IN: "buy-in-bid-ask",
  MATCH_PRICE_BUY_IN: "buy-in-match-price",
  ODD_LOT_BID_ASK: "odd-lot-bid-ask",
  ODD_LOT_MATCH_PRICE: "odd-lot-match-price",
  INDEX: "index",
  PUT_THROUGH: "put-through",
  ADVERTISE: "advertise",
  BATCH_JOB_STREAMING: "batch-job-streaming",
  HNX_BOND_PRICE: "hnx-price-new-streaming",
  MARKET_STATUS: "market-status",
  APP_CONFIG: "app-config",
  TOP_STOCK_GROUP_STREAMING: "top-stock-group-streaming",
  TOP_STOCK_CHANGE_STREAMING: "top-stock-change-streaming",
  MARKET_DATA_TOP_STOCK_PRICES_CHANGE: "market-data-top-stock-prices-change",
};

export const BOARD = {
  HOSE: "HOSE",
  HNX: "HNX",
  UPCOM: "UPCOM",
  DERIVATIVES: "DERIVATIVES",
  BOND: "BOND",
  HSX: "HSX",
};

export const MESSAGE_ALL_CLIENT_SEND = '[{"type":"all"}]';

export const MARKET_STATUS = {
  STARTED: "STARTED",
  ATO: "ATO",
  LO_MORNING: "LO_MORNING",
  LUNCH_BREAK: "LUNCH_BREAK",
  LO_AFTERNOON: "LO_AFTERNOON",
  ATC: "ATC",
  ENDED: "ENDED",
  EXTEND_HOUR: "EXTEND_HOUR",
  CLOSED: "CLOSED",
};

export const MARKET_STATUS_INTERVAL = 1000;

export const HNX_UPCOM_PRICE_STEP = 100;

export const HOSE_PRICE_STEP = {
  stepFirst: { min: 0, max: 10_000, step: 10 },
  stepSecond: { min: 10_000, max: 49_950, step: 50 },
  stepThird: { min: 49_950, step: 100 },
};

export const TOP_STOCK_TYPE = {
  LOSER_1_D: "LOSER_1_D",
  LOSER_1_W: "LOSER_1_W",
  LOSER_1_M: "LOSER_1_M",
  GAINER_1_D: "GAINER_1_D",
  GAINER_1_W: "GAINER_1_W",
  GAINER_1_M: "GAINER_1_M",
};
