export const useAuthStore = defineStore("userAuth", () => {
  const router = useRouter();
  const user = ref(null);
  const accessToken = useStorage("access_token", "");
  const refreshToken = useStorage("refresh_token", "");
  const error = ref(null);

  const isAuthenticated = computed(() => {
    if (!accessToken.value) return false;
    try {
      return jwtDecode(accessToken.value).exp > Date.now() / 1000;
    } catch {
      return false;
    }
  });

  const userFullName = computed(() => {
    if (!user.value) return "";
    return `${user.value.first_name} ${user.value.last_name}`;
  });

  // const refreshAccessToken = async () => {
  //   try {
  //     const { status, data } = await post("/user/token/refresh/", {
  //       refresh: refreshToken.value,
  //     });
  //     if (status === 200) {
  //       accessToken.value = data.access;
  //     } else {
  //       await router.push({ name: "login" });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const refreshAccessToken = async () => {
    const { status, data } = await post("/user/token/refresh/", {
      refresh: refreshToken.value,
    });
    if (status === 200) {
      accessToken.value = data.access;
      return true;
    }
    // throw to let the guard handle navigation
    throw new Error("Refresh failed");
  };

  const register = async (payload) => {
    try {
      const { status, data } = await post("/auth/register/", payload);
      return { status, data };
    } catch (error) {
      console.log(error);
      console.error(error);
    }
  };

  const login = async (payload) => {
    try {
      const { status, data } = await post("/auth/login/", payload);
      return { status, data };
    } catch (error) {
      console.error(error);
      return {
        status: null,
        data: { detail: error.message || "Unknown error" },
      };
    }
  };

  const verifyOTP = async (payload) => {
    try {
      const { status, data } = await post("/auth/verify-otp/", payload);

      // Store tokens
      accessToken.value = data.access;
      refreshToken.value = data.refresh;

      // Update state
      user.value = data.user;
      return { status, data };
    } catch (error) {
      console.error(error);
    }
  };

  const requestOTP = async (payload) => {
    try {
      const { status, data } = await post("/auth/request-otp/", payload);
      return { status, data };
    } catch (error) {
      console.log(error);
    }
  };

  const resetPasswordRequest = async (payload) => {
    try {
      const { status, data } = await post(
        "/auth/password-reset-request/",
        payload
      );
      return { status, data };
    } catch (error) {
      console.log(error);
    }
  };

  const resetPasswordConfirm = async (payload) => {
    try {
      const { status, data } = await post(
        "/auth/password-reset-confirm/",
        payload
      );
      return { status, data };
    } catch (error) {
      console.log(error);
    }
  };

  const changePassword = async (payload) => {
    try {
      const { status, data } = await post("/user/change-password/", payload);
      return { status, data };
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { status, data } = await get("/user/profile/");
      user.value = data;
      return { status, data };
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    accessToken.value = "";
    refreshToken.value = "";
    user.value = null;
    router.push({ name: "login" });
  };

  watch(
    () => accessToken.value,
    async (value) => {
      if (value) {
        await fetchUserProfile();
      }
    }
  );

  const checkAuth = async () => {
    if (!accessToken.value) {
      user.value = null;
      return false;
    }

    try {
      await fetchUserProfile();
      return true;
    } catch (err) {
      user.value = null;
      return false;
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    userFullName,
    refreshAccessToken,
    register,
    login,
    verifyOTP,
    requestOTP,
    resetPasswordRequest,
    resetPasswordConfirm,
    changePassword,
    fetchUserProfile,
    logout,
    checkAuth,
  };
});
