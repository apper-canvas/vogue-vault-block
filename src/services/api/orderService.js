const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});
import authService from "./authService";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const convertOrderFromDb = (dbOrder) => {
  return {
    Id: dbOrder.Id,
    userId: dbOrder.user_id_c?.Id || dbOrder.user_id_c,
    orderNumber: dbOrder.order_number_c || "",
    items: dbOrder.items_c ? JSON.parse(dbOrder.items_c) : [],
    subtotal: dbOrder.subtotal_c || 0,
    shipping: dbOrder.shipping_c || 0,
    tax: dbOrder.tax_c || 0,
    total: dbOrder.total_c || 0,
    shippingAddress: dbOrder.shipping_address_c ? JSON.parse(dbOrder.shipping_address_c) : {},
    status: dbOrder.status_c || "Processing",
    createdAt: dbOrder.created_at_c || new Date().toISOString()
  };
};

const orderService = {
  createOrder: async (orderData) => {
    try {
      const userProfileParams = {
        fields: [{ field: { Name: "email_c" } }],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const userResponse = await apperClient.fetchRecords("user_profile_c", userProfileParams);

      if (!userResponse.success || !userResponse.data || userResponse.data.length === 0) {
        throw new Error("User not authenticated");
      }

      const currentUser = userResponse.data[0];

      const createParams = {
        records: [
          {
            user_id_c: currentUser.Id,
            order_number_c: `VO${Date.now().toString().slice(-8)}`,
            items_c: JSON.stringify(orderData.items),
            subtotal_c: orderData.subtotal,
            shipping_c: orderData.shipping,
            tax_c: orderData.tax,
            total_c: orderData.total,
            shipping_address_c: JSON.stringify(orderData.shippingAddress),
            status_c: "Processing",
            created_at_c: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord("order_c", createParams);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create order:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                throw new Error(error);
              });
            }
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }

        if (successful.length > 0) {
          return convertOrderFromDb(successful[0].data);
        }
      }

      throw new Error("Failed to create order");
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  getUserOrders: async () => {
    try {
      const userProfileParams = {
        fields: [{ field: { Name: "email_c" } }],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const userResponse = await apperClient.fetchRecords("user_profile_c", userProfileParams);

      if (!userResponse.success || !userResponse.data || userResponse.data.length === 0) {
        throw new Error("User not authenticated");
      }

      const currentUser = userResponse.data[0];

      const params = {
        fields: [
          { field: { Name: "user_id_c" } },
          { field: { Name: "order_number_c" } },
          { field: { Name: "items_c" } },
          { field: { Name: "subtotal_c" } },
          { field: { Name: "shipping_c" } },
          { field: { Name: "tax_c" } },
          { field: { Name: "total_c" } },
          { field: { Name: "shipping_address_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } }
        ],
        where: [
          {
            FieldName: "user_id_c",
            Operator: "EqualTo",
            Values: [currentUser.Id]
          }
        ],
        orderBy: [
          {
            fieldName: "created_at_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords("order_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(convertOrderFromDb);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const userProfileParams = {
        fields: [{ field: { Name: "email_c" } }],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const userResponse = await apperClient.fetchRecords("user_profile_c", userProfileParams);

      if (!userResponse.success || !userResponse.data || userResponse.data.length === 0) {
        throw new Error("User not authenticated");
      }

      const currentUser = userResponse.data[0];

      const params = {
        fields: [
          { field: { Name: "user_id_c" } },
          { field: { Name: "order_number_c" } },
          { field: { Name: "items_c" } },
          { field: { Name: "subtotal_c" } },
          { field: { Name: "shipping_c" } },
          { field: { Name: "tax_c" } },
          { field: { Name: "total_c" } },
          { field: { Name: "shipping_address_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById("order_c", parseInt(orderId), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Order not found");
      }

      const order = convertOrderFromDb(response.data);

      if (order.userId !== currentUser.Id) {
        throw new Error("Order not found");
      }

      return order;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }
};

export default orderService;