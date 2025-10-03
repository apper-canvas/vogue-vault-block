const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const convertUserFromDb = (dbUser) => {
  return {
    Id: dbUser.Id,
    firstName: dbUser.first_name_c || "",
    lastName: dbUser.last_name_c || "",
    email: dbUser.email_c || "",
    phone: dbUser.phone_c || "",
    addresses: dbUser.addresses_c ? JSON.parse(dbUser.addresses_c) : [],
    createdAt: dbUser.created_at_c || new Date().toISOString()
  };
};

const userService = {
  getProfile: async () => {
    try {
      const params = {
        fields: [
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "addresses_c" } },
          { field: { Name: "created_at_c" } }
        ],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const response = await apperClient.fetchRecords("user_profile_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("User profile not found");
      }

      return convertUserFromDb(response.data[0]);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const currentProfile = await userService.getProfile();

      const updateData = {
        first_name_c: profileData.firstName,
        last_name_c: profileData.lastName,
        phone_c: profileData.phone || "",
        addresses_c: profileData.addresses ? JSON.stringify(profileData.addresses) : currentProfile.addresses ? JSON.stringify(currentProfile.addresses) : "[]"
      };

      const params = {
        records: [
          {
            Id: currentProfile.Id,
            ...updateData
          }
        ]
      };

      const response = await apperClient.updateRecord("user_profile_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update profile:`, failed);
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
          return convertUserFromDb(successful[0].data);
        }
      }

      throw new Error("Failed to update profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  getAddresses: async () => {
    try {
      const profile = await userService.getProfile();
      return profile.addresses || [];
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },

  addAddress: async (address) => {
    try {
      const profile = await userService.getProfile();
      const addresses = profile.addresses || [];

      const newAddress = {
        Id: Date.now(),
        ...address,
        isDefault: addresses.length === 0
      };

      addresses.push(newAddress);

      const params = {
        records: [
          {
            Id: profile.Id,
            addresses_c: JSON.stringify(addresses)
          }
        ]
      };

      const response = await apperClient.updateRecord("user_profile_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to add address:`, failed);
          throw new Error("Failed to add address");
        }
      }

      return newAddress;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  }
};

export default userService;