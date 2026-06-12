import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { showMessage } from "react-native-flash-message";
import { useSelector } from "react-redux";
import { s, vs } from "react-native-size-matters";
import AppSafeView from "../../components/views/AppSafeView";
import HomeHeader from "../../components/headers/HomeHeader";
import AppText from "../../components/texts/AppText";
import AppButton from "../../components/buttons/AppButton";
import AppTextInputController from "../../components/inputs/AppTextInputController";
import { AppColors } from "../../styles/colors";
import { AppFonts } from "../../styles/fonts";
import { sharedStyles } from "../../styles/sharedStyles";
import { RootState } from "../../store/store";
import { addProductOnSale } from "../../config/dataServices";
import { useTranslation } from "react-i18next";
import { requireVerifiedUser } from "../../helpers/authGuards";

const MAX_IMAGE_COUNT = 5;

interface SelectedImage {
  uri: string;
  originalUri?: string;
  base64?: string | null;
  fileName?: string | null;
  mimeType?: string;
}

const getErrorText = (error: unknown) => {
  if (error && typeof error === "object") {
    const errorObj = error as { code?: string; message?: string };
    return errorObj.code
      ? `${errorObj.code}: ${errorObj.message ?? ""}`
      : errorObj.message ?? "Unknown error";
  }

  return String(error);
};

const getImageDataUri = (image: SelectedImage) => {
  if (!image.base64) {
    throw new Error("Selected image data could not be prepared for upload");
  }

  return `data:${image.mimeType ?? "image/jpeg"};base64,${image.base64}`;
};

const prepareSelectedImage = async (
  pickedImage: ImagePicker.ImagePickerAsset,
): Promise<SelectedImage> => {
  try {
    const compressedImage = await ImageManipulator.manipulateAsync(
      pickedImage.uri,
      [{ resize: { width: 600 } }],
      {
        base64: true,
        compress: 0.35,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    if (compressedImage.base64) {
      return {
        uri: compressedImage.uri,
        originalUri: pickedImage.uri,
        base64: compressedImage.base64,
        fileName: pickedImage.fileName,
        mimeType: "image/jpeg",
      };
    }
  } catch (error) {
    console.log("image compression failed: ", getErrorText(error), error);
  }

  if (!pickedImage.base64) {
    throw new Error("Selected picture could not be prepared");
  }

  return {
    uri: pickedImage.uri,
    originalUri: pickedImage.uri,
    base64: pickedImage.base64,
    fileName: pickedImage.fileName,
    mimeType: pickedImage.mimeType ?? "image/jpeg",
  };
};

const createSchema = (translate: (key: string) => string) =>
  yup
    .object({
      productName: yup
        .string()
        .required(translate("Product name is required")),
      productPrice: yup
        .string()
        .required(translate("Product price is required"))
        .matches(/^\d+(\.\d{1,2})?$/, translate("Enter a valid price")),
      stockQuantity: yup
        .string()
        .required(translate("Stock quantity is required"))
        .matches(/^[1-9]\d*$/, translate("Stock quantity must be at least 1")),
    })
    .required();

type FormData = yup.InferType<ReturnType<typeof createSchema>>;

const SellItemScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const schema = useMemo(() => createSchema(t), [t]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mode } = useSelector((state: RootState) => state.appColor);
  const isNight = mode === "nightMode";
  const lightMode = {
    backgroundColor: isNight
      ? AppColors.backgroundBlack
      : AppColors.backgroundWhite,
    surfaceColor: isNight ? AppColors.inkBlack : AppColors.white,
    borderColor: isNight ? AppColors.medGray : AppColors.lightGray,
    mutedTextColor: isNight ? AppColors.blueGray : AppColors.medGray,
  };

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const pickImages = async () => {
    const remainingSlots = MAX_IMAGE_COUNT - selectedImages.length;
    if (remainingSlots <= 0) {
      Alert.alert(t("You can select up to 5 pictures"));
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("Photo access is required to select product pictures"));
      return;
    }

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        base64: true,
        mediaTypes: ["images"],
        quality: 1,
      });
    } catch (error) {
      console.log("image picker failed: ", getErrorText(error), error);
      Alert.alert(t("Selected picture could not be loaded"));
      return;
    }

    if (result.canceled) {
      return;
    }

    const pickedImage = result.assets?.[0];
    if (!pickedImage?.uri) {
      Alert.alert(t("Selected picture could not be loaded"));
      return;
    }

    let preparedImage: SelectedImage;
    try {
      preparedImage = await prepareSelectedImage(pickedImage);
    } catch (error) {
      console.log("image selection failed: ", getErrorText(error), error);
      Alert.alert(t("Selected picture could not be loaded"));
      return;
    }

    setSelectedImages((currentImages) => {
      if (currentImages.some((image) => image.originalUri === pickedImage.uri)) {
        return currentImages;
      }

      return [...currentImages, preparedImage].slice(0, MAX_IMAGE_COUNT);
    });
  };

  const removeImage = (imageUri: string) => {
    setSelectedImages((currentImages) =>
      currentImages.filter((image) => image.uri !== imageUri),
    );
  };

  const submitProduct = async (data: FormData) => {
    const verifiedUser = await requireVerifiedUser(t);
    if (!verifiedUser) {
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert(t("Please select at least one product picture"));
      return;
    }

    try {
      setIsSubmitting(true);
      const productImages = selectedImages.map(getImageDataUri);

      await addProductOnSale({
        productName: data.productName.trim(),
        productPrice: Number(data.productPrice),
        stockQuantity: Number(data.stockQuantity),
        productImages,
        sellerId: verifiedUser.uid,
      });

      reset();
      setSelectedImages([]);
      showMessage({
        message: t("Product listed successfully"),
        type: "success",
        duration: 1200,
        floating: true,
        icon: "success",
        position: "top",
      });
      navigation.goBack();
    } catch (error) {
      const errorText = getErrorText(error);
      console.log("sell item error: ", errorText, error);
      Alert.alert(
        t("Product listing failed"),
        t("Product could not be listed. Please try again"),
      );
      showMessage({
        message: t("Product listing failed"),
        type: "danger",
        duration: 1200,
        floating: true,
        icon: "danger",
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppSafeView
      style={[styles.container, { backgroundColor: lightMode.backgroundColor }]}
    >
      <HomeHeader />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <View
          style={[
            styles.formContainer,
            {
              backgroundColor: lightMode.surfaceColor,
              borderColor: lightMode.borderColor,
            },
          ]}
        >
          <AppText style={styles.title} variant="bold">
            {t("Sell Items")}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickImages}
            style={[
              styles.imagePicker,
              {
                borderColor: lightMode.borderColor,
                backgroundColor: lightMode.backgroundColor,
              },
            ]}
          >
            <AppText style={styles.imagePickerText}>
              {selectedImages.length > 0
                ? t("Add More Pictures")
                : t("Select Product Pictures")}
            </AppText>
            <AppText
              style={[
                styles.imageCountText,
                { color: lightMode.mutedTextColor },
              ]}
            >
              {selectedImages.length}/{MAX_IMAGE_COUNT}
            </AppText>
          </TouchableOpacity>

          {selectedImages.length > 0 && (
            <View style={styles.previewGrid}>
              {selectedImages.map((image) => (
                <TouchableOpacity
                  key={image.uri}
                  activeOpacity={0.8}
                  onPress={() => removeImage(image.uri)}
                  style={styles.previewWrapper}
                >
                  <Image source={{ uri: image.uri }} style={styles.preview} />
                  <View style={styles.removeBadge}>
                    <Ionicons name="close" size={s(11)} color={AppColors.white} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <AppTextInputController
            control={control}
            name="productName"
            placeholder={t("Product Name")}
          />
          <AppTextInputController
            control={control}
            name="productPrice"
            placeholder={t("Product Price")}
            keyboardType="numeric"
          />
          <AppTextInputController
            control={control}
            name="stockQuantity"
            placeholder={t("Stock Quantity")}
            keyboardType="numeric"
          />

          {isSubmitting ? (
            <ActivityIndicator
              size="large"
              color={isNight ? AppColors.white : AppColors.black}
              style={styles.loading}
            />
          ) : (
            <AppButton
              title={t("List Product")}
              onPress={handleSubmit(submitProduct)}
              style={styles.submitButton}
            />
          )}

          <AppButton
            title={t("Back")}
            onPress={() => navigation.goBack()}
            style={[
              styles.backButton,
              {
                backgroundColor: lightMode.surfaceColor,
                borderColor: lightMode.borderColor,
              },
            ]}
            textColor={isNight ? AppColors.white : AppColors.black}
          />
        </View>
      </ScrollView>
    </AppSafeView>
  );
};

export default SellItemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: sharedStyles.paddingHorizontal,
    paddingVertical: vs(16),
  },
  formContainer: {
    borderWidth: s(1),
    borderRadius: s(8),
    paddingHorizontal: s(12),
    paddingVertical: vs(16),
    justifyContent:"center",
    alignItems:"center"
  },
  title: {
    fontFamily: AppFonts.Bold,
    fontSize: s(18),
    marginBottom: vs(14),
    textAlign: "center",
  },
  imagePicker: {
    width: "85%",
    minHeight: vs(74),
    borderWidth: s(1),
    borderStyle: "dashed",
    borderRadius: s(8),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: vs(12),
    paddingHorizontal: s(12),
  },
  imagePickerText: {
    fontFamily: AppFonts.Bold,
    fontSize: s(15),
    textAlign: "center",
  },
  imageCountText: {
    fontSize: s(13),
    marginTop: vs(4),
  },
  previewGrid: {
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(8),
    marginBottom: vs(14),
  },
  previewWrapper: {
    height: vs(72),
    width: s(72),
    borderRadius: s(8),
  },
  preview: {
    height: "100%",
    width: "100%",
    borderRadius: s(8),
  },
  removeBadge: {
    position: "absolute",
    top: s(4),
    right: s(4),
    height: s(15),
    width: s(15),
    borderRadius: s(15),
    backgroundColor: AppColors.red,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    marginTop: vs(8),
  },
  backButton: {
    borderWidth: s(1),
    marginTop: vs(12),
  },
  loading: {
    marginVertical: vs(12),
  },
});
