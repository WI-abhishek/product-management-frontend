const encode = (value: string) => {
  return btoa(value); // Base64 encode
};

const decode = (value: string) => {
  return atob(value); // Base64 decode
};

export const secureStorage = {
  set: (key: string, value: string) => {
    const encodedKey = encode(key);
    const encodedValue = encode(value);
    localStorage.setItem(encodedKey, encodedValue);
  },

  get: (key: string) => {
    const encodedKey = encode(key);
    const storedValue = localStorage.getItem(encodedKey);
    return storedValue ? decode(storedValue) : null;
  },

  remove: (key: string) => {
    const encodedKey = encode(key);
    localStorage.removeItem(encodedKey);
  },
};
