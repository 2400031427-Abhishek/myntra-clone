import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://localhost:5000";
const REVIEWS_KEY = "myntra_reviews";
const USER_KEY = "myntra_user";
const BAG_KEY = "myntra_bag";

export default function Product() {
  const params = useLocalSearchParams();

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [userName, setUserName] = useState("User");
  const [message, setMessage] = useState("");
  const [addedToBag, setAddedToBag] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    loadReviews();
    loadUser();
  }, [productId]);

  // =========================
  // LOAD PRODUCT FROM BACKEND
  // =========================

  const loadProduct = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/products/${productId}`);

      const data = await response.json();

      if (response.ok) {
        console.log("PRODUCT FROM BACKEND:", data);
        setProduct(data);
      } else {
        console.log("PRODUCT ERROR:", data);
      }
    } catch (error) {
      console.log("PRODUCT FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD REVIEWS
  // =========================

  const loadReviews = async () => {
    try {
      const data = await AsyncStorage.getItem(REVIEWS_KEY);

      if (!data) {
        setReviews([]);
        return;
      }

      const allReviews = JSON.parse(data);

      const productReviews = allReviews.filter(
        (review: any) => String(review.productId) === String(productId),
      );

      setReviews(productReviews);
    } catch (error) {
      console.log("LOAD REVIEWS ERROR:", error);
    }
  };

  // =========================
  // LOAD USER
  // =========================

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);

      if (userData) {
        const user = JSON.parse(userData);

        setUserName(user.name || user.username || "User");
      }
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  };

  // =========================
  // ADD TO BAG
  // =========================

  const addToBag = async () => {
    if (!product) return;

    try {
      const bagData = await AsyncStorage.getItem(BAG_KEY);

      let bag: any[] = [];

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

      const existingIndex = bag.findIndex(
        (item: any) => String(item.id) === String(product.id),
      );

      if (existingIndex >= 0) {
        bag[existingIndex].quantity =
          Number(bag[existingIndex].quantity || 1) + 1;
      } else {
        bag.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          oldPrice: Number(product.oldPrice || 0),
          discount: product.discount || "",
          category: product.category || "",
          image: product.image || "",
          quantity: 1,
        });
      }

      await AsyncStorage.setItem(BAG_KEY, JSON.stringify(bag));

      setAddedToBag(true);

      setTimeout(() => {
        setAddedToBag(false);
      }, 2000);
    } catch (error) {
      console.log("ADD TO BAG ERROR:", error);
    }
  };

  // =========================
  // SUBMIT REVIEW
  // =========================

  const submitReview = async () => {
    setMessage("");

    if (!reviewText.trim()) {
      setMessage("Please write a review.");
      return;
    }

    try {
      const data = await AsyncStorage.getItem(REVIEWS_KEY);

      let allReviews: any[] = [];

      if (data) {
        try {
          const parsed = JSON.parse(data);

          if (Array.isArray(parsed)) {
            allReviews = parsed;
          }
        } catch {
          allReviews = [];
        }
      }

      const newReview = {
        id: "REV" + Date.now(),
        productId: product.id,
        productName: product.name,
        userName: userName,
        rating: selectedRating,
        comment: reviewText.trim(),
        date: new Date().toISOString(),
      };

      allReviews.unshift(newReview);

      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));

      setReviews((previous) => [newReview, ...previous]);

      setReviewText("");
      setSelectedRating(5);

      setMessage("Review added successfully! ⭐");
    } catch (error) {
      console.log("SUBMIT REVIEW ERROR:", error);

      setMessage("Unable to add review.");
    }
  };

  // =========================
  // RATING
  // =========================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating: number, size = 22) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              {
                fontSize: size,
              },
            ]}
          >
            {star <= rating ? "★" : "☆"}
          </Text>
        ))}
      </View>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  // =========================
  // PRODUCT NOT FOUND
  // =========================

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Product Details</Text>

        <Pressable onPress={() => router.push("/bag")}>
          <Text style={styles.bagIcon}>🛍️</Text>
        </Pressable>
      </View>

      {/* ================= IMAGE ================= */}

      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{
              uri: product.image,
            }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => console.log("IMAGE ERROR:", error.nativeEvent)}
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
      </View>

      {/* ================= PRODUCT INFO ================= */}

      <View style={styles.productCard}>
        <Text style={styles.brand}>{product.category || "Myntra"}</Text>

        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </Text>

          {product.oldPrice && (
            <Text style={styles.oldPrice}>
              ₹{Number(product.oldPrice).toLocaleString("en-IN")}
            </Text>
          )}

          {product.discount && (
            <Text style={styles.discount}>{product.discount}</Text>
          )}
        </View>

        {/* RATING */}

        <View style={styles.ratingSummary}>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingNumber}>{averageRating}</Text>

            <Text style={styles.ratingStar}>★</Text>
          </View>

          <View>
            <Text style={styles.reviewCount}>
              {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
            </Text>

            <Text style={styles.ratingLabel}>Customer ratings</Text>
          </View>
        </View>

        {/* ADD BAG */}

        <Pressable
          style={[styles.addButton, addedToBag && styles.addedButton]}
          onPress={addToBag}
        >
          <Text style={styles.addButtonText}>
            {addedToBag ? "✓ ADDED TO BAG" : "ADD TO BAG"}
          </Text>
        </Pressable>

        {addedToBag && (
          <Pressable
            style={styles.goBagButton}
            onPress={() => router.push("/bag")}
          >
            <Text style={styles.goBagText}>GO TO BAG</Text>
          </Pressable>
        )}
      </View>

      {/* ================= DETAILS ================= */}

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Product Details</Text>

        <Text style={styles.detailText}>• Premium quality product</Text>

        <Text style={styles.detailText}>• Comfortable and stylish design</Text>

        <Text style={styles.detailText}>• Perfect for everyday use</Text>

        <Text style={styles.detailText}>• Attractive price</Text>
      </View>

      {/* ================= REVIEWS ================= */}

      <View style={styles.reviewsCard}>
        <Text style={styles.sectionTitle}>Ratings & Reviews</Text>

        <View style={styles.ratingOverview}>
          <Text style={styles.bigRating}>{averageRating}</Text>

          {renderStars(Math.round(Number(averageRating)), 24)}

          <Text style={styles.totalReviews}>
            Based on {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </Text>
        </View>

        {/* WRITE REVIEW */}

        <View style={styles.writeReview}>
          <Text style={styles.writeTitle}>Write a Review</Text>

          <Text style={styles.chooseText}>Select your rating</Text>

          <View style={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setSelectedRating(star)}>
                <Text
                  style={[
                    styles.selectStar,
                    {
                      color: star <= selectedRating ? "#ffb400" : "#cccccc",
                    },
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.reviewInput}
            placeholder="Write your review..."
            placeholderTextColor="#999999"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={4}
          />

          <Pressable style={styles.submitButton} onPress={submitReview}>
            <Text style={styles.submitText}>SUBMIT REVIEW</Text>
          </Pressable>

          {message !== "" && <Text style={styles.message}>{message}</Text>}
        </View>

        {/* REVIEW LIST */}

        <View style={styles.reviewList}>
          {reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyIcon}>⭐</Text>

              <Text style={styles.emptyTitle}>No reviews yet</Text>

              <Text style={styles.emptyText}>
                Be the first person to review this product.
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>

                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                </View>

                {renderStars(Number(review.rating), 18)}

                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
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
    height: 65,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  back: {
    fontSize: 38,
    color: "#333333",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },

  bagIcon: {
    fontSize: 24,
  },

  imageContainer: {
    width: "100%",
    height: 430,
    backgroundColor: "#ffffff",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  noImageText: {
    fontSize: 16,
    color: "#999999",
  },

  productCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginTop: 2,
  },

  brand: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 5,
  },

  productName: {
    fontSize: 21,
    fontWeight: "700",
    color: "#222222",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },

  price: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222222",
  },

  oldPrice: {
    fontSize: 15,
    color: "#999999",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },

  discount: {
    fontSize: 14,
    color: "#ff905a",
    fontWeight: "700",
    marginLeft: 10,
  },

  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },

  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#008a3d",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 12,
  },

  ratingNumber: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },

  ratingStar: {
    color: "#ffffff",
    fontSize: 15,
    marginLeft: 3,
  },

  reviewCount: {
    fontWeight: "700",
    fontSize: 14,
    color: "#222222",
  },

  ratingLabel: {
    fontSize: 12,
    color: "#777777",
    marginTop: 3,
  },

  addButton: {
    height: 52,
    backgroundColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },

  addedButton: {
    backgroundColor: "#008a3d",
  },

  addButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },

  goBagButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  goBagText: {
    color: "#ff3f6c",
    fontWeight: "800",
  },

  detailsCard: {
    backgroundColor: "#ffffff",
    marginTop: 12,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 15,
  },

  detailText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 26,
  },

  reviewsCard: {
    backgroundColor: "#ffffff",
    marginTop: 12,
    padding: 18,
  },

  ratingOverview: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  bigRating: {
    fontSize: 42,
    fontWeight: "800",
    color: "#222222",
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  star: {
    color: "#ffb400",
    marginRight: 2,
  },

  totalReviews: {
    color: "#777777",
    fontSize: 13,
    marginTop: 5,
  },

  writeReview: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  writeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
  },

  chooseText: {
    fontSize: 13,
    color: "#777777",
    marginTop: 12,
  },

  ratingSelector: {
    flexDirection: "row",
    marginTop: 5,
  },

  selectStar: {
    fontSize: 32,
    marginRight: 5,
  },

  reviewInput: {
    marginTop: 12,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 5,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#222222",
  },

  submitButton: {
    height: 45,
    backgroundColor: "#ff3f6c",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  submitText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  message: {
    textAlign: "center",
    marginTop: 10,
    color: "#008a3d",
    fontWeight: "600",
  },

  reviewList: {
    marginTop: 5,
  },

  emptyReviews: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyIcon: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },

  emptyText: {
    fontSize: 13,
    color: "#777777",
    marginTop: 5,
    textAlign: "center",
  },

  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222222",
  },

  reviewDate: {
    fontSize: 12,
    color: "#999999",
  },

  reviewComment: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 21,
    marginTop: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f6",
  },

  loadingText: {
    fontSize: 16,
    color: "#555555",
  },

  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: "#ff3f6c",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 5,
  },

  backButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
