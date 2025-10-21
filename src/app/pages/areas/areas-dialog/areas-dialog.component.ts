import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';
import { Area } from '../../../model/areas';
import { AreasService } from '../../../services/areas.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-areas-dialog',
  imports: [
    MaterialModule
  ],
  templateUrl: './areas-dialog.component.html',
  styleUrl: './areas-dialog.component.css'
})
export class AreasDialogComponent {

  area: Area
  title: string = 'Nueva Area'

  readonly dialogRef = inject(MatDialogRef<AreasDialogComponent>);
  readonly data = inject<Area>(MAT_DIALOG_DATA);
  readonly areaService = inject(AreasService);


  ngOnInit(){
    this.area = {... this.data};
    if(this.data){
      this.title = 'Editar Area';
    }
  }

  close(){
    this.dialogRef.close();
  }

  operate(){
    //UPDATE
    if (this.area != null && this.area.idArea > 0){
      this.areaService.update(this.area.idArea, this.area).pipe(
        switchMap( () => this.areaService.findAll()),
        tap( data => this.areaService.setAreasChange(data)),
        tap( () => this.areaService.setMessageChange('UPDATED!'))
      ).subscribe();
    }else {
      //SAVE
      this.areaService.save(this.area).pipe(
        switchMap( () => this.areaService.findAll()),
        tap( data => this.areaService.setAreasChange(data)),
        tap( () => this.areaService.setMessageChange('CREATED!'))
      ).subscribe();
    }

    this.close();

  }

}

