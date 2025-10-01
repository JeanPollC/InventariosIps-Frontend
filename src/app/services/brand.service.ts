import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Brand } from '../model/brand';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService extends GenericService<Brand>{

  private brandChange: Subject<Brand[]> = new Subject<Brand[]>();

  constructor() {
    super(
      inject(HttpClient),
      `${environment.HOST}/brands`
    )
  }

  setBrandChange(data: Brand[]){
    this.brandChange.next(data);
  }

  getBrandChange(){
    return this.brandChange.asObservable();
  }
}
