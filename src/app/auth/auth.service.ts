import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.module';
import { Router } from '@angular/router';

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
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
                private router: Router) {}

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

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }

        const loadedUser = new User(
            userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

        if ( loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if ( !this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthedication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }
}
