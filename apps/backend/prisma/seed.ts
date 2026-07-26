import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'Quicko Downtown',
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        isActive: true,
        operatingHours: '6:00 AM - 11:00 PM',
      },
    }),
    prisma.store.create({
      data: {
        name: 'Quicko Mission District',
        street: '456 Valencia Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110',
        latitude: 37.7599,
        longitude: -122.4148,
        isActive: true,
        operatingHours: '7:00 AM - 11:00 PM',
      },
    }),
  ]);

  console.log(`✅ Created ${stores.length} stores`);

  // Product categories and items
  const categories = [
    {
      name: 'Fresh Produce',
      items: [
        { name: 'Organic Bananas', price: 2.99, unit: 'lb', stock: 150, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400' },
        { name: 'Red Apples', price: 3.49, unit: 'lb', stock: 200, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' },
        { name: 'Avocados', price: 1.99, unit: 'each', stock: 180, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400' },
        { name: 'Cherry Tomatoes', price: 4.99, unit: 'pint', stock: 120, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400' },
        { name: 'Fresh Spinach', price: 3.99, unit: 'bunch', stock: 90, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400' },
        { name: 'Baby Carrots', price: 2.49, unit: 'bag', stock: 160, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400' },
      ],
    },
    {
      name: 'Dairy & Eggs',
      items: [
        { name: 'Whole Milk', price: 4.99, unit: 'gallon', stock: 100, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
        { name: 'Greek Yogurt', price: 5.49, unit: '32oz', stock: 80, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
        { name: 'Large Eggs', price: 4.29, unit: 'dozen', stock: 140, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
        { name: 'Cheddar Cheese', price: 6.99, unit: '8oz', stock: 70, image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400' },
        { name: 'Butter', price: 5.99, unit: '16oz', stock: 90, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
      ],
    },
    {
      name: 'Bakery',
      items: [
        { name: 'Sourdough Bread', price: 5.49, unit: 'loaf', stock: 60, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
        { name: 'Croissants', price: 6.99, unit: '6 pack', stock: 45, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
        { name: 'Bagels', price: 4.99, unit: '6 pack', stock: 70, image: 'https://images.unsplash.com/photo-1551106652-a5bcf4b29fcd?w=400' },
        { name: 'Blueberry Muffins', price: 7.99, unit: '4 pack', stock: 50, image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400' },
      ],
    },
    {
      name: 'Snacks',
      items: [
        { name: 'Potato Chips', price: 3.99, unit: '8oz bag', stock: 200, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
        { name: 'Trail Mix', price: 5.49, unit: '12oz', stock: 120, image: 'https://images.unsplash.com/photo-1599599810694-e9c11cf5c768?w=400' },
        { name: 'Granola Bars', price: 4.99, unit: '6 pack', stock: 150, image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400' },
        { name: 'Mixed Nuts', price: 7.99, unit: '16oz', stock: 100, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400' },
        { name: 'Pretzels', price: 3.49, unit: '10oz', stock: 130, image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400' },
      ],
    },
    {
      name: 'Beverages',
      items: [
        { name: 'Orange Juice', price: 5.99, unit: '64oz', stock: 80, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
        { name: 'Sparkling Water', price: 4.99, unit: '12 pack', stock: 110, image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9c?w=400' },
        { name: 'Cold Brew Coffee', price: 4.49, unit: '32oz', stock: 90, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400' },
        { name: 'Green Tea', price: 3.99, unit: '16 bags', stock: 70, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
        { name: 'Lemonade', price: 3.49, unit: '64oz', stock: 100, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
      ],
    },
    {
      name: 'Frozen Foods',
      items: [
        { name: 'Ice Cream', price: 6.99, unit: 'pint', stock: 120, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
        { name: 'Frozen Pizza', price: 7.49, unit: 'each', stock: 90, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
        { name: 'Frozen Berries', price: 5.99, unit: '16oz', stock: 70, image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400' },
        { name: 'Chicken Nuggets', price: 8.99, unit: '32oz', stock: 85, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
      ],
    },
    {
      name: 'Pantry Staples',
      items: [
        { name: 'Pasta', price: 2.99, unit: '16oz', stock: 180, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
        { name: 'Rice', price: 4.49, unit: '2lb bag', stock: 150, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { name: 'Olive Oil', price: 9.99, unit: '16oz', stock: 80, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
        { name: 'Tomato Sauce', price: 2.49, unit: '24oz jar', stock: 130, image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=400' },
        { name: 'Cereal', price: 4.99, unit: '18oz box', stock: 110, image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400' },
      ],
    },
    {
      name: 'Household',
      items: [
        { name: 'Paper Towels', price: 12.99, unit: '6 rolls', stock: 100, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400' },
        { name: 'Toilet Paper', price: 15.99, unit: '12 rolls', stock: 120, image: 'https://images.unsplash.com/photo-1584556326561-c8746083993b?w=400' },
        { name: 'Dish Soap', price: 3.99, unit: '24oz', stock: 90, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
        { name: 'Laundry Detergent', price: 11.99, unit: '64oz', stock: 70, image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400' },
      ],
    },
  ];

  let totalProducts = 0;

  for (const category of categories) {
    for (const item of category.items) {
      for (const store of stores) {
        await prisma.product.create({
          data: {
            name: item.name,
            description: `Fresh ${item.name.toLowerCase()} delivered in minutes`,
            category: category.name,
            imageUrl: item.image,
            price: item.price,
            unit: item.unit,
            availableStock: item.stock,
            storeId: store.id,
          },
        });
        totalProducts++;
      }
    }
  }

  console.log(`✅ Created ${totalProducts} products across ${categories.length} categories`);
  console.log('✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
