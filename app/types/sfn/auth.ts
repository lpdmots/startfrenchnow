import { Base } from "../stories/adventure";

export interface SignupFormData {
    email: string;
    password1: string;
    password2: string;
    name: string;
}

export interface UserProps extends Base {
    email: string;
    password: string;
    isActive: boolean;
    name: string;
    isAdmin: boolean;
    isPremium: boolean;
    activateToken: string;
    tokenExpiration: string;
    resetPasswordToken: string;
    resetPasswordExpiration: string;
    oAuth?: string;
}
