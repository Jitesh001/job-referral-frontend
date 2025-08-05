<template>
  <v-theme-provider :theme="isDark ? 'dark' : 'light'">
    <div
      class="min-h-screen transition-colors duration-300 py-2 light:bg-gray-100 dark:bg-gray-900"
    >
      <div
        v-if="buttonsVisible"
        class="flex items-center justify-end px-4 sticky top-0 gap-4 h-16"
      >
        <button @click="toggleTheme">
          <span v-if="isDark"><moon-icon class="w-[30px] h-[50px]" /></span>
          <span v-else><sun-icon class="w-[30px] h-[50px]" /></span>
        </button>
        <VueButton v-if="authStore.isAuthenticated" @click="handleLogout">
          Logout
        </VueButton>
      </div>
      <div class="w-full px-4 mb-5">
        <router-view />
      </div>
    </div>
  </v-theme-provider>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();

const handleLogout = () => {
  if (authStore) {
    authStore.logout();
  } else {
    console.error("Auth store is not available");
  }
};

const isDark = ref(false);

// --- Add this for scroll hiding ---
const buttonsVisible = ref(true);
function onScroll() {
  buttonsVisible.value = window.scrollY <= 100; // adjust threshold as needed
}

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  isDark.value = savedTheme ? savedTheme === "dark" : prefersDark;
  applyTheme();
  window.addEventListener("scroll", onScroll);
  onScroll();
  console.log("Auth store initialized:", !!authStore);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});

function applyTheme() {
  const datePickers = document.getElementsByClassName("v-date-picker") || [];
  console.log(datePickers);
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");

    for (const datePicker of datePickers) {
      datePicker.classList.add("v-theme--dark");
      datePicker.classList.remove("v-theme--light");
    }
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    for (const datePicker of datePickers) {
      datePicker.classList.add("v-theme--dark");
      datePicker.classList.remove("v-theme--light");
    }
  }
}

function toggleTheme() {
  isDark.value = !isDark.value;
  applyTheme();
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
}

watch(isDark, applyTheme);

provide("isDark", isDark);
</script>
