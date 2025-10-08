import { inject, Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Device } from '../model/device';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceService extends GenericService<Device> {

  private deviceChange: Subject<Device[]> = new Subject<Device[]>();
  private messageChangeu: Subject<string> = new Subject<string>;


  constructor() {
    super(
      inject(HttpClient),
      `${environment.HOST}/devices`
    )
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
