import { Injectable } from '@angular/core';
import { TokenHandler } from '../app-config/token-handler.service';
import { environment } from '../../environments/environment';

const join = (...fragments: string[]) => fragments.reduce((path, f) => path.substr(-1) === '/' || path.length === 0 ? path+f : path+'/'+f, '');

export interface LayoutDTO {
    id: string,
    name: string,
    description: string;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutStorageService {
    private basePath : (...fragments: string[]) => string

    constructor(tokenHandler: TokenHandler) {
        //tokenHandler.decodedToken.widgetHash
        this.basePath = (...fragments: string[]) => join(environment.assetsUrl,'previews',tokenHandler.decodedToken.widgetHash, ...fragments);
    }

    private _layouts : Map<string, Layout> = new Map();

    createLayoutsFromJSON(layouts_raw: LayoutDTO[]) : void {
        layouts_raw.forEach(l => {
            this._layouts.set(l.id, new Layout(l))
        })
        //console.log(this._layouts);
    }

    getLayoutById(id: string) : Layout {
        return this._layouts.get(id);
    }

    getAllLayouts(): Array<Layout> {
      return [...this._layouts.values()];
    }

    getPreviewForLayout(layout: LayoutDTO) {
        return this.basePath(layout.id+'.png');
    }
}

export class Layout implements LayoutDTO {
    id: string;
    name: string;
    description: string;

    constructor(raw: LayoutDTO) {
        this.id = raw.id;
        this.name = raw.name;
        this.description = raw.description;
    }
}