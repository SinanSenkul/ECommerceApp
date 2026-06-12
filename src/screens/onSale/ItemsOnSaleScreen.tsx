import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";
import { useSelector } from "react-redux";
import { s, vs } from "react-native-size-matters";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import AppText from "../../components/texts/AppText";
import AppButton from "../../components/buttons/AppButton";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { sharedStyles } from "../../styles/sharedStyles";
import { RootState } from "../../store/store";
import {
  deleteProductOnSale,
  getSellerProductsOnSale,
  updateProductOnSalePrice,
} from "../../config/dataServices";
import { useTranslation } from "react-i18next";
import { requireVerifiedUser } from "../../helpers/authGuards";

interface SaleItem {
  id: string;
  title?: string;
  productName?: string;
  price?: number;
  productPrice?: number;
  imageURL?: string;
  productImage?: string;
}

const fallbackImage =
  "https://t3.ftcdn.net/jpg/06/99/50/46/360_F_699504686_ArEQKHF2lsseX9z01gglG0Aol20x85BQ.jpg";

const isValidPrice = (priceText: string) => /^\d+(\.\d{1,2})?$/.test(priceText);

const ItemsOnSaleScreen = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
    surfaceColor: isNight ? AppColors.inkBlack : AppColors.white,
    borderColor: isNight ? AppColors.medGray : AppColors.blueGray,
    mutedTextColor: isNight ? AppColors.blueGray : AppColors.medGray,
  };

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const verifiedUser = await requireVerifiedUser(t);
      if (!verifiedUser) {
        setItems([]);
        setPriceInputs({});
        return;
      }
      const sellerItems = (await getSellerProductsOnSale()) as SaleItem[];
      setItems(sellerItems);
      setPriceInputs(
        Object.fromEntries(
          sellerItems.map((item) => [
            item.id,
            String(item.price ?? item.productPrice ?? 0),
          ]),
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, []),
  );

  const savePrice = async (item: SaleItem) => {
    const verifiedUser = await requireVerifiedUser(t);
    if (!verifiedUser) {
      return;
    }

    const priceText = priceInputs[item.id]?.trim() ?? "";
    if (!isValidPrice(priceText)) {
      showMessage({
        message: t("Enter a valid price"),
        type: "danger",
        duration: 1200,
        floating: true,
        icon: "danger",
      });
      return;
    }

    try {
      setSavingItemId(item.id);
      await updateProductOnSalePrice(item.id, Number(priceText));
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                price: Number(priceText),
                productPrice: Number(priceText),
              }
            : currentItem,
        ),
      );
      showMessage({
        message: t("Price updated successfully"),
        type: "success",
        duration: 1200,
        floating: true,
        icon: "success",
      });
    } catch (error) {
      console.error("price update failed: ", error);
      showMessage({
        message: t("Price update failed"),
        type: "danger",
        duration: 1200,
        floating: true,
        icon: "danger",
      });
    } finally {
      setSavingItemId(null);
    }
  };

  const deleteItem = (item: SaleItem) => {
    Alert.alert(
      t("Delete item?"),
      t("This listing will be removed from sale."),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setSavingItemId(item.id);
              await deleteProductOnSale(item.id);
              setItems((currentItems) =>
                currentItems.filter((currentItem) => currentItem.id !== item.id),
              );
              showMessage({
                message: t("Item deleted successfully"),
                type: "success",
                duration: 1200,
                floating: true,
                icon: "success",
              });
            } catch (error) {
              console.error("delete listing failed: ", error);
              showMessage({
                message: t("Item deletion failed"),
                type: "danger",
                duration: 1200,
                floating: true,
                icon: "danger",
              });
            } finally {
              setSavingItemId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: SaleItem }) => {
    const title = item.title ?? item.productName ?? "";
    const imageURL = item.imageURL ?? item.productImage ?? fallbackImage;
    const isSavingCurrentItem = savingItemId === item.id;

    return (
      <View
        style={[
          styles.itemContainer,
          {
            backgroundColor: lightMode.surfaceColor,
            borderColor: lightMode.borderColor,
          },
        ]}
      >
        <Image source={{ uri: imageURL }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <AppText style={styles.itemTitle} numberOfLines={2}>
            {title}
          </AppText>
          <View style={styles.priceRow}>
            <AppText
              style={[styles.priceLabel, { color: lightMode.mutedTextColor }]}
            >
              {t("New Price:")}
            </AppText>
            <TextInput
              value={priceInputs[item.id] ?? ""}
              onChangeText={(text) =>
                setPriceInputs((currentInputs) => ({
                  ...currentInputs,
                  [item.id]: text,
                }))
              }
              keyboardType="numeric"
              style={styles.priceInput}
            />
          </View>
          <View style={styles.actionsRow}>
            <AppButton
              title={isSavingCurrentItem ? t("Saving") : t("Save")}
              onPress={() => savePrice(item)}
              disabled={isSavingCurrentItem}
              style={styles.actionButton}
            />
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isSavingCurrentItem}
              onPress={() => deleteItem(item)}
              style={[
                styles.deleteButton,
                { opacity: isSavingCurrentItem ? 0.5 : 1 },
              ]}
            >
              <Ionicons name="trash-outline" size={s(18)} color={AppColors.red} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader showBackButton />
      <View style={styles.content}>
        <AppText style={styles.title}>{t("Manage Your Sale Items")}</AppText>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={isNight ? AppColors.white : AppColors.black}
            style={styles.loading}
          />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <AppText style={styles.emptyText}>
                {t("You do not have any items on sale")}
              </AppText>
            }
          />
        )}
      </View>
    </AppSafeView>
  );
};

export default ItemsOnSaleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
  title: {
    fontFamily: AppFonts.Bold,
    fontSize: s(18),
    marginVertical: vs(12),
    textAlign: "center",
  },
  listContent: {
    paddingBottom: vs(24),
  },
  itemContainer: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: s(8),
    padding: s(10),
    marginBottom: vs(10),
    columnGap: s(10),
  },
  itemImage: {
    width: s(82),
    height: s(82),
    borderRadius: s(8),
    resizeMode: "contain",
    backgroundColor: AppColors.white,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: AppFonts.Bold,
    fontSize: s(15),
    marginBottom: vs(8),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: s(4),
  },
  priceLabel: {
    fontFamily: AppFonts.Medium,
    fontSize: s(14),
  },
  priceInput: {
    flex: 1,
    height: vs(36),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.borderColor,
    borderRadius: s(8),
    paddingHorizontal: s(10),
    backgroundColor: AppColors.white,
    color: AppColors.black,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: s(10),
    marginTop: vs(10),
  },
  actionButton: {
    flex: 1,
    width: undefined,
    height: vs(36),
  },
  deleteButton: {
    height: vs(36),
    width: vs(36),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: s(18),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: AppColors.red,
  },
  emptyText: {
    textAlign: "center",
    marginTop: vs(24),
  },
  loading: {
    marginTop: vs(24),
  },
});
