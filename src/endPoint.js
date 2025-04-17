const isModeDev = process.env.MODE === "dev";
if (isModeDev) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const BASE_URL = 'https://trading.vietcap.com.vn'
