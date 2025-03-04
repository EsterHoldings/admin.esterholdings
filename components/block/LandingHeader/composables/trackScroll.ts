import { ref, onMounted, onBeforeUnmount } from "vue";

export default function useTrackScroll() {
  const isBlurred = ref(false);

  const checkScroll = () => {
    isBlurred.value = window.scrollY > 10;
    console.log(
      "🟢 Скролл: ",
      window.scrollY,
      " | isBlurred:",
      isBlurred.value
    );
  };

  onMounted(() => {
    console.log("✅ useTrackScroll подключен!");
    window.addEventListener("scroll", checkScroll);
  });

  onBeforeUnmount(() => {
    console.log("🔴 useTrackScroll отключен!");
    window.removeEventListener("scroll", checkScroll);
  });

  return {
    isBlurred,
  };
}
