import AccountsModule from "~/composables/core/modules/accounts/accounts.module";
import AdminAuthModule from "~/composables/core/modules/adminAuth/adminAuth.module";
import AdminsModule from "~/composables/core/modules/admins/admins.module";
import AuthModule from "~/composables/core/modules/clients/auth.module"; // TODO :: Fix it
import DocumentsModule from "~/composables/core/modules/documents/documents.module";
import HelperModule from "~/composables/core/modules/helper/helper.module";
import ItemsModule from "~/composables/core/modules/items/items.module";
import PasswordModule from "~/composables/core/modules/password/password.module";
import PaymentSystemsModule from "~/composables/core/modules/paymentSystems/paymentSystems.module";
import PaymentsModule from "~/composables/core/modules/payments/payments.module";
import PermissionsModule from "~/composables/core/modules/permissions/permissions.module";
import RolesModule from "~/composables/core/modules/roles/roles.module";
import S3Module from "~/composables/core/modules/s3/s3.module";
import UsersModule from "~/composables/core/modules/users/users.module";

import AdminClientsModule from "~/composables/core/modules/adminModules/clients/clients.module";
import AdminDocumentsModule from "~/composables/core/modules/adminModules/documents/documents.module";
import AdminVerificationRequests from "~/composables/core/modules/adminModules/verificationRequests/verificationRequests.module";
import Auth2faModule from "~/composables/core/modules/auth2fa/auth2fa.module";

export interface ICoreModules {
    adminAuth : AdminAuthModule;
    admins : AdminsModule;
    accounts : AccountsModule;
    auth: AuthModule;
    auth2fa: Auth2faModule;
    clients: AuthModule;
    documents: DocumentsModule;
    items: ItemsModule;
    roles: RolesModule;
    payments: PaymentsModule;
    paymentSystems: PaymentSystemsModule;
    permissions: PermissionsModule;
    users: UsersModule;
    helper: HelperModule;
    password: PasswordModule;
    s3: S3Module;

    adminModules: {
        clients: AdminClientsModule,
        documents: AdminDocumentsModule,
        verificationRequests: AdminVerificationRequests,
    }
}

export const useAppCore = (): ICoreModules => {
    return {
        adminAuth: new AdminAuthModule(), // TODO :: Move to adminModules
        admins: new AdminsModule(), // TODO :: Move to adminModules
        accounts: new AccountsModule(),
        auth: new AuthModule(),
        auth2fa: new Auth2faModule(),
        clients: new AuthModule(), // TODO :: Fix (Or remove)
        documents: new DocumentsModule(),
        items: new ItemsModule(),
        roles: new RolesModule(), // TODO :: Move to adminModules
        permissions: new PermissionsModule(), // TODO :: Move to adminModules
        payments: new PaymentsModule(),
        paymentSystems: new PaymentSystemsModule(),
        users: new UsersModule(), // TODO :: Move to adminModules or remove
        helper: new HelperModule(),
        password: new PasswordModule(),
        s3: new S3Module(),

        adminModules: {
            clients: new AdminClientsModule(),
            documents: new AdminDocumentsModule(),
            verificationRequests: new AdminVerificationRequests(),
        },
    };
};

export default useAppCore;
