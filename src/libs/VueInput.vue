<template>
  <v-text-field
    :label="label"
    :type="type"
    v-model="inputValue"
    :rules="rules"
    :class="customClass"
    clearable="true"
  />
</template>

<script setup>
const props = defineProps({
  label: String,
  type: { type: String, default: "text" },
  modelValue: [String, Number],
  rules: { type: Array, default: () => [] },
  customClass: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);
const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
