import {reactive} from "vue";

export const formData:any = reactive({
    nickname: '',
    email: '',
    password: '',
    roles: [],
})

export const errorsFormDataObject:any = reactive({
    nickname: {
        isDirty: false,
        errors: []
    },
    email: {
        isDirty: false,
        errors: []
    },
    password: {
        isDirty: false,
        errors: []
    },
    roles: {
        isDirty: false,
        errors: []
    }
})