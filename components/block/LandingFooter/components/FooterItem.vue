<template>
  <ul class="footer-list">
    <li>
      <UiTextH5>
        {{ props.title }}
      </UiTextH5>
    </li>

    <li class="item" v-for="item in props.items" :key="item">
      <UiTextH6>{{ item }}</UiTextH6>
    </li>
  </ul>
</template>

<script setup>
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
const props = defineProps({
  title: String,
  items: Array,
});
</script>

<style lang="scss" scoped>
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  list-style: none;

  h5 {
    color: var(--color-ui-primary-defalt);
  }
}

.item {
  color: var(--color-ui-grey);
}
</style>
