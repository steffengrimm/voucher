import { NgModule, APP_INITIALIZER } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt'
import { AppConfiguration } from './app-config.service';
import { JwtInterceptor } from './jwt-interceptor.service';
import { environment } from 'src/environments/environment';

function getBaseLocation(provider: AppConfiguration) {
  return provider.getBaseLocation();
}

function initializationFactory(provider: AppConfiguration) {
  return () => provider.initialize();
}

export function jwtOptionsFactory(tokenService: JwtInterceptor) {
  return {
    tokenGetter: () => {
      return tokenService.rawToken;
    },
    whitelistedDomains: environment.whitelistedJwtDomains,
    allowedDomains: environment.whitelistedJwtDomains
  }
}

@NgModule({
  imports: [
    JwtModule.forRoot({
        jwtOptionsProvider: {
          provide: JWT_OPTIONS,
          useFactory: jwtOptionsFactory,
          deps: [JwtInterceptor]
        }
    })
  ],
  providers: [
    AppConfiguration,
    JwtInterceptor,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: APP_BASE_HREF, useFactory: getBaseLocation, deps: [AppConfiguration] },
    { provide: APP_INITIALIZER, useFactory: initializationFactory, deps: [AppConfiguration], multi: true }
  ]
})
export class AppConfigModule { }
