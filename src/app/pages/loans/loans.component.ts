import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { Loans } from '../../model/loans';
import { LoansService } from '../../services/loans.service';
import { LoansDialogComponent } from './loans-dialog/loans-dialog.component';
import { MaterialModule } from '../../material/material.module';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-loans',
  imports: [MaterialModule],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css',
})
export class LoansComponent {
  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<Loans>;
  displayedColumns: string[] = [
    'user',
    'device',
    'startDateLoan',
    'endDateLoan',
    'loanDocument',
    'actions',
  ];

  loans: Loans[];

  // 🎯 Variables para manejar la paginación
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  currentFilter: string = '';

  private loansService = inject(LoansService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize, this.currentFilter);
    this.loansService
      .getLoansChange()
      .subscribe(() => this.loadPage(0, this.pageSize));
    this.loansService
      .getMessageChange()
      .subscribe((message) =>
        this._snackbar.open(message, 'INFO', { duration: 2000 })
      );
  }

  loadPage(page: number, size: number, filter: string = ''): void {
    this.loansService.findAllPageable(page, size, filter).subscribe((pageData) => {
      this.totalElements = pageData.totalElements;
      this.currentPage = pageData.number;
      this.pageSize = pageData.size;

      this.createTable(pageData.content);
    });
  }

  onPageChange(event: PageEvent): void {
    let newPageIndex = event.pageIndex;

    // Si el tamaño de página ha cambiado, queremos volver a la página 0.
    if (this.pageSize !== event.pageSize) {
        newPageIndex = 0;
    }

    // 1. Actualiza las variables del componente
    this.pageSize = event.pageSize;
    this.currentPage = newPageIndex; // Usar el nuevo índice

    // 2. Llama a la API con los valores ajustados
    this.loadPage(newPageIndex, this.pageSize, this.currentFilter);

    // 3. forzar el Paginator a mostrar el índice 0 si se cambió el tamaño.
    // Esto es especialmente útil si el paginator no se ajusta visualmente de inmediato.
    if (this.paginator && this.paginator.pageIndex !== newPageIndex) {
        this.paginator.pageIndex = newPageIndex;
    }
  }


    // PREDICADO PARA ORDENAMIENTO/FILTRADO LOCAL DE CAMPOS ANIDADOS
    customFilterPredicate = (data: Loans, filter: string): boolean => {
      const deviceData = data as any;

    // y si se usa el método createTable para actualizar datos localmente.
    const dataStr = (
      (deviceData.user?.name || '') +
      (deviceData.device?.name || '') +
      deviceData.startDateLoan +
      deviceData.endDateLoan
    ).toLowerCase();

    return dataStr.includes(filter);
  };

  createTable(data: Loans[]) {
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

  openDialog(loans?: Loans) {
    this._dialog.open(LoansDialogComponent, {
      width: '750px',
      data: loans ?? null,
      disableClose: true,
    });
  }

  delete(loan: Loans) {
    this.loansService
      .delete(loan.idLoans, loan)
      .pipe(
        switchMap(() => this.loansService.findAllPageable(this.currentPage, this.pageSize)),
        tap( pageData => {
            // Actualizar el total y los datos de la tabla después del borrado
            this.totalElements = pageData.totalElements;
            this.dataSource = new MatTableDataSource(pageData.content);
            this.dataSource.sort = this.matSort;
            this.dataSource.filterPredicate = this.customFilterPredicate;

            this.loansService.setMessageChange('DELETED!')
        })
      )
      .subscribe();
  }

  applyFilter(e: any) {
    const filterValue = (e.target.value as string).trim().toLocaleLowerCase();

    this.currentFilter = filterValue;

    this.loadPage(0, this.pageSize, this.currentFilter);

    if (this.paginator){
      this.paginator.pageIndex = 0;
    }
  }

  openPdf(url: string) {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No hay documento adjunto para este préstamo.');
    }
  }
}
