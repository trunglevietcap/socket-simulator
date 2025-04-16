import {
  HOSE_PRICE_STEP,
  BOARD,
  HNX_UPCOM_PRICE_STEP,
  TOP_STOCK_TYPE,
} from "./../constants.js";
import { ALL_SYMBOL, HNX30_LIST, VN30_LIST } from "../data/all-symbols.js";
import { BASE_URL } from "../endPoint.js";
import { SYMBOLS_INFO } from "./../data/symbols-info.js";
export const PriceSocketService = () => {
  const _priceInfo = {};
  const _symbolInfo = {};

  function constructor() {
    SYMBOLS_INFO.forEach((s) => {
      _symbolInfo[s.symbol] = s;
    });
  }
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
        matchVol,
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
      const response = await fetch(`${BASE_URL}/api/price/symbols/getList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbols: ALL_SYMBOL,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      _cachePriceInfo(data);
      return data;
    } catch (error) {
      console.log("Get price error!", error);
    }
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
        const randomNumber = _randomPercent(speed);
        if (randomNumber === 0 && _priceInfo[symbolRandom]) {
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
        const randomNumber = _randomPercent(speed);
        if (randomNumber === 0 && _priceInfo[symbolRandom]) {
          listRandom.push(_handleGetRandomBidAsk(symbolRandom, 100));
        }
      }
      return listRandom;
    }
  };

  const randomPriceAndBidAsk = () => {
    ALL_SYMBOL.forEach(() => {
      const indexRandom =
        +(Math.random() * 1000).toFixed(0) % ALL_SYMBOL.length;
      const symbolRandom = _priceInfo[indexRandom];
      const randomNumber = _randomPercent(100);
      if (randomNumber === 0 && _priceInfo[symbolRandom]) {
        _handleGetRandomBidAsk(symbolRandom, 100);
        _handleGetRandomPrice(symbolRandom, 100);
      }
    });
  };

  const getRandomTopStockChange = () => {
    const priceInfoList = Object.values(_priceInfo);
    const getPercentChange = (a) => {
      if (!a.matchPrice || !a.referencePrice) return undefined;
      return ((a.matchPrice - a.referencePrice) / a.referencePrice) * 100;
    };
    const sortPercentChange = (a, b) => {
      const percentChangeA = getPercentChange(a);
      const percentChangeB = getPercentChange(b);

      if (percentChangeA === undefined || percentChangeB === undefined)
        return 0;
      return percentChangeB - percentChangeA;
    };
    const priceInfoListHNX = priceInfoList
      ?.filter((item) => item.listingInfo.board === BOARD.HNX)
      .sort(sortPercentChange);

    const priceInfoListHNXVN30 = priceInfoListHNX.filter((item) => {
      return HNX30_LIST.includes(item.listingInfo.symbol);
    });
    const priceInfoListHOSE = priceInfoList
      ?.filter((item) => item.listingInfo.board === BOARD.HSX)
      .sort(sortPercentChange);

    const priceInfoListVN30 = priceInfoListHOSE.filter((item) =>
      VN30_LIST.includes(item.listingInfo.symbol)
    );
    const priceInfoListUPCOM = priceInfoList
      ?.filter((item) => item.listingInfo.board === BOARD.UPCOM)
      .sort(sortPercentChange);

    const getRandomTopStockType = () => {
      const randomIndex = _randomPercent(TOP_STOCK_TYPE.length);
      return Object.values(TOP_STOCK_TYPE)[randomIndex];
    };
    const listPriceSymbolRandom = [
      ...priceInfoListHNXVN30.slice(0, 15),
      ...priceInfoListVN30.slice(0, 10),
      ...priceInfoListHOSE
        .filter((item) => !VN30_LIST.includes(item.listingInfo.symbol))
        .slice(0, 80),
      ...priceInfoListHNX
        .filter((item) => !HNX30_LIST.includes(item.listingInfo.symbol))
        .slice(0, 40),
      ...priceInfoListUPCOM.slice(0, 15),
    ];

    return listPriceSymbolRandom.map((item) => {
      const listingInfo = item?.listingInfo;
      const matchPrice = item.matchPrice.matchPrice;

      return {
        group: listingInfo.board,
        hnx30: !!HNX30_LIST.includes(listingInfo.symbol),
        lastPrice1DayAgo: matchPrice,
        lastPrice5DaysAgo: matchPrice,
        lastPrice20DaysAgo: matchPrice,
        liquidity: 111111111,
        marketCap: 111111111,
        stockCode: listingInfo.symbol,
        topStockType: getRandomTopStockType(),
        vn30: !!VN30_LIST.includes(listingInfo.symbol),
      };
    });
  };

  const getRandomTopStockGroup = () => {
    const randomStockChange = getRandomTopStockChange();
    const randomStockGroup = [];

    randomStockChange.forEach((item) => {
      const randomNumber = _randomPercent(3);
      if (randomNumber === 0) {
        randomStockGroup.push({
          group: item.group,
          hnx30: item.hnx30,
          stockCode: item.stockCode,
          vn30: item.vn30,
        });
      }
    });

    return randomStockGroup;
  };

  constructor();
  return {
    handleGetPrice,
    getPriceInfo,
    getSymbolsSubscription,
    getRandomPrice,
    getRandomBidAsk,
    randomValue,
    setSymbolsSubscriptionMatchPrice,
    setSymbolsSubscriptionBidAsk,
    randomPriceAndBidAsk,
    getRandomTopStockChange,
    getRandomTopStockGroup,
  };
};

// group: ESymbolBoardType;
// hnx30: boolean;
// lastPrice1DayAgo: number;
// lastPrice5DaysAgo: number;
// lastPrice20DaysAgo: number;
// liquidity: number;
// marketCap: number;
// stockCode: string;
// topStockType:
//   | 'LOSER_1_D'
//   | 'LOSER_1_W'
//   | 'LOSER_1_M'
//   | 'GAINER_1_D'
//   | 'GAINER_1_W'
//   | 'GAINER_1_M';
// vn30: boolean;
