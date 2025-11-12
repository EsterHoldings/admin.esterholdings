import {reactive, Reactive} from "vue";

export interface IFormDataDto {
    accountId: String;
    paymentSystemId: String;
    amount: String;
    comment: String;
}

export const formData: Reactive<IFormDataDto> = reactive({
    accountId: "",
    paymentSystemId: "",
    amount: "",
    comment: "",
});
