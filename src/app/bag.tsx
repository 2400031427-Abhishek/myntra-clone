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

export default function BagScreen() {
  const [bag, setBag] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadBag = async () => {
    try {
      const savedBag = await AsyncStorage.getItem(BAG_KEY);
      const savedCoupon = await AsyncStorage.getItem(COUPON_KEY);

      if (savedBag) {
        const parsedBag = JSON.parse(savedBag);

        if (Array.isArray(parsedBag)) {
          setBag(parsedBag);
        } else {
          setBag([]);
        }
      } else {
        setBag([]);
      }

      if (savedCoupon) {
        try {
          const parsedCoupon = JSON.parse(savedCoupon);
          setCoupon(parsedCoupon);
        } catch {
          setCoupon(savedCoupon);
        }
      } else {
        setCoupon(null);
      }
    } catch (error) {
      console.log("LOAD BAG ERROR:", error);
      setBag([]);
      setCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBag();
    }, []),
  );

  const saveBag = async (newBag: any[]) => {
    try {
      await AsyncStorage.setItem(BAG_KEY, JSON.stringify(newBag));
      setBag(newBag);
    } catch (error) {
      console.log("SAVE BAG ERROR:", error);
    }
  };

  const increaseQuantity = (index: number) => {
    const newBag = [...bag];

    newBag[index] = {
      ...newBag[index],
      quantity: Number(newBag[index].quantity || 1) + 1,
    };

    saveBag(newBag);
  };

  const decreaseQuantity = (index: number) => {
    const newBag = [...bag];
    const quantity = Number(newBag[index].quantity || 1);

    if (quantity <= 1) {
      newBag.splice(index, 1);
    } else {
      newBag[index] = {
        ...newBag[index],
        quantity: quantity - 1,
      };
    }

    saveBag(newBag);
  };

  const removeItem = (index: number) => {
    Alert.alert("Remove Item", "Do you want to remove this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newBag = [...bag];
          newBag.splice(index, 1);
          saveBag(newBag);
        },
      },
    ]);
  };

  const changeSize = (index: number, size: string) => {
    const newBag = [...bag];

    newBag[index] = {
      ...newBag[index],
      size,
    };

    saveBag(newBag);
  };

  const totalItems = bag.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );

  const totalMRP = bag.reduce(
    (total, item) =>
      total +
      Number(item.oldPrice || item.price || 0) * Number(item.quantity || 1),
    0,
  );

  const sellingPrice = bag.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );

  const productDiscount = Math.max(totalMRP - sellingPrice, 0);

  const getCouponDiscount = () => {
    if (!coupon) return 0;

    let couponData = coupon;

    if (typeof coupon === "string") {
      try {
        couponData = JSON.parse(coupon);
      } catch {
        couponData = {
          code: coupon,
        };
      }
    }

    const discountValue = Number(
      couponData?.discount ??
        couponData?.discountAmount ??
        couponData?.amount ??
        0,
    );

    const discountPercent = Number(
      couponData?.discountPercent ?? couponData?.percentage ?? 0,
    );

    if (discountPercent > 0) {
      return Math.min(
        Math.round((sellingPrice * discountPercent) / 100),
        sellingPrice,
      );
    }

    if (discountValue > 0) {
      return Math.min(discountValue, sellingPrice);
    }

    return 0;
  };

  const couponDiscount = getCouponDiscount();

  const afterDiscount = Math.max(sellingPrice - couponDiscount, 0);

  const deliveryCharge = afterDiscount >= 999 ? 0 : 99;

  const finalTotal = afterDiscount + deliveryCharge;

  const getCouponName = () => {
    if (!coupon) return "";

    if (typeof coupon === "string") {
      try {
        const parsed = JSON.parse(coupon);
        return parsed?.code || parsed?.name || "Coupon Applied";
      } catch {
        return coupon;
      }
    }

    return coupon?.code || coupon?.name || "Coupon Applied";
  };

  const removeCoupon = async () => {
    try {
      await AsyncStorage.removeItem(COUPON_KEY);
      setCoupon(null);
    } catch (error) {
      console.log("REMOVE COUPON ERROR:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading Bag...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bag</Text>

        <Text style={styles.itemCount}>
          {totalItems} {totalItems === 1 ? "Item" : "Items"}
        </Text>
      </View>

      {bag.length === 0 ? (
        /* EMPTY BAG */

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>

          <Text style={styles.emptyTitle}>Your Bag is Empty</Text>

          <Text style={styles.emptyText}>
            Add products to your bag and they will appear here.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.shopButtonText}>CONTINUE SHOPPING</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{
              paddingBottom: 180,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* SAVINGS MESSAGE */}

            {productDiscount > 0 && (
              <View style={styles.savingsBox}>
                <Text style={styles.savingsText}>
                  🎉 You are saving ₹{productDiscount}
                </Text>
              </View>
            )}

            {/* PRODUCTS */}

            {bag.map((item, index) => (
              <View
                key={item.id || `${item.productId}-${item.size}-${index}`}
                style={styles.itemCard}
              >
                {/* PRODUCT IMAGE */}

                <Image
                  source={{
                    uri: item.image,
                  }}
                  style={styles.itemImage}
                />

                {/* PRODUCT DETAILS */}

                <View style={styles.details}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {/* PRICE */}

                  <View style={styles.priceLine}>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>

                    {item.oldPrice && (
                      <Text style={styles.oldPrice}>₹{item.oldPrice}</Text>
                    )}

                    {item.discount && (
                      <Text style={styles.discount}>{item.discount}</Text>
                    )}
                  </View>

                  {/* SIZE */}

                  <Text style={styles.sizeLabel}>Select Size</Text>

                  <View style={styles.sizeRow}>
                    {["S", "M", "L", "XL"].map((size) => (
                      <Pressable
                        key={size}
                        style={[
                          styles.sizeButton,
                          item.size === size && styles.selectedSize,
                        ]}
                        onPress={() => changeSize(index, size)}
                      >
                        <Text
                          style={[
                            styles.sizeText,
                            item.size === size && styles.selectedSizeText,
                          ]}
                        >
                          {size}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* QUANTITY */}

                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => decreaseQuantity(index)}
                    >
                      <Text style={styles.quantityText}>−</Text>
                    </Pressable>

                    <Text style={styles.quantity}>{item.quantity || 1}</Text>

                    <Pressable
                      style={styles.quantityButton}
                      onPress={() => increaseQuantity(index)}
                    >
                      <Text style={styles.quantityText}>+</Text>
                    </Pressable>
                  </View>
                </View>

                {/* REMOVE */}

                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeItem(index)}
                >
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}

            {/* COUPON */}

            <View style={styles.couponBox}>
              <View style={styles.couponTop}>
                <Text style={styles.couponIcon}>🏷️</Text>

                <View style={styles.couponInfo}>
                  {coupon ? (
                    <>
                      <Text style={styles.couponApplied}>
                        {getCouponName()}
                      </Text>

                      <Text style={styles.couponSaved}>
                        Coupon applied successfully
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.couponTitle}>Apply Coupon</Text>

                      <Text style={styles.couponSubtext}>
                        Save more on your order
                      </Text>
                    </>
                  )}
                </View>

                {coupon ? (
                  <Pressable onPress={removeCoupon}>
                    <Text style={styles.removeCoupon}>REMOVE</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.applyButton}
                    onPress={() => router.push("/coupons")}
                  >
                    <Text style={styles.applyButtonText}>APPLY</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* PRICE DETAILS */}

            <View style={styles.priceBox}>
              <Text style={styles.priceTitle}>PRICE DETAILS</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total MRP</Text>

                <Text style={styles.priceValue}>₹{totalMRP}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Product Discount</Text>

                <Text style={styles.discountText}>- ₹{productDiscount}</Text>
              </View>

              {couponDiscount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Coupon Discount</Text>

                  <Text style={styles.discountText}>- ₹{couponDiscount}</Text>
                </View>
              )}

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery Charges</Text>

                {deliveryCharge === 0 ? (
                  <Text style={styles.freeText}>FREE</Text>
                ) : (
                  <Text style={styles.priceValue}>₹{deliveryCharge}</Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>

                <Text style={styles.totalValue}>₹{finalTotal}</Text>
              </View>

              {productDiscount + couponDiscount > 0 && (
                <Text style={styles.bottomSaving}>
                  You save ₹{productDiscount + couponDiscount} on this order
                </Text>
              )}
            </View>
          </ScrollView>

          {/* CHECKOUT BAR */}

          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.bottomLabel}>TOTAL</Text>

              <Text style={styles.bottomPrice}>₹{finalTotal}</Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutText}>PROCEED TO CHECKOUT</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

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

  loading: {
    fontSize: 16,
    color: "#555",
  },

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

  itemCount: {
    fontSize: 14,
    color: "#777",
  },

  scroll: {
    flex: 1,
  },

  savingsBox: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#e8f8f3",
    borderRadius: 7,
  },

  savingsText: {
    color: "#03a685",
    fontSize: 13,
    fontWeight: "600",
  },

  itemCard: {
    marginHorizontal: 12,
    marginTop: 12,
    minHeight: 190,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    position: "relative",
  },

  itemImage: {
    width: 105,
    height: 155,
    borderRadius: 5,
    backgroundColor: "#eee",
  },

  details: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 28,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginTop: 4,
  },

  priceLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },

  itemPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  oldPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 7,
  },

  discount: {
    fontSize: 12,
    color: "#03a685",
    marginLeft: 7,
    fontWeight: "600",
  },

  sizeLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 10,
    marginBottom: 6,
  },

  sizeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sizeButton: {
    width: 34,
    height: 32,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: "#fff",
  },

  selectedSize: {
    borderColor: "#ff3f6c",
    backgroundColor: "#fff0f3",
  },

  sizeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },

  selectedSizeText: {
    color: "#ff3f6c",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  quantityButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },

  quantityText: {
    fontSize: 19,
    color: "#333",
  },

  quantity: {
    minWidth: 32,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },

  removeButton: {
    position: "absolute",
    right: 8,
    top: 7,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    fontSize: 24,
    color: "#777",
  },

  couponBox: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
  },

  couponTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  couponIcon: {
    fontSize: 23,
  },

  couponInfo: {
    flex: 1,
    marginLeft: 10,
  },

  couponTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  couponApplied: {
    fontSize: 14,
    fontWeight: "700",
    color: "#03a685",
  },

  couponSubtext: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
  },

  couponSaved: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  applyButton: {
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  applyButtonText: {
    color: "#ff3f6c",
    fontSize: 12,
    fontWeight: "700",
  },

  removeCoupon: {
    color: "#ff3f6c",
    fontSize: 11,
    fontWeight: "700",
  },

  priceBox: {
    margin: 12,
    marginTop: 18,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },

  priceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 7,
  },

  priceLabel: {
    fontSize: 14,
    color: "#555",
  },

  priceValue: {
    fontSize: 14,
    color: "#333",
  },

  discountText: {
    color: "#03a685",
    fontSize: 14,
  },

  freeText: {
    color: "#03a685",
    fontWeight: "600",
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },

  bottomSaving: {
    color: "#03a685",
    fontSize: 12,
    marginTop: 8,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },

  emptyIcon: {
    fontSize: 60,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 18,
    color: "#222",
  },

  emptyText: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21,
  },

  shopButton: {
    marginTop: 25,
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 25,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 9999,
    elevation: 9999,
  },

  bottomLabel: {
    fontSize: 11,
    color: "#777",
  },

  bottomPrice: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
    marginTop: 3,
  },

  checkoutButton: {
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  checkoutText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
