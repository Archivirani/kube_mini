export class User {
  username: string;
  password: string;
  isActive: boolean;
  isDeleted: boolean;
  userTypeId: number;
  userType: UserType;
  accessToken: string;
  userTypeName: any;
  tenantCode: string;
  id?: number;
  createdBy?: number;
  createdDate?: string;
  updatedBy?: number;
  updatedDate?: string;
}

export class UserType {
  name: string;
  isAdmin: boolean;
  isActive: boolean;
  isDeleted: boolean;
  id?: number;
  createdBy?: number;
  createdDate?: string;
  updatedBy?: number;
  updatedDate?: string;
}
