import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ORDERS_KEY = "myntra_orders";
const LAST_ORDER_KEY = "myntra_last_order";

type Product = {
  id: string;
  title?: string;
  name?: string;
  brand?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  size?: string;
  quantity?: number;
};

type Address = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type?: string;
};

type Order = {
  id: string;
  items?: Product[];
  address?: Address;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  total?: number;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  date?: string;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const ordersData = await AsyncStorage.getItem(ORDERS_KEY);

      let savedOrders: Order[] = ordersData ? JSON.parse(ordersData) : [];

      // Support old single-order system
      if (savedOrders.length === 0) {
        const lastOrderData = await AsyncStorage.getItem(LAST_ORDER_KEY);

        if (lastOrderData) {
          const lastOrder: Order = JSON.parse(lastOrderData);

          savedOrders = [lastOrder];

          await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(savedOrders));
        }
      }

      // Sort newest orders first
      savedOrders.sort(
        (a, b) =>
          new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
      );

      savedOrders.reverse();

      setOrders(savedOrders);
    } catch (error) {
      console.log("Orders loading error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (date?: string) => {
    if (!date) {
      return "Date unavailable";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const getItemCount = (items: Product[] = []) => {
    return items.reduce((total, item) => total + Number(item.quantity || 1), 0);
  };

  const getProductName = (item: Product) => {
    return item.title || item.name || "Product";
  };

  const getProductPrice = (item: Product) => {
    return Number(item.price || 0);
  };

  const getOrderTotal = (order: Order) => {
    return Number(order.total || 0);
  };

  const getOrderDiscount = (order: Order) => {
    return Number(order.discount || 0);
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "Cancelled":
        return {
          badge: styles.cancelledBadge,
          text: styles.cancelledStatusText,
        };

      case "Delivered":
        return {
          badge: styles.deliveredBadge,
          text: styles.deliveredStatusText,
        };

      case "Shipped":
        return {
          badge: styles.shippedBadge,
          text: styles.shippedStatusText,
        };

      case "Out for Delivery":
        return {
          badge: styles.outForDeliveryBadge,
          text: styles.outForDeliveryStatusText,
        };

      default:
        return {
          badge: styles.statusBadge,
          text: styles.statusText,
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff3f6c" />

        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>My Orders</Text>

        <View style={styles.headerSpace} />
      </View>

      {/* EMPTY ORDERS */}

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>

          <Text style={styles.emptyTitle}>No Orders Yet</Text>

          <Text style={styles.emptyText}>
            You haven't placed any orders yet.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.shopButtonText}>START SHOPPING</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ORDER COUNT */}

          <View style={styles.topRow}>
            <Text style={styles.orderCount}>
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </Text>
          </View>

          {/* ORDER CARDS */}

          {orders.map((order, orderIndex) => {
            const items = order.items || [];

            const itemCount = getItemCount(items);

            const total = getOrderTotal(order);

            const discount = getOrderDiscount(order);

            const status = order.status || "Order Placed";

            const statusStyle = getStatusStyle(status);

            return (
              <Pressable
                key={`${order.id}-${orderIndex}`}
                style={styles.orderCard}
                onPress={() =>
                  router.push({
                    pathname: "/order-details",
                    params: {
                      id: order.id,
                    },
                  })
                }
              >
                {/* ORDER HEADER */}

                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>

                    <Text style={styles.orderDate}>
                      Placed on {formatDate(order.date)}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, statusStyle.badge]}>
                    <Text style={[styles.statusText, statusStyle.text]}>
                      {status}
                    </Text>
                  </View>
                </View>

                {/* PRODUCTS */}

                <View style={styles.itemsSection}>
                  {items.slice(0, 3).map((item, index) => {
                    const quantity = Number(item.quantity || 1);

                    const price = getProductPrice(item);

                    const itemTotal = price * quantity;

                    return (
                      <View key={`${item.id}-${index}`} style={styles.itemRow}>
                        {/* PRODUCT IMAGE */}

                        <View style={styles.itemImage}>
                          {item.image ? (
                            <Image
                              source={{
                                uri: item.image,
                              }}
                              style={styles.productImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.imageEmoji}>👕</Text>
                          )}
                        </View>

                        {/* PRODUCT INFORMATION */}

                        <View style={styles.itemInfo}>
                          <Text style={styles.brand}>
                            {item.brand || "Myntra"}
                          </Text>

                          <Text style={styles.itemTitle} numberOfLines={2}>
                            {getProductName(item)}
                          </Text>

                          <View style={styles.metaRow}>
                            {item.size && (
                              <Text style={styles.itemMeta}>
                                Size: {item.size}
                              </Text>
                            )}

                            <Text style={styles.itemMeta}>Qty: {quantity}</Text>
                          </View>
                        </View>

                        {/* PRODUCT PRICE */}

                        <Text style={styles.itemPrice}>
                          ₹{Number(itemTotal || 0).toLocaleString("en-IN")}
                        </Text>
                      </View>
                    );
                  })}

                  {/* MORE PRODUCTS */}

                  {items.length > 3 && (
                    <Text style={styles.moreItems}>
                      + {items.length - 3} more{" "}
                      {items.length - 3 === 1 ? "item" : "items"}
                    </Text>
                  )}

                  {items.length === 0 && (
                    <Text style={styles.noItemsText}>
                      Product information unavailable
                    </Text>
                  )}
                </View>

                {/* PAYMENT INFORMATION */}

                <View style={styles.paymentSection}>
                  <View style={styles.paymentLeft}>
                    <Text style={styles.paymentLabel}>PAYMENT</Text>

                    <Text style={styles.paymentValue}>
                      {order.paymentMethod || "Cash on Delivery"}
                    </Text>
                  </View>

                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentLabel}>PAYMENT STATUS</Text>

                    <Text
                      style={[
                        styles.paymentValue,
                        order.paymentStatus === "Paid"
                          ? styles.paidText
                          : styles.pendingText,
                      ]}
                    >
                      {order.paymentStatus || "Pending"}
                    </Text>
                  </View>
                </View>

                {/* TOTAL */}

                <View style={styles.totalSection}>
                  <View>
                    <Text style={styles.itemCount}>
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </Text>

                    {discount > 0 && (
                      <Text style={styles.savedText}>
                        Saved ₹{Number(discount || 0).toLocaleString("en-IN")}
                      </Text>
                    )}

                    {order.coupon?.code && (
                      <Text style={styles.couponText}>
                        Coupon: {order.coupon.code}
                      </Text>
                    )}
                  </View>

                  <View style={styles.totalRight}>
                    <Text style={styles.totalLabel}>Total</Text>

                    <Text style={styles.totalValue}>
                      ₹{Number(total || 0).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* VIEW DETAILS */}

                <View style={styles.detailsBar}>
                  <Text style={styles.detailsText}>VIEW ORDER DETAILS</Text>

                  <Text style={styles.arrow}>›</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f6",
  },

  header: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: {
    width: 35,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  back: {
    fontSize: 36,
    color: "#282c3f",
    lineHeight: 40,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#282c3f",
  },

  headerSpace: {
    width: 35,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 14,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  topRow: {
    marginBottom: 12,
  },

  orderCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#282c3f",
  },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },

  orderHeader: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  orderHeaderLeft: {
    flex: 1,
    paddingRight: 10,
  },

  orderId: {
    fontSize: 14,
    fontWeight: "800",
    color: "#282c3f",
  },

  orderDate: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  statusBadge: {
    backgroundColor: "#e8f8f3",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
  },

  cancelledBadge: {
    backgroundColor: "#ffe8ed",
  },

  deliveredBadge: {
    backgroundColor: "#e8f8f3",
  },

  shippedBadge: {
    backgroundColor: "#eef4ff",
  },

  outForDeliveryBadge: {
    backgroundColor: "#fff5df",
  },

  statusText: {
    color: "#03a685",
    fontSize: 10,
    fontWeight: "800",
  },

  cancelledStatusText: {
    color: "#ff3f6c",
  },

  deliveredStatusText: {
    color: "#03a685",
  },

  shippedStatusText: {
    color: "#2874f0",
  },

  outForDeliveryStatusText: {
    color: "#e08b00",
  },

  itemsSection: {
    padding: 14,
  },

  itemRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },

  itemImage: {
    width: 70,
    height: 85,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imageEmoji: {
    fontSize: 28,
  },

  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },

  brand: {
    fontSize: 13,
    fontWeight: "700",
    color: "#282c3f",
  },

  itemTitle: {
    fontSize: 12,
    color: "#555",
    marginTop: 3,
    lineHeight: 17,
  },

  metaRow: {
    flexDirection: "row",
    gap: 12,
  },

  itemMeta: {
    fontSize: 11,
    color: "#777",
    marginTop: 5,
  },

  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#282c3f",
  },

  moreItems: {
    fontSize: 12,
    color: "#ff3f6c",
    fontWeight: "700",
    marginTop: 2,
  },

  noItemsText: {
    fontSize: 12,
    color: "#888",
  },

  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  paymentLeft: {
    flex: 1,
  },

  paymentRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  paymentLabel: {
    fontSize: 10,
    color: "#888",
    textTransform: "uppercase",
  },

  paymentValue: {
    fontSize: 12,
    color: "#282c3f",
    fontWeight: "700",
    marginTop: 4,
  },

  paidText: {
    color: "#03a685",
  },

  pendingText: {
    color: "#e08b00",
  },

  totalSection: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemCount: {
    fontSize: 11,
    color: "#777",
  },

  savedText: {
    fontSize: 11,
    color: "#03a685",
    fontWeight: "700",
    marginTop: 4,
  },

  couponText: {
    fontSize: 10,
    color: "#ff3f6c",
    fontWeight: "700",
    marginTop: 4,
  },

  totalRight: {
    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 10,
    color: "#777",
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#282c3f",
    marginTop: 2,
  },

  detailsBar: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailsText: {
    color: "#ff3f6c",
    fontSize: 11,
    fontWeight: "800",
  },

  arrow: {
    fontSize: 22,
    color: "#888",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#282c3f",
  },

  emptyText: {
    color: "#777",
    fontSize: 13,
    marginTop: 7,
    marginBottom: 22,
  },

  shopButton: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 4,
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
