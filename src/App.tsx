import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyPage } from './pages/MyPage';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Support } from './pages/Support';
import { MockDb } from './services/mockDb';

function App() {
  useEffect(() => {
    // Initialize mock database on startup
    MockDb.init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="support" element={<Support />} />
          {/* We will add other routes here in later phases */}
          <Route path="*" element={<div data-testid="not-found">404 Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
