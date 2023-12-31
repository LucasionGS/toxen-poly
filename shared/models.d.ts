export { UserAttributes, RoleAttributes, RoleAttributesObject, AssetAttributes } from "../server/src/sequelize";
import { UserAttributes } from "../server/src/sequelize";

export interface ClientUser extends Omit<UserAttributes, "password"> {
  roles?: string[];
  isAdmin: boolean;
}