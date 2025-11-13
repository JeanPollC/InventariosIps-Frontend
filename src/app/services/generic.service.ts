import { HttpClient, HttpParams} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../model/page';

@Injectable({
  providedIn: 'root'
})
export class GenericService<T> {

  constructor(
    protected http: HttpClient,
    @Inject('API_URL') protected url: string
  ) { }

  findAllPageable(page:number, size: number): Observable<Page<T>>{
        const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());

    // Asume que tu endpoint paginado es /users/pageable
    return this.http.get<Page<T>>(`${this.url}/pageable`, { params });
  }

  findAll(){
    return this.http.get<T[]>(this.url);
  }

  findById(id: number){
    return this.http.get<T>(`${this.url}/${id}`);
  }

  save(t: T){
    return this.http.post<T>(this.url, t);
  }

  update(id: number, t: T){
    return this.http.put(`${this.url}/${id}`, t);
  }

  delete(id: number, t: T){
    return this.http.delete(`${this.url}/${id}`, { body: t})
  }
}
