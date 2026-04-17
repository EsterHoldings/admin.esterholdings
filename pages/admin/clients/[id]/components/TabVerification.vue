<template>
  <div class="verification-tabs">
    <button
      v-for="tab in verificationTabs"
      :key="tab.id"
      type="button"
      class="verification-tabs__btn"
      :class="{
        'verification-tabs__btn--active': activeVerificationTab === tab.id,
        'verification-tabs__btn--attention': tab.needsAttention && !seenTabs[tab.id],
      }"
      @click="setVerificationTab(tab.id)"
    >
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.needsAttention && !seenTabs[tab.id]"
        class="verification-tabs__indicator"
      />
    </button>
  </div>

  <div class="verification-pane">
    <template v-if="activeVerificationTab === 'client'">
      <section
        ref="profileSectionRef"
        class="verification-card"
        :class="{ 'verification-card--highlighted': highlightedSection === 'profile' }"
      >
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconProfile />
            <div>
              <UiTextH5 class="verification-card__title">
                {{ text("admin.verifications.profile.title", "Profile") }}
              </UiTextH5>
              <div class="verification-card__subtitle">
                {{ text("admin.verifications.profile.subtitle", "Core client data used for profile verification.") }}
              </div>
            </div>
          </div>

          <div class="verification-card__actions">
            <UiButtonDefault
              state="info--small"
              class="verification-card__refresh"
              @click="handleRefreshActiveTab"
            >
              <UiIconUpdate v-if="!isLoading" />
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>

            <VerificationActions
              :enable-comment="true"
              :comment="infoComment"
              :status="infoStatus"
              :comment-open="isInfoCommentOpen"
              :disabled="!canUpdateVerifications"
              @update-status="handleVerificationProfile"
              @toggle-comment="toggleInfoComment"
            />
          </div>
        </div>

        <div class="verification-grid">
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.first_name", "First name") }}</span>
            <span class="verification-grid__value">{{ props.userData.first_name || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.last_name", "Last name") }}</span>
            <span class="verification-grid__value">{{ props.userData.last_name || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.mid_name", "Middle name") }}</span>
            <span class="verification-grid__value">{{ props.userData.mid_name || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.birthdate", "Birth date") }}</span>
            <span class="verification-grid__value">{{ props.userData.birthdate || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.phone", "Phone") }}</span>
            <span class="verification-grid__value">{{ props.userData.phone || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.email", "Email") }}</span>
            <span class="verification-grid__value">{{ props.userData.email || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.country", "Country") }}</span>
            <span class="verification-grid__value">{{ props.userData.country || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.state", "State / region") }}</span>
            <span class="verification-grid__value">{{ props.userData.state || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.city", "City") }}</span>
            <span class="verification-grid__value">{{ props.userData.city || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.postal_code", "Postal code") }}</span>
            <span class="verification-grid__value">{{ props.userData.postal_code || "-" }}</span>
          </div>
          <div class="verification-grid__item verification-grid__item--wide">
            <span class="verification-grid__label">{{ text("admin.verifications.profileFields.address", "Address") }}</span>
            <span class="verification-grid__value">{{ props.userData.address || "-" }}</span>
          </div>
        </div>

        <transition name="comment-expand">
          <div
            v-if="isInfoCommentOpen"
            class="verification-comment-box"
          >
            <UiFormControl :label="t('admin.verifications.comment.label')">
              <UiTextarea
                :value="infoCommentDraft"
                @input="handleInfoCommentInput"
                class="verification-comment-box__textarea"
                :placeholder="t('admin.verifications.comment.placeholder')"
              />
            </UiFormControl>

            <div class="verification-comment-box__actions">
              <UiButtonDefault
                state="info--outline--small"
                :disabled="!canUpdateVerifications"
                @click="submitInfoComment"
              >
                {{ t("admin.verifications.comment.save") }}
              </UiButtonDefault>
              <UiButtonDefault
                state="info--outline--small"
                @click="cancelInfoComment"
              >
                {{ t("admin.verifications.comment.close") }}
              </UiButtonDefault>
            </div>
          </div>
        </transition>
      </section>

      <section
        ref="documentsSectionRef"
        class="verification-card"
        :class="{ 'verification-card--highlighted': highlightedSection === 'documents' }"
      >
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconDocuments />
            <div>
              <UiTextH5 class="verification-card__title">
                {{ text("admin.verifications.documents.title", "Documents") }}
              </UiTextH5>
              <div class="verification-card__subtitle">
                {{ text("admin.verifications.documents.subtitle", "Passport, ID and other documents uploaded by the client.") }}
              </div>
            </div>
          </div>

          <VerificationActions
            :enable-comment="true"
            :comment="documentsComment"
            :status="documentsStatus"
            :comment-open="isDocumentsCommentOpen"
            :disabled="!canUpdateVerifications"
            @update-status="handleVerificationDocuments"
            @toggle-comment="toggleDocumentsComment"
          />
        </div>

        <transition name="comment-expand">
          <div
            v-if="isDocumentsCommentOpen"
            class="verification-comment-box"
          >
            <UiFormControl :label="t('admin.verifications.comment.label')">
              <UiTextarea
                :value="documentsCommentDraft"
                @input="handleDocumentsCommentInput"
                class="verification-comment-box__textarea"
                :placeholder="t('admin.verifications.comment.placeholder')"
              />
            </UiFormControl>

            <div class="verification-comment-box__actions">
              <UiButtonDefault
                state="info--outline--small"
                :disabled="!canUpdateVerifications"
                @click="submitDocumentsComment"
              >
                {{ t("admin.verifications.comment.save") }}
              </UiButtonDefault>
              <UiButtonDefault
                state="info--outline--small"
                @click="cancelDocumentsComment"
              >
                {{ t("admin.verifications.comment.close") }}
              </UiButtonDefault>
            </div>
          </div>
        </transition>

        <div
          v-if="documentsListRequestData.length === 0 && !isLoading"
          class="verification-card__empty"
        >
          {{ text("admin.verifications.documents.empty", "No documents uploaded.") }}
        </div>

        <div
          v-else
          class="verification-documents-grid"
        >
          <article
            v-for="documentRequestData in documentsListRequestData"
            :key="documentRequestData.id"
            class="verification-document-card"
          >
            <button
              type="button"
              class="verification-document-card__preview"
              :class="`is-${documentPreviewMeta(documentRequestData).type}`"
              @click="handleClientDocumentImage(documentRequestData.document_data.full_url)"
            >
              <img
                v-if="documentPreviewMeta(documentRequestData).type === 'image' && documentPreviewMeta(documentRequestData).src"
                :src="documentPreviewMeta(documentRequestData).src"
                :alt="documentRequestData.document_data.number || text('admin.verifications.documents.previewAlt', 'Document preview')"
              />
              <span
                v-else
                class="verification-file-badge"
                :class="`is-${documentPreviewMeta(documentRequestData).type}`"
              >
                {{ documentPreviewMeta(documentRequestData).label }}
              </span>
            </button>

            <div class="verification-document-card__meta">
              <div class="verification-document-card__title">
                {{ documentRequestData.name || documentRequestData.document_data.number || text("admin.verifications.documents.defaultName", "Document") }}
              </div>
              <div class="verification-document-card__subtitle">
                {{ documentRequestData.document_data.number || documentRequestData.id }}
              </div>
            </div>

            <VerificationActions
              :status="documentRequestData.state"
              :disabled="!canUpdateVerifications"
              @update-status="handleVerificationDocument($event, documentRequestData.id)"
            />
          </article>
        </div>
      </section>

      <section
        ref="payoutSectionRef"
        class="verification-card"
        :class="{ 'verification-card--highlighted': highlightedSection === 'payout' }"
      >
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconPaymentDetail />
            <div>
              <UiTextH5 class="verification-card__title">
                {{ text("admin.verifications.firstDeposit.title", "First deposit") }}
              </UiTextH5>
              <div class="verification-card__subtitle">
                {{ text("admin.verifications.firstDeposit.subtitle", "Calculated from the actual first client deposit.") }}
              </div>
            </div>
          </div>

          <span
            class="verification-inline-badge"
            :class="firstDeposit ? 'is-approved' : 'is-pending'"
          >
            {{ firstDeposit ? text("admin.verifications.firstDeposit.exists", "Deposit exists") : text("admin.verifications.firstDeposit.missing", "No deposit yet") }}
          </span>
        </div>

        <div
          v-if="firstDeposit"
          class="verification-grid verification-grid--compact"
        >
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.firstDeposit.amount", "Amount") }}</span>
            <span class="verification-grid__value">{{ formatMoney(firstDeposit.amount, firstDeposit.currency) }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.firstDeposit.method", "Method") }}</span>
            <span class="verification-grid__value">{{ paymentMethodName(firstDeposit) }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.firstDeposit.status", "Status") }}</span>
            <span class="verification-grid__value">{{ paymentStatusText(firstDeposit.status) }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">{{ text("admin.verifications.firstDeposit.date", "Date") }}</span>
            <span class="verification-grid__value">{{ firstDeposit.created_at || "-" }}</span>
          </div>
        </div>

        <div
          v-else
          class="verification-card__empty"
        >
          {{ text("admin.verifications.firstDeposit.empty", "The client has no deposits yet.") }}
        </div>
      </section>
    </template>

    <template v-else-if="activeVerificationTab === 'payout'">
      <section class="verification-card">
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconPaymentDetail />
            <div>
              <UiTextH5 class="verification-card__title">
                {{ text("admin.verifications.payout.title", "Payment details") }}
              </UiTextH5>
              <div class="verification-card__subtitle">
                {{ text("admin.verifications.payout.subtitle", "Review payout details and attached documents.") }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap justify-end">
            <div class="flex items-center gap-2 rounded-full border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-light)]/20 px-2 py-1">
              <button
                v-for="option in payoutArchivedFilterOptions"
                :key="option.value"
                type="button"
                class="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                :class="option.value === payoutArchivedFilter ? 'bg-[var(--ui-primary)] text-white' : 'text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-main)]'"
                @click="setPayoutArchivedFilter(option.value)"
              >
                {{ option.label }}
              </button>
            </div>

            <UiButtonDefault
              state="info--small"
              class="verification-card__refresh"
              @click="handleRefreshActiveTab"
            >
              <UiIconUpdate v-if="!isPayoutLoading" />
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>
          </div>
        </div>

        <div
          v-if="payoutDetails.length === 0 && !isPayoutLoading"
          class="verification-card__empty"
        >
          {{
            payoutArchivedFilter === "archived"
              ? text("admin.verifications.payout.emptyArchived", "There are no archived payment details yet.")
              : text("admin.verifications.payout.emptyActive", "There are no payout details yet.")
          }}
        </div>

        <div
          v-else
          class="verification-payout-list"
        >
          <article
            v-for="paymentDetail in payoutDetails"
            :key="paymentDetail.id"
            class="verification-payout-card"
          >
            <div class="verification-payout-card__header">
              <div class="verification-payout-card__title-group">
                <div class="verification-payout-card__title">{{ paymentDetail.name || text("admin.verifications.payout.untitled", "Untitled payment detail") }}</div>
                <div class="verification-payout-card__subtitle">
                  {{ paymentDetail.paymentSystemName || text("admin.verifications.payout.paymentSystem", "Payment system") }}
                  <span v-if="paymentDetail.updatedAt">· {{ paymentDetail.updatedAt }}</span>
                </div>
              </div>

              <VerificationActions
                v-if="!paymentDetail.isArchived"
                :enable-comment="true"
                :comment="resolvePayoutCommentValue(paymentDetail)"
                :comment-open="isPayoutCommentOpen(paymentDetail.id)"
                :status="paymentDetail.status"
                :disabled="!canUpdatePaymentDetails"
                @toggle-comment="togglePayoutComment(paymentDetail)"
                @update-status="handleVerificationPayoutDetail($event, paymentDetail.id)"
              />

              <UiButtonDefault
                v-if="canUpdatePaymentDetails"
                state="info--outline--small"
                @click="paymentDetail.isArchived ? handleRestorePayoutDetail(paymentDetail.id) : handleArchivePayoutDetail(paymentDetail.id)"
              >
                {{ paymentDetail.isArchived ? text("admin.verifications.payout.actions.restore", "Restore") : text("admin.verifications.payout.actions.archive", "Archive") }}
              </UiButtonDefault>
            </div>

            <div class="verification-payout-card__body">
              <div
                v-if="paymentDetailPrimaryEntries(paymentDetail).length"
                class="verification-payout-card__main"
              >
                <div
                  v-for="entry in paymentDetailPrimaryEntries(paymentDetail)"
                  :key="`${paymentDetail.id}:field:${entry.key}`"
                  class="verification-payout-card__field"
                >
                  <span class="verification-payout-card__field-label">{{ entry.label }}</span>
                  <span class="verification-payout-card__field-value">{{ entry.value }}</span>
                </div>
              </div>

              <div
                v-if="paymentDetailLegacyEntries(paymentDetail).length"
                class="verification-payout-card__legacy"
              >
                <div class="verification-payout-card__legacy-title">{{ text("admin.verifications.payout.legacy", "Legacy") }}</div>

                <div class="verification-payout-card__legacy-list">
                  <div
                    v-for="entry in paymentDetailLegacyEntries(paymentDetail)"
                    :key="`${paymentDetail.id}:legacy:${entry.key}`"
                    class="verification-payout-card__legacy-row"
                  >
                    <span class="verification-payout-card__legacy-label">{{ entry.label }}</span>
                    <span class="verification-payout-card__legacy-value">{{ entry.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <transition name="comment-expand">
              <div
                v-if="isPayoutCommentOpen(paymentDetail.id)"
                class="verification-comment-box"
              >
                <UiFormControl :label="t('admin.verifications.comment.label')">
                  <UiTextarea
                    :value="payoutCommentDraftMap[paymentDetail.id] || ''"
                    @input="handlePayoutCommentInput(paymentDetail.id, $event)"
                    class="verification-comment-box__textarea"
                    :placeholder="t('admin.verifications.comment.placeholder')"
                  />
                </UiFormControl>

                <div class="verification-comment-box__actions">
                  <UiButtonDefault
                    state="info--outline--small"
                    @click="submitPayoutComment(paymentDetail.id)"
                  >
                    {{ t("admin.verifications.comment.save") }}
                  </UiButtonDefault>
                  <UiButtonDefault
                    state="info--outline--small"
                    @click="cancelPayoutComment(paymentDetail.id)"
                  >
                    {{ t("admin.verifications.comment.close") }}
                  </UiButtonDefault>
                </div>
              </div>
            </transition>

            <div
              v-if="paymentDetail.documents.length > 0"
              class="verification-payout-card__documents"
            >
              <span class="verification-payout-card__documents-label">{{ text("admin.verifications.documents.title", "Documents") }}</span>
              <button
                v-for="(paymentDetailDocument, documentIndex) in paymentDetail.documents"
                :key="paymentDetail.id + ':' + paymentDetailDocument.path + ':' + documentIndex"
                type="button"
                class="verification-payout-card__document"
                :class="`is-${paymentDetailDocumentPreviewMeta(paymentDetailDocument).type}`"
                :disabled="isPayoutDocumentLoading(paymentDetail.id, documentIndex)"
                @click="handleOpenPayoutDocument(paymentDetail.id, documentIndex)"
              >
                <img
                  v-if="paymentDetailDocumentPreviewMeta(paymentDetailDocument).type === 'image' && paymentDetailDocumentPreviewMeta(paymentDetailDocument).src"
                  :src="paymentDetailDocumentPreviewMeta(paymentDetailDocument).src"
                  :alt="paymentDetailDocument.name || text('admin.verifications.documents.numberedPreviewAlt', 'Document #{number}', { number: documentIndex + 1 })"
                />
                <span
                  v-else
                  class="verification-file-badge"
                  :class="`is-${paymentDetailDocumentPreviewMeta(paymentDetailDocument).type}`"
                >
                  {{ paymentDetailDocumentPreviewMeta(paymentDetailDocument).label }}
                </span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="verification-requests-pane">
        <div class="verification-requests-pane__header">
          <div class="verification-card__title-group">
            <UiIconDocuments />
            <div>
              <UiTextH5 class="verification-card__title">
                {{ text("admin.verifications.clientRequests.title", "Verification requests") }}
              </UiTextH5>
              <div class="verification-card__subtitle">
                {{ text("admin.verifications.clientRequests.subtitle", "Review active client changes and the complete moderation history.") }}
              </div>
            </div>
          </div>

          <UiButtonDefault
            state="info--small"
            class="verification-card__refresh"
            @click="handleRefreshActiveTab"
          >
            <UiIconUpdate v-if="!isRequestsLoading" />
            <UiIconSpinnerDefault v-else />
          </UiButtonDefault>
        </div>

        <div
          v-if="isRequestsLoading"
          class="verification-card__empty"
        >
          {{ text("admin.verifications.clientRequests.loading", "Loading verification requests...") }}
        </div>

        <div
          v-else-if="sortedClientRequestRows.length === 0"
          class="verification-card__empty"
        >
          {{ text("admin.verifications.clientRequests.empty", "This client has no verification requests yet.") }}
        </div>

        <div
          v-else
          class="verification-client-request-list"
        >
          <article
            v-for="requestItem in sortedClientRequestRows"
            :key="requestItem.id"
            class="verification-client-request-card"
            :class="{
              'is-pending-row': requestItem.request_state === 'pending',
              'is-unread-notification': hasUnreadVerificationSignal(requestItem.user_id),
            }"
          >
            <div class="verification-client-request-card__body">
              <div class="verification-client-request-card__top">
                <div class="verification-client-request-card__title-wrap">
                  <div class="verification-client-request-card__title">
                    #{{ shortId(requestItem.id) }}
                  </div>
                  <span
                    class="verification-inline-badge"
                    :class="requestStateClass(requestItem.request_state)"
                  >
                    {{ requestStateText(requestItem.request_state) }}
                  </span>
                </div>

                <div class="verification-client-request-card__meta">
                  {{ requestItem.updated_at_human || requestItem.updated_at || "-" }}
                </div>
              </div>

              <div class="verification-client-request-card__focus">
                <template v-if="requestFocusItems(requestItem).length">
                  <button
                    v-for="item in requestFocusItems(requestItem)"
                    :key="`${requestItem.id}:${item.id}`"
                    type="button"
                    class="verification-focus-link"
                    :class="{ 'is-unread': hasUnreadVerificationSignal(requestItem.user_id, item.section) }"
                    @click="navigateToVerificationSection(item.section)"
                  >
                    {{ item.label }}
                  </button>
                </template>
                <span
                  v-else
                  class="verification-client-request-card__focus-muted"
                >
                  {{ text("admin.verifications.changes.none", "No active changes marked for review") }}
                </span>
              </div>

              <div class="verification-client-request-card__previews">
                <span
                  v-for="(preview, previewIndex) in requestDocumentPreviews(requestItem)"
                  :key="`${requestItem.id}:doc-preview:${previewIndex}:${preview.src || preview.label}`"
                  class="verification-preview-chip"
                  :class="`is-${preview.type}`"
                >
                  <img
                    v-if="preview.type === 'image' && preview.src"
                    :src="preview.src"
                    :alt="text('admin.verifications.documents.previewAlt', 'Document preview')"
                  />
                  <span
                  v-else
                  class="verification-file-badge"
                  :class="`is-${preview.type}`"
                >
                  {{ preview.label }}
                  </span>
                </span>

                <span
                  v-for="(preview, previewIndex) in requestPayoutPreviews(requestItem)"
                  :key="`${requestItem.id}:payout-preview:${previewIndex}:${preview.src || preview.label}`"
                  class="verification-preview-chip"
                  :class="`is-${preview.type}`"
                >
                  <img
                    v-if="preview.type === 'image' && preview.src"
                    :src="preview.src"
                    :alt="text('admin.verifications.payout.previewAlt', 'Payment detail preview')"
                  />
                  <span
                    v-else
                    class="verification-file-badge"
                    :class="`is-${preview.type}`"
                  >
                  {{ preview.label }}
                </span>
              </span>
            </div>

              <div class="verification-client-request-history">
                <div class="verification-client-request-history__header">
                  <div>
                    <strong>{{ text("admin.verifications.history.title", "Request history") }}</strong>
                    <span>{{ text("admin.verifications.history.subtitle", "Newest actions are shown first.") }}</span>
                  </div>
                </div>

                <div
                  v-if="visibleVerificationHistoryRows.length === 0"
                  class="verification-client-request-history__empty"
                >
                  {{ text("admin.verifications.history.empty", "No history yet.") }}
                </div>

                <div
                  v-else
                  class="verification-client-request-history__list"
                >
                  <article
                    v-for="historyRow in visibleVerificationHistoryRows"
                    :key="historyRow.id"
                    class="verification-client-request-history__row"
                  >
                    <div class="verification-client-request-history__row-main">
                      <span
                        class="verification-inline-badge"
                        :class="requestStateClass(historyRow.status)"
                      >
                        {{ statusText(historyRow.status) }}
                      </span>
                      <div>
                        <strong>{{ historyRow.name }}</strong>
                        <span>{{ historyActorText(historyRow) }} · {{ historyRow.date || "-" }}</span>
                      </div>
                    </div>

                    <div
                      v-if="historyChangeRows(historyRow).length"
                      class="verification-client-request-history__changes"
                    >
                      <div
                        v-for="change in historyChangeRows(historyRow)"
                        :key="`${historyRow.id}:${change.field}`"
                        class="verification-client-request-history__change"
                      >
                        <span>{{ profileFieldLabel(change.field) }}</span>
                        <strong>{{ formatHistoryValue(change.old) }} → {{ formatHistoryValue(change.new) }}</strong>
                      </div>
                    </div>

                    <div
                      v-if="historyDocumentPreviews(historyRow).length"
                      class="verification-client-request-history__documents"
                    >
                      <button
                        v-for="preview in historyDocumentPreviews(historyRow)"
                        :key="`${historyRow.id}:${preview.id}`"
                        type="button"
                        class="verification-client-request-history__document"
                        @click="handleClientDocumentImage(preview.url)"
                      >
                        <img
                          v-if="preview.preview.type === 'image' && preview.preview.src"
                          :src="preview.preview.src"
                          :alt="preview.label"
                        />
                        <span
                          v-else
                          class="verification-file-badge"
                          :class="`is-${preview.preview.type}`"
                        >
                          {{ preview.preview.label }}
                        </span>
                      </button>
                    </div>
                  </article>

                  <button
                    v-if="hasMoreVerificationHistory"
                    type="button"
                    class="verification-client-request-history__load"
                    @click="loadMoreVerificationHistory"
                  >
                    {{ text("admin.verifications.history.loadMore", "Load more") }}
                  </button>
                </div>
              </div>
            </div>

            <VerificationRequestStateActions
              :state="requestItem.request_state"
              :disabled="isRequestUpdating(requestItem.id)"
              @update-state="handleRequestReviewUpdate(requestItem.id, $event)"
            />
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import VerificationRequestStateActions from "~/components/block/verification/VerificationRequestStateActions.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";

type VerificationTab = "client" | "payout" | "requests";
type VerificationSectionTarget = "profile" | "documents" | "payout";
type VerificationStatus = "approved" | "pending" | "rejected";
type RequestReviewState = "pending" | "approved" | "rejected";
type AdminPaymentDetailStatus = "approved" | "pending" | "rejected";

interface VerificationSection {
  verification_status: string;
  comment: string;
}

interface VerificationRequestDto {
  info: VerificationSection;
  email: VerificationSection;
  photo: VerificationSection;
  documents: VerificationSection;
  deposit: VerificationSection;
}

interface VerificationDocumentItem {
  id: string;
  name: string;
  state: VerificationStatus;
  comment: string;
  document_data: {
    number: string;
    full_url: string;
  };
}

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
  deletedAt: string;
  isArchived: boolean;
  adminComment: string;
  data: Record<string, unknown>;
  documents: AdminPaymentDetailDocument[];
}

interface PaymentRow {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  payment_gateway: string;
  payment_system_name: string;
  legacy_payment_system_name: string;
}

interface ClientVerificationRequestRow {
  id: string;
  user_id: string;
  state: VerificationStatus;
  request_state: RequestReviewState;
  profile_review_required: boolean;
  documents_review_count: number;
  requisites_review_count: number;
  updated_at: string | null;
  updated_at_human: string | null;
}

interface VerificationHistoryRow {
  id: string;
  key: string;
  name: string;
  date: string;
  status: VerificationStatus;
  actor: {
    id: string;
    type: string;
    name: string;
  };
  data: Record<string, any>;
}

interface VerificationHistoryChange {
  field: string;
  old: unknown;
  new: unknown;
}

type VerificationPreviewKind = "image" | "pdf" | "text" | "file";

interface VerificationPreviewMeta {
  type: VerificationPreviewKind;
  src: string;
  label: string;
}

interface AdminVerificationUnreadNotification {
  id: string;
  userId: string;
  section: VerificationSectionTarget;
}

const initialData: VerificationRequestDto = {
  info: { verification_status: "pending", comment: "" },
  email: { verification_status: "pending", comment: "" },
  photo: { verification_status: "pending", comment: "" },
  documents: { verification_status: "pending", comment: "" },
  deposit: { verification_status: "pending", comment: "" },
};

const props = defineProps({
  userData: {
    type: Object,
    default: () => ({}),
  },
  clientId: {
    type: String,
    required: false,
  },
});

const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();
const adminNotificationsStore = useAdminNotificationsStore();
const route = useRoute();
const toast = useToast();
const { t, te } = useI18n({ useScope: "global" });
const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
const ADMIN_NOTIFICATIONS_MARKED_EVENT = "admin-notifications-marked";
const VERIFICATION_NOTIFICATION_TYPE = "verification.request.created";

const isLoading = ref(false);
const isPayoutLoading = ref(false);
const isRequestsLoading = ref(false);
const activeVerificationTab = ref<VerificationTab>("client");
const payoutArchivedFilter = ref<"active" | "archived" | "all">("active");

const verificationRequestData = reactive<VerificationRequestDto>({ ...initialData });
const documentsListRequestData = ref<VerificationDocumentItem[]>([]);
const payoutDetails = ref<AdminPaymentDetailItem[]>([]);
const firstDeposit = ref<PaymentRow | null>(null);
const clientRequestRows = ref<ClientVerificationRequestRow[]>([]);
const verificationHistoryRows = ref<VerificationHistoryRow[]>([]);
const verificationHistoryVisibleCount = ref(10);
const requestUpdatingState = reactive<Record<string, boolean>>({});
const highlightedSection = ref<VerificationSectionTarget | null>(null);
const profileSectionRef = ref<HTMLElement | null>(null);
const documentsSectionRef = ref<HTMLElement | null>(null);
const payoutSectionRef = ref<HTMLElement | null>(null);

const infoStatus = ref<VerificationStatus>("pending");
const infoComment = ref("");
const documentsStatus = ref<VerificationStatus>("pending");
const documentsComment = ref("");
const isInfoCommentOpen = ref(false);
const infoCommentDraft = ref("");
const isDocumentsCommentOpen = ref(false);
const documentsCommentDraft = ref("");
const payoutDocumentLoadingMap = reactive<Record<string, boolean>>({});
const payoutCommentOpenMap = reactive<Record<string, boolean>>({});
const payoutCommentDraftMap = reactive<Record<string, string>>({});
const unreadVerificationNotifications = ref<AdminVerificationUnreadNotification[]>([]);
const seenTabs = reactive<Record<VerificationTab, boolean>>({
  client: false,
  payout: false,
  requests: false,
});

const canUpdateVerifications = computed(
  () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-verifications")
);

const canUpdatePaymentDetails = computed(
  () =>
    adminAuthStore.hasRole("super-admin")
    || adminAuthStore.hasPermission("update-client-payment-details")
    || adminAuthStore.hasPermission("update-clients")
);

const payoutArchivedFilterOptions = computed(() => [
  { value: "active" as const, label: text("admin.verifications.payout.filters.active", "Active") },
  { value: "archived" as const, label: text("admin.verifications.payout.filters.archived", "Archived") },
  { value: "all" as const, label: text("admin.verifications.payout.filters.all", "All") },
]);

const text = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
  te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

const normalizeVerificationStatus = (value: unknown): VerificationStatus => {
  if (typeof value !== "string") {
    return "pending";
  }

  const status = value.trim().toLowerCase();
  if (status === "approved" || status === "rejected") {
    return status;
  }

  return "pending";
};

const normalizeRequestReviewState = (value: unknown): RequestReviewState => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
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

const normalizeClientRequests = (payload: any): ClientVerificationRequestRow[] => {
  const rows = Array.isArray(payload?.data?.data) ? payload.data.data : [];

  return rows.map((row: any) => ({
    id: String(row?.id ?? ""),
    user_id: String(row?.user_id ?? ""),
    state: normalizeVerificationStatus(row?.state),
    request_state: normalizeRequestReviewState(row?.request_state),
    profile_review_required: Boolean(row?.profile_review_required),
    documents_review_count: Number(row?.documents_review_count ?? 0),
    requisites_review_count: Number(row?.requisites_review_count ?? 0),
    updated_at: row?.updated_at ? String(row.updated_at) : null,
    updated_at_human: row?.updated_at_human ? String(row.updated_at_human) : null,
  }));
};

const normalizeVerificationHistoryRows = (payload: unknown): VerificationHistoryRow[] => {
  const rows = Array.isArray(payload) ? payload : [];

  return rows.map((row: any) => ({
    id: String(row?.id ?? `${row?.key ?? "history"}-${row?.date ?? ""}`),
    key: String(row?.key ?? ""),
    name: String(row?.name ?? ""),
    date: String(row?.date ?? ""),
    status: normalizeVerificationStatus(row?.status),
    actor: {
      id: String(row?.actor?.id ?? ""),
      type: String(row?.actor?.type ?? ""),
      name: String(row?.actor?.name ?? ""),
    },
    data: row?.data && typeof row.data === "object" ? row.data : {},
  }));
};

const parseVerificationTabFromRoute = (value: unknown): VerificationTab => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "payout") {
    return "payout";
  }

  if (normalized === "requests") {
    return "requests";
  }

  return "client";
};

const parseVerificationSection = (value: unknown): VerificationSectionTarget | null => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "profile" || normalized === "documents" || normalized === "payout") {
    return normalized;
  }

  return null;
};

const mapNotificationStepToSection = (value: unknown): VerificationSectionTarget => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "documents") {
    return "documents";
  }

  if (normalized === "payout") {
    return "payout";
  }

  return "profile";
};

const normalizeUnreadVerificationNotification = (raw: any): AdminVerificationUnreadNotification | null => {
  const id = String(raw?.id ?? "").trim();
  const type = String(raw?.type ?? "").trim();
  const payload = raw?.payload && typeof raw.payload === "object" ? raw.payload : null;
  const userId = String(payload?.user_id ?? "").trim();
  const readAt = raw?.read_at ? String(raw.read_at).trim() : "";
  const isUnread = raw?.is_unread ?? readAt === "";

  if (id === "" || type !== VERIFICATION_NOTIFICATION_TYPE || userId === "" || !isUnread) {
    return null;
  }

  return {
    id,
    userId,
    section: mapNotificationStepToSection(payload?.step),
  };
};

const upsertUnreadVerificationNotification = (notification: AdminVerificationUnreadNotification): void => {
  const index = unreadVerificationNotifications.value.findIndex(item => item.id === notification.id);
  if (index === -1) {
    unreadVerificationNotifications.value.unshift(notification);
    return;
  }

  unreadVerificationNotifications.value.splice(index, 1, notification);
};

const removeUnreadVerificationNotifications = (ids: string[]): void => {
  if (ids.length === 0) {
    return;
  }

  const idSet = new Set(ids);
  unreadVerificationNotifications.value = unreadVerificationNotifications.value.filter(item => !idSet.has(item.id));
};

const hasUnreadVerificationSignal = (userId: string, section?: VerificationSectionTarget): boolean =>
  unreadVerificationNotifications.value.some(item =>
    item.userId === userId && (section === undefined || item.section === section)
  );

const loadUnreadVerificationNotifications = async (): Promise<void> => {
  try {
    const response = await appCore.adminModules.notifications.get({
      page: 1,
      perPage: 100,
    });

    const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
    unreadVerificationNotifications.value = rows
      .map(normalizeUnreadVerificationNotification)
      .filter((item: AdminVerificationUnreadNotification | null): item is AdminVerificationUnreadNotification => Boolean(item))
      .filter(item => item.userId === props.clientId);
  } catch {
    unreadVerificationNotifications.value = [];
  }
};

const parseVerificationTabFromLocation = (): VerificationTab => {
  if (typeof window === "undefined") {
    return parseVerificationTabFromRoute(route.query.verificationTab);
  }

  const fromUrl = new URL(window.location.href).searchParams.get("verificationTab");
  return parseVerificationTabFromRoute(fromUrl);
};

const syncVerificationLocation = (tab: VerificationTab, section: VerificationSectionTarget | null = null): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (tab === "client") {
    url.searchParams.delete("verificationTab");
  } else {
    url.searchParams.set("verificationTab", tab);
  }

  if (section === null) {
    url.searchParams.delete("verificationSection");
  } else {
    url.searchParams.set("verificationSection", section);
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

const getPayoutDocumentLoadingKey = (paymentDetailId: string, documentIndex: number): string =>
  `${paymentDetailId}:${documentIndex}`;

const isPayoutDocumentLoading = (paymentDetailId: string, documentIndex: number): boolean =>
  Boolean(payoutDocumentLoadingMap[getPayoutDocumentLoadingKey(paymentDetailId, documentIndex)]);

const isAbsoluteHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"];
const textExtensions = ["txt", "text", "md", "csv", "json", "xml", "log"];

const extractFileExtension = (value: string): string => {
  const normalized = String(value || "").split("?")[0].split("#")[0].trim().toLowerCase();
  const segments = normalized.split(".");

  return segments.length > 1 ? segments.pop() || "" : "";
};

const resolvePreviewKind = (source: {
  src?: string;
  path?: string;
  mimeType?: string;
  name?: string;
}): VerificationPreviewKind => {
  const mimeType = String(source.mimeType || "").trim().toLowerCase();

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.includes("pdf")) {
    return "pdf";
  }

  if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml")) {
    return "text";
  }

  const extension = extractFileExtension(source.src || source.path || source.name || "");

  if (imageExtensions.includes(extension)) {
    return "image";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (textExtensions.includes(extension)) {
    return "text";
  }

  return "file";
};

const resolvePreviewLabel = (kind: VerificationPreviewKind): string => {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "text":
      return "TXT";
    case "file":
      return "FILE";
    default:
      return "IMG";
  }
};

const buildPreviewMeta = (source: {
  src?: string;
  path?: string;
  mimeType?: string;
  name?: string;
}): VerificationPreviewMeta => {
  const type = resolvePreviewKind(source);

  return {
    type,
    src: type === "image" ? String(source.src || source.path || "").trim() : "",
    label: resolvePreviewLabel(type),
  };
};

const resolvePayoutDocumentPreviewSrc = (document: AdminPaymentDetailDocument): string => {
  if (document.previewUrl) {
    return document.previewUrl;
  }

  return isAbsoluteHttpUrl(document.path) ? document.path : "";
};

const documentPreviewMeta = (document: VerificationDocumentItem): VerificationPreviewMeta =>
  buildPreviewMeta({
    src: document.document_data.full_url,
    name: document.name || document.document_data.number,
  });

const paymentDetailDocumentPreviewMeta = (document: AdminPaymentDetailDocument): VerificationPreviewMeta =>
  buildPreviewMeta({
    src: resolvePayoutDocumentPreviewSrc(document),
    path: document.path,
    mimeType: document.mimeType,
    name: document.name,
  });

const loadVerificationData = async () => {
  isLoading.value = true;

  try {
    const [verificationResponse, documentsResponse, paymentsResponse] = await Promise.all([
      appCore.adminModules.verificationRequests.get(props.clientId),
      appCore.adminModules.documents.get({ clientId: props.clientId }),
      appCore.payments.get({
        page: 1,
        perPage: 1,
        orderBy: "created_at",
        orderDirection: "asc",
        ["filters[user_id]"]: props.clientId,
        ["filters[type]"]: "deposit",
      }),
    ]);

    const verificationRequestDto = Array.isArray(verificationResponse?.data?.data) ? verificationResponse.data.data[0] : null;
    const payloadData = verificationRequestDto?.data || {};

    Object.assign(verificationRequestData, initialData, payloadData);
    verificationHistoryRows.value = normalizeVerificationHistoryRows(payloadData?.history);
    verificationHistoryVisibleCount.value = Math.min(Math.max(verificationHistoryVisibleCount.value, 10), Math.max(verificationHistoryRows.value.length, 10));

    infoStatus.value = normalizeVerificationStatus(verificationRequestData?.info?.verification_status);
    infoComment.value = verificationRequestData?.info?.comment || "";
    documentsStatus.value = normalizeVerificationStatus(verificationRequestData?.documents?.verification_status);
    documentsComment.value = verificationRequestData?.documents?.comment || "";

    documentsListRequestData.value = Array.isArray(documentsResponse?.data?.data)
      ? documentsResponse.data.data.map((row: any) => ({
          id: String(row?.id ?? ""),
          name: String(row?.name ?? ""),
          state: normalizeVerificationStatus(row?.state),
          comment: String(row?.comment ?? ""),
          document_data: {
            number: String(row?.document_data?.number ?? ""),
            full_url: String(row?.document_data?.full_url ?? ""),
          },
        }))
      : [];

    const paymentRows = Array.isArray(paymentsResponse?.data?.data?.data)
      ? paymentsResponse.data.data.data
      : [];

    firstDeposit.value = paymentRows.length > 0
      ? {
          id: String(paymentRows[0]?.id ?? ""),
          type: String(paymentRows[0]?.type ?? ""),
          status: String(paymentRows[0]?.status ?? ""),
          amount: Number(paymentRows[0]?.amount ?? 0),
          currency: String(paymentRows[0]?.currency ?? "USD"),
          created_at: String(paymentRows[0]?.created_at ?? ""),
          payment_gateway: String(paymentRows[0]?.payment_gateway ?? ""),
          payment_system_name: String(paymentRows[0]?.payment_system_name ?? ""),
          legacy_payment_system_name: String(paymentRows[0]?.legacy_payment_system_name ?? ""),
        }
      : null;
  } finally {
    isLoading.value = false;
  }
};

const loadPayoutVerificationData = async () => {
  isPayoutLoading.value = true;

  try {
    const response = await appCore.adminModules.clients.getPaymentDetails(props.clientId, {
      archived: payoutArchivedFilter.value,
    });
    const rawRows = Array.isArray(response?.data?.data) ? response.data.data : [];

    payoutDetails.value = rawRows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      status: normalizePaymentStatus(row.status),
      paymentSystemName: String(row?.payment_system?.name ?? row?.paymentSystem?.name ?? ""),
      updatedAt: String(row.updated_at ?? ""),
      deletedAt: String(row.deleted_at ?? ""),
      isArchived: Boolean(row.is_archived ?? row.deleted_at),
      adminComment: String(row.admin_comment ?? ""),
      data: row?.data && typeof row.data === "object" ? row.data : {},
      documents: normalizePayoutDocuments(row.documents),
    }));

    ensurePayoutCommentState(payoutDetails.value);
  } finally {
    isPayoutLoading.value = false;
  }
};

const loadClientVerificationRequests = async () => {
  isRequestsLoading.value = true;

  try {
    const response = await appCore.adminModules.verificationRequests.getAll({
      page: 1,
      perPage: 50,
      userId: props.clientId,
      orderBy: "updated_at",
      orderDirection: "desc",
    });

    clientRequestRows.value = normalizeClientRequests(response?.data?.data ?? {});
  } finally {
    isRequestsLoading.value = false;
  }
};

const requestStateRank = (state: RequestReviewState): number => {
  switch (state) {
    case "pending":
      return 0;
    case "approved":
      return 1;
    case "rejected":
      return 2;
  }
};

const sortedClientRequestRows = computed(() =>
  [...clientRequestRows.value].sort((left, right) => {
    const rankDiff = requestStateRank(left.request_state) - requestStateRank(right.request_state);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    return new Date(right.updated_at || 0).getTime() - new Date(left.updated_at || 0).getTime();
  })
);

const requestHasProfileToReview = (request: ClientVerificationRequestRow): boolean =>
  request.profile_review_required;

const requestHasDocumentsToReview = (request: ClientVerificationRequestRow): boolean =>
  request.documents_review_count > 0;

const requestHasPayoutToReview = (request: ClientVerificationRequestRow): boolean =>
  request.requisites_review_count > 0;

const activePendingRequest = computed(() =>
  sortedClientRequestRows.value.find(request => request.request_state === "pending") ?? null
);

const hasPendingProfile = computed(() => Boolean(activePendingRequest.value && requestHasProfileToReview(activePendingRequest.value)));
const hasPendingDocuments = computed(() => Boolean(activePendingRequest.value && requestHasDocumentsToReview(activePendingRequest.value)));
const hasPendingPayout = computed(() => Boolean(activePendingRequest.value && requestHasPayoutToReview(activePendingRequest.value)));
const hasPendingRequests = computed(() => clientRequestRows.value.some(request => request.request_state === "pending"));
const hasUnreadProfileSignals = computed(() => hasUnreadVerificationSignal(props.clientId, "profile"));
const hasUnreadDocumentsSignals = computed(() => hasUnreadVerificationSignal(props.clientId, "documents"));
const hasUnreadPayoutSignals = computed(() => hasUnreadVerificationSignal(props.clientId, "payout"));
const hasUnreadRequestSignals = computed(() => hasUnreadVerificationSignal(props.clientId));

const requestFocusItems = (request: ClientVerificationRequestRow): Array<{
  id: VerificationSectionTarget;
  label: string;
  section: VerificationSectionTarget;
}> => {
  const items: Array<{
    id: VerificationSectionTarget;
    label: string;
    section: VerificationSectionTarget;
  }> = [];

  if (requestHasProfileToReview(request)) {
    items.push({
      id: "profile",
      label: text("admin.verifications.changes.profile", "Profile data changed"),
      section: "profile",
    });
  }

  if (requestHasDocumentsToReview(request)) {
    items.push({
      id: "documents",
      label: text("admin.verifications.changes.documents", "{count} document(s) uploaded", {
        count: request.documents_review_count,
      }),
      section: "documents",
    });
  }

  if (requestHasPayoutToReview(request)) {
    items.push({
      id: "payout",
      label: text("admin.verifications.changes.requisites", "{count} payment detail(s) changed", {
        count: request.requisites_review_count,
      }),
      section: "payout",
    });
  }

  return items;
};

const currentRequestDocumentPreviews = computed(() =>
  documentsListRequestData.value
    .map(documentPreviewMeta)
    .slice(0, 2)
);

const currentRequestPayoutPreviews = computed(() =>
  payoutDetails.value
    .flatMap(paymentDetail => paymentDetail.documents)
    .map(paymentDetailDocumentPreviewMeta)
    .slice(0, 2)
);

const requestDocumentPreviews = (request: ClientVerificationRequestRow): VerificationPreviewMeta[] =>
  requestHasDocumentsToReview(request) ? currentRequestDocumentPreviews.value : [];

const requestPayoutPreviews = (request: ClientVerificationRequestRow): VerificationPreviewMeta[] =>
  requestHasPayoutToReview(request) ? currentRequestPayoutPreviews.value : [];

const visibleVerificationHistoryRows = computed(() =>
  verificationHistoryRows.value.slice(0, verificationHistoryVisibleCount.value)
);

const hasMoreVerificationHistory = computed(() =>
  verificationHistoryRows.value.length > verificationHistoryVisibleCount.value
);

const loadMoreVerificationHistory = (): void => {
  verificationHistoryVisibleCount.value += 10;
};

const historyChangeRows = (row: VerificationHistoryRow): VerificationHistoryChange[] => {
  const changes = Array.isArray(row.data?.changes) ? row.data.changes : [];

  return changes
    .map((change: any) => ({
      field: String(change?.field ?? ""),
      old: change?.old ?? null,
      new: change?.new ?? null,
    }))
    .filter(change => change.field !== "");
};

const historyDocumentPreviews = (row: VerificationHistoryRow): Array<{
  id: string;
  label: string;
  url: string;
  preview: VerificationPreviewMeta;
}> => {
  const documentIds = Array.isArray(row.data?.document_ids)
    ? row.data.document_ids.map((id: unknown) => String(id ?? "")).filter(Boolean)
    : [];

  if (documentIds.length === 0) {
    return [];
  }

  const idSet = new Set(documentIds);

  return documentsListRequestData.value
    .filter(document => idSet.has(document.id))
    .map(document => ({
      id: document.id,
      label: document.name || document.document_data.number || document.id,
      url: document.document_data.full_url,
      preview: documentPreviewMeta(document),
    }));
};

const profileFieldLabel = (field: string): string => {
  const key = `admin.verifications.profileFields.${field}`;
  return text(key, normalizePaymentLabel(field));
};

const formatHistoryValue = (value: unknown): string => {
  const normalized = String(value ?? "").trim();
  return normalized !== "" ? normalized : "-";
};

const historyActorText = (row: VerificationHistoryRow): string => {
  const actorName = row.actor.name.trim();
  if (actorName) {
    return actorName;
  }

  if (row.actor.type === "admin") {
    return text("admin.verifications.history.actorAdmin", "Admin");
  }

  if (row.actor.type === "client") {
    return text("admin.verifications.history.actorClient", "Client");
  }

  return text("admin.verifications.history.actorSystem", "System");
};

const verificationTabs = computed(() => [
  {
    id: "client" as const,
    label: text("admin.verifications.tabs.client", "General verification"),
    needsAttention: hasPendingProfile.value || hasPendingDocuments.value || hasUnreadProfileSignals.value || hasUnreadDocumentsSignals.value,
  },
  {
    id: "payout" as const,
    label: text("admin.verifications.tabs.payout", "Payment details"),
    needsAttention: hasPendingPayout.value || hasUnreadPayoutSignals.value,
  },
  {
    id: "requests" as const,
    label: text("admin.verifications.tabs.requests", "Requests"),
    needsAttention: hasPendingRequests.value || hasUnreadRequestSignals.value,
  },
]);

const markTabSeen = (tab: VerificationTab): void => {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      seenTabs[tab] = true;
    });

    return;
  }

  seenTabs[tab] = true;
};

const resolveSectionElement = (section: VerificationSectionTarget): HTMLElement | null => {
  switch (section) {
    case "profile":
      return profileSectionRef.value;
    case "documents":
      return documentsSectionRef.value;
    case "payout":
      return payoutSectionRef.value;
  }
};

const isVerificationSectionStillPending = (section: VerificationSectionTarget): boolean => {
  const request = activePendingRequest.value;

  if (!request) {
    return false;
  }

  switch (section) {
    case "profile":
      return requestHasProfileToReview(request);
    case "documents":
      return requestHasDocumentsToReview(request);
    case "payout":
      return requestHasPayoutToReview(request);
  }
};

const clearResolvedHighlight = (): void => {
  const section = highlightedSection.value;

  if (section !== null && !isVerificationSectionStillPending(section)) {
    highlightedSection.value = null;
  }
};

const focusVerificationSection = (section: VerificationSectionTarget): void => {
  if (clientRequestRows.value.length > 0 && !isVerificationSectionStillPending(section)) {
    highlightedSection.value = null;
    return;
  }

  highlightedSection.value = section;
  resolveSectionElement(section)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

const markRelevantVerificationNotificationsSeen = async (section: VerificationSectionTarget): Promise<void> => {
  const targetIds = unreadVerificationNotifications.value
    .filter(item => item.userId === props.clientId && item.section === section)
    .map(item => item.id);

  if (targetIds.length === 0) {
    return;
  }

  let latestSummary: Record<string, unknown> | null = null;

  for (const notificationId of targetIds) {
    try {
      const response = await appCore.adminModules.notifications.markRead(notificationId);
      latestSummary = response?.data?.data ?? latestSummary;
    } catch {
      // no-op
    }
  }

  removeUnreadVerificationNotifications(targetIds);

  if (latestSummary) {
    adminNotificationsStore.applySummary(latestSummary);
  }

  useEventBus.emit(ADMIN_NOTIFICATIONS_MARKED_EVENT, {
    ids: targetIds,
    summary: latestSummary ?? undefined,
  });
};

const navigateToVerificationSection = async (section: VerificationSectionTarget): Promise<void> => {
  const targetTab: VerificationTab = section === "payout" ? "payout" : "client";

  if (activeVerificationTab.value !== targetTab) {
    activeVerificationTab.value = targetTab;
  }

  syncVerificationLocation(targetTab, section);

  await nextTick();
  markTabSeen(targetTab);
  focusVerificationSection(section);
  await markRelevantVerificationNotificationsSeen(section);
};

const setVerificationTab = (tab: VerificationTab) => {
  if (activeVerificationTab.value === tab) {
    return;
  }

  activeVerificationTab.value = tab;
  syncVerificationLocation(tab, null);

  void nextTick(() => {
    markTabSeen(tab);
    if (tab === "payout") {
      void markRelevantVerificationNotificationsSeen("payout");
    }
  });
};

const handleRefreshActiveTab = async () => {
  if (activeVerificationTab.value === "payout") {
    await loadPayoutVerificationData();
    return;
  }

  if (activeVerificationTab.value === "requests") {
    await loadClientVerificationRequests();
    return;
  }

  await loadVerificationData();
};

const toggleInfoComment = () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isInfoCommentOpen.value = !isInfoCommentOpen.value;
  if (isInfoCommentOpen.value) {
    infoCommentDraft.value = infoComment.value || "";
  }
};

const handleInfoCommentInput = (e: any) => {
  infoCommentDraft.value = e.target.value;
};

const submitInfoComment = async () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isInfoCommentOpen.value = false;
  await handleVerificationProfile({ status: infoStatus.value, comment: infoCommentDraft.value || "" });
};

const cancelInfoComment = () => {
  isInfoCommentOpen.value = false;
  infoCommentDraft.value = infoComment.value || "";
};

const toggleDocumentsComment = () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isDocumentsCommentOpen.value = !isDocumentsCommentOpen.value;
  if (isDocumentsCommentOpen.value) {
    documentsCommentDraft.value = documentsComment.value || "";
  }
};

const handleDocumentsCommentInput = (e: any) => {
  documentsCommentDraft.value = e.target.value;
};

const submitDocumentsComment = async () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isDocumentsCommentOpen.value = false;
  await handleVerificationDocuments({ status: documentsStatus.value, comment: documentsCommentDraft.value || "" });
};

const cancelDocumentsComment = () => {
  isDocumentsCommentOpen.value = false;
  documentsCommentDraft.value = documentsComment.value || "";
};

const handleVerificationDocuments = async (value: any) => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isLoading.value = true;

  try {
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      type: "documents",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success(text("admin.verifications.messages.documentsUpdated", "Documents status updated."));
    await loadVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isLoading.value = false;
  }
};

const handleVerificationDocument = async (value: any, docId: string = "") => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isLoading.value = true;

  try {
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      docId,
      type: "document",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success(text("admin.verifications.messages.documentUpdated", "Document status updated."));
    await loadVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isLoading.value = false;
  }
};

const handleVerificationProfile = async (value: any) => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isLoading.value = true;

  try {
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      type: "info",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success(text("admin.verifications.messages.profileUpdated", "Profile status updated."));
    await loadVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isLoading.value = false;
  }
};

const togglePayoutComment = (paymentDetail: AdminPaymentDetailItem): void => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

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

const handleVerificationPayoutDetail = async (value: any, paymentDetailId: string) => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

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
    toast.success(text("admin.verifications.messages.payoutUpdated", "Payment details status updated."));
    payoutCommentOpenMap[paymentDetailId] = false;
    await loadPayoutVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isPayoutLoading.value = false;
  }
};

const setPayoutArchivedFilter = async (value: "active" | "archived" | "all") => {
  if (payoutArchivedFilter.value === value) {
    return;
  }

  payoutArchivedFilter.value = value;
  await loadPayoutVerificationData();
};

const handleArchivePayoutDetail = async (paymentDetailId: string) => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  isPayoutLoading.value = true;

  try {
    await appCore.adminModules.clients.deletePaymentDetail(props.clientId, paymentDetailId);
    toast.success(text("admin.verifications.messages.payoutArchived", "Payment detail archived."));
    await loadPayoutVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isPayoutLoading.value = false;
  }
};

const handleRestorePayoutDetail = async (paymentDetailId: string) => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  isPayoutLoading.value = true;

  try {
    await appCore.adminModules.clients.restorePaymentDetail(props.clientId, paymentDetailId);
    toast.success(text("admin.verifications.messages.payoutRestored", "Payment detail restored."));
    await loadPayoutVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isPayoutLoading.value = false;
  }
};

const submitPayoutComment = async (paymentDetailId: string): Promise<void> => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

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

const handleOpenPayoutDocument = async (paymentDetailId: string, documentIndex: number) => {
  const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
  const document = paymentDetail?.documents[documentIndex];
  if (!document?.path) {
    toast.error(text("admin.verifications.errors.documentNotFound", "Document not found."));
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
  } catch {
    toast.error(text("admin.verifications.errors.openDocument", "Failed to open document."));
  } finally {
    delete payoutDocumentLoadingMap[loadingKey];
  }
};

const handleRequestReviewUpdate = async (
  requestId: string,
  nextState: Exclude<RequestReviewState, "pending">
): Promise<void> => {
  requestUpdatingState[requestId] = true;

  try {
    await appCore.adminModules.verificationRequests.put(requestId, {
      type: "request",
      updatedStatus: { status: nextState, comment: "" },
    });

    toast.success(text("admin.verifications.messages.updated", "Request status updated."));
    await Promise.all([loadVerificationData(), loadPayoutVerificationData(), loadClientVerificationRequests()]);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || text("admin.verifications.errors.update", "Failed to update request status."));
  } finally {
    delete requestUpdatingState[requestId];
  }
};

const isRequestUpdating = (requestId: string): boolean => Boolean(requestUpdatingState[requestId]);

const paymentDetailPrimaryEntries = (paymentDetail: AdminPaymentDetailItem): Array<{ key: string; label: string; value: string }> => {
  const fieldsPayload = paymentDetail.data?.fields;
  const source = fieldsPayload && typeof fieldsPayload === "object" && !Array.isArray(fieldsPayload)
    ? fieldsPayload as Record<string, unknown>
    : Object.fromEntries(
        Object.entries(paymentDetail.data || {}).filter(([key]) => !["fields", "legacy"].includes(key))
      );

  return Object.entries(source)
    .map(([key, rawValue]) => ({
      key,
      label: paymentFieldLabel(key),
      value: formatPaymentValue(rawValue),
    }))
    .filter(entry => entry.value !== "");
};

const paymentDetailLegacyEntries = (paymentDetail: AdminPaymentDetailItem): Array<{ key: string; label: string; value: string }> => {
  const legacy = paymentDetail.data?.legacy;
  if (!legacy || typeof legacy !== "object" || Array.isArray(legacy)) {
    return [];
  }

  const legacyPayload = legacy as Record<string, unknown>;
  const rows: Array<{ key: string; label: string; value: string }> = [];
  const paysystem = legacyPayload.paysystem && typeof legacyPayload.paysystem === "object" && !Array.isArray(legacyPayload.paysystem)
    ? legacyPayload.paysystem as Record<string, unknown>
    : null;

  const systemName = formatPaymentValue(paysystem?.name);
  if (systemName) {
    rows.push({ key: "paysystem", label: text("admin.verifications.payout.legacyFields.system", "System"), value: systemName });
  }

  const legacyType = formatPaymentValue(legacyPayload.type);
  if (legacyType) {
    rows.push({ key: "type", label: text("admin.verifications.payout.legacyFields.type", "Type"), value: legacyType });
  }

  const legacyStatus = formatPaymentValue(legacyPayload.status);
  if (legacyStatus) {
    rows.push({ key: "status", label: text("admin.verifications.payout.legacyFields.status", "Legacy status"), value: legacyStatus });
  }

  const legacyId = formatPaymentValue(legacyPayload.old_requisite_id);
  if (legacyId) {
    rows.push({ key: "old_requisite_id", label: text("admin.verifications.payout.legacyFields.id", "Legacy ID"), value: legacyId });
  }

  const legacyComment = formatPaymentValue(legacyPayload.comment);
  if (legacyComment) {
    rows.push({ key: "comment", label: text("admin.verifications.payout.legacyFields.comment", "Legacy comment"), value: legacyComment });
  }

  return rows;
};

const normalizePaymentLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();

const paymentFieldLabel = (value: string): string =>
  text(`admin.verifications.payout.fields.${value}`, normalizePaymentLabel(value));

const formatPaymentValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(item => formatPaymentValue(item)).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(item => formatPaymentValue(item))
      .filter(Boolean)
      .join(", ");
  }

  return String(value ?? "").trim();
};

const shortId = (value: string): string => String(value || "").replace(/-/g, "").slice(0, 10).toUpperCase();

const formatMoney = (amount: number | string, currency: string): string => {
  const numeric = Number(amount ?? 0);
  const normalizedCurrency = String(currency || "USD").trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${normalizedCurrency}`;
  }
};

const paymentMethodName = (payment: PaymentRow | null): string => {
  if (!payment) {
    return "-";
  }

  return (
    String(payment.legacy_payment_system_name || "").trim()
    || String(payment.payment_system_name || "").trim()
    || String(payment.payment_gateway || "").trim()
    || text("admin.verifications.firstDeposit.methodFallback", "Deposit")
  );
};

const paymentStatusText = (status: string): string => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "success" || normalized === "completed") {
    return text("admin.verifications.status.approved", "Approved");
  }
  if (normalized === "rejected" || normalized === "failed" || normalized === "cancelled") {
    return text("admin.verifications.status.rejected", "Rejected");
  }

  return text("admin.verifications.status.pending", "Pending");
};

const requestStateText = (state: RequestReviewState): string => {
  switch (state) {
    case "approved":
      return text("admin.verifications.requestState.approved", "Confirmed");
    case "rejected":
      return text("admin.verifications.requestState.rejected", "Cancelled");
    default:
      return text("admin.verifications.requestState.pending", "Unprocessed");
  }
};

const statusText = (status: VerificationStatus): string => {
  switch (status) {
    case "approved":
      return text("admin.verifications.status.approved", "Approved");
    case "rejected":
      return text("admin.verifications.status.rejected", "Rejected");
    default:
      return text("admin.verifications.status.pending", "Pending");
  }
};

const requestStateClass = (state: RequestReviewState): string => `is-${state}`;

const handleClientDocumentImage = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const handleAdminNotificationReceived = (payload?: { notification?: any }): void => {
  const notification = normalizeUnreadVerificationNotification(payload?.notification ?? null);
  if (!notification || notification.userId !== props.clientId) {
    return;
  }

  upsertUnreadVerificationNotification(notification);

  if (notification.section === "payout") {
    void Promise.all([loadPayoutVerificationData(), loadClientVerificationRequests()]).then(async () => {
      if (activeVerificationTab.value === "payout") {
        await nextTick();
        await markRelevantVerificationNotificationsSeen("payout");
      }
    });

    return;
  }

  void Promise.all([loadVerificationData(), loadClientVerificationRequests()]).then(async () => {
    if (activeVerificationTab.value === "client") {
      await nextTick();
      await markRelevantVerificationNotificationsSeen(notification.section);
    }
  });
};

const handleMarkedNotifications = (payload?: { ids?: string[] }): void => {
  const ids = Array.isArray(payload?.ids)
    ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean)
    : [];

  removeUnreadVerificationNotifications(ids);
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
  () => route.query.verificationTab,
  nextValue => {
    const nextTab = parseVerificationTabFromRoute(nextValue);
    if (nextTab !== activeVerificationTab.value) {
      activeVerificationTab.value = nextTab;
      void nextTick(() => {
        markTabSeen(nextTab);
      });
    }
  }
);

watch(
  () => route.query.verificationSection,
  nextValue => {
    const nextSection = parseVerificationSection(nextValue);
    if (!nextSection) {
      return;
    }

    void nextTick(async () => {
      focusVerificationSection(nextSection);
      await markRelevantVerificationNotificationsSeen(nextSection);
    });
  }
);

watch(
  () => [
    hasPendingProfile.value,
    hasPendingDocuments.value,
    hasPendingPayout.value,
  ],
  clearResolvedHighlight
);

onMounted(async () => {
  activeVerificationTab.value = parseVerificationTabFromLocation();

  useEventBus.on(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
  useEventBus.on(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);

  await Promise.all([
    loadVerificationData(),
    loadPayoutVerificationData(),
    loadClientVerificationRequests(),
    loadUnreadVerificationNotifications(),
  ]);

  await nextTick();
  markTabSeen(activeVerificationTab.value);

  const initialSection = parseVerificationSection(route.query.verificationSection);
  if (initialSection) {
    focusVerificationSection(initialSection);
    await markRelevantVerificationNotificationsSeen(initialSection);
  } else if (activeVerificationTab.value === "payout") {
    await markRelevantVerificationNotificationsSeen("payout");
  }
});

onBeforeUnmount(() => {
  useEventBus.off(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
  useEventBus.off(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
});
</script>

<style lang="scss" scoped>
.verification-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.verification-tabs__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ui-text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  transition:
    background-color 0.24s ease,
    border-color 0.24s ease,
    color 0.24s ease,
    box-shadow 0.24s ease;
}

.verification-tabs__btn:hover {
  color: var(--ui-text-main);
  border-color: rgba(73, 108, 222, 0.26);
}

.verification-tabs__btn--active {
  color: var(--ui-text-main);
  border-color: rgba(73, 108, 222, 0.42);
  background: rgba(73, 108, 222, 0.14);
}

.verification-tabs__btn--attention {
  border-color: rgba(233, 174, 0, 0.28);
  box-shadow: 0 0 0 1px rgba(233, 174, 0, 0.12);
}

.verification-tabs__indicator {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #f1c24d;
  transition: opacity 0.32s ease;
}

.verification-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.verification-requests-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verification-requests-pane__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
}

.verification-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.28s ease, box-shadow 0.28s ease;
}

.verification-card--highlighted {
  border-color: rgba(73, 108, 222, 0.46);
  box-shadow: 0 0 0 1px rgba(73, 108, 222, 0.16), 0 18px 44px rgba(6, 18, 63, 0.18);
}

.verification-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-card__title-group {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.verification-card__title-group svg {
  width: 15px;
  height: 15px;
  margin-top: 4px;
}

.verification-card__title {
  color: var(--ui-text-main);
}

.verification-card__subtitle {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
}

.verification-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-card__refresh {
  flex-shrink: 0;
}

.verification-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.verification-grid--compact {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.verification-grid__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-grid__item--wide {
  grid-column: span 2;
}

.verification-grid__label {
  font-size: 0.74rem;
  color: var(--ui-text-secondary);
}

.verification-grid__value {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ui-text-main);
  word-break: break-word;
}

.verification-comment-box {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.verification-comment-box__textarea {
  min-height: 96px;
}

.verification-comment-box__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}

.verification-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  color: var(--ui-text-secondary);
  font-size: 0.86rem;
}

.verification-documents-grid,
.verification-payout-list,
.verification-client-request-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verification-document-card,
.verification-client-request-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease;
}

.verification-payout-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-document-card__preview {
  width: 76px;
  height: 76px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-text-secondary);
  font-size: 0.68rem;
}

.verification-document-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-document-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.verification-document-card__title,
.verification-payout-card__title,
.verification-client-request-card__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-document-card__subtitle,
.verification-payout-card__subtitle,
.verification-client-request-card__meta {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
}

.verification-payout-card__header,
.verification-client-request-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-payout-card__title-group,
.verification-client-request-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.verification-payout-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(220px, 0.95fr);
  gap: 12px;
  align-items: start;
}

.verification-payout-card__main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.verification-payout-card__field,
.verification-payout-card__legacy {
  min-height: 78px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-payout-card__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.verification-payout-card__field-label,
.verification-payout-card__legacy-label,
.verification-payout-card__documents-label {
  font-size: 0.72rem;
  color: var(--ui-text-secondary);
}

.verification-payout-card__field-value,
.verification-payout-card__legacy-value {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--ui-text-main);
  word-break: break-word;
}

.verification-payout-card__legacy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verification-payout-card__legacy-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-payout-card__legacy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.verification-payout-card__legacy-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.verification-payout-card__documents,
.verification-client-request-card__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.verification-payout-card__documents {
  align-items: center;
}

.verification-payout-card__document,
.verification-preview-chip {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--ui-text-secondary);
  font-size: 0.64rem;
}

.verification-document-card__preview.is-pdf,
.verification-payout-card__document.is-pdf,
.verification-preview-chip.is-pdf {
  border-color: rgba(220, 38, 38, 0.18);
}

.verification-document-card__preview.is-text,
.verification-payout-card__document.is-text,
.verification-preview-chip.is-text {
  border-color: rgba(73, 108, 222, 0.2);
}

.verification-file-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  min-height: 100%;
  padding: 0 6px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--ui-text-main);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
}

.verification-file-badge.is-pdf {
  color: #ff8b8b;
}

.verification-file-badge.is-text {
  color: #8db5ff;
}

.verification-file-badge.is-file {
  color: var(--ui-text-secondary);
}

.verification-payout-card__document img,
.verification-preview-chip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-inline-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ui-text-main);
}

.verification-inline-badge.is-approved {
  background: rgba(22, 163, 74, 0.16);
  border-color: rgba(22, 163, 74, 0.28);
}

.verification-inline-badge.is-pending {
  background: rgba(233, 174, 0, 0.14);
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-inline-badge.is-rejected {
  background: rgba(220, 38, 38, 0.16);
  border-color: rgba(220, 38, 38, 0.28);
}

.verification-focus-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(233, 174, 0, 0.14);
  border: 1px solid rgba(233, 174, 0, 0.22);
  color: #f1c24d;
  font-size: 0.75rem;
  font-weight: 600;
}

.verification-focus-link {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(233, 174, 0, 0.12);
  border: 1px solid rgba(233, 174, 0, 0.24);
  color: #f1c24d;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.verification-focus-link:hover {
  transform: translateY(-1px);
  background: rgba(233, 174, 0, 0.18);
  border-color: rgba(233, 174, 0, 0.34);
}

.verification-focus-link.is-unread {
  background: rgba(87, 132, 255, 0.14);
  border-color: rgba(87, 132, 255, 0.32);
  color: #b7cbff;
}

.verification-client-request-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.verification-client-request-card__focus {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.verification-client-request-card__focus-muted {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
}

.verification-client-request-history {
  display: grid;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-stroke-ui-light);
}

.verification-client-request-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.verification-client-request-history__header > div,
.verification-client-request-history__row-main > div {
  display: grid;
  gap: 2px;
}

.verification-client-request-history__header strong,
.verification-client-request-history__row-main strong {
  color: var(--ui-text-main);
  font-size: 0.82rem;
}

.verification-client-request-history__header span,
.verification-client-request-history__row-main span {
  color: var(--ui-text-secondary);
  font-size: 0.72rem;
}

.verification-client-request-history__empty {
  color: var(--ui-text-secondary);
  font-size: 0.78rem;
}

.verification-client-request-history__list {
  display: grid;
  gap: 8px;
}

.verification-client-request-history__row {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 72%, transparent);
}

.verification-client-request-history__row-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.verification-client-request-history__changes {
  display: grid;
  gap: 6px;
}

.verification-client-request-history__change {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--ui-text-secondary);
  font-size: 0.76rem;
}

.verification-client-request-history__change strong {
  color: var(--ui-text-main);
  text-align: right;
}

.verification-client-request-history__documents {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.verification-client-request-history__document {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  background: color-mix(in srgb, var(--ui-background-panel) 78%, transparent);
}

.verification-client-request-history__document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-client-request-history__load {
  justify-self: center;
  color: var(--ui-primary-main);
  font-size: 0.76rem;
  font-weight: 800;
}

.verification-client-request-history__load:hover {
  text-decoration: underline;
}

.verification-client-request-card.is-pending-row {
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-client-request-card.is-unread-notification {
  border-color: rgba(87, 132, 255, 0.38);
  box-shadow: 0 0 0 1px rgba(87, 132, 255, 0.16), 0 10px 28px rgba(16, 38, 120, 0.12);
}

.comment-expand-enter-active,
.comment-expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.comment-expand-enter-from,
.comment-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1100px) {
  .verification-grid,
  .verification-grid--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .verification-card__header,
  .verification-client-request-card,
  .verification-document-card {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .verification-card__actions,
  .verification-client-request-card > :deep(.request-review-actions) {
    align-self: flex-start;
  }

  .verification-payout-card__header,
  .verification-payout-card__body {
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 680px) {
  .verification-grid,
  .verification-grid--compact {
    grid-template-columns: 1fr;
  }

  .verification-grid__item--wide {
    grid-column: span 1;
  }

  .verification-payout-card__main {
    grid-template-columns: 1fr;
  }
}
</style>
