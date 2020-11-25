import { ComponentFactory, ComponentFactoryResolver, Directive, Injectable, Type, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

export interface OverlayContent<T> {
    data: T;
    closeEvent: Observable<void>
}

///////////////////////

@Directive({
    selector: '[overlayHost]',
})
export class OverlayDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

export interface OverlayOutlet {
    readonly overlayHost : OverlayDirective;
    setIdentifier(identifier: string) : void;
}

///////////////////////

@Injectable({
    providedIn: 'root'
})
export class OverlayService<T> {
    private outlets = new Map<string, OverlayOutlet>();
    private visiblity = new BehaviorSubject<Set<string>>(new Set());

    constructor(private factoryResolver: ComponentFactoryResolver) {}

    public openOverlay(identifier: string, content: Type<OverlayContent<T>>, data?: T) {
        const outlet = this.outlets.get(identifier);
        if(outlet) {
            const factory = this.factoryResolver.resolveComponentFactory<OverlayContent<T>>(content);
            const containerRef = outlet.overlayHost.viewContainerRef;
            containerRef.clear();
            const componentRef = containerRef.createComponent(factory);

            if(data) {
                componentRef.instance.data = data;
            }

            this.toggleVisibility(identifier, true);
            componentRef.instance.closeEvent?.pipe(first()).subscribe(_ => this.toggleVisibility(identifier, false));
        }
    }

    public closeOverlay(identifier: string) {
        const outlet = this.outlets.get(identifier);

        if(outlet) {
            outlet.overlayHost.viewContainerRef.clear();
            this.toggleVisibility(identifier, false);
        }
    }

    private toggleVisibility(identifier: string, visible: boolean) {
        let currentlyVisible = this.visiblity.value;
        if(visible)
            currentlyVisible.add(identifier);
        else
            currentlyVisible.delete(identifier);

        this.visiblity.next(currentlyVisible);
    }

    public isVisible(identifier: string) {
        return this.visiblity.pipe(map(visiblity => visiblity.has(identifier)));
    }

    public registerOutlet(outlet: OverlayOutlet, identifier: string) {
        this.outlets.set(identifier, outlet);
        outlet.setIdentifier(identifier);

    }
}