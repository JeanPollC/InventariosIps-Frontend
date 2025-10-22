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

@Component({
  selector: 'app-loans',
  imports: [
    MaterialModule
  ],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css'
})
export class LoansComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<Loans>;
  displayedColumns: string[] = [ 'user', 'device','startDateLoan', 'endDateLoan', 'loanDocument', 'actions' ]

  loans: Loans[];

  private loansService = inject(LoansService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loansService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.loansService.findAll().subscribe(data => this.loans = data);
    this.loansService.getLoansChange().subscribe(data => this.createTable(data));
    this.loansService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: Loans[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(loans?: Loans){
    this._dialog.open(LoansDialogComponent, {
      width: '750px',
      data: loans ?? null,
      disableClose: true
    })
  }

  delete(id: number){
    this.loansService.delete(id).pipe(
      switchMap( () => this.loansService.findAll() ),
      tap( data => this.loansService.setLoansChange(data)),
      tap( () => this.loansService.setMessageChange('DELETED!'))
    ).subscribe();
  }

  openPdf(url: string) {
  if (url) {
    window.open(url, '_blank');
  } else {
    alert('No hay documento adjunto para este préstamo.');
  }
}

}
