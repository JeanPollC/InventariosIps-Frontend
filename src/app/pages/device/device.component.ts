import { Component, inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { Device } from '../../model/device';
import { DeviceService } from '../../services/device.service';
import { MaterialModule } from '../../material/material.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { deviceDetails } from '../../model/deviceDetails';
import { DeviceDialogComponent } from './device-dialog/device-dialog.component';

@Component({
  selector: 'app-devices',
  imports: [
    MaterialModule,
    MatExpansionModule,
    CommonModule,
  ],
  templateUrl: './device.component.html',
  styleUrl: './device.component.css'
})
export class DeviceComponent {

  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('detailsDialog') detailsDialogTemplate;

  dataSource: MatTableDataSource<Device>;
  displayedColumns: string[] = ['deviceType', 'idBrand', 'idUser', 'idStatusDevice', 'actions']

  private deviceService = inject(DeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.deviceService.findAll().subscribe(data => {
      console.log(data);
      this.createTable(data);
    });
    this.deviceService.getDeviceChange().subscribe(data => this.createTable(data));
    this.deviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', { duration: 2000 }))
  }

  createTable(data: Device[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  viewDetails(device: Device) {
    const details: deviceDetails = {
      description: device.description,
      idWarranty: device.idWarranty,
      lifecycleFile: device.lifecycleFile
    };

    this._dialog.open(this.detailsDialogTemplate, {
      width: '750px',
      data: details
    });
  }

  openEditDialog(warranty?: Device) {
    this._dialog.closeAll(); // Cierra el dialogo abirto antes de abrir el nuevo

    this._dialog.open(DeviceDialogComponent, {
      width: '1000px',
      height: '700px',
      data: warranty ?? null,
      //disableClose: true
    })
  }

  delete(id: number) {
    this.deviceService.delete(id).pipe(
      switchMap(() => this.deviceService.findAll()),
      tap(data => this.deviceService.setDeviceChange(data)),
      tap(() => this.deviceService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}

