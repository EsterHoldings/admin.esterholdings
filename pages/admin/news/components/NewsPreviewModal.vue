<template>
  <teleport to="body">
    <transition name="news-preview-fade">
      <div
        v-if="modelValue && article"
        class="news-preview"
        @click.self="$emit('update:modelValue', false)">
        <div class="news-preview__dialog">
          <div class="news-preview__header">
            <div class="news-preview__header-copy">
              <div class="news-preview__eyebrow">{{ t("admin.news.preview.label", "Preview") }}</div>
              <h2 class="news-preview__title">{{ article.title || article.slug }}</h2>
              <div class="news-preview__meta">
                <span class="news-preview__pill">{{ statusLabel }}</span>
                <span class="news-preview__pill">{{ article.locale.toUpperCase() }}</span>
                <span class="news-preview__pill">{{ formattedDate }}</span>
              </div>
            </div>

            <div class="news-preview__actions">
              <UiButtonDefault
                v-if="showEditButton && article.id"
                state="success"
                @click="$emit('edit', article.id)">
                <template #icon-left>
                  <UiIconEdit />
                </template>
                {{ t("admin.news.actions.editArticle", "Edit Article") }}
              </UiButtonDefault>

              <UiButtonDefault
                state="info--small"
                @click="$emit('update:modelValue', false)">
                <template #icon-left>
                  <UiIconEyeClose />
                </template>
              </UiButtonDefault>
            </div>
          </div>

          <div class="news-preview__body">
            <div class="news-preview__content">
              <img
                v-if="article.cover_image_url"
                :src="article.cover_image_url"
                :alt="article.title || article.slug"
                class="news-preview__cover" />

              <div
                v-if="article.excerpt"
                class="news-preview__excerpt">
                {{ article.excerpt }}
              </div>

              <div class="news-preview__article">
                {{ article.content }}
              </div>

              <div
                v-if="article.gallery_images?.length"
                class="news-preview__gallery">
                <div
                  v-for="image in article.gallery_images"
                  :key="image"
                  class="news-preview__gallery-item">
                  <img
                    :src="image"
                    alt="gallery image"
                    class="news-preview__gallery-image" />
                </div>
              </div>
            </div>

            <aside class="news-preview__side">
              <section class="news-preview__side-card">
                <div class="news-preview__side-title">{{ t("admin.news.preview.videoLinks", "Video links") }}</div>
                <div
                  v-if="article.video_links?.length"
                  class="news-preview__link-list">
                  <a
                    v-for="link in article.video_links"
                    :key="link"
                    :href="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="news-preview__link">
                    {{ link }}
                  </a>
                </div>
                <div
                  v-else
                  class="news-preview__empty">
                  {{ t("admin.news.preview.noVideos", "No video links attached.") }}
                </div>
              </section>

              <section class="news-preview__side-card">
                <div class="news-preview__side-title">{{ t("admin.news.preview.seo", "SEO snapshot") }}</div>

                <div class="news-preview__seo-row">
                  <span>{{ t("admin.news.seo.metaTitle", "Meta title") }}</span>
                  <strong>{{ article.seo?.meta_title || "—" }}</strong>
                </div>

                <div class="news-preview__seo-row">
                  <span>{{ t("admin.news.seo.metaDescription", "Meta description") }}</span>
                  <strong>{{ article.seo?.meta_description || "—" }}</strong>
                </div>

                <div class="news-preview__seo-row">
                  <span>{{ t("admin.news.seo.canonicalUrl", "Canonical URL") }}</span>
                  <strong>{{ article.seo?.canonical_url || "—" }}</strong>
                </div>

                <div class="news-preview__seo-row">
                  <span>{{ t("admin.news.seo.robots", "Robots") }}</span>
                  <strong>{{ article.seo?.robots || "—" }}</strong>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconEdit from "~/components/ui/UiIconEdit.vue";
  import UiIconEyeClose from "~/components/ui/UiIconEyeClose.vue";
  import type { AdminNewsArticle } from "~/composables/core/modules/news/news.types";

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      article: AdminNewsArticle | null;
      showEditButton?: boolean;
    }>(),
    {
      showEditButton: true,
    }
  );

  defineEmits<{
    "update:modelValue": [boolean];
    edit: [string];
  }>();

  const { t } = useI18n({ useScope: "global" });

  const statusLabel = computed(() => {
    const status = props.article?.effective_status || props.article?.status || "draft";
    return (
      {
        draft: t("admin.news.statuses.draft", "Draft"),
        scheduled: t("admin.news.statuses.scheduled", "Scheduled"),
        published: t("admin.news.statuses.published", "Published"),
        archived: t("admin.news.statuses.archived", "Archived"),
      }[status] || status
    );
  });

  const formattedDate = computed(() => {
    const value = props.article?.updated_at || props.article?.created_at || null;
    if (!value) {
      return t("admin.news.noDate", "No date");
    }

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  });
</script>

<style scoped lang="scss">
  .news-preview {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(5, 9, 30, 0.78);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .news-preview__dialog {
    width: min(1400px, 100%);
    max-height: min(92vh, 1100px);
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 28px;
    border-radius: 28px;
    border: 1px solid rgba(126, 145, 255, 0.2);
    background: linear-gradient(180deg, rgba(11, 20, 61, 0.98), rgba(8, 15, 44, 0.98));
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.38);
    color: var(--ui-text-main);
  }

  .news-preview__header,
  .news-preview__meta,
  .news-preview__actions,
  .news-preview__seo-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .news-preview__header {
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
  }

  .news-preview__header-copy {
    min-width: 0;
  }

  .news-preview__eyebrow {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: rgba(185, 198, 255, 0.74);
  }

  .news-preview__title {
    margin: 8px 0 0;
    color: #fff;
    font-size: clamp(1.7rem, 2.3vw, 2.45rem);
    line-height: 1.08;
  }

  .news-preview__meta {
    flex-wrap: wrap;
    margin-top: 14px;
  }

  .news-preview__pill {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(126, 145, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(229, 235, 255, 0.92);
    font-size: 0.85rem;
  }

  .news-preview__body {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.84fr);
    gap: 20px;
    min-height: 0;
    overflow: hidden;

    @media (max-width: 1120px) {
      grid-template-columns: 1fr;
      overflow: auto;
    }
  }

  .news-preview__content,
  .news-preview__side {
    min-height: 0;
    overflow: auto;
    padding-right: 4px;
  }

  .news-preview__content {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .news-preview__cover,
  .news-preview__gallery-image {
    display: block;
    width: 100%;
    object-fit: cover;
  }

  .news-preview__cover {
    max-height: 360px;
    border-radius: 20px;
    border: 1px solid rgba(126, 145, 255, 0.18);
  }

  .news-preview__excerpt {
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(126, 145, 255, 0.14);
    color: rgba(229, 235, 255, 0.9);
    font-size: 1rem;
    line-height: 1.65;
  }

  .news-preview__article {
    white-space: pre-wrap;
    padding: 22px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(126, 145, 255, 0.14);
    color: rgba(238, 242, 255, 0.92);
    line-height: 1.78;
    font-size: 1rem;
  }

  .news-preview__gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
  }

  .news-preview__gallery-item {
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.03);
  }

  .news-preview__gallery-image {
    height: 180px;
  }

  .news-preview__side {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .news-preview__side-card {
    border-radius: 20px;
    border: 1px solid rgba(126, 145, 255, 0.14);
    background: rgba(255, 255, 255, 0.035);
    padding: 18px;
  }

  .news-preview__side-title {
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .news-preview__link-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .news-preview__link {
    color: var(--ui-primary-accent);
    word-break: break-word;
    text-decoration: underline;
  }

  .news-preview__empty {
    color: rgba(199, 208, 255, 0.72);
    line-height: 1.55;
  }

  .news-preview__seo-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(126, 145, 255, 0.1);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    span {
      color: rgba(199, 208, 255, 0.72);
      font-size: 0.84rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    strong {
      color: rgba(238, 242, 255, 0.92);
      font-size: 0.95rem;
      line-height: 1.5;
      word-break: break-word;
    }
  }

  .news-preview-fade-enter-active,
  .news-preview-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .news-preview-fade-enter-from,
  .news-preview-fade-leave-to {
    opacity: 0;
  }
</style>
