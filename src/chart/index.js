import { fetchData } from "../utils.js";
import { onValue, set } from "firebase/database";
import {
  socketChartConfigResetRef,
  socketChartConfigRef,
} from "../firebase/firebase-config.js";

let indexRandom = 0;
let socketChartConfig;
onValue(socketChartConfigResetRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    indexRandom = 0;
    set(socketChartConfigResetRef, false);
  }
});
onValue(socketChartConfigRef, (snapshot) => {
  const data = snapshot.val();
  socketChartConfig = data;
});

export const ChartSocketService = () => {
  let dataFake;
  const LIST_SYMBOLS = [
    "HNX30",
    "HNXIndex",
    "HNXUpcomIndex",
    "VN100",
    "VN30",
    "VNINDEX",
  ];

  const randomSocketIndex = (getData) => {
    setInterval(() => {
      // console.log(dataFake)
      if (!socketChartConfig?.enable) return;
      LIST_SYMBOLS.forEach((symbol) => {
        const data = dataFake?.find((item) => (item.symbol === symbol));
        // console.log(data, symbol)
        if (indexRandom < data?.t?.length) {
          const dataIndex = {
            symbol: symbol,
            timeFrame: "ONE_MINUTE",
            t: data?.t?.[indexRandom],
            o: data?.o?.[indexRandom],
            h: data?.h?.[indexRandom],
            l: data?.l?.[indexRandom],
            c: data?.c?.[indexRandom],
            v: data?.v?.[indexRandom],
            accumulatedVolume: data?.accumulatedVolume?.[indexRandom],
            accumulatedValue: data?.accumulatedValue?.[indexRandom],
          };

          getData(dataIndex);
        }
      });
      if (socketChartConfig?.enable) {
        indexRandom++;
      }
    }, 1000);
  };

  const getDataIndex = async () => {
    const data = await fetchData(
      "POST",
      "https://trading.vietcap.com.vn/api/chart/OHLCChart/gap",
      {
        timeFrame: "ONE_MINUTE",
        symbols: [
          "VNINDEX",
          "VN30",
          "VN100",
          "HNXIndex",
          "HNX30",
          "HNXUpcomIndex",
        ],
        from: 1748538000,
        to: 1748624100,
      }
    );
    dataFake = data;
  };

  return { getDataIndex, randomSocketIndex };
};
