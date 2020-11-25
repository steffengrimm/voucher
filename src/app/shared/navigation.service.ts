import { EventEmitter, Injectable, OnInit } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, Routes } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, first, last } from 'rxjs/operators';

const staticRoutes = [
    'layout', 'value', 'login', 'payment', 'result'
]

@Injectable(/*{
    providedIn: 'root',
    
}*/)
export class NavigationService {
    //public readonly navigationEvent = new EventEmitter<number>();
    private currentPageId = 0;
    //private currentPage = staticRoutes[0];
    
    private _canForward = new BehaviorSubject<boolean>(false);
    public readonly canForward$ = this._canForward.asObservable();

    private _canBackward = new BehaviorSubject<boolean>(true);
    public readonly canBackward$ = this._canBackward.asObservable();

    private _canStore = new BehaviorSubject<boolean>(false);
    public readonly canStore$ = this._canStore.asObservable();

    private _navigationEvent = new BehaviorSubject<void>(void 0);
    public readonly navigationEvent$ = this._navigationEvent.asObservable();

    private _onBeforeNavigationForward : () => Promise<boolean>;
    public set onBeforeNavigationForward(callback: () => Promise<boolean> | null) {
        if(!callback)
            this._onBeforeNavigationForward = () => Promise.resolve(false);
        else
            this._onBeforeNavigationForward = callback;
    }

    private _onBeforeNavigationBackward : () => Promise<boolean>;
    public set onBeforeNavigationBackward(callback: () => Promise<boolean> | null) {
        if(!callback)
            this._onBeforeNavigationBackward = () => Promise.resolve(true);
        else
            this._onBeforeNavigationBackward = callback;
    }

    constructor(private router: Router) {
        //router.routerState.root.url.subscribe(x => console.log(x));
        router.events.pipe(filter(event => event instanceof NavigationEnd),).subscribe(event => {
            const url = ((event as NavigationEnd).urlAfterRedirects);
            //console.log("UUUURRRRLLLL", url);
            const path = url.split("/").find(part => part.length > 0);
            //console.log(path);
            this.currentPageId = staticRoutes.indexOf(path);
            /*this.onBeforeNavigationForward = null;
            this.onBeforeNavigationBackward = null;*/
        });
    }

    toggleForward(boolean: boolean) {
        this._canForward.next(boolean);
    }

    toggleBackward(boolean: boolean) {
        this._canBackward.next(boolean);
    }

    toggleStore(boolean: boolean) {
        this._canStore.next(boolean);
    }

    async tryGoForward() {
        if(this._canForward.value) {
            try {
                if(await this._onBeforeNavigationForward()) {
                    this.onBeforeNavigationForward = null;
                    this.router.navigate([staticRoutes[this.currentPageId+1]]);
                }
            } catch(e) {
            } finally {
                this._canForward.next(false);
                this._navigationEvent.next();
            }
        }
    }

    async tryGoBackward() {
        if(this._canBackward.value) {
            try {
                if(await this._onBeforeNavigationBackward()) {
                    this.onBeforeNavigationBackward = null;
                    this.router.navigate([staticRoutes[this.currentPageId-1]]);
                }
            } catch(e) {
            } finally {
                this._canForward.next(false);
                this._navigationEvent.next();
            }
        }
    }
}