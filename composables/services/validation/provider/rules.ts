import { isEmailRegEx } from "~/constants/validation";

export const isRequired = (value: String): Boolean => !!value;

export const isEmail = (value: any): Boolean => isEmailRegEx.test(value);

export const maxLength = (value: any, maxLengthValue: Number): Boolean =>
  value.length >= maxLengthValue;

export const minLength = (value: any, minLengthValue: Number): Boolean =>
  value.length <= minLengthValue;

export const confirmPassword = (value: any, password: String): Boolean =>
  value != password;
