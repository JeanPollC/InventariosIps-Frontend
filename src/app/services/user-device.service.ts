import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { UserDevice } from '../model/userDevice';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDeviceService extends GenericService<UserDevice>{

  private userDeviceChange: Subject<UserDevice[]> = new Subject<UserDevice[]>();
  private messageChangeu: Subject<string> = new Subject<string>;


  constructor() { 
    super(
      inject(HttpClient),
      `${environment.HOST}/usersDevices`
    )
  }
  
    setUserDeviceChange(data: UserDevice[]){
      this.userDeviceChange.next(data);
    }
  
    getUserDeviceChange(){
      return this.userDeviceChange.asObservable();
    }
  
    setMessageChange(data: string){
      this.messageChangeu.next(data);
    }
  
    getMessageChange(){
      return this.messageChangeu.asObservable();
    }


}
