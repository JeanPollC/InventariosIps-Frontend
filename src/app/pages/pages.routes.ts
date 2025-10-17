import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BrandComponent } from "./brand/brand.component";
import { WarrantyComponent } from "./warranty/warranty.component";
import { DeviceComponent } from "./device/device.component";
import { AreasComponent } from "./areas/areas.component";
import { StatusDeviceComponent } from "./status-device/status-device.component";
import { UserComponent } from "./user/user.component";

export const pagesRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent},
    { path: 'brand', component: BrandComponent},
    { path: 'warranty', component: WarrantyComponent},
    { path: 'device', component: DeviceComponent},
    { path: 'areas', component: AreasComponent},
    { path: 'statusDevice', component: StatusDeviceComponent},
    { path: 'user', component: UserComponent}
]