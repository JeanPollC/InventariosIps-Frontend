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

@Component({
  selector: 'app-user',
  imports: [
    MaterialModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  @ViewChild(MatSort) matSort: MatSort;

  dataSource: MatTableDataSource<User>;
  displayedColumns: string[] = [ 'name', 'lastName', 'email', 'userType', 'status', 'actions' ]

  userType: UserType[];

  private userService = inject(UserService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);
  private userTypeService = inject(UserTypeService);

  ngOnInit(): void {
    this.userService.findAll().subscribe(data => {
      this.createTable(data);
    });
    this.userTypeService.findAll().subscribe(data => this.userType = data);
    this.userService.getUserChange().subscribe(data => this.createTable(data));
    this.userService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', {duration: 2000}))
  }

  createTable(data: User[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }

  openDialog(user?: User){
    this._dialog.open(UserDialogComponent, {
      width: '750px',
      data: user ?? null,
      disableClose: true
    })
  }

  delete(id: number){
    this.userService.delete(id).pipe(
      switchMap( () => this.userService.findAll() ),
      tap( data => this.userService.setUserChange(data)),
      tap( () => this.userService.setMessageChange('DELETED!'))
    ).subscribe();
  }
}
