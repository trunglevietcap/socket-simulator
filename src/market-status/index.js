import { MARKET_STATUS, BOARD } from "./../constants.js";
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
