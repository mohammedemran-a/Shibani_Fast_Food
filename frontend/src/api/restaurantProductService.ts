import { RestaurantProduct, ProductCategory, Modifier, Ingredient } from '../types';

// دالة لمحاكاة تأخير الشبكة
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =================================================================
// 1. تعريف الإضافات (Modifiers)
// =================================================================
const mockModifiers: { [key: string]: Modifier } = {
  extraCheese: { id: 'mod-1', name: 'جبنة إضافية', price: 3.00 },
  extraPickles: { id: 'mod-2', name: 'مخلل زيادة', price: 1.00 },
  spicy: { id: 'mod-3', name: 'حار', price: 2.00 },
  largeSize: { id: 'mod-4', name: 'حجم كبير', price: 5.00 },
};

// =================================================================
// 2. تعريف المكونات الأساسية (Base Ingredients)
// =================================================================
const mockIngredients: { [key: string]: Ingredient } = {
  lettuce: { id: 'ing-1', name: 'خس' },
  tomatoes: { id: 'ing-2', name: 'طماطم' },
  onions: { id: 'ing-3', name: 'بصل' },
  pickles: { id: 'ing-4', name: 'مخلل' },
  ketchup: { id: 'ing-5', name: 'كاتشب' },
  olives: { id: 'ing-6', name: 'زيتون' },
  mushrooms: { id: 'ing-7', name: 'فطر' },
};

// =================================================================
// 3. تعريف الفئات (Categories)
// =================================================================
const mockCategories: ProductCategory[] = [
  { id: 'cat-1', name: 'المقبلات' },
  { id: 'cat-2', name: 'الساندويتشات' },
  { id: 'cat-3', name: 'المشويات' },
  { id: 'cat-4', name: 'البيتزا' },
  { id: 'cat-5', name: 'المشروبات' },
  { id: 'cat-6', name: 'الحلويات' },
];

// =================================================================
// 4. تعريف المنتجات (Products) مع صور مستقرة ومكونات أساسية
// =================================================================
const mockProducts: RestaurantProduct[] = [
  // --- المقبلات (cat-1) ---
  { id: 'prod-1', name: 'حمص باللحمة', price: 22.00, categoryId: 'cat-1', imageUrl: 'https://foodish-api.com/images/biryani/biryani15.jpg' },
  { id: 'prod-2', name: 'تبولة', price: 18.00, categoryId: 'cat-1', imageUrl: 'https://foodish-api.com/images/dosa/dosa33.jpg' },
  { id: 'prod-3', name: 'بطاطس مقلية', price: 12.00, categoryId: 'cat-1', imageUrl: 'https://foodish-api.com/images/fries/fries1.jpg', availableModifiers: [mockModifiers.largeSize, mockModifiers.extraCheese] },
  { id: 'prod-4', name: 'ورق عنب', price: 20.00, categoryId: 'cat-1', imageUrl: 'https://foodish-api.com/images/samosa/samosa10.jpg' },

  // --- الساندويتشات (cat-2  ) ---
  { id: 'prod-5', name: 'برجر لحم', price: 35.00, categoryId: 'cat-2', imageUrl: 'https://foodish-api.com/images/burger/burger1.jpg', 
    availableModifiers: [mockModifiers.extraCheese, mockModifiers.extraPickles], 
    baseIngredients: [mockIngredients.lettuce, mockIngredients.tomatoes, mockIngredients.onions, mockIngredients.ketchup] 
  },
  { id: 'prod-6', name: 'برجر دجاج كرسبي', price: 32.00, categoryId: 'cat-2', imageUrl: 'https://foodish-api.com/images/burger/burger15.jpg', 
    availableModifiers: [mockModifiers.extraCheese, mockModifiers.spicy],
    baseIngredients: [mockIngredients.lettuce, mockIngredients.pickles]
  },
  { id: 'prod-7', name: 'ساندويتش فاهيتا', price: 30.00, categoryId: 'cat-2', imageUrl: 'https://foodish-api.com/images/samosa/samosa2.jpg' },

  // --- المشويات (cat-3  ) ---
  { id: 'prod-8', name: 'كباب لحم', price: 45.00, categoryId: 'cat-3', imageUrl: 'https://picsum.photos/400/300?random=1' },
  { id: 'prod-9', name: 'شيش طاووق', price: 40.00, categoryId: 'cat-3', imageUrl: 'https://picsum.photos/400/300?random=2' },
  { id: 'prod-10', name: 'أوصال لحم', price: 50.00, categoryId: 'cat-3', imageUrl: 'https://picsum.photos/400/300?random=3' },
  { id: 'prod-11', name: 'ريش غنم', price: 55.00, categoryId: 'cat-3', imageUrl: 'https://picsum.photos/400/300?random=4' },

  // --- البيتزا (cat-4  ) ---
  { id: 'prod-12', name: 'بيتزا مارجريتا', price: 40.00, categoryId: 'cat-4', imageUrl: 'https://foodish-api.com/images/pizza/pizza1.jpg' },
  { id: 'prod-13', name: 'بيتزا بيبروني', price: 48.00, categoryId: 'cat-4', imageUrl: 'https://foodish-api.com/images/pizza/pizza80.jpg', 
    availableModifiers: [mockModifiers.extraCheese, mockModifiers.spicy],
    baseIngredients: [mockIngredients.olives]
  },
  { id: 'prod-14', name: 'بيتزا خضروات', price: 42.00, categoryId: 'cat-4', imageUrl: 'https://foodish-api.com/images/pizza/pizza34.jpg',
    baseIngredients: [mockIngredients.olives, mockIngredients.mushrooms]
  },

  // --- المشروبات (cat-5  ) ---
  { id: 'prod-15', name: 'عصير برتقال طازج', price: 12.00, categoryId: 'cat-5', imageUrl: 'https://picsum.photos/400/300?random=5' },
  { id: 'prod-16', name: 'بيبسي', price: 5.00, categoryId: 'cat-5', imageUrl: 'https://picsum.photos/400/300?random=6' },
  { id: 'prod-17', name: 'ماء', price: 2.00, categoryId: 'cat-5', imageUrl: 'https://picsum.photos/400/300?random=7' },

  // --- الحلويات (cat-6  ) ---
  { id: 'prod-18', name: 'كنافة بالجبنة', price: 25.00, categoryId: 'cat-6', imageUrl: 'https://foodish-api.com/images/dessert/dessert1.jpg' },
  { id: 'prod-19', name: 'تشيز كيك', price: 30.00, categoryId: 'cat-6', imageUrl: 'https://foodish-api.com/images/dessert/dessert38.jpg' },
];

// =================================================================
// 5. تصدير الخدمة (Service Export )
// =================================================================
export const restaurantProductService = {
  /**
   * يجلب قائمة جميع المنتجات.
   */
  getProducts: async (): Promise<RestaurantProduct[]> => {
    await sleep(300); // محاكاة تأخير الشبكة
    return mockProducts;
  },
  /**
   * يجلب قائمة جميع الفئات.
   */
  getCategories: async (): Promise<ProductCategory[]> => {
    await sleep(100); // محاكاة تأخير الشبكة
    return mockCategories;
  },
};
