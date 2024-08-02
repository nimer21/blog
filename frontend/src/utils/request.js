import axios from "axios";
const request = axios.create({
    baseURL: process.env.SERVER_DOMAIN, // "http://localhost:8000"
});
export default request;