import axios from "axios";

export const createAxiosInstance = (authConfig) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000/api";
  const axiosInstance = axios.create({
    baseURL: backendUrl,
  });

  axiosInstance.defaults.headers.common = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Cache-Control": "no-cache",
  };

  axiosInstance.defaults.withCredentials = true;

  axiosInstance.interceptors.request.use(async (config) => {
    const { refreshAccessToken, redirectToLogin } = authConfig;
    const accessToken = localStorage.getItem(`access_token`);
    const refreshToken = localStorage.getItem(`refresh_token`);

    // Ignore the auth routes
    if (config.url.includes("auth")) {
      return config;
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (refreshToken) {
      // If no access token, attempt to refresh it
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        authConfig.accessToken = newTokens.accessToken; // Update the access token in config
      } catch (error) {
        // Handle failed token refresh (e.g., redirect to log in)
        throw error;
      }
    } else {
      await redirectToLogin();
    }

    return config;
  });

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      // If the response is successful, return the response
      return response;
    },
    async (error) => {
      const { refreshAccessToken } = authConfig;
      const originalRequest = error.config;

      // Check if the error status is 401 and the route is not in authRoutes
      const isAuthRoute = originalRequest.url.includes("auth");

      if (!isAuthRoute && error.response.status === 401) {
        originalRequest.retryCount = originalRequest.retryCount || 0;

        if (originalRequest.retryCount < 3) {
          originalRequest.retryCount += 1; // Increment the retry count

          try {
            // Attempt to refresh the token
            const newTokens = await refreshAccessToken();
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newTokens.accessToken}`;
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newTokens.accessToken}`;
            authConfig.accessToken = newTokens.accessToken; // Update the access token in config

            // Retry the original request with the new token
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Handle failed token refresh (e.g., redirect to login)
            return Promise.reject(refreshError);
          }
        }
      }

      // Reject the promise if the status code is 400, 500, or if retries exceeded 3 attempts
      if (
        !isAuthRoute ||
        error.response.status === 400 ||
        error.response.status === 500 ||
        originalRequest.retryCount >= 3
      ) {
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Axios methods (get, post, patch, del) remain unchanged
export const baseGet = async (axiosInstance, url, params = {}) => {
  params = Object.keys(params).reduce((acc, key) => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  try {
    const response = await axiosInstance.get(url, { params });
    return response;
  } catch (error) {
    return error.response;
  }
};

export const basePost = async (axiosInstance, url, data = {}) => {
  try {
    const response = await axiosInstance.post(url, data);
    return response;
  } catch (error) {
    return error.response;
  }
};

export const basePatch = async (axiosInstance, url, data = {}) => {
  try {
    const response = await axiosInstance.patch(url, data);
    return response;
  } catch (error) {
    return error.response;
  }
};

export const baseRemove = async (axiosInstance, url) => {
  try {
    const response = await axiosInstance.delete(url);
    return response;
  } catch (error) {
    return error.response;
  }
};

export const baseUpload = async (axiosInstance, url, data = {}) => {
  try {
    const response = await axiosInstance.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

export const basePatchUpload = async (axiosInstance, url, data = {}) => {
  try {
    const response = await axiosInstance.patch(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    return error.response;
  }
};
