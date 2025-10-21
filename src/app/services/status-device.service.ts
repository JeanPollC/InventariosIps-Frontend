import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';
import { StatusDevice } from '../model/statusDevice';

@Injectable({
  providedIn: 'root'
})
export class StatusDeviceService extends GenericService<StatusDevice>{

  private statusdeviceChange: Subject<StatusDevice[]> = new Subject<StatusDevice[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() { 
    super(
      inject(HttpClient),
      `${environment.HOST}/statusDevices`
    )
  }
  
    setStatusDeviceChange(data: StatusDevice[]){
      this.statusdeviceChange.next(data);
    }
  
    getStatusDeviceChange(){
      return this.statusdeviceChange.asObservable();
    }
  
    setMessageChange(data: string){
      this.messageChangeu.next(data);
    }
  
    getMessageChange(){
      return this.messageChangeu.asObservable();
    }
}