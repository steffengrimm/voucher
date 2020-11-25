import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

interface Token {
    widgetHash: string,
    orderId?: string,
    customerCaptured?: boolean,
    cartIsClosed?: boolean,
    iat: number,
    exp: number
    sub: string
}

@Injectable({
    providedIn: "root"
})
export class TokenHandler {
    constructor(private jwtHelper : JwtHelperService){}
    
    get rawToken() {
        return sessionStorage.getItem(environment.tokenName)
    }
    
    get decodedToken() : Readonly<Token> {
        return this.jwtHelper.decodeToken(this.rawToken) as Readonly<Token>;
    }

    isExpired() {
        return this.jwtHelper.isTokenExpired(this.rawToken);       
    }
}