import { accounts } from "./accounts";
import { batches, batchesRelations } from "./batches";
import { eventUnits, eventUnitsRelations } from "./event-units";
import { events, eventsRelations } from "./events";
import { popcornUnits, popcornUnitsRelations } from "./popcorn-units";
import { productVariants, productVariantsRelations } from "./product-variants";
import { products, productsRelations } from "./products";
import { sessions } from "./sessions";
import { userAddresses, userAddressesRelations } from "./user-addresses";
import { userContacts, userContactsRelations } from "./user-contacts";
import { users, usersRelations } from "./users";
import { verifications } from "./verifications";

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  batches,
  batchesRelations,
  popcornUnits,
  popcornUnitsRelations,
  productVariants,
  productVariantsRelations,
  products,
  productsRelations,
  events,
  eventsRelations,
  eventUnits,
  eventUnitsRelations,
  userContacts,
  userContactsRelations,
  userAddresses,
  userAddressesRelations,
  usersRelations,
}