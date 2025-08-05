<template>
  <v-checkbox
    :label="label"
    v-model="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
defineProps({
  label: String,
  modelValue: Boolean,
});
</script>
