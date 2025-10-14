import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { Device } from '../../../model/device';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, switchMap, tap } from 'rxjs';
import { DeviceService } from '../../../services/device.service';
import { DeviceDetails } from '../../../model/deviceDetails';
import { BrandService } from '../../../services/brand.service';
import { Brand } from '../../../model/brand';
import { Area } from '../../../model/area';
import { AreasService } from '../../../services/areas.service';

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

  brands$: Observable<Brand[]>
  areas$: Observable<Area[]>

  readonly dialogRef = inject(MatDialogRef<DeviceDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  readonly deviceService = inject(DeviceService);
  private brandService = inject(BrandService);
  private areaService = inject(AreasService);



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
  }

  close() {
    this.dialogRef.close();
  }

  operate() {

    //UPDATE
    if (this.device != null && this.device.idDevice > 0) {
      console.log('📤 Enviando al backend (UPDATE):', this.device);
      this.deviceService.update(this.device.idDevice, this.device).pipe(
        switchMap(() => this.deviceService.findAll()),
        tap(data => this.deviceService.setDeviceChange(data)),
        tap(() => this.deviceService.setMessageChange('UPDATED!'))
      ).subscribe();
    } else {
      //SAVE
      this.deviceService.save(this.device).pipe(
        switchMap(() => this.deviceService.findAll()),
        tap(data => this.deviceService.setDeviceChange(data)),
        tap(() => this.deviceService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();
  }

  compareArea(a1: Area, a2: Area): boolean {
    return a1 && a2 ? a1.idArea === a2.idArea : a1 === a2;
  }

  compareBrand(b1: Brand, b2: Brand): boolean {
    return b1 && b2 ? b1.idBrand === b2.idBrand : b1 === b2;
  }
}
