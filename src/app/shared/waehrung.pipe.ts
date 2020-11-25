import { Pipe, PipeTransform } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';

@Pipe({name: 'waehrung'})
export class WaehrungFormatPipe implements PipeTransform {
    transform(value: number, includeFrom?: boolean) : string {
        return (includeFrom ? "ab\xa0" : "")+(value/100).toFixed(2).replace(/\.00/,"").replace(".",",")+"\xa0"+getCurrencySymbol("EUR", "narrow");
    }
}