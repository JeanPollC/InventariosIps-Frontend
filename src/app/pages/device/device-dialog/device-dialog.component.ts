import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { Device } from '../../../model/device';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, switchMap, tap } from 'rxjs';
import { DeviceService } from '../../../services/device.service';
import { DeviceDetails } from '../../../model/deviceDetails';
import { BrandService } from '../../../services/brand.service';
import { Brand } from '../../../model/brand';
import { Area } from '../../../model/areas';
import { AreasService } from '../../../services/areas.service';
import { Warranty } from '../../../model/warranty';
import { WarrantyService } from '../../../services/warraty.service';
import { StatusDevice } from '../../../model/statusDevice';
import { StatusDeviceService } from '../../../services/status-device.service';

@Component({
  selector: 'app-device-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './device-dialog.component.html',
  styleUrl: './device-dialog.component.css'
})
export class DeviceDialogComponent {

  device: Device;
  deviceDetails: DeviceDetails;
  title: string;
  selectedFile: File;

  brands$: Observable<Brand[]>
  areas$: Observable<Area[]>
  warranties$: Observable<Warranty[]>
  status$: Observable<StatusDevice[]>

  readonly dialogRef = inject(MatDialogRef<DeviceDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  readonly deviceService = inject(DeviceService);
  private brandService = inject(BrandService);
  private areaService = inject(AreasService);
  private warrantyService = inject(WarrantyService);
  private statusDeviceService = inject(StatusDeviceService);



  ngOnInit() {
    if (this.data && this.data.device && this.data.device.idDevice > 0) {
      this.device = { ...this.data.device };
      this.deviceDetails = { ...this.data.deviceDetails };
      this.title = 'Editar Dispositivo';
    } else {
      this.device = new Device();
      this.deviceDetails = new DeviceDetails();
      this.title = 'Nuevo Dispositivo';
    }
    this.loadInicialData();
  }

  loadInicialData() {
    this.brands$ = this.brandService.findAll();
    this.areas$ = this.areaService.findAll();
    this.warranties$ = this.warrantyService.findAll();
    this.status$ = this.statusDeviceService.findAll();
  }

  close() {
    this.dialogRef.close();
  }

  operate() {
    
    const deviceRequest = {
    idDevice: this.device.idDevice,
    name: this.device.name,
    idArea: this.device.idArea,
    idBrand: this.device.idBrand,
    deviceType: this.device.deviceType,
    storage: this.deviceDetails.storage,
    graphics_card: this.deviceDetails.graphics_card,
    ram: this.deviceDetails.ram,
    processor: this.deviceDetails.processor,
    product_code: this.deviceDetails.product_code,
    serial_no: this.deviceDetails.serial_no,
    windows_edition: this.deviceDetails.windows_edition,
    idStatusDevice: this.device.idStatusDevice,
    idWarranty: this.deviceDetails.idWarranty,
    observation: this.deviceDetails.observation,
    lifecycleFile: this.deviceDetails.lifecycleFile
  };

    //UPDATE
    if (this.device != null && this.device.idDevice > 0) {
      this.deviceService.update(this.device.idDevice, deviceRequest).pipe(
        switchMap(() => this.uploadDocument(this.device.idDevice)),
        switchMap(() => this.deviceService.findAll()),
        tap(data => this.deviceService.setDeviceChange(data)),
        tap(() => this.deviceService.setMessageChange('UPDATED!'))
      ).subscribe();
    } else {
      //SAVE
      this.deviceService.save(deviceRequest).pipe(
        switchMap((savedDevice: Device) => this.uploadDocument(savedDevice.idDevice)),
        switchMap(() => this.deviceService.findAll()),
        tap(data => this.deviceService.setDeviceChange(data)),
        tap(() => this.deviceService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0];
  }

  uploadDocument(deviceId: number){
    if(this.selectedFile){
      return this.deviceService.uploadPdf(this.selectedFile, deviceId);
    } else {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      })
    }
  }

}
