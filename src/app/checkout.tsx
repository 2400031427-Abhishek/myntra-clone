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

const BAG_KEY = "myntra_bag";
const COUPON_KEY = "myntra_coupon";
const ADDRESS_KEY = "myntra_addresses";

export default function Checkout() {
  const [bag, setBag] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [coupon, setCoupon] = useState<any>(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useFocusEffect(
    useCallback(() => {
      loadCheckoutData();
    }, []),
  );

  const loadCheckoutData = async () => {
    try {
      const bagData = await AsyncStorage.getItem(BAG_KEY);

      const addressData = await AsyncStorage.getItem(ADDRESS_KEY);

      const couponData = await AsyncStorage.getItem(COUPON_KEY);

      const loadedBag = bagData ? JSON.parse(bagData) : [];

      const loadedAddresses = addressData ? JSON.parse(addressData) : [];

      setBag(Array.isArray(loadedBag) ? loadedBag : []);

      if (Array.isArray(loadedAddresses) && loadedAddresses.length > 0) {
        setSelectedAddress(loadedAddresses[0]);
      } else {
        setSelectedAddress(null);
      }

      if (couponData) {
        try {
          setCoupon(JSON.parse(couponData));
        } catch {
          setCoupon(couponData);
        }
      } else {
        setCoupon(null);
      }
    } catch (error) {
      console.log("CHECKOUT LOAD ERROR:", error);
    }
  };

  // =========================
  // PRICE CALCULATION
  // =========================

  const subtotal = bag.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );

  const getDiscount = () => {
    if (!coupon) return 0;

    if (typeof coupon === "object") {
      if (coupon.type === "percentage") {
        return Math.min(
          subtotal,
          Math.round((subtotal * Number(coupon.value || 0)) / 100),
        );
      }

      if (coupon.type === "flat") {
        return Math.min(subtotal, Number(coupon.value || 0));
      }

      if (coupon.discount) {
        return Math.min(subtotal, Number(coupon.discount));
      }

      if (coupon.amount) {
        return Math.min(subtotal, Number(coupon.amount));
      }

      if (coupon.discountPercent) {
        return Math.min(
          subtotal,
          Math.round((subtotal * Number(coupon.discountPercent || 0)) / 100),
        );
      }
    }

    const code = typeof coupon === "string" ? coupon.toUpperCase() : "";

    if (code === "MYNTRA10") {
      return Math.round(subtotal * 0.1);
    }

    if (code === "FIRST50") {
      return Math.min(subtotal, 50);
    }

    if (code === "SAVE100") {
      return Math.min(subtotal, 100);
    }

    if (code === "FASHION20") {
      return Math.round(subtotal * 0.2);
    }

    return 0;
  };

  const discount = Math.min(subtotal, getDiscount());

  const deliveryCharge = subtotal - discount >= 999 ? 0 : 99;

  const total = subtotal - discount + deliveryCharge;

  const getCouponName = () => {
    if (!coupon) return "";

    if (typeof coupon === "string") {
      return coupon;
    }

    return coupon.code || coupon.name || coupon.couponCode || "";
  };

  // =========================
  // GO TO PAYMENT
  // =========================

  const continueToPayment = () => {
    if (bag.length === 0) {
      Alert.alert("Empty Bag", "Please add products to your bag first.");
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        "Address Required",
        "Please add a delivery address before continuing.",
      );
      return;
    }

    router.push({
      pathname: "/payment",
      params: {
        amount: String(total),
        method: paymentMethod,
      },
    });
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

        <Text style={styles.headerTitle}>Checkout</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* ADDRESS */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <Pressable onPress={() => router.push("/addresses")}>
            <Text style={styles.change}>CHANGE</Text>
          </Pressable>
        </View>

        {selectedAddress ? (
          <View style={styles.addressBox}>
            <Text style={styles.addressName}>{selectedAddress.name}</Text>

            <Text style={styles.addressText}>{selectedAddress.address}</Text>

            <Text style={styles.addressText}>
              {selectedAddress.city}, {selectedAddress.state}
            </Text>

            <Text style={styles.addressText}>
              PIN: {selectedAddress.pincode}
            </Text>

            <Text style={styles.addressText}>
              Phone: {selectedAddress.phone}
            </Text>
          </View>
        ) : (
          <Pressable
            style={styles.addAddress}
            onPress={() => router.push("/addresses")}
          >
            <Text style={styles.addAddressText}>+ ADD ADDRESS</Text>
          </Pressable>
        )}
      </View>

      {/* PRODUCTS */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Products</Text>

        {bag.map((item, index) => (
          <View key={index} style={styles.product}>
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.productDetails}>
                Size: {item.size || "M"}
              </Text>

              <Text style={styles.productDetails}>
                Qty: {item.quantity || 1}
              </Text>

              <Text style={styles.productPrice}>
                ₹
                {(
                  Number(item.price || 0) * Number(item.quantity || 1)
                ).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* COUPON */}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coupon</Text>

          <Pressable onPress={() => router.push("/coupons")}>
            <Text style={styles.change}>{coupon ? "CHANGE" : "APPLY"}</Text>
          </Pressable>
        </View>

        {coupon ? (
          <>
            <Text style={styles.couponCode}>🎟 {getCouponName()}</Text>

            <Text style={styles.saved}>
              You saved ₹{discount.toLocaleString("en-IN")}
            </Text>
          </>
        ) : (
          <Text style={styles.noCoupon}>No coupon applied</Text>
        )}
      </View>

      {/* PAYMENT METHOD */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <Text style={styles.choosePayment}>Choose how you want to pay</Text>

        {/* COD */}

        <Pressable
          style={[
            styles.payment,
            paymentMethod === "COD" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("COD")}
        >
          <View
            style={[
              styles.radio,
              paymentMethod === "COD" && styles.radioSelected,
            ]}
          >
            {paymentMethod === "COD" && <View style={styles.radioDot} />}
          </View>

          <Text style={styles.paymentIcon}>💵</Text>

          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>

            <Text style={styles.paymentSubtitle}>
              Pay when your order arrives
            </Text>
          </View>
        </Pressable>

        {/* UPI */}

        <Pressable
          style={[
            styles.payment,
            paymentMethod === "UPI" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("UPI")}
        >
          <View
            style={[
              styles.radio,
              paymentMethod === "UPI" && styles.radioSelected,
            ]}
          >
            {paymentMethod === "UPI" && <View style={styles.radioDot} />}
          </View>

          <Text style={styles.paymentIcon}>📱</Text>

          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>UPI</Text>

            <Text style={styles.paymentSubtitle}>
              Google Pay, PhonePe, Paytm
            </Text>
          </View>
        </Pressable>

        {/* CARD */}

        <Pressable
          style={[
            styles.payment,
            paymentMethod === "CARD" && styles.paymentSelected,
          ]}
          onPress={() => setPaymentMethod("CARD")}
        >
          <View
            style={[
              styles.radio,
              paymentMethod === "CARD" && styles.radioSelected,
            ]}
          >
            {paymentMethod === "CARD" && <View style={styles.radioDot} />}
          </View>

          <Text style={styles.paymentIcon}>💳</Text>

          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Credit / Debit Card</Text>

            <Text style={styles.paymentSubtitle}>Visa, Mastercard, RuPay</Text>
          </View>
        </Pressable>

        <View style={styles.selectedBox}>
          <Text style={styles.selectedText}>
            ✓ Selected:{" "}
            {paymentMethod === "COD"
              ? "Cash on Delivery"
              : paymentMethod === "UPI"
                ? "UPI"
                : "Credit / Debit Card"}
          </Text>
        </View>
      </View>

      {/* PRICE DETAILS */}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Price Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>

          <Text style={styles.value}>₹{subtotal.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>

          <Text style={styles.discount}>
            -₹
            {discount.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Delivery Charges</Text>

          <Text style={deliveryCharge === 0 ? styles.free : styles.value}>
            {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Amount</Text>

          <Text style={styles.total}>₹{total.toLocaleString("en-IN")}</Text>
        </View>
      </View>

      {/* CONTINUE TO PAYMENT */}

      <Pressable style={styles.continueButton} onPress={continueToPayment}>
        <View>
          <Text style={styles.continueText}>CONTINUE TO PAYMENT</Text>

          <Text style={styles.continueAmount}>
            ₹{total.toLocaleString("en-IN")}
          </Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </Pressable>

      <Text style={styles.secure}>🔒 Safe & Secure Checkout</Text>
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

  card: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 15,
  },

  change: {
    color: "#ff3f6c",
    fontSize: 12,
    fontWeight: "800",
  },

  addressBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 13,
  },

  addressName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
  },

  addressText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 21,
  },

  addAddress: {
    borderWidth: 1,
    borderColor: "#ff3f6c",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 5,
  },

  addAddressText: {
    color: "#ff3f6c",
    fontWeight: "700",
  },

  product: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  productImage: {
    width: 75,
    height: 90,
    borderRadius: 5,
    backgroundColor: "#eee",
  },

  productInfo: {
    flex: 1,
    marginLeft: 14,
  },

  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  productDetails: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 5,
  },

  couponCode: {
    color: "#008a3d",
    fontSize: 14,
    fontWeight: "700",
  },

  saved: {
    color: "#008a3d",
    fontSize: 13,
    marginTop: 6,
  },

  noCoupon: {
    color: "#777",
    fontSize: 13,
  },

  choosePayment: {
    color: "#777",
    fontSize: 13,
    marginTop: -8,
    marginBottom: 15,
  },

  payment: {
    minHeight: 75,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 7,
    marginBottom: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentSelected: {
    borderColor: "#ff3f6c",
    borderWidth: 2,
    backgroundColor: "#fff7f8",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#aaa",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#ff3f6c",
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#ff3f6c",
  },

  paymentIcon: {
    fontSize: 25,
    marginLeft: 12,
  },

  paymentContent: {
    flex: 1,
    marginLeft: 12,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },

  paymentSubtitle: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  selectedBox: {
    backgroundColor: "#e8f8f3",
    padding: 10,
    borderRadius: 5,
    marginTop: 3,
  },

  selectedText: {
    color: "#008a3d",
    fontSize: 13,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  label: {
    color: "#666",
    fontSize: 14,
  },

  value: {
    color: "#222",
    fontSize: 14,
  },

  discount: {
    color: "#008a3d",
    fontSize: 14,
    fontWeight: "600",
  },

  free: {
    color: "#008a3d",
    fontSize: 14,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 7,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  total: {
    fontSize: 18,
    fontWeight: "800",
  },

  continueButton: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 62,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continueText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  continueAmount: {
    color: "#fff",
    fontSize: 12,
    marginTop: 3,
  },

  arrow: {
    color: "#fff",
    fontSize: 28,
  },

  secure: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginTop: 14,
  },
});
