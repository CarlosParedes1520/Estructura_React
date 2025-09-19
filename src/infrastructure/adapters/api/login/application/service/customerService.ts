import HttpAuthRepository from "../../infrastructure/http_login.repository";
import AuthService from "../login.service";

export const authService = new AuthService(new HttpAuthRepository());
