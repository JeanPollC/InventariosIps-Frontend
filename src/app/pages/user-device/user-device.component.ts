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
  imports: [MaterialModule],
  templateUrl: './user-device.component.html',
  styleUrl: './user-device.component.css',
})
export class UserDeviceComponent {
  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<UserDevice>;
  displayedColumns: string[] = [
    'user',
    'device',
    'assignmentDate',
    'deliveryDate',
    'status',
    'actions',
  ];

  userDevice: UserDevice[];

  // 🎯 Variables para manejar la paginación
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  currentFilter: string = '';

  private userDeviceService = inject(UserDeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize, this.currentFilter);
    this.userDeviceService
      .getUserDeviceChange()
      .subscribe((data) => this.createTable(data));
    this.userDeviceService
      .getMessageChange()
      .subscribe((message) =>
        this._snackbar.open(message, 'INFO', { duration: 2000 })
      );
  }

  loadPage(page: number, size: number, filter: string = ''): void {
    this.userDeviceService
      .findAllPageable(page, size, filter)
      .subscribe((pageData) => {
        this.totalElements = pageData.totalElements;
        this.currentPage = pageData.number;
        this.pageSize = pageData.size;

        this.createTable(pageData.content);
      });
  }

  onPageChange(event: PageEvent): void {
    this.loadPage(event.pageIndex, event.pageSize, this.currentFilter);
  }

  // PREDICADO PARA ORDENAMIENTO/FILTRADO LOCAL DE CAMPOS ANIDADOS
  customFilterPredicate = (data: UserDevice, filter: string): boolean => {
    const deviceData = data as any;

    // y si se usa el método createTable para actualizar datos localmente.
    const dataStr = (
      (deviceData.user?.name || '') +
      (deviceData.device?.name || '') +
      deviceData.assignmentDate +
      deviceData.deliveryDate +
      deviceData.status
    ).toLowerCase();

    return dataStr.includes(filter);
  };

  createTable(data: UserDevice[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.filterPredicate = this.customFilterPredicate;

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'user':
          return item.user?.name?.toLowerCase() || '';
        case 'device':
          return item.device?.name?.toLowerCase() || '';
        default:
          return item[property]?.toString().toLowerCase() || '';
      }
    };

    if (this.matSort) {
      this.dataSource.sort = this.matSort;
    }
  }

  openDialog(userDevice?: UserDevice) {
    this._dialog.open(UserDeviceDialogComponent, {
      width: '750px',
      data: userDevice ?? null,
      disableClose: true,
    });
  }

  delete(userDevice: UserDevice) {
    this.userDeviceService
      .delete(userDevice.idUserDevice, userDevice)
      .pipe(
        switchMap(() =>
          this.userDeviceService.findAllPageable(
            this.currentPage,
            this.pageSize,
            this.currentFilter
          )
        ),
        tap((pageData) => {
          // Actualizar el total y los datos de la tabla después del borrado
          this.totalElements = pageData.totalElements;
          this.dataSource = new MatTableDataSource(pageData.content);
          this.dataSource.sort = this.matSort;
          this.dataSource.filterPredicate = this.customFilterPredicate;
          this.dataSource.paginator = this.paginator;

          this.userDeviceService.setMessageChange('DELETED!');
        })
      )
      .subscribe();
  }

  applyFilter(e: any) {
    const filterValue = (e.target.value as string).trim().toLocaleLowerCase();

    this.currentFilter = filterValue;

    this.loadPage(0, this.pageSize, this.currentFilter);

    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }
}
