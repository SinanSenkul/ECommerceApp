import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { s, vs } from "react-native-size-matters";
import AppSafeView from "../../components/views/AppSafeView";
import AppText from "../../components/texts/AppText";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { sharedStyles } from "../../styles/sharedStyles";
import { addItem } from "../../store/reducers/cartSlice";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import { db } from "../../config/firebase";
import { requireVerifiedUser } from "../../helpers/authGuards";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { formatPrice, normalizeCurrency } from "../../helpers/currency";

interface ProductDetailRouteParams {
  product?: {
    id?: number | string;
    title?: string;
    productName?: string;
    price?: number;
    productPrice?: number;
    currency?: string;
    productCurrency?: string;
    imageURL?: string;
    productImage?: string;
    productImages?: string[];
    stockQuantity?: number;
    sellerId?: string;
  };
}

const fallbackImage =
  "https://t3.ftcdn.net/jpg/06/99/50/46/360_F_699504686_ArEQKHF2lsseX9z01gglG0Aol20x85BQ.jpg";
const CLOSE_SWIPE_DISTANCE = vs(90);
const CLOSE_SWIPE_VELOCITY = vs(500);

const ProductDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const { items } = useSelector((state: RootState) => state.cartSlice);
  const { mode } = useSelector((state: RootState) => state.appColor);
  const product = (route.params as ProductDetailRouteParams | undefined)
    ?.product;
  const auth = getAuth();
  const user = auth.currentUser;

  const title = product?.title ?? product?.productName ?? "";
  const price = product?.price ?? product?.productPrice ?? 0;
  const currency = normalizeCurrency(product?.currency ?? product?.productCurrency);
  const productImageList = useMemo(() => {
    const imageCandidates = [
      ...(product?.productImages ?? []),
      product?.imageURL,
      product?.productImage,
    ].filter((imageUri): imageUri is string => Boolean(imageUri));

    const uniqueImages = imageCandidates.filter(
      (imageUri, index, allImages) => allImages.indexOf(imageUri) === index,
    );

    return uniqueImages.length > 0 ? uniqueImages : [fallbackImage];
  }, [product?.imageURL, product?.productImage, product?.productImages]);
  const imageURL = productImageList[0] ?? fallbackImage;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [failedImageUris, setFailedImageUris] = useState<Record<string, boolean>>(
    {},
  );
  const [sellerFullName, setSellerFullName] = useState("");
  const isOwnProduct = Boolean(user?.uid && product?.sellerId === user.uid);
  const imageCarouselWidth = width - sharedStyles.paddingHorizontal * 2;

  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight ? AppColors.backgroundBlack : AppColors.backgroundWhite,
    surfaceColor: isNight ? AppColors.inkBlack : AppColors.white,
    borderColor: isNight ? AppColors.medGray : AppColors.blueGray,
    mutedTextColor: isNight ? AppColors.blueGray : AppColors.medGray,
    buttonBackground: isNight ? AppColors.white : AppColors.black,
    buttonTextColor: isNight ? AppColors.black : AppColors.white,
  };

  const addToCart = async () => {
    const verifiedUser = await requireVerifiedUser(t);
    if (!verifiedUser) {
      return;
    }

    if (!product?.id) {
      return;
    }

    if (product?.sellerId === verifiedUser.uid) {
      showMessage({
        message: t("You cannot add your own item to cart"),
        type: "info",
        duration: 1200,
        floating: true,
        icon: "info",
      });
      return;
    }

    if (items.some((cartItem) => cartItem.id === product.id)) {
      showMessage({
        message: t("Item is already in your cart"),
        type: "info",
        duration: 1000,
        floating: true,
        icon: "info",
      });
      return;
    }

    if (
      items.length > 0 &&
      items.some((cartItem) => cartItem.currency !== currency)
    ) {
      showMessage({
        message: t("You can only add items with the same currency to cart"),
        type: "info",
        duration: 1200,
        floating: true,
        icon: "info",
      });
      return;
    }

    dispatch(
      addItem({
        id: product.id,
        title,
        price,
        currency,
        imageURL: imageURL || fallbackImage,
      }),
    );

    showMessage({
      message: t("Added to Card"),
      type: "success",
      duration: 1000,
      floating: true,
      icon: "success",
    });
  };

  const closeOnDownwardSwipe = ({ nativeEvent }: any) => {
    if (nativeEvent.state !== State.END) {
      return;
    }

    const { translationX, translationY, velocityY } = nativeEvent;
    const isDownwardSwipe =
      translationY > Math.abs(translationX) * 1.5 &&
      (translationY > CLOSE_SWIPE_DISTANCE || velocityY > CLOSE_SWIPE_VELOCITY);

    if (isDownwardSwipe) {
      navigation.goBack();
    }
  };

  const handleCarouselScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / imageCarouselWidth,
    );
    setActiveImageIndex(nextIndex);
  };

  useEffect(() => {
    setActiveImageIndex(0);
    setFailedImageUris({});
  }, [product?.id, productImageList]);

  useEffect(() => {
    const loadSeller = async () => {
      if (!product?.sellerId) {
        setSellerFullName("");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", product.sellerId));
        const seller = userDoc.data() as
          | {
              firstName?: string;
              lastName?: string;
            }
          | undefined;
        const fullName = [seller?.firstName, seller?.lastName]
          .filter(Boolean)
          .join(" ");
        setSellerFullName(fullName);
      } catch (error) {
        console.error("seller profile could not be fetched: ", error);
        setSellerFullName("");
      }
    };

    loadSeller();
  }, [product?.sellerId]);

  return (
    <PanGestureHandler
      activeOffsetY={40}
      failOffsetX={[-35, 35]}
      onHandlerStateChange={closeOnDownwardSwipe}
    >
      <View style={styles.gestureContainer}>
        <AppSafeView
          style={[
            styles.container,
            { backgroundColor: lightMode.backgroundColor },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: lightMode.surfaceColor,
                borderBottomColor: lightMode.borderColor,
              },
            ]}
          >
            <AppText style={styles.headerTitle} numberOfLines={1}>
              {t("Product Details")}
            </AppText>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={s(22)} color={AppColors.red} />
            </TouchableOpacity>
          </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.imageContainer,
              {
                backgroundColor: lightMode.surfaceColor,
                borderColor: lightMode.borderColor,
              },
            ]}
          >
            <FlatList
              data={productImageList}
              style={styles.carouselList}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: failedImageUris[item] ? fallbackImage : item }}
                  style={[styles.image, { width: imageCarouselWidth }]}
                  onError={() =>
                    setFailedImageUris((currentFailedUris) => ({
                      ...currentFailedUris,
                      [item]: true,
                    }))
                  }
                />
              )}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: imageCarouselWidth,
                offset: imageCarouselWidth * index,
                index,
              })}
              onMomentumScrollEnd={handleCarouselScrollEnd}
            />
            {productImageList.length > 1 && (
              <View style={styles.carouselDots}>
                {productImageList.map((imageUri, index) => (
                  <View
                    key={`${imageUri}-${index}`}
                    style={[
                      styles.carouselDot,
                      {
                        backgroundColor:
                          index === activeImageIndex
                            ? AppColors.primary
                            : lightMode.borderColor,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

        <View style={styles.detailsContainer}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.price}>
            {t("Price:")} {formatPrice(price, currency)}
          </AppText>
          {sellerFullName.length > 0 && (
            <AppText
              style={[styles.metaText, { color: lightMode.mutedTextColor }]}
            >
              {t("Seller:")} {sellerFullName}
            </AppText>
          )}
        </View>
      </ScrollView>

      {!isOwnProduct && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: lightMode.backgroundColor,
              borderTopColor: lightMode.borderColor,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={addToCart}
            style={[
              styles.addToCartButton,
              { backgroundColor: lightMode.buttonBackground },
            ]}
          >
            <Ionicons
              name="cart-outline"
              size={s(20)}
              color={lightMode.buttonTextColor}
            />
            <Text
              style={[styles.addToCartText, { color: lightMode.buttonTextColor }]}
            >
              {t("Add to Cart")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
        </AppSafeView>
      </View>
    </PanGestureHandler>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  header: {
    minHeight: vs(52),
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sharedStyles.paddingHorizontal,
  },
  headerTitle: {
    maxWidth: "72%",
    fontFamily: AppFonts.Bold,
    fontSize: s(17),
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: s(12),
    height: s(36),
    width: s(36),
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: sharedStyles.paddingHorizontal,
    paddingTop: vs(14),
    paddingBottom: vs(100),
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: s(8),
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  carouselList: {
    height: "100%",
    width: "100%",
  },
  carouselDots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: vs(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: s(6),
  },
  carouselDot: {
    height: s(7),
    width: s(7),
    borderRadius: s(7),
  },
  detailsContainer: {
    paddingTop: vs(18),
    rowGap: vs(8),
  },
  title: {
    fontFamily: AppFonts.Bold,
    fontSize: s(22),
  },
  price: {
    fontFamily: AppFonts.Bold,
    fontSize: s(20),
  },
  metaText: {
    fontFamily: AppFonts.Medium,
    fontSize: s(15),
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: sharedStyles.paddingHorizontal,
    paddingTop: vs(10),
    paddingBottom: vs(18),
  },
  addToCartButton: {
    minHeight: vs(48),
    borderRadius: s(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: s(8),
  },
  addToCartText: {
    fontFamily: AppFonts.Bold,
    fontSize: s(16),
  },
});
