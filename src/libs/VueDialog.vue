<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="updateDialog"
    max-width="500"
  >
    <v-card
      class="px-4 py-4"
      :class="isDark ? '!bg-[#111827] text-white' : '!bg-[#f3f4f6] text-black'"
    >
      <div class="text-lg text-center font-bold mb-4">
        {{ title }}
      </div>
      <v-card-actions class="flex justify-center items-center !gap-4">
        <VueButton @click="cancelDelete">Cancel</VueButton>
        <VueButton @click="confirmDelete">Delete</VueButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: "Are you sure to delete the post?" },
});
const emit = defineEmits(["update:modelValue", "confirm"]);

function updateDialog(val) {
  emit("update:modelValue", val);
}
function cancelDelete() {
  emit("update:modelValue", false);
}
function confirmDelete() {
  emit("confirm");
  emit("update:modelValue", false);
}

const isDark = inject("isDark", ref(false));

const varientVal = computed(() => (isDark.value ? "outlined" : "elevated"));
const bgColor = computed(() => (isDark.value ? "indigo" : "indigo-darken-3"));
</script>
