import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    constructor(private http: HttpClient) {}

    signup(email: string, password: string) {
        return this.http.
            post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBdWPSTRRjFUZgR2tB3V0GS0p-cvCqK1SU',
            {
                // tslint:disable-next-line: object-literal-shorthand
                email: email,
                // tslint:disable-next-line: object-literal-shorthand
                password: password,
                returnSecureToken: true
            }
        );
    }
}
