<template>
  <form>
    <VueInput
      v-model="state.jobTitle"
      :counter="10"
      :error-messages="v$.jobTitle.$errors.map((e) => e.$message)"
      label="Job Title"
      required
      @blur="v$.jobTitle.$touch"
      @input="v$.jobTitle.$touch"
      class="mb-1"
    />

    <VueInput
      v-model="state.companyName"
      :counter="10"
      :error-messages="v$.companyName.$errors.map((e) => e.$message)"
      label="Company Name"
      required
      @blur="v$.companyName.$touch"
      @input="v$.companyName.$touch"
      class="mb-1"
    />

    <VueInput
      v-model="state.companyLink"
      :error-messages="v$.companyLink.$errors.map((e) => e.$message)"
      label="Company Link"
      required
      @blur="v$.companyLink.$touch"
      @input="v$.companyLink.$touch"
      class="mb-1"
    />

    <!-- Job Type -->
    <div class="w-full">
      <label
        class="block px-2 py-2 text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-gray-400 text-large font-bold rounded-sm w-full"
      >
        Job Type
      </label>
      <div class="d-flex flex-wrap align-center gap-2">
        <v-checkbox
          v-for="type in jobTypeOptions"
          :key="type"
          :label="type"
          :value="type"
          v-model="state.jobTypes"
          color="primary"
          density="compact"
        />
      </div>
    </div>

    <div
      class="mb-2 flex flex-col justify-betweeen items-start md:flex-row md:gap-2"
    >
      <div class="flex flex-col w-full">
        <VueInput
          v-model="state.jobLocation"
          :error-messages="locationFieldErrors"
          label="Job Location"
          @keydown.enter.prevent="addLocation"
          @blur="v$.locationList.$touch"
          @input="filterJobLocation"
          @keydown="(event) => handleKeydown(event, 'location')"
        />
        <div class="location-chips">
          <v-chip
            v-for="(location, index) in state.locationList"
            :key="index"
            closable
            @click:close="removeLocation(index)"
          >
            {{ location }}
          </v-chip>
        </div>
      </div>
      <VueButton @click="addLocation">Add</VueButton>
    </div>

    <div
      class="mb-2 flex flex-col justify-betweeen items-start md:flex-row md:gap-2"
    >
      <div class="flex flex-col w-full">
        <VueInput
          v-model="state.emailField"
          :error-messages="emailFieldErrors"
          label="Enter Emails"
          @keydown.enter.prevent="addEmail"
          @blur="v$.emailList.$touch"
          @input="filterEmails"
          @keydown="(event) => handleKeydown(event, 'email')"
        />
        <div class="email-chips">
          <v-chip
            v-for="(email, index) in state.emailList"
            :key="index"
            closable
            @click:close="removeEmail(index)"
          >
            {{ email }}
          </v-chip>
        </div>
      </div>
      <VueButton @click="addEmail">Add</VueButton>
    </div>

    <div
      class="mb-2 flex flex-col justify-betweeen items-start md:flex-row md:gap-2"
    >
      <div class="flex flex-col w-full">
        <VueInput
          v-model="state.contact"
          :error-messages="contactFieldErrors"
          label="Enter Contact"
          @keydown.enter.prevent="addContact"
          @blur="v$.contactList.$touch"
          @input="filterContacts"
          @keydown="(event) => handleKeydown(event, 'contact')"
        />

        <div class="contact-chips">
          <v-chip
            v-for="(contact, index) in state.contactList"
            :key="index"
            closable
            @click:close="removeContact(index)"
            class="ma-1"
          >
            {{ contact }}
          </v-chip>
        </div>
      </div>
      <VueButton class="me-2" @click="addContact">Add</VueButton>
    </div>

    <div>
      <label class="block mb-2 text-sm font-medium">Description</label>

      <QuillEditor
        v-model:content="state.content"
        @blur="v$.cleanContent.$touch"
        content-type="html"
        class="border-2 rounded-2xl border-gray-600 min-h-[150px] light:bg-white dark:bg-gray-600 dark:border-gray-800 max-h-[500px] overflow-y-auto"
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
        theme="snow"
      />
      <!-- Show validation error manually -->
      <div v-if="v$.cleanContent.$error" class="text-red text-sm mt-1">
        {{ v$.cleanContent.$errors[0].$message }}
      </div>
    </div>

    <VueButton class="me-4" @click="v$.$validate"> submit </VueButton>
    <VueButton @click="clear"> clear </VueButton>
  </form>
</template>

<script setup>
const alphaOnly = helpers.withMessage(
  "Only letters are allowed",
  helpers.regex(/^[A-Za-z\s]+$/)
);

const jobTypeOptions = ["On Site", "Full Time", "Remote"];

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

const state = reactive({
  ...initialState,
});

const rules = {
  jobTitle: {
    required: helpers.withMessage("Please Enter Job Title", required),
    alphaOnly,
  },
  companyName: {
    required: helpers.withMessage("Please Enter Company Name", required),
    alphaOnly,
  },
  companyLink: {
    required: helpers.withMessage("Please Enter Company Link", required),
    url: helpers.withMessage("Enter a valid URL", url),
  },
  locationList: {
    required: helpers.withMessage(
      "At least one job location is required",
      (value) => Array.isArray(value) && value.length > 0
    ),
  },
  emailList: {
    required: helpers.withMessage(
      "At least one email is required",
      (value) => Array.isArray(value) && value.length > 0
    ),
  },
  contactList: {
    required: helpers.withMessage(
      "At least one contact is required",
      (value) => Array.isArray(value) && value.length > 0
    ),
  },
  cleanContent: {
    required: helpers.withMessage("Please enter the Job Description", () => {
      const temp = document.createElement("div");
      temp.innerHTML = state.content || "";
      const textOnly = temp.textContent || "";
      return textOnly.replace(/\s+/g, " ").trim().length > 0;
    }),
  },
};

const v$ = useVuelidate(rules, state);

function clear() {
  v$.value.$reset();

  for (const [key, value] of Object.entries(initialState)) {
    state[key] = value;
  }
}

function addLocation() {
  const locationInput = state.jobLocation.trim();

  state.locationError = "";

  if (state.locationList.length === 5) {
    return;
  }

  if (state.locationList.includes(locationInput)) {
    state.locationError = "You have already added this location.";
    return;
  }

  if (locationInput && !state.locationList.includes(locationInput)) {
    state.locationList.push(locationInput);
    state.jobLocation = "";
  }
}

function removeLocation(index) {
  state.locationList.splice(index, 1);
}

function addEmail() {
  const emailInput = state.emailField.trim();

  state.emailError = "";

  if (state.emailList.length === 3) {
    return;
  }

  if (state.emailList.includes(emailInput)) {
    state.emailError = "You have already added this email.";
    return;
  }

  state.emailList.push(emailInput);
  state.emailField = "";
}

function removeEmail(index) {
  state.emailList.splice(index, 1);
}

function addContact() {
  const contactInput = state.contact.trim();

  state.contactError = "";

  if (state.contactList.length === 3) {
    return;
  }

  if (contactInput.length !== 10) {
    state.contactError = "Phone number should have 10 digits";
    return;
  }

  if (state.contactList.includes(contactInput)) {
    state.contactError = "You have already added this number.";
    return;
  }

  if (contactInput && !state.contactList.includes(contactInput)) {
    state.contactList.push(contactInput);
    state.contact = "";
  }
}

function removeContact(index) {
  state.contactList.splice(index, 1);
}

function handleKeydown(event, type) {
  if (event.key === ",") {
    event.preventDefault();
    if (type === "location") {
      addLocation();
    }
    if (type === "contact") {
      addContact();
    }
    if (type === "email") {
      addEmail();
    }
  }
}

function filterJobLocation() {
  if (state.locationList.length === 5) {
    state.locationError = "Only 5 locations can be added.";
    return;
  }
  state.jobLocation = state.jobLocation.replace(/[^a-zA-Z\s]/g, "");
}

function filterEmails() {
  const emailInput = state.emailField?.trim();

  if (state.emailList.length === 3) {
    state.emailError = "Only 3 emails can be added.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput)) {
    state.emailError = "Please enter a valid email address.";
    return;
  }
  state.emailError = "";
}

function filterContacts() {
  state.contact = state.contact.replace(/\D/g, "");

  if (state.contactList.length === 3) {
    state.contactError = "Only 3 contacts can be added.";
    return;
  }

  if (state.contact.length === 10) {
    addContact();
  }

  if (state.contact.length < 10) {
    state.contactError = "";
  }
}

const contactFieldErrors = computed(() => {
  const errors = [];
  if (state.contactError) errors.push(state.contactError);
  if (v$.value.contactList.$dirty) {
    errors.push(...v$.value.contactList.$errors.map((e) => e.$message));
  }
  return errors;
});

const locationFieldErrors = computed(() => {
  const errors = [];
  if (state.locationError) errors.push(state.locationError);
  if (v$.value.locationList.$dirty) {
    errors.push(...v$.value.locationList.$errors.map((e) => e.$message));
  }
  return errors;
});

const emailFieldErrors = computed(() => {
  const errors = [];
  if (state.emailError) errors.push(state.emailError);
  if (v$.value.emailList.$dirty) {
    errors.push(...v$.value.emailList.$errors.map((e) => e.$message));
  }
  return errors;
});
</script>

<style scoped>
::v-deep(.ql-toolbar.ql-snow) {
  border-radius: 0.75rem;
  margin-bottom: 12px;
  border-color: #1e2939;
}
</style>
