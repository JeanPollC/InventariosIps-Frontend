import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { UserType } from '../../model/userType';
import { UserTypeService } from '../../services/user-type.service';
import { UserTypeDialogComponent } from './user-type-dialog/user-type-dialog.component';

@Component({
  selector: 'app-user-type',
  imports: [
    MaterialModule
  ],
  templateUrl: './user-type.component.html',
  styleUrl: './user-type.component.css'
})
export class UserTypeComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<UserType>;
  displayedColumns: string[] = [ 'usertype', 'actions' ]

  private userTypeService = inject(UserTypeService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.userTypeService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.userTypeService.getUserTypeChange().subscribe(data => this.createTable(data));
    this.userTypeService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: UserType[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(usertype?: UserType){
    this._dialog.open(UserTypeDialogComponent, {
      width: '750px',
      data: usertype ?? null,
      disableClose: true
    })
  }

  delete(id: number){
    this.userTypeService.delete(id).pipe(
      switchMap( () => this.userTypeService.findAll() ),
      tap( data => this.userTypeService.setUserTypeChange(data)),
      tap( () => this.userTypeService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}