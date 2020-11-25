import { NgModule } from '@angular/core';
import { RadioButtonComponent } from './radio-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    RadioButtonComponent
  ],
  imports: [
    FormsModule
  ],
  exports: [RadioButtonComponent],
})
export class RadioButtonModule { }
