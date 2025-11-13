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

  private loansService = inject(LoansService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize);
    this.loansService.findAll().subscribe((data) => {
      this.createTable(data);
    });
    this.loansService
      .getLoansChange()
      .subscribe(() => this.loadPage(0, this.pageSize));
    this.loansService
      .getMessageChange()
      .subscribe((message) =>
        this._snackbar.open(message, 'INFO', { duration: 2000 })
      );
  }

  loadPage(page: number, size: number): void {
    this.loansService.findAllPageable(page, size).subscribe((pageData) => {
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

  createTable(data: Loans[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort;
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

            this.loansService.setMessageChange('DELETED!')
        })
      )
      .subscribe();
  }

  openPdf(url: string) {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No hay documento adjunto para este préstamo.');
    }
  }
}
