import db from "#db/client";
import { createUser } from "#db/queries/users";
import { faker } from "@faker-js/faker";
import { createProduct } from "#db/queries/products";
import { createOrder } from "#db/queries/orders";
import { createOrderProduct } from "#db/queries/ordersProducts";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const ranks = [
    ["A", "Ace"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["6", "6"],
    ["7", "7"],
    ["8", "8"],
    ["9", "9"],
    ["0", "10"],
    ["J", "Jack"],
    ["Q", "Queen"],
    ["K", "King"],
  ];

  const suits = [
    ["Hearts", "H", "red"],
    ["Diamonds", "D", "red"],
    ["Clubs", "C", "black"],
    ["Spades", "S", "black"],
  ];

  // Create 52 cards
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < ranks.length; j++) {
      await createProduct(
        `${ranks[j][1]} of ${suits[i][0]}`, // title
        `Playing card: ${ranks[j][1]} of ${suits[i][0]}`, // description
        `${suits[i][0]}`, // category
        "Standard Deck", // brand
        `${suits[i][2]}`, // color
        `${ranks[j][0]}`, // size
        `https://deckofcardsapi.com/static/img/${ranks[j][0]}${suits[i][1]}.png`, // image_url
        1.0, // price
        1, // stock_quantity
      );
    }
  }

  // Create  9 users
  for (let u = 1; u <= 9; u++) {
    const user = await createUser(
      faker.person.firstName(),
      faker.person.lastName(),
      faker.internet.displayName(),
      faker.internet.email(),
      "password",
      false,
    );

    // Create 3 orders for each user
    for (let o = 1; o <= 3; o++) {
      const date = faker.date.recent().toISOString(); //2026-03-04

      const order = await createOrder(
        date.split("T")[0], // date
        "", // discountCode
        faker.location.streetAddress(), // shippingAddress
        500, // total in cents ($5.00)
        false, // completed
        user.id, // userId
      );

      // Give each user 5 unique cards
      for (let p = 1; p <= 5; p++) {
        await createOrderProduct(
          order.id,
          (u - 1) * 5 + p, // product_id
          1, // quantity
        );
      }
    }
  }
}
