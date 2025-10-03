const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const convertProductFromDb = (dbProduct) => {
  return {
    Id: dbProduct.Id,
    name: dbProduct.name_c || "",
    category: dbProduct.category_c || "",
    subcategory: dbProduct.subcategory_c || "",
    price: dbProduct.price_c || 0,
    images: dbProduct.images_c ? dbProduct.images_c.split('\n').filter(img => img.trim()) : [],
    sizes: dbProduct.sizes_c ? dbProduct.sizes_c.split('\n').filter(s => s.trim()) : [],
    colors: dbProduct.colors_c ? dbProduct.colors_c.split('\n').filter(c => c.trim()) : [],
    description: dbProduct.description_c || "",
    inStock: dbProduct.in_stock_c || false,
    stockCount: dbProduct.stock_count_c || 0,
    featured: dbProduct.featured_c || false,
    trending: dbProduct.trending_c || false
  };
};

const productService = {
  getAll: async () => {
    try {
      const params = {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "subcategory_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "sizes_c" } },
          { field: { Name: "colors_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "in_stock_c" } },
          { field: { Name: "stock_count_c" } },
          { field: { Name: "featured_c" } },
          { field: { Name: "trending_c" } }
        ]
      };

      const response = await apperClient.fetchRecords("product_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(convertProductFromDb);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const params = {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "subcategory_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "sizes_c" } },
          { field: { Name: "colors_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "in_stock_c" } },
          { field: { Name: "stock_count_c" } },
          { field: { Name: "featured_c" } },
          { field: { Name: "trending_c" } }
        ]
      };

      const response = await apperClient.getRecordById("product_c", parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Product not found");
      }

      return convertProductFromDb(response.data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  getByCategory: async (category) => {
    try {
      const params = {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "subcategory_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "sizes_c" } },
          { field: { Name: "colors_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "in_stock_c" } },
          { field: { Name: "stock_count_c" } },
          { field: { Name: "featured_c" } },
          { field: { Name: "trending_c" } }
        ],
        where: [
          {
            FieldName: "category_c",
            Operator: "EqualTo",
            Values: [category]
          }
        ]
      };

      const response = await apperClient.fetchRecords("product_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(convertProductFromDb);
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  },

  getFeatured: async () => {
    try {
      const params = {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "subcategory_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "sizes_c" } },
          { field: { Name: "colors_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "in_stock_c" } },
          { field: { Name: "stock_count_c" } },
          { field: { Name: "featured_c" } },
          { field: { Name: "trending_c" } }
        ],
        where: [
          {
            FieldName: "featured_c",
            Operator: "EqualTo",
            Values: [true]
          }
        ]
      };

      const response = await apperClient.fetchRecords("product_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(convertProductFromDb);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  },

  getTrending: async () => {
    try {
      const params = {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "subcategory_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "sizes_c" } },
          { field: { Name: "colors_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "in_stock_c" } },
          { field: { Name: "stock_count_c" } },
          { field: { Name: "featured_c" } },
          { field: { Name: "trending_c" } }
        ],
        where: [
          {
            FieldName: "trending_c",
            Operator: "EqualTo",
            Values: [true]
          }
        ]
      };

      const response = await apperClient.fetchRecords("product_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(convertProductFromDb);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const params = {
        fields: [
          { field: { Name: "name_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "subcategory_c" } },
          { field: { Name: "price_c" } },
          { field: { Name: "images_c" } },
          { field: { Name: "sizes_c" } },
          { field: { Name: "colors_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "in_stock_c" } },
          { field: { Name: "stock_count_c" } },
          { field: { Name: "featured_c" } },
          { field: { Name: "trending_c" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "name_c",
                    operator: "Contains",
                    values: [query]
                  }
                ],
                operator: ""
              },
              {
                conditions: [
                  {
                    fieldName: "category_c",
                    operator: "Contains",
                    values: [query]
                  }
                ],
                operator: ""
              },
              {
                conditions: [
                  {
                    fieldName: "description_c",
                    operator: "Contains",
                    values: [query]
                  }
                ],
                operator: ""
              }
            ]
          }
        ]
      };

      const response = await apperClient.fetchRecords("product_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(convertProductFromDb);
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }
};

export default productService;