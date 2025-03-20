import { usersSchema } from "$lib/database/schema/users";
import { ApiItem } from "$lib/types/api/item";
import {
  ApiDeleteRequest,
  ApiGetRequest,
  ApiListRequest,
  ApiPostRequest,
  ApiPutRequest,
} from "$lib/types/api/request";

type User = ApiItem<
  typeof usersSchema.$inferSelect,
  "emailVerified" | "password" | "clientSalt" | "serverSalt" | "approvedBy"
>;

type ApiUsersRequest = ApiListRequest;
type ApiUserCreateRequest = ApiPostRequest<User>;
type ApiUserGetRequest = ApiGetRequest;
type ApiUserUpdateRequest = ApiPutRequest<User>;
type ApiUserDeleteRequest = ApiDeleteRequest;

export {
  ApiUserCreateRequest,
  ApiUserDeleteRequest,
  ApiUserGetRequest,
  ApiUsersRequest,
  ApiUserUpdateRequest,
};
