<template>
  <section class="advantages_section">
    <div class="advantages_container">
      <div class="advantage_item">
        <UiTextH3 class="bold">10+</UiTextH3>
        <UiTextH6 class="advantage_item_subtitle"
          >Years of experience in field
        </UiTextH6>
      </div>
      <div class="divider"></div>
      <div class="advantage_item">
        <UiTextH3 class="bold">1 160 000+</UiTextH3>
        <UiTextH6 class="advantage_item_subtitle">Clients</UiTextH6>
      </div>
      <div class="divider"></div>
      <div class="advantage_item">
        <UiTextH3 class="bold">5* Rated</UiTextH3>
        <UiTextH6 class="advantage_item_subtitle">Customer service</UiTextH6>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";
</script>

<style lang="scss" scoped>
.advantages_section {
  margin-top: 150px;
  margin-bottom: 150px;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.advantages_container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  width: 100%;
}

.advantage_item {
  text-align: center;
  color: var(--ui-text-main);
  flex: 1;

  &_subtitle {
    color: var(--ui-text-secondary);
  }
}

.advantage_item h2 {
  font-size: 28px;
  font-weight: bold;
}

.advantage_item p {
  font-size: 14px;
  opacity: 0.8;
}

.divider {
  width: 1px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 991px) {
  .advantages_section {
    margin-top: 50px;
    margin-bottom: 50px;
    padding: 20px;
  }

  .advantage_item {
    h3 {
      font-size: 25px;
    }
  }
}

@media (max-width: 767px) {
  .advantage_item {
    h3 {
      font-size: 20px;
    }
  }
}

@media (max-width: 576px) {
  .advantages_section {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .advantage_item {
    h3 {
      font-size: 16px;
    }

    h6 {
      font-size: 13px;
    }
  }
}
</style>
