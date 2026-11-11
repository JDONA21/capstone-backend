import db from "#db/client";
import { createUser } from "#db/queries/users";
import { faker } from "@faker-js/faker";
import { createProduct } from "#db/queries/products";
import { createOrder } from "#db/queries/orders";
import { createOrderProduct } from "#db/queries/orders_products";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  for (let i = 1; i <= 20; i++) {
    // await createProduct(`Product ${i} ${faker.commerce.productName() }`,  i * 50000);
    await createProduct(
      "Product " + i,
      "description " + i,
      "category " + i,
      "brand " + i,
      "image " + i,
      i * 50,
      i * 1,
    );
  }

  for (let i = 1; i <= 3; i++) {
    const user = await createUser(
      faker.internet.displayName(),
      faker.internet.email(),
      "password",
      false,
    );
    const order = await createOrder(
      "2020-01-01",
      "",
      "123 main st",
      i * 50.0,
      false,
      user.id,
    );
    for (let j = 0; j < 5; j++) {
      await createOrderProduct(order.id, (i - 1) * 5 + j + 1, j + 1);
    }
  }
}
