import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BrandComponent } from "./brand/brand.component";
import { WarrantyComponent } from "./warranty/warranty.component";
import { DeviceComponent } from "./device/device.component";

export const pagesRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent},
    { path: 'brand', component: BrandComponent},
    { path: 'warranty', component: WarrantyComponent},
    { path: 'device', component: DeviceComponent}
]