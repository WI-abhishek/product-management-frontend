import { store } from "@/redux/store";
import { logout, setAccessToken } from "@/redux/auth.slice";
import { apiBase } from "@/constants/api-base.constants";
import { Paths } from "@/constants/route-paths.constants";
import { reduxName } from "@/constants/redux.constants";
import { secureStorage } from "@/utils";

const responseCall = async (response: any) => {
  const isOk = response.ok || (response.status >= 200 && response.status < 300);
  const defaultMessage = response.statusText || (isOk ? "Success" : "Request failed");

  try {
    const responses = await response.text();
    if (responses) {
      try {
        const parsed = JSON.parse(responses);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        return {
          status: isOk ? 1 : 0,
          message: responses || defaultMessage,
        };
      }
    }
  } catch (error: any) {
    console.error("responseCall read error:", error);
  }

  return {
    status: isOk ? 1 : 0,
    message: defaultMessage,
  };
};

const getToken = (headers: any = {}) => {
  try {
    const reduxToken = (store.getState() as any)?.[reduxName.auth]?.token;
    const token = reduxToken || secureStorage.get("token");
    return {
      ...headers,
      Authorization: token ? "Bearer " + token : "",
    };
  } catch (error: any) {
    console.error("getToken error:", error);
    return headers;
  }
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const handleRefreshToken = async (): Promise<string | null> => {
  try {
    const authState = (store.getState() as any)?.[reduxName.auth];
    let refreshToken =
      authState?.user?.refreshToken ||
      secureStorage.get("refreshToken");

    if (!refreshToken) {
      const storedUser = secureStorage.get("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          refreshToken = parsedUser?.refreshToken;
        } catch {
          // ignore parsing error
        }
      }
    }

    if (!refreshToken) {
      store.dispatch(logout());
      window.location.href = `/${Paths.auth}/${Paths.login}`;
      return null;
    }

    const response = await fetch(encodeURI(apiBase.apiUrl + apiBase.userRefreshToken), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-refresh-token": refreshToken,
      },
    });

    const result = await response.json();

    if (result.status === 1 && result.data?.accessToken) {
      const newAccessToken = result.data.accessToken;
      const newRefreshToken = result.data.refreshToken;
      store.dispatch(
        setAccessToken({
          token: newAccessToken,
          refreshToken: newRefreshToken,
        }),
      );
      return newAccessToken;
    } else {
      store.dispatch(logout());
      window.location.href = `/${Paths.auth}/${Paths.login}`;
      return null;
    }
  } catch (error) {
    console.error("handleRefreshToken ~ error:", error);
    store.dispatch(logout());
    window.location.href = `/${Paths.auth}/${Paths.login}`;
    return null;
  }
};

const executeFetchWithAuth = async (
  url: string,
  options: any = {},
  isRetry = false,
): Promise<any> => {
  try {
    const requestHeaders = { ...(options.headers || {}) };
    delete requestHeaders.Authorization;
    delete requestHeaders.authorization;
    const authHeaders = getToken(requestHeaders);
    const fullUrl = encodeURI(apiBase.apiUrl + url);

    const response = await fetch(fullUrl, {
      ...options,
      headers: authHeaders,
    });

    const parsed = await responseCall(response);

    if (
      !isRetry &&
      url !== apiBase.userLogin &&
      url !== apiBase.userRefreshToken &&
      response.status === 401
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        let newToken: string | null = null;
        try {
          newToken = await handleRefreshToken();
        } finally {
          isRefreshing = false;
          onRefreshed(newToken);
        }

        if (newToken) {
          return executeFetchWithAuth(url, options, true);
        } else {
          return parsed;
        }
      } else {
        const retryPromise = new Promise((resolve) => {
          addRefreshSubscriber((newToken: string | null) => {
            if (newToken) {
              resolve(executeFetchWithAuth(url, options, true));
            } else {
              resolve(parsed);
            }
          });
        });
        return retryPromise;
      }
    }

    return parsed;
  } catch (error: any) {
    return {
      status: 0,
      message: error.message,
    };
  }
};

export const getCall = async (url: any) => {
  return executeFetchWithAuth(url, { method: "GET" });
};

export const postCall = async (url: any, data: any) => {
  return executeFetchWithAuth(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: data,
  });
};

export const postFormDataCall = async (url: any, data: any) => {
  return executeFetchWithAuth(url, {
    method: "POST",
    body: data,
  });
};

export const putFormDataCall = async (url: any, data: any) => {
  return executeFetchWithAuth(url, {
    method: "PUT",
    body: data,
  });
};

export const deleteCall = async (url: any, data: any) => {
  return executeFetchWithAuth(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: data,
  });
};

export const deleteParamsCall = async (url: any) => {
  return executeFetchWithAuth(url, {
    method: "DELETE",
  });
};

export const putCall = async (url: any, data: any) => {
  return executeFetchWithAuth(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: data,
  });
};

export const cancelCall = async () => {
  return {
    status: -1,
    message: "API call is in progress",
  };
};
