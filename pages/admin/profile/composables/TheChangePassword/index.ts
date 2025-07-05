import {reactive, Reactive} from "vue";

interface IFormDataDto {
  oldPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
}
export const formData: Reactive<IFormDataDto> = reactive({
  oldPassword: "",
  newPassword: "",
  newPasswordConfirmation: "",
});
