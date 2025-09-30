import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { Brand } from '../../model/brand';
import { BrandService } from '../../services/brand.service';
import { MatSort } from '@angular/material/sort';

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

  ngOnInit(): void {
    this.brandService.findAll().subscribe(data => {
      this.createTable(data);
    })
  }

  createTable(data: Brand[]){
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.matSort
  }
}
