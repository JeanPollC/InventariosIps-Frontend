import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { User } from '../../model/user';
import { UserService } from '../../services/user.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { UserTypeService } from '../../services/user-type.service';
import { UserType } from '../../model/userType';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-user',
  imports: [MaterialModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<User>;
  displayedColumns: string[] = [
    'name',
    'lastName',
    'email',
    'userType',
    'status',
    'actions',
  ];

  userType: UserType[];

  // 🎯 Variables para manejar la paginación
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  currentFilter: string = '';

  private userService = inject(UserService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);
  private userTypeService = inject(UserTypeService);

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize, this.currentFilter);
    this.userService
      .getUserChange()
      .subscribe(() => this.loadPage(0, this.pageSize));
    this.userService
      .getMessageChange()
      .subscribe((message) =>
        this._snackbar.open(message, 'INFO', { duration: 2000 })
      );
  }

  loadPage(page: number, size: number, filter: string = ''): void {
    this.userService.findAllPageable(page, size, filter).subscribe((pageData) => {
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
    customFilterPredicate = (data: User, filter: string): boolean => {
      const deviceData = data as any;

      // y si se usa el método createTable para actualizar datos localmente.
      const dataStr = (
        (deviceData.userType?.userType || '') +
        deviceData.name +
        deviceData.lastName +
        deviceData.email +
        deviceData.status
      ).toLowerCase();

      return dataStr.includes(filter);
    };

  createTable(data: User[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.filterPredicate = this.customFilterPredicate;

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'userType':
          return item.userType?.userType?.toLowerCase() || '';
        default:
          return item[property]?.toString().toLowerCase() || '';
      }
    };

    if (this.matSort) {
      this.dataSource.sort = this.matSort;
    }

  }

  openDialog(user?: User) {
    this._dialog.open(UserDialogComponent, {
      width: '750px',
      data: user ?? null,
      disableClose: true,
    });
  }

  delete(user: User) {
    this.userService
      .delete(user.idUser, user)
      .pipe(
        switchMap(() => this.userService.findAllPageable(this.currentPage, this.pageSize, this.currentFilter)),
        tap( pageData => {
            // Actualizar el total y los datos de la tabla después del borrado
            this.totalElements = pageData.totalElements;
            this.dataSource = new MatTableDataSource(pageData.content);
            this.dataSource.sort = this.matSort;
            this.dataSource.filterPredicate = this.customFilterPredicate;

            this.userService.setMessageChange('DELETED!')
        })
      ).subscribe();
  }

  applyFilter(e: any) {
    const filterValue = (e.target.value as string).trim().toLocaleLowerCase();

    this.currentFilter = filterValue;

    this.loadPage(0, this.pageSize, this.currentFilter);

    if (this.paginator){
      this.paginator.pageIndex = 0;
    }
  }

}
