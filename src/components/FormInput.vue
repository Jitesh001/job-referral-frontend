<template>
  <VueInput
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :label="label"
    :error-messages="errorMessages"
    :counter="counter"
    :required="required"
    @blur="$emit('blur')"
    @input="$emit('input')"
    class="mb-1"
  />
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  errorMessages: Array,
  counter: [Number, String],
  required: Boolean,
});
defineEmits(["update:modelValue", "blur", "input"]);
</script>
