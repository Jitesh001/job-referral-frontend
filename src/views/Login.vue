<template>
  <div
    class="w-[400px] max-w-full mx-auto mt-10 px-4 py-4 shadow-md rounded-lg border-2 bg-gray-100 border-gray-400 dark:bg-gray-900 dark:border-gray-800"
  >
    <h2 class="text-2xl font-bold text-center mb-6">Login</h2>

    <form @submit.prevent="onLogin" class="space-y-4">
      <div class="flex flex-col gap-2">
        <VueInput
          label="Username"
          v-model="state.username"
          :disabled="usernameFromQuery"
          :error-messages="
            v$.username.$dirty ? v$.username.$errors.map((e) => e.$message) : []
          "
          @blur="v$.username.$touch"
        />
        <VueButton
          class="w-full mb-2"
          type="button"
          @click="onSendOtp"
          :disabled="
            !state.username || v$.username.$invalid || isSendingOtp || otpSent
          "
        >
          <span v-if="isSendingOtp">Sending...</span>
          <span v-else>Send OTP</span>
        </VueButton>
        <span v-if="otpSent">
          Otp has been sent, you can request new otp after 30 sec.
        </span>
        <VueInput
          label="OTP"
          v-model="state.otp"
          :error-messages="
            v$.otp.$dirty ? v$.otp.$errors.map((e) => e.$message) : []
          "
          @blur="v$.otp.$touch"
        />
        <VueButton
          class="btn-primary w-full"
          type="submit"
          :disabled="!state.otp || v$.otp.$invalid"
        >
          <span v-if="isLogin">Logining..</span>
          <span v-else>Login</span>
        </VueButton>
        <p v-if="error" class="text-red-500 text-sm text-center mt-2">
          {{ error }}
        </p>
        <div v-if="formErrors" class="text-red-500 text-sm text-center mt-2">
          <p v-for="(msg, key) in formErrors" :key="key">
            {{ msg }}
          </p>
        </div>
      </div>
    </form>

    <p class="mt-6 text-center text-sm">
      Don’t have an account?
      <router-link
        to="/signup"
        class="text-blue-600 dark:text-blue-400 hover:underline"
      >
        Sign Up
      </router-link>
    </p>
  </div>
</template>

<script setup>
const authStore = useAuthStore();
const state = reactive({
  username: "",
  otp: "",
});
const error = ref("");
const isSendingOtp = ref(false);
const router = useRouter();
const route = useRoute();
const usernameFromQuery = ref(false);
const isLogin = ref(false);
const formErrors = ref({});
const otpSent = ref(false);
const sixDigitNumber = helpers.withMessage(
  "OTP must be exactly 6 digits",
  helpers.regex(/^\d{6}$/)
);

const rules = {
  username: {
    required: helpers.withMessage("Username is required", required),
  },
  otp: {
    // Only required for login, not for sending OTP
    required: helpers.withMessage("OTP is required", required),
    sixDigitNumber,
  },
};
const v$ = useVuelidate(rules, state);

const onSendOtp = async () => {
  v$.value.username.$touch();
  error.value = "";
  if (v$.value.username.$invalid) {
    error.value = "Please enter a valid username.";
    return;
  }
  isSendingOtp.value = true;

  try {
    const { status, data } = await authStore.requestOTP(state, true);

    if (status === 200) {
      formErrors.value = {};
      otpSent.value = true;
      isSendingOtp.value = false;
      setTimeout(() => {
        otpSent.value = false;
      }, 10000);
    } else {
      Object.keys(data).forEach((key) => {
        formErrors.value[key] = data[key][0];
      });
    }
  } catch (error) {
    if (error?.response?.data) {
      const backendErrors = error.response.data;
      Object.keys(backendErrors).forEach((key) => {
        formErrors.value[key] = backendErrors[key][0];
      });
    } else {
      formErrors.value = "Something went wrong. Please try again.";
    }
  }
  isSendingOtp.value = false;
};

const onLogin = async () => {
  v$.value.otp.$touch();
  error.value = "";
  if (v$.value.otp.$invalid) {
    error.value = "Invalid OTP";
    return;
  }
  isLogin.value = true;
  const { status, data } = await authStore.verifyOTP(state, true);
  if (status === 200) {
    router.push({
      name: "feed",
      params: { userUUID: data.uuid },
    });
  } else {
    Object.keys(data).forEach((key) => {
      formErrors.value[key] = data[key];
    });
  }
  isLogin.value = false;
};

onMounted(() => {
  const queryUsername = route.query.username;
  if (queryUsername) {
    state.username = queryUsername;
    usernameFromQuery.value = true;
    v$.value.username.$touch();
  }
});
</script>
