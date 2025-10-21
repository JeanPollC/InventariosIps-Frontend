import { inject, Inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';
import { Area } from '../model/areas';

@Injectable({
  providedIn: 'root'
})
export class AreasService extends GenericService<Area>{

  private areasChange: Subject<Area[]> = new Subject<Area[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  constructor() { 
    super(
      inject(HttpClient),
      `${environment.HOST}/areas`
    )
  }
  
    setAreasChange(data: Area[]){
      this.areasChange.next(data);
    }
  
    getAreasChange(){
      return this.areasChange.asObservable();
    }
  
    setMessageChange(data: string){
      this.messageChangeu.next(data);
    }
  
    getMessageChange(){
      return this.messageChangeu.asObservable();
    }
}
