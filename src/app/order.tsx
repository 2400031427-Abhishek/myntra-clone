import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ORDER_KEY = "myntra_last_order";

export default function OrderScreen() {
  const params = useLocalSearchParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD ORDER
  // ============================================

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const savedOrder = await AsyncStorage.getItem(ORDER_KEY);

      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);

        setOrder(parsedOrder);
      } else {
        // Fallback to URL parameters
        setOrder({
          orderNumber: String(params.orderNumber || "MYN12345678"),

          totalAmount: Number(params.totalAmount || 0),

          paymentMethod: "COD",

          items: [],
        });
      }
    } catch (error) {
      console.log("LOAD ORDER ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  // ============================================
  // ORDER DATA
  // ============================================

  const orderNumber =
    order?.orderNumber || String(params.orderNumber || "MYN12345678");

  const totalAmount = Number(order?.totalAmount || params.totalAmount || 0);

  const paymentMethod = order?.paymentMethod || "COD";

  const items = Array.isArray(order?.items) ? order.items : [];

  const totalItems = items.reduce(
    (total: number, item: any) => total + Number(item.quantity || 1),
    0,
  );

  // ============================================
  // UI
  // ============================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================
            SUCCESS SECTION
        ====================================== */}

        <View style={styles.successSection}>
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>

          <Text style={styles.successTitle}>Order Placed!</Text>

          <Text style={styles.successText}>
            Your order has been placed successfully.
          </Text>

          {/* ORDER NUMBER */}

          <View style={styles.orderNumberBox}>
            <Text style={styles.orderNumberLabel}>ORDER NUMBER</Text>

            <Text style={styles.orderNumber}>#{orderNumber}</Text>
          </View>
        </View>

        {/* ======================================
            ORDER DETAILS
        ====================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER DETAILS</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items</Text>

            <Text style={styles.detailValue}>
              {totalItems} {totalItems === 1 ? "Item" : "Items"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>

            <Text style={styles.detailValue}>
              {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>

            <Text style={styles.amount}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* ======================================
            ORDERED PRODUCTS
        ====================================== */}

        {items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITEMS ORDERED</Text>

            {items.map((item: any, index: number) => (
              <View
                key={item.id || `${item.productId}-${index}`}
                style={styles.productRow}
              >
                {/* IMAGE */}

                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={styles.productImage}
                />

                {/* DETAILS */}

                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <Text style={styles.productSize}>Size: {item.size}</Text>

                  <Text style={styles.productQuantity}>
                    Quantity: {item.quantity || 1}
                  </Text>

                  <Text style={styles.productPrice}>
                    ₹{Number(item.price) * Number(item.quantity || 1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================
            DELIVERY DETAILS
        ====================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DELIVERY DETAILS</Text>

          <View style={styles.deliveryBlock}>
            <Text style={styles.deliveryLabel}>Expected Delivery</Text>

            <Text style={styles.deliveryValue}>3–5 Business Days</Text>
          </View>

          <View style={styles.deliveryBlock}>
            <Text style={styles.deliveryLabel}>Payment Method</Text>

            <Text style={styles.deliveryValue}>
              {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
            </Text>
          </View>

          {order?.customer && (
            <View style={styles.deliveryBlock}>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>

              <Text style={styles.deliveryValue}>{order.customer.name}</Text>

              <Text style={styles.addressText}>{order.customer.address}</Text>

              <Text style={styles.addressText}>
                {order.customer.city} - {order.customer.pincode}
              </Text>

              <Text style={styles.addressText}>
                Phone: {order.customer.phone}
              </Text>
            </View>
          )}
        </View>

        {/* ======================================
            ORDER STATUS
        ====================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER STATUS</Text>

          {/* CONFIRMED */}

          <View style={styles.statusRow}>
            <View style={[styles.statusCircle, styles.statusActive]}>
              <Text style={styles.statusCheck}>✓</Text>
            </View>

            <View style={styles.statusDetails}>
              <Text style={styles.statusTitle}>Order Confirmed</Text>

              <Text style={styles.statusSub}>
                Your order has been confirmed
              </Text>
            </View>
          </View>

          {/* SHIPPED */}

          <View style={styles.statusRow}>
            <View style={styles.statusCircle} />

            <View style={styles.statusDetails}>
              <Text style={styles.statusTitle}>Shipped</Text>

              <Text style={styles.statusSub}>Waiting for shipment</Text>
            </View>
          </View>

          {/* DELIVERED */}

          <View style={styles.statusRow}>
            <View style={styles.statusCircle} />

            <View style={styles.statusDetails}>
              <Text style={styles.statusTitle}>Delivered</Text>

              <Text style={styles.statusSub}>Waiting for delivery</Text>
            </View>
          </View>
        </View>

        {/* ======================================
            BUTTONS
        ====================================== */}

        <View style={styles.buttons}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.primaryText}>CONTINUE SHOPPING</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.secondaryText}>VIEW MY PROFILE</Text>
          </Pressable>
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

  scroll: {
    flex: 1,
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

  // ==========================================
  // SUCCESS
  // ==========================================

  successSection: {
    backgroundColor: "#fff7f9",
    alignItems: "center",
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 20,
  },

  checkCircle: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: "#03a685",
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "700",
  },

  successTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
    marginTop: 25,
  },

  successText: {
    fontSize: 15,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },

  orderNumberBox: {
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 35,
    paddingVertical: 15,
    alignItems: "center",
  },

  orderNumberLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "700",
    letterSpacing: 1,
  },

  orderNumber: {
    fontSize: 19,
    color: "#ff3f6c",
    fontWeight: "800",
    marginTop: 6,
  },

  // ==========================================
  // SECTION
  // ==========================================

  section: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#222",
    marginBottom: 18,
  },

  // ==========================================
  // DETAILS
  // ==========================================

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  detailLabel: {
    fontSize: 14,
    color: "#777",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },

  // ==========================================
  // PRODUCTS
  // ==========================================

  productRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  productImage: {
    width: 90,
    height: 105,
    borderRadius: 5,
    backgroundColor: "#eee",
  },

  productDetails: {
    flex: 1,
    paddingLeft: 14,
  },

  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  productSize: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  productQuantity: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },

  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 8,
  },

  // ==========================================
  // DELIVERY
  // ==========================================

  deliveryBlock: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  deliveryLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 5,
  },

  deliveryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  addressText: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

  // ==========================================
  // STATUS
  // ==========================================

  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
  },

  statusCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  statusActive: {
    backgroundColor: "#03a685",
  },

  statusCheck: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  statusDetails: {
    marginLeft: 15,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  statusSub: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  // ==========================================
  // BUTTONS
  // ==========================================

  buttons: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },

  primaryButton: {
    height: 52,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  secondaryButton: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  secondaryText: {
    color: "#ff3f6c",
    fontSize: 14,
    fontWeight: "800",
  },
});
