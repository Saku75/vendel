import { usersSchema } from "$lib/database/schema/users";
import {
  ApiDeleteResponse,
  ApiGetResponse,
  ApiListResponse,
  ApiPostResponse,
  ApiPutResponse,
} from "$lib/types/api/response";

type ApiUsersResponse = ApiListResponse<{
  users: (typeof usersSchema.$inferSelect)[];
  totalCount: number;
}>;
type ApiUserCreateResponse = ApiPostResponse;
type ApiUserGetResponse = ApiGetResponse<typeof usersSchema.$inferSelect>;
type ApiUserUpdateResponse = ApiPutResponse;
type ApiUserDeleteResponse = ApiDeleteResponse;

export {
  ApiUserCreateResponse,
  ApiUserDeleteResponse,
  ApiUserGetResponse,
  ApiUsersResponse,
  ApiUserUpdateResponse,
};
