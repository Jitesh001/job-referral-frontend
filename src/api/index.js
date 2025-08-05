const redirectToLogin = () => {
  router.push({ name: "login" });
};

const refreshAccessToken = async (refreshToken) => {
  const { data, status } = await post("/user/token/refresh/", {
    refresh: refreshToken,
  });

  return { data, status };
};

const userAxiosInstance = createAxiosInstance({
  refreshAccessToken,
  redirectToLogin,
});

export const get = async (url, params = {}) => {
  return baseGet(userAxiosInstance, url, params);
};

export const post = async (url, data = {}) => {
  return basePost(userAxiosInstance, url, data);
};

export const patch = async (url, data = {}) => {
  return basePatch(userAxiosInstance, url, data);
};

export const remove = async (url) => {
  return baseRemove(userAxiosInstance, url);
};

export const upload = async (url, data = {}) => {
  return baseUpload(userAxiosInstance, url, data);
};
