import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject } from 'rxjs';
import { User } from './user.module';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registerd?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    user = new Subject<User>();

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
        ).pipe(catchError(this.handleError),
        tap(
            resData => {
                this.handleAuthedication(resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                );
            })
        );
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCaMz7T8Edxmht61pbsOxL_0atHIN5dqzw',
            {
                // tslint:disable-next-line: object-literal-shorthand
                email: email,
                // tslint:disable-next-line: object-literal-shorthand
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(this.handleError),
        tap(
            resData => {
                this.handleAuthedication(resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                );
            })
        );
    }

    private handleError(errorRes: HttpErrorResponse) {
        console.log(errorRes);
        let errorMessage = 'An unknown error occured';
        if (!errorRes.error || !errorRes.error.error) {
            console.log('YEs');
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'The Password is not correct';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'Mail does not excist';
                break;
        }
        return throwError(errorMessage);
    }

    private handleAuthedication(email: string, userId: string, token: string, expiresIn: number) {
        tap(resData => {
            const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
            const user = new User(
                email,
                userId,
                token,
                expirationDate
            );
            this.user.next(user);
        });
    }
}
