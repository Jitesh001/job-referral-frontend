<template>
  <v-tabs v-model="tab" grow>
    <v-tab v-for="(item, idx) in tabs" :key="idx">{{ item }}</v-tab>
  </v-tabs>
</template>

<script setup>
const props = defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
});
const emit = defineEmits(["update:modelValue"]); // <-- Add this line
const tab = ref(props.modelValue);
watch(tab, (val) => {
  emit("update:modelValue", val);
});
watch(
  () => props.modelValue,
  (val) => {
    if (tab.value !== val) tab.value = val;
  }
);
</script>
