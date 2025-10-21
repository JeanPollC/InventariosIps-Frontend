import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';
import { UserType } from '../../../model/userType';
import { UserTypeService } from '../../../services/user-type.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-user-type-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './user-type-dialog.component.html',
  styleUrl: './user-type-dialog.component.css'
})
export class UserTypeDialogComponent {

  usertype: UserType
  title: string = 'Nueva Estado'

  readonly dialogRef = inject(MatDialogRef<UserTypeDialogComponent>);
  readonly data = inject<UserType>(MAT_DIALOG_DATA);
  readonly usertypeService = inject(UserTypeService);


  ngOnInit(){
    this.usertype = {... this.data};
    if(this.data){
      this.title = 'Editar Estado';
    }
  }

  close(){
    this.dialogRef.close();
  }

  operate(){
    //UPDATE
    if (this.usertype != null && this.usertype.idUserType > 0){
      this.usertypeService.update(this.usertype.idUserType, this.usertype).pipe(
        switchMap( () => this.usertypeService.findAll()),
        tap( data => this.usertypeService.setUserTypeChange(data)),
        tap( () => this.usertypeService.setMessageChange('UPDATED!'))
      ).subscribe();
    }else {
      //SAVE
      this.usertypeService.save(this.usertype).pipe(
        switchMap( () => this.usertypeService.findAll()),
        tap( data => this.usertypeService.setUserTypeChange(data)),
        tap( () => this.usertypeService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }

}
