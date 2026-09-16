import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const products = [
  // ==================== MEN ====================

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
    name: "Classic Denim Jacket",
    price: 1299,
    oldPrice: 2499,
    discount: "48% OFF",
    category: "Men",
    rating: 4.5,
    reviews: 186,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
  },
  {
    id: "4",
    name: "Casual T-Shirt",
    price: 599,
    oldPrice: 999,
    discount: "40% OFF",
    category: "Men",
    rating: 4.2,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  },
  {
    id: "5",
    name: "Formal Shirt",
    price: 899,
    oldPrice: 1699,
    discount: "47% OFF",
    category: "Men",
    rating: 4.4,
    reviews: 143,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
  },

  // ==================== SHOES ====================

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
    id: "6",
    name: "Sports Shoes",
    price: 1899,
    oldPrice: 3499,
    discount: "46% OFF",
    category: "Shoes",
    rating: 4.7,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
  },
  {
    id: "7",
    name: "White Casual Sneakers",
    price: 1399,
    oldPrice: 2499,
    discount: "44% OFF",
    category: "Shoes",
    rating: 4.4,
    reviews: 177,
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=800",
  },

  // ==================== WOMEN ====================

  {
    id: "8",
    name: "Women's Fashion Dress",
    price: 1299,
    oldPrice: 2499,
    discount: "48% OFF",
    category: "Women",
    rating: 4.5,
    reviews: 205,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
  },
  {
    id: "9",
    name: "Women's Casual Top",
    price: 699,
    oldPrice: 1299,
    discount: "46% OFF",
    category: "Women",
    rating: 4.2,
    reviews: 116,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800",
  },
  {
    id: "10",
    name: "Women's Denim Jeans",
    price: 1199,
    oldPrice: 2199,
    discount: "45% OFF",
    category: "Women",
    rating: 4.4,
    reviews: 192,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
  },
  {
    id: "11",
    name: "Elegant Party Dress",
    price: 1799,
    oldPrice: 3299,
    discount: "45% OFF",
    category: "Women",
    rating: 4.6,
    reviews: 158,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
  },

  // ==================== KIDS ====================

  {
    id: "12",
    name: "Kids Cotton T-Shirt",
    price: 499,
    oldPrice: 899,
    discount: "44% OFF",
    category: "Kids",
    rating: 4.3,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
  },
  {
    id: "13",
    name: "Kids Casual Outfit",
    price: 799,
    oldPrice: 1399,
    discount: "43% OFF",
    category: "Kids",
    rating: 4.5,
    reviews: 102,
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800",
  },
  {
    id: "14",
    name: "Kids Summer Dress",
    price: 699,
    oldPrice: 1299,
    discount: "46% OFF",
    category: "Kids",
    rating: 4.4,
    reviews: 91,
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800",
  },
  {
    id: "15",
    name: "Kids Sneakers",
    price: 899,
    oldPrice: 1599,
    discount: "44% OFF",
    category: "Kids",
    rating: 4.6,
    reviews: 119,
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800",
  },

  // ==================== BEAUTY ====================

  {
    id: "16",
    name: "Matte Lipstick",
    price: 399,
    oldPrice: 699,
    discount: "43% OFF",
    category: "Beauty",
    rating: 4.5,
    reviews: 243,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
  },
  {
    id: "17",
    name: "Beauty Skincare Set",
    price: 899,
    oldPrice: 1499,
    discount: "40% OFF",
    category: "Beauty",
    rating: 4.4,
    reviews: 174,
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800",
  },
  {
    id: "18",
    name: "Perfume Collection",
    price: 1199,
    oldPrice: 1999,
    discount: "40% OFF",
    category: "Beauty",
    rating: 4.6,
    reviews: 218,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
  },
  {
    id: "19",
    name: "Makeup Essentials Kit",
    price: 999,
    oldPrice: 1799,
    discount: "44% OFF",
    category: "Beauty",
    rating: 4.3,
    reviews: 136,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
  },
];

const categories = ["All", "Men", "Women", "Kids", "Shoes", "Beauty"];

export default function ExploreScreen() {
  const params = useLocalSearchParams();

  const incomingCategory = String(params.category || "");

  const validCategory = categories.includes(incomingCategory)
    ? incomingCategory
    : "All";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(validCategory);
  const [sort, setSort] = useState("Default");

  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sort === "Low to High") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "High to Low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [search, selectedCategory, sort]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSort("Default");
  };

  const toggleWishlist = async (product: any) => {
    try {
      const existingData = await AsyncStorage.getItem("myntra_wishlist");

      let list = existingData ? JSON.parse(existingData) : [];

      const exists = list.some((item: any) => item.id === product.id);

      if (exists) {
        list = list.filter((item: any) => item.id !== product.id);
      } else {
        list.push(product);
      }

      await AsyncStorage.setItem("myntra_wishlist", JSON.stringify(list));

      setWishlist(list.map((item: any) => item.id));
    } catch (error) {
      console.log("Wishlist error:", error);
    }
  };

  const addToBag = async (product: any) => {
    try {
      const existingData = await AsyncStorage.getItem("myntra_bag");

      let bag = existingData ? JSON.parse(existingData) : [];

      const existingIndex = bag.findIndex(
        (item: any) => item.id === product.id,
      );

      if (existingIndex >= 0) {
        bag[existingIndex].quantity = (bag[existingIndex].quantity || 1) + 1;
      } else {
        bag.push({
          ...product,
          quantity: 1,
          size: "M",
        });
      }

      await AsyncStorage.setItem("myntra_bag", JSON.stringify(bag));

      router.push("/bag");
    } catch (error) {
      console.log("Bag error:", error);
    }
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
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explore</Text>

          <Text style={styles.subtitle}>Find your favourite fashion</Text>
        </View>

        <View style={styles.headerButtons}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/wishlist")}
          >
            <Text style={styles.headerIcon}>♡</Text>
          </Pressable>

          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/bag")}
          >
            <Text style={styles.headerIcon}>🛍</Text>
          </Pressable>
        </View>
      </View>

      {/* SEARCH */}

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} style={styles.clearButton}>
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* CATEGORIES */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => {
          const selected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selected && styles.categorySelected,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selected && styles.categorySelectedText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* RESULT + SORT */}

      <View style={styles.sortRow}>
        <Text style={styles.resultText}>
          {filteredProducts.length} Products
        </Text>

        <View style={styles.sortButtons}>
          <Pressable
            onPress={() =>
              setSort(sort === "Low to High" ? "Default" : "Low to High")
            }
            style={[
              styles.sortButton,
              sort === "Low to High" && styles.sortActive,
            ]}
          >
            <Text
              style={[
                styles.sortText,
                sort === "Low to High" && styles.sortActiveText,
              ]}
            >
              ₹ Low
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setSort(sort === "High to Low" ? "Default" : "High to Low")
            }
            style={[
              styles.sortButton,
              sort === "High to Low" && styles.sortActive,
            ]}
          >
            <Text
              style={[
                styles.sortText,
                sort === "High to Low" && styles.sortActiveText,
              ]}
            >
              ₹ High
            </Text>
          </Pressable>
        </View>
      </View>

      {/* PRODUCTS */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>

            <Text style={styles.emptyTitle}>No Products Found</Text>

            <Text style={styles.emptyText}>
              Try another search or category.
            </Text>

            <Pressable style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetText}>RESET FILTERS</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <View key={product.id} style={styles.card}>
                  {/* IMAGE */}

                  <Pressable onPress={() => openProduct(product.id)}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{
                          uri: product.image,
                        }}
                        style={styles.productImage}
                      />

                      {/* WISHLIST */}

                      <Pressable
                        style={styles.heartButton}
                        onPress={() => toggleWishlist(product)}
                      >
                        <Text
                          style={[
                            styles.heart,
                            isWishlisted && styles.heartActive,
                          ]}
                        >
                          {isWishlisted ? "♥" : "♡"}
                        </Text>
                      </Pressable>
                    </View>
                  </Pressable>

                  {/* PRODUCT INFO */}

                  <Pressable onPress={() => openProduct(product.id)}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>

                      <Text style={styles.productCategory}>
                        {product.category}
                      </Text>

                      {/* PRICE */}

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{product.price}</Text>

                        <Text style={styles.oldPrice}>₹{product.oldPrice}</Text>
                      </View>

                      <Text style={styles.discount}>{product.discount}</Text>

                      {/* RATING */}

                      <View style={styles.ratingRow}>
                        <View style={styles.ratingBox}>
                          <Text style={styles.ratingNumber}>
                            {product.rating}
                          </Text>

                          <Text style={styles.ratingStar}>★</Text>
                        </View>

                        <Text style={styles.reviewCount}>
                          {product.reviews} ratings
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {/* ADD TO BAG */}

                  <Pressable
                    style={styles.addButton}
                    onPress={() => addToBag(product)}
                  >
                    <Text style={styles.addButtonText}>ADD TO BAG</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  /* HEADER */

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#222",
  },

  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f6",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    fontSize: 20,
  },

  /* SEARCH */

  searchBox: {
    height: 50,
    backgroundColor: "#fff",
    margin: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },

  clearButton: {
    padding: 5,
  },

  clear: {
    fontSize: 16,
    color: "#777",
  },

  /* CATEGORIES */

  categoryScroll: {
    maxHeight: 50,
  },

  categoryContent: {
    paddingHorizontal: 12,
  },

  categoryButton: {
    height: 38,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginRight: 8,
  },

  categorySelected: {
    backgroundColor: "#ff3f6c",
    borderColor: "#ff3f6c",
  },

  categoryText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },

  categorySelectedText: {
    color: "#fff",
  },

  /* SORT */

  sortRow: {
    height: 60,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },

  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },

  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
  },

  sortActive: {
    backgroundColor: "#fff0f4",
    borderColor: "#ff3f6c",
  },

  sortText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },

  sortActiveText: {
    color: "#ff3f6c",
  },

  /* PRODUCTS */

  scroll: {
    flex: 1,
  },

  productsContainer: {
    paddingBottom: 100,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 6,
  },

  card: {
    width: "50%",
    padding: 6,
  },

  imageContainer: {
    position: "relative",
    backgroundColor: "#eee",
  },

  productImage: {
    width: "100%",
    height: 245,
    resizeMode: "cover",
    backgroundColor: "#eee",
  },

  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  heart: {
    fontSize: 22,
    color: "#555",
  },

  heartActive: {
    color: "#ff3f6c",
  },

  productInfo: {
    backgroundColor: "#fff",
    padding: 10,
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

  /* ADD TO BAG */

  addButton: {
    height: 38,
    marginTop: 1,
    backgroundColor: "#ff3f6c",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  /* EMPTY */

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 55,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222",
    marginTop: 15,
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    marginTop: 7,
    textAlign: "center",
  },

  resetButton: {
    marginTop: 20,
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 22,
    height: 45,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  resetText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
