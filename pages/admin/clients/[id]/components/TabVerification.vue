<template>
  <div class="verification-inner-tabs">
    <button
      v-for="tab in verificationTabs"
      :key="tab.id"
      type="button"
      class="verification-inner-tabs__btn"
      :class="{ 'verification-inner-tabs__btn--active': activeVerificationTab === tab.id }"
      @click="setVerificationTab(tab.id)">
      {{ tab.label }}
    </button>
  </div>

  <div
    ref="verificationTabSwitchRef"
    class="verification-tab-switch-anchor">
    <transition
      name="verification-tab-switch"
      mode="out-in"
      @before-leave="handleVerificationTabBeforeLeave"
      @enter="handleVerificationTabEnter"
      @after-enter="handleVerificationTabAfterEnter"
      @enter-cancelled="handleVerificationTabTransitionCancelled"
      @leave-cancelled="handleVerificationTabTransitionCancelled">
      <div
        :key="activeVerificationTab"
        class="verification-tab-switch-panel">
        <template v-if="activeVerificationTab === 'client'">
          <div class="user-verification__right">
            <div class="user-verification__right__panel user-verification__section">
              <div class="user-profile-card">
                <div class="user-profile-card__header">
                  <div>
                    <UiTextH5 class="user-profile-card__name">
                      {{ props.userData.first_name }}
                      {{ props.userData.last_name }}
                      {{ props.userData.mid_name }}
                    </UiTextH5>
                    <div class="user-profile-card__subtitle">
                      {{ props.userData.email || "-" }}
                    </div>
                  </div>
                  <div class="user-profile-card__meta">
                    <span>Дата рождения: {{ props.userData.birthdate || "-" }}</span>
                    <span>Телефон: {{ props.userData.phone || "-" }}</span>
                  </div>
                </div>

                <div class="user-profile-card__grid">
                  <div class="user-profile-card__item">
                    <span class="label">Страна</span>
                    <span class="value">{{ props.userData.country || "-" }}</span>
                  </div>
                  <div class="user-profile-card__item">
                    <span class="label">Город</span>
                    <span class="value">{{ props.userData.city || "-" }}</span>
                  </div>
                  <div class="user-profile-card__item">
                    <span class="label">Штат</span>
                    <span class="value">{{ props.userData.state || "-" }}</span>
                  </div>
                  <div class="user-profile-card__item">
                    <span class="label">Индекс</span>
                    <span class="value">{{ props.userData.postal_code || "-" }}</span>
                  </div>
                  <div class="user-profile-card__item wide">
                    <span class="label">Адрес</span>
                    <span class="value">{{ props.userData.address || "-" }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="user-verification__left">
            <div class="user-verification__section">
              <div class="user-verification__left__title__wrapper">
                <UiTextH5 class="user-verification__left__title"># {{ t("support.page.status") }}</UiTextH5>
                <UiButtonDefault
                  state="info--small"
                  class="user-verification__refresh-btn"
                  @click="handleRefreshActiveTab">
                  <UiIconUpdate v-if="!isLoading" />
                  <UiIconSpinnerDefault v-else />
                </UiButtonDefault>
              </div>

              <div class="user-verification__left__verification-list_wrapper">
                <ul class="user-verification__left__verification-list">
                  <li>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                      <UiIconSuccess
                        v-if="infoStatus === 'approved'"
                        class="user-verification__left__status-icon" />
                      <UiIconWarning
                        v-if="infoStatus === 'pending'"
                        class="user-verification__left__status-icon" />
                      <UiIconFailed
                        v-if="infoStatus === 'rejected'"
                        class="user-verification__left__status-icon" />
                      <div class="user-verification__left__verification-text">
                        <span
                          v-if="infoStatus === 'approved'"
                          class="user-verification__left__verification-title"
                          >{{ "Профиль — Успешно верифицирован!" }}</span
                        >
                        <span
                          v-if="infoStatus === 'pending'"
                          class="user-verification__left__verification-title"
                          >{{ "Профиль — Ожидает верификации!" }}</span
                        >
                        <span
                          v-if="infoStatus === 'rejected'"
                          class="user-verification__left__verification-title"
                          >{{ "Профиль — Отклонено!" }}</span
                        >
                        <span
                          v-if="infoComment"
                          class="user-verification__left__verification-comment"
                          >{{ infoComment }}</span
                        >
                      </div>
                    </div>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--actions">
                      <VerificationActions
                        :enable-comment="true"
                        :comment="infoComment"
                        :status="infoStatus"
                        :comment-open="isInfoCommentOpen"
                        @update-status="handleVerificationProfile"
                        @toggle-comment="toggleInfoComment" />
                    </div>
                    <transition name="comment-expand">
                      <div
                        v-if="isInfoCommentOpen"
                        class="user-verification__left__comment-row">
                        <div class="user-verification__left__comment-editor p-2">
                          <UiFormControl :label="t('admin.verifications.comment.label')">
                            <UiTextarea
                              :value="infoCommentDraft"
                              @input="handleInfoCommentInput"
                              class="user-verification__left__comment-textarea"
                              :placeholder="t('admin.verifications.comment.placeholder')"></UiTextarea>
                          </UiFormControl>
                          <div class="user-verification__left__comment-actions">
                            <UiButtonDefault
                              state="info--outline--small"
                              class="user-verification__left__comment-btn"
                              @click="submitInfoComment">
                              {{ t("admin.verifications.comment.save") }}
                            </UiButtonDefault>
                            <UiButtonDefault
                              state="info--outline--small"
                              class="user-verification__left__comment-btn"
                              @click="cancelInfoComment">
                              {{ t("admin.verifications.comment.close") }}
                            </UiButtonDefault>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </li>

                  <li>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                      <UiIconSuccess
                        v-if="emailStatus === 'approved'"
                        class="user-verification__left__status-icon" />
                      <UiIconWarning
                        v-if="emailStatus === 'pending'"
                        class="user-verification__left__status-icon" />
                      <UiIconFailed
                        v-if="emailStatus === 'rejected'"
                        class="user-verification__left__status-icon" />
                      <div class="user-verification__left__verification-text">
                        <span
                          v-if="emailStatus === 'approved'"
                          class="user-verification__left__verification-title"
                          >{{ "Email — Успешно верифицирован!" }}</span
                        >
                        <span
                          v-if="emailStatus === 'pending'"
                          class="user-verification__left__verification-title"
                          >{{ "Email — Ожидает подтверждения!" }}</span
                        >
                        <span
                          v-if="emailStatus === 'rejected'"
                          class="user-verification__left__verification-title"
                          >{{ "Email — Отклонено!" }}</span
                        >
                        <span
                          v-if="emailComment"
                          class="user-verification__left__verification-comment"
                          >{{ emailComment }}</span
                        >
                      </div>
                    </div>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
                  </li>

                  <li>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                      <UiIconSuccess
                        v-if="photoStatus === 'approved'"
                        class="user-verification__left__status-icon" />
                      <UiIconWarning
                        v-if="photoStatus === 'pending'"
                        class="user-verification__left__status-icon" />
                      <UiIconFailed
                        v-if="photoStatus === 'rejected'"
                        class="user-verification__left__status-icon" />
                      <div class="user-verification__left__verification-text">
                        <span
                          v-if="photoStatus === 'approved'"
                          class="user-verification__left__verification-title"
                          >{{ "Фото профиля — Успешно верифицирован!" }}</span
                        >
                        <span
                          v-if="photoStatus === 'pending'"
                          class="user-verification__left__verification-title"
                          >{{ "Фото профиля — Не загружено!" }}</span
                        >
                        <span
                          v-if="photoStatus === 'rejected'"
                          class="user-verification__left__verification-title"
                          >{{ "Фото профиля — Отклонено!" }}</span
                        >
                        <span
                          v-if="photoComment"
                          class="user-verification__left__verification-comment"
                          >{{ photoComment }}</span
                        >
                      </div>
                    </div>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
                  </li>

                  <li>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                      <UiIconSuccess
                        v-if="documentsStatus === 'approved'"
                        class="user-verification__left__status-icon" />
                      <UiIconWarning
                        v-if="documentsStatus === 'pending'"
                        class="user-verification__left__status-icon" />
                      <UiIconFailed
                        v-if="documentsStatus === 'rejected'"
                        class="user-verification__left__status-icon" />
                      <div class="user-verification__left__verification-text">
                        <span
                          v-if="documentsStatus === 'approved'"
                          class="user-verification__left__verification-title"
                          >{{ "Документы — Успешно верифицирован!" }}</span
                        >
                        <span
                          v-if="documentsStatus === 'pending'"
                          class="user-verification__left__verification-title"
                          >{{ "Документы — Ожидает верификации!" }}</span
                        >
                        <span
                          v-if="documentsStatus === 'rejected'"
                          class="user-verification__left__verification-title"
                          >{{ "Документы — Отклонено!" }}</span
                        >
                        <span
                          v-if="documentsComment"
                          class="user-verification__left__verification-comment"
                          >{{ documentsComment }}</span
                        >
                      </div>
                    </div>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--actions">
                      <VerificationActions
                        :enable-comment="true"
                        :comment="documentsComment"
                        :status="documentsStatus"
                        :comment-open="isDocumentsCommentOpen"
                        @update-status="handleVerificationDocuments"
                        @toggle-comment="toggleDocumentsComment" />
                    </div>
                    <transition name="comment-expand">
                      <div
                        v-if="isDocumentsCommentOpen"
                        class="user-verification__left__comment-row">
                        <div class="user-verification__left__comment-editor p-2">
                          <UiFormControl :label="t('admin.verifications.comment.label')">
                            <UiTextarea
                              :value="documentsCommentDraft"
                              @input="handleDocumentsCommentInput"
                              class="user-verification__left__comment-textarea"
                              :placeholder="t('admin.verifications.comment.placeholder')"></UiTextarea>
                          </UiFormControl>
                          <div class="user-verification__left__comment-actions">
                            <UiButtonDefault
                              state="info--outline--small"
                              class="user-verification__left__comment-btn"
                              @click="submitDocumentsComment">
                              {{ t("admin.verifications.comment.save") }}
                            </UiButtonDefault>
                            <UiButtonDefault
                              state="info--outline--small"
                              class="user-verification__left__comment-btn"
                              @click="cancelDocumentsComment">
                              {{ t("admin.verifications.comment.close") }}
                            </UiButtonDefault>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </li>
                  <li>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                      <UiIconSuccess
                        v-if="depositStatus === 'approved'"
                        class="user-verification__left__status-icon" />
                      <UiIconWarning
                        v-if="depositStatus === 'pending'"
                        class="user-verification__left__status-icon" />
                      <UiIconFailed
                        v-if="depositStatus === 'rejected'"
                        class="user-verification__left__status-icon" />
                      <div class="user-verification__left__verification-text">
                        <span
                          v-if="depositStatus === 'approved'"
                          class="user-verification__left__verification-title"
                          >{{ "1-й Депозит — Успешно верифицирован!" }}</span
                        >
                        <span
                          v-if="depositStatus === 'pending'"
                          class="user-verification__left__verification-title"
                          >{{ "1-й Депозит — Ожидает верификации!" }}</span
                        >
                        <span
                          v-if="depositStatus === 'rejected'"
                          class="user-verification__left__verification-title"
                          >{{ "1-й Депозит — Отклонено!" }}</span
                        >
                        <span
                          v-if="depositComment"
                          class="user-verification__left__verification-comment"
                          >{{ depositComment }}</span
                        >
                      </div>
                    </div>
                    <div
                      class="user-verification__left__verification-cell user-verification__left__verification-cell--actions"></div>
                  </li>
                </ul>
                <div
                  class="user-verification__left__verification-list--is-loading"
                  v-if="isLoading">
                  <UiIconSpinnerDefault />
                </div>
              </div>
            </div>
          </div>
          <div class="user-verification__documents user-verification__section">
            <UiTextH5 class="user-verification__documents__title"># Documents verification</UiTextH5>
            <div class="user-verification__documents__content">
              <div v-if="documentsListRequestData.length === 0">No documents...</div>
              <div
                class="document"
                v-for="documentRequestData in documentsListRequestData"
                :key="documentRequestData.id">
                <UiImage
                  class="document__image"
                  :src="documentRequestData.document_data.full_url"
                  @click="handleClientDocumentImage(documentRequestData.document_data.full_url)" />
                <div class="document__meta">
                  <span class="document__title"># {{ documentRequestData.document_data.number }}</span>
                </div>
                <div class="document__options">
                  <VerificationActions
                    :status="documentRequestData.state"
                    @update-status="handleVerificationDocument($event, documentRequestData.id)" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <div
          v-else
          class="user-verification__payout user-verification__section">
          <div class="user-verification__payout-owner">
            <div class="user-verification__payout-owner-avatar">
              <img
                v-if="payoutOwnerAvatarUrl"
                :src="payoutOwnerAvatarUrl"
                alt="Owner avatar"
                class="user-verification__payout-owner-avatar-img" />
              <span
                v-else
                class="user-verification__payout-owner-avatar-fallback">
                {{ payoutOwnerInitials }}
              </span>
            </div>
            <div class="user-verification__payout-owner-meta">
              <span class="user-verification__payout-owner-label">Владелец реквизита</span>
              <span class="user-verification__payout-owner-name">{{ payoutOwnerFullName }}</span>
              <span class="user-verification__payout-owner-email">{{ payoutOwnerEmail }}</span>
            </div>
          </div>

          <div class="user-verification__left__title__wrapper">
            <UiTextH5 class="user-verification__left__title"># Верификация реквизитов выплат</UiTextH5>
            <UiButtonDefault
              state="info--small"
              class="user-verification__refresh-btn"
              @click="handleRefreshActiveTab">
              <UiIconUpdate v-if="!isPayoutLoading" />
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>
          </div>

          <div class="user-verification__left__verification-list_wrapper">
            <ul class="user-verification__left__verification-list">
              <li
                v-for="paymentDetail in payoutDetails"
                :key="paymentDetail.id">
                <div
                  class="user-verification__left__verification-cell user-verification__left__verification-cell--status">
                  <UiIconSuccess
                    v-if="paymentDetail.status === 'approved'"
                    class="user-verification__left__status-icon" />
                  <UiIconWarning
                    v-if="paymentDetail.status === 'pending'"
                    class="user-verification__left__status-icon" />
                  <UiIconFailed
                    v-if="paymentDetail.status === 'rejected'"
                    class="user-verification__left__status-icon" />
                  <div class="user-verification__left__verification-text">
                    <span class="user-verification__left__verification-title">
                      {{ paymentDetail.name || "Реквизит без названия" }}
                    </span>
                    <span class="user-verification__left__verification-comment">
                      {{ paymentDetail.paymentSystemName || "Payment system" }} · {{ paymentDetail.updatedAt || "-" }}
                    </span>
                    <span
                      v-if="paymentDetail.adminComment"
                      class="user-verification__left__verification-admin-comment">
                      {{ paymentDetail.adminComment }}
                    </span>
                    <div
                      v-if="paymentDetail.documents.length > 0"
                      class="user-verification__left__verification-documents">
                      <div class="user-verification__left__verification-documents-meta">
                        <span class="user-verification__left__verification-documents-count">
                          Скриншотов: {{ paymentDetail.documents.length }}
                        </span>
                      </div>
                      <div class="user-verification__left__verification-documents-grid">
                        <button
                          v-for="(paymentDetailDocument, documentIndex) in paymentDetail.documents"
                          :key="paymentDetail.id + ':' + paymentDetailDocument.path + ':' + documentIndex"
                          type="button"
                          class="user-verification__left__verification-documents-thumb"
                          :class="{
                            'user-verification__left__verification-documents-thumb--loading': isPayoutDocumentLoading(
                              paymentDetail.id,
                              documentIndex
                            ),
                          }"
                          :disabled="isPayoutDocumentLoading(paymentDetail.id, documentIndex)"
                          @click.stop="handleOpenPayoutDocument(paymentDetail.id, documentIndex)">
                          <img
                            v-if="resolvePayoutDocumentPreviewSrc(paymentDetailDocument)"
                            class="user-verification__left__verification-documents-thumb-img"
                            :src="resolvePayoutDocumentPreviewSrc(paymentDetailDocument)"
                            :alt="`Скриншот #${documentIndex + 1}`" />
                          <span
                            v-else
                            class="user-verification__left__verification-documents-thumb-fallback">
                            Скрин
                          </span>
                          <span class="user-verification__left__verification-documents-thumb-index">
                            #{{ documentIndex + 1 }}
                          </span>
                        </button>
                      </div>
                    </div>
                    <span
                      v-else
                      class="user-verification__left__verification-comment">
                      Скриншот реквизитов не загружен.
                    </span>
                  </div>
                </div>
                <div
                  class="user-verification__left__verification-cell user-verification__left__verification-cell--actions user-verification__left__verification-cell--actions-payout">
                  <VerificationActions
                    :status="paymentDetail.status"
                    :enable-comment="true"
                    :comment="resolvePayoutCommentValue(paymentDetail)"
                    :comment-open="isPayoutCommentOpen(paymentDetail.id)"
                    @toggle-comment="togglePayoutComment(paymentDetail)"
                    @update-status="handleVerificationPayoutDetail($event, paymentDetail.id)" />
                  <button
                    type="button"
                    class="payout-delete-btn"
                    :disabled="isPayoutDeleting(paymentDetail.id)"
                    @click="handleDeletePayoutDetail(paymentDetail.id)">
                    <UiIconDelete v-if="!isPayoutDeleting(paymentDetail.id)" />
                    <UiIconSpinnerDefault
                      v-else
                      class="!h-[16px] !w-[16px]" />
                  </button>
                </div>
                <transition name="comment-expand">
                  <div
                    v-if="isPayoutCommentOpen(paymentDetail.id)"
                    class="user-verification__left__comment-row">
                    <div class="user-verification__left__comment-editor p-2">
                      <UiFormControl :label="t('admin.verifications.comment.label')">
                        <UiTextarea
                          :value="payoutCommentDraftMap[paymentDetail.id] || ''"
                          @input="handlePayoutCommentInput(paymentDetail.id, $event)"
                          class="user-verification__left__comment-textarea"
                          :placeholder="t('admin.verifications.comment.placeholder')"></UiTextarea>
                      </UiFormControl>
                      <div class="user-verification__left__comment-actions">
                        <UiButtonDefault
                          state="info--outline--small"
                          class="user-verification__left__comment-btn"
                          @click="submitPayoutComment(paymentDetail.id)">
                          {{ t("admin.verifications.comment.save") }}
                        </UiButtonDefault>
                        <UiButtonDefault
                          state="info--outline--small"
                          class="user-verification__left__comment-btn"
                          @click="cancelPayoutComment(paymentDetail.id)">
                          {{ t("admin.verifications.comment.close") }}
                        </UiButtonDefault>
                      </div>
                    </div>
                  </div>
                </transition>
              </li>
            </ul>

            <div
              v-if="payoutDetails.length === 0 && !isPayoutLoading"
              class="user-verification__payout-empty">
              Реквизитов для выплат пока нет.
            </div>

            <div
              v-if="isPayoutLoading"
              class="user-verification__left__verification-list--is-loading">
              <UiIconSpinnerDefault />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <div class="user-verification__panel user-verification__section">
    <UiTextH5 class="user-verification__panel__title">
      {{ activeVerificationTab === "payout" ? "# История реквизитов выплат" : "# Verification history" }}
    </UiTextH5>

    <div
      v-if="activeVerificationTab === 'payout'"
      class="user-verification__panel__payout-history">
      <div
        v-if="isPayoutHistoryLoading"
        class="user-verification__panel__verification-history_log">
        <span>Loading payout history...</span>
      </div>

      <template v-else>
        <article
          v-for="historyItem in payoutHistoryRows"
          :key="historyItem.id"
          class="user-verification__panel__payout-history-item">
          <div class="user-verification__panel__payout-history-item-top">
            <div class="user-verification__panel__payout-history-item-main">
              <div class="user-verification__panel__payout-history-item-title">{{ historyItem.name }}</div>
              <div class="user-verification__panel__payout-history-item-meta">
                {{ historyItem.date }}
                <span v-if="historyItem.actor.name">· {{ historyItem.actor.name }}</span>
              </div>
            </div>
            <span :class="historyItem.status">{{ historyItem.paymentDetail.status }}</span>
          </div>

          <div
            v-if="historyItem.comment"
            class="user-verification__panel__payout-history-item-comment">
            {{ historyItem.comment }}
          </div>

          <div
            v-if="historyItem.documents.length > 0"
            class="user-verification__panel__payout-history-item-documents">
            <button
              v-for="(historyDocument, historyDocumentIndex) in historyItem.documents"
              :key="historyItem.id + ':history-doc:' + historyDocumentIndex"
              type="button"
              class="user-verification__panel__payout-history-item-doc"
              @click="openPayoutHistoryDocument(historyDocument)">
              <img
                v-if="resolvePayoutDocumentPreviewSrc(historyDocument)"
                :src="resolvePayoutDocumentPreviewSrc(historyDocument)"
                :alt="`History document #${historyDocumentIndex + 1}`"
                class="user-verification__panel__payout-history-item-doc-img" />
              <span
                v-else
                class="user-verification__panel__payout-history-item-doc-fallback"
                >DOC</span
              >
            </button>
          </div>
        </article>

        <div
          v-if="payoutHistoryRows.length === 0"
          class="user-verification__panel__verification-history_log">
          <span>No payout history yet.</span>
        </div>
      </template>
    </div>

    <div
      v-else
      class="user-verification__panel__verification-history">
      <div
        v-for="historyItem in historyRows"
        :key="historyItem.id"
        class="user-verification__panel__verification-history_log">
        <span :class="historyItem.status">{{ historyItem.name }}</span>
        <span class="user-verification__panel__verification-history_log_time">{{ historyItem.date }}</span>
      </div>
      <div
        v-if="historyRows.length === 0"
        class="user-verification__panel__verification-history_log">
        <span>No verification history yet.</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import useAppCore from "~/composables/useAppCore";
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { useRoute } from "vue-router";

  import UiIconFailed from "~/components/ui/UiIconFailed.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconWarning from "~/components/ui/UiIconWarning.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextarea from "~/components/ui/UiTextarea.vue";
  import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
  import UiImage from "~/components/ui/UiImage.vue";

  interface VerificationSection {
    verification_status: string;
    comment: string;
  }

  interface VerificationHistoryItem {
    id: string;
    name: string;
    date: string;
    status: "approved" | "pending" | "rejected";
  }

  interface VerificationRequestDto {
    info: VerificationSection;
    photo: VerificationSection;
    email: VerificationSection;
    address: VerificationSection;
    documents: VerificationSection;
    deposit: VerificationSection;
    history?: VerificationHistoryItem[];
  }

  type AdminPaymentDetailStatus = "approved" | "pending" | "rejected";

  interface AdminPaymentDetailDocument {
    name: string;
    path: string;
    mimeType: string;
    size: number | null;
    previewUrl: string;
  }

  interface AdminPaymentDetailItem {
    id: string;
    name: string;
    status: AdminPaymentDetailStatus;
    paymentSystemName: string;
    updatedAt: string;
    adminComment: string;
    documents: AdminPaymentDetailDocument[];
  }

  interface AdminPayoutHistoryRow {
    id: string;
    key: string;
    name: string;
    date: string;
    status: AdminPaymentDetailStatus;
    comment: string;
    actor: {
      id: string;
      type: string;
      name: string;
    };
    paymentDetail: {
      id: string;
      name: string;
      status: AdminPaymentDetailStatus;
      paymentSystemName: string;
      paymentSystemId: string;
      data: Record<string, unknown>;
      comment: string;
      isDeleted: boolean;
    };
    documents: AdminPaymentDetailDocument[];
  }

  const initialData: VerificationRequestDto = {
    info: { verification_status: "pending", comment: "" },
    email: { verification_status: "pending", comment: "" },
    photo: { verification_status: "pending", comment: "" },
    address: { verification_status: "pending", comment: "" },
    documents: { verification_status: "pending", comment: "" },
    deposit: { verification_status: "pending", comment: "" },
    history: [],
  };

  const props = defineProps({
    userData: {
      type: Object,
      default: {},
    },
    clientId: {
      type: String,
      required: false,
    },
  });

  const appCore = useAppCore();
  const route = useRoute();
  const isLoading = ref(false);
  const isPayoutLoading = ref(false);
  const toast = useToast();
  let verificationRequestData = reactive<VerificationRequestDto>(initialData);
  let documentsListRequestData = reactive([]);
  const payoutDetails = ref<AdminPaymentDetailItem[]>([]);
  const { t } = useI18n({ useScope: "global" });
  const activeVerificationTab = ref<"client" | "payout">("client");
  const verificationTabs = [
    { id: "client" as const, label: "Верификация клиента" },
    { id: "payout" as const, label: "Реквизиты для выплат" },
  ];
  const VERIFICATION_TAB_SWITCH_DURATION_MS = 260;
  const VERIFICATION_TAB_MIN_BOTTOM_GAP_PX = 16;
  const VERIFICATION_TAB_MIN_HEIGHT_FALLBACK_PX = 420;
  const verificationTabSwitchRef = ref<HTMLElement | null>(null);
  let verificationTabSwitchResetTimer: ReturnType<typeof setTimeout> | null = null;
  let verificationTabSwitchMinHeightFrame: number | null = null;

  const infoStatus = ref("pending");
  const infoComment = ref("");
  const emailStatus = ref("pending");
  const emailComment = ref("");
  const photoStatus = ref("pending");
  const photoComment = ref("");
  const addressStatus = ref("pending");
  const addressComment = ref("");
  const depositStatus = ref("pending");
  const depositComment = ref("");
  const documentsStatus = ref("pending");
  const documentsComment = ref("");
  const isInfoCommentOpen = ref(false);
  const infoCommentDraft = ref("");
  const isDocumentsCommentOpen = ref(false);
  const documentsCommentDraft = ref("");
  const historyRows = ref<VerificationHistoryItem[]>([]);
  const payoutHistoryRows = ref<AdminPayoutHistoryRow[]>([]);
  const isPayoutHistoryLoading = ref(false);
  const payoutDocumentLoadingMap = reactive<Record<string, boolean>>({});
  const payoutDeleteLoadingMap = reactive<Record<string, boolean>>({});
  const payoutCommentOpenMap = reactive<Record<string, boolean>>({});
  const payoutCommentDraftMap = reactive<Record<string, string>>({});

  const clearVerificationTabSwitchResetTimer = (): void => {
    if (verificationTabSwitchResetTimer === null) {
      return;
    }

    clearTimeout(verificationTabSwitchResetTimer);
    verificationTabSwitchResetTimer = null;
  };

  const unlockVerificationTabSwitchHeight = (): void => {
    clearVerificationTabSwitchResetTimer();

    const anchor = verificationTabSwitchRef.value;
    if (!anchor) {
      return;
    }

    anchor.style.height = "";
    anchor.style.overflow = "";
  };

  const lockVerificationTabSwitchHeight = (height: number): void => {
    const anchor = verificationTabSwitchRef.value;
    if (!anchor) {
      return;
    }

    anchor.style.overflow = "hidden";
    anchor.style.height = `${Math.max(height, 0)}px`;
  };

  const scheduleVerificationTabSwitchUnlock = (): void => {
    clearVerificationTabSwitchResetTimer();
    verificationTabSwitchResetTimer = setTimeout(() => {
      unlockVerificationTabSwitchHeight();
    }, VERIFICATION_TAB_SWITCH_DURATION_MS + 60);
  };

  const handleVerificationTabBeforeLeave = (el: Element): void => {
    const panelHeight = (el as HTMLElement).offsetHeight;
    const anchorHeight = verificationTabSwitchRef.value?.offsetHeight ?? 0;
    lockVerificationTabSwitchHeight(panelHeight || anchorHeight);
  };

  const handleVerificationTabEnter = (el: Element): void => {
    requestAnimationFrame(() => {
      const nextHeight = (el as HTMLElement).offsetHeight;
      lockVerificationTabSwitchHeight(nextHeight);
      scheduleVerificationTabSwitchUnlock();
    });
  };

  const handleVerificationTabAfterEnter = (): void => {
    unlockVerificationTabSwitchHeight();
  };

  const handleVerificationTabTransitionCancelled = (): void => {
    unlockVerificationTabSwitchHeight();
  };

  const cancelVerificationTabMinHeightFrame = (): void => {
    if (verificationTabSwitchMinHeightFrame === null || typeof cancelAnimationFrame !== "function") {
      return;
    }

    cancelAnimationFrame(verificationTabSwitchMinHeightFrame);
    verificationTabSwitchMinHeightFrame = null;
  };

  const updateVerificationTabMinHeight = (): void => {
    const anchor = verificationTabSwitchRef.value;
    if (!anchor || typeof window === "undefined") {
      return;
    }

    const top = anchor.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const computedMinHeight = Math.max(
      VERIFICATION_TAB_MIN_HEIGHT_FALLBACK_PX,
      Math.round(viewportHeight - top - VERIFICATION_TAB_MIN_BOTTOM_GAP_PX)
    );

    anchor.style.minHeight = `${computedMinHeight}px`;
  };

  const scheduleVerificationTabMinHeightUpdate = (): void => {
    if (typeof window === "undefined" || typeof requestAnimationFrame !== "function") {
      return;
    }

    cancelVerificationTabMinHeightFrame();

    verificationTabSwitchMinHeightFrame = requestAnimationFrame(() => {
      updateVerificationTabMinHeight();
      verificationTabSwitchMinHeightFrame = null;
    });
  };

  const normalizePaymentStatus = (value: unknown): AdminPaymentDetailStatus => {
    if (typeof value !== "string") {
      return "pending";
    }

    const status = value.trim().toLowerCase();
    if (status === "approved" || status === "rejected") {
      return status;
    }

    return "pending";
  };

  const normalizePayoutDocuments = (value: unknown): AdminPaymentDetailDocument[] => {
    const rawItems: unknown[] = Array.isArray(value)
      ? value
      : typeof value === "object" && value !== null
        ? Object.values(value as Record<string, unknown>)
        : [];

    return rawItems
      .map(item => {
        if (typeof item !== "object" || item === null) {
          return null;
        }

        const row = item as Record<string, any>;
        const path = String(row.path ?? "");
        if (!path) {
          return null;
        }

        return {
          name: String(row.name ?? ""),
          path,
          mimeType: String(row.mime_type ?? row.mimeType ?? ""),
          size: typeof row.size === "number" ? row.size : null,
          previewUrl: String(row.preview_url ?? row.previewUrl ?? ""),
        };
      })
      .filter((item): item is AdminPaymentDetailDocument => Boolean(item));
  };

  const normalizePayoutHistoryRows = (value: unknown): AdminPayoutHistoryRow[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item: any) => {
      const paymentDetail = item?.payment_detail ?? {};

      return {
        id: String(item?.id ?? ""),
        key: String(item?.key ?? ""),
        name: String(item?.name ?? ""),
        date: String(item?.date ?? ""),
        status: normalizePaymentStatus(item?.status),
        comment: String(item?.comment ?? ""),
        actor: {
          id: String(item?.actor?.id ?? ""),
          type: String(item?.actor?.type ?? ""),
          name: String(item?.actor?.name ?? ""),
        },
        paymentDetail: {
          id: String(paymentDetail?.id ?? ""),
          name: String(paymentDetail?.name ?? ""),
          status: normalizePaymentStatus(paymentDetail?.status),
          paymentSystemName: String(paymentDetail?.payment_system_name ?? ""),
          paymentSystemId: String(paymentDetail?.payment_system_id ?? ""),
          data: paymentDetail?.data && typeof paymentDetail.data === "object" ? paymentDetail.data : {},
          comment: String(paymentDetail?.comment ?? ""),
          isDeleted: Boolean(paymentDetail?.is_deleted),
        },
        documents: normalizePayoutDocuments(item?.documents),
      };
    });
  };

  const isAbsoluteHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

  const resolvePayoutDocumentPreviewSrc = (document: AdminPaymentDetailDocument): string => {
    if (document.previewUrl) {
      return document.previewUrl;
    }

    return isAbsoluteHttpUrl(document.path) ? document.path : "";
  };

  const payoutOwnerFullName = computed<string>(() => {
    const firstName = String(props.userData?.first_name ?? "").trim();
    const lastName = String(props.userData?.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "Клиент";
  });

  const payoutOwnerEmail = computed<string>(() => String(props.userData?.email ?? "").trim() || "-");

  const payoutOwnerAvatarUrl = computed<string>(() => String(props.userData?.photo_url ?? "").trim());

  const payoutOwnerInitials = computed<string>(() => {
    const firstName = String(props.userData?.first_name ?? "").trim();
    const lastName = String(props.userData?.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean).slice(0, 2);
      const initials = parts.map(item => item.charAt(0).toUpperCase()).join("");
      if (initials) {
        return initials;
      }
    }

    const email = String(props.userData?.email ?? "").trim();
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }

    return "U";
  });

  const getPayoutDocumentLoadingKey = (paymentDetailId: string, documentIndex: number): string =>
    `${paymentDetailId}:${documentIndex}`;

  const isPayoutDocumentLoading = (paymentDetailId: string, documentIndex: number): boolean =>
    Boolean(payoutDocumentLoadingMap[getPayoutDocumentLoadingKey(paymentDetailId, documentIndex)]);

  const isPayoutDeleting = (paymentDetailId: string): boolean => Boolean(payoutDeleteLoadingMap[paymentDetailId]);

  const normalizeVerificationStatus = (value: unknown): "approved" | "pending" | "rejected" => {
    if (typeof value !== "string") {
      return "pending";
    }

    const status = value.trim().toLowerCase();
    if (status === "approved" || status === "rejected") {
      return status;
    }

    return "pending";
  };

  const parseVerificationTabFromRoute = (value: unknown): "client" | "payout" => {
    return String(value || "").toLowerCase() === "payout" ? "payout" : "client";
  };

  const parseVerificationTabFromLocation = (): "client" | "payout" => {
    if (typeof window === "undefined") {
      return parseVerificationTabFromRoute(route.query.verificationTab);
    }

    const fromUrl = new URL(window.location.href).searchParams.get("verificationTab");
    return parseVerificationTabFromRoute(fromUrl);
  };

  const syncVerificationTabInLocation = (tab: "client" | "payout"): void => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    if (tab === "client") {
      url.searchParams.delete("verificationTab");
    } else {
      url.searchParams.set("verificationTab", tab);
    }

    window.history.replaceState(window.history.state, "", url.toString());
  };

  const ensurePayoutCommentState = (rows: AdminPaymentDetailItem[]): void => {
    const activeIds = new Set(rows.map(row => row.id));

    Object.keys(payoutCommentOpenMap).forEach(id => {
      if (!activeIds.has(id)) {
        delete payoutCommentOpenMap[id];
      }
    });

    Object.keys(payoutCommentDraftMap).forEach(id => {
      if (!activeIds.has(id)) {
        delete payoutCommentDraftMap[id];
      }
    });

    rows.forEach(row => {
      if (!(row.id in payoutCommentOpenMap)) {
        payoutCommentOpenMap[row.id] = false;
      }

      if (!payoutCommentOpenMap[row.id]) {
        payoutCommentDraftMap[row.id] = row.adminComment || "";
      }
    });
  };

  const isPayoutCommentOpen = (paymentDetailId: string): boolean => Boolean(payoutCommentOpenMap[paymentDetailId]);

  const resolvePayoutCommentValue = (paymentDetail: AdminPaymentDetailItem): string => {
    if (isPayoutCommentOpen(paymentDetail.id)) {
      return String(payoutCommentDraftMap[paymentDetail.id] || "");
    }

    return String(paymentDetail.adminComment || "");
  };

  const togglePayoutComment = (paymentDetail: AdminPaymentDetailItem): void => {
    const paymentDetailId = paymentDetail.id;
    const nextState = !isPayoutCommentOpen(paymentDetailId);

    payoutCommentOpenMap[paymentDetailId] = nextState;
    payoutCommentDraftMap[paymentDetailId] = nextState
      ? String(payoutCommentDraftMap[paymentDetailId] ?? paymentDetail.adminComment ?? "")
      : String(paymentDetail.adminComment || "");
  };

  const handlePayoutCommentInput = (paymentDetailId: string, event: any): void => {
    payoutCommentDraftMap[paymentDetailId] = String(event?.target?.value ?? "");
  };

  const cancelPayoutComment = (paymentDetailId: string): void => {
    const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);

    payoutCommentOpenMap[paymentDetailId] = false;
    payoutCommentDraftMap[paymentDetailId] = String(paymentDetail?.adminComment || "");
  };

  const loadVerificationData = async () => {
    isLoading.value = true;

    try {
      const response = await appCore.adminModules.verificationRequests.get(props.clientId);
      const verificationRequestDto = response.data.data.length > 0 ? response.data.data[0] : {};
      const payloadData = verificationRequestDto?.data || {};

      Object.assign(verificationRequestData, initialData, payloadData);

      if (verificationRequestData) {
        infoStatus.value = normalizeVerificationStatus(verificationRequestData?.info?.verification_status);
        infoComment.value = verificationRequestData?.info?.comment || "";
        emailStatus.value = normalizeVerificationStatus(verificationRequestData?.email?.verification_status);
        emailComment.value = verificationRequestData?.email?.comment || "";
        photoStatus.value = normalizeVerificationStatus(verificationRequestData?.photo?.verification_status);
        photoComment.value = verificationRequestData?.photo?.comment || "";
        addressStatus.value = normalizeVerificationStatus(verificationRequestData?.address?.verification_status);
        addressComment.value = verificationRequestData?.address?.comment || "";
        depositStatus.value = normalizeVerificationStatus(verificationRequestData?.deposit?.verification_status);
        depositComment.value = verificationRequestData?.deposit?.comment || "";
        documentsStatus.value = normalizeVerificationStatus(verificationRequestData?.documents?.verification_status);
        documentsComment.value = verificationRequestData?.documents?.comment || "";
        historyRows.value = Array.isArray(verificationRequestData?.history)
          ? verificationRequestData.history.map(row => ({
              ...row,
              status: normalizeVerificationStatus(row?.status),
            }))
          : [];
      }
      const responseDocumentsRequest = await appCore.adminModules.documents.get({ clientId: props.clientId });
      documentsListRequestData.splice(0, documentsListRequestData.length, ...responseDocumentsRequest.data.data);
    } finally {
      isLoading.value = false;
    }
  };

  const loadPayoutVerificationData = async () => {
    isPayoutLoading.value = true;

    try {
      const response = await appCore.adminModules.clients.getPaymentDetails(props.clientId);
      const rawRows = Array.isArray(response?.data?.data) ? response.data.data : [];

      payoutDetails.value = rawRows.map((row: any) => ({
        id: String(row.id),
        name: String(row.name ?? ""),
        status: normalizePaymentStatus(row.status),
        paymentSystemName: String(row?.payment_system?.name ?? row?.paymentSystem?.name ?? ""),
        updatedAt: String(row.updated_at ?? ""),
        adminComment: String(row.admin_comment ?? ""),
        documents: normalizePayoutDocuments(row.documents),
      }));
      ensurePayoutCommentState(payoutDetails.value);
    } finally {
      isPayoutLoading.value = false;
    }
  };

  const loadPayoutHistoryData = async () => {
    isPayoutHistoryLoading.value = true;

    try {
      const response = await appCore.adminModules.clients.getPaymentDetailsHistory(props.clientId, {
        limit: 200,
      });
      payoutHistoryRows.value = normalizePayoutHistoryRows(response?.data?.data);
    } finally {
      isPayoutHistoryLoading.value = false;
    }
  };

  const setVerificationTab = (tab: "client" | "payout") => {
    if (activeVerificationTab.value === tab) {
      return;
    }

    activeVerificationTab.value = tab;
    syncVerificationTabInLocation(tab);
    nextTick(() => scheduleVerificationTabMinHeightUpdate());
  };

  const handleRefreshActiveTab = async () => {
    if (activeVerificationTab.value === "payout") {
      await Promise.all([loadPayoutVerificationData(), loadPayoutHistoryData()]);
      return;
    }

    await loadVerificationData();
  };

  const handleVerificationPayoutDetail = async (value: any, paymentDetailId: string) => {
    isPayoutLoading.value = true;

    try {
      const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
      const nextStatus = normalizePaymentStatus(value?.status ?? paymentDetail?.status);
      const nextComment = String(
        value?.comment ?? payoutCommentDraftMap[paymentDetailId] ?? paymentDetail?.adminComment ?? ""
      );

      await appCore.adminModules.clients.patchPaymentDetailStatus(props.clientId, paymentDetailId, {
        status: nextStatus,
        comment: nextComment,
      });
      toast.success("Payment details status updated!");
      payoutCommentOpenMap[paymentDetailId] = false;
      await Promise.all([loadPayoutVerificationData(), loadVerificationData(), loadPayoutHistoryData()]);
    } finally {
      isPayoutLoading.value = false;
    }
  };

  const submitPayoutComment = async (paymentDetailId: string): Promise<void> => {
    const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
    if (!paymentDetail) {
      return;
    }

    await handleVerificationPayoutDetail(
      {
        status: paymentDetail.status,
        comment: String(payoutCommentDraftMap[paymentDetailId] ?? ""),
      },
      paymentDetailId
    );
  };

  const handleDeletePayoutDetail = async (paymentDetailId: string): Promise<void> => {
    if (isPayoutDeleting(paymentDetailId)) {
      return;
    }

    const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
    if (!paymentDetail) {
      return;
    }

    const isConfirmed = window.confirm(
      `Удалить реквизит "${paymentDetail.name || paymentDetailId}"? Удаление будет выполнено мягко (soft delete).`
    );

    if (!isConfirmed) {
      return;
    }

    payoutDeleteLoadingMap[paymentDetailId] = true;

    try {
      await appCore.adminModules.clients.deletePaymentDetail(props.clientId, paymentDetailId);
      toast.success("Реквизит удален.");
      payoutCommentOpenMap[paymentDetailId] = false;
      await Promise.all([loadPayoutVerificationData(), loadPayoutHistoryData()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Не удалось удалить реквизит.");
    } finally {
      delete payoutDeleteLoadingMap[paymentDetailId];
    }
  };

  const handleOpenPayoutDocument = async (paymentDetailId: string, documentIndex: number) => {
    const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
    const document = paymentDetail?.documents[documentIndex];
    if (!document?.path) {
      toast.error("Документ не найден.");
      return;
    }

    if (document.previewUrl) {
      window.open(document.previewUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (isAbsoluteHttpUrl(document.path)) {
      window.open(document.path, "_blank", "noopener,noreferrer");
      return;
    }

    const loadingKey = getPayoutDocumentLoadingKey(paymentDetailId, documentIndex);
    payoutDocumentLoadingMap[loadingKey] = true;

    try {
      const response = await appCore.s3.getTempViewUrl({ path: document.path });
      const signedUrl = response?.data?.url || response?.data?.data?.url || "";
      const targetUrl = signedUrl || document.path;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("Не удалось открыть документ.");
    } finally {
      delete payoutDocumentLoadingMap[loadingKey];
    }
  };

  const openPayoutHistoryDocument = (document: AdminPaymentDetailDocument): void => {
    const targetUrl = resolvePayoutDocumentPreviewSrc(document);
    if (!targetUrl) {
      toast.error("Документ не найден.");
      return;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const toggleInfoComment = () => {
    isInfoCommentOpen.value = !isInfoCommentOpen.value;
    if (isInfoCommentOpen.value) {
      infoCommentDraft.value = infoComment.value || "";
    }
  };

  const handleInfoCommentInput = (e: any) => {
    infoCommentDraft.value = e.target.value;
  };

  const submitInfoComment = async () => {
    isInfoCommentOpen.value = false;
    await handleVerificationProfile({ status: infoStatus.value, comment: infoCommentDraft.value || "" });
  };

  const cancelInfoComment = () => {
    isInfoCommentOpen.value = false;
    infoCommentDraft.value = infoComment.value || "";
  };

  const toggleDocumentsComment = () => {
    isDocumentsCommentOpen.value = !isDocumentsCommentOpen.value;
    if (isDocumentsCommentOpen.value) {
      documentsCommentDraft.value = documentsComment.value || "";
    }
  };

  const handleDocumentsCommentInput = (e: any) => {
    documentsCommentDraft.value = e.target.value;
  };

  const submitDocumentsComment = async () => {
    isDocumentsCommentOpen.value = false;
    await handleVerificationDocuments({ status: documentsStatus.value, comment: documentsCommentDraft.value || "" });
  };

  const cancelDocumentsComment = () => {
    isDocumentsCommentOpen.value = false;
    documentsCommentDraft.value = documentsComment.value || "";
  };

  const handleVerificationDocuments = async (value: any) => {
    isLoading.value = true;
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      type: "documents",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success("Address status updated!");
    await loadVerificationData();
  };

  const handleVerificationDocument = async (value: any, docId: string = "") => {
    isLoading.value = true;
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      docId: docId,
      type: "document",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success("Document status updated!");
    await loadVerificationData();
  };

  const handleVerificationProfile = async (value: any) => {
    isLoading.value = true;
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      documentId: "",
      type: "info",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success("Address status updated!");
    await loadVerificationData();
  };

  const handleClientDocumentImage = url => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  watch(infoComment, nextValue => {
    if (!isInfoCommentOpen.value) {
      infoCommentDraft.value = nextValue || "";
    }
  });

  watch(documentsComment, nextValue => {
    if (!isDocumentsCommentOpen.value) {
      documentsCommentDraft.value = nextValue || "";
    }
  });

  watch(
    () => activeVerificationTab.value,
    () => {
      nextTick(() => scheduleVerificationTabMinHeightUpdate());
    }
  );

  const handleWindowResize = (): void => {
    scheduleVerificationTabMinHeightUpdate();
  };

  onMounted(async () => {
    activeVerificationTab.value = parseVerificationTabFromLocation();

    await Promise.all([loadVerificationData(), loadPayoutVerificationData(), loadPayoutHistoryData()]);
    nextTick(() => scheduleVerificationTabMinHeightUpdate());

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowResize, { passive: true });
    }
  });

  onBeforeUnmount(() => {
    clearVerificationTabSwitchResetTimer();
    cancelVerificationTabMinHeightFrame();

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleWindowResize);
    }
  });
</script>

<style lang="scss" scoped>
  .spacer {
    width: 90px;
    height: 20px;
    margin: 0;
  }

  .approved {
    color: var(--color-success);
  }

  .pending {
    color: var(--color-warning);
  }

  .rejected {
    color: var(--color-danger);
  }

  .verification-inner-tabs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 4px 0 14px;
    flex-wrap: wrap;
  }

  .verification-inner-tabs__btn {
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 600;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .verification-inner-tabs__btn:hover {
    color: var(--ui-text-main);
    border-color: var(--ui-primary-main);
  }

  .verification-inner-tabs__btn--active {
    background: color-mix(in srgb, var(--ui-primary-main) 22%, transparent);
    border-color: var(--ui-primary-main);
    color: var(--ui-text-main);
  }

  .verification-tab-switch-anchor {
    position: relative;
    min-height: 420px;
    transition: height 0.26s ease;
    will-change: height;
  }

  .verification-tab-switch-panel {
    width: 100%;
  }

  .verification-tab-switch-enter-active,
  .verification-tab-switch-leave-active {
    transition:
      opacity 0.26s ease,
      transform 0.26s ease;
  }

  .verification-tab-switch-enter-from,
  .verification-tab-switch-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  .verification-tab-switch-enter-to,
  .verification-tab-switch-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  .user-verification__payout-empty {
    padding: 12px;
    border-radius: 10px;
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-background-card) 72%, transparent);
    border: 0;
    margin-top: 8px;
  }

  .user-verification__payout-owner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 36%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 9%, var(--ui-background-card));
    margin-top: 0;
    margin-bottom: 12px;
  }

  .user-verification__payout-owner-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 24%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 18%, var(--ui-background));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 52px;
  }

  .user-verification__payout-owner-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-verification__payout-owner-avatar-fallback {
    font-size: 16px;
    font-weight: 700;
    color: var(--ui-text-main);
    text-transform: uppercase;
  }

  .user-verification__payout-owner-meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-verification__payout-owner-label {
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .user-verification__payout-owner-name {
    color: var(--ui-text-main);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
    word-break: break-word;
  }

  .user-verification__payout-owner-email {
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.35;
    word-break: break-word;
  }

  .user-verification__refresh-btn {
    width: 36px;
    min-width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .user-verification__refresh-btn :deep(svg) {
    width: 15px;
    height: 15px;
  }

  .user-verification__left__verification-cell--actions-payout {
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .payout-delete-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--color-danger) 40%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--color-danger) 10%, var(--ui-background-panel));
    color: var(--color-danger);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;
  }

  .payout-delete-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-danger) 18%, var(--ui-background-panel));
    border-color: color-mix(in srgb, var(--color-danger) 56%, var(--color-stroke-ui-light));
  }

  .payout-delete-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .payout-delete-btn :deep(svg) {
    width: 16px;
    height: 16px;
  }

  .user {
    &-verification {
      &__left {
        width: 100%;

        &__title {
          margin-bottom: 40px;

          &__wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
        }

        &__verification-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;

          &_wrapper {
            position: relative;
          }

          &--is-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--ui-background);
            opacity: 0.6;
            border-radius: 12px;
            backdrop-filter: blur(6px);
            z-index: 10;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          li {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: flex-start;
            gap: 12px;
            padding: 8px;
            min-height: 36px;
            background: var(--ui-background-panel);
            border-radius: 10px;
          }
        }

        &__verification-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          width: 100%;

          &--status {
            justify-content: flex-start;
            align-items: flex-start;
          }

          &--actions {
            justify-content: flex-end;
          }
        }

        &__status-icon {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
        }

        &__verification-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          width: 100%;
        }

        &__verification-title {
          display: block;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &__verification-comment {
          color: var(--ui-text-secondary);
          font-size: 12px;
          line-height: 1.4;
          white-space: normal;
        }

        &__verification-admin-comment {
          margin-top: 2px;
          color: var(--ui-text-main);
          font-size: 12px;
          line-height: 1.45;
          white-space: normal;
          padding: 6px 8px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--ui-background) 78%, transparent);
        }

        &__verification-documents {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        &__verification-documents-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        &__verification-documents-count {
          color: var(--ui-text-secondary);
          font-size: 11px;
          font-weight: 600;
        }

        &__verification-documents-grid {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: thin;
        }

        &__verification-documents-thumb {
          position: relative;
          flex: 0 0 auto;
          width: 76px;
          height: 56px;
          border-radius: 9px;
          border: 1px solid var(--color-stroke-ui-light);
          overflow: hidden;
          background: var(--ui-background);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s ease;
        }

        &__verification-documents-thumb:hover {
          border-color: var(--ui-primary-main);
        }

        &__verification-documents-thumb:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        &__verification-documents-thumb--loading {
          cursor: wait;
        }

        &__verification-documents-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &__verification-documents-thumb-fallback {
          color: var(--ui-text-secondary);
          font-size: 11px;
          font-weight: 600;
        }

        &__verification-documents-thumb-index {
          position: absolute;
          right: 4px;
          bottom: 4px;
          padding: 2px 5px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          color: var(--ui-text-main);
          background: color-mix(in srgb, var(--ui-background-panel) 82%, transparent);
        }

        &__comment-row {
          grid-column: 1 / -1;
          overflow: hidden;
          padding-left: 0;
        }

        &__comment-editor {
          background: var(--ui-background);
          border: none;
          border-radius: 12px;
          padding: 10px;
          margin-top: 6px;
          width: 100%;
        }

        &__comment-textarea {
          width: 100%;
          min-height: 60px;
          border: 1px solid var(--color-stroke-ui-dark);
          border-radius: 12px;
          padding: 10px 12px;
          background: var(--ui-background-panel);
          resize: vertical;
        }

        &__comment-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 8px;
        }

        &__comment-btn {
          width: auto;
        }
      }

      &__right {
        width: 100%;

        &__title {
          margin-bottom: 20px;
        }

        &__panel {
          &__title {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        }
      }
    }

    &-photo {
      &-uploader {
        color: var(--ui-text-main);
      }

      &__right__panel {
        color: var(--ui-text-main);
      }
    }
  }

  .user-verification__section {
    padding: 20px;
  }

  .user-profile-card {
    background: var(--ui-background-panel);
    border: 0;
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .user-profile-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .user-profile-card__name {
    color: var(--ui-text-main);
  }

  .user-profile-card__subtitle {
    color: var(--ui-text-secondary);
    font-size: 13px;
    margin-top: 4px;
  }

  .user-profile-card__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: right;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .user-profile-card__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
  }

  .user-profile-card__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-profile-card__item .label {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .user-profile-card__item .value {
    color: var(--ui-text-main);
    font-size: 14px;
    word-break: break-word;
  }

  .user-profile-card__item.wide {
    grid-column: 1 / -1;
  }

  .user-verification__right__info-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;

    li {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 8px;
      padding: 0;
    }
  }

  .user-verification__right__info-group {
    background: var(--ui-background-panel);
    border: 0;
    border-radius: 12px;
    padding: 8px;
  }

  .user-verification__right__status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 8px 12px;
    border-radius: 10px;
    border: 0;
    background: var(--ui-background-panel);
    margin-bottom: 16px;
  }

  .user-verification__right__status-row-text {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .user-verification__right__info-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    width: 100%;
    white-space: nowrap;

    &--value {
      justify-content: flex-end;

      span {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &--actions {
      display: none;
    }
  }

  .user-verification__documents {
    &__title {
      margin-bottom: 20px;
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .document {
        min-height: 120px;
        height: auto;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        background: var(--ui-background-card);
        border: 0;
        border-radius: 12px;
        padding: 12px 14px;
        user-select: none;
        position: relative;

        &__options {
          z-index: 1;
          background-color: transparent;
          position: static;
          border-radius: 0;
          height: auto;
          width: auto;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          margin-left: auto;
        }

        &__image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          flex-shrink: 0;
        }

        &__meta {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          min-width: 0;
        }

        &__title {
          color: var(--ui-text-main);
          font-weight: 600;
        }

        &:hover {
          background-color: color-mix(in srgb, var(--ui-background-card) 72%, var(--color-stroke-ui-dark));
        }

        &:active {
          opacity: 0.5;
        }
      }

      @media (max-width: 768px) {
        .document {
          flex-direction: column;
        }

        .document__options {
          width: 100%;
          align-items: flex-start;
          margin-left: 0;
        }

        .document__image {
          width: 100%;
          height: auto;
        }
      }
    }
  }

  .user-verification__panel {
    height: 100%;
    width: 100%;

    &__title {
      margin-bottom: 20px;
    }

    &__verification-history {
      padding-top: 10px;
      padding-bottom: 10px;

      &_log {
        padding: 10px;
        border-bottom: 1px solid var(--color-stroke-ui-dark);
        margin-bottom: 1px;

        display: flex;
        align-items: center;
        justify-content: space-between;

        &_time {
          font-size: 12px;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    &__payout-history {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__payout-history-item {
      border: 0;
      border-radius: 10px;
      background: var(--ui-background-card);
      padding: 10px;
    }

    &__payout-history-item-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }

    &__payout-history-item-main {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__payout-history-item-title {
      color: var(--ui-text-main);
      font-weight: 600;
      line-height: 1.4;
      word-break: break-word;
    }

    &__payout-history-item-meta {
      color: var(--ui-text-secondary);
      font-size: 12px;
      line-height: 1.3;
      word-break: break-word;
    }

    &__payout-history-item-comment {
      margin-top: 8px;
      color: var(--ui-text-main);
      font-size: 12px;
      line-height: 1.45;
      white-space: pre-wrap;
      padding: 6px 8px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
      border: 1px solid color-mix(in srgb, var(--ui-primary-main) 36%, var(--color-stroke-ui-light));
    }

    &__payout-history-item-documents {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    &__payout-history-item-doc {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      border: 1px solid var(--color-stroke-ui-light);
      background: var(--ui-background);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 0;
    }

    &__payout-history-item-doc-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__payout-history-item-doc-fallback {
      color: var(--ui-text-secondary);
      font-size: 10px;
      font-weight: 700;
    }
  }

  .user-verification__left,
  .user-verification__right,
  .user-verification__documents,
  .user-verification__panel {
    margin-top: 16px;
    color: var(--ui-text-main);
  }

  .user-verification__left {
    margin-top: 0;
  }

  .comment-expand-enter-active,
  .comment-expand-leave-active {
    transition:
      max-height 0.2s ease,
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .comment-expand-enter-from,
  .comment-expand-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(6px);
  }
  .comment-expand-enter-to,
  .comment-expand-leave-from {
    max-height: 400px;
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    .user-verification__payout-owner {
      align-items: flex-start;
    }

    .user-verification__payout-owner-avatar {
      width: 44px;
      height: 44px;
      flex-basis: 44px;
    }

    .user-profile-card__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .user-profile-card__meta {
      text-align: left;
    }

    .user-profile-card__grid {
      grid-template-columns: 1fr;
    }
    .user-verification__left__verification-list li {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 8px;
    }

    .user-verification__left__verification-cell--actions {
      width: 100%;
      justify-content: flex-start;
    }

    .user-verification__left__verification-cell--actions-payout {
      align-items: flex-start;
    }

    .user-verification__right__info-list {
      grid-template-columns: 1fr;
    }

    .user-verification__right__info-list li {
      gap: 6px;
    }

    .user-verification__right__info-cell--actions {
      width: 100%;
      justify-content: flex-start;
    }

    .user-verification__right .personal-info__item {
      flex-direction: column;
      align-items: flex-start;
      height: auto;
      gap: 4px;
    }

    .user-verification__documents__content .document {
      min-width: 0;
    }

    .user-verification__panel__verification-history_log {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .user-verification__panel__payout-history-item-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
