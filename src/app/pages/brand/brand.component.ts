import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { Brand } from '../../model/brand';
import { BrandService } from '../../services/brand.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BrandDialogComponent } from './brand-dialog/brand-dialog.component';
import { switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-brand',
  imports: [
    MaterialModule
  ],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css'
})
export class BrandComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<Brand>;
  displayedColumns: string[] = [ 'brands', 'actions' ]

  private brandService = inject(BrandService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.brandService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.brandService.getBrandChange().subscribe(data => this.createTable(data));
    this.brandService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: Brand[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(brand?: Brand){
    this._dialog.open(BrandDialogComponent, {
      width: '750px',
      data: brand ?? null,
      disableClose: true
    })
  }

  delete(brand: Brand){
    this.brandService.delete(brand.idBrand, brand).pipe(
      switchMap( () => this.brandService.findAll() ),
      tap( data => this.brandService.setBrandChange(data)),
      tap( () => this.brandService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}
