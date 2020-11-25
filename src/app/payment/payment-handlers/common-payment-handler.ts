import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DynamicScriptLoaderService } from 'src/app/shared/dynamic-script-loader.service';
import { AppConfiguration } from 'src/app/app-config/app-config.service';
import { Observable } from 'rxjs';

interface IPaymentHandler {
    cardNumber: any;
    cardExpiry: any;
    cardCvc: any;
    formValid$ : Observable<boolean>;

    initialize(paymentIntent: string) : Promise<void>
    buildCCForm() : Promise<void>
    buildMobilePaymentForm() : Promise<void>

    mountCardNumber(domElement: any) : void;
    mountCardExpiry(domElement: any) : void;
    mountCardCvc(domElement: any) : void;

    createPaymentMethod(cardHolder: {name: string, email: string}): Promise<void>
    handlePayment(browserCallback? : Function): Promise<string>
}


export interface AbstractPaymentHandler extends IPaymentHandler{}
export abstract class AbstractPaymentHandler implements IPaymentHandler {
    protected paymentIntent : string;
    protected http: HttpClient;
    protected scriptLoader: DynamicScriptLoaderService;
    protected appConfig: AppConfiguration;

    protected publicKey: string;
    
    constructor(injector: Injector) {
        this.http = injector.get(HttpClient);
        this.scriptLoader = injector.get(DynamicScriptLoaderService);
        this.appConfig = injector.get(AppConfiguration);
    }

    async closeShoppingCart() {
        await this.http.delete(`${environment.apiUrl}closeCart`).toPromise();
    }
}