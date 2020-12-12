import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {retryWhen, mergeMap, finalize} from 'rxjs/operators';
import {throwError, Observable, timer} from 'rxjs';
import {TokenHandler} from './token-handler.service';
import {LocationConfig, WidgetConfig} from '../shared/dto';
import { CartService } from '../shared/cart.service';
import { LayoutDTO, LayoutStorageService } from '../shared/layout-storage.service';

export enum AppInitiationState {
    INITIALIZED,
    DEACTIVATED,
    FAILED
}

@Injectable()
export class AppConfiguration {
    private WIDGET_IDENTIFIER: string | null;
    private _initialized: AppInitiationState;
  
    private configStorage: LocationConfig & WidgetConfig;
  
    constructor(
      private http: HttpClient,
      private tokenHandler: TokenHandler,
      private layoutStorage: LayoutStorageService,
      //private orderSettingsService: OrderSettingsService,
      private cartService: CartService,
    ) {}

    getBaseLocation() {
        const paths: string[] = location.pathname.split('/').splice(1, 1);
        const basePath = (this.WIDGET_IDENTIFIER = (paths && paths[0]) || null) ?? '';
        document.querySelector('base').setAttribute('href', '/' + basePath);
        return '/' + basePath;
    }

    async initialize(): Promise<boolean | PromiseLike<boolean>> {
        const getLocationConfig = async (): Promise<LocationConfig> => {
            return await this.http.get(`${environment.apiUrl}config`).toPromise() as LocationConfig;
        };

        const getCatalog = async () => {
            return await this.http.get(`${environment.apiUrl}catalog`).toPromise() as LayoutDTO[];
        };
    
        const customerDataRetrieval = async (): Promise<void> => {
            await Promise.all([
                this.cartService.retrieveCartItems(),
                this.cartService.retrieveCustomerData()
                /*this.orderSettingsService.retrieveOrder(),
                this.favoriteService.retrieveFavoriteItems()*/
            ]);
        };
    
        if (this.WIDGET_IDENTIFIER === null) { // Location-Id fehlt oder Länge ist fehlerhaft -- || this.WIDGET_IDENTIFIER.length !== 25
            this._initialized = AppInitiationState.FAILED;
            return true;
        }
    
        const tokenErroneous = (
            this.tokenHandler.rawToken === null ||
            this.tokenHandler.isExpired() ||
            this.tokenHandler.decodedToken.sub !== this.WIDGET_IDENTIFIER
        );
    
        if (tokenErroneous) { // abgelaufen oder URL-Identifier stimmt nicht mit Token überein
            sessionStorage.clear();
            try {
                await this.http.head(`${environment.apiUrl}init`, {
                    headers: new HttpHeaders({
                        apikey: this.WIDGET_IDENTIFIER
                    })
                }).pipe(retryWhen(genericRetryStrategy({excludedStatusCodes: [401]}))).toPromise();
            } catch (e) {
                this._initialized = AppInitiationState.FAILED;
                return true;
            }
        } else {
            await this.http.head(`${environment.apiUrl}reinit`).pipe(retryWhen(genericRetryStrategy({excludedStatusCodes: [401]}))).toPromise();
        }
    
        this.configStorage = await this.http.get(`${environment.apiUrl}widgetInfo`).toPromise() as WidgetConfig;

        this.loadThemeCSS(this.configStorage.hasCustomCSS);
    
        if (this.configStorage.blocked) {
            this._initialized = AppInitiationState.DEACTIVATED;
            return true;
        }
    
        try {
          // let config = await this.http.post<Config>(`${environment.apiUrl}init`,{location:this.WIDGET}).pipe(retryWhen(genericRetryStrategy(
          // {excludedStatusCodes: [403]}))).toPromise();
          // handleInitProcess(config);
            const [locationConfig, catalog] = await Promise.all([
                getLocationConfig(),
                getCatalog()
            ]);
            this.configStorage = Object.freeze<LocationConfig & WidgetConfig>({...this.configStorage, ...locationConfig});
            this.layoutStorage.createLayoutsFromJSON(catalog);
            if (this.tokenHandler.decodedToken.orderId) {
                await customerDataRetrieval();
            }
            this._initialized = this._initialized = AppInitiationState.INITIALIZED;
            return true;
        } catch (e) {
            console.error(e);
            this._initialized = this._initialized = AppInitiationState.INITIALIZED;
            return true;
        }
    }

    get initialized(): AppInitiationState {
        return this._initialized;
    }
    
    getConfiguration(): Readonly<LocationConfig & WidgetConfig> {
        return this.configStorage;
    }
    
    getLocationAsset(path: string) {
        return `${environment.assetsUrl}images/${this.tokenHandler.decodedToken.widgetHash}/${path}`;
    }

    async resetToken() {
        await this.http.head(`${environment.apiUrl}init`, {
          headers: new HttpHeaders({
            apikey: this.WIDGET_IDENTIFIER
          })
        }).toPromise();
    }
    
    getImprint(type: 'DISCLAIMER' | 'PRIVACY' | 'AGB'): Observable<{ text?: string, textType?: string }> {
        switch (type) {
          case 'DISCLAIMER':
            return this.http.get(`${environment.apiUrl}disclaimer`);
          case 'PRIVACY':
            return this.http.get(`${environment.apiUrl}privacy`);
          case 'AGB':
            return this.http.get(`${environment.apiUrl}agb`);
        }
    }
    
    closeWidget() {
        if (parent === window) {
          if (window.opener) {
            window.close();
          } else {
            parent.postMessage('closeWidget', '*');
          }
        }
    }

    private loadThemeCSS(isCustom = false) {
      //console.log(this.tokenHandler.decodedToken.widgetHash);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      if(isCustom)
        link.href = environment.assetsUrl+"css/"+this.tokenHandler.decodedToken.widgetHash+".css";
      else
        link.href = "theme.css";
      document.head.appendChild(link);
    }
}

export const genericRetryStrategy = ({
                                       maxRetryAttempts = 3,
                                       duration = 1000,
                                       excludedStatusCodes = []
                                     }: {
  maxRetryAttempts?: number,
  duration?: number,
  excludedStatusCodes?: number[]
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      // if maximum number of retries have been met
      // or response is a status code we don't wish to retry, throw error
      if (
        retryAttempt > maxRetryAttempts ||
        excludedStatusCodes.find(e => e === error.status)
      ) {
        return throwError(error);
      }
      console.log(
        `Attempt ${retryAttempt}: retrying in ${retryAttempt *
        duration}ms`
      );
      // retry after 1s, 2s, etc...
      return timer(duration);
    }),
    finalize(() => console.log('We are done!'))
  );
};
