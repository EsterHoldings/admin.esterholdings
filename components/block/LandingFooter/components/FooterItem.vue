<template>
  <ul class="footer-list">
    <li>
      <UiTextH5>
        {{ t(`${basePath}.title`) }}
      </UiTextH5>
    </li>

    <li
      class="item"
      v-for="(item, index) in tm(`${basePath}.items`)"
      :key="index"
    >
      <UiTextH6>{{ item.body.static }}</UiTextH6>
    </li>
  </ul>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
const props = defineProps({
  basePath: String,
});
const { t, tm } = useI18n();
</script>

<style lang="scss" scoped>
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  list-style: none;

  h5 {
    color: var(--ui-text-main);
  }
}

.item {
  color: var(--ui-text-secondary);
}
</style>
