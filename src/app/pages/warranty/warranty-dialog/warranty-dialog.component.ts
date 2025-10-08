import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';
import { Warranty } from '../../../model/warranty';
import { WarrantyService } from '../../../services/warraty.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-warranty-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './warranty-dialog.component.html',
  styleUrl: './warranty-dialog.component.css'
})
export class WarrantyDialogComponent {

  warranty: Warranty
  title: string = 'Nueva Garantia'

  readonly dialogRef = inject(MatDialogRef<WarrantyDialogComponent>);
  readonly data = inject<Warranty>(MAT_DIALOG_DATA);
  readonly warrantyService = inject(WarrantyService);


  ngOnInit(){
    this.warranty = {... this.data};
    if(this.data){
      this.title = 'Editar Garantia';
    }
  }

  close(){
    this.dialogRef.close();
  }

  operate(){
    //UPDATE
    if (this.warranty != null && this.warranty.idWarranty > 0){
      this.warrantyService.update(this.warranty.idWarranty, this.warranty).pipe(
        switchMap( () => this.warrantyService.findAll()),
        tap( data => this.warrantyService.setWarrantyChange(data)),
        tap( () => this.warrantyService.setMessageChange('UPDATED!'))
      ).subscribe();
    }else {
      //SAVE
      this.warrantyService.save(this.warranty).pipe(
        switchMap( () => this.warrantyService.findAll()),
        tap( data => this.warrantyService.setWarrantyChange(data)),
        tap( () => this.warrantyService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }

}

