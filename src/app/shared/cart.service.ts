import { Injectable } from '@angular/core';
//import { ReadOnlyFoodSelection } from '../main/overview/selection.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { isEqual, escape } from 'lodash';
//import { ProductStorage, Food, FoodExtraGroup, FoodExtra } from './product-storage.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DetermineUserDto, PaymentMethod, UserState, VoucherDto } from './dto';
import { map } from 'rxjs/operators';
import { Layout } from './layout-storage.service';
import { TokenHandler } from '../app-config/token-handler.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private _readOnlyItems: BehaviorSubject<Voucher[]> = new BehaviorSubject([]);
    readonly readOnlyItems$ = this._readOnlyItems.asObservable();

    private _currentVoucher : Voucher;
    private _customerEmail : string;

    get hasActiveVoucher() {
        return !!this._currentVoucher;
    }

    get activeVoucher() {
        return this._currentVoucher;
    }

    get customerEmail() {
        return this._customerEmail;
    }

    private _paymentIntent : string;

    get paymentIntent() {
        return this._paymentIntent;
    }

    constructor(private http: HttpClient, private token: TokenHandler) {}

    makeNewVoucher() {
        this._currentVoucher = new Voucher();
    }

    private async openCart() : Promise<void> {
        await this.http.put(`${environment.apiUrl}orderSettings`,{}).toPromise();
    }

    public async retrieveCartItems() {
        try {
            this._readOnlyItems.next((await this.http.get(`${environment.apiUrl}cartItem`).toPromise() as Array<VoucherDto>).map(v => new Voucher(v)));
        } catch(e) {}
    };

    public async retrieveCustomerData() {
        if(this.token.decodedToken.customerCaptured) {
            const result = await this.http.get<DetermineUserDto>(`${environment.apiUrl}customerData`).toPromise();
            this._customerEmail = result.emailAddress;
        }
    }

    public async setLayout(layout: Layout) {
        await this.openCart();
        if(!this.hasActiveVoucher)
            this.makeNewVoucher();
        this._currentVoucher.layoutId = layout.id;

        //console.log(this._currentVoucher);
    }

    public setValue(value: number) {
        if(this.hasActiveVoucher) {
            this._currentVoucher.initialValue = value;
        }
    }

    public setQuantity(quantity: number) {
        if(this.hasActiveVoucher) {
            this._currentVoucher.quantity = quantity;
        }
    }

    public async upsertActiveVoucher() {
        if(!this.hasActiveVoucher)
            return;
        //console.log("UPSERT", this._currentVoucher);

        const result = await this.http.put<VoucherDto>(`${environment.apiUrl}cartItem`, this._currentVoucher).toPromise();
        
        if(result) {
            this._currentVoucher.id = result.id;
            if(!this._currentVoucher.id)
                this._currentVoucher.id = result.id;

            const items = this._readOnlyItems.value;
            const cartIndex = items.findIndex(voucher => voucher.id === result.id);
            if(cartIndex > -1)
                items[cartIndex] = this._currentVoucher;
            else
                items.push(this._currentVoucher);
            this._readOnlyItems.next(items);
        } else {
            //Fehlerbehandlung
        }
    }

    public async changeCartItemQuantity(voucherId: string, amount: number) {
        const items = this._readOnlyItems.value;
        const cartIndex = items.findIndex(voucher => voucher.id === voucherId);
        if(cartIndex > -1) {
            const changedVoucher = items[cartIndex];
            changedVoucher.quantity = amount;

            await this.http.put<VoucherDto>(`${environment.apiUrl}cartItem`,changedVoucher).toPromise();
            items[cartIndex] = changedVoucher;

            if(this.hasActiveVoucher) {
                if(this.activeVoucher.id === voucherId)
                    this._currentVoucher.quantity = amount;
            }

            this._readOnlyItems.next(items);
        }
    }

    public async deleteCartItem(voucherId: string) {
        const items = this._readOnlyItems.value;
        const cartIndex = items.findIndex(voucher => voucher.id === voucherId);
        if(cartIndex > -1) {
            await this.http.delete(`${environment.apiUrl}cartItem?itemId=${voucherId}`).toPromise();
            items.splice(cartIndex,1);

            if(this.hasActiveVoucher) {
                if(this.activeVoucher.id === voucherId)
                    this.makeNewVoucher();
            }

            this._readOnlyItems.next(items);
        }
    }

    findUser(mailAddress : string) : Observable<UserState> {
        let requestDto = new DetermineUserDto();
        requestDto.emailAddress = mailAddress;
        return this.http.post<DetermineUserDto>(`${environment.apiUrl}findUser`,requestDto).pipe(map(result => UserState[result.userState as string]));
    }

    async postUserFormData(formData: any) : Promise<boolean> {
        let result = await this.http.put<DetermineUserDto>(`${environment.apiUrl}customerData`,formData).toPromise()
        let state = UserState[result.userState as string];
        this._customerEmail = result.emailAddress;
        return state === UserState.COMPLETE || state === UserState.INVOICEDATAMISSING;
    }

    async setPaymentMethod(method: PaymentMethod) : Promise<string> {
        let payload = {paymentMethod: PaymentMethod[method]};
        await this.http.put(`${environment.apiUrl}paymentMethod`,payload).toPromise();
        const intent = await this.http.get<{paymentIntent: string}>(`${environment.apiUrl}paymentIntent`).toPromise();
        this._paymentIntent = intent.paymentIntent;
        return intent.paymentIntent;
    }

    get isEmpty() : boolean {
        return this._readOnlyItems.getValue().length === 0;
    }

    get numberOfVouchers() : Observable<number> {
        return this.readOnlyItems$.pipe(map(vouchers => vouchers.reduce((sum,voucher) => sum + voucher.quantity, 0)));
    }

    get totalPrice() : Observable<number> {
        return this.readOnlyItems$.pipe(map(vouchers => vouchers.reduce((sum, v) => sum + v.quantity * v.initialValue, 0)));
    }

    /*async addToCart(entireSelection: [ReadOnlyFoodSelection,number][]) : Promise<boolean> {
        try {
            await Promise.all(entireSelection.map(selection => this.changeQuantity(CartItem.createFromFoodSelection(selection[0]), selection[1], true)));
            return true;
        } catch (e) {
            return false;
        }
    }

    async setQuantity(cartSelectionObject: CartItem, quantity: number) {
        if(quantity > 0) {
            await this.changeQuantity(cartSelectionObject, quantity);
            return quantity;
        }
    }

    private async changeQuantity(cartSelectionObject: CartItem, quantity: number, isDelta: boolean = false) {
        let items = this._readOnlyItems.getValue(), key: number;
        if(cartSelectionObject.id) { //definitely update!
            key = items.findIndex(item => item.id === cartSelectionObject.id);
        } else {
            let {id, quantity, ...strippedCartSelectionObject} = cartSelectionObject;
            key = items.findIndex(item => {
                let {id, quantity, ...stripped} = item;
                return isEqual(stripped, strippedCartSelectionObject);
            })
        }
        let result : CartItem;
        if(key > -1) { //found: update
            result = await this.http.patch<CartItemDto>(`${environment.apiUrl}cartItem`,{
                itemId: items[key].id,
                quantity: isDelta ? items[key].quantity + quantity : quantity,
            }).toPromise();
            items[key].quantity = result.quantity;
        } else { //not found: post
            cartSelectionObject.quantity = quantity
            result = await this.http.post<CartItemDto>(`${environment.apiUrl}cartItem`,cartSelectionObject as CartItemDto).toPromise();
            items.push(result);
        }

        this._readOnlyItems.next(items);
    }

    getQuantityById(cartItemId: string) {
        return this._readOnlyItems.getValue().find(e => e.id === cartItemId)?.quantity ?? 0;
    }

    async patchSelectedExtras(itemId: string, extraSelection: CartItemDto['selectedExtras']) {
        let items = this._readOnlyItems.getValue();
        let key = items.findIndex(item => item.id === itemId);
        if(key > -1) {
            try {
                const result = await this.http.patch<CartItemDto>(`${environment.apiUrl}cartItem`,{
                    itemId: itemId,
                    selectedExtras: extraSelection
                }).toPromise();
                items[key] = result;
                console.log("geändert", result, items);
                this._readOnlyItems.next(items);
                return true;
            } catch(e) {
                return false;
            }
        }
        return false;
    }

    patchAnnoations(itemId: string, annotations: string) {
        this.http.patch<CartItemDto>(`${environment.apiUrl}cartItem`,{
            itemId: itemId,
            annotations: escape(annotations)
        }).toPromise();
    }

    async removeFromCartById(cartItemId: string) {
        let items = this._readOnlyItems.getValue();
        /*let key = items.findIndex(e => e.selection.equalTo(productSelection));
        if(key > -1)
            items.splice(key,1);#/
        await this.http.delete(`${environment.apiUrl}cartItem?itemId=${cartItemId}`).toPromise();
        items = items.filter(e => e.id !== cartItemId);
        this._readOnlyItems.next(items);
    }

    async clearCart() {
        this._readOnlyItems.next(new Array<CartItem>());
    }

    /*getTotalPrice() : number {
        return this._readOnlyItems$.getValue().reduce((total, selectionTuple) => total + (selectionTuple.quantity * this.selectionHelper.getSinglePriceForSelection(selectionTuple)),0);
    }#/

    getTotalPrice() : Observable<number> {
        return this.readOnlyItems$.pipe(map(items => items.reduce((total, selectionTuple) => total + (selectionTuple.quantity * this.selectionHelper.getSinglePriceForSelection(selectionTuple, true)),0)));
    }

    numberOfItems() : number {
        //return [...this._readOnlyItems.values()].reduce((total,current) => total+current, 0);
        return this._readOnlyItems.getValue().reduce((total,current) => total+current.quantity, 0);
    }*/
}

export class Voucher {
    id: string;
    layoutId: string;
    initialValue: number;
    quantity: number
    annotations: string;

    constructor(v? : VoucherDto) {
        this.id = v?.id;
        this.layoutId = v?.layoutId;
        this.initialValue = v?.initialValue;
        this.quantity = v?.quantity;
        this.annotations = v?.annotations;
    }

    getTotalPrice() {
        return this.initialValue * this.quantity;
    }
}

/*
export class CartItem extends CartItemDto {
    constructor(selection? : CartItemDto) {
        super();
        if(selection) {
            this.id = selection.id;
            this.variant = selection.variant;
            this.quantity = selection.quantity;
            this.annotations = selection.annotations;
            if(selection.selectedExtras)
                this.selectedExtras = selection.selectedExtras;
        }
    }

    static createFromFoodSelection(selection : ReadOnlyFoodSelection) : CartItem {
        let obj = new CartItem();

        obj.variant = {
            id: selection.getSelectedVariant().getIdentifier(),
            productId: selection.getFoodInSelection().getId()
        };

        if(selection.hasExtras()) {
            obj.selectedExtras = new Array();
            for(let groupTuple of selection.getExtrasIterator()) {
                for(let extraTuple of groupTuple[1]) {
                    obj.selectedExtras.push({extraId: extraTuple[0].getId(),quantity: extraTuple[1]});
                }
            }
        }
        obj.annotations = selection.annotation;

        return obj;
    }
}

@Injectable({providedIn: "root"})
export class CartSelectionHelper {
    constructor(private productStorage: ProductStorage) {}

    getFoodFromSelection(selection: CartItemDto) {
        return this.productStorage.getProductById(selection.variant.productId);
    }

    getExtraGroupsFromSelection(selection: CartItemDto) {
        const foodItem = this.getFoodFromSelection(selection);
        //const rawSelectedExtras = .map(extra => ({extra: this.productStorage.getExtraById(extra.extraId), quantity: extra.quantity}));
        //const extraSelection : Map<FoodExtraGroup,{extra:FoodExtra,quantity:number}[]> = new Map();
        const extraSelection: Map<FoodExtraGroup, {boundaries: {min:number,max:number,free?:number}, selection:FoodExtra[]}> = new Map();

        selection.selectedExtras.forEach(({extraId,quantity}) => {
            let extra = this.productStorage.getExtraById(extraId);
            foodItem.getExtraGroupsWithBoundaries().forEach((boundaries, group) => {
                if(!group.containsExtra(extra))
                    return;
                if(!extraSelection.has(group))
                    extraSelection.set(group, {boundaries: boundaries, selection: []});
                let existingSelection = extraSelection.get(group).selection;
                extraSelection.set(group, {boundaries: boundaries, selection: [...existingSelection, extra]});
            });
        })

        return extraSelection;
    }

    getSinglePriceForSelection(selection: CartItemDto, withExtras = false) : number {
        let food = this.productStorage.getProductById(selection.variant.productId);
        let basePrice = food.getVariantById(selection.variant.id).getPrice();
        if(selection.selectedExtras && withExtras)
            return selection.selectedExtras.reduce((total, extraTuple) => total + extraTuple.quantity*this.productStorage.getExtraById(extraTuple.extraId).getPrice(), basePrice);
        return basePrice;
    }
}*/
