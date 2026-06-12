import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const getProductsData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products_onsale"));
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      if (
        typeof productData.stockQuantity === "number" &&
        productData.stockQuantity <= 0
      ) {
        return;
      }

      const { createdAt, ...serializableProductData } = productData;
      list.push({
        id: doc.id,
        title: productData.productName,
        price: productData.productPrice,
        imageURL: productData.productImage,
        ...serializableProductData,
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return [];
  }
};

export { getProductsData };

export const getUserOrders = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      return [];
    }

    const userOrdersRef = collection(doc(db, "users", userId), "orders");
    const docSnap = await getDocs(userOrdersRef);
    const orderList = docSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orderList;
  } catch (error) {
    console.error("error fetching orders: ", error);
    return [];
  }
};

interface ProductOnSalePayload {
  productName: string;
  productPrice: number;
  stockQuantity: number;
  productImages: string[];
  sellerId?: string;
}

export const addProductOnSale = async ({
  productName,
  productPrice,
  stockQuantity,
  productImages,
  sellerId,
}: ProductOnSalePayload) => {
  const productOnSaleBody = {
    productName,
    productPrice,
    stockQuantity,
    productImage: productImages[0] ?? "",
    productImages,
    sellerId: sellerId ?? auth.currentUser?.uid ?? "",
    createdAt: serverTimestamp(),
  };

  const productOnSaleRef = collection(db, "products_onsale");
  return addDoc(productOnSaleRef, productOnSaleBody);
};

export const getSellerProductsOnSale = async () => {
  try {
    const sellerId = auth.currentUser?.uid;
    if (!sellerId) {
      return [];
    }

    const productsOnSaleRef = collection(db, "products_onsale");
    const sellerProductsQuery = query(
      productsOnSaleRef,
      where("sellerId", "==", sellerId),
    );
    const querySnapshot = await getDocs(sellerProductsQuery);

    return querySnapshot.docs.flatMap((doc) => {
      const productData = doc.data();
      if (
        typeof productData.stockQuantity === "number" &&
        productData.stockQuantity <= 0
      ) {
        return [];
      }

      return [
        {
          id: doc.id,
          title: productData.productName,
          price: productData.productPrice,
          imageURL: productData.productImage,
          ...productData,
        },
      ];
    });
  } catch (error) {
    console.error("error fetching seller products: ", error);
    return [];
  }
};

export const updateProductOnSalePrice = async (
  productId: string,
  productPrice: number,
) => {
  const productRef = doc(db, "products_onsale", productId);
  return updateDoc(productRef, { productPrice });
};

export const deleteProductOnSale = async (productId: string) => {
  const productRef = doc(db, "products_onsale", productId);
  return deleteDoc(productRef);
};

export const getSellerSaleNotifications = async () => {
  try {
    const sellerId = auth.currentUser?.uid;
    if (!sellerId) {
      return [];
    }

    const saleNotificationsRef = collection(
      doc(db, "users", sellerId),
      "saleNotifications",
    );
    const querySnapshot = await getDocs(saleNotificationsRef);

    return querySnapshot.docs.flatMap((doc) => {
      const notificationData = doc.data();
      if (notificationData.status === "shipped") {
        return [];
      }

      return [
        {
          id: doc.id,
          ...notificationData,
        },
      ];
    });
  } catch (error) {
    console.error("error fetching sale notifications: ", error);
    return [];
  }
};

export const markSaleNotificationOrderAsShipped = async ({
  notificationId,
  buyerId,
  userOrderId,
  orderId,
}: {
  notificationId: string;
  buyerId: string;
  userOrderId: string;
  orderId: string;
}) => {
  const sellerId = auth.currentUser?.uid;
  if (!sellerId) {
    throw new Error("Seller not found");
  }

  const batch = writeBatch(db);
  const userOrderRef = doc(db, "users", buyerId, "orders", userOrderId);
  const orderRef = doc(db, "orders", orderId);
  const saleNotificationRef = doc(
    db,
    "users",
    sellerId,
    "saleNotifications",
    notificationId,
  );

  batch.update(userOrderRef, { status: "shipped" });
  batch.update(orderRef, { status: "shipped" });
  batch.delete(saleNotificationRef);

  return batch.commit();
};
