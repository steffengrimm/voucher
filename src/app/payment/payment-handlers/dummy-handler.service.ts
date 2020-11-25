import { AbstractPaymentHandler } from './common-payment-handler';
import { Injectable, Injector } from '@angular/core';
import { DynamicScriptLoaderService } from 'src/app/shared/dynamic-script-loader.service';

@Injectable()
export class DummyHandler extends AbstractPaymentHandler {
    constructor(injector: Injector) {
        super(injector);
    }
    mountCardNumber(domElement: any): void {
        throw new Error("Method not implemented.");
    }
    mountCardExpiry(domElement: any): void {
        throw new Error("Method not implemented.");
    }
    mountCardCvc(domElement: any): void {
        throw new Error("Method not implemented.");
    }
    initialize(paymentIntent: string): Promise<void> {
        return;
    }
    
    buildCCForm(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    buildMobilePaymentForm(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    createPaymentMethod(cardHolder: {name: string, email: string}): Promise<void> {
        throw new Error("Method not implemented.");
    }

    handlePayment(browserCallback?: Function): Promise<string> {
        return null;
    }
}