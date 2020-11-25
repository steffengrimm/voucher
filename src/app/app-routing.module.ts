import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfiguration } from './app-config/app-config.service';
import { CanActivateAfterLayout, CanActivateBase, CanActivateCheckout, CanActivateOrderProgress, CanActivateResult } from './app-config/route-guards.service';
import { ErrorComponent } from './error/error.component';

import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { PaymentComponent, paymentRequestButtonChecker } from './payment/payment.component';
import { ResultComponent } from './result/result.component';
import { DynamicScriptLoaderService } from './shared/dynamic-script-loader.service';
import { ValueComponent } from './value/value.component';

const routes: Routes = [
  {path: 'error', component: ErrorComponent, canActivate: [CanActivateBase]},
  {path: 'result', component: ResultComponent, canActivate: [CanActivateBase, CanActivateResult], data: {title: 'Generieren', progress: [3,3]}},
  {path: '', component: MainComponent, children: [
    {path: 'layout', component: LayoutComponent, data: {title: 'Design wählen', progress: [1,3]}},
    {path: 'value', component: ValueComponent, canActivate: [CanActivateOrderProgress,CanActivateAfterLayout], data: {title: 'Betrag wählen', progress: [1,3]}},
    {path: 'login/:mode', component: LoginComponent, canActivate: [CanActivateOrderProgress,CanActivateCheckout], data: {title: 'Ihre Daten', progress: [2,3]}},
    {path: 'login', redirectTo: 'login/', pathMatch: 'full'},
    {path: 'payment', component: PaymentComponent, canActivate: [CanActivateOrderProgress,CanActivateCheckout], data: {title: 'Bezahlung', progress: [3,3]}, resolve: {paymentRequest: 'paymentRequestButtonChecker'}},
    {path: '', redirectTo: 'layout', pathMatch: 'full'}
  ], canActivate: [CanActivateBase]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    CanActivateBase, CanActivateOrderProgress, CanActivateAfterLayout, CanActivateCheckout, CanActivateResult,
    {
      provide: 'paymentRequestButtonChecker',
      useFactory: paymentRequestButtonChecker,
      deps: [AppConfiguration, DynamicScriptLoaderService]
  },
  ]
})
export class AppRoutingModule { }
