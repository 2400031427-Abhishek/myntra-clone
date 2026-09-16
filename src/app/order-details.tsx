import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
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
const BAG_KEY = "myntra_bag";

type Product = {
  id: string;
  title?: string;
  name?: string;
  brand?: string;
  price?: number;
  oldPrice?: number;
  discount?: string;
  category?: string;
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

type Coupon = {
  code?: string;
  discountType?: string;
  discountValue?: number;
} | null;

type Order = {
  id: string;
  items?: Product[];
  address?: Address;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  total?: number;
  coupon?: Coupon;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  date?: string;
};

const STATUS_STEPS = [
  "Order Placed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export default function OrderDetails() {
  const params = useLocalSearchParams();

  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelMessage, setCancelMessage] = useState("");
  const [reorderMessage, setReorderMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      let orders: Order[] = [];

      const ordersData = await AsyncStorage.getItem(ORDERS_KEY);

      if (ordersData) {
        try {
          const parsed = JSON.parse(ordersData);

          if (Array.isArray(parsed)) {
            orders = parsed;
          }
        } catch {
          orders = [];
        }
      }

      let foundOrder = orders.find(
        (item) => String(item.id) === String(orderId),
      );

      if (!foundOrder) {
        const lastOrderData = await AsyncStorage.getItem(LAST_ORDER_KEY);

        if (lastOrderData) {
          try {
            const lastOrder: Order = JSON.parse(lastOrderData);

            if (String(lastOrder.id) === String(orderId)) {
              foundOrder = lastOrder;

              orders = [
                lastOrder,
                ...orders.filter(
                  (item) => String(item.id) !== String(lastOrder.id),
                ),
              ];

              await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            }
          } catch {
            // Ignore invalid data
          }
        }
      }

      setOrder(foundOrder || null);
    } catch (error) {
      console.log("LOAD ORDER ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // UPDATE ORDER STATUS
  // -----------------------------------------

  const updateOrderStatus = async (newStatus: string) => {
    if (!order || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      setStatusMessage("");

      const selectedOrderId = String(order.id);

      const ordersData = await AsyncStorage.getItem(ORDERS_KEY);

      let orders: Order[] = [];

      if (ordersData) {
        try {
          const parsed = JSON.parse(ordersData);

          if (Array.isArray(parsed)) {
            orders = parsed;
          }
        } catch {
          orders = [];
        }
      }

      const orderExists = orders.some(
        (item) => String(item.id) === selectedOrderId,
      );

      if (!orderExists) {
        orders.unshift(order);
      }

      const updatedOrders = orders.map((item) => {
        if (String(item.id) === selectedOrderId) {
          return {
            ...item,
            status: newStatus,
          };
        }

        return item;
      });

      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

      // Update latest order
      const lastOrderData = await AsyncStorage.getItem(LAST_ORDER_KEY);

      if (lastOrderData) {
        try {
          const lastOrder: Order = JSON.parse(lastOrderData);

          if (String(lastOrder.id) === selectedOrderId) {
            await AsyncStorage.setItem(
              LAST_ORDER_KEY,
              JSON.stringify({
                ...lastOrder,
                status: newStatus,
              }),
            );
          }
        } catch {
          // Ignore invalid data
        }
      }

      setOrder({
        ...order,
        status: newStatus,
      });

      setStatusMessage(`Order status updated to "${newStatus}"`);

      setCancelMessage("");
      setReorderMessage("");
    } catch (error) {
      console.log("UPDATE STATUS ERROR:", error);

      setStatusMessage("Unable to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // -----------------------------------------
  // CANCEL ORDER
  // -----------------------------------------

  const cancelOrder = async () => {
    if (!order) return;

    try {
      const selectedOrderId = String(order.id);

      const ordersData = await AsyncStorage.getItem(ORDERS_KEY);

      let orders: Order[] = [];

      if (ordersData) {
        try {
          const parsed = JSON.parse(ordersData);

          if (Array.isArray(parsed)) {
            orders = parsed;
          }
        } catch {
          orders = [];
        }
      }

      const exists = orders.some((item) => String(item.id) === selectedOrderId);

      if (!exists) {
        orders.unshift(order);
      }

      const updatedOrders = orders.map((item) => {
        if (String(item.id) === selectedOrderId) {
          return {
            ...item,
            status: "Cancelled",
          };
        }

        return item;
      });

      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

      const lastOrderData = await AsyncStorage.getItem(LAST_ORDER_KEY);

      if (lastOrderData) {
        try {
          const lastOrder: Order = JSON.parse(lastOrderData);

          if (String(lastOrder.id) === selectedOrderId) {
            await AsyncStorage.setItem(
              LAST_ORDER_KEY,
              JSON.stringify({
                ...lastOrder,
                status: "Cancelled",
              }),
            );
          }
        } catch {
          // Ignore
        }
      }

      setOrder({
        ...order,
        status: "Cancelled",
      });

      setCancelMessage("Order cancelled successfully!");

      setStatusMessage("");
      setReorderMessage("");
    } catch (error) {
      console.log("CANCEL ORDER ERROR:", error);

      setCancelMessage("Unable to cancel order. Please try again.");
    }
  };

  // -----------------------------------------
  // REORDER
  // -----------------------------------------

  const reorder = async () => {
    if (!order?.items?.length) {
      setReorderMessage("Products are not available for reorder.");
      return;
    }

    try {
      const bagData = await AsyncStorage.getItem(BAG_KEY);

      let bag: Product[] = [];

      if (bagData) {
        try {
          const parsed = JSON.parse(bagData);

          if (Array.isArray(parsed)) {
            bag = parsed;
          }
        } catch {
          bag = [];
        }
      }

      order.items.forEach((orderItem) => {
        const existingIndex = bag.findIndex(
          (bagItem) =>
            String(bagItem.id) === String(orderItem.id) &&
            String(bagItem.size || "M") === String(orderItem.size || "M"),
        );

        if (existingIndex >= 0) {
          bag[existingIndex] = {
            ...bag[existingIndex],
            quantity:
              Number(bag[existingIndex].quantity || 1) +
              Number(orderItem.quantity || 1),
          };
        } else {
          bag.push({
            ...orderItem,
            quantity: Number(orderItem.quantity || 1),
            size: orderItem.size || "M",
          });
        }
      });

      await AsyncStorage.setItem(BAG_KEY, JSON.stringify(bag));

      setReorderMessage("Products added to your bag!");

      setCancelMessage("");
      setStatusMessage("");

      setTimeout(() => {
        router.push("/bag");
      }, 700);
    } catch (error) {
      console.log("REORDER ERROR:", error);

      setReorderMessage("Unable to reorder. Please try again.");
    }
  };

  // -----------------------------------------
  // HELPERS
  // -----------------------------------------

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

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

  const formatDateTime = (date?: string) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getProductName = (item: Product) => {
    return item.title || item.name || "Product";
  };

  const getPrice = (item: Product) => {
    return Number(item.price || 0);
  };

  const getQuantity = (item: Product) => {
    return Number(item.quantity || 1);
  };

  const getSubtotal = () => {
    if (!order) return 0;

    if (Number(order.subtotal || 0) > 0) {
      return Number(order.subtotal);
    }

    return (order.items || []).reduce(
      (total, item) => total + getPrice(item) * getQuantity(item),
      0,
    );
  };

  const getDiscount = () => {
    return Number(order?.discount || 0);
  };

  const getDelivery = () => {
    return Number(order?.deliveryCharge || 0);
  };

  const getTotal = () => {
    if (order && Number(order.total || 0) > 0) {
      return Number(order.total);
    }

    return getSubtotal() - getDiscount() + getDelivery();
  };

  const getTrackingStep = () => {
    if (!order) return 0;

    switch (order.status) {
      case "Delivered":
        return 4;

      case "Out for Delivery":
        return 3;

      case "Shipped":
        return 2;

      case "Cancelled":
        return 0;

      case "Order Placed":
      default:
        return 1;
    }
  };

  const trackingStep = getTrackingStep();

  const getNextStatus = () => {
    if (!order) return null;

    switch (order.status) {
      case "Order Placed":
      case undefined:
        return "Shipped";

      case "Shipped":
        return "Out for Delivery";

      case "Out for Delivery":
        return "Delivered";

      default:
        return null;
    }
  };

  const trackingSteps = [
    {
      title: "Order Placed",
      subtitle: "Your order has been placed",
      icon: "✓",
    },
    {
      title: "Shipped",
      subtitle: "Your order is on the way",
      icon: "🚚",
    },
    {
      title: "Out for Delivery",
      subtitle: "Delivery partner is nearby",
      icon: "📍",
    },
    {
      title: "Delivered",
      subtitle: "Package delivered successfully",
      icon: "✓",
    },
  ];

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff3f6c" />

        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  // -----------------------------------------
  // NOT FOUND
  // -----------------------------------------

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Order not found</Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  const isCancelled = order.status === "Cancelled";

  const isDelivered = order.status === "Delivered";

  const nextStatus = getNextStatus();

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Order Details</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* STATUS HEADER */}

        <View style={styles.statusCard}>
          <View style={styles.statusHeaderLeft}>
            <Text style={styles.statusHeading}>
              {isCancelled
                ? "Order Cancelled"
                : isDelivered
                  ? "Order Delivered"
                  : order.status || "Order Placed"}
            </Text>

            <Text style={styles.statusSubheading}>Order #{order.id}</Text>
          </View>

          <View
            style={[
              styles.statusCircle,
              isCancelled && styles.cancelledCircle,
              isDelivered && styles.deliveredCircle,
            ]}
          >
            <Text style={styles.statusCircleText}>
              {isCancelled ? "×" : "✓"}
            </Text>
          </View>
        </View>

        {/* TRACKING */}

        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Tracking</Text>

            {trackingSteps.map((step, index) => {
              const stepNumber = index + 1;

              const completed = trackingStep >= stepNumber;

              const current = trackingStep === stepNumber;

              return (
                <View key={step.title} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineCircle,
                        completed && styles.timelineCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timelineIcon,
                          completed && styles.timelineIconActive,
                        ]}
                      >
                        {step.icon}
                      </Text>
                    </View>

                    {index < trackingSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          trackingStep > stepNumber &&
                            styles.timelineLineActive,
                        ]}
                      />
                    )}
                  </View>

                  <View
                    style={[
                      styles.timelineContent,
                      index === trackingSteps.length - 1 &&
                        styles.lastTimelineContent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineTitle,
                        completed && styles.timelineTitleActive,
                      ]}
                    >
                      {step.title}
                    </Text>

                    <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>

                    {current && (
                      <Text style={styles.currentText}>Current status</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* STATUS CONTROL */}

        {!isCancelled && (
          <View style={styles.statusControlCard}>
            <Text style={styles.statusControlTitle}>Test Order Status</Text>

            <Text style={styles.statusControlText}>
              Move this order to the next delivery stage.
            </Text>

            {nextStatus ? (
              <Pressable
                style={[
                  styles.updateStatusButton,
                  updatingStatus && styles.disabledButton,
                ]}
                disabled={updatingStatus}
                onPress={() => updateOrderStatus(nextStatus)}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.updateStatusButtonText}>
                    {nextStatus === "Shipped"
                      ? "UPDATE TO SHIPPED"
                      : nextStatus === "Out for Delivery"
                        ? "UPDATE TO OUT FOR DELIVERY"
                        : "MARK AS DELIVERED"}
                  </Text>
                )}
              </Pressable>
            ) : (
              <View style={styles.completedStatusBox}>
                <Text style={styles.completedStatusText}>
                  ✓ Order delivery completed
                </Text>
              </View>
            )}
          </View>
        )}

        {/* CANCELLED */}

        {isCancelled && (
          <View style={styles.cancelledCard}>
            <Text style={styles.cancelledCardTitle}>Order Cancelled</Text>

            <Text style={styles.cancelledCardText}>
              This order has been cancelled successfully.
            </Text>
          </View>
        )}

        {/* ORDER INFORMATION */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Order ID</Text>

            <Text style={styles.value}>{order.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Order Date</Text>

            <Text style={styles.value}>{formatDate(order.date)}</Text>
          </View>

          {order.date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Time</Text>

              <Text style={styles.value}>
                {formatDateTime(order.date).split(", ")[1] || ""}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>

            <Text
              style={[
                styles.statusValue,
                isCancelled && styles.cancelledStatus,
              ]}
            >
              {order.status || "Order Placed"}
            </Text>
          </View>
        </View>

        {/* PRODUCTS */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Products</Text>

          {(order.items || []).map((item, index) => {
            const quantity = getQuantity(item);

            const itemPrice = getPrice(item);

            const itemTotal = itemPrice * quantity;

            return (
              <View
                key={`${item.id}-${index}`}
                style={[
                  styles.product,
                  index === (order.items || []).length - 1 &&
                    styles.lastProduct,
                ]}
              >
                <View style={styles.productImage}>
                  {item.image ? (
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={styles.actualImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.imageText}>📦</Text>
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productBrand}>
                    {item.brand || "Myntra"}
                  </Text>

                  <Text style={styles.productName} numberOfLines={2}>
                    {getProductName(item)}
                  </Text>

                  {item.size && (
                    <Text style={styles.productMeta}>Size: {item.size}</Text>
                  )}

                  <Text style={styles.productMeta}>Quantity: {quantity}</Text>

                  <Text style={styles.productPrice}>
                    ₹{Number(itemTotal).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            );
          })}

          {(!order.items || order.items.length === 0) && (
            <Text style={styles.noProducts}>
              Product information unavailable
            </Text>
          )}
        </View>

        {/* DELIVERY ADDRESS */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          {order.address ? (
            <View>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{order.address.name}</Text>

                {order.address.type && (
                  <View style={styles.addressType}>
                    <Text style={styles.addressTypeText}>
                      {order.address.type}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.addressText}>{order.address.address}</Text>

              <Text style={styles.addressText}>
                {order.address.city}, {order.address.state}
              </Text>

              <Text style={styles.addressText}>
                PIN: {order.address.pincode}
              </Text>

              <Text style={styles.addressText}>
                Phone: {order.address.phone}
              </Text>
            </View>
          ) : (
            <Text style={styles.addressText}>Address not available</Text>
          )}
        </View>

        {/* PAYMENT */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Method</Text>

            <Text style={styles.value}>
              {order.paymentMethod || "Cash on Delivery"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Status</Text>

            <Text
              style={[
                styles.paymentStatus,
                order.paymentStatus === "Paid" ? styles.paid : styles.pending,
              ]}
            >
              {order.paymentStatus || "Pending"}
            </Text>
          </View>
        </View>

        {/* PRICE DETAILS */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Subtotal</Text>

            <Text style={styles.value}>
              ₹{getSubtotal().toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Discount</Text>

            <Text style={styles.discount}>
              -₹
              {getDiscount().toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Delivery Fee</Text>

            <Text style={styles.value}>
              {getDelivery() === 0
                ? "FREE"
                : `₹${getDelivery().toLocaleString("en-IN")}`}
            </Text>
          </View>

          {order.coupon?.code && (
            <View style={styles.couponBox}>
              <Text style={styles.couponText}>
                🏷️ Coupon Applied: {order.coupon.code}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>

            <Text style={styles.total}>
              ₹{getTotal().toLocaleString("en-IN")}
            </Text>
          </View>

          {getDiscount() > 0 && (
            <Text style={styles.savedText}>
              You saved ₹{getDiscount().toLocaleString("en-IN")} on this order
            </Text>
          )}
        </View>

        {/* STATUS MESSAGE */}

        {statusMessage !== "" && (
          <View style={styles.statusMessageBox}>
            <Text style={styles.statusMessageText}>{statusMessage}</Text>
          </View>
        )}

        {/* CANCEL MESSAGE */}

        {cancelMessage !== "" && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{cancelMessage}</Text>
          </View>
        )}

        {/* REORDER MESSAGE */}

        {reorderMessage !== "" && (
          <View style={styles.reorderMessageBox}>
            <Text style={styles.reorderMessageText}>{reorderMessage}</Text>
          </View>
        )}

        {/* CANCEL */}

        {!isCancelled && !isDelivered && (
          <Pressable style={styles.cancelButton} onPress={cancelOrder}>
            <Text style={styles.cancelButtonText}>CANCEL ORDER</Text>
          </Pressable>
        )}

        {/* REORDER */}

        <Pressable style={styles.reorderButton} onPress={reorder}>
          <Text style={styles.reorderButtonText}>🔄 REORDER</Text>
        </Pressable>

        {/* CONTINUE SHOPPING */}

        <Pressable
          style={styles.continueButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.continueButtonText}>CONTINUE SHOPPING</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f6",
  },

  content: {
    paddingBottom: 40,
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

  headerBackButton: {
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

  statusCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusHeaderLeft: {
    flex: 1,
  },

  statusHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#282c3f",
  },

  statusSubheading: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },

  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8f8f3",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelledCircle: {
    backgroundColor: "#ffe8ed",
  },

  deliveredCircle: {
    backgroundColor: "#e8f8f3",
  },

  statusCircleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#03a685",
  },

  card: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#282c3f",
    marginBottom: 16,
  },

  /* TRACKING */

  timelineRow: {
    flexDirection: "row",
    minHeight: 70,
  },

  timelineLeft: {
    width: 35,
    alignItems: "center",
  },

  timelineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  timelineCircleActive: {
    backgroundColor: "#ff3f6c",
  },

  timelineIcon: {
    fontSize: 12,
    color: "#888",
    fontWeight: "800",
  },

  timelineIconActive: {
    color: "#fff",
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#ddd",
    marginTop: -1,
  },

  timelineLineActive: {
    backgroundColor: "#ff3f6c",
  },

  timelineContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 18,
  },

  lastTimelineContent: {
    paddingBottom: 0,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },

  timelineTitleActive: {
    color: "#282c3f",
    fontWeight: "800",
  },

  timelineSubtitle: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },

  currentText: {
    fontSize: 10,
    color: "#ff3f6c",
    fontWeight: "800",
    marginTop: 5,
  },

  /* STATUS CONTROL */

  statusControlCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 18,
    borderTopWidth: 2,
    borderTopColor: "#ff3f6c",
  },

  statusControlTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#282c3f",
  },

  statusControlText: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
    marginBottom: 14,
  },

  updateStatusButton: {
    height: 48,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  updateStatusButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  completedStatusBox: {
    height: 48,
    backgroundColor: "#e8f8f3",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  completedStatusText: {
    color: "#03a685",
    fontSize: 12,
    fontWeight: "800",
  },

  /* CANCELLED */

  cancelledCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#ff3f6c",
  },

  cancelledCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#d32f2f",
  },

  cancelledCardText: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  /* INFORMATION */

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  label: {
    fontSize: 13,
    color: "#777",
    flex: 1,
  },

  value: {
    fontSize: 13,
    color: "#282c3f",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
  },

  statusValue: {
    fontSize: 13,
    color: "#03a685",
    fontWeight: "800",
  },

  cancelledStatus: {
    color: "#ff3f6c",
  },

  /* PRODUCTS */

  product: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  lastProduct: {
    borderBottomWidth: 0,
  },

  productImage: {
    width: 85,
    height: 105,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  actualImage: {
    width: "100%",
    height: "100%",
  },

  imageText: {
    fontSize: 30,
  },

  productInfo: {
    flex: 1,
    marginLeft: 14,
  },

  productBrand: {
    fontSize: 13,
    fontWeight: "800",
    color: "#282c3f",
  },

  productName: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
    lineHeight: 19,
  },

  productMeta: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#282c3f",
    marginTop: 7,
  },

  noProducts: {
    fontSize: 13,
    color: "#888",
  },

  /* ADDRESS */

  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  addressName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#282c3f",
  },

  addressType: {
    marginLeft: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "#f1f1f1",
    borderRadius: 3,
  },

  addressTypeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#666",
    textTransform: "uppercase",
  },

  addressText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 21,
  },

  /* PAYMENT */

  paymentStatus: {
    fontSize: 13,
    fontWeight: "800",
  },

  paid: {
    color: "#03a685",
  },

  pending: {
    color: "#e08b00",
  },

  /* PRICE */

  discount: {
    fontSize: 13,
    color: "#03a685",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#282c3f",
  },

  total: {
    fontSize: 18,
    fontWeight: "900",
    color: "#282c3f",
  },

  savedText: {
    color: "#03a685",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },

  couponBox: {
    backgroundColor: "#fff5f7",
    padding: 10,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 5,
  },

  couponText: {
    color: "#ff3f6c",
    fontSize: 12,
    fontWeight: "700",
  },

  /* MESSAGES */

  statusMessageBox: {
    marginHorizontal: 16,
    marginTop: 15,
    padding: 14,
    backgroundColor: "#fff5f7",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffc1cf",
  },

  statusMessageText: {
    color: "#ff3f6c",
    fontWeight: "700",
    textAlign: "center",
  },

  messageBox: {
    marginHorizontal: 16,
    marginTop: 15,
    padding: 14,
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },

  messageText: {
    color: "#2e7d32",
    fontWeight: "700",
    textAlign: "center",
  },

  reorderMessageBox: {
    marginHorizontal: 16,
    marginTop: 15,
    padding: 14,
    backgroundColor: "#fff5f7",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ffc1cf",
  },

  reorderMessageText: {
    color: "#ff3f6c",
    fontWeight: "700",
    textAlign: "center",
  },

  /* BUTTONS */

  cancelButton: {
    marginHorizontal: 16,
    marginTop: 16,
    height: 50,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#ff3f6c",
    fontSize: 13,
    fontWeight: "800",
  },

  reorderButton: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 50,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  reorderButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },

  continueButton: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 50,
    backgroundColor: "#282c3f",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  continueButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },

  /* LOADING / ERROR */

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f6",
  },

  loadingText: {
    fontSize: 15,
    color: "#555",
    marginTop: 12,
  },

  notFound: {
    fontSize: 18,
    fontWeight: "700",
    color: "#282c3f",
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 5,
  },

  backButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
});
