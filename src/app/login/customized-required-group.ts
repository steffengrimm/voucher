import { AbstractControl, Validators } from '@angular/forms';

export function customizedRequiredGroup(controlsConfig: {[key:string]: any[] | AbstractControl}, isRequired: (s: string) => boolean) : {[key:string]: any} {
    Object.keys(controlsConfig).forEach(key => {
        if(isRequired(key)) {
            if(controlsConfig[key] instanceof AbstractControl) {
                (controlsConfig[key] as AbstractControl).setValidators(Validators.required);
            } else {
                let currentControl = (controlsConfig[key] as any[]);
                if(currentControl.length > 1) {
                    if(Array.isArray(currentControl[1]))
                        currentControl[1] = Array.from(new Set([...currentControl[1], Validators.required]));
                    else
                        currentControl[1] = Array.from(new Set([currentControl[1], Validators.required]));
                } else {
                    currentControl.push([Validators.required]);
                }
                controlsConfig[key] = currentControl;
            }
        }
    })
    return controlsConfig;
}