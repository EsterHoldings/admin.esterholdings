import {reactive, Reactive} from "vue";

export interface IFormDataDto {
  email: String;
  password: String;
  twoFaCode: String;
}

export const formData: Reactive<IFormDataDto> = reactive({
  email: "owner@gmail.com",
  password: "qwerty123456",
  twoFaCode: "",
});
