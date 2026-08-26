import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === product.id && item.selectedUnit === product.selectedUnit,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id && item.selectedUnit === product.selectedUnit
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity,
        },
      ];
    });
  };

  const increaseQuantity = (productId, selectedUnit) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId && item.selectedUnit === selectedUnit
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId, selectedUnit) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId && item.selectedUnit === selectedUnit
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // ==========================================
  // CLEAR CART AFTER SUCCESSFUL PAYMENT
  // ==========================================

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const itemsTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        itemsTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

