<template>
  <section class="trading-platform">
    <div class="trading-platform_overlay">
      <div class="blur-circle"></div>
      <div class="platform-title">
        <UiTextTrading
          title="Trading Platform"
          subTitle="Level up with our products"
        />
      </div>

      <div class="devices">
        <!-- Ноутбук -->
        <div class="device device-laptop">
          <img src="/static/Macbook.png" alt="Laptop Trading" />

          <UiTextTrading
            class="device device-laptop_position"
            title="Ester MetaTrader 4"
            subTitle="The popular, classic solution"
            hasBorder
          />
        </div>
        <!-- Основной экран -->
        <div class="device device-main">
          <img src="/static/iMac.png" alt="Trading Platform" />

          <UiTextTrading
            class="device device-main_position"
            title="Ester MetaTrader 4"
            subTitle="The popular, classic solution"
            hasBorder
          />
        </div>

        <!-- Телефон -->
        <div class="device device-phone">
          <img src="/static/iPhone.png" alt="Mobile Trading" />
        </div>

        <div class="device device-ipad">
          <img src="/static/iPad.png" alt="Mobile Trading" />

          <UiTextTrading
            class="device device-ipad_position"
            title="Ester MetaTrader 4"
            subTitle="The popular, classic solution"
          />
        </div>
      </div>

      <div class="background-glow"></div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiTextTrading from "~/components/ui/UiTextTrading.vue";
</script>

<style lang="scss" scoped>
.trading-platform {
  position: relative;
  text-align: center;
  padding: 100px 20px;
  height: 635px;
  background-image: url("/static/trading-platform-bg.webp");
  background-position: left;
  background-repeat: no-repeat;

  color: white;
  overflow: hidden;

  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 40, 1) 0%,
      rgba(0, 0, 40, 0.95) 20%,
      rgba(0, 0, 40, 0.8) 50%,
      rgba(0, 0, 40, 0.95) 80%,
      rgba(0, 0, 40, 1) 100%
    );

    z-index: 1;
  }

  &_overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 30, -0.6);
    backdrop-filter: blur(15px);
    z-index: 2;
  }

  &-title {
    display: flex;
    align-items: flex-start;
  }
}

.devices {
  position: relative;
  display: flex;
  justify-content: center;

  .device-main {
    &_position {
      position: absolute;
      right: 400px;
      top: 0;
      z-index: 1;
    }
  }

  .device-laptop {
    position: absolute;
    left: 275px;
    bottom: -40px;

    &_position {
      position: absolute;
      bottom: 75px;
      left: -125px;
      z-index: 1;
    }
  }

  .device-ipad {
    position: absolute;
    right: 400px;
    bottom: -80px;
    z-index: 1;

    &_position {
      position: absolute;
      bottom: -40px;
      right: 200px;
      z-index: 1;
    }
  }

  .device-phone {
    position: absolute;

    right: 345px;
    z-index: 10;
    top: 310px;
  }
}

.platform-title {
  display: flex;
  justify-content: center;
  margin-right: 700px;
}

.blur-circle {
  position: absolute;
  width: 446px;
  height: 446px;
  background: rgb(247, 87, 9);
  filter: blur(200px);
  overflow: hidden;
  border-radius: 100%;
  right: -350px;
  top: 100px;
  z-index: 1;
  animation: pulse 5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}
</style>
