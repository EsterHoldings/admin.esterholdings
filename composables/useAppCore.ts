import AccountsModule from "~/composables/core/modules/accounts/accounts.module";
import AdminsModule from "~/composables/core/modules/admins/admins.module";
import Auth2faModule from "~/composables/core/modules/auth2fa/auth2fa.module";
import AuthModule from "~/composables/core/modules/auth/auth.module";
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

import AdminAuth2faModule from "~/composables/core/modules/adminModules/auth2fa/auth2fa.module";
import AdminAuthModule from "~/composables/core/modules/adminModules/auth/adminAuth.module";
import AdminClientsModule from "~/composables/core/modules/adminModules/clients/clients.module";
import AdminDocumentsModule from "~/composables/core/modules/adminModules/documents/documents.module";
import AdminVerificationRequests from "~/composables/core/modules/adminModules/verificationRequests/verificationRequests.module";
import VerificationsModule from "~/composables/core/modules/verification/verifications.module";

export interface ICoreModules {
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
    verifications: VerificationsModule;

    adminModules: {
        auth : AdminAuthModule;
        auth2fa: AdminAuth2faModule;
        clients: AdminClientsModule,
        documents: AdminDocumentsModule,
        verificationRequests: AdminVerificationRequests,
    }
}

export const useAppCore = (): ICoreModules => {
    return {
        accounts: new AccountsModule(),
        admins: new AdminsModule(), // TODO :: Move to adminModules
        auth2fa: new Auth2faModule(),
        auth: new AuthModule(),
        clients: new AuthModule(), // TODO :: Fix (Or remove)
        documents: new DocumentsModule(),
        helper: new HelperModule(),
        items: new ItemsModule(),
        password: new PasswordModule(),
        paymentSystems: new PaymentSystemsModule(),
        payments: new PaymentsModule(),
        permissions: new PermissionsModule(), // TODO :: Move to adminModules
        roles: new RolesModule(), // TODO :: Move to adminModules
        s3: new S3Module(),
        users: new UsersModule(), // TODO :: Move to adminModules or remove
        verifications: new VerificationsModule(),

        adminModules: {
            auth: new AdminAuthModule(),
            auth2fa: new AdminAuth2faModule(),
            clients: new AdminClientsModule(),
            documents: new AdminDocumentsModule(),
            verificationRequests: new AdminVerificationRequests(),
        },
    };
};

export default useAppCore;
