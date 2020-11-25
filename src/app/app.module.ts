import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { ValueComponent } from './value/value.component';
import { LoginComponent } from './login/login.component';
import { PaymentComponent } from './payment/payment.component';
import { ResultComponent } from './result/result.component';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigModule } from './app-config/app-config.module';
import { SharedModule } from './shared/shared.module';
import { TopBarComponent } from './top-bar/top-bar.component';
import { FooterComponent } from './footer/footer.component';
import { ErrorComponent } from './error/error.component';
import { MainComponent } from './main/main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConcardisHandler } from './payment/payment-handlers/concardis-handler.service';
import { DummyHandler } from './payment/payment-handlers/dummy-handler.service';
import { PaypalHandler } from './payment/payment-handlers/paypal-handler.service';
import { StripeHandler } from './payment/payment-handlers/stripe-handler.service';
import { ImprintComponent } from './imprint/imprint.component';
import { CustomValueComponent } from './value/custom-value/custom-value.component';
import { CartComponent } from './cart/cart.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    ValueComponent,
    LoginComponent,
    PaymentComponent,
    ResultComponent,
    TopBarComponent,
    FooterComponent,
    ErrorComponent,
    MainComponent,
    ImprintComponent,
    CustomValueComponent,
    CartComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppConfigModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    StripeHandler,
    ConcardisHandler,
    PaypalHandler,
    DummyHandler
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
