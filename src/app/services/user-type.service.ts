import { inject, Injectable } from '@angular/core';
import { UserType } from '../model/userType';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class UserTypeService extends GenericService<UserType>{

  private usertypeChange: Subject<UserType[]> = new Subject<UserType[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() {
    super(
      inject(HttpClient),
      `${environment.HOST}/userstypes`
    )
  }

  setUserTypeChange(data: UserType[]){
    this.usertypeChange.next(data);
  }

  getUserTypeChange(){
    return this.usertypeChange.asObservable();
  }

  setMessageChange(data: string){
    this.messageChangeu.next(data);
  }

  getMessageChange(){
    return this.messageChangeu.asObservable();
  }
}