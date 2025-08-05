<template>
  <div class="type-chips">
    <v-chip
      v-for="(item, index) in items"
      :key="`${item}-${index}`"
      closable
      class="mb-2 mr-2"
      @click:close="onClose(index)"
    >
      {{ item }}
    </v-chip>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
  onClose: {
    type: Function,
    required: true,
  },
});
</script>

<style scoped>
.type-chips {
  display: flex;
  flex-wrap: wrap;
}
</style>
