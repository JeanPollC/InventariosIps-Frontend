import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { Device } from '../../../model/device';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-device-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './device-dialog.component.html',
  styleUrl: './device-dialog.component.css'
})
export class DeviceDialogComponent {

  device: Device
  title: string = 'Nueva Dispositivo'

  readonly dialogRef = inject(MatDialogRef<DeviceDialogComponent>);
  readonly data = inject<Device>(MAT_DIALOG_DATA);
  readonly deviceService = inject(DeviceService);
  
  
    ngOnInit(){
      this.device = {... this.data};
      if(this.data){
        this.title = 'Editar Dispositivo';
      }
    }
  
    close(){
      this.dialogRef.close();
    }
  
    operate(){
      //UPDATE
      if (this.device != null && this.device.idDevice > 0){
        this.deviceService.update(this.device.idDevice, this.device).pipe(
          switchMap( () => this.deviceService.findAll()),
          tap( data => this.deviceService.setDeviceChange(data)),
          tap( () => this.deviceService.setMessageChange('UPDATED!'))
        ).subscribe();
      }else {
        //SAVE
        this.deviceService.save(this.device).pipe(
          switchMap( () => this.deviceService.findAll()),
          tap( data => this.deviceService.setDeviceChange(data)),
          tap( () => this.deviceService.setMessageChange('CREATED!'))
        ).subscribe();
      }
  
      this.close();
  
    }
  

}
