import { Inject, Injectable } from '@angular/core';
import { Device } from '../model/device';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { DeviceRequestDTO } from '../model/deviceRequestDTO';
import { environment } from '../../environments/environment.development';
import { Page } from '../model/page';

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

  findAllPageable(page:number, size: number): Observable<Page<Device>>{
        const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());

    // Asume que tu endpoint paginado es /users/pageable
    return this.http.get<Page<Device>>(`${this.baseUrl}/pageable`, { params });
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

  getNameUserByNameDevice(deviceName: string){
    return this.http.get(`${this.baseUrl}/nameUser`, {
      params: { deviceName },
    responseType: 'text'
    })
  }

  getNameUserByNameDeviceLoan(deviceName: string){
    return this.http.get(`${this.baseUrl}/nameUserLoan`, {
      params: { deviceName },
    responseType: 'text'
    })
  }

  getAvailableDevices(){
    return this.http.get<Device[]>(`${this.baseUrl}/availables`);
  }

  uploadPdf(pdf: File, deviceId: number){
    const formData = new FormData();
    formData.append('file', pdf);
    formData.append('deviceId', deviceId.toString());

    return this.http.post(`${this.baseUrl}/upload`, formData, { responseType: 'text' });
  }


}
