import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COUPON_KEY = "myntra_coupon";

type Coupon = {
  code: string;
  title: string;
  description: string;
  discount: number;
  type: "percentage" | "flat";
  minOrder: number;
};

const COUPONS: Coupon[] = [
  {
    code: "MYNTRA10",
    title: "10% OFF",
    description: "Get 10% off on orders above ₹999",
    discount: 10,
    type: "percentage",
    minOrder: 999,
  },
  {
    code: "FIRST50",
    title: "₹50 OFF",
    description: "Get ₹50 off on orders above ₹499",
    discount: 50,
    type: "flat",
    minOrder: 499,
  },
  {
    code: "SAVE100",
    title: "₹100 OFF",
    description: "Get ₹100 off on orders above ₹1499",
    discount: 100,
    type: "flat",
    minOrder: 1499,
  },
  {
    code: "FASHION20",
    title: "20% OFF",
    description: "Get 20% off on orders above ₹1999",
    discount: 20,
    type: "percentage",
    minOrder: 1999,
  },
];

export default function CouponsScreen() {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // ============================================
  // LOAD SAVED COUPON
  // ============================================

  useEffect(() => {
    loadCoupon();
  }, []);

  const loadCoupon = async () => {
    try {
      const savedCoupon = await AsyncStorage.getItem(COUPON_KEY);

      if (savedCoupon) {
        setSelectedCoupon(JSON.parse(savedCoupon));
      }
    } catch (error) {
      console.log("LOAD COUPON ERROR:", error);
    }
  };

  // ============================================
  // APPLY COUPON
  // ============================================

  const applyCoupon = async (coupon: Coupon) => {
    try {
      await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(coupon));

      setSelectedCoupon(coupon);

      Alert.alert(
        "Coupon Applied",
        `${coupon.code} has been applied successfully.`,
      );
    } catch (error) {
      console.log("APPLY COUPON ERROR:", error);
    }
  };

  // ============================================
  // REMOVE COUPON
  // ============================================

  const removeCoupon = async () => {
    try {
      await AsyncStorage.removeItem(COUPON_KEY);

      setSelectedCoupon(null);

      Alert.alert("Coupon Removed", "The coupon has been removed.");
    } catch (error) {
      console.log("REMOVE COUPON ERROR:", error);
    }
  };

  // ============================================
  // PAGE
  // ============================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Coupons</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {/* SELECTED COUPON */}

        {selectedCoupon && (
          <View style={styles.appliedBox}>
            <View>
              <Text style={styles.appliedTitle}>Coupon Applied</Text>

              <Text style={styles.appliedCode}>{selectedCoupon.code}</Text>

              <Text style={styles.appliedDescription}>
                {selectedCoupon.description}
              </Text>
            </View>

            <Pressable style={styles.removeButton} onPress={removeCoupon}>
              <Text style={styles.removeText}>REMOVE</Text>
            </Pressable>
          </View>
        )}

        {/* AVAILABLE COUPONS */}

        <Text style={styles.sectionTitle}>AVAILABLE COUPONS</Text>

        {COUPONS.map((coupon) => {
          const isApplied = selectedCoupon?.code === coupon.code;

          return (
            <View
              key={coupon.code}
              style={[styles.couponCard, isApplied && styles.couponCardApplied]}
            >
              {/* LEFT */}

              <View style={styles.couponLeft}>
                <View style={styles.discountBox}>
                  <Text style={styles.discountText}>
                    {coupon.type === "percentage"
                      ? `${coupon.discount}%`
                      : `₹${coupon.discount}`}
                  </Text>

                  <Text style={styles.offText}>OFF</Text>
                </View>
              </View>

              {/* CENTER */}

              <View style={styles.couponMiddle}>
                <Text style={styles.couponTitle}>{coupon.title}</Text>

                <Text style={styles.couponCode}>{coupon.code}</Text>

                <Text style={styles.couponDescription}>
                  {coupon.description}
                </Text>
              </View>

              {/* RIGHT */}

              <Pressable
                style={[styles.applyButton, isApplied && styles.appliedButton]}
                onPress={() => applyCoupon(coupon)}
              >
                <Text
                  style={[
                    styles.applyText,
                    isApplied && styles.appliedButtonText,
                  ]}
                >
                  {isApplied ? "APPLIED" : "APPLY"}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* TERMS */}

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Coupon Terms</Text>

          <Text style={styles.term}>
            • Only one coupon can be applied at a time.
          </Text>

          <Text style={styles.term}>
            • Minimum order value must be satisfied.
          </Text>

          <Text style={styles.term}>
            • Coupon discounts are applied before delivery charges.
          </Text>
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
    backgroundColor: "#fff",
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    height: 65,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 35,
    color: "#222",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },

  // ==========================================
  // APPLIED COUPON
  // ==========================================

  appliedBox: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2e7d32",
    borderRadius: 5,
    backgroundColor: "#f4fff4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  appliedTitle: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "700",
  },

  appliedCode: {
    fontSize: 18,
    color: "#222",
    fontWeight: "800",
    marginTop: 3,
  },

  appliedDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  removeButton: {
    borderWidth: 1,
    borderColor: "#e53935",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 3,
  },

  removeText: {
    color: "#e53935",
    fontSize: 10,
    fontWeight: "800",
  },

  // ==========================================
  // SECTION
  // ==========================================

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#777",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },

  // ==========================================
  // COUPON CARD
  // ==========================================

  couponCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  couponCardApplied: {
    borderColor: "#2e7d32",
    backgroundColor: "#f8fff8",
  },

  couponLeft: {
    marginRight: 12,
  },

  discountBox: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  discountText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ff3f6c",
  },

  offText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ff3f6c",
  },

  couponMiddle: {
    flex: 1,
  },

  couponTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#222",
  },

  couponCode: {
    fontSize: 12,
    color: "#ff3f6c",
    fontWeight: "800",
    marginTop: 4,
  },

  couponDescription: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
    lineHeight: 16,
  },

  // ==========================================
  // APPLY BUTTON
  // ==========================================

  applyButton: {
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },

  applyText: {
    color: "#ff3f6c",
    fontSize: 10,
    fontWeight: "800",
  },

  appliedButton: {
    borderColor: "#2e7d32",
  },

  appliedButtonText: {
    color: "#2e7d32",
  },

  // ==========================================
  // TERMS
  // ==========================================

  termsBox: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fafafa",
    borderRadius: 5,
  },

  termsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },

  term: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
    lineHeight: 18,
  },
});
