export enum PermissionEnum {
    // Nhóm Quyền liên quan tới Tuyến đường 
    ROUTE_CREATE = 'route:create',
    ROUTE_VIEW = 'route:view',
    ROUTE_EDIT = 'route:edit',
    ROUTE_DELETE = 'route:delete',

    // Nhóm Quyền liên quan tới Bus
    BUS_CREATE = 'bus:create',
    BUS_VIEW = 'bus:view',
    BUS_EDIT = 'bus:edit',
    BUS_DELETE = 'bus:delete',

    // Nhóm quyền liên quan tới trạm dừng 
    STATION_CREATE = 'station:create',
    STATION_VIEW = 'station:view',
    STATION_EDIT = 'station:edit',
    STATION_DELETE = 'station:delete',

    // Nhóm quyền liên quan đến user 
    USER_CREATE = 'user:create',
    USER_VIEW = 'user:view',
    USER_EDIT = 'user:edit',
    USER_DELETE = 'user:delete'
}