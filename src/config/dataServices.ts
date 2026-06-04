import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { store } from "../store/store";

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
    const userData = store.getState().userSlice.userData as { uid?: string };
    const userIdFromGlobal = userData.uid;
    const userIdFromFirebase = auth.currentUser?.uid;
    const userId = userIdFromFirebase || userIdFromGlobal;
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
