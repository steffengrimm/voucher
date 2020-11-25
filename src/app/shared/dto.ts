export interface LocationConfig {
    location?: {
      name: string,
      address: any,
      socialMedia?: {[key in SocialMedia]?: string}
    };
    appConfig?: {
      paymentKeys?: PaymentHandlerDto,
      paymentMethods: PaymentMethodSelection,
      presetValues: number[],
      valueBoundaries: {min: number, max: number}
    };
    requiredFormFields?: string[];
  }

  export type SocialMedia = 'fb' | 'ig' | 'twitter';
  
  export interface WidgetConfig {
    infoText: string;
    hidden: boolean;
    blocked: boolean;
    blockedInfo: string;
    hasCustomCSS: boolean;
  }

  export enum UserState {
    UNKNOWN,
    INVOICEDATAMISSING,
    COMPLETE
  }
  
  export class DetermineUserDto {
    emailAddress: string;
    userState?: UserState | keyof typeof UserState;
  }

  export class VoucherDto {
    id: string;
    layoutId: string;
    initialValue: number;
    quantity: number;
    annotations = '';
  }

  enum PaymentHandlers {
    STRIPE,
    CONCARDIS,
    PAYPAL,
  }
  
  export type PaymentHandlerDto = { [key in (keyof typeof PaymentHandlers)]?: string };
  
  export enum PaymentMethod {
    CASH,
    CREDITCARD,
    MOBILEPAYMENT,
    PAYPAL,
    ELECTRONICCASH
  }
  
  export type PaymentMethodSelection = (keyof typeof PaymentMethod)[];