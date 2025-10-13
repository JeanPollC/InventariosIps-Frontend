import { inject, Inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Area } from '../model/area';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AreasService extends GenericService<Area>{

  private areaChange: Subject<Area[]> = new Subject<Area[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() { 
    super(
      inject(HttpClient),
      `${environment.HOST}/areas`
    )
  }
  
    setAreaChange(data: Area[]){
      this.areaChange.next(data);
    }
  
    getAreaChange(){
      return this.areaChange.asObservable();
    }
  
    setMessageChange(data: string){
      this.messageChangeu.next(data);
    }
  
    getMessageChange(){
      return this.messageChangeu.asObservable();
    }
}
