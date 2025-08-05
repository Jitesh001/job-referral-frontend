<template>
  <v-menu transition="slide-y-transition">
    <template #activator="{ props }">
      <v-icon v-bind="props" color="grey">mdi-dots-horizontal</v-icon>
    </template>

    <v-list
      class="rounded-lg"
      density="compact"
      nav
      variant="flat"
      slim
      :bg-color="bgColor"
    >
      <v-list-item
        :class="[
          isDark ? '!bg-[#111827] text-white' : '!bg-[#f3f4f6] text-black',
        ]"
        @click="$emit('edit')"
      >
        <v-list-item-title>Edit</v-list-item-title>
      </v-list-item>
      <v-list-item
        :class="[
          isDark ? '!bg-[#111827] text-white' : '!bg-[#f3f4f6] text-black',
        ]"
        @click="$emit('delete')"
      >
        <v-list-item-title>Delete</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
defineEmits(["edit", "delete"]);
const isDark = inject("isDark", ref(false));

const bgColor = computed(() => (isDark.value ? "#111827" : "#f3f4f6"));
</script>
