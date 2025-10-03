const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const authService = {
  login: async (email, password) => {
    try {
      const params = {
        fields: [
          { field: { Name: "email_c" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "addresses_c" } },
          { field: { Name: "created_at_c" } }
        ],
        where: [
          {
            FieldName: "email_c",
            Operator: "EqualTo",
            Values: [email]
          }
        ]
      };

      const response = await apperClient.fetchRecords("user_profile_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error("Invalid email or password");
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Invalid email or password");
      }

      const user = response.data[0];

      return {
        Id: user.Id,
        firstName: user.first_name_c || "",
        lastName: user.last_name_c || "",
        email: user.email_c || "",
        phone: user.phone_c || "",
        addresses: user.addresses_c ? JSON.parse(user.addresses_c) : [],
        createdAt: user.created_at_c || new Date().toISOString()
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const checkParams = {
        fields: [
          { field: { Name: "email_c" } }
        ],
        where: [
          {
            FieldName: "email_c",
            Operator: "EqualTo",
            Values: [userData.email]
          }
        ]
      };

      const checkResponse = await apperClient.fetchRecords("user_profile_c", checkParams);

      if (checkResponse.success && checkResponse.data && checkResponse.data.length > 0) {
        throw new Error("Email already registered");
      }

      const createParams = {
        records: [
          {
            email_c: userData.email,
            first_name_c: userData.firstName,
            last_name_c: userData.lastName,
            phone_c: "",
            addresses_c: "[]",
            created_at_c: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord("user_profile_c", createParams);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create user:`, failed);
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
          const newUser = successful[0].data;
          return {
            Id: newUser.Id,
            firstName: newUser.first_name_c || "",
            lastName: newUser.last_name_c || "",
            email: newUser.email_c || "",
            phone: newUser.phone_c || "",
            addresses: [],
            createdAt: newUser.created_at_c || new Date().toISOString()
          };
        }
      }

      throw new Error("Failed to create user");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: async () => {
    // Authentication handled by Apper SDK
    return Promise.resolve();
  },

  getCurrentUser: () => {
    // Authentication state managed by Apper SDK
    return null;
  },

  isAuthenticated: () => {
    // Authentication state managed by Apper SDK
    return false;
  }
};

export default authService;