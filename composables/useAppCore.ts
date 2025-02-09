import AccountsModule from "~/composables/core/modules/accounts/accounts.module";
import ClientsModule from "~/composables/core/modules/auth/clients.module";
import ItemsModule from "~/composables/core/modules/items/items.module";
import RolesModule from "~/composables/core/modules/roles/roles.module";
import PermissionsModule from "~/composables/core/modules/permissions/permissions.module";
import HelperModule from "~/composables/core/modules/helper/helper.module";
import AuthModule from "~/composables/core/modules/clients/auth.module";

export interface ICoreModules {
    accounts : AccountsModule;
    auth: AuthModule;
    clients: ClientsModule;
    items: ItemsModule;
    roles: RolesModule;
    permissions: PermissionsModule;
    helper: HelperModule;
}

export const useAppCore = (): ICoreModules => {
    return {
        accounts: new AccountsModule(),
        auth: new AuthModule(),
        clients: new ClientsModule(),
        items: new ItemsModule(),
        roles: new RolesModule(),
        permissions: new PermissionsModule(),
        helper: new HelperModule(),
    };
};

export default useAppCore;
