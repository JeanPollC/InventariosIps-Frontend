import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { GenericService } from './generic.service';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService extends GenericService<User>{

  private userChange: Subject<User[]> = new Subject<User[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() {
    super(
      inject(HttpClient),
      `${environment.HOST}/users`
    )
  }

  setUserChange(data: User[]){
    this.userChange.next(data);
  }

  getUserChange(){
    return this.userChange.asObservable();
  }

  setMessageChange(data: string){
    this.messageChangeu.next(data);
  }

  getMessageChange(){
    return this.messageChangeu.asObservable();
  }
}