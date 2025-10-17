import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, switchMap, tap } from 'rxjs';
import { User } from '../../../model/user';
import { UserService } from '../../../services/user.service';
import { MaterialModule } from '../../../material/material.module';
import { UserTypeService } from '../../../services/user-type.service';
import { UserType } from '../../../model/userType';

@Component({
  selector: 'app-user-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css'
})
export class UserDialogComponent {

  user: User
  title: string = 'Nuevo Usuario'

  userTypes$: Observable<UserType[]>

  readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  readonly data = inject<User>(MAT_DIALOG_DATA);
  readonly userService = inject(UserService);
  readonly userTypeService = inject(UserTypeService);


  ngOnInit(){
    this.user = {... this.data};
    if(this.data){
      this.title = 'Editar Usuario';
    }

    this.userTypes$ = this.userTypeService.findAll();
  }

  close(){
    this.dialogRef.close();
  }

  operate(){
    //UPDATE
    if (this.user != null && this.user.idUser > 0){
      this.userService.update(this.user.idUser, this.user).pipe(
        switchMap( () => this.userService.findAll()),
        tap( data => this.userService.setUserChange(data)),
        tap( () => this.userService.setMessageChange('UPDATED!'))
      ).subscribe();
    }else {
      //SAVE
      this.userService.save(this.user).pipe(
        switchMap( () => this.userService.findAll()),
        tap( data => this.userService.setUserChange(data)),
        tap( () => this.userService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }

}
