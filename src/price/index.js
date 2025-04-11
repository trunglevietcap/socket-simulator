export const HNX_UPCOM_PRICE_STEP = 100;
export const HOSE_PRICE_STEP = {
  stepFirst: { min: 0, max: 10_000, step: 10 },
  stepSecond: { min: 10_000, max: 49_950, step: 50 },
  stepThird: { min: 49_950, step: 100 },
};
export const PriceSocketService = () => {
  const _priceInfo = {};

  const _cachePriceInfo = (priceList) => {
    priceList.forEach((item) => {
      _priceInfo[item.listingInfo.symbol] = item;
    });
  };

  const _randomSign = () => {
    return +(Math.random() * 1000).toFixed(0) % 2 ? -1 : 1;
  };

  const _randomValue = (initValue, min, max) => {};

  const _randomPrice = (symbolRandom) => {
    const priceInfo = _priceInfo[symbolRandom];
    const matchPrice = priceInfo.matchPrice.matchPrice;
    const floor = priceInfo.listingInfo.floor;
    const ceil = priceInfo.listingInfo.ceiling;
    const board = priceInfo?.listingInfo.board;
    Object.values(HOSE_PRICE_STEP);
    const stepPrice =
      board === "HOSE"
        ? Object.values(HOSE_PRICE_STEP).find(
            (item) => item.min <= matchPrice && item.max > matchPrice
          ).step
        : HNX_UPCOM_PRICE_STEP;
    const randomSign = _randomSign();
    if (matchPrice <= floor && randomSign < 0) {
      return floor;
    }
    if (matchPrice >= ceil && randomSign > 0) {
      return ceil;
    }
    return matchPrice + stepPrice * randomSign;
  };

  const _handleGetRandomPrice = (symbolRandom) => {
    const priceInfo = _priceInfo[symbolRandom];
    _priceInfo[symbolRandom] = {
      ...priceInfo,
      matchPrice: {
        ...priceInfo.matchPrice,
        matchPrice: _randomPrice(priceInfo.listingInfo.symbol),
      },
    };
    return _priceInfo[symbolRandom].matchPrice;
  };

  const handleGetPrice = async (symbols) => {
    const symbolsFilter = symbols?.filter((sym) => !_priceInfo[sym]);
    if (!symbolsFilter.length) return;
    try {
      const response = await fetch(
        "https://trading.vietcap.com.vn/api/price/symbols/getList",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbols,
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

  const getRandomPrice = () => {
    const symbolsSubscription = getSymbolsSubscription();
    const length = symbolsSubscription.length;
    if (length) {
      const indexRandom = +(Math.random() * 1000).toFixed(0) % length;
      const symbolRandom = symbolsSubscription[indexRandom];
      return _handleGetRandomPrice(symbolRandom);
    }
  };

  return {
    handleGetPrice,
    getPriceInfo,
    getSymbolsSubscription,
    getRandomPrice,
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
