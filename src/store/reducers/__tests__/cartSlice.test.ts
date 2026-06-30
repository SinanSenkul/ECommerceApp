import cartReducer, { addItem, deleteItem, emptyItems } from "../cartSlice";

describe("cartSlice", () => {
  it("normalizes partial items before adding them", () => {
    const state = cartReducer(
      undefined,
      addItem({
        id: 42,
        price: 12.5,
        currency: "usd",
        title: "Keyboard",
      }),
    );

    expect(state.items).toEqual([
      {
        id: 42,
        price: 12.5,
        currency: "USD",
        title: "Keyboard",
        imageURL: "",
      },
    ]);
  });

  it("does not add duplicate item ids", () => {
    const firstState = cartReducer(undefined, addItem({ id: "a", price: 10 }));
    const secondState = cartReducer(
      firstState,
      addItem({ id: "a", price: 20, title: "Duplicate" }),
    );

    expect(secondState.items).toHaveLength(1);
    expect(secondState.items[0].price).toBe(10);
  });

  it("deletes and empties items", () => {
    const withItems = [
      addItem({ id: "a", price: 10 }),
      addItem({ id: "b", price: 20 }),
    ].reduce(cartReducer, undefined);

    const afterDelete = cartReducer(withItems, deleteItem("a"));
    expect(afterDelete.items.map((item) => item.id)).toEqual(["b"]);

    const afterEmpty = cartReducer(afterDelete, emptyItems());
    expect(afterEmpty.items).toEqual([]);
  });
});
