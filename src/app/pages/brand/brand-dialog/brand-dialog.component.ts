import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Brand } from '../../../model/brand';
import { BrandService } from '../../../services/brand.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-brand-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './brand-dialog.component.html',
  styleUrl: './brand-dialog.component.css'
})
export class BrandDialogComponent {

  brand: Brand
  title: string = 'Nueva Marca'

  readonly dialogRef = inject(MatDialogRef<BrandDialogComponent>);
  readonly data = inject<Brand>(MAT_DIALOG_DATA);
  readonly brandService = inject(BrandService);


  ngOnInit(){
    this.brand = {... this.data};
    if(this.data){
      this.title = 'Editar Marca';
    }
  }

  close(){
    this.dialogRef.close();
  }

  operate(){
    //UPDATE
    if (this.brand != null && this.brand.idBrand > 0){
      this.brandService.update(this.brand.idBrand, this.brand).pipe(
        switchMap( () => this.brandService.findAll()),
        tap( data => this.brandService.setBrandChange(data)),
        tap( () => this.brandService.setMessageChange('UPDATED!'))
      ).subscribe();
    }else {
      //SAVE
      this.brandService.save(this.brand).pipe(
        switchMap( () => this.brandService.findAll()),
        tap( data => this.brandService.setBrandChange(data)),
        tap( () => this.brandService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }

}
