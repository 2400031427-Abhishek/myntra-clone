import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ADDRESS_KEY = "myntra_addresses";

type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  isDefault: boolean;
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState("Home");

  // ============================================
  // LOAD ADDRESSES
  // ============================================

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const saved = await AsyncStorage.getItem(ADDRESS_KEY);

      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch (error) {
      console.log("LOAD ADDRESS ERROR:", error);
    }
  };

  // ============================================
  // SAVE ADDRESSES
  // ============================================

  const saveAddresses = async (newAddresses: Address[]) => {
    try {
      await AsyncStorage.setItem(ADDRESS_KEY, JSON.stringify(newAddresses));

      setAddresses(newAddresses);
    } catch (error) {
      console.log("SAVE ADDRESS ERROR:", error);
    }
  };

  // ============================================
  // CLEAR FORM
  // ============================================

  const clearForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setType("Home");
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================
  // ADD / UPDATE ADDRESS
  // ============================================

  const handleSave = async () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      Alert.alert("Missing Information", "Please fill all the address fields.");
      return;
    }

    if (phone.trim().length !== 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit phone number.",
      );
      return;
    }

    if (pincode.trim().length !== 6) {
      Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode.");
      return;
    }

    let updatedAddresses: Address[];

    if (editingId) {
      updatedAddresses = addresses.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: name.trim(),
              phone: phone.trim(),
              address: address.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode: pincode.trim(),
              type,
            }
          : item,
      );
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        type,
        isDefault: addresses.length === 0,
      };

      updatedAddresses = [...addresses, newAddress];
    }

    await saveAddresses(updatedAddresses);
    clearForm();
  };

  // ============================================
  // EDIT
  // ============================================

  const handleEdit = (item: Address) => {
    setEditingId(item.id);

    setName(item.name);
    setPhone(item.phone);
    setAddress(item.address);
    setCity(item.city);
    setState(item.state);
    setPincode(item.pincode);
    setType(item.type);

    setShowForm(true);
  };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            let updated = addresses.filter((item) => item.id !== id);

            // If deleted address was default,
            // make first remaining address default.
            if (updated.length > 0 && !updated.some((item) => item.isDefault)) {
              updated = updated.map((item, index) => ({
                ...item,
                isDefault: index === 0,
              }));
            }

            await saveAddresses(updated);
          },
        },
      ],
    );
  };

  // ============================================
  // DEFAULT ADDRESS
  // ============================================

  const makeDefault = async (id: string) => {
    const updated = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));

    await saveAddresses(updated);
  };

  // ============================================
  // ADDRESS TYPE
  // ============================================

  const selectType = (value: string) => {
    setType(value);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Saved Addresses</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {/* ADD ADDRESS BUTTON */}

        {!showForm && (
          <Pressable
            style={styles.addButton}
            onPress={() => {
              clearForm();
              setShowForm(true);
            }}
          >
            <Text style={styles.addButtonText}>+ ADD NEW ADDRESS</Text>
          </Pressable>
        )}

        {/* FORM */}

        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingId ? "Edit Address" : "Add New Address"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="House No., Building, Street, Area"
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />

            <TextInput
              style={styles.input}
              placeholder="State"
              value={state}
              onChangeText={setState}
            />

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {/* ADDRESS TYPE */}

            <Text style={styles.typeTitle}>Address Type</Text>

            <View style={styles.typeRow}>
              {["Home", "Work", "Other"].map((item) => (
                <Pressable
                  key={item}
                  style={[
                    styles.typeButton,
                    type === item && styles.typeButtonActive,
                  ]}
                  onPress={() => selectType(item)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      type === item && styles.typeTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* SAVE */}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
              </Text>
            </Pressable>

            {/* CANCEL */}

            <Pressable style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
          </View>
        )}

        {/* ADDRESS LIST */}

        {!showForm && (
          <>
            {addresses.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>📍</Text>

                <Text style={styles.emptyTitle}>No saved addresses</Text>

                <Text style={styles.emptyText}>
                  Add an address for faster checkout.
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                <Text style={styles.sectionTitle}>YOUR ADDRESSES</Text>

                {addresses.map((item) => (
                  <View key={item.id} style={styles.addressCard}>
                    {/* CARD HEADER */}

                    <View style={styles.cardHeader}>
                      <View style={styles.nameRow}>
                        <Text style={styles.addressType}>{item.type}</Text>

                        {item.isDefault && (
                          <Text style={styles.defaultBadge}>DEFAULT</Text>
                        )}
                      </View>
                    </View>

                    <Text style={styles.addressName}>{item.name}</Text>

                    <Text style={styles.addressPhone}>{item.phone}</Text>

                    <Text style={styles.addressText}>{item.address}</Text>

                    <Text style={styles.addressText}>
                      {item.city}, {item.state} - {item.pincode}
                    </Text>

                    {/* ACTIONS */}

                    <View style={styles.actions}>
                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleEdit(item)}
                      >
                        <Text style={styles.actionText}>EDIT</Text>
                      </Pressable>

                      <Pressable
                        style={styles.actionButton}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Text style={[styles.actionText, styles.deleteText]}>
                          DELETE
                        </Text>
                      </Pressable>

                      {!item.isDefault && (
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => makeDefault(item.id)}
                        >
                          <Text style={styles.actionText}>SET DEFAULT</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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

  addButton: {
    margin: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#ff3f6c",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#ff3f6c",
    fontSize: 14,
    fontWeight: "800",
  },

  formContainer: {
    margin: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 6,
  },

  formTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222",
    marginBottom: 18,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    color: "#222",
  },

  textArea: {
    height: 75,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  typeTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 10,
    color: "#333",
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },

  typeButtonActive: {
    borderColor: "#ff3f6c",
    backgroundColor: "#fff0f4",
  },

  typeText: {
    color: "#555",
    fontSize: 13,
  },

  typeTextActive: {
    color: "#ff3f6c",
    fontWeight: "700",
  },

  saveButton: {
    height: 50,
    backgroundColor: "#ff3f6c",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },

  cancelButton: {
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelText: {
    color: "#777",
    fontSize: 13,
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginTop: 15,
  },

  emptyText: {
    fontSize: 13,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },

  list: {
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#777",
    marginBottom: 10,
    marginTop: 5,
  },

  addressCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    marginBottom: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  addressType: {
    fontSize: 12,
    fontWeight: "800",
    color: "#555",
    textTransform: "uppercase",
  },

  defaultBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#00875a",
    borderWidth: 1,
    borderColor: "#00875a",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },

  addressName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  addressPhone: {
    fontSize: 13,
    color: "#555",
    marginTop: 5,
  },

  addressText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 14,
    paddingTop: 12,
    gap: 8,
  },

  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 3,
  },

  actionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ff3f6c",
  },

  deleteText: {
    color: "#e53935",
  },
});
