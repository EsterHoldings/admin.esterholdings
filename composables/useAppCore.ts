import AdminAuthModule from "~/composables/core/modules/adminAuth/adminAuth.module";
import AdminsModule from "~/composables/core/modules/admins/admins.module";
import AccountsModule from "~/composables/core/modules/accounts/accounts.module";
import AuthModule from "~/composables/core/modules/clients/auth.module";
import ItemsModule from "~/composables/core/modules/items/items.module";
import RolesModule from "~/composables/core/modules/roles/roles.module";
import PermissionsModule from "~/composables/core/modules/permissions/permissions.module";
import UsersModule from "~/composables/core/modules/users/users.module";
import HelperModule from "~/composables/core/modules/helper/helper.module";
import S3Module from "~/composables/core/modules/s3/s3.module";

export interface ICoreModules {
    adminAuth : AdminAuthModule;
    admins : AdminsModule;
    accounts : AccountsModule;
    auth: AuthModule;
    clients: AuthModule;
    items: ItemsModule;
    roles: RolesModule;
    permissions: PermissionsModule;
    users: UsersModule;
    helper: HelperModule;
    s3: S3Module;
}

export const useAppCore = (): ICoreModules => {
    return {
        adminAuth: new AdminAuthModule(),
        admins: new AdminsModule(),
        accounts: new AccountsModule(),
        auth: new AuthModule(),
        clients: new AuthModule(),
        items: new ItemsModule(),
        roles: new RolesModule(),
        permissions: new PermissionsModule(),
        users: new UsersModule(),
        helper: new HelperModule(),
        s3: new S3Module(),
    };
};

export default useAppCore;
