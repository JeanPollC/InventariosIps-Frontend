import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { Warranty } from '../../model/warranty';
import { WarrantyService } from '../../services/warraty.service';
import { WarrantyDialogComponent } from './warranty-dialog/warranty-dialog.component';

@Component({
  selector: 'app-warranty',
  imports: [
    MaterialModule
  ],
  templateUrl: './warranty.component.html',
  styleUrl: './warranty.component.css'
})
export class WarrantyComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<Warranty>;
  displayedColumns: string[] = [ 'status', 'startDate', 'endDate', 'actions' ]

  private warrantyService = inject(WarrantyService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.warrantyService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.warrantyService.getWarrantyChange().subscribe(data => this.createTable(data));
    this.warrantyService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: Warranty[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(warranty?: Warranty){
    this._dialog.open(WarrantyDialogComponent, {
      width: '750px',
      data: warranty ?? null,
      disableClose: true
    })
  }

  delete(id: number){
    this.warrantyService.delete(id).pipe(
      switchMap( () => this.warrantyService.findAll() ),
      tap( data => this.warrantyService.setWarrantyChange(data)),
      tap( () => this.warrantyService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}

