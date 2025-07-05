import {reactive} from "vue";

export const formData:any = reactive({
    nickname: '',
    email: '',
    roles: [],
})

export const errorsFormDataObject:any = reactive({
    roles: {
        isDirty: false,
        errors: []
    }
})