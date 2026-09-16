import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PaymentSuccess() {
  const params = useLocalSearchParams();

  const amount = Number(params.amount || 0);

  const method = String(params.method || "COD");

  const orderId = String(params.orderId || "");

  const paymentText =
    method === "COD"
      ? "Cash on Delivery"
      : method === "UPI"
        ? "UPI"
        : "Credit / Debit Card";

  return (
    <View style={styles.container}>
      {/* SUCCESS ICON */}

      <View style={styles.circle}>
        <Text style={styles.check}>✓</Text>
      </View>

      <Text style={styles.title}>
        {method === "COD" ? "Order Confirmed!" : "Payment Successful!"}
      </Text>

      <Text style={styles.subtitle}>
        {method === "COD"
          ? "Your order has been placed successfully."
          : "Your payment has been processed successfully."}
      </Text>

      {/* DETAILS */}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>

          <Text style={styles.value}>{orderId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>

          <Text style={styles.value}>₹{amount.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>

          <Text style={styles.value}>{paymentText}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>

          <Text style={styles.paid}>
            {method === "COD" ? "ORDER PLACED" : "PAID"}
          </Text>
        </View>
      </View>

      {/* VIEW ORDER */}

      <Pressable
        style={styles.orderButton}
        onPress={() => router.replace("/order")}
      >
        <Text style={styles.orderButtonText}>VIEW ORDER</Text>
      </Pressable>

      {/* HOME */}

      <Pressable style={styles.homeButton} onPress={() => router.replace("/")}>
        <Text style={styles.homeButtonText}>CONTINUE SHOPPING</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#03a685",
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    color: "#fff",
    fontSize: 55,
    fontWeight: "700",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#222",
    marginTop: 22,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  card: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 18,
    marginTop: 28,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  label: {
    color: "#777",
    fontSize: 14,
  },

  value: {
    color: "#222",
    fontSize: 13,
    fontWeight: "700",
    maxWidth: 190,
    textAlign: "right",
  },

  paid: {
    color: "#03a685",
    fontSize: 13,
    fontWeight: "800",
  },

  orderButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  orderButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  homeButton: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  homeButtonText: {
    color: "#ff3f6c",
    fontSize: 13,
    fontWeight: "800",
  },
});
