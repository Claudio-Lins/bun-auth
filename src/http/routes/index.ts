import { Elysia } from "elysia";
import { adminRoutes } from "./admin";
import { batchesRoutes } from "./batches";
import { healthRoutes } from "./health";
import { popcornUnitRoutes } from "./popcorn-unit";
import { productRoutes } from "./product";
import { productVariantRoutes } from "./product-variant";
import { userAddressesRoutes } from "./user-addresses";
import { userContactsRoutes } from "./user-contacts";
import { usersRoutes } from "./users";

export const routes = new Elysia()
  .use(healthRoutes)
  .use(usersRoutes)
  .use(userContactsRoutes)
  .use(userAddressesRoutes)
  .use(adminRoutes)
  .use(productRoutes)
  .use(productVariantRoutes)
  .use(batchesRoutes)
  .use(popcornUnitRoutes)