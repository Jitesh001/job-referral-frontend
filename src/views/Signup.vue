<template>
  <div
    class="w-[400px] max-w-full mx-auto mt-10 px-4 py-4 shadow-md rounded-lg border-2 bg-gray-100 border-gray-400 dark:bg-gray-900 dark:border-gray-800"
  >
    <h2 class="text-2xl font-bold text-center mb-6">Sign Up</h2>

    <form @submit.prevent="onSignup" class="space-y-4">
      <VueInput
        label="First Name"
        v-model="state.first_name"
        :error-messages="
          v$.first_name.$dirty
            ? v$.first_name.$errors.map((e) => e.$message)
            : []
        "
        @blur="v$.first_name.$touch"
      />
      <VueInput
        label="Last Name"
        v-model="state.last_name"
        :error-messages="
          v$.last_name.$dirty ? v$.last_name.$errors.map((e) => e.$message) : []
        "
        @blur="v$.last_name.$touch"
      />
      <VueInput
        label="Email"
        v-model="state.email"
        :error-messages="
          v$.email.$dirty ? v$.email.$errors.map((e) => e.$message) : []
        "
        @blur="v$.email.$touch"
        type="email"
      />
      <VueInput
        label="Phone Number"
        v-model="state.phone_number"
        :error-messages="
          v$.phone_number.$dirty
            ? v$.phone_number.$errors.map((e) => e.$message)
            : []
        "
        @blur="v$.phone_number.$touch"
        type="tel"
      />

      <VueButton class="btn-primary w-full" type="submit">
        <span v-if="isSubmitting">Signing in..</span>
        <span v-else>Sign Up</span>
      </VueButton>
      <p v-if="error" class="text-red-500 text-sm text-center mt-2">
        {{ error }}
      </p>
      <div v-if="formErrors" class="text-red-500 text-sm text-center mt-2">
        <p v-for="(msg, key) in formErrors" :key="key">
          {{ msg }}
        </p>
      </div>
    </form>

    <p class="mt-6 text-center text-sm">
      Already have an account?
      <router-link
        to="/login"
        class="text-blue-600 dark:text-blue-300 hover:underline"
      >
        Login
      </router-link>
    </p>
  </div>
</template>

<script setup>
const formErrors = ref({});
const error = ref("");
const router = useRouter();
const authStore = useAuthStore();

const isSubmitting = ref(false);
const alphaOnly = helpers.withMessage(
  "Only letters are allowed",
  helpers.regex(/^[A-Za-z]+$/)
);
const tenDigitPhone = helpers.withMessage(
  "Phone number must be exactly 10 digits",
  helpers.regex(/^\d{10}$/)
);

const state = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
});

const rules = {
  first_name: {
    required: helpers.withMessage("First name is required", required),
    alphaOnly,
  },
  last_name: {
    required: helpers.withMessage("Last name is required", required),
    alphaOnly,
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    email: helpers.withMessage("Enter a valid email address", email),
  },
  phone_number: {
    required: helpers.withMessage("Phone number is required", required),
    tenDigitPhone,
  },
};

const v$ = useVuelidate(rules, state);

const onSignup = async () => {
  v$.value.$touch();
  error.value = "";
  if (v$.value.$invalid) {
    error.value = "Please fix the errors above.";
    return;
  }

  isSubmitting.value = true;
  try {
    const { status, data } = await authStore.register(state, true);
    if (status === 201) {
      router.push({
        path: "/login",
        query: { username: state.phone_number },
      });
    } else {
      console.log(data);
      isSubmitting.value = false;
      Object.keys(data).forEach((key) => {
        formErrors.value[key] = data[key][0];
      });
    }
  } catch (error) {
    console.error("OTP request failed:", error);
    isSubmitting.value = false;
    if (error?.response?.data) {
      const backendErrors = error.response.data;

      Object.keys(backendErrors).forEach((key) => {
        formErrors.value[key] = backendErrors[key][0];
      });
    } else {
      formErrors.value = "Something went wrong. Please try again.";
    }
  }
};
</script>
