import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(tap(evt => {
            if(evt instanceof HttpResponse) {
                if(evt.headers && evt.headers.has('x-authorization')) {
                    sessionStorage.setItem(environment.tokenName, evt.headers.get('x-authorization'));
                }
            }
        }));
    }

    get rawToken() : string {
        return sessionStorage.getItem(environment.tokenName);
    }
}