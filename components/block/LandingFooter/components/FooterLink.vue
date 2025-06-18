<template>
  <ul class="footer-list">
    <li>
      <UiTextH5>{{ t(`${basePath}.title`) }}</UiTextH5>
    </li>

    <li class="item" v-for="link in sectionLinks" :key="link.path">
      <NuxtLink :to="`/${link.path}`">
        <UiTextH6>{{ t(link.labelKey) }}</UiTextH6>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
import { footerMenuRoutes } from "../composables/footerMenuRoutes";

const props = defineProps({
  basePath: String,
});

const { t } = useI18n();
const allLinks = footerMenuRoutes();

const section = props.basePath.split(".").at(-1);

const sectionLinks = allLinks[section];
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

  a {
    color: inherit;
  }
}

@media (max-width: 576px) {
  .footer-list {
    width: 100%;
    align-items: center;
  }
}
</style>
