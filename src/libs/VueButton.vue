<template>
  <v-btn
    :color="color"
    :variant="variant"
    :class="customClass"
    :size="size"
    class="rounded-lg"
    @click="onClick"
  >
    <slot />
  </v-btn>
</template>

<script setup>
const props = defineProps({
  color: { type: String, default: "primary" },
  variant: { type: String, default: "elevated" },
  customClass: { type: String, default: "" },
  size: { type: String, default: "default" },
});
const emit = defineEmits(["click"]);
function onClick(e) {
  emit("click", e);
}
</script>
