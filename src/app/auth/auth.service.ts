import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
            post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCaMz7T8Edxmht61pbsOxL_0atHIN5dqzw',
            {
                // tslint:disable-next-line: object-literal-shorthand
                email: email,
                // tslint:disable-next-line: object-literal-shorthand
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(errorRes => {
            console.log(errorRes);
            let errorMessage = 'An unknown error occured';
            if (!errorRes.error || !errorRes.error.error) {
                console.log('YEs');
                return throwError(errorMessage);
            }
            switch (errorRes.error.error.message) {
                case 'EMAIL_EXISTS':
                    errorMessage = 'This email exists already';
            }
            return throwError(errorMessage);
        }));
    }
}
