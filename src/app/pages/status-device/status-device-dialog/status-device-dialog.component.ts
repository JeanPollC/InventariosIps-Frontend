import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';
import { StatusDevice } from '../../../model/statusDevice';
import { StatusDeviceService } from '../../../services/status-device.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-status-device-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './status-device-dialog.component.html',
  styleUrl: './status-device-dialog.component.css'
})
export class StatusDeviceDialogComponent {

  statusdevice: StatusDevice
  title: string = 'Nueva Estado'

  readonly dialogRef = inject(MatDialogRef<StatusDeviceDialogComponent>);
  readonly data = inject<StatusDevice>(MAT_DIALOG_DATA);
  readonly statusdeviceService = inject(StatusDeviceService);


  ngOnInit(){
    this.statusdevice = {... this.data};
    if(this.data){
      this.title = 'Editar Estado';
    }
  }

  close(){
    this.dialogRef.close();
  }

  operate(){
    //UPDATE
    if (this.statusdevice != null && this.statusdevice.idStatusDevice > 0){
      this.statusdeviceService.update(this.statusdevice.idStatusDevice, this.statusdevice).pipe(
        switchMap( () => this.statusdeviceService.findAll()),
        tap( data => this.statusdeviceService.setStatusDeviceChange(data)),
        tap( () => this.statusdeviceService.setMessageChange('UPDATED!'))
      ).subscribe();
    }else {
      //SAVE
      this.statusdeviceService.save(this.statusdevice).pipe(
        switchMap( () => this.statusdeviceService.findAll()),
        tap( data => this.statusdeviceService.setStatusDeviceChange(data)),
        tap( () => this.statusdeviceService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }

}
