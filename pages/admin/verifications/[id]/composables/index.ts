import {reactive, Reactive} from "vue";

export interface IFormDataDto {
  email: String;
  first_name: String,
  mid_name: String,
  last_name: String,
  birthdate: String,
  phone: String,
  country: String,
  state: String,
  city: String,
  address: String,
  postal_code: String,
}

export const formData: Reactive<IFormDataDto> = reactive({
  email: "",
  first_name: "",
  mid_name: "",
  last_name: "",
  birthdate: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  postal_code: "",
});
