<template>
  <div class="max-w-4xl mx-auto mt-4">
    <VueTabs :tabs="tabList" v-model="activeTab" />

    <!-- Explore Jobs -->
    <template v-if="activeTab === 0">
      <div
        class="flex flex-wrap items-center px-4 py-4 mb-4 mt-4 rounded-2xl border-2 border-gray-400 dark:border-gray-800"
      >
        <div class="flex items-center w-full gap-2">
          <v-icon size="x-large"> mdi-briefcase-search-outline </v-icon>
          <VueInput
            label="Search Job"
            v-model="searchJob"
            type="text"
            @keydown.enter.prevent="fetchPosts"
          />
        </div>
        <div
          class="flex w-full flex-col md:flex-row md:items-start justify-between md:gap-4"
        >
          <v-date-input
            label="From Date"
            v-model="dateFrom"
            clearable
            max-width="w-1/3"
          ></v-date-input>

          <v-date-input
            label="To Date"
            v-model="dateTo"
            clearable
            max-width="w-1/3"
          ></v-date-input>
          <VueButton
            class="w-[160px] max-w-full"
            size="large"
            @click="onCreatePost"
          >
            Create Post
          </VueButton>
        </div>
      </div>

      <template v-if="postLoading">
        <v-skeleton-loader
          type="card"
          color="blue-accent-2"
        ></v-skeleton-loader>
      </template>
      <template v-else>
        <JobDetail :postList="posts" />
      </template>
      <v-pagination
        v-if="totalPages"
        v-model="currentPage"
        :length="totalPages"
        rounded="circle"
        class="mx-4"
        size="small"
      ></v-pagination>
    </template>

    <!-- Handle Jobs -->
    <template v-if="activeTab === 1">
      <div
        class="px-4 py-4 mb-4 mt-4 flex flex-wrap gap-4 items-center justify-between rounded-2xl border-2 border-gray-400 dark:border-gray-800"
      >
        <div>
          <span class="text-lg font-bold"
            >Welcome, {{ authStore.userFullName }}!</span
          >
        </div>
        <VueButton
          @click="onCreatePost"
          class="w-[160px] max-w-full"
          size="large"
        >
          Create Post
        </VueButton>
      </div>

      <JobDetail :postList="userPosts" :editDeleteOption="true" />
      <v-pagination
        v-if="totalPages2"
        v-model="currentPage2"
        :length="totalPages2"
        rounded="circle"
        class="mx-4"
        size="small"
      ></v-pagination>
    </template>
  </div>
</template>

<script setup>
const authStore = useAuthStore();
const activeTab = ref(0);
const searchJob = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const router = useRouter();
const route = useRoute();
const tabList = ref(["Explore Jobs", "Handle Posts"]);
const posts = ref([]);
const userPosts = ref([]);
const postLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const currentPage2 = ref(1);
const totalPages2 = ref(0);

const isDark = inject("isDark", ref(false));

const startDate = computed(() => {
  return formatDateForApi(dateFrom.value);
});
const endDate = computed(() => {
  return formatDateForApi(dateTo.value);
});

function onCreatePost() {
  router.push({
    name: "CreateJob",
    params: { userUUID: route.params.userUUID },
    query: { activeTab: activeTab.value },
  });
}

watch(dateFrom, (newDate) => {
  fetchPosts();
});

watch(dateTo, (newDate) => {
  fetchPosts();
});

watch(searchJob, (newSearch) => {
  if (!newSearch) {
    fetchPosts();
  }
});

watch(currentPage, (newPage) => {
  fetchPosts();
});

watch(currentPage2, (newPage) => {
  fetchUserPosts();
});

const fetchPosts = async () => {
  postLoading.value = true;
  const { status, data } = await get("/all-job-list/", {
    ...(searchJob.value ? { search: searchJob.value } : {}),
    ...(startDate.value ? { start_date: startDate.value } : {}),
    ...(endDate.value ? { end_date: endDate.value } : {}),
    ...(currentPage.value ? { page: currentPage.value } : {}),
  });
  if (status === 200) {
    posts.value = data.results;
    totalPages.value = data.pagination.total;
    currentPage.value = data.pagination.current;
  } else {
    console.log("failed to fetch all jobs.");
  }
  postLoading.value = false;
};

const fetchUserPosts = async () => {
  const { status, data } = await get("/user/jobs/", {
    ...(currentPage2.value ? { page: currentPage2.value } : {}),
  });
  if (status === 200) {
    userPosts.value = data.results;
    totalPages2.value = data.pagination.total;
    currentPage2.value = data.pagination.current;
  } else {
    console.log("failed to fetch user posts.");
  }
};

onMounted(async () => {
  const tabVal = route.query.tabValue;

  if (tabVal) {
    console.log(tabVal);
    activeTab.value = isNaN(Number(tabVal)) ? 0 : Number(tabVal);
    router.replace({ query: { ...route.query, tabValue: undefined } });
  }
  await fetchPosts();
  await fetchUserPosts();
});
</script>

<style scoped></style>
