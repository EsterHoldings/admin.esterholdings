import {reactive, Reactive} from "vue";

export interface IFormDataDto {
    amount: String;
    comment: String;
}

export const formData: Reactive<IFormDataDto> = reactive({
    amount: "",
    comment: "",
});
