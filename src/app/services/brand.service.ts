import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Brand } from '../model/brand';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BrandService extends GenericService<Brand>{

  constructor() {
    super(
      inject(HttpClient),
      `${environment.HOST}/brands`
    )
   }
}
