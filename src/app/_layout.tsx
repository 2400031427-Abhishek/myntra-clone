import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#ff3f6c",
        tabBarInactiveTintColor: "#777",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#eeeeee",
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 22,
                color,
              }}
            >
              ⌂
            </Text>
          ),
        }}
      />

      {/* SEARCH / EXPLORE */}

      <Tabs.Screen
        name="explore"
        options={{
          title: "Search",

          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 20,
                color,
              }}
            >
              🔍
            </Text>
          ),
        }}
      />

      {/* WISHLIST */}

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",

          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 22,
                color,
              }}
            >
              ♡
            </Text>
          ),
        }}
      />

      {/* BAG */}

      <Tabs.Screen
        name="bag"
        options={{
          title: "Bag",

          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 21,
                color,
              }}
            >
              🛍
            </Text>
          ),
        }}
      />

      {/* PROFILE */}

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color }) => (
            <Text
              style={{
                fontSize: 21,
                color,
              }}
            >
              ♙
            </Text>
          ),
        }}
      />

      {/* HIDDEN SCREENS */}

      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }}
      />

      <Tabs.Screen
        name="signup"
        options={{
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }}
      />

      <Tabs.Screen
        name="category"
        options={{
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }}
      />

      <Tabs.Screen
        name="product"
        options={{
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }}
      />

      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }}
      />

      <Tabs.Screen
        name="order"
        options={{
          href: null,
          tabBarStyle: {
            display: "none",
          },
        }}
      />
    </Tabs>
  );
}
