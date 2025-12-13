import { accounts } from "./accounts";
import { batches, batchesRelations } from "./batches";
import { popcornUnits, popcornUnitsRelations } from "./popcorn-units";
import { productVariants, productVariantsRelations } from "./product-variants";
import { products, productsRelations } from "./products";
import { sessions } from "./sessions";
import { users } from "./users";
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
}