import axios from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
    return config
}, (error) => {
    return Promise.reject(error)
})

axiosInstance.interceptors.response.use((response) => {
    return Promise.resolve(response)
}, (error) => {
    if (!error.response) {
        toast.error(error.message)

        toast.error("Network error. Please check your internet connection.");
    } else {
        const { status } = error;
        const errMsg = error.response.data?.message
        console.warn('Error Message', errMsg, status);

        // Handle specific status codes
        const errorOptions = {
            classNames: {

                toast: 'bg-red-500 text-white'
            }
        }
        switch (status) {
            case 400:
                toast.error(errMsg ?? "Bad Request. Please check your input.", errorOptions);

                break;
            case 401:
                toast.error(errMsg ?? "Unauthorized. Please login again.", errorOptions);
                break;
            case 403:
                toast.error(errMsg ?? "Forbidden. You do not have permission.", errorOptions);

                break;
            case 404:
                // toast.error(errMsg ?? "Not Found. The requested resource could not be found." );
                toast.error(errMsg ?? "Not Found. The requested resource could not be found.", errorOptions);
                break;
            case 500:
                toast.error(errMsg ?? "Server error. Please try again later.", errorOptions);
                break;
            default:
                toast.error(errMsg ?? "An error occurred. Please try again.", errorOptions);
        }
    }
    return Promise.reject(error);
})



export default axiosInstance