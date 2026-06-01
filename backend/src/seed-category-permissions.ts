/**
 * Seed nhóm quyền (CategoryPermission) và gán categoryPermissionId cho 25 permission hiện có.
 *
 * Chạy: npm run seed:category-permissions
 * Script idempotent: chạy lại sẽ không tạo trùng category (theo name), chỉ cập nhật permission chưa có category.
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Permission } from './database/entities/permission.entity';
import { CategoryPermission } from './database/entities/categoryPermission.entity';

config();

/** 6 nhóm quyền tương ứng 25 permission trong DB */
const CATEGORY_DEFINITIONS: { name: string; description: string }[] = [
    {
        name: 'Quản lý xe bus',
        description: 'bus:create, bus:view, bus:edit, bus:delete',
    },
    {
        name: 'Quản lý tuyến đường',
        description: 'route:create, route:view, route:edit, route:delete',
    },
    {
        name: 'Quản lý trạm dừng',
        description: 'station:create, station:view, station:edit, station:delete',
    },
    {
        name: 'Quản lý người dùng',
        description: 'user:create, user:view, user:edit, user:delete',
    },
    {
        name: 'Quản lý vai trò',
        description: 'role:create, role:view, role:edit, role:delete',
    },
    {
        name: 'Quản lý quyền',
        description: 'permission:assign, permission:create, permission:view, permission:edit, permission:delete',
    },
];

/**
 * Map prefix permission name -> tên nhóm quyền
 * VD: station:create -> Quản lý trạm dừng
 */
const PERMISSION_PREFIX_TO_CATEGORY: Record<string, string> = {
    bus: 'Quản lý xe bus',
    route: 'Quản lý tuyến đường',
    station: 'Quản lý trạm dừng',
    user: 'Quản lý người dùng',
    role: 'Quản lý vai trò',
    permission: 'Quản lý quyền',
};

/** 25 permission dự kiến (đối chiếu với seed-permissions.ts) */
const EXPECTED_PERMISSIONS = [
    'bus:create',
    'bus:delete',
    'bus:edit',
    'bus:view',
    'permission:assign',
    'permission:create',
    'permission:delete',
    'permission:edit',
    'permission:view',
    'role:create',
    'role:delete',
    'role:edit',
    'role:view',
    'route:create',
    'route:delete',
    'route:edit',
    'route:view',
    'station:create',
    'station:delete',
    'station:edit',
    'station:view',
    'user:create',
    'user:delete',
    'user:edit',
    'user:view',
] as const;

function resolveCategoryName(permissionName: string): string | null {
    const prefix = permissionName.split(':')[0];
    return PERMISSION_PREFIX_TO_CATEGORY[prefix] ?? null;
}

async function bootstrap() {
    const dataSource = new DataSource({
        type: 'mssql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '1433', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
        synchronize: false,
        extra: {
            trustServerCertificate: true,
        },
    });

    await dataSource.initialize();

    const categoryRepo = dataSource.getRepository(CategoryPermission);
    const permissionRepo = dataSource.getRepository(Permission);

    console.log('=== Seed Category Permission ===\n');

    // 1. Tạo category nếu chưa có
    const categoryByName = new Map<string, CategoryPermission>();

    for (const def of CATEGORY_DEFINITIONS) {
        let category = await categoryRepo.findOne({
            where: { name: def.name, deleted: false },
        });

        if (!category) {
            category = categoryRepo.create({
                name: def.name,
                status: 'active',
                deleted: false,
            });
            category = await categoryRepo.save(category);
            console.log(`[CREATE] Category: "${def.name}" (id=${category.id})`);
        } else {
            console.log(`[SKIP]   Category đã tồn tại: "${def.name}" (id=${category.id})`);
        }

        categoryByName.set(def.name, category);
    }

    console.log('');

    // 2. Gán categoryPermissionId cho từng permission
    const permissions = await permissionRepo.find({
        where: { deleted: false },
        order: { name: 'ASC' },
    });

    let updatedCount = 0;
    let skippedCount = 0;
    const unmapped: string[] = [];
    const missingFromDb: string[] = [];

    for (const perm of permissions) {
        const categoryName = resolveCategoryName(perm.name);

        if (!categoryName) {
            unmapped.push(perm.name);
            continue;
        }

        const category = categoryByName.get(categoryName);
        if (!category) {
            unmapped.push(perm.name);
            continue;
        }

        if (perm.categoryPermissionId === category.id) {
            console.log(`[SKIP]   ${perm.name} -> "${categoryName}" (đã gán)`);
            skippedCount++;
            continue;
        }

        perm.categoryPermissionId = category.id;
        await permissionRepo.save(perm);
        console.log(`[UPDATE] ${perm.name} -> "${categoryName}" (categoryId=${category.id})`);
        updatedCount++;
    }

    for (const expected of EXPECTED_PERMISSIONS) {
        if (!permissions.some((p) => p.name === expected)) {
            missingFromDb.push(expected);
        }
    }

    console.log('\n=== Tóm tắt ===');
    console.log(`Categories   : ${CATEGORY_DEFINITIONS.length}`);
    console.log(`Permissions  : ${permissions.length} trong DB`);
    console.log(`Updated      : ${updatedCount}`);
    console.log(`Already OK   : ${skippedCount}`);

    if (unmapped.length > 0) {
        console.log(`\n[WARN] Permission không map được category:`);
        unmapped.forEach((name) => console.log(`  - ${name}`));
    }

    if (missingFromDb.length > 0) {
        console.log(`\n[WARN] Permission trong seed file nhưng chưa có trong DB:`);
        missingFromDb.forEach((name) => console.log(`  - ${name}`));
    }

    console.log('\n=== Bảng phân loại ===');
    for (const def of CATEGORY_DEFINITIONS) {
        const cat = categoryByName.get(def.name);
        const assigned = permissions.filter((p) => p.categoryPermissionId === cat?.id);
        console.log(`\n${def.name} (id=${cat?.id})`);
        console.log(`  ${def.description}`);
        if (assigned.length === 0) {
            console.log('  (chưa có permission nào được gán)');
        }
    }

    await dataSource.destroy();
    process.exit(0);
}

bootstrap().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
