import { ref, onMounted, onBeforeUnmount } from "vue";

export default function useTrackScroll() {
  const isBlurred = ref(false);

  const checkScroll = () => {
    isBlurred.value = window.scrollY > 50;
  };

  onMounted(() => {
    window.addEventListener("scroll", checkScroll);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", checkScroll);
  });

  return {
    isBlurred,
  };
}
