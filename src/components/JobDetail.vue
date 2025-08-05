<template>
  <div
    v-for="post in postList"
    :key="post.id"
    class="mb-6 p-5 rounded-lg shadow-md transition-all duration-300 border-2 border-gray-400 dark:border-gray-800"
  >
    <!-- Header -->
    <div class="flex justify-between items-center px-4 mt-2 mb-2 rounded-md">
      <h3 class="text-lg font-bold">
        {{ post.job_title }}
      </h3>
      <template v-if="editDeleteOption">
        <VueMenu
          @edit="onEditPost(post.uuid)"
          @delete="onDeletePost(post.uuid)"
        />
      </template>
    </div>

    <!-- Job Info -->
    <div class="space-y-1 px-4 mb-4">
      <!-- Title -->

      <!-- Company link -->
      <a
        :href="post.company_link"
        target="_blank"
        class="block text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline mb-2"
      >
        {{ post.company_name }}
      </a>

      <!-- Location -->
      <p class="text-sm flex flex-wrap gap-2 mb-2">
        <v-chip
          v-for="location in post.job_location"
          :key="location"
          size="small"
          rounded="xl"
          :color="
            isDark
              ? '!bg-gray-800 !text-gray-100' // dark mode chip on bg-gray-900
              : '!bg-white !text-gray-900' // light mode chip on bg-gray-100
          "
        >
          {{ location }}
        </v-chip>
        <v-chip
          v-for="mode in post.job_mode"
          :key="mode"
          size="small"
          rounded="xl"
          color="!bg-blue-900/10 !text-blue-700"
        >
          {{ (JOB_MODES.find((m) => m.value === mode) || {}).label }}
        </v-chip>
      </p>

      <!-- Contacts -->
      <p class="text-sm flex flex-wrap gap-2 mb-2">
        <v-chip
          v-for="phone in post.contact_phones"
          :key="phone"
          size="small"
          rounded="xl"
          color="!bg-yellow-900/10 !text-yellow-700"
        >
          {{ phone }}
        </v-chip>
        <v-chip
          v-for="email in post.contact_emails"
          :key="email"
          size="small"
          rounded="xl"
          color="!bg-green-900/10 !text-green-700"
        >
          {{ email }}
        </v-chip>
      </p>
    </div>

    <div class="flex justify-end mb-1 mr-2">
      <span class="text-xs font-normal italic">
        by {{ post.user_name }} posted on
        {{ convertUtcToLocalFormatted(post.created) }}
      </span>
    </div>

    <div>
      <VueExpandPan
        v-model="activePanels"
        :title="'Job Description'"
        :description="post.job_description"
        variant="accordion"
      />
    </div>
  </div>
  <!-- Delete Confirmation Dialog -->
  <VueDialog
    v-model="showDeleteDialog"
    @confirm="confirmDelete"
    title="Are you sure you want to delete this job?"
  />
</template>

<script setup>
const router = useRouter();
const props = defineProps({
  postList: {
    type: Object,
  },
  editDeleteOption: {
    type: Boolean,
    default: false,
  },
});

const isDark = inject("isDark", ref(false));

const showDeleteDialog = ref(false);
const deletPostUuid = ref(null);

function onEditPost(post_uuid) {
  router.push({
    name: "EditJob",
    params: { jobUUID: post_uuid },
  });
}

function onDeletePost(post_uuid) {
  deletPostUuid.value = post_uuid;
  showDeleteDialog.value = true;
}

const confirmDelete = async () => {
  const { status, data } = await remove(`/user/jobs/${deletPostUuid.value}/`);
  if (status === 204) {
    console.log("post deleted successfully.");
  } else {
    console.log("failed to fetch all jobs.");
  }
  showDeleteDialog.value = false;
  deletPostUuid.value = null;
};

function cancelDelete() {
  showDeleteDialog.value = false;
  postToDelete.value = null;
}
</script>

<style scoped></style>
