import {
  HOSE_PRICE_STEP,
  BOARD,
  HNX_UPCOM_PRICE_STEP,
} from "./../constants.js";
import { ALL_SYMBOL } from "./../data/index.js";
export const PriceSocketService = () => {
  const _priceInfo = {};
  let _symbolsSubscriptionMatchPrice = [];
  let _symbolsSubscriptionBidAsk = [];

  const _cachePriceInfo = (priceList) => {
    priceList.forEach((item) => {
      _priceInfo[item.listingInfo.symbol] = item;
    });
  };

  const _randomSign = () => {
    return +(Math.random() * 1000).toFixed(0) % 2 ? -1 : 1;
  };

  const _randomPercent = (maxPercent = 5) => {
    return +(Math.random() * 10000).toFixed(0) % maxPercent;
  };

  const setSymbolsSubscriptionMatchPrice = (symbols) => {
    _symbolsSubscriptionMatchPrice = symbols;
  };
  const setSymbolsSubscriptionBidAsk = (symbols) => {
    _symbolsSubscriptionBidAsk = symbols;
  };

  const randomValue = (
    currentValue,
    maxPercent = 5,
    probability = 100,
    isSign = false
  ) => {
    const sign = isSign ? _randomSign() : 1;
    const randomProbability = _randomPercent(100);
    if (randomProbability > probability) return currentValue;
    const randomPercent = _randomPercent(maxPercent);
    return +((currentValue * (100 + randomPercent * sign)) / 100).toFixed(0);
  };

  const _randomPrice = (symbolRandom, probability = 100) => {
    const randomProbability = _randomPercent(100);
    const priceInfo = _priceInfo[symbolRandom];
    const matchPrice = priceInfo.matchPrice.matchPrice;
    if (randomProbability > probability) return matchPrice;
    const floor = priceInfo.listingInfo.floor;
    const ceil = priceInfo.listingInfo.ceiling;
    const board = priceInfo?.listingInfo.board;
    Object.values(HOSE_PRICE_STEP);
    const stepPrice =
      board === BOARD.HOSE
        ? Object.values(HOSE_PRICE_STEP).find(
            (item) => item.min <= matchPrice && item.max > matchPrice
          ).step
        : HNX_UPCOM_PRICE_STEP;
    const randomSign = _randomSign();
    const randomPrice = matchPrice + stepPrice * randomSign;
    if (randomPrice > ceil) return ceil;
    if (randomPrice < floor) return floor;
    return randomPrice;
  };

  const _handleGetRandomPrice = (symbolRandom, probability = 100) => {
    const priceInfo = _priceInfo[symbolRandom];
    const accumulatedVolume = randomValue(
      priceInfo.matchPrice.accumulatedVolume,
      1.1,
      probability / 5
    );
    const matchPrice = _randomPrice(priceInfo.listingInfo.symbol);
    const foreignBuyVolume = randomValue(
      priceInfo.matchPrice.foreignBuyVolume,
      1.1,
      probability / 5
    );
    const foreignSellVolume = randomValue(
      priceInfo.matchPrice.foreignBuyVolume,
      1.1,
      probability / 5
    );
    const matchVol = randomValue(
      priceInfo.matchPrice.matchVol,
      1.1,
      probability / 5
    );

    const lowest =
      priceInfo.matchPrice.lowest > matchPrice
        ? matchPrice
        : priceInfo.matchPrice.lowest;
    const highest =
      priceInfo.matchPrice.highest < matchPrice
        ? matchPrice
        : priceInfo.matchPrice.highest;
    _priceInfo[symbolRandom] = {
      ...priceInfo,
      matchPrice: {
        ...priceInfo.matchPrice,
        matchPrice: matchPrice,
        accumulatedVolume: accumulatedVolume,
        accumulatedValue: +(accumulatedVolume * matchPrice).toFixed(0),
        highest,
        lowest,
        foreignBuyVolume,
        foreignSellVolume,
        matchVol
      },
    };
    return _priceInfo[symbolRandom].matchPrice;
  };

  const _randomBidAsk = (bidAskPrices, probability = 20) => {
    return (bidAskPrices || []).map((item) => ({
      ...item,
      volume: randomValue(item.volume, 2, probability, true),
    }));
  };

  const _handleGetRandomBidAsk = (symbolRandom, probability) => {
    const priceInfo = _priceInfo[symbolRandom];
    const bidPrices = priceInfo?.bidAsk?.bidPrices;
    const askPrices = priceInfo?.bidAsk?.askPrices;
    _priceInfo[symbolRandom] = {
      ..._priceInfo[symbolRandom],
      bidAsk: {
        ..._priceInfo[symbolRandom].bidAsk,
        bidPrices: _randomBidAsk(bidPrices, probability),
        askPrices: _randomBidAsk(askPrices, probability),
      },
    };
    return _priceInfo[symbolRandom].bidAsk;
  };

  const handleGetPrice = async () => {
    try {
      const response = await fetch(
        "https://trading.vietcap.com.vn/api/price/symbols/getList",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbols: ALL_SYMBOL
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      _cachePriceInfo(data);
      return data;
    } catch (error) {}
  };

  const getPriceInfo = (symbol) => {
    return _priceInfo[symbol];
  };

  const getSymbolsSubscription = () => {
    return Object.keys(_priceInfo);
  };

  const getRandomPrice = (speed) => {
    const symbolsSubscription = _symbolsSubscriptionMatchPrice;
    const length = symbolsSubscription.length;
    if (length) {
      const listRandom = [];
      for (let index = 0; index < length; index++) {
        const indexRandom = +(Math.random() * 1000).toFixed(0) % length;
        const symbolRandom = symbolsSubscription[indexRandom];
        const randomSign = _randomPercent(speed);
        if (randomSign === 0 && _priceInfo[symbolRandom]) {
          listRandom.push(_handleGetRandomPrice(symbolRandom, 100));
        }
      }
      return listRandom;
    }
  };

  const getRandomBidAsk = (speed = 100) => {
    const symbolsSubscription = _symbolsSubscriptionBidAsk;
    const length = symbolsSubscription.length;
    if (length) {
      const listRandom = [];
      for (let index = 0; index < length; index++) {
        const indexRandom = +(Math.random() * 1000).toFixed(0) % length;
        const symbolRandom = symbolsSubscription[indexRandom];
        const randomSign = _randomPercent(speed);
        if (randomSign === 0 && _priceInfo[symbolRandom]) {
          listRandom.push(_handleGetRandomBidAsk(symbolRandom, 100));
        }
      }
      return listRandom;
    }
  };
  return {
    handleGetPrice,
    getPriceInfo,
    getSymbolsSubscription,
    getRandomPrice,
    getRandomBidAsk,
    randomValue,
    setSymbolsSubscriptionMatchPrice,
    setSymbolsSubscriptionBidAsk,
  };
};

// {
//   "listingInfo": {
//     "code": "436",
//     "symbol": "ACB",
//     "ceiling": 24900,
//     "floor": 21700,
//     "refPrice": 23300,
//     "stockType": "STOCK",
//     "board": "HSX",
//     "exercisePrice": 0,
//     "exerciseRatio": "",
//     "maturityDate": "",
//     "lastTradingDate": "",
//     "underlyingSymbol": "",
//     "issuerName": "",
//     "listedShare": 4466657912,
//     "receivedTime": "2025-04-11T07:45:04.016Z",
//     "messageType": "SS",
//     "type": "STOCK",
//     "id": 8424512,
//     "enOrganName": "Asia Commercial Joint Stock Bank",
//     "enOrganShortName": "Asia Commercial Bank",
//     "organName": "Ngân hàng Thương mại Cổ phần Á Châu",
//     "organShortName": "ACB",
//     "ticker": "ACB",
//     "priorClosePrice": 23300,
//     "benefit": "",
//     "tradingDate": "2025-04-11",
//     "averageMatchVolume2Week": 24772364,
//     "partition": 1
//   },
//   "bidAsk": {
//     "code": "436",
//     "symbol": "ACB",
//     "session": "ENDED",
//     "bidPrices": [
//       {
//         "price": 24800,
//         "volume": 82000
//       },
//       {
//         "price": 24750,
//         "volume": 116700
//       },
//       {
//         "price": 24700,
//         "volume": 107000
//       }
//     ],
//     "receivedTime": "2025-04-11T07:45:03.864Z",
//     "messageType": "TP",
//     "askPrices": [
//       {
//         "price": 24850,
//         "volume": 579000
//       },
//       {
//         "price": 24900,
//         "volume": 3416100
//       },
//       {
//         "price": 0,
//         "volume": 0
//       }
//     ],
//     "time": "2025-04-11T00:30:36.000000Z"
//   },
//   "matchPrice": {
//     "code": "436",
//     "symbol": "ACB",
//     "matchPrice": 24850,
//     "matchVol": 542900,
//     "receivedTime": "2025-04-11T07:51:19.280Z",
//     "messageType": "TR",
//     "accumulatedVolume": 35983500,
//     "accumulatedValue": 883344,
//     "avgMatchPrice": 24548.584768018674,
//     "highest": 24900,
//     "lowest": 23950,
//     "time": "2025-04-11T07:45:02.000Z",
//     "session": "ENDED",
//     "matchType": "unknown",
//     "foreignBuyVolume": 18406963,
//     "foreignSellVolume": 12221800,
//     "currentRoom": 4477737,
//     "totalRoom": 1339997373,
//     "totalAccumulatedValue": 905446.5449999898,
//     "totalAccumulatedVolume": 368750,
//     "referencePrice": 23300,
//     "partition": 1
//   }
// }
