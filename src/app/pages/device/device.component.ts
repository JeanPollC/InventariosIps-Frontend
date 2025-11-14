import { Component, inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import { Device } from '../../model/device';
import { DeviceService } from '../../services/device.service';
import { MaterialModule } from '../../material/material.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DeviceDetails } from '../../model/deviceDetails';
import { DeviceDialogComponent } from './device-dialog/device-dialog.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-devices',
  imports: [
    MaterialModule,
    MatExpansionModule,
    CommonModule,
  ],
  templateUrl: './device.component.html',
  styleUrl: './device.component.css'
})
export class DeviceComponent {

  // 🎯 Variables para manejar la paginación
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;

  currentFilter: string = '';

  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('detailsDialog') detailsDialogTemplate;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: MatTableDataSource<Device>;
  displayedColumns: string[] = ['name', 'deviceType', 'area', 'user', 'statusDevice', 'brand', 'actions']

  private deviceService = inject(DeviceService);
  private _dialog = inject(MatDialog);
  private _snackbar = inject(MatSnackBar);


  ngOnInit(): void {
    this.loadPage(this.currentPage, this.pageSize, this.currentFilter);
    this.deviceService.getDeviceChange().subscribe(data => this.createTable(data));
    this.deviceService.getMessageChange().subscribe(message => this._snackbar.open(message, 'INFO', { duration: 2000 }))
  }

  loadPage(page: number, size: number, filter: string = ''): void {
    this.deviceService.findAllPageable(page, size, filter).subscribe((pageData) => {
      this.totalElements = pageData.totalElements;
      this.currentPage = pageData.number;
      this.pageSize = pageData.size;

      this.createTable(pageData.content);
    });
  }

  onPageChange(event: PageEvent): void {
    let newPageIndex = event.pageIndex;

    // Si el tamaño de página ha cambiado, queremos volver a la página 0.
    if (this.pageSize !== event.pageSize) {
        newPageIndex = 0;
    }

    // 1. Actualiza las variables del componente
    this.pageSize = event.pageSize;
    this.currentPage = newPageIndex; // Usar el nuevo índice

    // 2. Llama a la API con los valores ajustados
    this.loadPage(newPageIndex, this.pageSize, this.currentFilter);

    // 3. Opcional, forzar el Paginator a mostrar el índice 0 si se cambió el tamaño.
    // Esto es especialmente útil si el paginator no se ajusta visualmente de inmediato.
    if (this.paginator && this.paginator.pageIndex !== newPageIndex) {
        this.paginator.pageIndex = newPageIndex;
    }
  }


  // PREDICADO PARA ORDENAMIENTO/FILTRADO LOCAL DE CAMPOS ANIDADOS
  customFilterPredicate = (data: Device, filter: string): boolean => {
    const deviceData = data as any;

    // y si se usa el método createTable para actualizar datos localmente.
    const dataStr = (deviceData.name +
        deviceData.deviceType +
        (deviceData as any).userName + // Incluye el campo dinámico
        (deviceData.area?.nameArea || '') +
        (deviceData.statusDevice?.nameStatus || '') +
        (deviceData.brand?.description || '')
    ).toLowerCase();

    return dataStr.includes(filter);
  }

  createTable(data: Device[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.filterPredicate = this.customFilterPredicate;

    data.forEach(device => {
    // Verificamos si el dispositivo está prestado o asignado
    const status = (device as any)?.statusDevice?.nameStatus?.toLowerCase() || '';

    // Si está prestado, usamos el servicio correspondiente
    if (status.includes('prestado')) {
      this.deviceService.getNameUserByNameDeviceLoan(device.name).subscribe({
        next: userName => (device as any).userName = userName,
        error: () => (device as any).userName = 'N/A'
      });
    }
    // Si está asignado, usamos el otro servicio
    else if (status.includes('asignado')) {
      this.deviceService.getNameUserByNameDevice(device.name).subscribe({
        next: userName => (device as any).userName = userName,
        error: () => (device as any).userName = 'N/A'
      });
    }
  });

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'area':
          return item.area?.nameArea?.toLowerCase() || '';
        case 'statusDevice':
          return item.statusDevice?.description?.toLowerCase() || '';
        case 'brand':
          return item.brand?.description?.toLowerCase() || '';
        case 'user':
          return item.userName?.toLowerCase() || '';
        default:
          return item[property]?.toString().toLowerCase() || '';
      }
    };

    if (this.matSort) {
      this.dataSource.sort = this.matSort;
    }

  }

  viewDetails(device: Device) {

    this._dialog.open(this.detailsDialogTemplate, {
      width: '750px',
      data: device
    });
  }

  openEditDialog(data?: any) {
    this._dialog.closeAll(); // Cierra el dialogo abirto antes de abrir el nuevo

    const device: Device = {
      idDevice: data?.idDevice ?? 0,
      name: data?.name ?? '',
      idArea: data?.area.idArea ?? null,
      idBrand: data?.brand.idBrand ?? null,
      deviceType: data?.deviceType ?? '',
      idStatusDevice: data?.statusDevice.idStatusDevice ?? 0
    };

    const deviceDetails: DeviceDetails = {
      storage: data?.storage ?? '',
      graphics_card: data?.graphics_card ?? '',
      ram: data?.ram ?? '',
      processor: data?.processor ?? '',
      product_code: data?.product_code ?? '',
      serial_no: data?.serial_no ?? '',
      windows_edition: data?.windows_edition ?? '',
      idWarranty: data?.warranty?.idWarranty ?? null,
      observation: data?.observation ?? '',
      lifecycleFile: data?.lifecycleFile ?? ''
    };

    this._dialog.open(DeviceDialogComponent, {
      width: '750px',
      data: {
        device,
        deviceDetails
      }
    })
  }

  delete(id: number) {
    this.deviceService.delete(id).pipe(
      switchMap(() => this.deviceService.findAllPageable(this.currentPage, this.pageSize, this.currentFilter)),
      tap( pageData => {
            // Actualizar el total y los datos de la tabla después del borrado
            this.totalElements = pageData.totalElements;
            this.dataSource = new MatTableDataSource(pageData.content);
            this.dataSource.sort = this.matSort;
            this.dataSource.filterPredicate = this.customFilterPredicate;

            this.deviceService.setMessageChange('DELETED!')
        })
    ).subscribe();
  }

  applyFilter(e: any) {
    const filterValue = (e.target.value as string).trim().toLocaleLowerCase();

    this.currentFilter = filterValue;

    this.loadPage(0, this.pageSize, this.currentFilter);

    if (this.paginator){
      this.paginator.pageIndex = 0;
    }
  }

  openPdf(url: string) {
  if (url) {
    window.open(url, '_blank');
  } else {
    alert('No hay documento adjunto para este préstamo.');
  }}

}

