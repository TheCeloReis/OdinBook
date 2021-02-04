import { IResolvers } from "apollo-server-cloud-functions";
import { TContext } from "..";

import helloResolver from "./query/hello";
import userResolver from "./query/user";
import usersResolver from "./query/users";

import createUserMutation from "./mutation/createUser";
import createFriendConnectionMutation from "./mutation/createFriendConnection";
import updateFriendConnectionMutation from "./mutation/updateFriendConnection";

import { ConnectionsObject } from "../models/Connection";
import { FriendConnection } from "../../generated/graphql";
import { friendConnectionsToGraph } from "../helpers/transformToGraph";

export const resolvers: IResolvers<void, TContext> = {
  Query: {
    hello: helloResolver,
    user: userResolver,
    users: usersResolver,
  },
  Mutation: {
    createUser: createUserMutation,
    createFriendConnection: createFriendConnectionMutation,
    updateFriendConnection: updateFriendConnectionMutation,
  },
  User: {
    __resolveType(user: any) {
      if (user.name) {
        return "User_Full";
      }

      return "User_Basic";
    },
  },
  User_Full: {
    async connections(parent: any, _, ctx): Promise<FriendConnection[]> {
      const snapshot = await ctx.database
        .ref(`/connections/${parent.username}`)
        .get();

      const data = snapshot.val() as ConnectionsObject;

      if (!data) {
        return [];
      }

      return friendConnectionsToGraph(data, parent.username);
    },
  },
};
