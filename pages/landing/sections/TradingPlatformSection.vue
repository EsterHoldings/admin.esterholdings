<template>
  <section class="trading-platform">
    <div class="trading-platform_overlay">
      <h2 class="platform-title">Trading Platform</h2>
      <p class="platform-subtitle">Level up with our products</p>

      <div class="devices">
        <!-- Основной экран -->
        <div class="device device-main">
          <img src="/static/iMac.png" alt="Trading Platform" />
          <div class="glow-label">Ester MetaTrader 4</div>
        </div>

        <!-- Ноутбук -->
        <div class="device device-laptop">
          <img src="/static/Macbook.png" alt="Laptop Trading" />
          <div class="glow-label">Ester MetaTrader 4</div>
        </div>

        <!-- Телефон -->
        <div class="device device-phone">
          <img src="/static/iPhone.png" alt="Mobile Trading" />
        </div>
      </div>

      <div class="background-glow"></div>
    </div>
  </section>
</template>

<script lang="ts">
import UiImage from "~/components/ui/UiImage.vue";
</script>

<style lang="scss" scoped>
.trading-platform {
  position: relative;
  text-align: center;
  padding: 100px 20px;
  background-image: url("/static/trading-platform-bg.webp");
  background-size: cover;
  background-position: center;
  color: white;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 40, 0.9) 0%,
      rgba(0, 0, 40, 0.7) 40%,
      rgba(0, 0, 40, 0.5) 70%,
      rgba(0, 0, 40, 0.2) 100%
    );
    backdrop-filter: blur(20px);
    z-index: 1;
  }

  &_overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 30, 0.4);
    backdrop-filter: blur(15px);
    z-index: 2;
  }
}
</style>
