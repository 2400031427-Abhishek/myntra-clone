import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const products = [
  {
    id: "1",
    name: "Men's Casual Shirt",
    price: "₹799",
    oldPrice: "₹1,499",
    discount: "47% OFF",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  },
  {
    id: "2",
    name: "Classic Denim Jacket",
    price: "₹1,299",
    oldPrice: "₹2,499",
    discount: "48% OFF",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
  },
  {
    id: "3",
    name: "Premium Sneakers",
    price: "₹1,599",
    oldPrice: "₹2,999",
    discount: "47% OFF",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    id: "4",
    name: "Casual T-Shirt",
    price: "₹599",
    oldPrice: "₹999",
    discount: "40% OFF",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  },
  {
    id: "5",
    name: "Formal Shirt",
    price: "₹899",
    oldPrice: "₹1,699",
    discount: "47% OFF",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
  },
  {
    id: "6",
    name: "Sports Shoes",
    price: "₹1,899",
    oldPrice: "₹3,499",
    discount: "46% OFF",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
  },
];

export default function CategoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Text style={styles.title}>Men's Fashion</Text>

        <Text style={styles.filter}>⚙</Text>
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.filterButton}>
          <Text>FILTER</Text>
        </Pressable>

        <Pressable style={styles.filterButton}>
          <Text>SORT BY</Text>
        </Pressable>

        <Text style={styles.result}>1200+ Items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/product",
                  params: { id: product.id },
                })
              }
            >
              <View>
                <Image source={{ uri: product.image }} style={styles.image} />

                <Pressable style={styles.heart}>
                  <Text>♡</Text>
                </Pressable>
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {product.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>{product.price}</Text>
                  <Text style={styles.oldPrice}>{product.oldPrice}</Text>
                </View>

                <Text style={styles.discount}>{product.discount}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  back: {
    fontSize: 28,
    color: "#333",
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
  },

  filter: {
    fontSize: 20,
  },

  filterRow: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  filterButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 5,
  },

  result: {
    marginLeft: "auto",
    color: "#777",
    fontSize: 12,
  },

  grid: {
    padding: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "49%",
    marginBottom: 18,
  },

  image: {
    width: "100%",
    height: 245,
    backgroundColor: "#f5f5f5",
  },

  heart: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#fff",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    padding: 8,
  },

  name: {
    fontSize: 13,
    fontWeight: "600",
  },

  priceRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 5,
    alignItems: "center",
  },

  price: {
    fontSize: 14,
    fontWeight: "800",
  },

  oldPrice: {
    fontSize: 11,
    color: "#888",
    textDecorationLine: "line-through",
  },

  discount: {
    marginTop: 3,
    fontSize: 10,
    color: "#ff905a",
    fontWeight: "700",
  },
});
