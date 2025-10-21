import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { Area } from '../../model/areas';
import { AreasService } from '../../services/areas.service';
import { AreasDialogComponent } from './areas-dialog/areas-dialog.component';

@Component({
  selector: 'app-area',
  imports: [
    MaterialModule
  ],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css'
})
export class AreasComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<Area>;
  displayedColumns: string[] = [ 'nameArea', 'actions' ]

  private areasService = inject(AreasService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.areasService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.areasService.getAreasChange().subscribe(data => this.createTable(data));
    this.areasService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: Area[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(area?: Area){
    this._dialog.open(AreasDialogComponent, {
      width: '750px',
      data: area ?? null,
      disableClose: true
    })
  }

  delete(id: number){
    this.areasService.delete(id).pipe(
      switchMap( () => this.areasService.findAll() ),
      tap( data => this.areasService.setAreasChange(data)),
      tap( () => this.areasService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}

