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

export const BOARD = {
  HOSE: "HOSE",
  HNX: "HNX",
  UPCOM: "UPCOM",
  DERIVATIVES: "DERIVATIVES",
  BOND: "BOND",
};
export const MarketStatusSocketService = () => {
  let _marketStatus = [];

  const constructor = () => {
    _marketStatus = Object.values(MARKET_STATUS);
  };

  const getRandomMarketStatus = () => {
    const radomMarketStatus = _randomMarketStatus();
    return Object.values(BOARD).map((board) => ({
      marketCode: board,
      messageType: "SC",
      receivedTime: new Date().toString(),
      status: radomMarketStatus,
    }));
  };

  const _randomIndex = (total) => {
    return +(Math.random() * 100000).toFixed(0) % total;
  };

  const _randomMarketStatus = () => {
    const randomIndex = _randomIndex(_marketStatus.length);
    return _marketStatus[randomIndex];
  };

  constructor();
  return { getRandomMarketStatus };
};
