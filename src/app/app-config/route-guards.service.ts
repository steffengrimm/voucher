import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { CartService } from '../shared/cart.service';
import { AppConfiguration, AppInitiationState } from './app-config.service';
import { TokenHandler } from "./token-handler.service";

@Injectable()
export class CanActivateBase implements CanActivate {
  constructor(private router: Router, private appConfig : AppConfiguration){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //console.log(route.routeConfig.path,this.appConfig.initialized);
    switch(this.appConfig.initialized) {
      case AppInitiationState.FAILED:
        if(route.routeConfig.path !== 'error') {
          //console.log("ERROR");
          this.router.navigate(['/error']);
          return false;
        }
        return true;
      case AppInitiationState.DEACTIVATED:
        if(route.routeConfig.path !== 'closed') {
          //console.log("CLOSED");
          this.router.navigate(['/closed']);
          return false;
        }
        return true;
      default:
        if(route.routeConfig.path === 'closed' || route.routeConfig.path === 'error') {
          //console.log("default");
          this.router.navigate(['/layout']);
          return false;
        }
        return true;
    }
  }   
}

@Injectable()
export class CanActivateOrderProgress implements CanActivate {
    constructor(private router: Router, private tokenHandler : TokenHandler){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        //console.log(route, state);
        //console.log(this.tokenHandler.decodedToken?.orderId);
        if(this.tokenHandler.decodedToken?.orderId && !this.tokenHandler.decodedToken?.cartIsClosed)
            return true;
        this.router.navigate(['/layout']);
        return false;
    }   
}


@Injectable()
export class CanActivateAfterLayout implements CanActivate {
    constructor(private router: Router, private cartService : CartService){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(this.cartService.hasActiveVoucher)
            return true;
        this.router.navigate(['/layout'],{replaceUrl: true});
        return false;
    }   
}

@Injectable()
export class CanActivateCheckout implements CanActivate {
    constructor(private router: Router, private cartService : CartService){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(!this.cartService.isEmpty)
            return true;
        if(this.cartService.hasActiveVoucher)
            this.router.navigate(['/value'],{replaceUrl: true});
        else
            this.router.navigate(['/layout'],{replaceUrl: true});
        return false;
    }   
}

@Injectable()
export class CanActivateResult implements CanActivate {
  constructor(private router: Router, private tokenHandler : TokenHandler){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //console.log("CANACTIVATERESULT");
    //console.log(this.tokenHandler.decodedToken?.orderId);
    if(this.tokenHandler.decodedToken?.orderId && this.tokenHandler.decodedToken?.cartIsClosed)
        return true;
    this.router.navigate(['/layout']);
    return false;
  }
}