import { useEffect, useState } from "react";
import axios from "axios";

const backend = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ ProductId: "", Name: "", ExpiryInMin: "" });
  const now = Math.floor(Date.now() / 1000);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backend}/products`);
      const validItems = res.data.items.filter((item) => item.ExpiryDate > now);
      setProducts(validItems || []);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addProduct = async () => {
    if (!form.ProductId || !form.Name || !form.ExpiryInMin) return alert("All fields required");
    try {
      await axios.post(`${backend}/add-product`, {
        ...form,
        ExpiryInMin: parseInt(form.ExpiryInMin),
      });
      setForm({ ProductId: "", Name: "", ExpiryInMin: "" });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err.message);
    }
  };

  return (
    <div className="min-h-screen w-full mx-auto p-6 bg-gray-100 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Inventory Manager</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Add New Product</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            name="ProductId"
            placeholder="Product ID"
            value={form.ProductId}
            onChange={handleChange}
            className="p-2 border rounded w-full sm:w-1/3"
          />
          <input
            type="text"
            name="Name"
            placeholder="Product Name"
            value={form.Name}
            onChange={handleChange}
            className="p-2 border rounded w-full sm:w-1/3"
          />
          <input
            type="number"
            name="ExpiryInMin"
            placeholder="Expiry (mins)"
            value={form.ExpiryInMin}
            onChange={handleChange}
            className="p-2 border rounded w-full sm:w-1/3"
          />
        </div>
        <button
          onClick={addProduct}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Products</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Product ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.ProductId}>
                  <td className="border px-4 py-2">{item.ProductId}</td>
                  <td className="border px-4 py-2">{item.Name}</td>
                  <td className="border px-4 py-2">
                    {new Date(item.ExpiryDate * 1000).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
