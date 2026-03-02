import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.shippingCalculation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.warehouse.deleteMany();

  const warehouses = await prisma.$transaction([
    prisma.warehouse.create({ data: { name: "Delhi Hub", lat: 28.6139, lng: 77.209 } }),
    prisma.warehouse.create({ data: { name: "Mumbai Hub", lat: 19.076, lng: 72.8777 } }),
    prisma.warehouse.create({ data: { name: "Bengaluru Hub", lat: 12.9716, lng: 77.5946 } }),
    prisma.warehouse.create({ data: { name: "Kolkata Hub", lat: 22.5726, lng: 88.3639 } }),
    prisma.warehouse.create({ data: { name: "Hyderabad Hub", lat: 17.385, lng: 78.4867 } }),
  ]);

  const sellers = await prisma.$transaction([
    prisma.seller.create({ data: { name: "FreshCart Traders", lat: 28.7041, lng: 77.1025 } }),
    prisma.seller.create({ data: { name: "Urban Basket", lat: 19.2183, lng: 72.9781 } }),
    prisma.seller.create({ data: { name: "SouthMart", lat: 12.9352, lng: 77.6245 } }),
    prisma.seller.create({ data: { name: "East Supply", lat: 22.5448, lng: 88.3426 } }),
    prisma.seller.create({ data: { name: "Deccan Retail", lat: 17.4399, lng: 78.4983 } }),
  ]);

  const productsData = [
    { sellerId: sellers[0].id, name: "Rice 10kg", weightKg: 10, priceRs: 600 },
    { sellerId: sellers[0].id, name: "Sugar 5kg", weightKg: 5, priceRs: 230 },
    { sellerId: sellers[1].id, name: "Cooking Oil 2L", weightKg: 2, priceRs: 320 },
    { sellerId: sellers[1].id, name: "Toor Dal 1kg", weightKg: 1, priceRs: 160 },
    { sellerId: sellers[2].id, name: "Tea Pack 500g", weightKg: 0.5, priceRs: 210 },
    { sellerId: sellers[2].id, name: "Atta 5kg", weightKg: 5, priceRs: 280 },
    { sellerId: sellers[3].id, name: "Detergent 3kg", weightKg: 3, priceRs: 350 },
    { sellerId: sellers[3].id, name: "Shampoo Combo", weightKg: 1.2, priceRs: 450 },
    { sellerId: sellers[4].id, name: "Coffee 1kg", weightKg: 1, priceRs: 520 },
    { sellerId: sellers[4].id, name: "Snacks Carton", weightKg: 4, priceRs: 760 },
  ];

  await prisma.product.createMany({ data: productsData });

  await prisma.customer.createMany({
    data: [
      { name: "Aarav Singh", phone: "9000000001", lat: 28.4595, lng: 77.0266, addressLabel: "Gurugram" },
      { name: "Diya Patel", phone: "9000000002", lat: 19.1136, lng: 72.8697, addressLabel: "Andheri East" },
      { name: "Kabir Rao", phone: "9000000003", lat: 12.9141, lng: 77.6446, addressLabel: "HSR Layout" },
      { name: "Isha Das", phone: "9000000004", lat: 22.4988, lng: 88.3468, addressLabel: "Behala" },
      { name: "Rohan Nair", phone: "9000000005", lat: 17.4507, lng: 78.3908, addressLabel: "Madhapur" },
      { name: "Neha Mehta", phone: "9000000006", lat: 26.9124, lng: 75.7873, addressLabel: "Jaipur" },
      { name: "Arjun Iyer", phone: "9000000007", lat: 13.0827, lng: 80.2707, addressLabel: "Chennai" },
      { name: "Mira Roy", phone: "9000000008", lat: 23.0225, lng: 72.5714, addressLabel: "Ahmedabad" },
      { name: "Karan Jain", phone: "9000000009", lat: 18.5204, lng: 73.8567, addressLabel: "Pune" },
      { name: "Tanya Sharma", phone: "9000000010", lat: 30.7333, lng: 76.7794, addressLabel: "Chandigarh" },
    ],
  });

  console.log(`Seeded ${warehouses.length} warehouses, ${sellers.length} sellers, 10 products, 10 customers.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
