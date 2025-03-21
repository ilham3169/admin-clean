import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import ProductsTable from "../components/products/ProductsTable";

import { Package } from "lucide-react";

const ProductsPage = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalProductsNew, setTotalProductsNew] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    fetch("http://127.0.0.1:8000/products/num-products")
      .then((response) => response.json())
      .then((data) => {
        setTotalProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching total products:", error);
      });

    fetch("http://127.0.0.1:8000/products/num-products-new")
      .then((response) => response.json())
      .then((data) => {
        setTotalProductsNew(data);
      })
      .catch((error) => {
        console.error("Error fetching new total products:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Products" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Products" icon={Package} value={totalProducts} color="#6366F1" />
          <StatCard name="New Products" icon={Package} value={totalProductsNew} color="#8B5CF6" />
        </motion.div>

        <ProductsTable />
      </main>
    </div>
  );
};

export default ProductsPage;