export interface UpdatePasswordDTO {
  uuid: string;
  oldPassword: string;
  newPassword: string;
}

export interface AdminUpdatePasswordDTO {
  uuid: string;
  newPassword: string;
}