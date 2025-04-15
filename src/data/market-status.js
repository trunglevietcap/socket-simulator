import { MARKET_STATUS } from "./../constants.js";

export const MARKET_STATUS_ALL = {
  HOSE: {
    marketCode: "HOSE",
    status: MARKET_STATUS.CLOSED,
    receivedTime: "2025-04-15T08:44:39.420Z",
    messageType: "SC",
  },
  UPCOM: {
    marketCode: "UPCOM",
    status: MARKET_STATUS.CLOSED,
    totalStockIncrease: 126,
    totalStockDecline: 176,
    totalStockNoChange: 93,
    time: "2025-04-15T08:21:15.000Z",
    messageType: "BI",
  },
  HNX: {
    marketCode: "HNX",
    status: MARKET_STATUS.CLOSED,
    totalStockIncrease: 38,
    totalStockDecline: 136,
    totalStockNoChange: 48,
    time: "2025-04-15T08:21:15.000Z",
    messageType: "BI",
  },
  BOND: {
    marketCode: "HNX",
    status: MARKET_STATUS.CLOSED,
    totalStockIncrease: 38,
    totalStockDecline: 136,
    totalStockNoChange: 48,
    time: "2025-04-15T08:21:15.000Z",
    messageType: "BI",
  },
  DERIVATIVES: {
    marketCode: "DERIVATIVES",
    status: MARKET_STATUS.CLOSED,
    totalStockIncrease: 0,
    totalStockDecline: 0,
    totalStockNoChange: 0,
    time: "2025-04-15T07:45:12.000Z",
    messageType: "BI",
  },
};
