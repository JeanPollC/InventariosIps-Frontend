import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { GenericService } from './generic.service';
import { Loans } from '../model/loans';

@Injectable({
  providedIn: 'root'
})
export class LoansService extends GenericService<Loans>{

  private loansChange: Subject<Loans[]> = new Subject<Loans[]>();
  private messageChangeu: Subject<string> = new Subject<string>;


  constructor() { 
    super(
      inject(HttpClient),
      `${environment.HOST}/loans`
    )
  }
  
    setLoansChange(data: Loans[]){
      this.loansChange.next(data);
    }
  
    getLoansChange(){
      return this.loansChange.asObservable();
    }
  
    setMessageChange(data: string){
      this.messageChangeu.next(data);
    }
  
    getMessageChange(){
      return this.messageChangeu.asObservable();
    }

}
