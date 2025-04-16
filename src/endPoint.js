const isModeDev = process.env.MODE === "dev";
if (isModeDev) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const BASE_URL = isModeDev
  ? "https://trading-qc.vietcap.int"
  : "https://trading.vietcap.com.vn";
