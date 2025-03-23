import { motion } from "framer-motion"; 
import { Search, Plus, Edit, AlertTriangle, DollarSign, Package, TrendingUp, Trash, RefreshCcw, } from 'lucide-react';
import { useState, useEffect, useCallback } from "react";
import { ToggleLeft, ToggleRight } from 'phosphor-react';
import axios from "axios"; 

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const handleToggleStatus = useCallback(async (product) => {
    const confirmChange = window.confirm("Do you want to change status of product?");
    if (!confirmChange) return; // Exit if user cancels

    const newStatus = !product.is_active;
    try {
      await axios.put(`https://back-texnotech.onrender.com/products/${product.id}`, {
        is_active: newStatus,
      });
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, is_active: newStatus } : p))
      );
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  }, []);
  

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [productsResponse, numProductsResponse, categoriesResponse, brandsResponse] = await Promise.all([
        fetch(
          `http://127.0.0.1:8000/products?page=${currentPage}&page_size=${pageSize}${
            searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
          }`
        ),
        fetch(`http://127.0.0.1:8000/products/num-products`),
        axios.get('https://back-texnotech.onrender.com/categories'),
        axios.get('https://back-texnotech.onrender.com/brands'), 
      ]);
  
      if (!productsResponse.ok) {
        throw new Error(`HTTP error! Status: ${productsResponse.status}`);
      }
      if (!numProductsResponse.ok) {
        throw new Error(`HTTP error! Status: ${numProductsResponse.status}`);
      }
  
      const productsData = await productsResponse.json();
      const numProductsData = await numProductsResponse.json();
  
      // console.log('Categories:', categoriesResponse.data);
      // console.log('Brands:', brandsResponse.data);
  
      setProducts(productsData);
      setTotalPages(Math.ceil(numProductsData / pageSize) || 1);
  
      setState(prev => ({
        ...prev,
        categories: categoriesResponse.data.sort((a, b) => a.name.localeCompare(b.name)),
        brands: brandsResponse.data.sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false, 
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setState(prev => ({ ...prev, isLoading: false })); 
    } finally {
      setLoading(false);
    }
  };



  const handleRefreshProducts = useCallback(async () => {
    try {
      console.log("Refreshing products")
      await axios.delete('http://127.0.0.1:8000/others/cache/clear');
      const response = await axios.get(
        `http://127.0.0.1:8000/products?page=1&page_size=${pageSize}`
      );
      setProducts(response.data);
      setCurrentPage(1); 
      setSearchTerm(""); 
      const response2 = await fetch('http://127.0.0.1:8000/products/num-products');
      const data2 = await response2.json();
      setTotalPages(Math.ceil(data2 / pageSize) || 1);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, [pageSize]); 

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const [state, setState] = useState({
    parentCategory: "",
    specifications: [{ name: "" }],
    isAddSpecificationModalOpen: false,
    isAddSpecificationSeparateModalOpen: false,
    nameSpecificationSeparate: "",
    idSpecificationCategorySeparate: "",
    specificationCategoryID: "",
    isCategoryModalOpen: false,
    nameCategory: "",
    isBrandModalOpen: false,
    nameBrand: "",
    searchTerm: "",
    products: [],
    filteredProducts: [],
    isModalOpen: false,
    categories: [],
    brands: [],
    deleteProductId: null,
    updateProductId: null,
    productName: "",
    productCategoryId: "",
    productBrandId: "",
    productModel: "",
    productPrice: "",
    productDiscount: "",
    productStock: "",
    productKeywords: "",
    productImageLink: "",
    isSuperOffer: false,
    productId: "",
    productSpecifications: [],
    isNextModalIsOpen: false,
    isDeleteProductModalOpen: false,
    isUpdateProductModalOpen: false,
    isUpdateProductSpecificationsModalOpen: false,
    specificationValues: {},
    productSpecificationsDict: {},
    addedProductId: null,
    uploadedFiles: [],
    uploadStatus: {},
    isUploadComplete: false,
    isSuccessModalOpen: false,
    isImageModalOpen: false,
    uploadedFile: null,
    extraImages: [],
    zoomedImage: null,
    mainImageZoomed: null,
    extraImageZoomed: null,
  });

  const handleCategoryChange = useCallback((e) => setState(prev => ({ ...prev, productCategoryId: e.target.value })), []);
  const handleBrandChange = useCallback((e) => setState(prev => ({ ...prev, productBrandId: e.target.value })), []);
  const handleFileChangex = useCallback((e) => {const file = e.target.files[0]; if (file) setState(prev => ({ ...prev, uploadedFile: file }));}, []);


  const handleCategorySpecifications = useCallback(async () => {
    try {
      const response = await axios.get(`https://back-texnotech.onrender.com/categories/values/${state.productCategoryId}`);
      const specs = response.data;
      const newDict = specs.reduce((acc, item) => ({ ...acc, [item.id]: "" }), {});
      setState(prev => ({ ...prev, productSpecifications: specs, productSpecificationsDict: newDict }));
    } catch (error) {
      console.error('Error fetching specifications:', error);
    }
  }, [state.productCategoryId]);

  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault();
    let productPayload = {
      name: state.productName,
      id: parseInt(state.productId),
      category_id: parseInt(state.productCategoryId),
      num_product: parseInt(state.productStock),
      image_link: state.productImageLink,
      brend_id: parseInt(state.productBrandId),
      model_name: state.productModel,
      discount: parseInt(state.productDiscount || 0),
      search_string: state.productKeywords,
      author_id: 1,
      is_super: state.isSuperOffer,
      is_new: true,
      price: parseInt(state.productPrice),
    };
    if (state.uploadedFile) {
      const formData = new FormData();
      formData.append("file", state.uploadedFile);
      try {
        const response = await fetch("https://back-texnotech.onrender.com/files", { method: "POST", body: formData });
        if (!response.ok) throw new Error("File upload failed");
        productPayload.image_link = await response.json();
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    try {
      const response = await axios.post('https://back-texnotech.onrender.com/products/add', productPayload);
      setState(prev => ({
        ...prev,
        addedProductId: response.data.id,
        isModalOpen: false,
        uploadedFile: null,
        isNextModalIsOpen: true,
      }));
      await handleCategorySpecifications();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }, [state, handleCategorySpecifications]);


  
  const clearInputFields = useCallback(() => {
    setState(prev => ({
      ...prev,
      productName: '', productCategoryId: '', productBrandId: '', productModel: '', productPrice: '', productDiscount: '',
      productStock: '', productKeywords: '', productImageLink: '', isSuperOffer: false, productSpecificationsDict: {},
      uploadedFiles: [], uploadStatus: {}, isUploadComplete: false, productId: '',
    }));
  }, []);


  const handleAddProductClick = useCallback(() => {
    clearInputFields();
    setState(prev => ({ ...prev, isModalOpen: true }));
  }, [clearInputFields]);

  const handleAddProductSpecifications = useCallback(async (e) => {
    e.preventDefault();
    const entries = Object.entries(state.productSpecificationsDict);
    let hasError = false;
    const requests = entries.map(([id, value]) => {
      const payload = { product_id: state.addedProductId, specification_id: id, value };
      return axios.post('https://back-texnotech.onrender.com/p_specification', payload).catch(error => {
        console.error('Error adding specification:', error);
        hasError = true;
      });
    });
    await Promise.all(requests);
    if (!hasError) setState(prev => ({ ...prev, isNextModalIsOpen: false, isSuccessModalOpen: true }));
  }, [state.productSpecificationsDict, state.addedProductId]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setState(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, ...files] }));
  }, []);

  const uploadFiles = useCallback(async () => {
    if (!state.uploadedFiles.length) {
      alert("No files to upload.");
      return;
    }
    setState(prev => ({ ...prev, uploadStatus: {}, isUploadComplete: false }));
    for (const file of state.uploadedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("https://back-texnotech.onrender.com/files", { method: "POST", body: formData });
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
        const result = await response.json();
        const imagePayload = { image_link: result, product_id: state.addedProductId };
        const dbResponse = await fetch("https://back-texnotech.onrender.com/images/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imagePayload),
        });
        if (!dbResponse.ok) throw new Error(`Failed to add image to database for ${file.name}`);
        setState(prev => ({
          ...prev,
          uploadStatus: { ...prev.uploadStatus, [file.name]: { success: true, message: "Upload successful" } },
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          uploadStatus: { ...prev.uploadStatus, [file.name]: { success: false, message: error.message } },
        }));
      }
    }
    setState(prev => ({ ...prev, isUploadComplete: true }));
  }, [state.uploadedFiles, state.addedProductId]);

  const handleProductSpecificationInput = useCallback((value, id) => {
    setState(prev => ({
      ...prev,
      specificationValues: { ...prev.specificationValues, [id]: value },
      productSpecificationsDict: { ...prev.productSpecificationsDict, [id]: value },
    }));
  }, []);


  const handleAddBrandClick = useCallback(() => {
    setState(prev => ({ ...prev, nameBrand: "", isBrandModalOpen: true }));
  }, []);

  const handleAddBrand = useCallback(async (e) => {
    e.preventDefault();
    const confirmChange = window.confirm("Do you want to add this brand?");
    if (!confirmChange) return; // Exit if user cancels

    try {
      await axios.post('https://back-texnotech.onrender.com/brands/add', { name: state.nameBrand });
      setState(prev => ({ ...prev, isBrandModalOpen: false }));
    } catch (error) {
      console.error('Error adding brand:', error);
    }
  }, [state.nameBrand]);


  const handleAddCategoryClick = useCallback(() => {
    setState(prev => ({ ...prev, nameCategory: "", isCategoryModalOpen: true }));
  }, []);

  const handleAddCategoryParentId = useCallback(
    (e) => setState(prev => ({...prev, parentCategory: e.target.value})),
  [])

  const handleAddCategory = useCallback(async (e) => {
    e.preventDefault();

    const confirmChange = window.confirm("Do you want to add this category?");
    if (!confirmChange) return;

    try {
      const created_category = await axios.post('https://back-texnotech.onrender.com/categories/child/add',
        {
          name: state.nameCategory,
          is_active: true,
          num_category: 0,
          parent_category_id: state.parentCategory,
        });

        setState(prev => (
        {
          ...prev, 
          isCategoryModalOpen: false,
          isAddSpecificationModalOpen: true,
          specificationCategoryID: created_category.data.id,
          parentCategory: "",
        }));
    } catch (error) {
      console.error('Error adding category:', error);
    } 
  }, [state.nameCategory, state.parentCategory]);


  const handleAddSpecificationSeparateClick = useCallback(() => {
    setState(prev => ({...prev, isAddSpecificationSeparateModalOpen: true}));
  }, []);
  







  
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Product List</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <button
            onClick={handleAddProductClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} /> Məhsul
          </button>

          <button
            onClick={handleAddBrandClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} /> Brend
          </button>

          <button
            onClick={handleAddCategoryClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} /> Kateqoriya
          </button>

          <button
            onClick={handleAddSpecificationSeparateClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2"
          >
            <Plus size={18} /> Spesifikasiya
          </button>

          <button
            onClick={handleRefreshProducts}
            className="hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center gap-2 bg-indigo-600"
          >
            <RefreshCcw size={20} />
          </button>

        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kategoriya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Qiymət</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fəaliyyət</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-300">Loading products...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-300">No products found</td>
              </tr>
            ) : (
              products.map((product) => {
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                      <img
                        src={product.image_link || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="size-10 rounded-full"
                        onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                      />
                      {product.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.category_id}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.num_product}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{0}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">

                      <button className="text-indigo-400 hover:text-indigo-300 mr-2" onClick={() => handleSelectUpdateProduct(product)}>
                        <Edit size={27} />
                      </button>
                      <button className="text-red-400 hover:text-red-300" onClick={() => handleToggleStatus(product)}>
                        {product.is_active ? (
                          <ToggleRight size={28.5} className="text-green-400" />
                        ) : (
                          <ToggleLeft size={28.5} />
                        )}
                      </button>

                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6 space-x-2 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>

        {(() => {
          const pageRange = 10;
          let startPage = currentPage === 1 && totalPages > 0 ? 1 : currentPage;
          let endPage = Math.min(totalPages, startPage + pageRange - 1);
          
          const pages = [];
          
          if (startPage > 1) {
            pages.push(
              <button
                key={1}
                onClick={() => handlePageChange(1)}
                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                1
              </button>
            );
            if (startPage > 2) {
              pages.push(<span key="start-ellipsis" className="text-gray-300">...</span>);
            }
          }

          for (let i = startPage; i <= endPage; i++) {
            pages.push(
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-4 py-2 rounded ${
                  currentPage === i ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {i}
              </button>
            );
          }

          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              pages.push(<span key="end-ellipsis" className="text-gray-300">...</span>);
            }
            pages.push(
              <button
                key={totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                {totalPages}
              </button>
            );
          }

          return pages;
        })()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>

      </div>


      {state.isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setState(prev => ({ ...prev, isModalOpen: false }))}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto absolute top-4"
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Məhsul əlavə et</h2>
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Məhsulun adı</label>
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productName}
                    onChange={e => setState(prev => ({ ...prev, productName: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kateqoriya</label>
                  <select
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productCategoryId}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="">Select</option>
                    {state.categories.filter(c => c.id > 17).map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Brend</label>
                  <select
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productBrandId}
                    onChange={handleBrandChange}
                    required
                  >
                    <option value="">Select</option>
                    {state.brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productModel}
                    onChange={e => setState(prev => ({ ...prev, productModel: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Qiymət</label>
                  <input
                    type="number"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productPrice}
                    onChange={e => setState(prev => ({ ...prev, productPrice: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Endirimli Qiymət</label>
                  <input
                    type="number"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productDiscount}
                    onChange={e => setState(prev => ({ ...prev, productDiscount: e.target.value }))}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kəmiyyət</label>
                  <input
                    type="number"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productStock}
                    onChange={e => setState(prev => ({ ...prev, productStock: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Açar sözlər</label>
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.productKeywords}
                    onChange={e => setState(prev => ({ ...prev, productKeywords: e.target.value }))}
                  />
                </div>
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Məhsul şəklini yüklə</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    onChange={handleFileChangex}
                  />
                  {state.uploadedFile && (
                    <div className="mt-4 flex items-center space-x-2">
                      <img src={URL.createObjectURL(state.uploadedFile)} alt={state.uploadedFile.name} className="w-16 h-16 object-cover rounded-lg" />
                      <span className="text-white text-sm">{state.uploadedFile.name}</span>
                    </div>
                  )}
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={state.isSuperOffer}
                    onChange={() => setState(prev => ({ ...prev, isSuperOffer: !prev.isSuperOffer }))}
                    className="text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-300">Super Təklif</span>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    onClick={() => setState(prev => ({ ...prev, isModalOpen: false }))}
                  >
                    Bağla
                  </button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
                    Növbəti
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}


      {state.isNextModalIsOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setState(prev => ({ ...prev, isNextModalIsOpen: false }))}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Spesifikasiyaları doldur</h2>
            <form onSubmit={handleAddProductSpecifications}>
              <div className="grid grid-cols-2 gap-4">
                {state.productSpecifications.map((spec, index) => (
                  <div className="mb-4" key={index}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{spec.name}</label>
                    <input
                      type="text"
                      className="bg-gray-700 text-white rounded-lg p-2 w-full"
                      value={state.productSpecificationsDict[spec.id] || ""}
                      onChange={e => handleProductSpecificationInput(e.target.value, spec.id)}
                    />
                  </div>
                ))}
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Məhsul şəkillərini yüklə</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    onChange={handleFileChange}
                  />
                  <div className="mt-4 space-y-2">
                    {state.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <span className="text-sm text-gray-300">{file.name}</span>
                          {state.uploadStatus[file.name] && (
                            <p className={`text-sm ${state.uploadStatus[file.name].success ? "text-green-500" : "text-red-500"}`}>
                              {state.uploadStatus[file.name].message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    onClick={() => setState(prev => ({ ...prev, isNextModalIsOpen: false }))}
                  >
                    Bağla
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    onClick={uploadFiles}
                  >
                    Bitir
                  </button>
                </div>
              </div>
            </form>
            {state.isUploadComplete && (
              <div className="mt-4 text-green-500 text-sm">Bütün şəkillər uğurla yükləndi!</div>
            )}
          </motion.div>
        </motion.div>
      )}


      {state.isBrandModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setState(prev => ({ ...prev, isBrandModalOpen: false }))}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Brend əlavə et</h2>
            <form onSubmit={handleAddBrand}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Brendin adı</label>
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.nameBrand}
                    onChange={e => setState(prev => ({ ...prev, nameBrand: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    onClick={() => setState(prev => ({ ...prev, isBrandModalOpen: false }))}
                    style={{ width: "100%" }}
                  >
                    Bağla
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    style={{ width: "100%" }}
                  >
                    Bitir
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}


      {state.isCategoryModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setState(prev => ({ ...prev, isCategoryModalOpen: false }))}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Kateqoriya əlavə et</h2>
            <form onSubmit={handleAddCategory}>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kateqoriya adı</label>
                  <input
                    type="text"
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.nameCategory}
                    onChange={e => setState(prev => ({ ...prev, nameCategory: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ana Kateqoriya</label>
                  <select
                    className="bg-gray-700 text-white rounded-lg p-2 w-full"
                    value={state.parentCategory}
                    onChange={handleAddCategoryParentId}
                    required
                  >
                    <option value="">Select</option>
                    {state.categories.filter(c => c.id > 17).map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                    onClick={() => setState(prev => ({ ...prev, isCategoryModalOpen: false }))}
                    style={{ width: "100%" }}
                  >
                    Bağla
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    style={{ width: "100%" }}
                  >
                    Növbəti
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}





      







      
    
    </motion.div>
  );
};

export default ProductsTable;