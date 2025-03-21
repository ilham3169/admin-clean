import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SalesOverviewChart from "../components/overview/SalesOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";
import React, { useState, useEffect } from "react";




const OverviewPage = () => {
	const [allProducts, setAllProducts] = useState([]); 

	useEffect(() => {
		fetch("http://127.0.0.1:8000/products/num-products")
			.then((response) => response.json())
			.then((data) => {
				setAllProducts(data);
			})
			.catch((error) => console.error("Error fetching products:", error));
	}, []);

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Overview' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Total Sales' icon={Zap} value='$12,345' color='#6366F1' />
					<StatCard name='Total Products' icon={ShoppingBag} value={allProducts.length} color='#EC4899' />
				</motion.div>


				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<SalesOverviewChart />
					<CategoryDistributionChart />
					<SalesChannelChart />
				</div>
			</main>
		</div>
	);
};
export default OverviewPage;
