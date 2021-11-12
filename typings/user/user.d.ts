export interface IAdminUserDetails {
  username: string;
  admin: boolean;
  token: string;
  superAdmin: boolean;
  confName: string;
}
