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
import { MatPaginator, PageEvent } from '@angular/material/paginator';

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
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<UserDevice>;
  displayedColumns: string[] = [ 'user', 'device','assignmentDate', 'deliveryDate', 'status', 'actions' ]

  userDevice: UserDevice[];

  // 🎯 Variables para manejar la paginación
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  private userDeviceService = inject(UserDeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize);
    this.userDeviceService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.userDeviceService.findAll().subscribe(data => this.userDevice = data);
    this.userDeviceService.getUserDeviceChange().subscribe(data => this.createTable(data));
    this.userDeviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  loadPage(page: number, size: number): void {
    this.userDeviceService.findAllPageable(page, size).subscribe((pageData) => {
      this.totalElements = pageData.totalElements;
      this.currentPage = pageData.number;
      this.pageSize = pageData.size;

      this.dataSource = new MatTableDataSource(pageData.content);
      this.dataSource.sort = this.matSort;
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadPage(event.pageIndex, event.pageSize);
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
      switchMap( () => this.userDeviceService.findAllPageable(this.currentPage, this.pageSize)),
      tap( pageData => {
            // Actualizar el total y los datos de la tabla después del borrado
            this.totalElements = pageData.totalElements;
            this.dataSource = new MatTableDataSource(pageData.content);
            this.dataSource.sort = this.matSort;

            this.userDeviceService.setMessageChange('DELETED!')
        })
    ).subscribe();
  }

}
