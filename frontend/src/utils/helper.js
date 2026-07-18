import toast from "react-hot-toast"

export const showErrorToast = (message) => {
    toast.dismiss();
    return toast.error(message)
}

export const showSuccessToast = (message) => {
    toast.dismiss();
    return toast.success(message)
}