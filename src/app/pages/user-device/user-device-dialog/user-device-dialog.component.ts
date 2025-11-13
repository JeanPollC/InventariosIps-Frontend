import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, Observable, switchMap, tap } from 'rxjs';
import { UserDevice } from '../../../model/userDevice';
import { UserDeviceService } from '../../../services/user-device.service';
import { Device } from '../../../model/device';
import { User } from '../../../model/user';
import { DeviceService } from '../../../services/device.service';
import { UserService } from '../../../services/user.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-userdevice-device-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './user-device-dialog.component.html',
  styleUrl: './user-device-dialog.component.css'
})
export class UserDeviceDialogComponent {

  userDevice: UserDevice
  title: string = 'Nueva Asignación'

  users$: Observable<User[]>
  devices$: Observable<Device[]>

  readonly dialogRef = inject(MatDialogRef<UserDeviceDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  readonly userDeviceService = inject(UserDeviceService);
  readonly userService = inject(UserService);
  readonly deviceService = inject(DeviceService);

  private sortByName(a: { name: string }, b: { name: string }): number {
    const nameA = a.name ? a.name.toUpperCase() : '';
    const nameB = b.name ? b.name.toUpperCase() : '';

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  }

  ngOnInit() {
    if (this.data && this.data.idUserDevice > 0) {
      this.title = 'Editar Asignación ';
      this.userDevice = {
        idUserDevice: this.data.idUserDevice,
        idUser: this.data.user?.idUser,
        idDevice: this.data.device?.idDevice,
        assignmentDate: this.data.assignmentDate,
        deliveryDate: this.data.deliveryDate,
        status: this.data?.status,
      };

     // ✅ Al editar: incluir el dispositivo actual aunque no esté disponible
    this.devices$ = this.deviceService.getAvailableDevices().pipe(
      map(devices => {
        const currentDevice = this.data.device;
        if (currentDevice) {
          const exists = devices.some(d => d.idDevice === currentDevice.idDevice);
          if (!exists) {
            devices = [...devices, currentDevice];
          }
        }
        return devices.sort((a,b) => this.sortByName(a,b));
      })
    );

  } else {
    this.userDevice = new UserDevice();
    // ✅ Al crear: solo mostrar dispositivos disponibles
    this.devices$ = this.deviceService.getAvailableDevices().pipe(
        map(devices => devices.sort((a, b) => this.sortByName(a, b)))
    );
  }

    this.users$ = this.userService.findAll().pipe(
        map(users => users.sort((a, b) => this.sortByName(a, b)))
    );
  }

  close() {
    this.dialogRef.close();
  }

  operate() {
    //UPDATE
    if (this.userDevice != null && this.userDevice.idUserDevice > 0) {
      this.userDeviceService.update(this.userDevice.idUserDevice, this.userDevice).pipe(
        switchMap(() => this.userDeviceService.findAll()),
        tap(data => this.userDeviceService.setUserDeviceChange(data)),
        tap(() => this.userDeviceService.setMessageChange('UPDATED!'))
      ).subscribe();
    } else {
      //SAVE
      this.userDeviceService.save(this.userDevice).pipe(
        switchMap(() => this.userDeviceService.findAll()),
        tap(data => this.userDeviceService.setUserDeviceChange(data)),
        tap(() => this.userDeviceService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }


}
