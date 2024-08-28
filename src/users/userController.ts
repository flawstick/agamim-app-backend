import UserModel, { IUserLean } from "@/models/user";
import OrderModel from "@/models/order";
import { log } from "@/utils/log";

/**
 * add a new user to the database
 * @param user The user object to add
 * @returns A promise that resolves to the user object that was added
 * */
export async function addUser(user: IUserLean): Promise<any> {
  try {
    const newUser = await UserModel.create(user);
    return newUser;
  } catch (error) {
    log.error(`Failed to add user to MongoDB: ${error}`);
    return null;
  }
}

/**
 * gets all the orders associated with a user
 * @param userId The id of the user to get orders for
 * @returns A promise that resolves to an array of orders
 */
export async function getUserOrders(userId: string): Promise<any> {
  try {
    const orders = await OrderModel.find({ userId });
    return orders;
  } catch (error) {
    log.error(`Failed to get orders for user with ID ${userId}: ${error}`);
    return null;
  }
}
