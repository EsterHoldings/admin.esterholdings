import {reactive} from "vue";

export const formData:any = reactive({
    name: '',
    permissions: []
})

export const errorsFormDataObject:any = reactive({
    name: {
        isDirty: false,
        errors: []
    },
    permissions: {
        isDirty: false,
        errors: []
    }
})