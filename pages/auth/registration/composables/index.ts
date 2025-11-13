import {reactive} from "vue";

export interface IFormDataDto {
  email: String;
  password?: String;
  confirmPassword?: String;
}

export const formData = reactive({
  email: "",
  password: "",
  confirmPassword: "",
});
