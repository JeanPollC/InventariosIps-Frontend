import { Inject, Injectable } from '@angular/core';
import { Device } from '../model/device';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { DeviceRequestDTO } from '../model/deviceRequestDTO';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  private deviceChange: Subject<Device[]> = new Subject<Device[]>();
  private messageChangeu: Subject<string> = new Subject<string>;

  private readonly baseUrl = `${environment.HOST}/devices`;
  
  constructor(private http: HttpClient) { }

  findAll(){
    return this.http.get<Device[]>(this.baseUrl);
  }

  findById(id: number){
    return this.http.get<Device>(`${this.baseUrl}/${id}`);
  }

  save(dto: DeviceRequestDTO){
    return this.http.post(this.baseUrl, dto);
  }

  update(id: number, dto: DeviceRequestDTO){
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number){
    return this.http.delete(`${this.baseUrl}/${id}`)
  }

  setDeviceChange(data: Device[]) {
    this.deviceChange.next(data);
  }

  getDeviceChange() {
    return this.deviceChange.asObservable();
  }

  setMessageChange(data: string) {
    this.messageChangeu.next(data);
  }

  getMessageChange() {
    return this.messageChangeu.asObservable();
  }

}
