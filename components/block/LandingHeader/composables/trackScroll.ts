import { ref, onMounted, onBeforeUnmount } from "vue";

const isBlurred = ref(false);
export const isSlideWithoutPicture = ref(false);

export default function useTrackScroll() {
  const checkScroll = () => {
    isBlurred.value = window.scrollY > 50;
  };

  const checkPicture = (images: { src?: string }[], slide: number): boolean => {
    const noImage = !images[slide]?.src;

    isSlideWithoutPicture.value = noImage;
    return noImage;
  };

  onMounted(() => {
    window.addEventListener("scroll", checkScroll);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", checkScroll);
  });

  return {
    isBlurred,
    checkPicture,
  };
}
