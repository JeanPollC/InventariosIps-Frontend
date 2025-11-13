import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';
import { Warranty } from '../model/warranty';

@Injectable({
  providedIn: 'root'
})
export class WarrantyService extends GenericService<Warranty>{

  private warrantyChange: Subject<Warranty[]> = new Subject<Warranty[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() {
    super(
      inject (HttpClient),
      `${environment.HOST}/warranties`
    )
   }

     setWarrantyChange(data: Warranty[]){
       this.warrantyChange.next(data);
     }

     getWarrantyChange(){
       return this.warrantyChange.asObservable();
     }

     setMessageChange(data: string){
       this.messageChangeu.next(data);
     }

     getMessageChange(){
       return this.messageChangeu.asObservable();
     }
}
