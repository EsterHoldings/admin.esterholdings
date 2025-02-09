import {reactive, Reactive} from "vue";

export interface IFormDataDto {
  email: String;
  password?: String;
}

export const formData: Reactive<IFormDataDto> = reactive({
  email: "",
  password: "",
});
