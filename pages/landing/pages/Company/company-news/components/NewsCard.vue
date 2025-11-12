<template>
  <PanelDefault class="p-4 !w-full">
    <div class="flex justify-between items-center gap-3">
      <div class="news-text">
        <UiTextH4 class="news-text_title">{{ title }}</UiTextH4>
        <UiTextParagraph class="news-text_date">{{ date }}</UiTextParagraph>
        <UiTextParagraph class="news-text_message">{{ message }}</UiTextParagraph>
      </div>
      <div>
        <div
            class="news-image"
            v-if="image">
          <img
              :src="image"
              :alt="title" />
        </div>
        <NuxtLink
            :to="link"
            class="learn-more">{{ buttonText }}<span>→</span>
        </NuxtLink>
      </div>
    </div>
  </PanelDefault>
</template>

<script setup>
  import UiTextH4 from '~/components/ui/UiTextH4.vue';
  import UiTextParagraph from '~/components/ui/UiTextParagraph.vue';
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";

  defineProps({
    title: String,
    date: String,
    message: String,
    link: String,
    buttonText: String,
    image: String,
  });
</script>

<style scoped lang="scss">
  .news-text {
    flex: 1;

    &_title {
      color: var(--ui-text-main);
    }

    &_date {
      font-size: 0.875rem;
      color: var(--ui-text-main);
      margin-bottom: 16px;
      margin-top: 5px;
    }

    &_message {
      font-size: 1rem;
      color: var(--ui-text-main);
      margin-bottom: 24px;
    }
  }

  .learn-more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    color: #138ee7;
    border-radius: 50px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.3s, color 0.3s;

    &:hover {
      background: #138ee7;
      color: #fff;
    }
  }

  .news-image img {
    max-width: 220px;
    border-radius: 8px;
    object-fit: cover;
  }
</style>
