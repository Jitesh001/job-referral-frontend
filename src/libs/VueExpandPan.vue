<template>
  <v-expansion-panels v-model="panel" multiple :bg-color="bgColor">
    <v-expansion-panel>
      <v-expansion-panel-title>{{ title }}</v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-html="description"></div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
const isDark = inject("isDark", ref(false));
const bgColor = computed(() => (isDark.value ? "#111827" : "#f3f4f6"));

const props = defineProps({
  modelValue: {
    type: [Number, Array],
    default: () => [],
  },
  title: {
    type: String,
    default: "Details",
  },
  description: {
    type: String,
    default: "",
  },
  customClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
const panel = ref(props.modelValue);

watch(panel, (val) => emit("update:modelValue", val));
watch(
  () => props.modelValue,
  (val) => (panel.value = val)
);
</script>

<style scoped>
::v-deep(.v-expansion-panel-text) ul {
  padding-left: 1.5em;
  list-style-type: disc;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

::v-deep(.v-expansion-panel-text) ol {
  padding-left: 1.5em;
  list-style-type: decimal;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

::v-deep(.v-expansion-panel-text) li {
  margin-bottom: 0.25em;
}
</style>
