import { getSessionToken, setSessionAuth, clearTabSession } from "./session";

export const getToken = () => getSessionToken();
export const setToken = (token) => setSessionAuth(token, null);
export const removeToken = () => clearTabSession();
