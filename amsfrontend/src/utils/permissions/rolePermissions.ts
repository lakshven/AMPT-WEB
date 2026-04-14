export const ROLE_PERMISSIONS = {
  app_admin: {
    can_edit: true,
    can_delete: true,
    can_restore: true,
    can_add: true,
  },

  company_admin: {
    can_edit: true,
    can_delete: true,
    can_restore: true,
    can_add: true,
  },

  admin: {
    can_edit: true,
    can_delete: true,
    can_restore: true,
    can_add: true,
  },

  asset_manager: {
    can_edit: true,
    can_delete: false,
    can_restore: true,
    can_add: true,
  },

  editor: {
    can_edit: true,
    can_delete: false,
    can_restore: false,
    can_add: true,
  },

  viewer: {
    can_edit: false,
    can_delete: false,
    can_restore: false,
    can_add: false,
  },

  single_user: {
    can_edit: true,     // they can edit their own assets
    can_delete: false,  // optional: you can change this later
    can_restore: false,
    can_add: true,      // single users can add their own assets
  },
};