import {
  collection,
  doc,
  getDoc,
  getDocs,
  QuerySnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { store } from "../store/store";

const getProductsData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    return list;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

export { getProductsData };

export const getUserOrders = async () => {
  try {
    const userIdFromGlobal = store.getState().userSlice.userData.uid; 
    const userIdFromFirebase = auth.currentUser?.uid;
    const userOrdersRef = collection(doc(db, "users", userIdFromFirebase || userIdFromGlobal), "orders");
    const docSnap = await getDocs(userOrdersRef);
    const orderList = docSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orderList;
  } catch (error) {
    console.error("error fetching orders: ", error);
  }
};
