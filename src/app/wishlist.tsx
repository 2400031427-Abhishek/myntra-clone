import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const WISHLIST_KEY = "myntra_wishlist";
const BAG_KEY = "myntra_bag";

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD WISHLIST
  // ============================================

  const loadWishlist = async () => {
    try {
      const savedWishlist = await AsyncStorage.getItem(WISHLIST_KEY);

      console.log("WISHLIST:", savedWishlist);

      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);

        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        } else {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.log("WISHLIST LOAD ERROR:", error);

      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever Wishlist opens
  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, []),
  );

  // ============================================
  // REMOVE FROM WISHLIST
  // ============================================

  const removeFromWishlist = async (productId: string) => {
    try {
      const newWishlist = wishlist.filter(
        (item) => String(item.id) !== String(productId),
      );

      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));

      setWishlist(newWishlist);
    } catch (error) {
      console.log("REMOVE WISHLIST ERROR:", error);
    }
  };

  // ============================================
  // MOVE TO BAG
  // ============================================

  const moveToBag = async (product: any) => {
    try {
      const savedBag = await AsyncStorage.getItem(BAG_KEY);

      let bag: any[] = [];

      if (savedBag) {
        try {
          const parsed = JSON.parse(savedBag);

          if (Array.isArray(parsed)) {
            bag = parsed;
          }
        } catch {
          bag = [];
        }
      }

      // Wishlist products don't have a size yet.
      // Use M as default size for Move to Bag.
      const size = product.size || "M";

      const itemId = `${product.id}-${size}`;

      const existingIndex = bag.findIndex((item) => item.id === itemId);

      if (existingIndex !== -1) {
        bag[existingIndex] = {
          ...bag[existingIndex],
          quantity: Number(bag[existingIndex].quantity || 1) + 1,
        };
      } else {
        bag.push({
          id: itemId,
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          size,
          quantity: 1,
        });
      }

      await AsyncStorage.setItem(BAG_KEY, JSON.stringify(bag));

      // Remove from wishlist
      const newWishlist = wishlist.filter(
        (item) => String(item.id) !== String(product.id),
      );

      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));

      setWishlist(newWishlist);

      Alert.alert(
        "Added to Bag",
        `${product.name} has been moved to your bag.`,
        [
          {
            text: "Continue",
            style: "cancel",
          },
          {
            text: "Go to Bag",
            onPress: () => router.push("/bag"),
          },
        ],
      );
    } catch (error) {
      console.log("MOVE TO BAG ERROR:", error);

      Alert.alert("Error", "Unable to move product to bag.");
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading Wishlist...</Text>
      </View>
    );
  }

  // ============================================
  // EMPTY WISHLIST
  // ============================================

  if (wishlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyHeart}>♡</Text>

        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>

        <Text style={styles.emptyText}>
          Save your favourite products here and shop them later.
        </Text>

        <Pressable
          style={styles.shopButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.shopButtonText}>CONTINUE SHOPPING</Text>
        </Pressable>
      </View>
    );
  }

  // ============================================
  // WISHLIST
  // ============================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>

        <Text style={styles.count}>
          {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {wishlist.map((product, index) => (
            <View key={product.id || String(index)} style={styles.card}>
              {/* PRODUCT IMAGE */}

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/product",
                    params: {
                      id: String(product.id),
                    },
                  })
                }
              >
                <Image
                  source={{
                    uri: product.image,
                  }}
                  style={styles.productImage}
                />
              </Pressable>

              {/* REMOVE */}

              <Pressable
                style={styles.heartButton}
                onPress={() => removeFromWishlist(product.id)}
              >
                <Text style={styles.heart}>♥</Text>
              </Pressable>

              {/* DETAILS */}

              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>

                <Text style={styles.productCategory}>{product.category}</Text>

                <Text style={styles.productPrice}>₹{product.price}</Text>

                {/* MOVE TO BAG */}

                <Pressable
                  style={styles.bagButton}
                  onPress={() => moveToBag(product)}
                >
                  <Text style={styles.bagButtonText}>MOVE TO BAG</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  loadingText: {
    fontSize: 16,
    color: "#555",
  },

  // HEADER

  header: {
    height: 65,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222",
  },

  count: {
    fontSize: 14,
    color: "#777",
  },

  // SCROLL

  scroll: {
    flex: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 6,
  },

  // CARD

  card: {
    width: "50%",
    padding: 6,
  },

  productImage: {
    width: "100%",
    height: 245,
    resizeMode: "cover",
    backgroundColor: "#eee",
  },

  productInfo: {
    backgroundColor: "#fff",
    padding: 12,
  },

  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  productCategory: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 7,
  },

  // HEART

  heartButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },

  heart: {
    fontSize: 19,
    color: "#ff3f6c",
  },

  // BAG

  bagButton: {
    height: 42,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  bagButtonText: {
    color: "#ff3f6c",
    fontSize: 12,
    fontWeight: "800",
  },

  // EMPTY

  emptyContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyHeart: {
    fontSize: 75,
    color: "#ff3f6c",
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#222",
    marginTop: 15,
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },

  shopButton: {
    marginTop: 25,
    height: 48,
    paddingHorizontal: 25,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
