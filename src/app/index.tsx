import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const categories = [
  {
    name: "Men",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500",
  },
  {
    name: "Women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500",
  },
  {
    name: "Kids",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500",
  },
  {
    name: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
  },
  {
    name: "Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500",
  },
];

const products = [
  {
    id: "1",
    name: "Men's Casual Shirt",
    price: 799,
    oldPrice: 1499,
    discount: "47% OFF",
    category: "Men",
    rating: 4.3,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
  },
  {
    id: "2",
    name: "Women Fashion Dress",
    price: 1299,
    oldPrice: 2499,
    discount: "48% OFF",
    category: "Women",
    rating: 4.5,
    reviews: 186,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
  },
  {
    id: "3",
    name: "Premium Sneakers",
    price: 1599,
    oldPrice: 2999,
    discount: "47% OFF",
    category: "Shoes",
    rating: 4.6,
    reviews: 231,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  {
    id: "4",
    name: "Women's Top",
    price: 699,
    oldPrice: 1299,
    discount: "46% OFF",
    category: "Women",
    rating: 4.2,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800",
  },
];

export default function HomeScreen() {
  const openSearch = () => {
    router.push("/explore");
  };

  const openCategory = (category: string) => {
    router.push({
      pathname: "/explore",
      params: {
        category,
      },
    });
  };

  const openProduct = (id: string) => {
    router.push({
      pathname: "/product",
      params: {
        id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>MYNTRA</Text>

            <Text style={styles.logoSub}>FASHION SHOPPING</Text>
          </View>

          <View style={styles.headerIcons}>
            <Pressable
              style={styles.headerIconButton}
              onPress={() => router.push("/wishlist")}
            >
              <Text style={styles.headerIcon}>♡</Text>
            </Pressable>

            <Pressable
              style={styles.headerIconButton}
              onPress={() => router.push("/bag")}
            >
              <Text style={styles.headerIcon}>🛍</Text>
            </Pressable>
          </View>
        </View>

        {/* SEARCH */}

        <Pressable onPress={openSearch} style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <Text style={styles.searchPlaceholder}>
            Search for products, brands and more
          </Text>
        </Pressable>

        {/* SALE BANNER */}

        <View style={styles.saleBanner}>
          <View style={styles.saleContent}>
            <Text style={styles.saleSmall}>BIG FASHION SALE</Text>

            <Text style={styles.saleTitle}>FLAT 50% OFF</Text>

            <Text style={styles.saleDescription}>
              On selected fashion styles
            </Text>

            <Pressable onPress={openSearch} style={styles.shopButton}>
              <Text style={styles.shopButtonText}>SHOP NOW →</Text>
            </Pressable>
          </View>

          <Text style={styles.saleEmoji}>🛍️</Text>
        </View>

        {/* CATEGORY TITLE */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop By Category</Text>

          <Pressable onPress={openSearch}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {/* CATEGORIES */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category.name}
              style={styles.categoryItem}
              onPress={() => openCategory(category.name)}
            >
              <Image
                source={{
                  uri: category.image,
                }}
                style={styles.categoryImage}
              />

              <Text style={styles.categoryName}>{category.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* TRENDING */}

        <Pressable onPress={openSearch} style={styles.trending}>
          <Text style={styles.trendingTitle}>TRENDING NOW 🔥</Text>

          <Text style={styles.trendingSubtitle}>
            Fresh styles. New looks. Better prices.
          </Text>
        </Pressable>

        {/* LATEST FASHION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Fashion</Text>

          <Pressable onPress={openSearch}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {/* PRODUCT GRID */}

        <View style={styles.productGrid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={styles.productCard}
              onPress={() => openProduct(product.id)}
            >
              {/* PRODUCT IMAGE */}

              <Image
                source={{
                  uri: product.image,
                }}
                style={styles.productImage}
              />

              {/* PRODUCT INFORMATION */}

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>

                <Text style={styles.productCategory}>{product.category}</Text>

                {/* PRICE */}

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{product.price}</Text>

                  <Text style={styles.oldPrice}>₹{product.oldPrice}</Text>
                </View>

                {/* DISCOUNT */}

                <Text style={styles.discount}>{product.discount}</Text>

                {/* RATING */}

                <View style={styles.ratingRow}>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingNumber}>{product.rating}</Text>

                    <Text style={styles.ratingStar}>★</Text>
                  </View>

                  <Text style={styles.reviewCount}>
                    {product.reviews} ratings
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* BOTTOM SPACE */}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    paddingBottom: 80,
  },

  /* HEADER */

  header: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  logo: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#ff3f6c",
  },

  logoSub: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#777",
    marginTop: 2,
  },

  headerIcons: {
    flexDirection: "row",
    gap: 10,
  },

  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    fontSize: 22,
  },

  /* SEARCH */

  searchBox: {
    height: 52,
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 7,
    backgroundColor: "#f5f5f6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  searchIcon: {
    fontSize: 25,
    color: "#555",
    marginRight: 9,
  },

  searchPlaceholder: {
    fontSize: 14,
    color: "#777",
  },

  /* SALE */

  saleBanner: {
    marginHorizontal: 20,
    height: 205,
    borderRadius: 12,
    backgroundColor: "#ffe0e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 23,
    overflow: "hidden",
  },

  saleContent: {
    flex: 1,
  },

  saleSmall: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#222",
  },

  saleTitle: {
    fontSize: 31,
    fontWeight: "900",
    color: "#ff3f6c",
    marginTop: 10,
  },

  saleDescription: {
    fontSize: 13,
    color: "#555",
    marginTop: 5,
  },

  shopButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    height: 40,
    paddingHorizontal: 17,
    borderRadius: 5,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  saleEmoji: {
    fontSize: 52,
    marginLeft: 10,
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222",
  },

  viewAll: {
    fontSize: 13,
    color: "#ff3f6c",
    fontWeight: "700",
  },

  /* CATEGORY */

  categoryContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },

  categoryItem: {
    width: 75,
    alignItems: "center",
  },

  categoryImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eee",
  },

  categoryName: {
    fontSize: 13,
    color: "#444",
    marginTop: 8,
    fontWeight: "500",
  },

  /* TRENDING */

  trending: {
    marginHorizontal: 20,
    marginTop: 28,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#111",
    paddingHorizontal: 22,
    justifyContent: "center",
  },

  trendingTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#fff",
  },

  trendingSubtitle: {
    fontSize: 13,
    color: "#ddd",
    marginTop: 7,
  },

  /* PRODUCTS */

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
  },

  productCard: {
    width: "50%",
    padding: 6,
  },

  productImage: {
    width: "100%",
    height: 245,
    resizeMode: "cover",
    backgroundColor: "#f1f1f1",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },

  productInfo: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },

  productCategory: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  /* PRICE */

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
  },

  oldPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 7,
  },

  discount: {
    fontSize: 11,
    color: "#ff3f6c",
    fontWeight: "700",
    marginTop: 4,
  },

  /* RATING */

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f8e9",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  ratingNumber: {
    fontSize: 11,
    fontWeight: "800",
    color: "#333",
  },

  ratingStar: {
    fontSize: 11,
    color: "#f5a623",
    marginLeft: 2,
  },

  reviewCount: {
    fontSize: 10,
    color: "#888",
    marginLeft: 7,
  },
});
