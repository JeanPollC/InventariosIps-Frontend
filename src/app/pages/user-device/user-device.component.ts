import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { UserDevice } from '../../model/userDevice';
import { UserDeviceService } from '../../services/user-device.service';
import { UserDeviceDialogComponent } from './user-device-dialog/user-device-dialog.component';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-userdevice-device',
  imports: [
    MaterialModule
  ],
  templateUrl: './user-device.component.html',
  styleUrl: './user-device.component.css'
})
export class UserDeviceComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<UserDevice>;
  displayedColumns: string[] = [ 'user', 'device','assignmentDate', 'deliveryDate', 'status', 'actions' ]

  userDevice: UserDevice[];

  private userDeviceService = inject(UserDeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.userDeviceService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.userDeviceService.findAll().subscribe(data => this.userDevice = data);
    this.userDeviceService.getUserDeviceChange().subscribe(data => this.createTable(data));
    this.userDeviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: UserDevice[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(userDevice?: UserDevice){
    this._dialog.open(UserDeviceDialogComponent, {
      width: '750px',
      data: userDevice ?? null,
      disableClose: true
    })
  }

  delete(userDevice: UserDevice){
    this.userDeviceService.delete(userDevice.idUserDevice, userDevice).pipe(
      switchMap( () => this.userDeviceService.findAll() ),
      tap( data => this.userDeviceService.setUserDeviceChange(data)),
      tap( () => this.userDeviceService.setMessageChange('DELETED!'))
    ).subscribe();
  }

}
