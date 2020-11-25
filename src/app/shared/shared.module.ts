import { WaehrungFormatPipe } from './waehrung.pipe';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormControlDirective } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownPipe } from './markdown.pipe';
import { NavigationService } from './navigation.service';
import { QuantityComponent } from './quantity/quantity.component';
import { DecoratedInputComponent } from './decorated-input/decorated-input.component';
import { RadioButtonComponent } from './radio-button/radio-button.component';
import { RegularOverlayComponent } from './regular-overlay/regular-overlay.component';
import { OverlayService, OverlayDirective } from './overlay.service';
import { AlertOverlayComponent } from './alert-overlay/alert-overlay.component';

@NgModule({
  declarations: [ 
    WaehrungFormatPipe,
    MarkdownPipe,
    QuantityComponent,
    DecoratedInputComponent,
    RadioButtonComponent,
    OverlayDirective,
    RegularOverlayComponent,
    AlertOverlayComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  exports: [
    MarkdownPipe,
    CommonModule,
    WaehrungFormatPipe,
    ReactiveFormsModule,
    QuantityComponent,
    DecoratedInputComponent,
    RadioButtonComponent,
    RegularOverlayComponent,
    AlertOverlayComponent
  ],
  providers: [
    FormControlDirective,
    NavigationService,
    OverlayService,
  ],
})
export class SharedModule {}