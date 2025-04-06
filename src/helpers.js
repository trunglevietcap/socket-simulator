import { MARKET_STATUS } from "./constants.js";
export function getMarketStatus(board) {
  return Object.values(MARKET_STATUS).map((status) => ({
    marketCode: board,
    messageType: "SC",
    receivedTime: new Date().toString(),
    status,
  }));
}

export function getRandomMarketStatus(board, index) {
  const marketStatusBoard = getMarketStatus(board);
  return marketStatusBoard[index];
}
