export const isAuthenticated = () => localStorage.getItem("AUTH_TOKEN") === null ? false : true;
export const setAuthToken = (token) => localStorage.setItem("AUTH_TOKEN", token)
export const removeAuthToken = () => localStorage.removeItem("AUTH_TOKEN")
export const getAuthToken = () => localStorage.getItem("AUTH_TOKEN")
export const setAppUser = (user) => localStorage.setItem("APP_USER", JSON.stringify(user))
export const getAppUser = () => JSON.parse(localStorage.getItem("APP_USER"))
export const removeAppUser = () => localStorage.removeItem("APP_USER")