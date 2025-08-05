<template>
  <div class="md:w-[700px] mb-5 mx-auto">
    <button class="inline-flex items-center gap-2" @click="goBackToFeed">
      <BackIcon class="w-[24px] h-[24px]" /> Back
    </button>
  </div>
  <div
    class="md:w-[700px] mx-auto px-6 py-6 border-2 rounded-2xl border-gray-400 dark:border-gray-800"
  >
    <h1 class="mb-2 text-center text-2xl font-extrabold">Edit Job</h1>
    <form @submit.prevent="onSubmit">
      <!-- Job Title -->
      <FormInput
        v-model="state.jobTitle"
        label="Job Title"
        :counter="50"
        required
        :error-messages="v$.jobTitle.$errors.map((e) => e.$message)"
        @blur="v$.jobTitle.$touch"
        @input="v$.jobTitle.$touch"
      />

      <!-- Company Name -->
      <FormInput
        v-model="state.companyName"
        label="Company Name"
        :counter="10"
        required
        :error-messages="v$.companyName.$errors.map((e) => e.$message)"
        @blur="v$.companyName.$touch"
        @input="v$.companyName.$touch"
      />

      <!-- Company Link -->
      <FormInput
        v-model="state.companyLink"
        label="Company Link"
        required
        :error-messages="v$.companyLink.$errors.map((e) => e.$message)"
        @blur="v$.companyLink.$touch"
        @input="v$.companyLink.$touch"
      />

      <!-- Job Type -->
      <div class="w-full">
        <label
          class="block px-2 py-2 font-bold text-gray-800 bg-gray-100 rounded-sm dark:bg-gray-900 dark:text-gray-400"
        >
          Job Type
        </label>
        <div class="d-flex flex-wrap gap-2 align-center">
          <v-checkbox
            v-for="mode in JOB_MODES"
            :key="mode.value"
            :label="mode.label"
            :value="mode.value"
            v-model="state.jobTypes"
            color="primary"
            density="compact"
            class="rounded-checkbox"
          />
        </div>
      </div>

      <!-- Locations -->
      <div class="mb-2 flex flex-col items-start md:flex-row md:gap-2">
        <div class="flex flex-col w-full">
          <FormInput
            v-model="state.jobLocation"
            label="Job Location"
            :error-messages="locationFieldErrors"
            @keydown.enter.prevent="addLocation"
            @blur="v$.locationList.$touch"
            @input="filterJobLocation"
            @keydown="(e) => handleKeydown(e, 'location')"
          />
          <small class="text-sm text-gray-500"
            >{{ state.locationList.length }}/5 added</small
          >
          <ChipList :items="state.locationList" :onClose="removeLocation" />
        </div>
        <VueButton class="mt-2" @click="addLocation">Add</VueButton>
      </div>

      <!-- Emails -->
      <div class="mb-2 flex flex-col items-start md:flex-row md:gap-2">
        <div class="flex flex-col w-full">
          <FormInput
            v-model="state.emailField"
            label="Enter Emails"
            :error-messages="emailFieldErrors"
            @keydown.enter.prevent="addEmail"
            @blur="v$.emailList.$touch"
            @input="filterEmails"
            @keydown="(e) => handleKeydown(e, 'email')"
          />
          <small class="text-sm text-gray-500"
            >{{ state.emailList.length }}/3 added</small
          >
          <ChipList :items="state.emailList" :onClose="removeEmail" />
        </div>
        <VueButton
          :disabled="!!state.emailError || !state.emailField.trim()"
          @click="addEmail"
          class="mt-2"
          >Add</VueButton
        >
      </div>

      <!-- Contacts -->
      <div class="mb-2 flex flex-col items-start md:flex-row md:gap-2">
        <div class="flex flex-col w-full">
          <FormInput
            v-model="state.contact"
            label="Enter Contact"
            :error-messages="contactFieldErrors"
            @keydown.enter.prevent="addContact"
            @blur="v$.contactList.$touch"
            @input="filterContacts"
            @keydown="(e) => handleKeydown(e, 'contact')"
          />
          <small class="text-sm text-gray-500"
            >{{ state.contactList.length }}/3 added</small
          >
          <ChipList :items="state.contactList" :onClose="removeContact" />
        </div>
      </div>

      <!-- Description -->
      <div>
        <label
          class="block mb-2 px-2 py-2 font-bold text-gray-800 bg-gray-100 rounded-sm dark:bg-gray-900 dark:text-gray-400"
        >
          Job Description
        </label>
        <QuillEditor
          v-model:content="state.content"
          @blur="v$.cleanContent.$touch"
          content-type="html"
          theme="snow"
          :toolbar="[
            'bold',
            'italic',
            'underline',
            'strike',
            { list: 'ordered' },
            { list: 'bullet' },
            'clean',
            { size: ['small', false, 'large', 'huge'] },
          ]"
          class="border-1 rounded-2xl min-h-[150px] max-h-[500px] overflow-y-auto"
        />
        <div v-if="v$.cleanContent.$error" class="text-red text-sm mt-1">
          {{ v$.cleanContent.$errors[0].$message }}
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end">
        <VueButton class="w-full md:w-[300px] mt-2 mb-2" type="submit">
          <span v-if="isSubmitting">Posting...</span>
          <span v-else>Post</span>
        </VueButton>
      </div>
      <p v-if="error" class="text-red-500 text-sm text-center mt-2">
        {{ error }}
      </p>
      <div v-if="formErrors" class="text-red-500 text-sm text-center mt-2">
        <p v-for="(msg, key) in formErrors" :key="key">
          {{ msg }}
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const alphaOnly = helpers.withMessage(
  "Only letters are allowed",
  helpers.regex(/^[A-Za-z\s]+$/)
);
const error = ref("");
const isSubmitting = ref(false);
const formErrors = ref([]);
const initialState = {
  jobTitle: "",
  companyName: "",
  companyLink: "",
  jobLocation: "",
  locationList: [],
  locationError: "",
  emailField: "",
  emailList: [],
  emailError: "",
  jobTypes: [],
  contact: "",
  contactList: [],
  contactError: "",
  content: "",
  cleanContent: "",
};

const state = reactive({ ...initialState });

const plainTextContent = computed(() => {
  const temp = document.createElement("div");
  temp.innerHTML = state.content || "";
  return (temp.textContent || "").replace(/\s+/g, " ").trim();
});

const rules = {
  jobTitle: {
    required: helpers.withMessage("Please enter job title", required),
  },
  companyName: {
    required: helpers.withMessage("Please enter company name", required),
    alphaOnly,
  },
  companyLink: {
    required: helpers.withMessage("Please enter company link", required),
    url: helpers.withMessage("Invalid URL", url),
  },
  locationList: {
    required: helpers.withMessage(
      "At least one job location is required",
      (val) => val.length > 0
    ),
  },
  emailList: {
    required: helpers.withMessage(
      "At least one email is required",
      (val) => val.length > 0
    ),
  },
  contactList: {
    required: helpers.withMessage(
      "At least one contact is required",
      (val) => val.length > 0
    ),
  },
  cleanContent: {
    required: helpers.withMessage(
      "Please enter job description",
      () => plainTextContent.value.length > 0
    ),
  },
};

const v$ = useVuelidate(rules, state);

function clear() {
  v$.value.$reset();
  for (const key in initialState) state[key] = initialState[key];
}

function addItem({
  inputKey,
  listKey,
  errorKey,
  max,
  validate,
  duplicateMessage,
}) {
  const value = state[inputKey].trim();
  const list = state[listKey];

  state[errorKey] = "";

  if (!value) return;

  if (list.includes(value)) {
    state[errorKey] = duplicateMessage;
    return;
  }

  if (list.length >= max) {
    state[errorKey] = `Only ${max} items can be added.`;
    return;
  }

  const isValid = validate ? validate(value) : true;
  if (!isValid) return;

  list.push(value);
  state[inputKey] = "";
}

function useFieldErrors(fieldKey, errorKey) {
  return computed(() => {
    const errors = [];
    if (state[errorKey]) errors.push(state[errorKey]);
    if (v$.value[fieldKey]?.$dirty) {
      errors.push(...v$.value[fieldKey].$errors.map((e) => e.$message));
    }
    return errors;
  });
}

function addEmail() {
  addItem({
    inputKey: "emailField",
    listKey: "emailList",
    errorKey: "emailError",
    max: 3,
    validate: (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email)) {
        state.emailError = "Please enter a valid email address.";
        return false;
      }
      return true;
    },
    duplicateMessage: "Email already added.",
  });
}

function addLocation() {
  addItem({
    inputKey: "jobLocation",
    listKey: "locationList",
    errorKey: "locationError",
    max: 5,
    validate: (loc) =>
      /^[A-Za-z\s]+$/.test(loc) ||
      (state.locationError = "Only letters and spaces allowed."),
    duplicateMessage: "Location already added.",
  });
}

function addContact() {
  addItem({
    inputKey: "contact",
    listKey: "contactList",
    errorKey: "contactError",
    max: 3,
    validate: (phone) => {
      if (!/^\d{10}$/.test(phone)) {
        state.contactError = "Phone number must be exactly 10 digits.";
        return false;
      }
      return true;
    },
    duplicateMessage: "Number already added.",
  });
}

const emailFieldErrors = useFieldErrors("emailList", "emailError");
const locationFieldErrors = useFieldErrors("locationList", "locationError");
const contactFieldErrors = useFieldErrors("contactList", "contactError");

function removeLocation(index) {
  state.locationList.splice(index, 1);
}
function removeEmail(index) {
  state.emailList.splice(index, 1);
}
function removeContact(index) {
  state.contactList.splice(index, 1);
}

function handleKeydown(event, type) {
  if (event.key === ",") {
    event.preventDefault();
    if (type === "location") addLocation();
    if (type === "email") addEmail();
    if (type === "contact") addContact();
  }
}

function filterJobLocation() {
  if (state.locationList.length >= 5) {
    state.locationError = "Only 5 locations can be added.";
    setTimeout(() => {
      state.locationError = "";
    }, 3000);
  }
  state.jobLocation = state.jobLocation.replace(/[^a-zA-Z\s]/g, "");
}

function filterEmails() {
  const email = state.emailField.trim();
  state.emailField = email;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail && email.length > 0) {
    state.emailError = "Please enter a valid email address.";
    setTimeout(() => {
      state.emailError = "";
    }, 3000);
  } else {
    state.emailError = "";
  }
}

function filterContacts() {
  state.contact = state.contact.replace(/\D/g, "");

  if (state.contact.length === 10) {
    state.contactError = "";
    addContact();
  } else if (state.contact.length > 0 && state.contact.length < 10) {
    state.contactError = "Contact must be exactly 10 digits.";
    setTimeout(() => {
      state.contactError = "";
    }, 3000);
  } else {
    state.contactError = "";
  }
}

function goBackToFeed() {
  console.log("Going back to feed");
  router.push({
    name: "feed",
    params: { userUUID: authStore.user.uuid },
    query: { tabValue: 1 },
  });
}

const onSubmit = async () => {
  v$.value.$touch();
  error.value = "";
  if (v$.value.$invalid) {
    error.value = "Please fix the errors above.";
    return;
  }

  const paylod = {
    job_title: state.jobTitle,
    company_link: state.companyLink,
    company_name: state.companyName,
    job_location: state.locationList,
    job_mode: state.jobTypes,
    contact_phones: state.contactList,
    contact_emails: state.emailList,
    job_description: state.content,
  };

  isSubmitting.value = true;
  try {
    const { status, data } = await patch(
      `/user/jobs/${route.params.jobUUID}/`,
      paylod
    );
    if (status === 200) {
      router.push({
        name: "feed",
        params: { userUUID: authStore.user.uuid },
        query: { tabValue: 1 },
      });
    } else {
      Object.keys(data).forEach((key) => {
        formErrors.value[key] = data[key][0];
      });
    }
  } catch (error) {
    if (error?.response?.data) {
      const backendErrors = error.response.data;
      Object.keys(backendErrors).forEach((key) => {
        formErrors.value[key] = backendErrors[key];
      });
    } else {
      formErrors.value = "Something went wrong. Please try again.";
    }
  }
  isSubmitting.value = false;
};

const fetchPostDetail = async () => {
  const { status, data } = await get(`/user/jobs/${route.params.jobUUID}/`);
  if (status === 200) {
    state.jobTitle = data.job_title;
    state.companyName = data.company_name;
    state.companyLink = data.company_link;
    state.locationList = data.job_location || [];
    state.jobTypes = data.job_mode || [];
    state.contactList = data.contact_phones || [];
    state.emailList = data.contact_emails || [];
    state.content = data.job_description || "";
    console.log("Data Fetched.");
  } else {
    console.log("failed to fetch all jobs.");
  }
};

onMounted(async () => {
  await fetchPostDetail();
});
</script>

<style scoped>
::v-deep(.ql-toolbar.ql-snow) {
  border-radius: 0.75rem;
  margin-bottom: 12px;
  border-color: #1e2939;
}
</style>
