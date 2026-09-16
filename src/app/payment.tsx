import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const BAG_KEY = "myntra_bag";
const COUPON_KEY = "myntra_coupon";
const ADDRESS_KEY = "myntra_addresses";
const LAST_ORDER_KEY = "myntra_last_order";
const ORDERS_KEY = "myntra_orders";
const PAYMENT_KEY = "myntra_payment";

export default function PaymentScreen() {
  const params = useLocalSearchParams();

  const amount = Number(params.amount || 0);
  const method = String(params.method || "COD");

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [processing, setProcessing] = useState(false);

  const paymentTitle =
    method === "COD"
      ? "Cash on Delivery"
      : method === "UPI"
        ? "UPI Payment"
        : "Credit / Debit Card";

  // ==================================
  // PLACE ORDER AFTER PAYMENT
  // ==================================

  const completeOrder = async () => {
    try {
      const bagData = await AsyncStorage.getItem(BAG_KEY);

      const addressData = await AsyncStorage.getItem(ADDRESS_KEY);

      const couponData = await AsyncStorage.getItem(COUPON_KEY);

      const bag = bagData ? JSON.parse(bagData) : [];

      const addresses = addressData ? JSON.parse(addressData) : [];

      let coupon: any = null;

      if (couponData) {
        try {
          coupon = JSON.parse(couponData);
        } catch {
          coupon = couponData;
        }
      }

      const address = addresses.length > 0 ? addresses[0] : null;

      const subtotal = bag.reduce(
        (total: number, item: any) =>
          total + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      );

      let discount = 0;

      if (coupon && typeof coupon === "object") {
        if (coupon.type === "percentage") {
          discount = Math.round((subtotal * Number(coupon.value || 0)) / 100);
        } else if (coupon.type === "flat") {
          discount = Number(coupon.value || 0);
        } else if (coupon.discount) {
          discount = Number(coupon.discount);
        } else if (coupon.amount) {
          discount = Number(coupon.amount);
        }
      }

      if (typeof coupon === "string") {
        const code = coupon.toUpperCase();

        if (code === "MYNTRA10") {
          discount = Math.round(subtotal * 0.1);
        }

        if (code === "FIRST50") {
          discount = 50;
        }

        if (code === "SAVE100") {
          discount = 100;
        }

        if (code === "FASHION20") {
          discount = Math.round(subtotal * 0.2);
        }
      }

      discount = Math.min(subtotal, discount);

      const deliveryCharge = subtotal - discount >= 999 ? 0 : 99;

      const total = subtotal - discount + deliveryCharge;

      const order = {
        id: "ORD" + Date.now(),

        items: bag,

        address: address,

        subtotal: subtotal,

        discount: discount,

        deliveryCharge: deliveryCharge,

        total: total,

        coupon:
          typeof coupon === "string"
            ? coupon
            : coupon?.code || coupon?.name || "",

        paymentMethod: paymentTitle,

        paymentStatus: method === "COD" ? "Pending" : "Paid",

        status: "Order Placed",

        date: new Date().toISOString(),
      };

      // SAVE PAYMENT
      const payment = {
        id: "PAY" + Date.now(),
        method: paymentTitle,
        amount: total,
        status: method === "COD" ? "Pending" : "Paid",
        date: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PAYMENT_KEY, JSON.stringify(payment));

      // SAVE LAST ORDER
      await AsyncStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));

      // LOAD OLD ORDERS
      const oldOrdersData = await AsyncStorage.getItem(ORDERS_KEY);

      let orders: any[] = [];

      if (oldOrdersData) {
        try {
          const parsed = JSON.parse(oldOrdersData);

          if (Array.isArray(parsed)) {
            orders = parsed;
          }
        } catch {
          orders = [];
        }
      }

      // ADD NEW ORDER
      orders.unshift(order);

      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

      // CLEAR BAG
      await AsyncStorage.removeItem(BAG_KEY);

      // CLEAR COUPON
      await AsyncStorage.removeItem(COUPON_KEY);

      // GO SUCCESS
      router.replace({
        pathname: "/payment-success",
        params: {
          amount: String(total),
          method: method,
          orderId: order.id,
        },
      });
    } catch (error) {
      console.log("COMPLETE ORDER ERROR:", error);

      Alert.alert(
        "Order Failed",
        "Something went wrong while creating your order.",
      );
    }
  };

  // ==================================
  // PROCESS PAYMENT
  // ==================================

  const processPayment = () => {
    if (processing) return;

    // UPI
    if (method === "UPI") {
      if (!upiId.trim()) {
        Alert.alert("UPI ID Required", "Please enter your UPI ID.");
        return;
      }

      if (!upiId.includes("@")) {
        Alert.alert("Invalid UPI ID", "Example: abhi@upi");
        return;
      }
    }

    // CARD
    if (method === "CARD") {
      const cleanCard = cardNumber.replace(/\s/g, "");

      if (!cleanCard || !expiry || !cvv) {
        Alert.alert("Card Details Required", "Please enter all card details.");
        return;
      }

      if (cleanCard.length !== 16) {
        Alert.alert("Invalid Card", "Card number must contain 16 digits.");
        return;
      }

      if (cvv.length !== 3) {
        Alert.alert("Invalid CVV", "CVV must contain 3 digits.");
        return;
      }
    }

    setProcessing(true);

    // Simulated payment
    setTimeout(() => {
      completeOrder();
    }, 1500);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 50,
      }}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Payment</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* AMOUNT */}

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>

        <Text style={styles.amount}>₹{amount.toLocaleString("en-IN")}</Text>
      </View>

      {/* PAYMENT DETAILS */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{paymentTitle}</Text>

        {/* COD */}

        {method === "COD" && (
          <View style={styles.codBox}>
            <Text style={styles.codIcon}>💵</Text>

            <Text style={styles.codTitle}>Cash on Delivery</Text>

            <Text style={styles.codText}>
              Pay the delivery partner when your order arrives.
            </Text>
          </View>
        )}

        {/* UPI */}

        {method === "UPI" && (
          <View>
            <Text style={styles.label}>UPI ID</Text>

            <TextInput
              style={styles.input}
              placeholder="example@upi"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.help}>Example: abhi@oksbi</Text>

            <View style={styles.apps}>
              <Text style={styles.appsTitle}>Supported Apps</Text>

              <Text style={styles.app}>📱 Google Pay</Text>

              <Text style={styles.app}>📱 PhonePe</Text>

              <Text style={styles.app}>📱 Paytm</Text>
            </View>
          </View>
        )}

        {/* CARD */}

        {method === "CARD" && (
          <View>
            <Text style={styles.label}>Card Number</Text>

            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={19}
            />

            <View style={styles.cardRow}>
              <View style={styles.half}>
                <Text style={styles.label}>Expiry</Text>

                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={setExpiry}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>CVV</Text>

                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.secureBox}>
              <Text style={styles.secureBoxText}>
                🔒 Your card details are secure
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* SUMMARY */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>

          <Text style={styles.value}>{paymentTitle}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>

          <Text style={styles.value}>₹{amount.toLocaleString("en-IN")}</Text>
        </View>
      </View>

      {/* PAY */}

      <Pressable
        style={[styles.payButton, processing && styles.disabled]}
        onPress={processPayment}
        disabled={processing}
      >
        <Text style={styles.payText}>
          {processing
            ? "PROCESSING..."
            : method === "COD"
              ? "CONFIRM ORDER"
              : `PAY ₹${amount.toLocaleString("en-IN")}`}
        </Text>
      </Pressable>

      <Text style={styles.secure}>🔒 Safe & Secure Payment</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f6",
  },

  header: {
    height: 65,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  back: {
    fontSize: 38,
    color: "#333",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  amountCard: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 22,
    alignItems: "center",
  },

  amountLabel: {
    fontSize: 13,
    color: "#777",
  },

  amount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 18,
  },

  codBox: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },

  codIcon: {
    fontSize: 45,
  },

  codTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  codText: {
    textAlign: "center",
    color: "#777",
    fontSize: 13,
    marginTop: 7,
  },

  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
  },

  help: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
  },

  apps: {
    backgroundColor: "#f8f8f8",
    padding: 14,
    borderRadius: 6,
    marginTop: 18,
  },

  appsTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  app: {
    fontSize: 13,
    color: "#555",
    marginVertical: 3,
  },

  cardRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  half: {
    flex: 1,
  },

  secureBox: {
    backgroundColor: "#e8f8f3",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },

  secureBoxText: {
    color: "#008a3d",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    maxWidth: 180,
    textAlign: "right",
  },

  payButton: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 58,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  payText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  secure: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 13,
  },
});
