import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { StatusDevice } from '../../model/statusDevice';
import { StatusDeviceService } from '../../services/status-device.service';
import { StatusDeviceDialogComponent } from './status-device-dialog/status-device-dialog.component';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-status-device',
  imports: [
    MaterialModule
  ],
  templateUrl: './status-device.component.html',
  styleUrl: './status-device.component.css'
})
export class StatusDeviceComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<StatusDevice>;
  displayedColumns: string[] = [ 'description', 'actions' ]

  private statusdeviceService = inject(StatusDeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.statusdeviceService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.statusdeviceService.getStatusDeviceChange().subscribe(data => this.createTable(data));
    this.statusdeviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: StatusDevice[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(statusdevice?: StatusDevice){
    this._dialog.open(StatusDeviceDialogComponent, {
      width: '750px',
      data: statusdevice ?? null,
      disableClose: true
    })
  }

  delete(id: number){
    this.statusdeviceService.delete(id).pipe(
      switchMap( () => this.statusdeviceService.findAll() ),
      tap( data => this.statusdeviceService.setStatusDeviceChange(data)),
      tap( () => this.statusdeviceService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}
