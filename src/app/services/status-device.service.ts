import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';
import { Brand } from '../model/brand';
import { StatusDevice } from '../model/StatusDevice';

@Injectable({
  providedIn: 'root'
})
export class StatusDeviceService extends GenericService<StatusDevice>{

  private brandChange: Subject<Brand[]> = new Subject<Brand[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() { 
    super(
      inject(HttpClient),
      `${environment.HOST}/statusDevices`
    )
  }
  
    setBrandChange(data: Brand[]){
      this.brandChange.next(data);
    }
  
    getBrandChange(){
      return this.brandChange.asObservable();
    }
  
    setMessageChange(data: string){
      this.messageChangeu.next(data);
    }
  
    getMessageChange(){
      return this.messageChangeu.asObservable();
    }
}