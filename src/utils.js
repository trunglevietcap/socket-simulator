export function throttle(fn, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

export const fetchData = async (method, url, payload) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text(); // Get response body (if any)
      throw new Error(
        `Network response was not ok. Status: ${response.status} ${response.statusText}. Details: ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // rethrow to let caller handle it if needed
  }
};
