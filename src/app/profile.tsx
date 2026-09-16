import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const API_URL = "http://localhost:5000";

const ORDER_KEY = "myntra_last_order";
const ORDERS_KEY = "myntra_orders";
const BAG_KEY = "myntra_bag";
const WISHLIST_KEY = "myntra_wishlist";
const COUPON_KEY = "myntra_coupon";

export default function ProfileScreen() {
  const [orderCount, setOrderCount] = useState(0);
  const [latestOrder, setLatestOrder] = useState<any>(null);

  const [bagCount, setBagCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [couponCode, setCouponCode] = useState("");

  // ============================================
  // LOAD PROFILE DATA
  // ============================================

  const loadProfile = async () => {
    try {
      // ========================================
      // LOGIN + USER
      // ========================================

      const token = await AsyncStorage.getItem("myntra_token");

      const savedUser = await AsyncStorage.getItem("myntra_user");

      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser);

          setIsLoggedIn(true);
          setUserName(user.name || "");
          setUserEmail(user.email || "");

          // Check current user from backend
          try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();

              setUserName(data.name || user.name || "");

              setUserEmail(data.email || user.email || "");

              await AsyncStorage.setItem("myntra_user", JSON.stringify(data));
            } else if (response.status === 401) {
              // Token expired or invalid
              await AsyncStorage.removeItem("myntra_token");

              await AsyncStorage.removeItem("myntra_user");

              await AsyncStorage.removeItem("myntra_logged_in");

              setIsLoggedIn(false);
              setUserName("");
              setUserEmail("");
            }
          } catch (error) {
            console.log("AUTH CHECK ERROR:", error);
          }
        } catch (error) {
          console.log("USER DATA ERROR:", error);

          setIsLoggedIn(false);
          setUserName("");
          setUserEmail("");
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUserEmail("");
      }

      // ========================================
      // ORDER HISTORY
      // ========================================

      const savedOrders = await AsyncStorage.getItem(ORDERS_KEY);

      if (savedOrders) {
        try {
          const orders = JSON.parse(savedOrders);

          if (Array.isArray(orders)) {
            setOrderCount(orders.length);

            if (orders.length > 0) {
              setLatestOrder(orders[0]);
            } else {
              setLatestOrder(null);
            }
          } else {
            setOrderCount(0);
            setLatestOrder(null);
          }
        } catch (error) {
          console.log("ORDERS DATA ERROR:", error);

          setOrderCount(0);
          setLatestOrder(null);
        }
      } else {
        // Support the old single-order system
        const savedOrder = await AsyncStorage.getItem(ORDER_KEY);

        if (savedOrder) {
          try {
            const oldOrder = JSON.parse(savedOrder);

            setOrderCount(1);
            setLatestOrder(oldOrder);
          } catch {
            setOrderCount(0);
            setLatestOrder(null);
          }
        } else {
          setOrderCount(0);
          setLatestOrder(null);
        }
      }

      // ========================================
      // BAG
      // ========================================

      const savedBag = await AsyncStorage.getItem(BAG_KEY);

      if (savedBag) {
        try {
          const bag = JSON.parse(savedBag);

          if (Array.isArray(bag)) {
            const count = bag.reduce(
              (total: number, item: any) => total + Number(item.quantity || 1),
              0,
            );

            setBagCount(count);
          } else {
            setBagCount(0);
          }
        } catch {
          setBagCount(0);
        }
      } else {
        setBagCount(0);
      }

      // ========================================
      // WISHLIST
      // ========================================

      const savedWishlist = await AsyncStorage.getItem(WISHLIST_KEY);

      if (savedWishlist) {
        try {
          const wishlist = JSON.parse(savedWishlist);

          if (Array.isArray(wishlist)) {
            setWishlistCount(wishlist.length);
          } else {
            setWishlistCount(0);
          }
        } catch {
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }

      // ========================================
      // COUPON
      // ========================================

      const savedCoupon = await AsyncStorage.getItem(COUPON_KEY);

      if (savedCoupon) {
        try {
          const coupon = JSON.parse(savedCoupon);

          // Support both:
          // "MYNTRA10"
          // and { code: "MYNTRA10" }

          if (typeof coupon === "string") {
            setCouponCode(coupon);
          } else {
            setCouponCode(coupon?.code || "");
          }
        } catch {
          // If stored value is plain text
          setCouponCode(savedCoupon);
        }
      } else {
        setCouponCode("");
      }
    } catch (error) {
      console.log("PROFILE LOAD ERROR:", error);
    }
  };

  // ============================================
  // RELOAD WHEN PROFILE OPENS
  // ============================================

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  // ============================================
  // LOGIN
  // ============================================

  const handleLogin = () => {
    router.push("/login");
  };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("myntra_token");

      await AsyncStorage.removeItem("myntra_user");

      await AsyncStorage.removeItem("myntra_logged_in");

      setIsLoggedIn(false);
      setUserName("");
      setUserEmail("");

      router.replace("/login");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  // ============================================
  // AVATAR
  // ============================================

  const avatarLetter =
    userName.trim().length > 0 ? userName.trim().charAt(0).toUpperCase() : "A";

  // ============================================
  // LATEST ORDER TEXT
  // ============================================

  const latestOrderText = latestOrder
    ? `Order #${latestOrder.id || latestOrder.orderNumber || "N/A"}`
    : "View your orders";

  // ============================================
  // PAGE
  // ============================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HEADER */}

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>

          {isLoggedIn ? (
            <>
              <Text style={styles.welcome}>Hello, {userName || "User"}!</Text>

              <Text style={styles.email}>{userEmail}</Text>

              <Text style={styles.subtitle}>Manage your Myntra account</Text>

              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>LOGOUT</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.welcome}>Welcome!</Text>

              <Text style={styles.subtitle}>
                Sign in to access your account
              </Text>

              <Pressable style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginText}>LOGIN / SIGN UP</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* STATS */}

        <View style={styles.stats}>
          {/* ORDERS */}

          <Pressable style={styles.stat} onPress={() => router.push("/orders")}>
            <Text style={styles.statNumber}>{orderCount}</Text>

            <Text style={styles.statLabel}>Orders</Text>
          </Pressable>

          {/* WISHLIST */}

          <Pressable
            style={styles.stat}
            onPress={() => router.push("/wishlist")}
          >
            <Text style={styles.statNumber}>{wishlistCount}</Text>

            <Text style={styles.statLabel}>Wishlist</Text>
          </Pressable>

          {/* BAG */}

          <Pressable style={styles.stat} onPress={() => router.push("/bag")}>
            <Text style={styles.statNumber}>{bagCount}</Text>

            <Text style={styles.statLabel}>Bag Items</Text>
          </Pressable>
        </View>

        {/* MY ORDERS */}

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/orders")}
        >
          <View>
            <Text style={styles.menuTitle}>My Orders</Text>

            <Text style={styles.menuSub}>{latestOrderText}</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* MY WISHLIST */}

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/wishlist")}
        >
          <View>
            <Text style={styles.menuTitle}>My Wishlist</Text>

            <Text style={styles.menuSub}>{wishlistCount} saved items</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* MY BAG */}

        <Pressable style={styles.menuItem} onPress={() => router.push("/bag")}>
          <View>
            <Text style={styles.menuTitle}>My Bag</Text>

            <Text style={styles.menuSub}>{bagCount} items in your bag</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* SAVED ADDRESSES */}

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/addresses")}
        >
          <View>
            <Text style={styles.menuTitle}>Saved Addresses</Text>

            <Text style={styles.menuSub}>Manage your delivery addresses</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* COUPONS */}

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/coupons")}
        >
          <View>
            <Text style={styles.menuTitle}>Coupons</Text>

            <Text style={styles.menuSub}>
              {couponCode
                ? `Applied: ${couponCode}`
                : "Available coupons and offers"}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* HELP CENTER */}

        <Pressable style={styles.menuItem} onPress={() => {}}>
          <View>
            <Text style={styles.menuTitle}>Help Center</Text>

            <Text style={styles.menuSub}>Need help with your order?</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
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
    backgroundColor: "#fff",
  },

  scroll: {
    flex: 1,
  },

  profileHeader: {
    alignItems: "center",
    paddingTop: 35,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#ff3f6c",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
  },

  welcome: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111",
    marginTop: 18,
    textAlign: "center",
  },

  email: {
    fontSize: 14,
    color: "#555",
    marginTop: 7,
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 7,
  },

  loginButton: {
    marginTop: 20,
    height: 48,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#ff3f6c",
    fontSize: 14,
    fontWeight: "800",
  },

  logoutButton: {
    marginTop: 20,
    height: 45,
    paddingHorizontal: 28,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },

  stats: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 25,
  },

  statNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111",
  },

  statLabel: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },

  menuItem: {
    minHeight: 75,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 25,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  menuSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },

  arrow: {
    fontSize: 25,
    color: "#888",
  },
});
